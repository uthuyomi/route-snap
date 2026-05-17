import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { getPlanLimit, MeterKey, PlanId } from "../plans";
import { createSupabaseAdminClient, createSupabaseServerClient, isSupabaseAdminConfigured } from "./supabase";

const ANON_COOKIE = "route_snap_anon_id";
const ACTIVE_STATUSES = ["active", "trialing"];

type UsageSubject = {
  type: "user" | "anonymous";
  id: string;
  userId: string | null;
  email: string | null;
};

type UsageRecord = {
  image_ocr_used: number;
  file_stops_used: number;
  route_runs_used: number;
};

type QuotaCheck = {
  allowed: boolean;
  status: number;
  detail: string;
  subject?: UsageSubject;
  planId?: PlanId;
  periodKey?: string;
  unlimited?: boolean;
};

function periodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function usageColumn(meter: MeterKey) {
  if (meter === "imageOcr") return "image_ocr_used";
  if (meter === "fileStops") return "file_stops_used";
  return "route_runs_used";
}

function isUnlimitedEmail(email: string | null | undefined) {
  if (!email) return false;

  const allowedEmails = (process.env.ROUTE_SNAP_UNLIMITED_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.trim().toLowerCase());
}

async function getTokenUser(request?: { headers: Headers }) {
  const authorization = request?.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  if (!token) return null;

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data } = await admin.auth.getUser(token);
  return data.user ?? null;
}

async function getUsageSubject(request?: { headers: Headers }): Promise<UsageSubject> {
  const tokenUser = await getTokenUser(request);
  if (tokenUser) {
    return {
      type: "user",
      id: tokenUser.id,
      userId: tokenUser.id,
      email: tokenUser.email ?? null
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (data.user) {
    return {
      type: "user",
      id: data.user.id,
      userId: data.user.id,
      email: data.user.email ?? null
    };
  }

  const cookieStore = await cookies();
  const existingId = cookieStore.get(ANON_COOKIE)?.value;
  const anonymousId = existingId || randomUUID();

  if (!existingId) {
    cookieStore.set(ANON_COOKIE, anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 400
    });
  }

  return {
    type: "anonymous",
    id: anonymousId,
    userId: null,
    email: null
  };
}

async function getPlanId(userId: string | null): Promise<PlanId> {
  if (!userId) return "free";

  const admin = createSupabaseAdminClient();
  if (!admin) return "free";

  const { data } = await admin
    .from("route_snap_subscriptions")
    .select("plan_id,status,current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data || !ACTIVE_STATUSES.includes(data.status)) return "free";

  const currentPeriodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
  if (currentPeriodEnd && currentPeriodEnd.getTime() < Date.now()) return "free";

  if (data.plan_id === "light" || data.plan_id === "standard" || data.plan_id === "pro" || data.plan_id === "business") {
    return data.plan_id;
  }

  return "free";
}

async function getUsage(subject: UsageSubject, activePeriodKey: string): Promise<UsageRecord> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { image_ocr_used: 0, file_stops_used: 0, route_runs_used: 0 };
  }

  const { data } = await admin
    .from("route_snap_usage")
    .select("image_ocr_used,file_stops_used,route_runs_used")
    .eq("subject_type", subject.type)
    .eq("subject_id", subject.id)
    .eq("period_key", activePeriodKey)
    .maybeSingle();

  return {
    image_ocr_used: data?.image_ocr_used ?? 0,
    file_stops_used: data?.file_stops_used ?? 0,
    route_runs_used: data?.route_runs_used ?? 0
  };
}

export async function requireLogin() {
  const subject = await getUsageSubject();
  return subject.userId;
}

export async function getCurrentUser(request?: { headers: Headers }) {
  const tokenUser = await getTokenUser(request);
  if (tokenUser) return tokenUser;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function checkQuota(meter: MeterKey, amount = 1, request?: { headers: Headers }): Promise<QuotaCheck> {
  if (!isSupabaseAdminConfigured() && process.env.NODE_ENV === "production") {
    return {
      allowed: false,
      status: 503,
      detail: "Usage database is not configured"
    };
  }

  const subject = await getUsageSubject(request);
  const activePeriodKey = periodKey();

  if (isUnlimitedEmail(subject.email)) {
    return {
      allowed: true,
      status: 200,
      detail: "ok",
      subject,
      planId: "business",
      periodKey: activePeriodKey,
      unlimited: true
    };
  }

  const planId = await getPlanId(subject.userId);
  const usage = await getUsage(subject, activePeriodKey);
  const column = usageColumn(meter);
  const limit = getPlanLimit(planId, meter);
  const used = usage[column];

  if (used + amount > limit) {
    return {
      allowed: false,
      status: subject.userId ? 402 : 401,
      detail: subject.userId ? "Plan limit reached. Upgrade your plan to continue." : "Free limit reached. Log in to choose a paid plan.",
      subject,
      planId,
      periodKey: activePeriodKey
    };
  }

  return {
    allowed: true,
    status: 200,
    detail: "ok",
    subject,
    planId,
    periodKey: activePeriodKey
  };
}

export async function recordUsage(subject: UsageSubject, meter: MeterKey, amount = 1, activePeriodKey = periodKey()) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const column = usageColumn(meter);

  const { data } = await admin
    .from("route_snap_usage")
    .select("image_ocr_used,file_stops_used,route_runs_used")
    .eq("subject_type", subject.type)
    .eq("subject_id", subject.id)
    .eq("period_key", activePeriodKey)
    .maybeSingle();

  const nextUsage: UsageRecord = {
    image_ocr_used: data?.image_ocr_used ?? 0,
    file_stops_used: data?.file_stops_used ?? 0,
    route_runs_used: data?.route_runs_used ?? 0
  };
  nextUsage[column] += amount;

  await admin.from("route_snap_usage").upsert(
    {
      subject_type: subject.type,
      subject_id: subject.id,
      user_id: subject.userId,
      period_key: activePeriodKey,
      ...nextUsage,
      updated_at: new Date().toISOString()
    },
    { onConflict: "subject_type,subject_id,period_key" }
  );
}

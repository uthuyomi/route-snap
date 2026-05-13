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
};

function periodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function usageColumn(meter: MeterKey) {
  if (meter === "imageOcr") return "image_ocr_used";
  if (meter === "fileStops") return "file_stops_used";
  return "route_runs_used";
}

async function getUsageSubject(): Promise<UsageSubject> {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (data.user) {
    return {
      type: "user",
      id: data.user.id,
      userId: data.user.id
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
    userId: null
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

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function checkQuota(meter: MeterKey, amount = 1): Promise<QuotaCheck> {
  if (!isSupabaseAdminConfigured() && process.env.NODE_ENV === "production") {
    return {
      allowed: false,
      status: 503,
      detail: "Usage database is not configured"
    };
  }

  const subject = await getUsageSubject();
  const planId = await getPlanId(subject.userId);
  const activePeriodKey = periodKey();
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

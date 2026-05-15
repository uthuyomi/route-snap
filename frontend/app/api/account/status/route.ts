import { NextRequest, NextResponse } from "next/server";
import { isPlanId, PLANS, type PlanId } from "../../../lib/plans";
import { createSupabaseAdminClient, createSupabaseServerClient } from "../../../lib/server/supabase";

export const dynamic = "force-dynamic";

const activeStatuses = ["active", "trialing"];

const planNames: Record<PlanId, { ja: string; en: string }> = {
  free: { ja: "無料", en: "Free" },
  light: { ja: "ライト", en: "Light" },
  standard: { ja: "スタンダード", en: "Standard" },
  pro: { ja: "プロ", en: "Pro" },
  business: { ja: "ビジネス", en: "Business" },
};

function currentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getActivePlanId(planId: unknown, status: unknown, currentPeriodEnd?: string | null): PlanId {
  if (!activeStatuses.includes(String(status))) return "free";

  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
  if (periodEnd && periodEnd.getTime() < Date.now()) return "free";

  if (typeof planId === "string" && isPlanId(planId)) {
    return planId;
  }

  return "free";
}

function formatDateJa(value?: string | null) {
  if (!value) return "今月";
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

function formatDateEn(value?: string | null) {
  if (!value) return "this month";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

async function getUserFromRequest(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";

  if (token && admin) {
    const { data } = await admin.auth.getUser(token);
    if (data.user) return data.user;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  return data.user;
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const [{ data: subscription }, { data: usage }] = admin
    ? await Promise.all([
        admin.from("route_snap_subscriptions").select("plan_id,status,current_period_end").eq("user_id", user.id).maybeSingle(),
        admin
          .from("route_snap_usage")
          .select("image_ocr_used,file_stops_used,route_runs_used")
          .eq("subject_type", "user")
          .eq("subject_id", user.id)
          .eq("period_key", currentPeriodKey())
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  const activePlanId = getActivePlanId(subscription?.plan_id, subscription?.status, subscription?.current_period_end);
  const plan = PLANS[activePlanId] ?? PLANS.free;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return NextResponse.json({
    email: user.email ?? null,
    planNameJa: planNames[plan.id].ja,
    planNameEn: planNames[plan.id].en,
    planPrice: plan.price,
    periodLabelJa: formatDateJa(subscription?.current_period_end),
    periodLabelEn: formatDateEn(subscription?.current_period_end),
    today: now.getDate(),
    daysInMonth,
    meters: [
      {
        key: "imageOcr",
        labelJa: "住所読み取り",
        labelEn: "Address reading",
        descriptionJa: "伝票・メモ・画像から住所を読み取る処理です。単発版と複数版の画像読み取りで消費します。",
        descriptionEn: "Reads addresses from slips, notes, or images. Used by image reading in the single and batch tools.",
        used: usage?.image_ocr_used ?? 0,
        limit: plan.imageOcr,
      },
      {
        key: "fileStops",
        labelJa: "訪問先一括登録",
        labelEn: "Bulk visit registration",
        descriptionJa: "CSV/TXTなどのファイルや一括入力から、複数の訪問先をまとめて登録する件数です。",
        descriptionEn: "Counts stops added in bulk from CSV/TXT files or batch input.",
        used: usage?.file_stops_used ?? 0,
        limit: plan.fileStops,
      },
      {
        key: "routeRuns",
        labelJa: "ルート整理",
        labelEn: "Route sorting",
        descriptionJa: "複数の訪問先を回りやすい順番に並べ替える処理です。AI最適化やルート整理で消費します。",
        descriptionEn: "Sorts multiple stops into an easier visit order. Used by AI optimization and route sorting.",
        used: usage?.route_runs_used ?? 0,
        limit: plan.routeRuns,
      },
    ],
  });
}

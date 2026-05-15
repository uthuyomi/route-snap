import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { isPlanId, PLANS, type PlanId } from "../../lib/plans";
import { createSupabaseAdminClient } from "../../lib/server/supabase";
import { getCurrentUser } from "../../lib/server/usage";
import { StatusDashboard } from "./StatusDashboard";

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

export default async function AccountStatusPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/status");
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
          .maybeSingle()
      ])
    : [{ data: null }, { data: null }];

  const activePlanId = getActivePlanId(subscription?.plan_id, subscription?.status, subscription?.current_period_end);
  const plan = PLANS[activePlanId] ?? PLANS.free;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap max-w-7xl">
        <StatusDashboard
          email={user.email ?? null}
          planNameJa={planNames[plan.id].ja}
          planNameEn={planNames[plan.id].en}
          planPrice={plan.price}
          periodLabelJa={formatDateJa(subscription?.current_period_end)}
          periodLabelEn={formatDateEn(subscription?.current_period_end)}
          today={now.getDate()}
          daysInMonth={daysInMonth}
          meters={[
            { key: "imageOcr", labelJa: "住所読み取り", labelEn: "Address reads", used: usage?.image_ocr_used ?? 0, limit: plan.imageOcr },
            { key: "fileStops", labelJa: "訪問先インポート", labelEn: "Imported stops", used: usage?.file_stops_used ?? 0, limit: plan.fileStops },
            { key: "routeRuns", labelJa: "ルート整理", labelEn: "Route optimizations", used: usage?.route_runs_used ?? 0, limit: plan.routeRuns },
          ]}
        />
      </div>
      <SiteFooter />
    </main>
  );
}

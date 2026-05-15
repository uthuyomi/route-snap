import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { isPlanId, PLANS, type PlanId } from "../lib/plans";
import { createSupabaseAdminClient } from "../lib/server/supabase";
import { getCurrentUser } from "../lib/server/usage";
import { AccountActions } from "./AccountActions";

export const dynamic = "force-dynamic";

const activeStatuses = ["active", "trialing"];

const planNames: Record<PlanId, string> = {
  free: "無料",
  light: "ライト",
  standard: "スタンダード",
  pro: "プロ",
  business: "ビジネス",
};

function currentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
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

function formatPeriodEnd(currentPeriodEnd?: string | null) {
  if (!currentPeriodEnd) return "今月";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(currentPeriodEnd));
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
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
  const meters = [
    { label: "住所読み取り", used: usage?.image_ocr_used ?? 0, limit: plan.imageOcr },
    { label: "訪問先インポート", used: usage?.file_stops_used ?? 0, limit: plan.fileStops },
    { label: "ルート整理", used: usage?.route_runs_used ?? 0, limit: plan.routeRuns },
  ].map((meter) => ({
    ...meter,
    remaining: Math.max(0, meter.limit - meter.used),
    percent: meter.limit ? Math.min(100, (meter.used / meter.limit) * 100) : 0,
  }));

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap max-w-5xl">
        <section className="site-section grid gap-6">
          <div>
            <h1 className="m-0 text-4xl font-black text-[#061a3a]">アカウント</h1>
            <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-500">{user.email}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-2xl bg-blue-700 p-5 text-white">
              <p className="m-0 text-sm font-bold text-blue-100">現在のプラン</p>
              <p className="m-0 mt-2 text-3xl font-black">{planNames[plan.id]}</p>
              <p className="m-0 mt-2 text-sm font-bold text-blue-100">月額 {formatNumber(plan.price)} 円</p>
              <p className="m-0 mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-blue-50">
                利用枠: {formatPeriodEnd(subscription?.current_period_end)} まで
              </p>
            </div>

            <div className="grid gap-3">
              {meters.map((meter) => (
                <div key={meter.label} className="rounded-2xl border border-blue-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 text-sm font-black">
                    <span>{meter.label}</span>
                    <span>残り {formatNumber(meter.remaining)} 回</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
                    <span>使用済み {formatNumber(meter.used)} 回</span>
                    <span>上限 {formatNumber(meter.limit)} 回/月</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-50">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${meter.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AccountActions manageLabel="支払いを管理" logoutLabel="ログアウト" />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

import { redirect } from "next/navigation";
import { AppHeader } from "../components/AppHeader";
import { PLANS, PlanId } from "../lib/plans";
import { createSupabaseAdminClient } from "../lib/server/supabase";
import { getCurrentUser } from "../lib/server/usage";
import { AccountActions } from "./AccountActions";

export const dynamic = "force-dynamic";

const planNames: Record<PlanId, string> = {
  free: "無料",
  light: "ライト",
  standard: "標準",
  pro: "プロ",
  business: "業務"
};

function currentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
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

  const activePlanId = (subscription?.plan_id as PlanId | undefined) && subscription?.status === "active" ? (subscription.plan_id as PlanId) : "free";
  const plan = PLANS[activePlanId] ?? PLANS.free;
  const meters = [
    { label: "住所読み取り", used: usage?.image_ocr_used ?? 0, limit: plan.imageOcr },
    { label: "訪問先インポート", used: usage?.file_stops_used ?? 0, limit: plan.fileStops },
    { label: "ルート整理", used: usage?.route_runs_used ?? 0, limit: plan.routeRuns }
  ];

  return (
    <main className="min-h-svh app-surface px-4 py-4 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        <AppHeader locale="ja" currentPage="pricing" />
        <section className="grid gap-5 rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-neutral-200 md:p-7">
          <div>
            <h1 className="m-0 text-3xl font-black text-neutral-950">アカウント</h1>
            <p className="m-0 mt-2 text-sm font-semibold text-neutral-500">{user.email}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-lg bg-emerald-950 p-4 text-white">
              <p className="m-0 text-sm font-bold text-emerald-100">現在のプラン</p>
              <p className="m-0 mt-2 text-3xl font-black">{planNames[plan.id]}</p>
              <p className="m-0 mt-2 text-sm font-semibold text-emerald-100">月額 {formatNumber(plan.price)} 円</p>
            </div>
            <div className="grid gap-2">
              {meters.map((meter) => (
                <div key={meter.label} className="rounded-lg border border-neutral-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3 text-sm font-black">
                    <span>{meter.label}</span>
                    <span>{formatNumber(meter.used)} / {formatNumber(meter.limit)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-emerald-800" style={{ width: `${meter.limit ? Math.min(100, (meter.used / meter.limit) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AccountActions manageLabel="支払いを管理" logoutLabel="ログアウト" />
        </section>
      </div>
    </main>
  );
}

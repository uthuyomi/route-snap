import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { isPlanId, PLANS, type PlanId } from "../lib/plans";
import { createSupabaseAdminClient } from "../lib/server/supabase";
import { getCurrentUser } from "../lib/server/usage";
import { AccountActions } from "./AccountActions";

export const dynamic = "force-dynamic";

const activeStatuses = ["active", "trialing"];

const accountCopy = {
  ja: {
    title: "アカウント",
    currentPlan: "現在のプラン",
    monthly: "月額",
    yen: "円",
    period: "利用枠",
    until: "まで",
    thisMonth: "今月",
    remaining: "残り",
    used: "使用済み",
    limit: "上限",
    times: "回",
    perMonth: "月",
    manage: "支払いを管理",
    logout: "ログアウト",
    meters: ["住所読み取り", "訪問先インポート", "ルート整理"],
    planNames: { free: "無料", light: "ライト", standard: "スタンダード", pro: "プロ", business: "ビジネス" } satisfies Record<PlanId, string>,
  },
  en: {
    title: "Account",
    currentPlan: "Current plan",
    monthly: "Monthly",
    yen: "JPY",
    period: "Usage period",
    until: "until",
    thisMonth: "this month",
    remaining: "Remaining",
    used: "Used",
    limit: "Limit",
    times: "uses",
    perMonth: "month",
    manage: "Manage billing",
    logout: "Log out",
    meters: ["Address reading", "Destination import", "Route sorting"],
    planNames: { free: "Free", light: "Light", standard: "Standard", pro: "Pro", business: "Business" } satisfies Record<PlanId, string>,
  },
} as const;

function currentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function detectRequestLocale(acceptLanguage: string | null) {
  return acceptLanguage?.toLowerCase().split(",").some((language) => language.trim().startsWith("ja")) ? "ja" : "en";
}

function formatNumber(value: number, locale: keyof typeof accountCopy) {
  return new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US").format(value);
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

function formatPeriodEnd(currentPeriodEnd: string | null | undefined, locale: keyof typeof accountCopy, thisMonth: string) {
  if (!currentPeriodEnd) return thisMonth;
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(currentPeriodEnd));
}

export default async function AccountPage() {
  const headersList = await headers();
  const locale = detectRequestLocale(headersList.get("accept-language"));
  const t = accountCopy[locale];
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
    { label: t.meters[0], used: usage?.image_ocr_used ?? 0, limit: plan.imageOcr },
    { label: t.meters[1], used: usage?.file_stops_used ?? 0, limit: plan.fileStops },
    { label: t.meters[2], used: usage?.route_runs_used ?? 0, limit: plan.routeRuns },
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
            <h1 className="m-0 text-4xl font-black text-[#061a3a]">{t.title}</h1>
            <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-500">{user.email}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-2xl bg-blue-700 p-5 text-white">
              <p className="m-0 text-sm font-bold text-blue-100">{t.currentPlan}</p>
              <p className="m-0 mt-2 text-3xl font-black">{t.planNames[plan.id]}</p>
              <p className="m-0 mt-2 text-sm font-bold text-blue-100">{t.monthly} {formatNumber(plan.price, locale)} {t.yen}</p>
              <p className="m-0 mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-blue-50">
                {t.period}: {formatPeriodEnd(subscription?.current_period_end, locale, t.thisMonth)} {t.until}
              </p>
            </div>

            <div className="grid gap-3">
              {meters.map((meter) => (
                <div key={meter.label} className="rounded-2xl border border-blue-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 text-sm font-black">
                    <span>{meter.label}</span>
                    <span>{t.remaining} {formatNumber(meter.remaining, locale)} {t.times}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
                    <span>{t.used} {formatNumber(meter.used, locale)} {t.times}</span>
                    <span>{t.limit} {formatNumber(meter.limit, locale)} {t.times}/{t.perMonth}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-50">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${meter.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AccountActions manageLabel={t.manage} logoutLabel={t.logout} />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

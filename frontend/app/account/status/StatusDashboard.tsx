"use client";

import { CreditCard, Languages } from "lucide-react";
import Link from "next/link";
import { usePreferredLocale } from "../../lib/locale";
import type { AppLocale } from "../../components/AppHeader";

type Meter = {
  key: string;
  labelJa: string;
  labelEn: string;
  used: number;
  limit: number;
};

type StatusDashboardProps = {
  email: string | null;
  planNameJa: string;
  planNameEn: string;
  planPrice: number;
  periodLabelJa: string;
  periodLabelEn: string;
  meters: Meter[];
  today: number;
  daysInMonth: number;
};

const messages = {
  ja: {
    title: "アカウントステータス",
    plan: "現在のプラン",
    monthlyPrice: "月額",
    period: "利用枠",
    remaining: "残り",
    used: "使用済み",
    limit: "上限",
    times: "回",
    pace: "今月の使用ペース",
    actual: "現在まで",
    projected: "月末予測",
    cap: "上限",
    language: "言語設定",
    ja: "日本語",
    en: "English",
    billing: "支払いを管理",
    note: "日別履歴は保存していないため、現在の月間使用量から月末までのペースを推定しています。",
  },
  en: {
    title: "Account Status",
    plan: "Current plan",
    monthlyPrice: "Monthly",
    period: "Allowance",
    remaining: "Remaining",
    used: "Used",
    limit: "Limit",
    times: "",
    pace: "This month's usage pace",
    actual: "Actual so far",
    projected: "Projected",
    cap: "Limit",
    language: "Language",
    ja: "Japanese",
    en: "English",
    billing: "Manage billing",
    note: "Daily history is not stored yet, so the month-end pace is estimated from current monthly usage.",
  },
} satisfies Record<AppLocale, Record<string, string>>;

function formatNumber(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US").format(value);
}

function unit(value: number, locale: AppLocale) {
  return locale === "ja" ? `${formatNumber(value, locale)} 回` : formatNumber(value, locale);
}

function pointsToString(points: Array<[number, number]>) {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function UsageChart({ meter, locale, today, daysInMonth }: { meter: Meter; locale: AppLocale; today: number; daysInMonth: number }) {
  const projected = today > 0 ? Math.round((meter.used / today) * daysInMonth) : meter.used;
  const yMax = Math.max(meter.limit, projected, meter.used, 1);
  const width = 560;
  const height = 220;
  const padX = 38;
  const padY = 24;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;
  const xForDay = (day: number) => padX + ((Math.max(1, day) - 1) / Math.max(1, daysInMonth - 1)) * plotWidth;
  const yForValue = (value: number) => padY + (1 - Math.min(yMax, Math.max(0, value)) / yMax) * plotHeight;
  const actualPoints: Array<[number, number]> = [
    [xForDay(1), yForValue(0)],
    [xForDay(today), yForValue(meter.used)],
  ];
  const projectedPoints: Array<[number, number]> = [
    [xForDay(today), yForValue(meter.used)],
    [xForDay(daysInMonth), yForValue(projected)],
  ];
  const limitY = yForValue(meter.limit);

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-black text-[#061a3a]">{locale === "ja" ? meter.labelJa : meter.labelEn}</h3>
          <p className="m-0 mt-1 text-xs font-bold text-slate-500">
            {messages[locale].projected}: {unit(projected, locale)}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-right text-xs font-black text-blue-700">
          {messages[locale].remaining} {unit(Math.max(0, meter.limit - meter.used), locale)}
        </div>
      </div>
      <svg className="mt-4 h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${locale === "ja" ? meter.labelJa : meter.labelEn} ${messages[locale].pace}`}>
        <rect x="0" y="0" width={width} height={height} rx="18" fill="#f7fbff" />
        <line x1={padX} y1={limitY} x2={width - padX} y2={limitY} stroke="#93c5fd" strokeDasharray="6 6" strokeWidth="2" />
        <polyline points={pointsToString(actualPoints)} fill="none" stroke="#2563eb" strokeLinecap="round" strokeWidth="5" />
        <polyline points={pointsToString(projectedPoints)} fill="none" stroke="#38bdf8" strokeDasharray="8 7" strokeLinecap="round" strokeWidth="4" />
        <circle cx={xForDay(today)} cy={yForValue(meter.used)} r="6" fill="#2563eb" />
        <text x={padX} y={height - 8} fill="#64748b" fontSize="12" fontWeight="700">1</text>
        <text x={width - padX - 28} y={height - 8} fill="#64748b" fontSize="12" fontWeight="700">{daysInMonth}</text>
        <text x={padX} y={limitY - 8} fill="#2563eb" fontSize="12" fontWeight="800">{messages[locale].cap}</text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-2"><span className="h-1.5 w-5 rounded bg-blue-600" />{messages[locale].actual}</span>
        <span className="inline-flex items-center gap-2"><span className="h-1.5 w-5 rounded bg-sky-400" />{messages[locale].projected}</span>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed border-blue-300" />{messages[locale].cap}</span>
      </div>
    </div>
  );
}

export function StatusDashboard(props: StatusDashboardProps) {
  const [locale, setLocale] = usePreferredLocale();
  const t = messages[locale];
  const planName = locale === "ja" ? props.planNameJa : props.planNameEn;
  const periodLabel = locale === "ja" ? props.periodLabelJa : props.periodLabelEn;

  return (
    <section className="site-section grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-4xl font-black text-[#061a3a]">{t.title}</h1>
          <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-500">{props.email}</p>
        </div>
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-xs font-black text-slate-500">
            <Languages size={15} aria-hidden="true" />
            {t.language}
          </p>
          <div className="flex rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
            <button className={`min-h-9 rounded-lg px-3 text-sm font-black ${locale === "ja" ? "bg-blue-600 text-white" : "text-[#061a3a]"}`} type="button" onClick={() => setLocale("ja")}>{t.ja}</button>
            <button className={`min-h-9 rounded-lg px-3 text-sm font-black ${locale === "en" ? "bg-blue-600 text-white" : "text-[#061a3a]"}`} type="button" onClick={() => setLocale("en")}>{t.en}</button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-2xl bg-blue-700 p-5 text-white">
          <p className="m-0 text-sm font-bold text-blue-100">{t.plan}</p>
          <p className="m-0 mt-2 text-3xl font-black">{planName}</p>
          <p className="m-0 mt-2 text-sm font-bold text-blue-100">{t.monthlyPrice} {formatNumber(props.planPrice, locale)} JPY</p>
          <p className="m-0 mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-blue-50">{t.period}: {periodLabel}</p>
          <Link className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-blue-700 transition hover:bg-blue-50" href="/account">
            <CreditCard size={17} aria-hidden="true" />
            {t.billing}
          </Link>
        </div>
        <div className="grid gap-3">
          {props.meters.map((meter) => {
            const remaining = Math.max(0, meter.limit - meter.used);
            const percent = meter.limit ? Math.min(100, (meter.used / meter.limit) * 100) : 0;
            return (
              <div key={meter.key} className="rounded-2xl border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-black">
                  <span>{locale === "ja" ? meter.labelJa : meter.labelEn}</span>
                  <span>{t.remaining} {unit(remaining, locale)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
                  <span>{t.used} {unit(meter.used, locale)}</span>
                  <span>{t.limit} {unit(meter.limit, locale)}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-50">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <h2 className="m-0 text-2xl font-black text-[#061a3a]">{t.pace}</h2>
          <p className="m-0 mt-2 text-sm font-bold leading-7 text-slate-500">{t.note}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {props.meters.map((meter) => (
            <UsageChart key={meter.key} meter={meter} locale={locale} today={props.today} daysInMonth={props.daysInMonth} />
          ))}
        </div>
      </div>
    </section>
  );
}

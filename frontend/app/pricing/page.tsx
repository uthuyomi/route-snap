"use client";

import { ArrowRight, BriefcaseBusiness, Check, CreditCard, FileText, Image as ImageIcon, Route, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { LegalFooter } from "../components/LegalFooter";
import { usePreferredLocale } from "../lib/locale";
import { PlanId } from "../lib/plans";

const messages = {
  ja: {
    eyebrow: "料金プラン",
    title: "写真もファイルも、使い方に合わせて選べる料金。",
    lead: "画像OCRは枚数で管理し、TXT / CSV / JSONなどのファイル取り込みは住所登録数でたっぷり使える設計です。",
    monthly: "月額",
    tax: "税込想定",
    imageOcr: "画像OCR",
    fileStops: "ファイル住所登録",
    routeRuns: "ルート最適化",
    overage: "超過",
    choose: "このプランで始める",
    popular: "おすすめ",
    free: "無料",
    light: "ライト",
    standard: "標準",
    pro: "プロ",
    business: "業務",
    freeFit: "まず試したい方向け",
    lightFit: "たまに配達・訪問がある方向け",
    standardFit: "個人事業・小規模運用向け",
    proFit: "毎日使う現場向け",
    businessFit: "店舗・チーム運用向け",
    none: "なし",
    yen: "円",
    month: "月",
    imagesUnit: "枚/月",
    stopsUnit: "件/月",
    routesUnit: "回/月",
    noOverage: "超過利用なし",
    ocrOverage: "画像OCR 10〜15円/枚",
    stopsOverage: "住所登録 1,000件ごとに100〜300円",
    routesOverage: "ルート最適化 100回ごとに100〜300円",
    modelNoteTitle: "運営原価を見た設計",
    modelNote: "通常処理はgpt-5.4を想定。画像OCRとルート最適化を分けて上限管理するので、大量利用でも赤字になりにくい構成です。",
    includedTitle: "含まれるもの",
    included1: "単発版の画像読み取り",
    included2: "複数版の画像・カメラ取り込み",
    included3: "TXT / CSV / TSV / JSONファイル取り込み",
    included4: "住所ごとのメモ・時間指定",
    included5: "現在地からのルート最適化",
    ctaTitle: "まずは無料で読み取り精度を確認",
    ctaText: "写真のクセや住所表記は現場ごとに違います。無料枠で試してから、使う枚数に合わせて調整できます。",
    ctaPrimary: "単発版を試す",
    ctaSecondary: "複数版を開く",
    compareTitle: "課金単位",
    compareImage: "写真・スクショ・カメラ撮影は画像OCR枠を消費します。",
    compareFile: "ファイル取り込みは画像OCR枠を消費せず、抽出された住所数をカウントします。",
    compareRoute: "ルート最適化は住所の並び替えをAIで行う回数です。"
  },
  en: {
    eyebrow: "Pricing",
    title: "Plans for photos, files, and route work.",
    lead: "Image OCR is counted by image. TXT, CSV, TSV, and JSON imports are counted by extracted address so file-heavy work stays affordable.",
    monthly: "Monthly",
    tax: "estimated tax included",
    imageOcr: "Image OCR",
    fileStops: "File addresses",
    routeRuns: "Route optimizations",
    overage: "Overage",
    choose: "Start with this plan",
    popular: "Recommended",
    free: "Free",
    light: "Light",
    standard: "Standard",
    pro: "Pro",
    business: "Business",
    freeFit: "For trying the workflow",
    lightFit: "For occasional field work",
    standardFit: "For solo operators",
    proFit: "For daily route work",
    businessFit: "For shops and small teams",
    none: "None",
    yen: "JPY",
    month: "mo",
    imagesUnit: "images/mo",
    stopsUnit: "addresses/mo",
    routesUnit: "runs/mo",
    noOverage: "No overage",
    ocrOverage: "Image OCR 10-15 JPY/image",
    stopsOverage: "Address registration 100-300 JPY per 1,000",
    routesOverage: "Route optimization 100-300 JPY per 100",
    modelNoteTitle: "Designed around operating cost",
    modelNote: "Assumes gpt-5.4 for normal processing. OCR, file imports, and route optimization are metered separately to keep heavy usage sustainable.",
    includedTitle: "Included",
    included1: "Single image address reading",
    included2: "Batch image and camera import",
    included3: "TXT / CSV / TSV / JSON import",
    included4: "Per-stop notes and time windows",
    included5: "Route optimization from current location",
    ctaTitle: "Check recognition quality first",
    ctaText: "Photos and address formats vary by field workflow. Start with the free allowance, then choose the plan that matches your volume.",
    ctaPrimary: "Try Single",
    ctaSecondary: "Open Batch",
    compareTitle: "What gets counted",
    compareImage: "Photos, screenshots, and camera captures consume Image OCR allowance.",
    compareFile: "File imports do not consume Image OCR allowance; extracted addresses are counted.",
    compareRoute: "Route optimization counts each AI-powered reorder request."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function formatNumber(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US").format(value);
}

export default function PricingPage() {
  const [locale, setLocale] = usePreferredLocale();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const t = messages[locale];

  const plans = [
    { id: "free" as const, name: t.free, price: 0, imageOcr: 5, fileStops: 30, routeRuns: 3, fit: t.freeFit, highlighted: false },
    { id: "light" as const, name: t.light, price: 680, imageOcr: 30, fileStops: 300, routeRuns: 30, fit: t.lightFit, highlighted: false },
    { id: "standard" as const, name: t.standard, price: 1480, imageOcr: 120, fileStops: 1500, routeRuns: 150, fit: t.standardFit, highlighted: true },
    { id: "pro" as const, name: t.pro, price: 2980, imageOcr: 400, fileStops: 5000, routeRuns: 500, fit: t.proFit, highlighted: false },
    { id: "business" as const, name: t.business, price: 9800, imageOcr: 1500, fileStops: 20000, routeRuns: 2000, fit: t.businessFit, highlighted: false }
  ];

  const included = [t.included1, t.included2, t.included3, t.included4, t.included5];
  const countRules = [
    { icon: ImageIcon, title: t.imageOcr, text: t.compareImage },
    { icon: FileText, title: t.fileStops, text: t.compareFile },
    { icon: Route, title: t.routeRuns, text: t.compareRoute }
  ];

  async function choosePlan(planId: PlanId) {
    if (planId === "free") {
      window.location.assign("/single");
      return;
    }

    setLoadingPlan(planId);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ planId })
    });
    const payload = (await response.json()) as { url?: string; detail?: string };
    setLoadingPlan(null);

    if (response.status === 401) {
      window.location.assign(`/login?next=/pricing&plan=${planId}`);
      return;
    }
    if (response.ok && payload.url) {
      window.location.assign(payload.url);
    }
  }

  return (
    <main className="min-h-svh app-surface px-4 py-4 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        <AppHeader locale={locale} currentPage="pricing" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <section className="grid gap-5 rounded-lg bg-white/85 p-5 shadow-sm ring-1 ring-neutral-200/80 md:p-7 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="grid gap-4">
            <p className="app-eyebrow">
              <CreditCard size={14} aria-hidden="true" />
              <span className="ml-1">{t.eyebrow}</span>
            </p>
            <div className="grid gap-3">
              <h1 className="m-0 max-w-4xl text-4xl font-black leading-tight text-neutral-950 sm:text-5xl">{t.title}</h1>
              <p className="m-0 max-w-3xl text-base font-semibold leading-7 text-neutral-600 sm:text-lg">{t.lead}</p>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg bg-neutral-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-black">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{t.modelNoteTitle}</span>
            </div>
            <p className="m-0 text-sm font-semibold leading-6 text-neutral-200">{t.modelNote}</p>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "relative grid gap-4 rounded-lg border p-4 shadow-sm",
                plan.highlighted ? "border-emerald-800 bg-white ring-2 ring-emerald-800" : "border-neutral-200 bg-white/85"
              ].join(" ")}
            >
              {plan.highlighted ? (
                <div className="absolute right-3 top-3 inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-900 px-2 text-[11px] font-black text-white">
                  <Sparkles size={13} aria-hidden="true" />
                  {t.popular}
                </div>
              ) : null}

              <div className="grid gap-2 pr-20 lg:pr-0">
                <h2 className="m-0 text-xl font-black text-neutral-950">{plan.name}</h2>
                <p className="m-0 min-h-10 text-sm font-semibold leading-5 text-neutral-500">{plan.fit}</p>
              </div>

              <div className="grid gap-1">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black tracking-normal text-neutral-950">{formatNumber(plan.price, locale)}</span>
                  <span className="pb-1 text-sm font-black text-neutral-600">{t.yen}/{t.month}</span>
                </div>
                <p className="m-0 text-xs font-bold text-neutral-500">{t.tax}</p>
              </div>

              <div className="grid gap-2">
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.imageOcr}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.imageOcr, locale)} {t.imagesUnit}</p>
                </div>
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.fileStops}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.fileStops, locale)} {t.stopsUnit}</p>
                </div>
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.routeRuns}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.routeRuns, locale)} {t.routesUnit}</p>
                </div>
              </div>

              <button className={plan.highlighted ? "primary-action" : "secondary-action"} type="button" onClick={() => choosePlan(plan.id)} disabled={loadingPlan === plan.id}>
                <span>{t.choose}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4 rounded-lg bg-white/85 p-5 shadow-sm ring-1 ring-neutral-200/80">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={20} aria-hidden="true" />
              <h2 className="m-0 text-2xl font-black">{t.includedTitle}</h2>
            </div>
            <div className="grid gap-2">
              {included.map((item) => (
                <div key={item} className="grid grid-cols-[2rem_1fr] items-center gap-2 rounded-lg bg-neutral-50 p-3 text-sm font-black text-neutral-800">
                  <Check className="text-emerald-700" size={18} aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-lg bg-[#fff7d6] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={20} aria-hidden="true" />
              <h2 className="m-0 text-2xl font-black">{t.compareTitle}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {countRules.map((rule) => (
                <div key={rule.title} className="grid gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-neutral-950 text-white">
                    <rule.icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="m-0 text-base font-black text-neutral-950">{rule.title}</h3>
                    <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{rule.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 rounded-lg bg-white/80 p-3 text-sm font-bold text-neutral-700">
              <p className="m-0">{t.ocrOverage}</p>
              <p className="m-0">{t.stopsOverage}</p>
              <p className="m-0">{t.routesOverage}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-lg bg-neutral-950 p-5 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="m-0 text-2xl font-black">{t.ctaTitle}</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm font-semibold leading-6 text-neutral-300">{t.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-neutral-950 transition hover:bg-neutral-100 active:scale-[0.98]" href="/single">
              <ImageIcon size={18} aria-hidden="true" />
              <span>{t.ctaPrimary}</span>
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-4 text-sm font-black text-white transition hover:bg-white/10 active:scale-[0.98]" href="/batch">
              <Route size={18} aria-hidden="true" />
              <span>{t.ctaSecondary}</span>
            </Link>
          </div>
        </section>

        <LegalFooter locale={locale} />
      </div>
    </main>
  );
}

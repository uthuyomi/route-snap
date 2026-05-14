"use client";

import { ArrowRight, BriefcaseBusiness, Check, CreditCard, FileText, Image as ImageIcon, MapPinned, MonitorDown, Route, ShieldCheck, Smartphone, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { LegalFooter } from "../components/LegalFooter";
import { usePreferredLocale } from "../lib/locale";
import { PlanId } from "../lib/plans";

const messages = {
  ja: {
    eyebrow: "料金プラン",
    title: "必要な分だけ使える、現場向け料金プラン",
    lead: "画像読み取り・CSV取り込み・ルート整理を、利用量に合わせて使える料金プランです。小規模な訪問業務から、配送・チーム運用まで対応します。",
    monthly: "月額",
    tax: "税込想定",
    addressRead: "住所読み取り",
    visitImport: "訪問先インポート",
    routeSort: "ルート整理",
    overage: "超過",
    choose: "このプランを使う",
    chooseFree: "無料で試す",
    popular: "最も選ばれています",
    popularReason: "個人利用で人気",
    free: "無料",
    light: "ライト",
    standard: "標準",
    pro: "プロ",
    business: "業務",
    freeFit: "動作確認・試用向け",
    lightFit: "軽配送・副業向け",
    standardFit: "個人事業・訪問業務向け",
    proFit: "毎日使う現場向け",
    businessFit: "法人・チーム運用向け",
    freeUsage: "まず試したい方向け",
    lightUsage: "週1〜2回利用向け",
    standardUsage: "毎週の訪問業務向け",
    proUsage: "毎日の配送・訪問向け",
    businessUsage: "複数人・複数案件向け",
    yen: "円",
    month: "月",
    imagesUnit: "回/月",
    stopsUnit: "件/月",
    routesUnit: "回/月",
    ocrOverage: "住所読み取り 10〜15円/回",
    stopsOverage: "訪問先インポート 1,000件ごとに100〜300円",
    routesOverage: "ルート整理 100回ごとに100〜300円",
    modelNoteTitle: "通常業務を想定した設計",
    modelNote: "配送・訪問業務で使いやすいよう、住所読み取り・ルート整理・CSV取り込みを業務量ベースで管理します。",
    includedTitle: "全プラン共通",
    included1: "写真から住所を読み取り",
    included2: "複数画像の一括読み取り",
    included3: "CSV・TXTファイル対応",
    included4: "訪問メモ・時間管理",
    included5: "現在地からルート整理",
    ctaTitle: "まずは無料で読み取りを試せます",
    ctaText: "住所画像を追加するだけで、読み取り精度を確認できます。現場の伝票やメモで試してから、必要なプランを選べます。",
    ctaPrimary: "1件だけ試す",
    ctaSecondary: "複数訪問を整理する",
    compareTitle: "利用量について",
    compareImage: "写真から住所を読み取った回数です。",
    compareFile: "CSV・TXTファイルから訪問先を追加した件数です。",
    compareRoute: "訪問順をAIで整理した回数です。",
    trust1: "Google Maps連携対応",
    trust2: "スマホ・PC対応",
    trust3: "インストール不要",
    trust4: "ブラウザだけで利用可能"
  },
  en: {
    eyebrow: "Pricing",
    title: "Field pricing that scales with your workload",
    lead: "Use address reading, CSV import, and route organization based on volume. Built for small visit workflows through delivery and team operations.",
    monthly: "Monthly",
    tax: "estimated tax included",
    addressRead: "Address reading",
    visitImport: "Visit imports",
    routeSort: "Route sorting",
    overage: "Overage",
    choose: "Use this plan",
    chooseFree: "Try for free",
    popular: "Most selected",
    popularReason: "Popular for solo use",
    free: "Free",
    light: "Light",
    standard: "Standard",
    pro: "Pro",
    business: "Business",
    freeFit: "For testing",
    lightFit: "For side delivery work",
    standardFit: "For solo field operations",
    proFit: "For daily field work",
    businessFit: "For teams and businesses",
    freeUsage: "Try the workflow first",
    lightUsage: "For 1-2 uses per week",
    standardUsage: "For weekly visit work",
    proUsage: "For daily delivery and visits",
    businessUsage: "For multiple users or projects",
    yen: "JPY",
    month: "mo",
    imagesUnit: "reads/mo",
    stopsUnit: "stops/mo",
    routesUnit: "sorts/mo",
    ocrOverage: "Address reading 10-15 JPY/read",
    stopsOverage: "Visit imports 100-300 JPY per 1,000",
    routesOverage: "Route sorting 100-300 JPY per 100",
    modelNoteTitle: "Designed for real field work",
    modelNote: "Address reading, route sorting, and CSV import are managed by operational volume so delivery and visit workflows stay predictable.",
    includedTitle: "Included in every plan",
    included1: "Read addresses from photos",
    included2: "Batch read multiple images",
    included3: "CSV and TXT file support",
    included4: "Visit notes and time windows",
    included5: "Route sorting from current location",
    ctaTitle: "Try address reading for free",
    ctaText: "Add an address image and check recognition quality with your actual slips or notes before choosing a plan.",
    ctaPrimary: "Try one stop",
    ctaSecondary: "Organize multiple visits",
    compareTitle: "How usage is counted",
    compareImage: "Counts each time an address is read from a photo.",
    compareFile: "Counts each stop added from CSV or TXT files.",
    compareRoute: "Counts each AI visit-order sorting request.",
    trust1: "Google Maps integration",
    trust2: "Mobile and desktop",
    trust3: "No install required",
    trust4: "Runs in browser"
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
    { id: "free" as const, name: t.free, price: 0, imageOcr: 5, fileStops: 30, routeRuns: 3, fit: t.freeFit, usage: t.freeUsage, highlighted: false },
    { id: "light" as const, name: t.light, price: 680, imageOcr: 30, fileStops: 300, routeRuns: 30, fit: t.lightFit, usage: t.lightUsage, highlighted: false },
    { id: "standard" as const, name: t.standard, price: 1480, imageOcr: 120, fileStops: 1500, routeRuns: 150, fit: t.standardFit, usage: t.standardUsage, highlighted: true },
    { id: "pro" as const, name: t.pro, price: 2980, imageOcr: 400, fileStops: 5000, routeRuns: 500, fit: t.proFit, usage: t.proUsage, highlighted: false },
    { id: "business" as const, name: t.business, price: 9800, imageOcr: 1500, fileStops: 20000, routeRuns: 2000, fit: t.businessFit, usage: t.businessUsage, highlighted: false }
  ];

  const included = [t.included1, t.included2, t.included3, t.included4, t.included5];
  const countRules = [
    { icon: ImageIcon, title: t.addressRead, text: t.compareImage },
    { icon: FileText, title: t.visitImport, text: t.compareFile },
    { icon: Route, title: t.routeSort, text: t.compareRoute }
  ];
  const trustItems = [
    { icon: MapPinned, text: t.trust1 },
    { icon: Smartphone, text: t.trust2 },
    { icon: MonitorDown, text: t.trust3 },
    { icon: Check, text: t.trust4 }
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

        <section className="grid gap-5 rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-neutral-200/80 md:p-7 lg:grid-cols-[1fr_0.72fr] lg:items-end">
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
          <div className="grid gap-3 rounded-lg bg-emerald-950 p-4 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{t.modelNoteTitle}</span>
            </div>
            <p className="m-0 text-sm font-semibold leading-6 text-emerald-50">{t.modelNote}</p>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "relative grid gap-4 rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                plan.highlighted ? "border-emerald-800 bg-white shadow-[0_18px_50px_rgba(6,78,59,0.18)] ring-2 ring-emerald-800" : "border-neutral-200/80 bg-white/90"
              ].join(" ")}
            >
              {plan.highlighted ? (
                <div className="absolute right-3 top-3 inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-900 px-2 text-[11px] font-black text-white">
                  <Sparkles size={13} aria-hidden="true" />
                  {t.popular}
                </div>
              ) : null}

              <div className="grid gap-2 pr-24 lg:pr-0">
                <h2 className="m-0 text-xl font-black text-neutral-950">{plan.name}</h2>
                <p className="m-0 text-sm font-black leading-5 text-neutral-700">{plan.fit}</p>
                <p className="m-0 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-900 ring-1 ring-emerald-100">{plan.highlighted ? t.popularReason : plan.usage}</p>
              </div>

              <div className="grid gap-1">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black tracking-normal text-neutral-950">{formatNumber(plan.price, locale)}</span>
                  <span className="pb-1 text-sm font-black text-neutral-600">{t.yen}/{t.month}</span>
                </div>
                <p className="m-0 text-xs font-bold text-neutral-500">{t.tax}</p>
              </div>

              <div className="grid gap-2">
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.addressRead}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.imageOcr, locale)} {t.imagesUnit}</p>
                </div>
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.visitImport}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.fileStops, locale)} {t.stopsUnit}</p>
                </div>
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.routeSort}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.routeRuns, locale)} {t.routesUnit}</p>
                </div>
              </div>

              <button
                className={plan.highlighted ? "primary-action hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(6,78,59,0.28)]" : "secondary-action hover:-translate-y-0.5 hover:shadow-md"}
                type="button"
                onClick={() => choosePlan(plan.id)}
                disabled={loadingPlan === plan.id}
              >
                <span>{plan.id === "free" ? t.chooseFree : t.choose}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4 rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-neutral-200/80">
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
                <div key={rule.title} className="grid gap-3 rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-900 text-white">
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

        <section className="grid gap-4 rounded-lg bg-emerald-950 p-5 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="m-0 text-2xl font-black">{t.ctaTitle}</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm font-semibold leading-6 text-emerald-50">{t.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-neutral-100 hover:shadow-md active:scale-[0.98]" href="/single">
              <ImageIcon size={18} aria-hidden="true" />
              <span>{t.ctaPrimary}</span>
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md active:scale-[0.98]" href="/batch">
              <Route size={18} aria-hidden="true" />
              <span>{t.ctaSecondary}</span>
            </Link>
          </div>
        </section>

        <section className="grid gap-2 rounded-lg bg-white/80 p-4 shadow-sm ring-1 ring-neutral-200/80 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.text} className="flex min-h-11 items-center gap-2 rounded-lg bg-neutral-50 px-3 text-sm font-black text-neutral-800">
              <item.icon className="text-emerald-700" size={18} aria-hidden="true" />
              <span>{item.text}</span>
            </div>
          ))}
        </section>

        <LegalFooter locale={locale} />
      </div>
    </main>
  );
}

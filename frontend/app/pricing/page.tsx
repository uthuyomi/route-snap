"use client";

import { createClient } from "@supabase/supabase-js";
import { ArrowRight, BriefcaseBusiness, Check, CreditCard, FileText, Image as ImageIcon, MapPinned, MonitorDown, Route, ShieldCheck, Smartphone, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppLocale } from "../components/AppHeader";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { usePreferredLocale } from "../lib/locale";
import { PlanId } from "../lib/plans";

const messages = {
  ja: {
    eyebrow: "料金プラン",
    title: "必要な分だけ使える、現場向け料金プラン",
    lead: "住所読み取り・訪問先一括登録・ルート整理を、利用量に合わせて使える料金プランです。小規模な訪問業務から、配送・チーム運用まで対応します。",
    tax: "税込予定",
    addressRead: "住所読み取り",
    visitImport: "訪問先一括登録",
    routeSort: "ルート整理",
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
    readsUnit: "回/月",
    stopsUnit: "件/月",
    sortsUnit: "回/月",
    addressOverage: "住所読み取り 10〜15円/回",
    stopsOverage: "訪問先一括登録 1,000件ごとに100〜300円",
    routesOverage: "ルート整理 100回ごとに100〜300円",
    modelNoteTitle: "通常業務を想定した設計",
    modelNote: "配送・訪問業務で使いやすいよう、住所読み取り・ルート整理・訪問先一括登録を業務量ベースで管理します。",
    includedTitle: "全プラン共通",
    included1: "写真から住所を読み取り",
    included2: "複数画像の一括読み取り",
    included3: "CSV・TXTファイル対応",
    included4: "訪問メモ・時間管理",
    included5: "現在地からルート整理",
    ctaTitle: "まずは無料で読み取りを試せます",
    ctaText: "まずは無料プランで住所読み取りを試せます。現場の伝票・メモで確認してから、必要なプランを選べます。",
    ctaPrimary: "1件だけ試す",
    ctaSecondary: "複数訪問を整理する",
    compareTitle: "この機能は何か",
    compareImage: "伝票・メモ・画像から住所を読み取る処理です。単発版と複数版の画像読み取りで消費します。",
    compareFile: "CSV/TXTなどのファイルや一括入力から、複数の訪問先をまとめて登録する件数です。",
    compareRoute: "複数の訪問先を回りやすい順番に並べ替える処理です。AI最適化やルート整理で消費します。",
    trust1: "Google Maps連携対応",
    trust2: "スマホ・PC対応",
    trust3: "インストール不要",
    trust4: "ブラウザだけで利用可能"
  },
  en: {
    eyebrow: "Pricing",
    title: "Field pricing that scales with your workload",
    lead: "Use address reading, bulk visit registration, and route sorting based on volume. Built for small visit workflows through delivery and team operations.",
    tax: "estimated tax included",
    addressRead: "Address reading",
    visitImport: "Bulk visit registration",
    routeSort: "Route sorting",
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
    readsUnit: "reads/mo",
    stopsUnit: "stops/mo",
    sortsUnit: "sorts/mo",
    addressOverage: "Address reading 10-15 JPY/read",
    stopsOverage: "Bulk visit registration 100-300 JPY per 1,000",
    routesOverage: "Route sorting 100-300 JPY per 100",
    modelNoteTitle: "Designed for real field work",
    modelNote: "Address reading, route sorting, and bulk visit registration are managed by operational volume so delivery and visit workflows stay predictable.",
    includedTitle: "Included in every plan",
    included1: "Read addresses from photos",
    included2: "Batch read multiple images",
    included3: "CSV and TXT file support",
    included4: "Visit notes and time windows",
    included5: "Route sorting from current location",
    ctaTitle: "Try address reading for free",
    ctaText: "Start with the free plan and check recognition quality with your actual slips or notes before choosing a plan.",
    ctaPrimary: "Try one stop",
    ctaSecondary: "Organize multiple visits",
    compareTitle: "What each feature means",
    compareImage: "Reads addresses from slips, notes, or images. Used by image reading in the single and batch tools.",
    compareFile: "Counts stops added in bulk from CSV/TXT files or batch input.",
    compareRoute: "Sorts multiple stops into an easier visit order. Used by AI optimization and route sorting.",
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
  const [locale] = usePreferredLocale();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const t = messages[locale];
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

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
    setCheckoutError("");
    if (planId === "free") {
      window.location.assign("/app");
      return;
    }

    setLoadingPlan(planId);
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(data.session?.access_token ? { authorization: `Bearer ${data.session.access_token}` } : {})
      },
      body: JSON.stringify({ planId })
    });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; detail?: string };
    setLoadingPlan(null);

    if (response.status === 401) {
      window.location.assign(`/login?next=/pricing&plan=${planId}`);
      return;
    }
    if (response.ok && payload.url) {
      window.location.assign(payload.url);
      return;
    }
    setCheckoutError(payload.detail ?? "決済画面を開けませんでした。時間をおいてもう一度お試しください。");
  }

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap">

        <section className="site-section grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="grid gap-4">
            <p className="site-kicker">
              <CreditCard size={14} aria-hidden="true" />
              <span className="ml-1">{t.eyebrow}</span>
            </p>
            <div className="grid gap-4">
              <h1 className="site-title max-w-4xl">{t.title}</h1>
              <p className="site-lead">{t.lead}</p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl bg-blue-700 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{t.modelNoteTitle}</span>
            </div>
            <p className="m-0 text-sm font-bold leading-7 text-blue-50">{t.modelNote}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "relative grid gap-5 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                plan.highlighted ? "border-blue-600 bg-white shadow-[0_18px_50px_rgba(37,99,235,0.18)] ring-2 ring-blue-600" : "border-blue-100 bg-white"
              ].join(" ")}
            >
              {plan.highlighted ? (
                <div className="absolute right-3 top-3 inline-flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-2 text-[11px] font-black text-white">
                  <Sparkles size={13} aria-hidden="true" />
                  {t.popular}
                </div>
              ) : null}

              <div className="grid gap-2 pr-24 lg:pr-0">
                <h2 className="m-0 text-xl font-black text-[#061a3a]">{plan.name}</h2>
                <p className="m-0 text-sm font-black leading-6 text-slate-700">{plan.fit}</p>
                <p className="m-0 rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{plan.highlighted ? t.popularReason : plan.usage}</p>
              </div>

              <div className="grid gap-1">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black tracking-normal text-[#061a3a]">{formatNumber(plan.price, locale)}</span>
                  <span className="pb-1 text-sm font-black text-neutral-600">{t.yen}/{t.month}</span>
                </div>
                <p className="m-0 text-xs font-bold text-neutral-500">{t.tax}</p>
              </div>

              <div className="grid gap-2">
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.addressRead}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.imageOcr, locale)} {t.readsUnit}</p>
                </div>
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.visitImport}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.fileStops, locale)} {t.stopsUnit}</p>
                </div>
                <div className="metric-card">
                  <p className="m-0 text-xs font-black text-neutral-500">{t.routeSort}</p>
                  <p className="m-0 mt-1 text-lg font-black text-neutral-950">{formatNumber(plan.routeRuns, locale)} {t.sortsUnit}</p>
                </div>
              </div>

              <button
                className={plan.highlighted ? "site-primary hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(37,99,235,0.28)]" : "site-secondary hover:-translate-y-0.5 hover:shadow-md"}
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

        {checkoutError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700">
            {checkoutError}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="site-section grid gap-4">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={20} aria-hidden="true" />
              <h2 className="m-0 text-2xl font-black">{t.includedTitle}</h2>
            </div>
            <div className="grid gap-2">
              {included.map((item) => (
                <div key={item} className="grid grid-cols-[2rem_1fr] items-center gap-2 rounded-lg bg-neutral-50 p-3 text-sm font-black text-neutral-800">
                  <Check className="text-blue-600" size={18} aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl bg-[#f4f9ff] p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={20} aria-hidden="true" />
              <h2 className="m-0 text-2xl font-black">{t.compareTitle}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {countRules.map((rule) => (
                <div key={rule.title} className="site-card grid gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white">
                    <rule.icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="m-0 text-base font-black text-neutral-950">{rule.title}</h3>
                    <p className="m-0 mt-2 text-sm font-bold leading-7 text-slate-600">{rule.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 rounded-lg bg-white/80 p-3 text-sm font-bold text-neutral-700">
              <p className="m-0">{t.addressOverage}</p>
              <p className="m-0">{t.stopsOverage}</p>
              <p className="m-0">{t.routesOverage}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-blue-700 p-6 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="m-0 text-2xl font-black">{t.ctaTitle}</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm font-bold leading-7 text-blue-50">{t.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md active:scale-[0.98]" href="/app">
              <ImageIcon size={18} aria-hidden="true" />
              <span>{t.ctaPrimary}</span>
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md active:scale-[0.98]" href="/app">
              <Route size={18} aria-hidden="true" />
              <span>{t.ctaSecondary}</span>
            </Link>
          </div>
        </section>

        <section className="grid gap-2 rounded-2xl bg-[#f7fbff] p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.text} className="flex min-h-11 items-center gap-2 rounded-lg bg-neutral-50 px-3 text-sm font-black text-neutral-800">
              <item.icon className="text-blue-600" size={18} aria-hidden="true" />
              <span>{item.text}</span>
            </div>
          ))}
        </section>

      </div>
      <SiteFooter />
    </main>
  );
}

"use client";

import { createClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  FileText,
  HeartPulse,
  MapPinned,
  Route,
  Sparkles,
  Truck,
  Wrench
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppMoveCta, AuthHeaderActions } from "./components/AuthHeaderActions";
import { PwaInstallSection } from "./components/PwaInstallSection";
import { SiteMobileMenu } from "./components/SiteMobileMenu";
import { useVisitorLocale } from "./lib/locale";

const appName = "route-snap";

const homeCopy = {
  ja: {
    nav: { top: "トップ", features: "機能", steps: "使い方", app: "アプリ管理", pricing: "料金", faq: "よくある質問", contact: "お問い合わせ", terms: "利用規約", privacy: "プライバシーポリシー", tokusho: "特定商取引法に基づく表記" },
    heroTitle: <>そのルートが、<br />ビジネスを変える。</>,
    heroLead: "最適なルートで、配送をもっとスマートに。",
    start: "無料で始める",
    note: "登録不要・すぐに使えます",
    stepsTitle: "たった3ステップで、すぐに使えます",
    featuresTitle: "できること",
    midTitle: <>今日の配送、<br />もっとラクにしませんか？</>,
    midLead: "住所入力やルート整理を、AIでまとめて効率化。",
    casesTitle: "こんな現場で使われています",
    faqTitle: "よくある質問",
    faqMore: "FAQをもっと見る",
    bottomTitle: "毎日の住所入力、まだ手でやりますか？",
    bottomLead: "route-snapなら、撮るだけでルート整理。配送・営業・訪問業務を、もっとスマートに。",
    steps: [
      { icon: Camera, title: "伝票・メモ・画像を追加", text: "スマホで撮影するだけ。", image: "/image/site/top/3step-01.png", mock: "camera" },
      { icon: Sparkles, title: "AIが住所を自動抽出", text: "複数の訪問先もまとめて整理。", image: "/image/site/top/3step-02.png", mock: "list" },
      { icon: MapPinned, title: "Google Mapsですぐ開始", text: "そのままナビ開始。", image: "/image/site/top/3step-03.png", mock: "map" },
    ],
    features: [
      { icon: FileText, title: "住所を読み取る", text: "伝票・メモ・画像からAIが住所を自動で抽出。入力の手間をゼロにします。", image: "/image/site/top/can-01.png", mock: "ocr" },
      { icon: Route, title: "複数ルートを整理", text: "複数の訪問先を最適な順番に並び替え、移動距離と訪問時間を削減します。", image: "/image/site/top/can-02.png", mock: "route" },
      { icon: MapPinned, title: "Google Maps連携", text: "ワンタップですぐGoogle Mapsに連携。ナビ開始までスムーズで、迷わず訪問できます。", image: "/image/site/top/can-03.png", mock: "maps" },
    ],
    useCases: [
      { icon: Truck, image: "/image/site/top/onsite-01.png", title: "軽貨物・配送", text: "毎日の配送ルートを最適化し、配送件数と効率をアップ。" },
      { icon: BriefcaseBusiness, image: "/image/site/top/onsite-02.png", title: "営業・訪問", text: "訪問先をまとめて管理し、移動時間を有効活用。" },
      { icon: HeartPulse, image: "/image/site/top/onsite-03.png", title: "訪問介護・サービス", text: "複数の訪問先を効率よく回り、利用者様の満足度向上に。" },
      { icon: Wrench, image: "/image/site/top/onsite-04.png", title: "点検・メンテナンス", text: "点検先を効率的に回り、作業時間を最大化。" },
    ],
    faqs: [
      { question: "どんな人におすすめですか？", answer: "配送、営業、訪問介護、点検など、複数の訪問先を毎回整理して移動する現場に向いています。住所入力とルート整理をまとめて短縮できます。" },
      { question: "料金プランはありますか？", answer: "無料プランから始められます。住所読み取り、訪問先一括登録、ルート整理の利用量に合わせて有料プランを選べます。" },
      { question: "Google Mapsと連携できますか？", answer: "はい。整理した住所やルートをGoogle Mapsで開けます。スマホでもPCでも、ナビ開始までの流れを短くできます。" },
      { question: "スマホでも使えますか？", answer: "はい。ブラウザで使えます。ホーム画面に追加すると、スマホでもPCでもアプリのようにすぐ起動できます。" },
    ],
  },
  en: {
    nav: { top: "Home", features: "Features", steps: "How it works", app: "App dashboard", pricing: "Pricing", faq: "FAQ", contact: "Contact", terms: "Terms", privacy: "Privacy", tokusho: "Legal notice" },
    heroTitle: <>Routes that<br />change the workday.</>,
    heroLead: "Smarter route planning for delivery, visits, and field teams.",
    start: "Start free",
    note: "No setup required. Use it right away.",
    stepsTitle: "Start in just 3 steps",
    featuresTitle: "What you can do",
    midTitle: <>Make today&apos;s visits<br />easier to manage.</>,
    midLead: "Use AI to streamline address entry and route ordering.",
    casesTitle: "Built for field teams like these",
    faqTitle: "FAQ",
    faqMore: "See more FAQ",
    bottomTitle: "Still typing addresses by hand every day?",
    bottomLead: "With route-snap, capture addresses and organize routes faster for delivery, sales, and field visits.",
    steps: [
      { icon: Camera, title: "Add slips, notes, or images", text: "Just take a photo on your phone.", image: "/image/site/top/3step-01.png", mock: "camera" },
      { icon: Sparkles, title: "AI extracts addresses", text: "Organize multiple stops at once.", image: "/image/site/top/3step-02.png", mock: "list" },
      { icon: MapPinned, title: "Open in Google Maps", text: "Start navigation right away.", image: "/image/site/top/3step-03.png", mock: "map" },
    ],
    features: [
      { icon: FileText, title: "Read addresses", text: "Extract addresses from slips, notes, and images with AI, reducing manual entry.", image: "/image/site/top/can-01.png", mock: "ocr" },
      { icon: Route, title: "Organize routes", text: "Sort multiple destinations into a practical order to reduce travel time.", image: "/image/site/top/can-02.png", mock: "route" },
      { icon: MapPinned, title: "Google Maps handoff", text: "Open organized destinations in Google Maps and move smoothly into navigation.", image: "/image/site/top/can-03.png", mock: "maps" },
    ],
    useCases: [
      { icon: Truck, image: "/image/site/top/onsite-01.png", title: "Delivery", text: "Improve daily route efficiency and handle more stops." },
      { icon: BriefcaseBusiness, image: "/image/site/top/onsite-02.png", title: "Sales visits", text: "Manage visits together and make better use of travel time." },
      { icon: HeartPulse, image: "/image/site/top/onsite-03.png", title: "Care and service", text: "Visit multiple clients efficiently and keep schedules easier to follow." },
      { icon: Wrench, image: "/image/site/top/onsite-04.png", title: "Inspection and maintenance", text: "Move through job sites efficiently and maximize work time." },
    ],
    faqs: [
      { question: "Who is route-snap for?", answer: "It is for delivery, sales, care, inspection, and other field teams that repeatedly organize multiple destinations." },
      { question: "Are there paid plans?", answer: "Yes. You can start with a free plan and choose a paid plan based on address reading, bulk destination import, and route organization usage." },
      { question: "Does it work with Google Maps?", answer: "Yes. You can open organized addresses and routes in Google Maps on both mobile and desktop." },
      { question: "Can I use it on a phone?", answer: "Yes. It runs in the browser, and you can add it to your home screen for app-like access." },
    ],
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MockVisual({ type }: { type: string }) {
  if (type === "camera") {
    return (
      <div className="mx-auto mt-5 grid h-64 w-44 content-end rounded-[2rem] bg-neutral-950 p-3 shadow-xl">
        <div className="grid h-48 place-items-center rounded-xl bg-neutral-800">
          <div className="h-32 w-20 rounded bg-white shadow-sm">
            <div className="m-2 grid gap-1">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index} className="h-1 rounded bg-neutral-300" />
              ))}
            </div>
          </div>
        </div>
        <span className="mx-auto mt-3 h-9 w-9 rounded-full border-4 border-white" />
      </div>
    );
  }

  if (type === "list" || type === "ocr") {
    return (
      <div className="mx-auto mt-5 grid h-64 w-44 rounded-[2rem] bg-white p-4 shadow-xl ring-8 ring-neutral-950">
        <p className="m-0 text-xs font-black text-neutral-500">抽出結果</p>
        <div className="mt-4 grid gap-3">
          {["東京都新宿区1-5-6", "渋谷区桜丘2-3-3", "港区芝公園4-2-8", "目黒区下目黒1-1"].map((item) => (
            <div key={item} className="grid grid-cols-[1rem_1fr] items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-2">
              <CheckCircle2 className="text-blue-600" size={14} aria-hidden="true" />
              <span className="truncate text-[10px] font-bold text-neutral-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "route") {
    return (
      <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        {["渋谷区神南1-5-6", "港区赤坂2-3-3", "新宿区西新宿1-2-3"].map((item, index) => (
          <div key={item} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-neutral-100 py-3 last:border-b-0">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-xs font-black text-blue-700">{index + 1}</span>
            <span className="truncate text-xs font-bold text-neutral-700">{item}</span>
            <span className="text-xs font-bold text-neutral-500">{index === 0 ? "09:00" : index === 1 ? "10:30" : "13:00"}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-5 grid h-64 w-44 content-end rounded-[2rem] bg-white p-4 shadow-xl ring-8 ring-neutral-950">
      <div className="relative h-44 overflow-hidden rounded-xl bg-blue-50">
        <div className="absolute inset-x-4 top-10 h-1 rotate-12 rounded-full bg-blue-500" />
        <div className="absolute inset-x-6 top-24 h-1 -rotate-12 rounded-full bg-blue-500" />
        {[18, 42, 68, 84].map((left, index) => (
          <span key={left} className="absolute top-1/2 grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-[10px] font-black text-white" style={{ left: `${left}%`, transform: `translateY(${index % 2 ? -18 : 18}px)` }}>
            {index + 1}
          </span>
        ))}
      </div>
      <span className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-center text-[10px] font-black text-white">Google Mapsで開く</span>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white">
      <MapPinned size={22} strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const locale = useVisitorLocale();
  const t = homeCopy[locale];
  const steps = t.steps;
  const features = t.features;
  const useCases = t.useCases;
  const faqs = t.faqs;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("landing") === "1") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    let isMounted = true;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted && data.session) {
        window.location.replace("/app");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-svh bg-white text-[#061a3a]">
      <header className="sticky top-0 z-30 border-b border-blue-50 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link className="inline-flex items-center gap-3" href="/?landing=1" aria-label={appName}>
            <LogoMark />
            <span className="text-xl font-black tracking-normal sm:text-2xl">{appName}</span>
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-black text-[#061a3a] lg:flex" aria-label="Route Snap">
            <Link href="/?landing=1">{t.nav.top}</Link>
            <a href="#features">{t.nav.features}</a>
            <a href="#steps">{t.nav.steps}</a>
            <Link href="/app">{t.nav.app}</Link>
            <Link href="/pricing">{t.nav.pricing}</Link>
            <Link href="/faq">{t.nav.faq}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <AuthHeaderActions />
            <Link className="hidden" href="/login?next=/app">
              {locale === "ja" ? "ログイン" : "Log in"}
            </Link>
            <Link className="hidden" href="/app">
              {t.start}
            </Link>
            <SiteMobileMenu />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#e8f5ff]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(239,248,255,0.96)_0%,rgba(239,248,255,0.84)_33%,rgba(239,248,255,0.18)_64%,rgba(239,248,255,0)_100%)]" />
        <div className="absolute inset-0 bg-cover bg-[62%_center] bg-no-repeat" style={{ backgroundImage: "url('/image/site/top/hero.png')" }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.68)_35%,rgba(255,255,255,0)_68%)]" />
        <div className="relative mx-auto grid min-h-[31rem] w-full max-w-7xl content-center px-5 py-14 sm:min-h-[40rem] sm:px-8 sm:py-16">
          <div className="grid max-w-2xl gap-8">
            <div className="grid gap-6">
              <h1 className="m-0 text-4xl font-black leading-[1.28] tracking-normal text-[#061a3a] sm:text-6xl lg:text-7xl">
                {t.heroTitle}
              </h1>
              <p className="m-0 text-lg font-bold leading-8 text-[#173052] sm:text-xl">{t.heroLead}</p>
            </div>
            <div className="grid w-fit gap-3">
              <AppMoveCta className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-blue-600 px-10 text-base font-black text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]">
                {t.start}
                <ArrowRight size={18} aria-hidden="true" />
              </AppMoveCta>
              <p className="m-0 text-center text-xs font-bold text-slate-500">{t.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="steps" className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-9 sm:px-8">
        <h2 className="m-0 text-center text-3xl font-black leading-10">{t.stepsTitle}</h2>
        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="relative grid min-h-[25rem] overflow-hidden rounded-2xl border border-blue-100 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-lg font-black text-white">{index + 1}</span>
                <div>
                  <h3 className="m-0 text-lg font-black leading-7">{step.title}</h3>
                  <p className="m-0 mt-2 text-sm font-bold leading-6 text-slate-600">{step.text}</p>
                </div>
              </div>
              <span className="absolute left-7 top-20 grid h-9 w-9 place-items-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm">
                <step.icon size={19} aria-hidden="true" />
              </span>
              <div className="relative mt-5 h-64 overflow-hidden rounded-xl bg-blue-50">
                <Image className="object-cover" src={step.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-8 sm:px-8">
        <div className="rounded-2xl bg-[#f4f9ff] p-5 sm:p-8">
          <h2 className="m-0 text-center text-3xl font-black leading-10">{t.featuresTitle}</h2>
          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-xl bg-white p-7 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <feature.icon size={30} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="m-0 text-xl font-black leading-8">{feature.title}</h3>
                    <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-600">{feature.text}</p>
                  </div>
                </div>
                <div className="relative mt-5 h-64 overflow-hidden rounded-xl bg-blue-50">
                  <Image className="object-cover" src={feature.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-[#e3f4ff] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid content-center gap-5 p-8 sm:p-12">
            <h2 className="m-0 text-4xl font-black leading-tight">{t.midTitle}</h2>
            <p className="m-0 text-lg font-bold leading-8 text-[#173052]">{t.midLead}</p>
            <AppMoveCta className="inline-flex min-h-14 w-fit items-center justify-center gap-2 rounded-lg bg-blue-600 px-10 text-base font-black text-white shadow-sm transition hover:bg-blue-700">
              {t.start}
              <ArrowRight size={18} aria-hidden="true" />
            </AppMoveCta>
          </div>
          <div className="relative min-h-72 overflow-hidden">
            <Image className="object-cover" src="/image/site/top/cta-01.png" alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" />
          </div>
        </div>
      </section>

      <section id="cases" className="mx-auto grid w-full max-w-7xl gap-7 px-5 pb-8 sm:px-8">
        <h2 className="m-0 text-center text-3xl font-black leading-10">{t.casesTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => (
            <article key={item.title} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="relative h-28 overflow-hidden rounded-xl bg-blue-50">
                <Image className="object-cover" src={item.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
              </div>
              <h3 className="m-0 mt-5 text-xl font-black leading-8">{item.title}</h3>
              <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <PwaInstallSection />

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 pb-9 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-2xl font-black">{t.faqTitle}</h2>
          <Link className="inline-flex items-center gap-1 text-sm font-black text-blue-600" href="/faq">
            {t.faqMore}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
              <button
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 text-left text-base font-black text-[#061a3a]"
                type="button"
                aria-expanded={openFaq === index}
                aria-controls={`home-faq-${index}`}
                onClick={() => setOpenFaq((current) => (current === index ? null : index))}
              >
                <span>{faq.question}</span>
                <ChevronDown className={`shrink-0 transition ${openFaq === index ? "rotate-180 text-blue-600" : "text-slate-500"}`} size={18} aria-hidden="true" />
              </button>
              {openFaq === index ? (
                <div id={`home-faq-${index}`} className="border-t border-blue-50 px-5 pb-5 pt-4">
                  <p className="m-0 text-sm font-bold leading-7 text-slate-600">{faq.answer}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-7 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-blue-700 text-white lg:grid-cols-[1fr_0.86fr]">
          <div className="grid content-center gap-5 p-8 sm:p-12">
            <h2 className="m-0 text-4xl font-black leading-tight">{t.bottomTitle}</h2>
            <p className="m-0 text-lg font-bold leading-8 text-blue-50">{t.bottomLead}</p>
            <AppMoveCta className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-lg bg-white px-10 text-sm font-black text-blue-700 transition hover:bg-blue-50">
              {t.start}
              <ArrowRight size={17} aria-hidden="true" />
            </AppMoveCta>
          </div>
          <div className="relative min-h-72 overflow-hidden bg-blue-600/40">
            <Image className="object-cover" src="/image/site/top/cta-02.png" alt="" fill sizes="(min-width: 1024px) 46vw, 100vw" />
          </div>
        </div>
      </section>

      <footer className="border-t border-blue-50 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <Link className="inline-flex items-center gap-2 text-[#061a3a]" href="/?landing=1">
            <LogoMark />
            <span>{appName}</span>
          </Link>
          <nav className="flex flex-wrap gap-5">
            <Link href="/?landing=1">{t.nav.top}</Link>
            <a href="#features">{t.nav.features}</a>
            <Link href="/app">{t.nav.app}</Link>
            <Link href="/pricing">{t.nav.pricing}</Link>
            <Link href="/faq">{t.nav.faq}</Link>
            <Link href="/contact">{t.nav.contact}</Link>
            <Link href="/legal/terms">{t.nav.terms}</Link>
            <Link href="/legal/privacy">{t.nav.privacy}</Link>
            <Link href="/legal/tokusho">{t.nav.tokusho}</Link>
          </nav>
          <span>© 2024 route-snap</span>
        </div>
      </footer>
    </main>
  );
}

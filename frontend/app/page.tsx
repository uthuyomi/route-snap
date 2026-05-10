"use client";

import { ArrowRight, Camera, CheckCircle2, CreditCard, FileText, Map, Route, ScanText, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppHeader, AppLocale } from "./components/AppHeader";

const messages = {
  ja: {
    title: "住所を撮って、すぐ道順へ。",
    lead: "Route Snapは、住所画像や住所ファイルをAIで読み取り、Google Mapsで使えるルートに整えるウェブアプリです。",
    singleTitle: "単発版",
    singleText: "1件の住所を撮影して、そのままナビへ送れます。現場で急いでいる時の住所入力を短縮します。",
    batchTitle: "複数版",
    batchText: "画像やファイルから複数住所を取り込み、ファイル内の順番通り、またはAIで移動順を最適化して一括ルート化します。",
    paidBadge: "有料プラン予定",
    startSingle: "単発版を使う",
    startBatch: "複数版を見る",
    howTitle: "使い方",
    step1: "住所が写った画像、または住所が入ったファイルを追加します。",
    step2: "AIが住所を読み取り、必要に応じて手で修正します。",
    step3: "単発は目的地へ、複数は順路を作ってGoogle Mapsで開きます。",
    pricingTitle: "複数版の料金目安",
    pricingText: "まずは月額980円から1,480円あたりが始めやすいです。業務利用で毎日使う層に寄せるなら、月額1,980円のProも自然です。",
    pricingSmall: "最初は無料枠を小さく置き、複数住所・AI移動順最適化を有料にする構成がおすすめです。"
  },
  en: {
    title: "Snap an address. Open the route.",
    lead: "Route Snap reads address images and files with AI, then prepares routes that are easy to open in Google Maps.",
    singleTitle: "Single",
    singleText: "Capture one address and send it straight to navigation. It removes slow manual address entry on the go.",
    batchTitle: "Batch",
    batchText: "Import multiple addresses from images or files, then route them in file order or let AI optimize the travel order.",
    paidBadge: "Paid plan planned",
    startSingle: "Use Single",
    startBatch: "View Batch",
    howTitle: "How It Works",
    step1: "Add an address image or a file containing addresses.",
    step2: "AI reads the addresses, and you can adjust them before routing.",
    step3: "Open one destination or create a multi-stop route in Google Maps.",
    pricingTitle: "Batch Pricing Idea",
    pricingText: "A good starting range is about ¥980 to ¥1,480 per month. For daily professional use, a ¥1,980 Pro plan also makes sense.",
    pricingSmall: "I would keep a small free tier, then charge for batch import and AI travel-order optimization."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function getInitialLocale(): AppLocale {
  if (typeof navigator === "undefined") return "ja";
  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
}

export default function Home() {
  const [locale, setLocale] = useState<AppLocale>(() => getInitialLocale());
  const t = messages[locale];

  return (
    <main className="min-h-svh bg-neutral-100 px-4 py-4 text-neutral-950 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5">
        <AppHeader locale={locale} currentPage="home" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <section className="grid gap-5 rounded-lg border border-neutral-300 bg-white p-5 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="grid content-center gap-5">
            <div className="grid gap-3">
              <h1 className="m-0 max-w-3xl text-4xl font-black leading-tight text-neutral-950 sm:text-5xl">{t.title}</h1>
              <p className="m-0 max-w-2xl text-base font-medium leading-7 text-neutral-600">{t.lead}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98]" href="/single">
                <ScanText size={20} aria-hidden="true" />
                <span>{t.startSingle}</span>
              </Link>
              <Link className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]" href="/batch">
                <Route size={20} aria-hidden="true" />
                <span>{t.startBatch}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <article className="grid gap-3 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-neutral-950 text-white">
                <Camera size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="m-0 text-lg font-black">{t.singleTitle}</h2>
                <p className="m-0 mt-1 text-sm font-medium leading-6 text-neutral-600">{t.singleText}</p>
              </div>
            </article>
            <article className="grid gap-3 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-neutral-950 text-white">
                  <FileText size={21} aria-hidden="true" />
                </span>
                <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-black text-neutral-700">{t.paidBadge}</span>
              </div>
              <div>
                <h2 className="m-0 text-lg font-black">{t.batchTitle}</h2>
                <p className="m-0 mt-1 text-sm font-medium leading-6 text-neutral-600">{t.batchText}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3 rounded-lg border border-neutral-300 bg-white p-5 shadow-sm">
            <h2 className="m-0 text-xl font-black">{t.howTitle}</h2>
            {[t.step1, t.step2, t.step3].map((step, index) => (
              <div key={step} className="grid grid-cols-[2.25rem_1fr] items-start gap-3 rounded-lg bg-neutral-50 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-950 text-sm font-black text-white">{index + 1}</span>
                <p className="m-0 text-sm font-semibold leading-6 text-neutral-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-lg border border-neutral-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-neutral-950 text-white">
                <CreditCard size={21} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-xl font-black">{t.pricingTitle}</h2>
            </div>
            <p className="m-0 text-sm font-semibold leading-6 text-neutral-700">{t.pricingText}</p>
            <p className="m-0 rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-xs font-semibold leading-5 text-neutral-500">{t.pricingSmall}</p>
            <div className="grid grid-cols-3 gap-2">
              {[Smartphone, Map, CheckCircle2].map((Icon, index) => (
                <div key={index} className="grid h-14 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-700">
                  <Icon size={21} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

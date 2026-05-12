"use client";

import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  LocateFixed,
  MapPinned,
  Navigation,
  Route,
  ScanText,
  Sparkles,
  Upload
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppHeader, AppLocale } from "./components/AppHeader";
import { usePreferredLocale } from "./lib/locale";

const messages = {
  ja: {
    eyebrow: "配送・訪問ルートの住所入力を短く",
    title: "紙も写真も、そのまま配達ルートへ。",
    lead: "Route Snapは、住所が写った画像やファイルをAIで読み取り、現在地スタートのGoogle Mapsルートに整えるツールです。",
    primary: "単発で試す",
    secondary: "複数住所をまとめる",
    trust1: "画像OCR",
    trust2: "複数住所",
    trust3: "現在地スタート",
    demoTitle: "今日の訪問先",
    demoAddress1: "東京都新宿区西新宿2-8-1",
    demoAddress2: "東京都渋谷区渋谷2-21-1",
    demoAddress3: "東京都港区芝公園4-2-8",
    demoNote: "AI順路: 現在地から近い順に整理",
    singleTitle: "1件なら撮ってすぐナビ",
    singleText: "伝票やメモの住所を撮影して、読み取った住所を確認したらそのままGoogle Mapsへ送れます。",
    batchTitle: "複数住所を一括取り込み",
    batchText: "画像・TXT・CSV・JSONから複数の住所を取り込み、リストで確認しながらまとめてルート化できます。",
    routeTitle: "現在地から順路を作成",
    routeText: "AI最適化では端末の現在地を考慮し、備考欄の時間指定や優先度も見ながら順番を整えます。",
    featureTitle: "現場で使いやすい機能",
    feature1: "写真の住所を読み取り",
    feature2: "ファイル内の順番でルート化",
    feature3: "AIで移動順を整理",
    feature4: "各住所に備考を追加",
    feature5: "スマホでもPCでも操作しやすい",
    feature6: "アプリとして端末に保存",
    workflowTitle: "使い方は3ステップ",
    step1: "画像や住所ファイルを追加",
    step2: "読み取り結果を確認・修正",
    step3: "現在地からGoogle Mapsで出発",
    audienceTitle: "こんな人に",
    audience1: "軽貨物・委託配送",
    audience2: "訪問営業・点検",
    audience3: "訪問介護・訪問看護",
    audience4: "イベント・出張サービス"
  },
  en: {
    eyebrow: "Faster address entry for delivery and field visits",
    title: "Turn paper, photos, and files into routes.",
    lead: "Route Snap reads address images and files with AI, then prepares Google Maps routes that start from your current location.",
    primary: "Try Single",
    secondary: "Import Batch",
    trust1: "Image OCR",
    trust2: "Batch import",
    trust3: "Current location",
    demoTitle: "Today’s stops",
    demoAddress1: "Shinjuku, Tokyo",
    demoAddress2: "Shibuya, Tokyo",
    demoAddress3: "Shiba Park, Tokyo",
    demoNote: "AI route: ordered from your current location",
    singleTitle: "One address, straight to navigation",
    singleText: "Capture a label or memo, check the extracted address, and send it directly to Google Maps.",
    batchTitle: "Import many addresses at once",
    batchText: "Read addresses from images, TXT, CSV, or JSON files, then review and route them together.",
    routeTitle: "Plan from your current location",
    routeText: "AI route ordering can consider your current location plus time windows, priorities, and notes.",
    featureTitle: "Built for field work",
    feature1: "Read addresses from photos",
    feature2: "Route in file order",
    feature3: "Optimize travel order with AI",
    feature4: "Add notes per stop",
    feature5: "Comfortable on mobile and desktop",
    feature6: "Save as an app on your device",
    workflowTitle: "Three simple steps",
    step1: "Add images or address files",
    step2: "Review and correct results",
    step3: "Open Google Maps from your location",
    audienceTitle: "Made for",
    audience1: "Local delivery",
    audience2: "Sales and inspections",
    audience3: "Home care visits",
    audience4: "On-site services"
  }
} satisfies Record<AppLocale, Record<string, string>>;

export default function Home() {
  const [locale, setLocale] = usePreferredLocale();
  const t = messages[locale];

  const features = [
    { icon: Camera, text: t.feature1 },
    { icon: FileText, text: t.feature2 },
    { icon: Sparkles, text: t.feature3 },
    { icon: Check, text: t.feature4 },
    { icon: LocateFixed, text: t.feature5 },
    { icon: Upload, text: t.feature6 }
  ];

  const audiences = [t.audience1, t.audience2, t.audience3, t.audience4];

  return (
    <main className="min-h-svh bg-[#f7f4ed] px-4 py-4 text-neutral-950 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-7">
        <AppHeader locale={locale} currentPage="home" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <section className="overflow-hidden rounded-lg bg-[#fffdf7]">
          <div className="grid gap-6 p-5 md:p-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="inline-flex w-fit rotate-[-1deg] items-center gap-2 rounded-lg bg-[#dff3c7] px-3 py-2 text-xs font-black text-[#31551f] shadow-sm">
                  <MapPinned size={15} aria-hidden="true" />
                  {t.eyebrow}
                </div>
                <h1 className="m-0 max-w-3xl text-4xl font-black leading-tight text-neutral-950 sm:text-5xl lg:text-6xl">{t.title}</h1>
                <p className="m-0 max-w-2xl text-base font-semibold leading-7 text-neutral-600 sm:text-lg">{t.lead}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98]" href="/single">
                  <ScanText size={20} aria-hidden="true" />
                  <span>{t.primary}</span>
                </Link>
                <Link className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 text-sm font-black text-neutral-900 shadow-sm transition hover:border-neutral-500 hover:bg-neutral-50 active:scale-[0.98]" href="/batch">
                  <Route size={20} aria-hidden="true" />
                  <span>{t.secondary}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[t.trust1, t.trust2, t.trust3].map((item) => (
                  <div key={item} className="rounded-lg bg-white px-3 py-3 text-center text-xs font-black text-neutral-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid rotate-[1deg] gap-3 rounded-lg bg-[#e8f4ff] p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <Image className="h-12 w-12 rounded-lg object-cover" src="/image/icon/route-snap.png" alt="Route Snap" width={48} height={48} priority />
                  <div>
                    <p className="m-0 text-sm font-black text-neutral-950">{t.demoTitle}</p>
                    <p className="m-0 text-xs font-bold text-neutral-500">{t.demoNote}</p>
                  </div>
                </div>
                <Navigation className="text-emerald-700" size={22} aria-hidden="true" />
              </div>

              {[t.demoAddress1, t.demoAddress2, t.demoAddress3].map((address, index) => (
                <div key={address} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-950 text-sm font-black text-white">{index + 1}</span>
                  <span className="truncate text-sm font-black text-neutral-900">{address}</span>
                  <Check className="text-emerald-700" size={18} aria-hidden="true" />
                </div>
              ))}

              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-neutral-950 p-3 text-white">
                <span className="text-sm font-black">{t.secondary}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            { icon: ScanText, title: t.singleTitle, text: t.singleText },
            { icon: FileText, title: t.batchTitle, text: t.batchText },
            { icon: LocateFixed, title: t.routeTitle, text: t.routeText }
          ].map((item) => (
            <article key={item.title} className="grid gap-3 rounded-lg bg-white p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#ffe08a] text-neutral-950">
                <item.icon size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="m-0 text-lg font-black">{item.title}</h2>
                <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{item.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-4 rounded-lg bg-[#eff7e8] p-5">
          <h2 className="m-0 text-2xl font-black">{t.featureTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.text} className="grid grid-cols-[2.5rem_1fr] items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f7f4ed] text-neutral-800">
                  <feature.icon size={19} aria-hidden="true" />
                </span>
                <p className="m-0 text-sm font-black text-neutral-800">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3 rounded-lg bg-white p-5 shadow-sm">
            <h2 className="m-0 text-2xl font-black">{t.workflowTitle}</h2>
            {[t.step1, t.step2, t.step3].map((step, index) => (
              <div key={step} className="grid grid-cols-[2.25rem_1fr] items-start gap-3 rounded-lg bg-[#f7f4ed] p-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-950 text-sm font-black text-white">{index + 1}</span>
                <p className="m-0 text-sm font-semibold leading-6 text-neutral-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-lg bg-[#fff3c4] p-5 shadow-sm">
            <h2 className="m-0 text-2xl font-black">{t.audienceTitle}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {audiences.map((audience) => (
                <div key={audience} className="flex min-h-14 items-center gap-3 rounded-lg bg-white px-3 text-sm font-black text-neutral-800 shadow-sm">
                  <Check className="shrink-0 text-emerald-700" size={18} aria-hidden="true" />
                  <span>{audience}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

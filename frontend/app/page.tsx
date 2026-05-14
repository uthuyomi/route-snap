"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  Check,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  Hammer,
  HeartPulse,
  HelpCircle,
  HomeIcon,
  LocateFixed,
  MapPinned,
  MonitorDown,
  Navigation,
  Package,
  Route,
  ScanText,
  Share2,
  Smartphone,
  Sparkles,
  Truck,
  Wrench
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppHeader, AppLocale } from "./components/AppHeader";
import { LegalFooter } from "./components/LegalFooter";
import { usePreferredLocale } from "./lib/locale";

type InstallStatus = "idle" | "ready" | "installed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const messages = {
  ja: {
    topLine: "配送・訪問業務の移動時間を削減",
    eyebrow: "配送・訪問・現場業務向け",
    title: "紙の住所を、最短ルートへ。",
    lead: "伝票・メモ・スクリーンショットから住所を自動抽出。そのままGoogle Mapsでルート開始できます。",
    primary: "住所を読み取る",
    secondary: "訪問ルートを作成",
    startTitle: "ここから使えます",
    startLead: "1件だけなら住所読み取り。複数件を回るなら訪問ルート作成へ。",
    startSingleNote: "伝票・メモを撮ってすぐ確認",
    startBatchNote: "複数の訪問先をまとめて整理",
    ctaNote1: "無料で試せます",
    ctaNote2: "インストール不要",
    installTitle: "アプリのように使えます",
    installLead: "ホーム画面に追加すると、すぐ開けます。",
    install: "ホーム画面に追加",
    installed: "アプリを開く",
    manual: "ホーム画面に追加",
    installHow: "インストール方法を見る",
    desktopHint: "インストール画面が自動で出ない場合は、Chrome / Edge のアドレスバー右側にあるインストールボタン、またはメニューの「アプリをインストール」から追加できます。",
    desktopStep1: "Chrome / Edgeでこのページを開く",
    desktopStep2: "アドレスバー右側のインストールボタンを押す",
    desktopStep3: "表示された確認画面でインストールを選択",
    share: "共有",
    homeScreen: "ホーム画面",
    trust1: "画像から読み取る",
    trust2: "CSVを読み込む",
    trust3: "現在地から開始",
    demoTitle: "今日の訪問先",
    demoAddress1: "東京都新宿区西新宿2-8-1",
    demoAddress2: "東京都渋谷区渋谷2-21-1",
    demoAddress3: "東京都港区芝公園4-2-8",
    demoMeta1: "読み取り完了 ・ 8分",
    demoMeta2: "読み取り完了 ・ 12分",
    demoMeta3: "読み取り完了 ・ 18分",
    demoNote: "現在地から自動で並び替え",
    flow1: "写真を追加",
    flow2: "AIが住所を抽出",
    flow3: "移動順を整理",
    flow4: "Mapsへルート送信",
    compareTitle: "住所読み取りとルート作成の違い",
    compareLead: "1件をすぐ地図で開くなら住所読み取り。複数件を回るならルート作成です。",
    compareSingleTitle: "住所読み取り",
    compareSingleTag: "1件向け",
    compareSingleText: "写真から住所を抜き出し、確認してGoogle Mapsで開きます。",
    compareSingleUse1: "伝票1枚をすぐナビしたい",
    compareSingleUse2: "メモの住所を手入力せず確認したい",
    compareSingleUse3: "読み取り結果をその場で修正したい",
    compareBatchTitle: "ルート作成",
    compareBatchTag: "複数件向け",
    compareBatchText: "複数の訪問先をまとめ、移動しやすい順に整理します。",
    compareBatchUse1: "今日の訪問先をまとめて回りたい",
    compareBatchUse2: "CSVや画像から複数住所を取り込みたい",
    compareBatchUse3: "現在地から効率よく回る順番を作りたい",
    singleTitle: "撮った住所をすぐ確認",
    singleText: "伝票やメモを撮影。住所だけを抜き出して、その場で修正できます。",
    batchTitle: "訪問先をまとめて整理",
    batchText: "CSVや画像から複数住所を取り込み、移動しやすい順に並べます。",
    routeTitle: "Google Mapsへ即連携",
    routeText: "現在地を出発地点にして、確認済みの住所をそのままルート化します。",
    actualTitle: "実際の使い方",
    actual1Title: "伝票・メモ・画像を追加",
    actual1Text: "スマホで撮影した写真や、保存済み画像を追加します。",
    actual2Title: "AIが住所を抽出",
    actual2Text: "住所、建物名、訪問先らしい情報を読み取ります。",
    actual3Title: "読み取り結果を確認・修正",
    actual3Text: "誤読や不足があれば、出発前にその場で直せます。",
    actual4Title: "Google Mapsでルート開始",
    actual4Text: "単発の目的地や複数訪問のルートを地図で開きます。",
    featureTitle: "できること",
    feature1Title: "写真から住所を読み取り",
    feature1Text: "紙の住所を手入力せず確認できます。",
    feature2Title: "複数の訪問先をまとめて整理",
    feature2Text: "配送先や訪問先を一覧で扱えます。",
    feature3Title: "現在地からルート開始",
    feature3Text: "出発地点を現在地にして地図へ連携します。",
    feature4Title: "CSV/TXTから一括取り込み",
    feature4Text: "既存の訪問リストをまとめて追加できます。",
    feature5Title: "Google Mapsへ直接連携",
    feature5Text: "確認した住所をすぐ地図で開けます。",
    feature6Title: "スマホ・PCどちらでも利用可能",
    feature6Text: "現場ではスマホ、事務所ではPCで使えます。",
    audienceTitle: "こんな現場に",
    audience1: "軽貨物・配送",
    audience2: "営業訪問",
    audience3: "訪問介護",
    audience4: "点検・保守",
    audience5: "清掃・現場作業",
    audience6: "出張サービス",
    audience7: "不動産巡回",
    audience8: "設備管理",
    faqTitle: "よくある質問",
    faq1Q: "配送以外でも使えますか？",
    faq1A: "はい。営業訪問、点検、訪問介護、清掃、保守など、住所を扱う現場業務で利用できます。",
    faq2Q: "AIの読み取り結果は必ず正確ですか？",
    faq2A: "いいえ。住所の読み取り結果は必ず利用者が確認・修正してから利用してください。",
    faq3Q: "Google Mapsと連携できますか？",
    faq3A: "はい。読み取った住所や整理した訪問先をGoogle Mapsで開けるようにします。",
    faq4Q: "スマホで使えますか？",
    faq4A: "はい。ブラウザ上で利用でき、スマホ・PCの両方に対応します。",
    faqLink: "FAQをもっと見る"
  },
  en: {
    topLine: "Reduce travel time for delivery and field visits",
    eyebrow: "For delivery, visits, and field operations",
    title: "Turn paper addresses into the shortest route.",
    lead: "Automatically extract addresses from slips, notes, and screenshots. Start routes directly in Google Maps.",
    primary: "Read addresses",
    secondary: "Create visit route",
    startTitle: "Start here",
    startLead: "Use Address Reader for one stop. Use Route Planner for multiple visits.",
    startSingleNote: "Capture a slip or note and review it fast",
    startBatchNote: "Organize multiple stops into a route",
    ctaNote1: "Free to try",
    ctaNote2: "No install required",
    installTitle: "Use it like an app",
    installLead: "Add it to your home screen and open it fast.",
    install: "Add to home screen",
    installed: "Open app",
    manual: "Add to home screen",
    installHow: "Show install steps",
    desktopHint: "If the install dialog does not open automatically, use the install button in the Chrome / Edge address bar, or the browser menu's install app action.",
    desktopStep1: "Open this page in Chrome / Edge",
    desktopStep2: "Click the install button in the address bar",
    desktopStep3: "Choose Install in the confirmation dialog",
    share: "Share",
    homeScreen: "Home Screen",
    trust1: "Read from images",
    trust2: "Import CSV",
    trust3: "Start from current location",
    demoTitle: "Today's visits",
    demoAddress1: "Shinjuku, Tokyo",
    demoAddress2: "Shibuya, Tokyo",
    demoAddress3: "Shiba Park, Tokyo",
    demoMeta1: "Read complete - 8 min",
    demoMeta2: "Read complete - 12 min",
    demoMeta3: "Read complete - 18 min",
    demoNote: "Reordered from your current location",
    flow1: "Add photo",
    flow2: "AI extracts address",
    flow3: "Sort visit order",
    flow4: "Send route to Maps",
    compareTitle: "Address Reader vs Route Planner",
    compareLead: "Use Address Reader for one destination. Use Route Planner when you have multiple stops.",
    compareSingleTitle: "Address Reader",
    compareSingleTag: "For one stop",
    compareSingleText: "Extract one address from a photo, review it, and open it in Google Maps.",
    compareSingleUse1: "Navigate from one slip right away",
    compareSingleUse2: "Avoid typing an address from a note",
    compareSingleUse3: "Fix the extracted result on the spot",
    compareBatchTitle: "Route Planner",
    compareBatchTag: "For multiple stops",
    compareBatchText: "Collect many destinations and sort them into a practical visit order.",
    compareBatchUse1: "Visit today's stops efficiently",
    compareBatchUse2: "Import multiple addresses from CSV or images",
    compareBatchUse3: "Create an order from your current location",
    singleTitle: "Check captured addresses",
    singleText: "Take a photo of a slip or memo. Extract the address and edit it on the spot.",
    batchTitle: "Organize visit lists",
    batchText: "Import many stops from CSV or images, then sort them into a practical route.",
    routeTitle: "Open Google Maps fast",
    routeText: "Use your current location as the start and route confirmed addresses immediately.",
    actualTitle: "How it works",
    actual1Title: "Add slips, notes, or images",
    actual1Text: "Upload saved images or take photos on your phone.",
    actual2Title: "AI extracts addresses",
    actual2Text: "Reads address-like text, place names, and stop information.",
    actual3Title: "Review and correct results",
    actual3Text: "Fix recognition errors before you leave.",
    actual4Title: "Start in Google Maps",
    actual4Text: "Open one destination or a multi-stop route in Maps.",
    featureTitle: "What it handles",
    feature1Title: "Read addresses from photos",
    feature1Text: "Reduce manual entry from paper slips.",
    feature2Title: "Organize multiple stops",
    feature2Text: "Handle delivery and visit lists together.",
    feature3Title: "Start from current location",
    feature3Text: "Send routes to Maps from where you are.",
    feature4Title: "Bulk import CSV/TXT",
    feature4Text: "Add existing stop lists at once.",
    feature5Title: "Connect directly to Google Maps",
    feature5Text: "Open confirmed addresses quickly.",
    feature6Title: "Use mobile or desktop",
    feature6Text: "Use phone in the field and PC at the office.",
    audienceTitle: "Built for",
    audience1: "Local delivery",
    audience2: "Sales visits",
    audience3: "Home care",
    audience4: "Inspection and maintenance",
    audience5: "Cleaning and field work",
    audience6: "On-site services",
    audience7: "Property rounds",
    audience8: "Facility management",
    faqTitle: "FAQ",
    faq1Q: "Can I use it outside delivery?",
    faq1A: "Yes. It works for sales visits, inspections, home care, cleaning, maintenance, and other address-based field work.",
    faq2Q: "Are AI results always accurate?",
    faq2A: "No. Always review and correct extracted addresses before using them.",
    faq3Q: "Does it work with Google Maps?",
    faq3A: "Yes. It opens extracted addresses and organized stops in Google Maps.",
    faq4Q: "Can I use it on mobile?",
    faq4A: "Yes. It runs in the browser and supports both mobile and desktop.",
    faqLink: "View full FAQ"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function surfaceCardClass(extra = "") {
  return `rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${extra}`;
}

function InstallPanel({ locale }: { locale: AppLocale }) {
  const t = messages[locale];
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installStatus, setInstallStatus] = useState<InstallStatus>(() => (isStandaloneDisplay() ? "installed" : "idle"));
  const [isAppleDevice] = useState(() => isAppleTouchDevice());
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      installPromptRef.current = event as BeforeInstallPromptEvent;
      setInstallStatus("ready");
    }

    function onAppInstalled() {
      installPromptRef.current = null;
      setInstallStatus("installed");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function installApp() {
    if (installStatus === "installed") {
      window.location.assign("/");
      return;
    }

    if (installPromptRef.current) {
      const prompt = installPromptRef.current;
      installPromptRef.current = null;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setInstallStatus(choice.outcome === "accepted" ? "installed" : "idle");
      return;
    }

    if (!isAppleDevice) {
      setInstallStatus(isStandaloneDisplay() ? "installed" : "idle");
      setShowInstallHelp(true);
    }
  }

  const label = installStatus === "installed" ? t.installed : isAppleDevice ? t.manual : t.install;
  const canAct = installStatus === "ready" || installStatus === "installed";

  return (
    <div className={surfaceCardClass("grid gap-3 bg-white/90 p-4")}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-900 text-white">
          {isAppleDevice ? <Smartphone size={20} aria-hidden="true" /> : <MonitorDown size={20} aria-hidden="true" />}
        </span>
        <div>
          <h2 className="m-0 text-base font-black text-neutral-950">{t.installTitle}</h2>
          <p className="m-0 mt-1 text-sm font-semibold leading-5 text-neutral-600">{t.installLead}</p>
        </div>
      </div>
      <button
        className={[
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition active:scale-[0.98]",
          canAct ? "bg-emerald-900 text-white hover:bg-emerald-800" : "bg-white text-neutral-950 ring-1 ring-neutral-300 hover:bg-neutral-50"
        ].join(" ")}
        type="button"
        onClick={installApp}
      >
        <span>{label}</span>
        {installStatus === "installed" ? <ExternalLink size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
      </button>
      {showInstallHelp && !canAct && !isAppleDevice ? (
        <details className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold leading-5 text-neutral-600">
          <summary className="cursor-pointer font-black text-neutral-800">{t.installHow}</summary>
          <p className="m-0 mt-2">{t.desktopHint}</p>
          <ol className="m-0 mt-2 grid list-decimal gap-1 pl-4">
            <li>{t.desktopStep1}</li>
            <li>{t.desktopStep2}</li>
            <li>{t.desktopStep3}</li>
          </ol>
        </details>
      ) : null}
      {isAppleDevice && installStatus !== "installed" ? (
        <div className="grid grid-cols-2 gap-2 text-xs font-black text-neutral-700">
          <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50">
            <Share2 size={16} aria-hidden="true" />
            <span>{t.share}</span>
          </div>
          <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50">
            <HomeIcon size={16} aria-hidden="true" />
            <span>{t.homeScreen}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = usePreferredLocale();
  const t = messages[locale];

  const flow = [
    { icon: Camera, text: t.flow1 },
    { icon: ScanText, text: t.flow2 },
    { icon: Sparkles, text: t.flow3 },
    { icon: Navigation, text: t.flow4 }
  ];

  const visits = [
    { address: t.demoAddress1, meta: t.demoMeta1 },
    { address: t.demoAddress2, meta: t.demoMeta2 },
    { address: t.demoAddress3, meta: t.demoMeta3 }
  ];

  const compareCards = [
    {
      href: "/single",
      icon: ScanText,
      title: t.compareSingleTitle,
      tag: t.compareSingleTag,
      text: t.compareSingleText,
      items: [t.compareSingleUse1, t.compareSingleUse2, t.compareSingleUse3]
    },
    {
      href: "/batch",
      icon: Route,
      title: t.compareBatchTitle,
      tag: t.compareBatchTag,
      text: t.compareBatchText,
      items: [t.compareBatchUse1, t.compareBatchUse2, t.compareBatchUse3]
    }
  ];

  const actualSteps = [
    { icon: Camera, title: t.actual1Title, text: t.actual1Text },
    { icon: Sparkles, title: t.actual2Title, text: t.actual2Text },
    { icon: ClipboardCheck, title: t.actual3Title, text: t.actual3Text },
    { icon: Navigation, title: t.actual4Title, text: t.actual4Text }
  ];

  const features = [
    { icon: Camera, title: t.feature1Title, text: t.feature1Text },
    { icon: Route, title: t.feature2Title, text: t.feature2Text },
    { icon: LocateFixed, title: t.feature3Title, text: t.feature3Text },
    { icon: FileText, title: t.feature4Title, text: t.feature4Text },
    { icon: Navigation, title: t.feature5Title, text: t.feature5Text },
    { icon: MonitorDown, title: t.feature6Title, text: t.feature6Text }
  ];

  const audiences = [
    { icon: Package, text: t.audience1 },
    { icon: BriefcaseBusiness, text: t.audience2 },
    { icon: HeartPulse, text: t.audience3 },
    { icon: Wrench, text: t.audience4 },
    { icon: Hammer, text: t.audience5 },
    { icon: Truck, text: t.audience6 },
    { icon: MapPinned, text: t.audience7 },
    { icon: ClipboardCheck, text: t.audience8 }
  ];

  const faqs = [
    [t.faq1Q, t.faq1A],
    [t.faq2Q, t.faq2A],
    [t.faq3Q, t.faq3A],
    [t.faq4Q, t.faq4A]
  ];

  return (
    <main className="min-h-svh bg-[#f4f1e9] px-4 py-4 text-neutral-950 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <AppHeader locale={locale} currentPage="home" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="grid gap-5">
              <div className="grid gap-3">
                <p className="m-0 text-sm font-black text-emerald-900">{t.topLine}</p>
                <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-900 px-3 py-2 text-xs font-black text-white shadow-sm">
                  <MapPinned size={15} aria-hidden="true" />
                  {t.eyebrow}
                </div>
                <h1 className="m-0 max-w-3xl text-4xl font-black leading-tight text-neutral-950 sm:text-5xl lg:text-6xl">{t.title}</h1>
                <p className="m-0 max-w-2xl text-base font-semibold leading-7 text-neutral-600 sm:text-lg">{t.lead}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-black text-emerald-900">
                {[t.ctaNote1, t.ctaNote2, t.trust3].map((item) => (
                  <span key={item} className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">{item}</span>
                ))}
              </div>

              <div className="grid gap-3 rounded-2xl border border-emerald-200 bg-[#f0fbf4] p-4 shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Start</p>
                    <h2 className="m-0 mt-1 text-2xl font-black leading-tight text-neutral-950">{t.startTitle}</h2>
                  </div>
                  <p className="m-0 max-w-sm text-sm font-bold leading-6 text-neutral-600">{t.startLead}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link className="group grid min-h-32 gap-3 rounded-xl bg-emerald-900 p-4 text-white shadow-md shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg active:scale-[0.98]" href="/single">
                    <span className="flex items-center justify-between gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
                        <ScanText size={24} aria-hidden="true" />
                      </span>
                      <ArrowRight className="transition group-hover:translate-x-1" size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xl font-black">{t.primary}</span>
                      <span className="mt-1 block text-sm font-semibold leading-5 text-emerald-50/85">{t.startSingleNote}</span>
                    </span>
                  </Link>
                  <Link className="group grid min-h-32 gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-emerald-950 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-emerald-50 hover:shadow-md active:scale-[0.98]" href="/batch">
                    <span className="flex items-center justify-between gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-900">
                        <Route size={24} aria-hidden="true" />
                      </span>
                      <ArrowRight className="transition group-hover:translate-x-1" size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xl font-black">{t.secondary}</span>
                      <span className="mt-1 block text-sm font-semibold leading-5 text-neutral-600">{t.startBatchNote}</span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[t.trust1, t.trust2, t.trust3].map((item) => (
                  <div key={item} className="grid min-h-14 place-items-center rounded-lg border border-neutral-200 bg-[#fbfaf6] px-2 py-2 text-center text-xs font-black leading-4 text-neutral-800 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>

              <div className="grid gap-2 rounded-lg border border-neutral-200 bg-[#fbfaf6] p-3 shadow-sm sm:grid-cols-4">
                {flow.map((item, index) => (
                  <div key={item.text} className="relative grid min-h-24 place-items-center gap-2 rounded-lg bg-white p-3 text-center shadow-sm">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-900">
                      <item.icon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-black leading-5 text-neutral-800">{item.text}</span>
                    <span className="absolute left-2 top-2 text-[10px] font-black tabular-nums text-neutral-400">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 rounded-lg bg-[#dceee4] p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Image className="h-12 w-12 rounded-lg object-cover" src="/image/icon/route-snap.png" alt="Route Snap" width={48} height={48} priority />
                    <div>
                      <p className="m-0 text-sm font-black text-neutral-950">{t.demoTitle}</p>
                      <p className="m-0 text-xs font-bold text-neutral-500">{t.demoNote}</p>
                    </div>
                  </div>
                  <Navigation className="text-emerald-800" size={22} aria-hidden="true" />
                </div>

                {visits.map((visit, index) => (
                  <div key={visit.address} className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-900 text-sm font-black text-white">{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-neutral-900">{visit.address}</span>
                      <span className="mt-0.5 block truncate text-xs font-bold text-neutral-500">{visit.meta}</span>
                    </span>
                    <Check className="text-emerald-700" size={18} aria-hidden="true" />
                  </div>
                ))}

                <Link className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-emerald-900 p-3 text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md" href="/batch">
                  <span className="text-sm font-black">{t.secondary}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <InstallPanel locale={locale} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-neutral-200">
          <div className="grid gap-2">
            <h2 className="m-0 text-2xl font-black">{t.compareTitle}</h2>
            <p className="m-0 text-sm font-semibold leading-6 text-neutral-600">{t.compareLead}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {compareCards.map((card) => (
              <Link key={card.title} href={card.href} className="grid gap-4 rounded-lg border border-neutral-200 bg-[#fbfaf6] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700 hover:bg-emerald-50 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-900 text-white">
                      <card.icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="m-0 text-lg font-black leading-6">{card.title}</h3>
                      <p className="m-0 mt-1 text-sm font-semibold leading-5 text-neutral-600">{card.text}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-black text-emerald-900 ring-1 ring-emerald-200">{card.tag}</span>
                </div>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {card.items.map((item) => (
                    <li key={item} className="grid grid-cols-[1.5rem_1fr] items-start gap-2 text-sm font-bold leading-5 text-neutral-700">
                      <Check className="mt-0.5 text-emerald-700" size={17} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-lg bg-[#eaf4ed] p-5">
          <h2 className="m-0 text-2xl font-black">{t.actualTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actualSteps.map((step, index) => (
              <article key={step.title} className="relative grid min-h-40 gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="absolute right-3 top-3 text-xs font-black tabular-nums text-neutral-300">STEP {index + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-900 text-white">
                  <step.icon size={21} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="m-0 text-base font-black leading-6">{step.title}</h3>
                  <p className="m-0 mt-1 text-sm font-semibold leading-5 text-neutral-600">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            { icon: ScanText, title: t.singleTitle, text: t.singleText },
            { icon: Route, title: t.batchTitle, text: t.batchText },
            { icon: Navigation, title: t.routeTitle, text: t.routeText }
          ].map((item) => (
            <article key={item.title} className={surfaceCardClass("grid min-h-44 grid-rows-[auto_1fr] gap-3")}>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-900 text-white">
                <item.icon size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="m-0 text-lg font-black leading-6">{item.title}</h2>
                <p className="m-0 mt-2 text-sm font-semibold leading-5 text-neutral-600">{item.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-4 rounded-lg bg-[#eaf4ed] p-5">
          <h2 className="m-0 text-2xl font-black">{t.featureTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="grid min-h-24 grid-cols-[2.75rem_1fr] items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#f5f2ea] text-emerald-900">
                  <feature.icon size={21} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="m-0 text-sm font-black leading-5 text-neutral-950">{feature.title}</h3>
                  <p className="m-0 mt-1 text-sm font-semibold leading-5 text-neutral-600">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 rounded-lg bg-[#fff3c4] p-5 shadow-sm">
          <h2 className="m-0 text-2xl font-black">{t.audienceTitle}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <div key={audience.text} className="flex min-h-12 items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-black text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-900">
                  <audience.icon size={18} aria-hidden="true" />
                </span>
                <span>{audience.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-neutral-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HelpCircle size={22} aria-hidden="true" />
              <h2 className="m-0 text-2xl font-black">{t.faqTitle}</h2>
            </div>
            <Link className="secondary-action" href="/faq">{t.faqLink}</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <article key={question} className="rounded-lg border border-neutral-200 bg-[#fbfaf6] p-4">
                <h3 className="m-0 text-sm font-black text-neutral-950">{question}</h3>
                <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <LegalFooter locale={locale} />
      </div>
    </main>
  );
}

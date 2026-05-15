"use client";

import { createClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  Camera,
  CreditCard,
  FileText,
  Home,
  LogIn,
  MapPinned,
  Navigation,
  Route,
  ScanText,
  ShieldCheck,
  Sparkles,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { usePreferredLocale } from "../lib/locale";

const messages = {
  ja: {
    eyebrow: "操作トップ",
    title: "操作を選択",
    lead: "1件なら住所読み取り。複数件なら訪問ルート作成へ進めます。",
    singleTitle: "住所読み取り",
    singleText: "伝票・メモ・スクリーンショットから1件の住所を抜き出して、Google Mapsで開きます。",
    singleAction: "住所読み取りを開く",
    batchTitle: "訪問ルート作成",
    batchText: "画像、CSV、TXTから複数の訪問先を取り込み、移動しやすい順に整理します。",
    batchAction: "訪問ルート作成を開く",
    account: "アカウント",
    accountText: "利用量、現在のプラン、支払い管理を確認できます。",
    login: "ログイン",
    loginText: "無料枠を超えて使う場合や有料プランの申し込みに使います。",
    pricing: "料金を見る",
    intro: "紹介トップへ",
    introText: "機能説明や利用シーンを確認する場合はこちら。",
    flowTitle: "基本の流れ",
    flow1: "画像やファイルを追加",
    flow2: "住所を確認・修正",
    flow3: "必要なら順番を整理",
    flow4: "Google Mapsで開く",
    loggedIn: "ログイン中",
    loggedOut: "未ログイン",
    ready: "すぐ使えます"
  },
  en: {
    eyebrow: "App Home",
    title: "Choose Tool",
    lead: "Use Address Reader for one stop. Use Route Planner for multiple stops.",
    singleTitle: "Address Reader",
    singleText: "Extract one address from a slip, note, or screenshot and open it in Google Maps.",
    singleAction: "Open Address Reader",
    batchTitle: "Route Planner",
    batchText: "Import multiple stops from images, CSV, or TXT and organize them into a practical order.",
    batchAction: "Open Route Planner",
    account: "Account",
    accountText: "Check usage, your current plan, and billing management.",
    login: "Log in",
    loginText: "Use this for paid plans or when you need more than the free allowance.",
    pricing: "View pricing",
    intro: "Intro page",
    introText: "Review features and example use cases.",
    flowTitle: "Basic Flow",
    flow1: "Add images or files",
    flow2: "Review and edit addresses",
    flow3: "Sort the order if needed",
    flow4: "Open in Google Maps",
    loggedIn: "Logged in",
    loggedOut: "Logged out",
    ready: "Ready to use"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function actionCardClass(primary = false) {
  return [
    "group grid min-h-64 gap-5 rounded-lg border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
    primary
      ? "border-emerald-900 bg-emerald-900 text-white"
      : "border-neutral-200 bg-white/90 text-neutral-950 hover:border-emerald-600 hover:bg-emerald-50"
  ].join(" ");
}

function roundActionClass(primary = false) {
  return [
    "grid h-14 w-14 place-items-center rounded-full transition group-hover:scale-105 active:scale-95",
    primary ? "bg-white text-emerald-950" : "bg-emerald-900 text-white"
  ].join(" ");
}

export default function AppHomePage() {
  const [locale, setLocale] = usePreferredLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const t = messages[locale];

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setIsLoggedIn(Boolean(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const flow = [
    { icon: Camera, text: t.flow1 },
    { icon: ShieldCheck, text: t.flow2 },
    { icon: Sparkles, text: t.flow3 },
    { icon: Navigation, text: t.flow4 }
  ];

  return (
    <main className="app-surface min-h-svh px-4 py-4 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5">
        <AppHeader locale={locale} currentPage="app" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <section className="grid gap-5 rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-neutral-200/80 md:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3">
            <p className="app-eyebrow">
              <MapPinned size={14} aria-hidden="true" />
              <span className="ml-1">{t.eyebrow}</span>
            </p>
            <h1 className="m-0 max-w-3xl text-3xl font-black leading-tight text-neutral-950 sm:text-5xl">{t.title}</h1>
            <p className="m-0 max-w-2xl text-base font-semibold leading-7 text-neutral-600">{t.lead}</p>
          </div>
          <div className="grid min-w-52 gap-2 rounded-lg bg-neutral-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-black">
              {isLoggedIn ? <UserCircle size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
              <span>{isLoggedIn ? t.loggedIn : t.loggedOut}</span>
            </div>
            <p className="m-0 text-sm font-semibold text-neutral-200">{t.ready}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Link className={actionCardClass(true)} href="/single" aria-label={t.singleAction} title={t.singleAction}>
            <span className="flex items-start justify-between gap-4">
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-white/15">
                <ScanText size={42} aria-hidden="true" />
              </span>
              <span className={roundActionClass(true)}>
                <ArrowRight size={26} aria-hidden="true" />
              </span>
            </span>
            <span className="grid gap-2">
              <span className="text-2xl font-black">{t.singleTitle}</span>
              <span className="max-w-xl text-sm font-semibold leading-6 text-emerald-50">{t.singleText}</span>
            </span>
          </Link>

          <Link className={actionCardClass()} href="/batch" aria-label={t.batchAction} title={t.batchAction}>
            <span className="flex items-start justify-between gap-4">
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-emerald-50 text-emerald-900">
                <Route size={42} aria-hidden="true" />
              </span>
              <span className={roundActionClass()}>
                <ArrowRight size={26} aria-hidden="true" />
              </span>
            </span>
            <span className="grid gap-2">
              <span className="text-2xl font-black">{t.batchTitle}</span>
              <span className="max-w-xl text-sm font-semibold leading-6 text-neutral-600">{t.batchText}</span>
            </span>
          </Link>
        </section>

        <section className="grid gap-3 rounded-lg bg-white/90 p-4 shadow-sm ring-1 ring-neutral-200 md:grid-cols-4">
          {flow.map((item, index) => (
            <div key={item.text} className="grid min-h-28 gap-3 rounded-lg border border-neutral-200 bg-[#fbfaf6] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-900 text-white">
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <span className="text-xs font-black tabular-nums text-neutral-400">0{index + 1}</span>
              </div>
              <p className="m-0 text-sm font-black leading-5 text-neutral-800">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Link className="secondary-action min-h-16 px-4" href={isLoggedIn ? "/account" : "/login?next=/app"} aria-label={isLoggedIn ? t.account : t.login} title={isLoggedIn ? t.account : t.login}>
            {isLoggedIn ? <UserCircle size={24} aria-hidden="true" /> : <LogIn size={24} aria-hidden="true" />}
            <span className="sr-only">{isLoggedIn ? t.account : t.login}</span>
          </Link>
          <Link className="secondary-action min-h-16 px-4" href="/pricing" aria-label={t.pricing} title={t.pricing}>
            <CreditCard size={24} aria-hidden="true" />
            <span className="sr-only">{t.pricing}</span>
          </Link>
          <Link className="secondary-action min-h-16 px-4" href="/?landing=1" aria-label={t.intro} title={t.intro}>
            <Home size={24} aria-hidden="true" />
            <span className="sr-only">{t.intro}</span>
          </Link>
        </section>

        <section className="grid gap-3 rounded-lg bg-[#fff3c4] p-4 text-sm font-semibold leading-6 text-neutral-700 md:grid-cols-3">
          <p className="m-0">
            <FileText className="mr-2 inline-block align-[-3px] text-emerald-900" size={18} aria-hidden="true" />
            {isLoggedIn ? t.accountText : t.loginText}
          </p>
          <p className="m-0 md:col-span-2">
            <Home className="mr-2 inline-block align-[-3px] text-emerald-900" size={18} aria-hidden="true" />
            {t.introText}
          </p>
        </section>
      </div>
    </main>
  );
}

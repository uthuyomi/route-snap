"use client";

import { createClient } from "@supabase/supabase-js";
import { ArrowRight, CreditCard, Globe2, LogIn, MapPinned, Route, ScanText, UserCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppHeader, type AppLocale } from "../components/AppHeader";
import { usePreferredLocale } from "../lib/locale";

const messages = {
  ja: {
    title: "操作",
    singleTitle: "住所読み取り",
    batchTitle: "ルート作成",
    singleAria: "住所読み取りを開く",
    batchAria: "ルート作成を開く",
    account: "アカウント",
    login: "ログイン",
    pricing: "料金",
    siteTop: "サイトトップ",
    loggedIn: "ログイン中",
    loggedOut: "未ログイン",
  },
  en: {
    title: "Tools",
    singleTitle: "Address reader",
    batchTitle: "Route planner",
    singleAria: "Open address reader",
    batchAria: "Open route planner",
    account: "Account",
    login: "Log in",
    pricing: "Pricing",
    siteTop: "Site top",
    loggedIn: "Logged in",
    loggedOut: "Logged out",
  },
} satisfies Record<AppLocale, Record<string, string>>;

function toolCardClass(primary = false) {
  return [
    "group grid min-h-56 content-between gap-6 rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]",
    primary
      ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
      : "border-blue-100 bg-white/90 text-[#071936] hover:border-blue-300 hover:bg-blue-50",
  ].join(" ");
}

function toolIconClass(primary = false) {
  return [
    "grid h-20 w-20 place-items-center rounded-3xl transition group-hover:scale-105",
    primary ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600",
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

  const accountHref = isLoggedIn ? "/account" : "/login?next=/app";

  return (
    <main className="app-surface min-h-svh px-3 py-3 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <AppHeader locale={locale} currentPage="app" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <section className="app-panel flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <MapPinned size={24} aria-hidden="true" />
            </span>
            <h1 className="m-0 text-xl font-black text-[#071936] sm:text-2xl">{t.title}</h1>
          </div>
          <span className="app-eyebrow">{isLoggedIn ? t.loggedIn : t.loggedOut}</span>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link className={toolCardClass(true)} href="/single" aria-label={t.singleAria} title={t.singleAria}>
            <span className="flex items-start justify-between gap-4">
              <span className={toolIconClass(true)}>
                <ScanText size={42} aria-hidden="true" />
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                <ArrowRight size={24} aria-hidden="true" />
              </span>
            </span>
            <span className="text-2xl font-black">{t.singleTitle}</span>
          </Link>

          <Link className={toolCardClass()} href="/batch" aria-label={t.batchAria} title={t.batchAria}>
            <span className="flex items-start justify-between gap-4">
              <span className={toolIconClass()}>
                <Route size={42} aria-hidden="true" />
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
                <ArrowRight size={24} aria-hidden="true" />
              </span>
            </span>
            <span className="text-2xl font-black">{t.batchTitle}</span>
          </Link>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Link className="secondary-action min-h-16 px-4" href={accountHref} aria-label={isLoggedIn ? t.account : t.login} title={isLoggedIn ? t.account : t.login}>
            {isLoggedIn ? <UserCircle size={24} aria-hidden="true" /> : <LogIn size={24} aria-hidden="true" />}
            <span className="sr-only">{isLoggedIn ? t.account : t.login}</span>
          </Link>
          <Link className="secondary-action min-h-16 px-4" href="/pricing" aria-label={t.pricing} title={t.pricing}>
            <CreditCard size={24} aria-hidden="true" />
            <span className="sr-only">{t.pricing}</span>
          </Link>
          <Link className="secondary-action min-h-16 px-4" href="/?landing=1" aria-label={t.siteTop} title={t.siteTop}>
            <Globe2 size={24} aria-hidden="true" />
            <span className="sr-only">{t.siteTop}</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

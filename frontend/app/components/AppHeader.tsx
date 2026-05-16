"use client";

import { createClient, type User } from "@supabase/supabase-js";
import { CreditCard, Globe2, Home, LogIn, LogOut, MapPinned, Menu, Route, ScanText, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { LogoutControl } from "./LogoutControl";

export type AppLocale = "ja" | "en";
type AppPage = "home" | "app" | "single" | "batch" | "pricing";

type AppHeaderProps = {
  locale: AppLocale;
  currentPage: AppPage;
  onToggleLocale?: () => void;
};

const labels = {
  ja: {
    app: "アプリ操作",
    siteTop: "トップページ",
    single: "住所読み取り",
    batch: "ルート作成",
    pricing: "料金ページ",
    login: "ログイン",
    account: "アカウント",
    logout: "ログアウト",
    menu: "メニュー",
    close: "閉じる",
  },
  en: {
    app: "App",
    siteTop: "Site top",
    single: "Address reader",
    batch: "Route planner",
    pricing: "Pricing",
    login: "Log in",
    account: "Account",
    logout: "Log out",
    menu: "Menu",
    close: "Close",
  },
} satisfies Record<AppLocale, Record<string, string>>;

function getAccountName(user: User | null) {
  if (!user) return "";
  const metadataName = user.user_metadata?.name || user.user_metadata?.full_name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email ?? "アカウント";
}

function iconButtonClass(active = false) {
  return [
    "grid h-11 w-11 place-items-center rounded-xl border text-sm font-bold shadow-sm transition active:scale-[0.97]",
    active
      ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
      : "border-blue-100 bg-white/90 text-[#071936] hover:border-blue-300 hover:bg-blue-50",
  ].join(" ");
}

function menuItemClass(active = false, featured = false) {
  return [
    "flex min-h-12 items-center justify-between gap-4 rounded-xl border px-4 text-sm font-black shadow-sm transition active:scale-[0.98]",
    active
      ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
      : featured
        ? "border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-300"
        : "border-blue-100 bg-white text-[#071936] hover:border-blue-300 hover:bg-blue-50",
  ].join(" ");
}

export function AppHeader({ locale, currentPage }: AppHeaderProps) {
  const t = labels[locale];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isActive) setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const isLoggedIn = Boolean(user);
  const accountName = getAccountName(user);
  const accountHref = isLoggedIn ? "/account/status" : `/login?next=${currentPage === "single" ? "/single" : currentPage === "batch" ? "/batch" : "/app"}`;
  const canUseDom = typeof document !== "undefined";
  const menu = canUseDom && isMenuOpen
    ? createPortal(
        <div className="fixed inset-0 z-[2147483647]" role="presentation">
          <button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/10" type="button" aria-label={t.close} onClick={() => setIsMenuOpen(false)} />
          <nav className="absolute right-4 top-20 grid w-[min(19rem,calc(100vw-2rem))] gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.28)] ring-1 ring-blue-50" aria-label={t.menu}>
            <Link className={menuItemClass(currentPage === "home")} href="/?landing=1" onClick={() => setIsMenuOpen(false)}>
              <span>{t.siteTop}</span>
              <Globe2 size={18} aria-hidden="true" />
            </Link>
            <Link className={menuItemClass(currentPage === "app", true)} href="/app" onClick={() => setIsMenuOpen(false)}>
              <span>{t.app}</span>
              <Home size={18} aria-hidden="true" />
            </Link>
            <Link className={menuItemClass(currentPage === "pricing")} href="/pricing" onClick={() => setIsMenuOpen(false)}>
              <span>{t.pricing}</span>
              <CreditCard size={18} aria-hidden="true" />
            </Link>
          </nav>
        </div>,
        document.body
      )
    : null;

  return (
    <header className="relative flex items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-white/90 p-2 shadow-[0_18px_50px_rgba(37,99,235,0.10)] backdrop-blur">
      <Link className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-600/20" href="/app" aria-label={t.app} title={t.app}>
        <MapPinned size={24} aria-hidden="true" />
      </Link>

      <nav className="flex min-w-0 items-center gap-2" aria-label="App">
        <Link className={iconButtonClass(currentPage === "single")} href="/single" aria-label={t.single} title={t.single}>
          <ScanText size={20} aria-hidden="true" />
        </Link>
        <Link className={iconButtonClass(currentPage === "batch")} href="/batch" aria-label={t.batch} title={t.batch}>
          <Route size={20} aria-hidden="true" />
        </Link>
        {isLoggedIn ? (
          <>
            <Link className="hidden h-11 max-w-52 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-black text-[#071936] shadow-sm transition hover:border-blue-300 sm:inline-flex" href="/account/status" aria-label={t.account} title={accountName}>
              <UserCircle className="shrink-0 text-blue-600" size={20} aria-hidden="true" />
              <span className="truncate">{accountName}</span>
            </Link>
            <Link className={`${iconButtonClass()} sm:hidden`} href="/account/status" aria-label={accountName} title={accountName}>
              <UserCircle size={20} aria-hidden="true" />
            </Link>
            <LogoutControl className={`${iconButtonClass()} disabled:opacity-60`} label={t.logout}>
              <LogOut size={19} aria-hidden="true" />
            </LogoutControl>
          </>
        ) : (
          <Link className={iconButtonClass()} href={accountHref} aria-label={t.login} title={t.login}>
            <LogIn size={20} aria-hidden="true" />
          </Link>
        )}
        <button
          className={iconButtonClass(isMenuOpen)}
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? t.close : t.menu}
          title={isMenuOpen ? t.close : t.menu}
        >
          {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {menu}
    </header>
  );
}

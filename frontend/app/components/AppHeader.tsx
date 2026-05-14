"use client";

import { createClient } from "@supabase/supabase-js";
import { MapPinned, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type AppLocale = "ja" | "en";
type AppPage = "home" | "single" | "batch" | "pricing";

type AppHeaderProps = {
  locale: AppLocale;
  currentPage: AppPage;
  onToggleLocale?: () => void;
};

const labels = {
  ja: {
    subtitle: "住所を読み取り、そのままルートへ",
    home: "トップ",
    single: "住所を読み取る",
    batch: "訪問ルートを作成",
    pricing: "料金",
    login: "ログイン",
    account: "アカウント",
    logout: "ログアウト",
    paid: "有料",
    faq: "FAQ",
    contact: "お問い合わせ",
    terms: "利用規約",
    privacy: "プライバシー",
    tokusho: "特商法",
    language: "言語を切り替え",
    menu: "メニュー",
    close: "閉じる",
  },
  en: {
    subtitle: "Read addresses and turn them into routes",
    home: "Home",
    single: "Address Reader",
    batch: "Route Planner",
    pricing: "Pricing",
    login: "Log in",
    account: "Account",
    logout: "Log out",
    paid: "Paid",
    faq: "FAQ",
    contact: "Contact",
    terms: "Terms",
    privacy: "Privacy",
    tokusho: "Disclosure",
    language: "Change language",
    menu: "Menu",
    close: "Close",
  },
} satisfies Record<AppLocale, Record<string, string>>;

function navClass(active: boolean) {
  return [
    "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
    active
      ? "border-neutral-950 bg-neutral-950 text-white"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50",
  ].join(" ");
}

function menuItemClass(active = false, featured = false) {
  if (active) {
    return "flex min-h-12 items-center justify-between gap-4 rounded-lg border border-emerald-900 bg-emerald-900 px-4 text-sm font-black text-white shadow-sm transition active:scale-[0.98]";
  }

  if (featured) {
    return "flex min-h-12 items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-950 transition hover:border-emerald-500 hover:bg-emerald-100 active:scale-[0.98]";
  }

  return "flex min-h-12 items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-800 transition hover:border-neutral-500 hover:bg-neutral-50 active:scale-[0.98]";
}

function appActionClass(primary = false) {
  if (primary) {
    return "flex min-h-14 items-center justify-between gap-4 rounded-xl border border-emerald-900 bg-emerald-900 px-4 text-sm font-black text-white shadow-sm shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md active:scale-[0.98]";
  }

  return "flex min-h-14 items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-950 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-md active:scale-[0.98]";
}

export function AppHeader({ locale, currentPage, onToggleLocale }: AppHeaderProps) {
  const t = labels[locale];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);
  const menuNav = [
    { href: "/", label: t.home },
    { href: "/pricing", label: t.pricing },
    { href: "/faq", label: t.faq },
    { href: "/contact", label: t.contact },
    { href: "/legal/terms", label: t.terms },
    { href: "/legal/privacy", label: t.privacy },
    { href: "/legal/tokusho", label: t.tokusho },
  ];

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

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white p-3 shadow-sm">
      <Link className="inline-flex min-w-0 items-center gap-3" href="/" aria-label="Route Snap">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white shadow-sm">
          <MapPinned size={22} aria-hidden="true" />
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block text-lg font-bold leading-6 text-neutral-950">Route Snap</span>
          <span className="block truncate text-xs font-semibold text-neutral-500">{t.subtitle}</span>
        </span>
      </Link>

      <button
        className={navClass(isMenuOpen)}
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? t.close : t.menu}
        title={isMenuOpen ? t.close : t.menu}
      >
        {isMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
        <span>{isMenuOpen ? t.close : t.menu}</span>
      </button>

      {isMenuOpen ? (
        <div className="absolute right-3 top-[calc(100%+0.5rem)] z-20 grid w-[min(20rem,calc(100vw-2rem))] gap-2 rounded-lg border border-neutral-300 bg-white p-3 shadow-lg">
          <nav className="grid gap-2" aria-label="Route Snap">
            <div className="grid gap-2 rounded-xl bg-emerald-950/5 p-2 ring-1 ring-emerald-100">
              <Link className={appActionClass(true)} href="/single" onClick={() => setIsMenuOpen(false)}>
                <span>{t.single}</span>
                <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-black">START</span>
              </Link>
              <Link className={appActionClass(false)} href="/batch" onClick={() => setIsMenuOpen(false)}>
                <span>{t.batch}</span>
                <span className="rounded-lg bg-emerald-900/10 px-2 py-1 text-[10px] font-black">{t.paid}</span>
              </Link>
            </div>
            {menuNav.map((item) => (
              <Link key={item.href} className={menuItemClass(item.href === "/" && currentPage === "home")} href={item.href} onClick={() => setIsMenuOpen(false)}>
                <span>{item.label}</span>
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link className={menuItemClass(false, true)} href="/account" onClick={() => setIsMenuOpen(false)}>
                  <span>{t.account}</span>
                </Link>
                <Link className={menuItemClass(false)} href="/logout" onClick={() => setIsMenuOpen(false)}>
                  <span>{t.logout}</span>
                </Link>
              </>
            ) : (
              <Link className={menuItemClass(false, true)} href="/login" onClick={() => setIsMenuOpen(false)}>
                <span>{t.login}</span>
              </Link>
            )}
          </nav>

          {onToggleLocale ? (
            <button className={menuItemClass(false)} type="button" onClick={onToggleLocale} aria-label={t.language} title={t.language}>
              <span>{locale === "ja" ? "日本語" : "English"}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

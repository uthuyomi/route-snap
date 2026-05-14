"use client";

import { MapPinned, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
    single: "住所読み取り",
    batch: "ルート作成",
    pricing: "料金",
    account: "アカウント",
    paid: "有料",
    language: "言語を切り替え",
    menu: "メニュー",
    close: "閉じる"
  },
  en: {
    subtitle: "Read addresses and turn them into routes",
    home: "Home",
    single: "Address Reader",
    batch: "Route Planner",
    pricing: "Pricing",
    account: "Account",
    paid: "Paid",
    language: "Change language",
    menu: "Menu",
    close: "Close"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function navClass(active: boolean) {
  return [
    "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
    active
      ? "border-neutral-950 bg-neutral-950 text-white"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
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

export function AppHeader({ locale, currentPage, onToggleLocale }: AppHeaderProps) {
  const t = labels[locale];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link className={menuItemClass(currentPage === "home")} href="/" onClick={() => setIsMenuOpen(false)}>
              <span>{t.home}</span>
            </Link>
            <Link className={menuItemClass(currentPage === "single", true)} href="/single" onClick={() => setIsMenuOpen(false)}>
              <span>{t.single}</span>
            </Link>
            <Link className={menuItemClass(currentPage === "batch", true)} href="/batch" onClick={() => setIsMenuOpen(false)}>
              <span>{t.batch}</span>
              <span className="rounded bg-current/10 px-1.5 py-0.5 text-[10px] font-black">{t.paid}</span>
            </Link>
            <Link className={menuItemClass(currentPage === "pricing")} href="/pricing" onClick={() => setIsMenuOpen(false)}>
              <span>{t.pricing}</span>
            </Link>
            <Link className={menuItemClass(false)} href="/account" onClick={() => setIsMenuOpen(false)}>
              <span>{t.account}</span>
            </Link>
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

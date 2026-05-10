"use client";

import { Languages, MapPinned, Route, ScanText } from "lucide-react";
import Link from "next/link";

export type AppLocale = "ja" | "en";
type AppPage = "home" | "single" | "batch";

type AppHeaderProps = {
  locale: AppLocale;
  currentPage: AppPage;
  onToggleLocale: () => void;
};

const labels = {
  ja: {
    subtitle: "撮影した住所をそのままルートへ",
    home: "トップ",
    single: "単発",
    batch: "複数",
    paid: "有料",
    language: "言語を切り替え"
  },
  en: {
    subtitle: "Turn captured addresses into routes",
    home: "Home",
    single: "Single",
    batch: "Batch",
    paid: "Paid",
    language: "Change language"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function navClass(active: boolean) {
  return [
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
    active
      ? "border-neutral-950 bg-neutral-950 text-white"
      : "border-neutral-300 bg-white text-neutral-800 shadow-sm hover:border-neutral-400 hover:bg-neutral-50"
  ].join(" ");
}

export function AppHeader({ locale, currentPage, onToggleLocale }: AppHeaderProps) {
  const t = labels[locale];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link className="inline-flex min-w-0 items-center gap-3" href="/" aria-label="Route Snap">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white shadow-sm">
          <MapPinned size={22} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-6 text-neutral-950">Route Snap</span>
          <span className="block truncate text-xs font-medium text-neutral-500">{t.subtitle}</span>
        </span>
      </Link>

      <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2" aria-label="Route Snap">
        <Link className={navClass(currentPage === "home")} href="/">
          {t.home}
        </Link>
        <Link className={navClass(currentPage === "single")} href="/single">
          <ScanText size={17} aria-hidden="true" />
          <span>{t.single}</span>
        </Link>
        <Link className={navClass(currentPage === "batch")} href="/batch">
          <Route size={17} aria-hidden="true" />
          <span>{t.batch}</span>
          <span className="hidden rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-black sm:inline">{t.paid}</span>
        </Link>
        <button className={navClass(false)} type="button" onClick={onToggleLocale} aria-label={t.language} title={t.language}>
          <Languages size={18} aria-hidden="true" />
          <span>{locale.toUpperCase()}</span>
        </button>
      </nav>
    </header>
  );
}

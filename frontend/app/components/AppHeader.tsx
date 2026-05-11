"use client";

import { Home, Languages, MapPinned, Route, ScanText } from "lucide-react";
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
    "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
    active
      ? "border-neutral-950 bg-neutral-950 text-white"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
  ].join(" ");
}

export function AppHeader({ locale, currentPage, onToggleLocale }: AppHeaderProps) {
  const t = labels[locale];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white p-3 shadow-sm">
      <Link className="inline-flex min-w-0 items-center gap-3" href="/" aria-label="Route Snap">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white shadow-sm">
          <MapPinned size={22} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-6 text-neutral-950">Route Snap</span>
          <span className="block truncate text-xs font-medium text-neutral-500">{t.subtitle}</span>
        </span>
      </Link>

      <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2 sm:justify-end" aria-label="Route Snap">
        <Link className={navClass(currentPage === "home")} href="/" aria-label={t.home} title={t.home}>
          <Home size={17} aria-hidden="true" />
          <span className="sr-only">{t.home}</span>
        </Link>
        <Link className={navClass(currentPage === "single")} href="/single" aria-label={t.single} title={t.single}>
          <ScanText size={17} aria-hidden="true" />
          <span className="sr-only">{t.single}</span>
        </Link>
        <Link className={navClass(currentPage === "batch")} href="/batch" aria-label={`${t.batch} ${t.paid}`} title={`${t.batch} ${t.paid}`}>
          <Route size={17} aria-hidden="true" />
          <span className="sr-only">{t.batch}</span>
          <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        </Link>
        <button className={navClass(false)} type="button" onClick={onToggleLocale} aria-label={t.language} title={t.language}>
          <Languages size={18} aria-hidden="true" />
          <span>{locale.toUpperCase()}</span>
        </button>
      </nav>
    </header>
  );
}

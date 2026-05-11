"use client";

import { Download, ExternalLink, Home, HomeIcon, Languages, MapPinned, Menu, MonitorDown, Route, ScanText, Share2, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type AppLocale = "ja" | "en";
type AppPage = "home" | "single" | "batch";
type InstallTarget = "desktop" | "mobile";
type InstallStatus = "idle" | "ready" | "installed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

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
    language: "言語を切り替え",
    menu: "メニュー",
    close: "閉じる",
    install: "端末に保存",
    desktop: "PC",
    mobile: "スマホ",
    installed: "保存済み",
    ready: "保存",
    manual: "共有",
    launch: "起動",
    share: "共有",
    homeScreen: "ホーム"
  },
  en: {
    subtitle: "Turn captured addresses into routes",
    home: "Home",
    single: "Single",
    batch: "Batch",
    paid: "Paid",
    language: "Change language",
    menu: "Menu",
    close: "Close",
    install: "Save to device",
    desktop: "Desktop",
    mobile: "Mobile",
    installed: "Saved",
    ready: "Save",
    manual: "Share",
    launch: "Launch",
    share: "Share",
    homeScreen: "Home"
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

function menuItemClass(active = false) {
  return [
    "grid h-12 grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-lg border px-2 text-sm font-bold transition active:scale-[0.98]",
    active ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500 hover:bg-neutral-50"
  ].join(" ");
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function currentPath(currentPage: AppPage) {
  if (currentPage === "home") return "/";
  return `/${currentPage}`;
}

export function AppHeader({ locale, currentPage, onToggleLocale }: AppHeaderProps) {
  const t = labels[locale];
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installStatus, setInstallStatus] = useState<InstallStatus>(() => (isStandaloneDisplay() ? "installed" : "idle"));
  const [isAppleDevice] = useState(() => isAppleTouchDevice());

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
      window.location.assign(currentPath(currentPage));
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
    }
  }

  function installLabel(target: InstallTarget) {
    const targetLabel = target === "mobile" ? t.mobile : t.desktop;
    const statusLabel = installStatus === "installed" ? t.launch : isAppleDevice && target === "mobile" ? t.manual : t.ready;
    return `${targetLabel} ${statusLabel}`;
  }

  function renderInstallButton(target: InstallTarget) {
    const Icon = target === "mobile" ? Smartphone : MonitorDown;
    const label = installLabel(target);
    const canAct = installStatus === "ready" || installStatus === "installed" || (isAppleDevice && target === "mobile");

    return (
      <button
        className={[
          "grid h-12 grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-lg border px-2 text-sm font-bold transition active:scale-[0.98]",
          canAct ? "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500 hover:bg-neutral-50" : "border-neutral-200 bg-neutral-100 text-neutral-400"
        ].join(" ")}
        type="button"
        onClick={installApp}
        aria-label={label}
        title={label}
      >
        <Icon size={18} aria-hidden="true" />
        <span className="truncate text-left">{target === "mobile" ? t.mobile : t.desktop}</span>
        {installStatus === "installed" ? <ExternalLink size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
      </button>
    );
  }

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white p-3 shadow-sm">
      <Link className="inline-flex min-w-0 items-center gap-3" href="/" aria-label="Route Snap">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white shadow-sm">
          <MapPinned size={22} aria-hidden="true" />
        </span>
        <span className="min-w-0 hidden sm:block">
          <span className="block text-lg font-bold leading-6 text-neutral-950">Route Snap</span>
          <span className="sr-only">{t.subtitle}</span>
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
      </button>

      {isMenuOpen ? (
        <div className="absolute right-3 top-[calc(100%+0.5rem)] z-20 grid w-[min(20rem,calc(100vw-2rem))] gap-2 rounded-lg border border-neutral-300 bg-white p-3 shadow-lg">
          <nav className="grid gap-2" aria-label="Route Snap">
            <Link className={menuItemClass(currentPage === "home")} href="/" onClick={() => setIsMenuOpen(false)}>
              <Home size={18} aria-hidden="true" />
              <span>{t.home}</span>
              <span />
            </Link>
            <Link className={menuItemClass(currentPage === "single")} href="/single" onClick={() => setIsMenuOpen(false)}>
              <ScanText size={18} aria-hidden="true" />
              <span>{t.single}</span>
              <span />
            </Link>
            <Link className={menuItemClass(currentPage === "batch")} href="/batch" onClick={() => setIsMenuOpen(false)}>
              <Route size={18} aria-hidden="true" />
              <span>{t.batch}</span>
              <span className="rounded bg-current/10 px-1.5 py-0.5 text-[10px] font-black">{t.paid}</span>
            </Link>
          </nav>

          <div className="grid gap-2 border-t border-neutral-200 pt-2">
            {renderInstallButton("desktop")}
            {renderInstallButton("mobile")}
            {isAppleDevice && installStatus !== "installed" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="grid h-11 place-items-center rounded-lg border border-neutral-300 bg-neutral-50" title={t.share}>
                  <Share2 size={18} aria-hidden="true" />
                  <span className="sr-only">{t.share}</span>
                </div>
                <div className="grid h-11 place-items-center rounded-lg border border-neutral-300 bg-neutral-50" title={t.homeScreen}>
                  <HomeIcon size={18} aria-hidden="true" />
                  <span className="sr-only">{t.homeScreen}</span>
                </div>
              </div>
            ) : null}
          </div>

          <button className={menuItemClass(false)} type="button" onClick={onToggleLocale} aria-label={t.language} title={t.language}>
            <Languages size={18} aria-hidden="true" />
            <span>{locale.toUpperCase()}</span>
            <span />
          </button>
        </div>
      ) : null}
    </header>
  );
}

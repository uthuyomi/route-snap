"use client";

import {
  Bot,
  Camera,
  Check,
  Download,
  ExternalLink,
  HomeIcon,
  Languages,
  Loader2,
  MapPinned,
  MonitorDown,
  Navigation,
  RefreshCw,
  RotateCcw,
  ScanText,
  Share2,
  Smartphone,
  XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Locale = "ja" | "en";
type InstallTarget = "desktop" | "mobile";
type InstallStatus = "idle" | "ready" | "installed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type AddressResult = {
  raw_text: string;
  normalized_address: string;
  confidence: number;
  notes: string[];
};

type InstallActionProps = {
  target: InstallTarget;
  t: Record<string, string>;
  installStatus: InstallStatus;
  isAppleDevice: boolean;
  onInstall: () => void;
  onLaunch: () => void;
};

const messages = {
  ja: {
    subtitle: "住所を撮影してナビへ",
    badge: "AI OCR",
    installTitle: "端末に保存",
    installed: "インストール済み",
    desktopInstall: "PC版",
    mobileInstall: "スマホ版",
    launch: "起動",
    installReady: "追加できます",
    installManual: "共有から追加",
    iosHint: "共有",
    homeHint: "ホーム",
    capture: "住所を撮影",
    analyze: "整形",
    analyzing: "解析中",
    retake: "再撮影",
    reset: "リセット",
    destination: "目的地",
    destinationPlaceholder: "AIで整形した住所が入ります",
    openMaps: "Mapsで開く",
    autoOpen: "自動起動",
    confidence: "信頼度",
    status: "状態",
    needsCheck: "要確認",
    read: "読取",
    parseFailed: "住所を読み取れませんでした",
    unknownError: "不明なエラーが発生しました",
    imageAlt: "撮影した住所画像",
    photoAria: "住所を撮影",
    analyzeAria: "AIで住所を整形",
    retakeAria: "撮り直し",
    resetAria: "リセット",
    mapsAria: "Google Mapsで開く",
    autoAria: "整形後にGoogle Mapsを開く",
    installAria: "Route Snapを端末に保存",
    launchAria: "Route Snapを起動"
  },
  en: {
    subtitle: "Snap an address, start navigation",
    badge: "AI OCR",
    installTitle: "Save to device",
    installed: "Installed",
    desktopInstall: "Desktop",
    mobileInstall: "Mobile",
    launch: "Launch",
    installReady: "Ready",
    installManual: "Use share",
    iosHint: "Share",
    homeHint: "Home",
    capture: "Capture address",
    analyze: "Format",
    analyzing: "Reading",
    retake: "Retake",
    reset: "Reset",
    destination: "Destination",
    destinationPlaceholder: "Formatted address appears here",
    openMaps: "Open Maps",
    autoOpen: "Auto open",
    confidence: "Confidence",
    status: "Status",
    needsCheck: "Check",
    read: "Read",
    parseFailed: "Could not read the address",
    unknownError: "An unknown error occurred",
    imageAlt: "Captured address image",
    photoAria: "Capture address",
    analyzeAria: "Format address with AI",
    retakeAria: "Retake photo",
    resetAria: "Reset",
    mapsAria: "Open in Google Maps",
    autoAria: "Open Google Maps after formatting",
    installAria: "Save Route Snap to this device",
    launchAria: "Launch Route Snap"
  }
} satisfies Record<Locale, Record<string, string>>;

function buildMapsUrl(address: string) {
  const destination = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

function iconButtonClass(active = true) {
  return [
    "inline-flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition active:scale-[0.98]",
    active
      ? "border-neutral-300 bg-white text-neutral-900 shadow-sm hover:border-neutral-400 hover:bg-neutral-50"
      : "border-neutral-200 bg-neutral-100 text-neutral-400"
  ].join(" ");
}

function getInitialLocale(): Locale {
  if (typeof navigator === "undefined") return "ja";
  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function InstallAction({ target, t, installStatus, isAppleDevice, onInstall, onLaunch }: InstallActionProps) {
  const isMobile = target === "mobile";
  const Icon = isMobile ? Smartphone : MonitorDown;
  const label = isMobile ? t.mobileInstall : t.desktopInstall;
  const readyText =
    installStatus === "installed" ? t.installed : installStatus === "ready" ? t.installReady : isAppleDevice && isMobile ? t.installManual : t.installReady;
  const canPrompt = installStatus === "ready" || installStatus === "installed" || (isAppleDevice && isMobile);

  return (
    <div className="grid min-w-0 grid-cols-[2.75rem_1fr_auto] items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-neutral-950 text-white">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-neutral-900">{label}</span>
        <span className="block truncate text-xs font-semibold text-neutral-500">{readyText}</span>
      </span>
      <button
        className={[
          "inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-bold transition active:scale-[0.98]",
          canPrompt ? "bg-neutral-950 text-white hover:bg-neutral-800" : "bg-neutral-200 text-neutral-500"
        ].join(" ")}
        type="button"
        onClick={installStatus === "installed" ? onLaunch : onInstall}
        aria-label={installStatus === "installed" ? t.launchAria : t.installAria}
        title={installStatus === "installed" ? t.launchAria : t.installAria}
      >
        {installStatus === "installed" ? <ExternalLink size={18} aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
        <span className="ml-2 hidden sm:inline">{installStatus === "installed" ? t.launch : t.installTitle}</span>
      </button>
    </div>
  );
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AddressResult | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoOpenMaps, setAutoOpenMaps] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installStatus, setInstallStatus] = useState<InstallStatus>(() => (isStandaloneDisplay() ? "installed" : "idle"));
  const [isAppleDevice] = useState(() => isAppleTouchDevice());

  const t = messages[locale];
  const activeAddress = (manualAddress || result?.normalized_address || "").trim();
  const mapsUrl = useMemo(() => (activeAddress ? buildMapsUrl(activeAddress) : ""), [activeAddress]);

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

  function launchApp() {
    window.location.assign("/");
  }

  function resetCapture() {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setManualAddress("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function onPickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setManualAddress("");
    setError(null);
  }

  async function analyzeImage() {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("locale", locale);

      const response = await fetch("/api/parse-address", {
        method: "POST",
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? t.parseFailed);
      }

      setResult(payload);
      setManualAddress(payload.normalized_address ?? "");

      if (autoOpenMaps && payload.normalized_address) {
        window.location.assign(buildMapsUrl(payload.normalized_address));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.unknownError);
    } finally {
      setIsLoading(false);
    }
  }

  function openMaps() {
    if (!mapsUrl) return;
    window.location.assign(mapsUrl);
  }

  return (
    <main className="min-h-svh bg-neutral-100 px-4 py-4 text-neutral-950 sm:px-6 lg:grid lg:grid-cols-[minmax(360px,560px)_minmax(320px,430px)] lg:items-center lg:justify-center lg:gap-8 lg:py-8">
      <section className="mx-auto grid w-full max-w-xl gap-4 lg:m-0" aria-label={t.photoAria}>
        <header className="flex items-center justify-between gap-3">
          <div className="inline-flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white shadow-sm">
              <MapPinned size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="m-0 text-lg font-bold leading-6">Route Snap</h1>
              <p className="m-0 truncate text-xs font-medium text-neutral-500">{t.subtitle}</p>
            </div>
          </div>

          <div className="inline-flex shrink-0 items-center gap-2">
            <Link
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]"
              href="/batch"
              aria-label="複数住所ページを開く"
              title="複数住所ページを開く"
            >
              <Navigation size={18} aria-hidden="true" />
              <span>複数</span>
            </Link>
            <span className="hidden rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 sm:inline-flex">
              {t.badge}
            </span>
            <button
              className={iconButtonClass()}
              type="button"
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              aria-label="Change language"
              title="Change language"
            >
              <Languages size={18} aria-hidden="true" />
              <span>{locale.toUpperCase()}</span>
            </button>
          </div>
        </header>

        <div className="grid gap-2 sm:grid-cols-2" aria-label={t.installAria}>
          <InstallAction target="desktop" t={t} installStatus={installStatus} isAppleDevice={isAppleDevice} onInstall={installApp} onLaunch={launchApp} />
          <InstallAction target="mobile" t={t} installStatus={installStatus} isAppleDevice={isAppleDevice} onInstall={installApp} onLaunch={launchApp} />
          {isAppleDevice && installStatus !== "installed" ? (
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div className="grid h-12 grid-cols-[2.5rem_1fr] items-center rounded-lg border border-neutral-300 bg-neutral-50 px-2 text-xs font-bold text-neutral-600">
                <Share2 size={18} aria-hidden="true" />
                <span className="truncate">{t.iosHint}</span>
              </div>
              <div className="grid h-12 grid-cols-[2.5rem_1fr] items-center rounded-lg border border-neutral-300 bg-neutral-50 px-2 text-xs font-bold text-neutral-600">
                <HomeIcon size={18} aria-hidden="true" />
                <span className="truncate">{t.homeHint}</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm sm:aspect-[4/5] lg:aspect-[4/3]">
          {previewUrl ? (
            <Image className="object-contain" src={previewUrl} alt={t.imageAlt} fill sizes="(min-width: 1024px) 560px, 100vw" unoptimized />
          ) : (
            <button
              className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#fafafa_0%,#f4f4f5_100%)] text-neutral-700 transition hover:bg-neutral-50"
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label={t.photoAria}
              title={t.photoAria}
            >
              <span className="grid place-items-center gap-3">
                <span className="grid h-24 w-24 place-items-center rounded-full border border-neutral-300 bg-white text-neutral-950 shadow-sm">
                  <Camera size={42} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-neutral-600">{t.capture}</span>
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            className="pointer-events-none absolute h-px w-px opacity-0"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickImage}
          />
        </div>

        <div className="grid grid-cols-[1fr_6rem_4rem] gap-2">
          <button
            className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
            type="button"
            onClick={analyzeImage}
            disabled={!imageFile || isLoading}
            aria-label={t.analyzeAria}
            title={t.analyzeAria}
          >
            {isLoading ? <Loader2 className="animate-spin" size={22} aria-hidden="true" /> : <ScanText size={22} aria-hidden="true" />}
            <span>{isLoading ? t.analyzing : t.analyze}</span>
          </button>
          <button className={iconButtonClass()} type="button" onClick={() => inputRef.current?.click()} aria-label={t.retakeAria} title={t.retakeAria}>
            <RefreshCw size={19} aria-hidden="true" />
            <span>{t.retake}</span>
          </button>
          <button className={iconButtonClass()} type="button" onClick={resetCapture} aria-label={t.resetAria} title={t.resetAria}>
            <RotateCcw size={20} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="mx-auto mt-4 grid w-full max-w-xl gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm lg:m-0 lg:max-w-none" aria-label={t.destination}>
        <label className="grid gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
            <Navigation size={17} aria-hidden="true" />
            {t.destination}
          </span>
          <textarea
            className="min-h-28 w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-base leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
            value={manualAddress}
            onChange={(event) => setManualAddress(event.target.value)}
            placeholder={t.destinationPlaceholder}
            rows={3}
            aria-label={t.destination}
          />
        </label>

        <button
          className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
          type="button"
          onClick={openMaps}
          disabled={!activeAddress}
          aria-label={t.mapsAria}
          title={t.mapsAria}
        >
          <ExternalLink size={20} aria-hidden="true" />
          <span>{t.openMaps}</span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <label
            className={[
              "grid h-16 cursor-pointer place-items-center gap-1 rounded-lg border text-xs font-bold transition",
              autoOpenMaps ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-neutral-50 text-neutral-500"
            ].join(" ")}
            aria-label={t.autoAria}
            title={t.autoAria}
          >
            <input className="sr-only" type="checkbox" checked={autoOpenMaps} onChange={(event) => setAutoOpenMaps(event.target.checked)} />
            <Bot size={20} aria-hidden="true" />
            <span>{t.autoOpen}</span>
          </label>

          <div className="grid h-16 place-items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-600" title={t.confidence}>
            <span className="text-sm tabular-nums text-neutral-950">{result ? `${Math.round(result.confidence * 100)}%` : "--"}</span>
            <span>{t.confidence}</span>
          </div>

          <div
            className={[
              "grid h-16 place-items-center gap-1 rounded-lg border text-xs font-bold",
              error ? "border-red-200 bg-red-50 text-red-700" : "border-neutral-300 bg-neutral-50 text-neutral-600"
            ].join(" ")}
            title={error ?? t.status}
          >
            {error ? <XCircle size={20} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
            <span>{error ? t.needsCheck : t.status}</span>
          </div>
        </div>

        {result?.raw_text || result?.notes.length || error ? (
          <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
            {error ? <p className="m-0 text-red-700">{error}</p> : null}
            {result?.raw_text ? (
              <p className="m-0 line-clamp-2">
                {t.read}: {result.raw_text}
              </p>
            ) : null}
            {result?.notes.length ? <p className="m-0 mt-1 text-neutral-500">{result.notes.join(" / ")}</p> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

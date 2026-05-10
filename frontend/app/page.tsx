"use client";

import {
  ArrowDown,
  ArrowUp,
  Bot,
  Camera,
  Check,
  Download,
  ExternalLink,
  HomeIcon,
  Languages,
  ListOrdered,
  Loader2,
  MapPinned,
  MonitorDown,
  Navigation,
  RefreshCw,
  RotateCcw,
  ScanText,
  Share2,
  Smartphone,
  Sparkles,
  Trash2,
  XCircle
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Locale = "ja" | "en";
type InstallTarget = "desktop" | "mobile";
type InstallStatus = "idle" | "ready" | "installed";
type RouteMode = "file" | "ai";
type ItemStatus = "idle" | "reading" | "done" | "error";

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

type RouteItem = {
  id: string;
  file: File;
  previewUrl: string;
  address: string;
  rawText: string;
  confidence: number;
  notes: string[];
  status: ItemStatus;
  error: string;
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
    subtitle: "住所をまとめて撮影してナビへ",
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
    capture: "撮影/ファイル追加",
    analyze: "一括読取",
    analyzing: "読取中",
    optimize: "AI順路",
    optimizing: "最適化中",
    fileOrder: "ファイル順",
    aiOrder: "AI最適",
    retake: "追加",
    reset: "リセット",
    destination: "目的地リスト",
    destinationPlaceholder: "読み取った住所がここに入ります",
    openMaps: "Mapsに一括登録",
    autoOpen: "自動起動",
    confidence: "信頼度",
    status: "状態",
    needsCheck: "要確認",
    read: "読取",
    parseFailed: "住所を読み取れませんでした",
    unknownError: "不明なエラーが発生しました",
    noStops: "住所を追加してください",
    routeNote: "Google Mapsに渡せる経由地数や順路は端末側の仕様に左右されます",
    imageAlt: "撮影した住所画像",
    photoAria: "住所画像を追加",
    analyzeAria: "AIで住所を一括整形",
    retakeAria: "画像を追加",
    resetAria: "リセット",
    mapsAria: "Google Mapsに一括登録",
    autoAria: "整形後にGoogle Mapsを開く",
    installAria: "Route Snapを端末に保存",
    launchAria: "Route Snapを起動"
  },
  en: {
    subtitle: "Batch addresses, then start navigation",
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
    capture: "Add photos/files",
    analyze: "Read batch",
    analyzing: "Reading",
    optimize: "AI route",
    optimizing: "Optimizing",
    fileOrder: "File order",
    aiOrder: "AI optimized",
    retake: "Add",
    reset: "Reset",
    destination: "Stops",
    destinationPlaceholder: "Formatted addresses appear here",
    openMaps: "Add all to Maps",
    autoOpen: "Auto open",
    confidence: "Confidence",
    status: "Status",
    needsCheck: "Check",
    read: "Read",
    parseFailed: "Could not read the address",
    unknownError: "An unknown error occurred",
    noStops: "Add addresses first",
    routeNote: "Google Maps waypoint limits and route behavior depend on the device",
    imageAlt: "Captured address image",
    photoAria: "Add address images",
    analyzeAria: "Format addresses with AI",
    retakeAria: "Add images",
    resetAria: "Reset",
    mapsAria: "Add all stops to Google Maps",
    autoAria: "Open Google Maps after formatting",
    installAria: "Save Route Snap to this device",
    launchAria: "Launch Route Snap"
  }
} satisfies Record<Locale, Record<string, string>>;

function buildMapsUrl(addresses: string[]) {
  const stops = addresses.map((address) => address.trim()).filter(Boolean);
  if (stops.length === 0) return "";
  if (stops.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stops[0])}&travelmode=driving`;
  }

  const params = new URLSearchParams({
    api: "1",
    origin: stops[0],
    destination: stops[stops.length - 1],
    travelmode: "driving"
  });
  const waypoints = stops.slice(1, -1);
  if (waypoints.length) {
    params.set("waypoints", waypoints.join("|"));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
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
  const [items, setItems] = useState<RouteItem[]>([]);
  const [routeMode, setRouteMode] = useState<RouteMode>("file");
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOpenMaps, setAutoOpenMaps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeNotes, setRouteNotes] = useState<string[]>([]);
  const [installStatus, setInstallStatus] = useState<InstallStatus>(() => (isStandaloneDisplay() ? "installed" : "idle"));
  const [isAppleDevice] = useState(() => isAppleTouchDevice());

  const t = messages[locale];
  const addresses = items.map((item) => item.address).filter(Boolean);
  const mapsUrl = useMemo(() => buildMapsUrl(addresses), [addresses]);
  const completedCount = items.filter((item) => item.status === "done" && item.address).length;
  const averageConfidence = completedCount
    ? Math.round((items.reduce((sum, item) => sum + (item.address ? item.confidence : 0), 0) / completedCount) * 100)
    : null;

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
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setRouteNotes([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function onPickImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const nextItems = files.map((file, index): RouteItem => ({
      id: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      address: "",
      rawText: "",
      confidence: 0,
      notes: [],
      status: "idle",
      error: ""
    }));

    setItems((current) => [...current, ...nextItems]);
    setRouteNotes([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function updateItem(id: string, patch: Partial<RouteItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((current) => {
      const item = current.find((candidate) => candidate.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((candidate) => candidate.id !== id);
    });
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setRouteMode("file");
  }

  async function analyzeBatch() {
    if (!items.length) {
      setError(t.noStops);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRouteNotes([]);

    for (const item of items) {
      updateItem(item.id, { status: "reading", error: "" });
      try {
        const formData = new FormData();
        formData.append("image", item.file);
        formData.append("locale", locale);

        const response = await fetch("/api/parse-address", {
          method: "POST",
          body: formData
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail ?? t.parseFailed);
        }

        const result = payload as AddressResult;
        updateItem(item.id, {
          address: result.normalized_address ?? "",
          rawText: result.raw_text ?? "",
          confidence: result.confidence ?? 0,
          notes: result.notes ?? [],
          status: "done",
          error: ""
        });
      } catch (caught) {
        updateItem(item.id, {
          status: "error",
          error: caught instanceof Error ? caught.message : t.unknownError
        });
      }
    }

    setIsLoading(false);
    if (autoOpenMaps) {
      setTimeout(() => openMaps(), 100);
    }
  }

  async function optimizeRoute() {
    const stops = items
      .map((item, index) => ({ index, address: item.address.trim() }))
      .filter((stop) => stop.address);

    if (stops.length < 2) {
      setError(t.noStops);
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stops, locale })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? t.unknownError);
      }

      const order = (payload.ordered_indices as number[]).filter((index) => index >= 0 && index < items.length);
      const orderedIds = new Set(order.map((index) => items[index].id));
      const optimized = order.map((index) => items[index]).concat(items.filter((item) => !orderedIds.has(item.id)));
      setItems(optimized);
      setRouteMode("ai");
      setRouteNotes(payload.notes ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.unknownError);
    } finally {
      setIsOptimizing(false);
    }
  }

  function openMaps() {
    const url = buildMapsUrl(items.map((item) => item.address));
    if (!url) {
      setError(t.noStops);
      return;
    }
    window.location.assign(url);
  }

  return (
    <main className="min-h-svh bg-neutral-100 px-4 py-4 text-neutral-950 sm:px-6 lg:grid lg:grid-cols-[minmax(380px,580px)_minmax(340px,500px)] lg:items-start lg:justify-center lg:gap-8 lg:py-8">
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

        <div className="relative overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm">
          <button
            className="grid min-h-72 w-full place-items-center bg-[linear-gradient(135deg,#fafafa_0%,#f4f4f5_100%)] p-5 text-neutral-700 transition hover:bg-neutral-50"
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={t.photoAria}
            title={t.photoAria}
          >
            <span className="grid place-items-center gap-3 text-center">
              <span className="grid h-24 w-24 place-items-center rounded-full border border-neutral-300 bg-white text-neutral-950 shadow-sm">
                <Camera size={42} aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-neutral-700">{t.capture}</span>
              <span className="text-xs font-semibold text-neutral-400">{items.length} files</span>
            </span>
          </button>
          <input
            ref={inputRef}
            className="pointer-events-none absolute h-px w-px opacity-0"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={onPickImages}
          />
        </div>

        <div className="grid grid-cols-[1fr_7rem_4rem] gap-2">
          <button
            className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
            type="button"
            onClick={analyzeBatch}
            disabled={!items.length || isLoading}
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

        {items.length ? (
          <div className="grid gap-2">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 shadow-sm">
                <span className="relative h-14 w-14 overflow-hidden rounded-md bg-neutral-100">
                  <Image src={item.previewUrl} alt={t.imageAlt} fill sizes="56px" className="object-cover" unoptimized />
                </span>
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-bold text-neutral-900">
                    {index + 1}. {item.file.name}
                  </p>
                  <p className="m-0 truncate text-xs font-semibold text-neutral-500">
                    {item.status === "reading" ? t.analyzing : item.address || item.error || t.destinationPlaceholder}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button className={iconButtonClass(index > 0)} type="button" onClick={() => moveItem(item.id, -1)} disabled={index === 0} aria-label="Move up">
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button className={iconButtonClass(index < items.length - 1)} type="button" onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1} aria-label="Move down">
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button className="col-span-2 inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700" type="button" onClick={() => removeItem(item.id)} aria-label="Remove">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto mt-4 grid w-full max-w-xl gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm lg:m-0 lg:max-w-none" aria-label={t.destination}>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={["inline-flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-bold", routeMode === "file" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-neutral-50 text-neutral-700"].join(" ")}
            type="button"
            onClick={() => setRouteMode("file")}
          >
            <ListOrdered size={18} aria-hidden="true" />
            {t.fileOrder}
          </button>
          <button
            className={["inline-flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-bold", routeMode === "ai" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-neutral-50 text-neutral-700"].join(" ")}
            type="button"
            onClick={optimizeRoute}
            disabled={isOptimizing || addresses.length < 2}
          >
            {isOptimizing ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
            {isOptimizing ? t.optimizing : t.optimize}
          </button>
        </div>

        <label className="grid gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
            <Navigation size={17} aria-hidden="true" />
            {t.destination}
          </span>
          <textarea
            className="min-h-40 w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-base leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
            value={addresses.join("\n")}
            onChange={(event) => {
              const nextAddresses = event.target.value.split("\n");
              setItems((current) => current.map((item, index) => ({ ...item, address: nextAddresses[index] ?? "" })));
            }}
            placeholder={t.destinationPlaceholder}
            rows={6}
            aria-label={t.destination}
          />
        </label>

        <button
          className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
          type="button"
          onClick={openMaps}
          disabled={!mapsUrl}
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
            <span className="text-sm tabular-nums text-neutral-950">{averageConfidence == null ? "--" : `${averageConfidence}%`}</span>
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

        <p className="m-0 text-xs font-semibold leading-5 text-neutral-500">{t.routeNote}</p>

        {routeNotes.length || error || items.some((item) => item.rawText || item.notes.length) ? (
          <div className="grid gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
            {error ? <p className="m-0 text-red-700">{error}</p> : null}
            {routeNotes.length ? <p className="m-0 text-neutral-600">{routeNotes.join(" / ")}</p> : null}
            {items.map((item, index) =>
              item.rawText || item.notes.length ? (
                <p className="m-0 line-clamp-2" key={item.id}>
                  {index + 1}. {t.read}: {item.rawText || item.notes.join(" / ")}
                </p>
              ) : null
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

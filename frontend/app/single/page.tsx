"use client";

import {
  Bot,
  Camera,
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Navigation,
  RotateCcw,
  ScanText,
  XCircle
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { prepareImageForUpload } from "../lib/imageUpload";
import { usePreferredLocale } from "../lib/locale";
import { buildSingleMapsUrl, getCurrentPosition } from "../lib/maps";

type AddressResult = {
  raw_text: string;
  normalized_address: string;
  confidence: number;
  notes: string[];
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
    chooseImage: "画像を選択",
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
    libraryAria: "スマホ内の画像から選択",
    analyzeAria: "AIで住所を整形",
    retakeAria: "撮り直し",
    resetAria: "リセット",
    mapsAria: "Google Mapsで開く",
    autoAria: "整形後にGoogle Mapsを開く",
    installAria: "Route Snapを端末に保存",
    launchAria: "Route Snapを起動",
    capturePanel: "1. 撮影",
    confirmPanel: "2. 確認して開く",
    captureHelp: "住所が読めるように、宛名や郵便番号より住所部分を大きめに写してください。",
    installHelp: "端末に保存すると、次回からホーム画面やデスクトップから直接開けます。",
    noPhoto: "まだ画像が選択されていません",
    readyPhoto: "画像を選択済み",
    mapsHelp: "住所は開く前に編集できます。建物名や部屋番号を補足しておくとナビ検索が安定します。"
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
    chooseImage: "Choose image",
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
    libraryAria: "Choose an image from this device",
    analyzeAria: "Format address with AI",
    retakeAria: "Retake photo",
    resetAria: "Reset",
    mapsAria: "Open in Google Maps",
    autoAria: "Open Google Maps after formatting",
    installAria: "Save Route Snap to this device",
    launchAria: "Launch Route Snap",
    capturePanel: "1. Capture",
    confirmPanel: "2. Review and Open",
    captureHelp: "Frame the address clearly so the address text is larger than names or postal codes.",
    installHelp: "Save it to your device to open Route Snap from the home screen or desktop.",
    noPhoto: "No image selected yet",
    readyPhoto: "Image selected",
    mapsHelp: "You can edit the address before opening Maps. Adding building names or room numbers improves search accuracy."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function iconButtonClass(active = true) {
  return [
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition active:scale-[0.98] sm:h-12 lg:h-14",
    active
      ? "border-neutral-300 bg-white text-neutral-900 shadow-sm hover:border-neutral-400 hover:bg-neutral-50"
      : "border-neutral-200 bg-neutral-100 text-neutral-400"
  ].join(" ");
}

export default function Home() {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const libraryInputRef = useRef<HTMLInputElement | null>(null);
  const [locale, setLocale] = usePreferredLocale();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AddressResult | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoOpenMaps, setAutoOpenMaps] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = messages[locale];
  const activeAddress = (manualAddress || result?.normalized_address || "").trim();

  function resetCapture() {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setManualAddress("");
    setError(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (libraryInputRef.current) {
      libraryInputRef.current.value = "";
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
      const uploadFile = await prepareImageForUpload(imageFile);
      const formData = new FormData();
      formData.append("image", uploadFile);
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
        openMapsAddress(payload.normalized_address);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.unknownError);
    } finally {
      setIsLoading(false);
    }
  }

  async function openMapsAddress(address: string) {
    const destination = address.trim();
    if (!destination) return;

    const origin = await getCurrentPosition();
    window.location.assign(buildSingleMapsUrl(destination, origin ?? undefined));
  }

  function openMaps() {
    openMapsAddress(activeAddress);
  }

  return (
    <main className="h-svh overflow-hidden bg-neutral-100 px-2 py-2 text-neutral-950 sm:px-3 lg:h-auto lg:min-h-svh lg:overflow-visible lg:px-6 lg:py-8">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_1fr] gap-2 lg:h-auto lg:gap-4">
        <AppHeader locale={locale} currentPage="single" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <div className="grid min-h-0 gap-2 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:gap-4 lg:items-start">
          <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 rounded-lg border border-neutral-300 bg-white p-2 shadow-sm sm:p-3 lg:gap-4 lg:p-4" aria-label={t.photoAria}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="sr-only">{t.capturePanel}</p>
                <h1 className="m-0 text-base font-black leading-tight text-neutral-950 sm:text-lg lg:text-2xl">{t.capture}</h1>
                <p className="sr-only">{t.captureHelp}</p>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-700 sm:h-9 sm:w-9" title={imageFile ? t.readyPhoto : t.noPhoto}>
                {imageFile ? <Check size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
                <span className="sr-only">{imageFile ? t.readyPhoto : t.noPhoto}</span>
              </span>
            </div>

            <div className="relative min-h-0 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 shadow-sm lg:aspect-[4/3]">
              {previewUrl ? (
                <Image className="object-contain" src={previewUrl} alt={t.imageAlt} fill sizes="(min-width: 1024px) 620px, 100vw" unoptimized />
              ) : (
                <button
                  className="grid h-full w-full place-items-center bg-white text-neutral-700 transition hover:bg-neutral-50"
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  aria-label={t.photoAria}
                  title={t.photoAria}
                >
                  <span className="grid grid-cols-2 gap-3">
                    <span className="grid h-16 w-16 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-950 shadow-sm sm:h-20 sm:w-20 lg:h-24 lg:w-24" title={t.photoAria}>
                      <Camera className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                    </span>
                    <span
                      className="grid h-16 w-16 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-950 shadow-sm sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                      role="button"
                      tabIndex={0}
                      title={t.libraryAria}
                      onClick={(event) => {
                        event.stopPropagation();
                        libraryInputRef.current?.click();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          libraryInputRef.current?.click();
                        }
                      }}
                    >
                      <ImagePlus className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                    </span>
                    <span className="sr-only">{t.capture}</span>
                  </span>
                </button>
              )}
              <input
                ref={cameraInputRef}
                className="pointer-events-none absolute h-px w-px opacity-0"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onPickImage}
              />
              <input
                ref={libraryInputRef}
                className="pointer-events-none absolute h-px w-px opacity-0"
                type="file"
                accept="image/*"
                onChange={onPickImage}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none sm:h-12 lg:h-14"
                type="button"
                onClick={analyzeImage}
                disabled={!imageFile || isLoading}
                aria-label={t.analyzeAria}
                title={t.analyzeAria}
              >
                {isLoading ? <Loader2 className="animate-spin" size={22} aria-hidden="true" /> : <ScanText size={22} aria-hidden="true" />}
                <span className="sr-only">{isLoading ? t.analyzing : t.analyze}</span>
              </button>
              <button className={iconButtonClass()} type="button" onClick={() => cameraInputRef.current?.click()} aria-label={t.retakeAria} title={t.retakeAria}>
                <Camera size={19} aria-hidden="true" />
                <span className="sr-only">{t.retake}</span>
              </button>
              <button className={iconButtonClass()} type="button" onClick={() => libraryInputRef.current?.click()} aria-label={t.libraryAria} title={t.libraryAria}>
                <ImagePlus size={19} aria-hidden="true" />
                <span className="sr-only">{t.chooseImage}</span>
              </button>
              <button className={iconButtonClass()} type="button" onClick={resetCapture} aria-label={t.resetAria} title={t.resetAria}>
                <RotateCcw size={20} aria-hidden="true" />
                <span className="sr-only">{t.reset}</span>
              </button>
            </div>

          </section>

          <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto_auto] gap-2 rounded-lg border border-neutral-300 bg-white p-2 shadow-sm sm:p-3 md:sticky md:top-2 lg:top-4 lg:gap-4 lg:p-4" aria-label={t.destination}>
            <div>
              <p className="sr-only">{t.confirmPanel}</p>
              <h2 className="m-0 text-base font-black leading-tight text-neutral-950 sm:text-lg lg:text-2xl">{t.destination}</h2>
              <p className="sr-only">{t.mapsHelp}</p>
            </div>

            <label className="grid min-h-0 grid-rows-[auto_1fr] gap-1">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 sm:text-sm">
                <Navigation size={17} aria-hidden="true" />
                {t.destination}
              </span>
              <textarea
                className="min-h-0 w-full resize-none rounded-lg border border-neutral-300 bg-white p-2 text-sm leading-5 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 sm:p-3 sm:text-base sm:leading-6"
                value={manualAddress}
                onChange={(event) => setManualAddress(event.target.value)}
                placeholder={t.destinationPlaceholder}
                rows={5}
                aria-label={t.destination}
              />
            </label>

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none sm:h-12 lg:h-14"
              type="button"
              onClick={openMaps}
              disabled={!activeAddress}
              aria-label={t.mapsAria}
              title={t.mapsAria}
            >
              <ExternalLink size={20} aria-hidden="true" />
              <span className="sr-only">{t.openMaps}</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <label
                className={[
                  "grid h-11 cursor-pointer place-items-center gap-1 rounded-lg border text-xs font-bold transition sm:h-12 lg:h-16",
                  autoOpenMaps ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-neutral-50 text-neutral-500"
                ].join(" ")}
                aria-label={t.autoAria}
                title={t.autoAria}
              >
                <input className="sr-only" type="checkbox" checked={autoOpenMaps} onChange={(event) => setAutoOpenMaps(event.target.checked)} />
                <Bot size={20} aria-hidden="true" />
                <span className="sr-only">{t.autoOpen}</span>
              </label>

              <div className="grid h-11 place-items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-600 sm:h-12 lg:h-16" title={t.confidence}>
                <span className="text-sm tabular-nums text-neutral-950">{result ? `${Math.round(result.confidence * 100)}%` : "--"}</span>
                <span className="sr-only">{t.confidence}</span>
              </div>

              <div
                className={[
                  "grid h-11 place-items-center gap-1 rounded-lg border text-xs font-bold sm:h-12 lg:h-16",
                  error ? "border-red-200 bg-red-50 text-red-700" : "border-neutral-300 bg-neutral-50 text-neutral-600"
                ].join(" ")}
                title={error ?? t.status}
              >
                {error ? <XCircle size={20} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
                <span className="sr-only">{error ? t.needsCheck : t.status}</span>
              </div>
            </div>

            {result?.raw_text || result?.notes.length || error ? (
              <div className="max-h-14 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs leading-5 text-neutral-700 sm:max-h-16 sm:text-sm">
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
        </div>
      </div>
    </main>
  );
}

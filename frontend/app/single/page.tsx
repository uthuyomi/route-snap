"use client";

import { Camera, Check, ExternalLink, ImagePlus, Loader2, Navigation, RotateCcw, ScanText, XCircle } from "lucide-react";
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
    capture: "住所読み取り",
    chooseImage: "画像を選択",
    takePhoto: "撮影する",
    analyze: "住所を整形",
    analyzing: "読み取り中",
    retake: "撮り直す",
    reset: "クリア",
    destination: "行き先",
    destinationPlaceholder: "AIで整形した住所が入ります",
    openMaps: "Google Mapsで開く",
    confidence: "信頼度",
    status: "状態",
    ready: "準備OK",
    needsCheck: "要確認",
    read: "読み取り",
    parseFailed: "住所を読み取れませんでした",
    unknownError: "不明なエラーが発生しました",
    imageAlt: "読み取り対象の住所画像",
    photoAria: "住所を撮影",
    libraryAria: "端末内の画像を選択",
    analyzeAria: "AIで住所を整形",
    retakeAria: "写真を撮り直す",
    resetAria: "入力内容をクリア",
    mapsAria: "Google Mapsで開く",
    capturePanel: "1. 画像を追加",
    confirmPanel: "2. 確認して開く",
    captureHelp: "住所部分が大きく写るように撮影してください。",
    noPhoto: "画像未選択",
    readyPhoto: "画像選択済み",
    mapsHelp: "Mapsを開く前に住所を確認・編集できます。読み取りが曖昧な時は建物名や郵便番号も残してください。",
    photoSource: "取り込み方法",
    resultTools: "読み取り操作"
  },
  en: {
    capture: "Read address",
    chooseImage: "Choose image",
    takePhoto: "Take photo",
    analyze: "Format address",
    analyzing: "Reading",
    retake: "Retake",
    reset: "Clear",
    destination: "Destination",
    destinationPlaceholder: "Formatted address appears here",
    openMaps: "Open in Google Maps",
    confidence: "Confidence",
    status: "Status",
    ready: "Ready",
    needsCheck: "Check",
    read: "Read",
    parseFailed: "Could not read the address",
    unknownError: "An unknown error occurred",
    imageAlt: "Captured address image",
    photoAria: "Capture address",
    libraryAria: "Choose an image from this device",
    analyzeAria: "Format address with AI",
    retakeAria: "Retake photo",
    resetAria: "Clear input",
    mapsAria: "Open in Google Maps",
    capturePanel: "1. Capture",
    confirmPanel: "2. Review and Open",
    captureHelp: "Frame the address clearly so the address text is larger than names or postal codes.",
    noPhoto: "No image selected",
    readyPhoto: "Image selected",
    mapsHelp: "You can edit the address before opening Maps.",
    photoSource: "Input source",
    resultTools: "Read actions"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function secondaryButtonClass(active = true) {
  return [
    "secondary-action aspect-square min-h-12 px-0 sm:min-h-14",
    active ? "" : "border-neutral-200 bg-neutral-100 text-neutral-400"
  ].join(" ");
}

function primaryButtonClass() {
  return "primary-action aspect-square min-h-14 px-0";
}

function iconChoiceClass() {
  return "choice-tile aspect-square min-h-28";
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
  const [error, setError] = useState<string | null>(null);

  const t = messages[locale];
  const activeAddress = (manualAddress || result?.normalized_address || "").trim();

  function resetCapture() {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setManualAddress("");
    setError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (libraryInputRef.current) libraryInputRef.current.value = "";
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
        if (response.status === 401) {
          window.location.assign("/login?next=/single");
          return;
        }
        throw new Error(payload.detail ?? t.parseFailed);
      }

      setResult(payload);
      setManualAddress(payload.normalized_address ?? "");

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
    <main className="app-surface h-svh overflow-hidden px-2 py-2 sm:px-3 lg:h-auto lg:min-h-svh lg:overflow-visible lg:px-6 lg:py-8">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_1fr] gap-2 lg:h-auto lg:gap-4">
        <AppHeader locale={locale} currentPage="single" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <div className="grid min-h-0 gap-2 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:gap-4 lg:items-start">
          <section className="app-panel grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 p-2 sm:p-3 lg:gap-4 lg:p-4" aria-label={t.photoAria}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="app-eyebrow">{t.capturePanel}</p>
                <h1 className="app-heading mt-2">{t.capture}</h1>
                <p className="app-help hidden sm:block">{t.captureHelp}</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800" title={imageFile ? t.readyPhoto : t.noPhoto} aria-label={imageFile ? t.readyPhoto : t.noPhoto}>
                {imageFile ? <Check size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
              </span>
            </div>

            <div className="media-stage lg:aspect-[4/3]">
              {previewUrl ? (
                <Image className="object-contain" src={previewUrl} alt={t.imageAlt} fill sizes="(min-width: 1024px) 620px, 100vw" unoptimized />
              ) : (
                <div className="media-empty">
                  <div className="grid w-full max-w-sm gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button className={iconChoiceClass()} type="button" onClick={() => cameraInputRef.current?.click()} aria-label={t.takePhoto} title={t.takePhoto}>
                        <Camera className="h-8 w-8" aria-hidden="true" />
                        <span className="sr-only">{t.takePhoto}</span>
                      </button>
                      <button className={iconChoiceClass()} type="button" onClick={() => libraryInputRef.current?.click()} aria-label={t.chooseImage} title={t.chooseImage}>
                        <ImagePlus className="h-8 w-8" aria-hidden="true" />
                        <span className="sr-only">{t.chooseImage}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <input ref={cameraInputRef} className="pointer-events-none absolute h-px w-px opacity-0" type="file" accept="image/*" capture="environment" onChange={onPickImage} />
              <input ref={libraryInputRef} className="pointer-events-none absolute h-px w-px opacity-0" type="file" accept="image/*" onChange={onPickImage} />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <p className="sr-only">{t.resultTools}</p>
              <button className={primaryButtonClass()} type="button" onClick={analyzeImage} disabled={!imageFile || isLoading} aria-label={t.analyzeAria} title={t.analyzeAria}>
                {isLoading ? <Loader2 className="animate-spin" size={22} aria-hidden="true" /> : <ScanText size={22} aria-hidden="true" />}
                <span className="sr-only">{isLoading ? t.analyzing : t.analyze}</span>
              </button>
              <button className={secondaryButtonClass()} type="button" onClick={() => cameraInputRef.current?.click()} aria-label={t.retakeAria} title={t.retakeAria}>
                <Camera size={18} aria-hidden="true" />
                <span className="sr-only">{t.retake}</span>
              </button>
              <button className={secondaryButtonClass()} type="button" onClick={() => libraryInputRef.current?.click()} aria-label={t.libraryAria} title={t.libraryAria}>
                <ImagePlus size={18} aria-hidden="true" />
                <span className="sr-only">{t.chooseImage}</span>
              </button>
              <button className={secondaryButtonClass()} type="button" onClick={resetCapture} aria-label={t.resetAria} title={t.resetAria}>
                <RotateCcw size={19} aria-hidden="true" />
                <span className="sr-only">{t.reset}</span>
              </button>
            </div>
          </section>

          <section className="app-panel grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-2 p-2 sm:p-3 md:sticky md:top-2 lg:top-4 lg:gap-4 lg:p-4" aria-label={t.destination}>
            <div>
              <p className="app-eyebrow">{t.confirmPanel}</p>
              <h2 className="app-heading mt-2">{t.destination}</h2>
              <p className="app-help hidden sm:block">{t.mapsHelp}</p>
            </div>

            <label className="grid min-h-0 grid-rows-[auto_1fr] gap-1">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 sm:text-sm">
                <Navigation size={17} aria-hidden="true" />
                {t.destination}
              </span>
              <textarea
                className="form-field min-h-0 w-full resize-none p-2 text-sm leading-5 sm:p-3 sm:text-base sm:leading-6"
                value={manualAddress}
                onChange={(event) => setManualAddress(event.target.value)}
                placeholder={t.destinationPlaceholder}
                rows={5}
                aria-label={t.destination}
              />
            </label>

            <button className="primary-action min-h-14 px-4" type="button" onClick={openMaps} disabled={!activeAddress} aria-label={t.mapsAria} title={t.mapsAria}>
              <ExternalLink size={20} aria-hidden="true" />
              <span className="sr-only">{t.openMaps}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <div className="metric-card grid min-h-14 place-items-center gap-1 px-2 text-xs font-bold text-neutral-600 sm:min-h-16" title={t.confidence}>
                <span className="text-sm tabular-nums text-neutral-950">{result ? `${Math.round(result.confidence * 100)}%` : "--"}</span>
                <span className="sr-only">{t.confidence}</span>
              </div>

              <div
                className={[
                  "metric-card grid min-h-14 place-items-center gap-1 px-2 text-xs font-bold sm:min-h-16",
                  error ? "border-red-200 bg-red-50 text-red-700" : "text-neutral-600"
                ].join(" ")}
                title={error ?? t.status}
              >
                {error ? <XCircle size={20} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
                <span className="sr-only">{error ? t.needsCheck : t.ready}</span>
              </div>
            </div>

            {result?.raw_text || result?.notes.length || error ? (
              <div className="app-panel-muted max-h-20 overflow-hidden p-2 text-xs leading-5 text-neutral-700 sm:max-h-24 sm:text-sm">
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


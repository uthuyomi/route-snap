"use client";

import { ArrowUpDown, Bot, Check, ExternalLink, FileText, ImagePlus, Loader2, Navigation, Trash2, Upload, XCircle } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { prepareImageForUpload } from "../lib/imageUpload";

type StopStatus = "ready" | "reading" | "error";
type RouteMode = "file" | "ai";

type BatchStop = {
  id: string;
  sourceName: string;
  address: string;
  status: StopStatus;
  note?: string;
  routeNote: string;
};

type AddressCandidate = {
  label: string;
  normalized_address: string;
  confidence: number;
  notes: string[];
};

type AddressListResult = {
  addresses: AddressCandidate[];
  notes: string[];
};

type OptimizeResult = {
  ordered_indices: number[];
  notes: string[];
};

const messages = {
  ja: {
    readingImage: "画像を解析中",
    imageFailed: "画像から住所を読み取れませんでした",
    imageAnalyzeFailed: "画像解析に失敗しました",
    confidence: "信頼度",
    noAddressInFile: "住所らしい行が見つかりませんでした",
    fileReadFailed: "ファイルの読み込みに失敗しました",
    needTwoStops: "順路作成には住所が2件以上必要です",
    aiRouteFailed: "AI順路作成に失敗しました",
    addFiles: "画像・ファイルを追加",
    imageOcr: "画像OCR",
    aiNotes: "AIへの備考",
    globalNotes: "全体の備考",
    stopNote: "この住所の備考",
    stopNotePlaceholder: "例: 10時指定、荷物多め、最後に回す",
    notesPlaceholder: "例: 10時までに新宿、午後は渋谷方面を優先。高速道路は避けたい。",
    address: "住所",
    delete: "削除",
    empty: "住所が入った画像、TXT、CSV、TSV、JSONを追加してください",
    fileOrder: "ファイル内の順番通り",
    aiOrder: "AIで移動順を最適化",
    openMaps: "Google Mapsで一括ルート作成",
    routeOrder: "ルート順",
    countUnit: "件",
    emptyOrder: "住所を追加すると順番が表示されます",
    mapsLimit: "Google Mapsの仕様上、経由地が多い場合は一部が反映されないことがあります。その場合は住所リストを分割してください。",
    uploadPanel: "1. 取り込みと条件",
    routePanel: "2. 順路作成",
    uploadHelp: "住所ファイルを読み込んだあと、必要な行だけ修正して個別備考を追加できます。",
    routeHelp: "ファイル内の順番をそのまま使うか、時間指定や優先度をAIに考慮させて移動順を作れます。",
    imported: "取り込み",
    ready: "有効",
    plannedBy: "順路",
    fileMode: "ファイル順",
    aiMode: "AI順"
  },
  en: {
    readingImage: "Reading image",
    imageFailed: "Could not read an address from the image",
    imageAnalyzeFailed: "Image analysis failed",
    confidence: "Confidence",
    noAddressInFile: "No address-like lines were found",
    fileReadFailed: "Could not read the file",
    needTwoStops: "At least two addresses are required to create a route",
    aiRouteFailed: "AI route planning failed",
    addFiles: "Add images or files",
    imageOcr: "Image OCR",
    aiNotes: "Notes for AI",
    globalNotes: "Global notes",
    stopNote: "Notes for this stop",
    stopNotePlaceholder: "Example: 10:00 appointment, large delivery, visit last",
    notesPlaceholder: "Example: Reach Shinjuku by 10:00, prioritize Shibuya in the afternoon, avoid highways.",
    address: "Address",
    delete: "Delete",
    empty: "Add images, TXT, CSV, TSV, or JSON files containing addresses",
    fileOrder: "Use order inside file",
    aiOrder: "Optimize travel order with AI",
    openMaps: "Create route in Google Maps",
    routeOrder: "Route Order",
    countUnit: "stops",
    emptyOrder: "The route order appears after you add addresses",
    mapsLimit: "Google Maps may ignore some waypoints when there are many stops. Split the address list if needed.",
    uploadPanel: "1. Import and Conditions",
    routePanel: "2. Create Route",
    uploadHelp: "After importing files, you can edit individual rows and add per-stop notes.",
    routeHelp: "Use the order inside the file, or let AI account for time windows and priorities.",
    imported: "Imported",
    ready: "Ready",
    plannedBy: "Order",
    fileMode: "File",
    aiMode: "AI"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function getInitialLocale(): AppLocale {
  if (typeof navigator === "undefined") return "ja";
  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseCsvLine(line: string) {
  return line
    .split(/,|\t/)
    .map((cell) => cell.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
    .join(" ");
}

function extractTextStops(fileName: string, text: string): BatchStop[] {
  if (fileName.toLowerCase().endsWith(".json")) {
    try {
      const parsed = JSON.parse(text);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      return values
        .map((value) => {
          if (typeof value === "string") return { address: value, routeNote: "" };
          if (value && typeof value === "object") {
            const record = value as Record<string, unknown>;
            const address = String(record.address ?? record.destination ?? record.name ?? Object.values(record).filter(Boolean).join(" "));
            const routeNote = String(record.note ?? record.notes ?? record.memo ?? record.remark ?? "");
            return { address, routeNote };
          }
          return { address: "", routeNote: "" };
        })
        .map((stop) => ({ address: stop.address.trim(), routeNote: stop.routeNote.trim() }))
        .filter((stop) => stop.address)
        .map((stop, index) => ({
          id: createId(),
          sourceName: `${fileName} #${index + 1}`,
          address: stop.address,
          routeNote: stop.routeNote,
          status: "ready"
        }));
    } catch {
      // Fall back to line parsing below.
    }
  }

  return text
    .split(/\r?\n/)
    .map((line) => parseCsvLine(line))
    .map((address) => address.trim())
    .filter(Boolean)
    .map((address, index) => ({
      id: createId(),
      sourceName: `${fileName} #${index + 1}`,
      address,
      routeNote: "",
      status: "ready"
    }));
}

function buildMapsUrl(stops: BatchStop[]) {
  const addresses = stops.map((stop) => stop.address.trim()).filter(Boolean);
  if (!addresses.length) return "";

  if (addresses.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addresses[0])}&travelmode=driving`;
  }

  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  const waypoints = addresses.slice(1, -1).map(encodeURIComponent).join("|");
  const waypointPart = waypoints ? `&waypoints=${waypoints}` : "";

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointPart}&travelmode=driving`;
}

function buttonClass(active = true) {
  return [
    "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
    active
      ? "border-neutral-300 bg-white text-neutral-900 shadow-sm hover:border-neutral-400 hover:bg-neutral-50"
      : "border-neutral-200 bg-neutral-100 text-neutral-400"
  ].join(" ");
}

async function runLimited<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (item) {
        await task(item);
      }
    }
  });

  await Promise.all(workers);
}

export default function BatchRoutePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [locale, setLocale] = useState<AppLocale>(() => getInitialLocale());
  const [stops, setStops] = useState<BatchStop[]>([]);
  const [routeOrderIds, setRouteOrderIds] = useState<string[]>([]);
  const [routeMode, setRouteMode] = useState<RouteMode>("file");
  const [notes, setNotes] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeNotes, setRouteNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = messages[locale];

  const usableStops = useMemo(() => stops.filter((stop) => stop.address.trim()), [stops]);
  const orderedStops = useMemo(() => {
    if (!routeOrderIds.length) return usableStops;
    const byId = new Map(usableStops.map((stop) => [stop.id, stop]));
    const ordered = routeOrderIds.map((id) => byId.get(id)).filter((stop): stop is BatchStop => Boolean(stop));
    const missing = usableStops.filter((stop) => !routeOrderIds.includes(stop.id));
    return [...ordered, ...missing];
  }, [routeOrderIds, usableStops]);
  const mapsUrl = useMemo(() => buildMapsUrl(orderedStops), [orderedStops]);

  function clearInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function readImageFile(file: File) {
    const id = createId();
    setStops((current) => [
      ...current,
      {
        id,
        sourceName: file.name,
        address: "",
        routeNote: "",
        status: "reading",
        note: t.readingImage
      }
    ]);

    try {
      const uploadFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append("image", uploadFile);
      formData.append("locale", locale);
      formData.append("notes", notes);

      const response = await fetch("/api/parse-addresses", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as AddressListResult & { detail?: string };
      if (!response.ok) {
        throw new Error(payload.detail ?? t.imageFailed);
      }
      const addresses = (payload.addresses ?? []).filter((address) => address.normalized_address?.trim());

      if (!addresses.length) {
        setStops((current) =>
          current.map((stop) =>
            stop.id === id
              ? {
                  ...stop,
                  status: "error",
                  note: payload.notes?.join(" / ") || t.imageFailed
                }
              : stop
          )
        );
        return;
      }

      setStops((current) => {
        const firstAddress = addresses[0];
        const additionalStops = addresses.slice(1).map((address, index) => ({
          id: createId(),
          sourceName: `${file.name} #${index + 2}`,
          address: address.normalized_address,
          routeNote: address.label || "",
          status: "ready" as StopStatus,
          note: address.notes?.join(" / ") || `${t.confidence} ${Math.round((address.confidence ?? 0) * 100)}%`
        }));

        return current.flatMap((stop) =>
          stop.id === id
            ? [
                {
                  ...stop,
                  sourceName: addresses.length > 1 ? `${file.name} #1` : file.name,
                  address: firstAddress.normalized_address,
                  routeNote: firstAddress.label || stop.routeNote,
                  status: "ready" as StopStatus,
                  note:
                    firstAddress.notes?.join(" / ") ||
                    payload.notes?.join(" / ") ||
                    `${t.confidence} ${Math.round((firstAddress.confidence ?? 0) * 100)}%`
                },
                ...additionalStops
              ]
            : [stop]
        );
      });
    } catch (caught) {
      setStops((current) =>
        current.map((stop) =>
          stop.id === id
            ? {
                ...stop,
                status: "error",
                note: caught instanceof Error ? caught.message : t.imageAnalyzeFailed
              }
            : stop
        )
      );
    }
  }

  async function readTextFile(file: File) {
    const text = await file.text();
    const extractedStops = extractTextStops(file.name, text);
    if (!extractedStops.length) {
      setStops((current) => [
        ...current,
        {
          id: createId(),
          sourceName: file.name,
          address: "",
          routeNote: "",
          status: "error",
          note: t.noAddressInFile
        }
      ]);
      return;
    }
    setStops((current) => [...current, ...extractedStops]);
  }

  async function onPickFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setIsReading(true);
    setError(null);
    setRouteNotes([]);

    try {
      const imageFiles: File[] = [];

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        } else {
          await readTextFile(file);
        }
      }

      await runLimited(imageFiles, 3, readImageFile);
      setRouteMode("file");
      setRouteOrderIds([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.fileReadFailed);
    } finally {
      setIsReading(false);
      clearInput();
    }
  }

  function updateStop(id: string, address: string) {
    setStops((current) => current.map((stop) => (stop.id === id ? { ...stop, address, status: address.trim() ? "ready" : "error" } : stop)));
  }

  function updateStopRouteNote(id: string, routeNote: string) {
    setStops((current) => current.map((stop) => (stop.id === id ? { ...stop, routeNote } : stop)));
  }

  function removeStop(id: string) {
    setStops((current) => current.filter((stop) => stop.id !== id));
    setRouteOrderIds((current) => current.filter((stopId) => stopId !== id));
  }

  function useFileOrder() {
    setRouteMode("file");
    setRouteOrderIds([]);
    setRouteNotes([]);
    setError(null);
  }

  async function optimizeRoute() {
    if (usableStops.length < 2) {
      setError(t.needTwoStops);
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setRouteNotes([]);

    try {
      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          locale,
          notes,
          stops: usableStops.map((stop, index) => ({
            index,
            address: stop.address,
            note: stop.routeNote
          }))
        })
      });
      const payload = (await response.json()) as OptimizeResult & { detail?: string };
      if (!response.ok) {
        throw new Error(payload.detail ?? t.aiRouteFailed);
      }
      setRouteMode("ai");
      setRouteOrderIds(payload.ordered_indices.map((index) => usableStops[index]?.id).filter((id): id is string => Boolean(id)));
      setRouteNotes(payload.notes ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.aiRouteFailed);
    } finally {
      setIsOptimizing(false);
    }
  }

  function openMaps() {
    if (!mapsUrl) return;
    window.location.assign(mapsUrl);
  }

  return (
    <main className="min-h-svh bg-neutral-100 px-4 py-4 text-neutral-950 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <AppHeader locale={locale} currentPage="batch" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="grid gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="sr-only">{t.uploadPanel}</p>
                <h1 className="m-0 mt-1 text-2xl font-black leading-tight text-neutral-950">{t.addFiles}</h1>
                <p className="sr-only">{t.uploadHelp}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2" title={t.imported}>
                  <span className="block text-lg font-black tabular-nums text-neutral-950">{stops.length}</span>
                  <Upload className="mx-auto mt-1 text-neutral-500" size={14} aria-hidden="true" />
                  <span className="sr-only">{t.imported}</span>
                </div>
                <div className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2" title={t.ready}>
                  <span className="block text-lg font-black tabular-nums text-neutral-950">{usableStops.length}</span>
                  <Check className="mx-auto mt-1 text-neutral-500" size={14} aria-hidden="true" />
                  <span className="sr-only">{t.ready}</span>
                </div>
                <div className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2" title={`${t.plannedBy}: ${routeMode === "ai" ? t.aiMode : t.fileMode}`}>
                  <span className="grid min-h-7 place-items-center text-neutral-950">
                    {routeMode === "ai" ? <Bot size={22} aria-hidden="true" /> : <ArrowUpDown size={22} aria-hidden="true" />}
                  </span>
                  <span className="sr-only">{routeMode === "ai" ? t.aiMode : t.fileMode}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <button
                className="inline-flex min-h-24 items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-400 bg-neutral-50 px-4 text-sm font-black text-neutral-800 transition hover:border-neutral-600 hover:bg-white active:scale-[0.99]"
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label={t.addFiles}
                title={t.addFiles}
              >
                <Upload size={24} aria-hidden="true" />
                <span className="sr-only">{t.addFiles}</span>
              </button>
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept="image/*,.txt,.csv,.tsv,.json"
                multiple
                onChange={onPickFiles}
              />
              <div className="grid grid-cols-2 gap-2 sm:w-52">
                <div className="grid h-14 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-600" title="TXT CSV JSON">
                  <FileText size={18} aria-hidden="true" />
                  <span className="sr-only">TXT CSV JSON</span>
                </div>
                <div className="grid h-14 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-600" title={t.imageOcr}>
                  <ImagePlus size={18} aria-hidden="true" />
                  <span className="sr-only">{t.imageOcr}</span>
                </div>
              </div>
            </div>

            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                <Bot size={17} aria-hidden="true" />
                <span className="sr-only">{t.globalNotes}</span>
              </span>
              <textarea
                className="min-h-24 w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-base leading-6 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t.notesPlaceholder}
                rows={3}
              />
            </label>

            <div className="grid gap-2">
              {stops.length ? (
                stops.map((stop, index) => (
                  <div key={stop.id} className="grid gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-3 sm:grid-cols-[2.5rem_1fr_auto] sm:items-start">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sm font-black text-neutral-800 shadow-sm">{index + 1}</span>
                    <div className="grid gap-2">
                      <input
                        className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                        value={stop.address}
                        onChange={(event) => updateStop(stop.id, event.target.value)}
                        placeholder={t.address}
                      />
                      <label className="grid gap-1">
                        <span className="sr-only">{t.stopNote}</span>
                        <textarea
                          className="min-h-16 resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                          value={stop.routeNote}
                          onChange={(event) => updateStopRouteNote(stop.id, event.target.value)}
                          placeholder={t.stopNotePlaceholder}
                          rows={2}
                          disabled={stop.status === "reading"}
                        />
                      </label>
                      <p className="m-0 line-clamp-2 text-xs font-semibold text-neutral-500">
                        {stop.sourceName}
                        {stop.note ? ` / ${stop.note}` : ""}
                      </p>
                    </div>
                    <button className={buttonClass()} type="button" onClick={() => removeStop(stop.id)} aria-label={t.delete} title={t.delete}>
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="grid min-h-40 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 p-6 text-center text-sm font-bold text-neutral-500">
                  {t.empty}
                </div>
              )}
            </div>
          </section>

          <section className="grid content-start gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm lg:sticky lg:top-4">
            <div>
              <p className="sr-only">{t.routePanel}</p>
              <h2 className="m-0 mt-1 text-2xl font-black leading-tight text-neutral-950">{t.routeOrder}</h2>
              <p className="sr-only">{t.routeHelp}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                className={[
                  "inline-flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
                  routeMode === "file" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-800"
                ].join(" ")}
                type="button"
                onClick={useFileOrder}
                aria-label={t.fileOrder}
                title={t.fileOrder}
              >
                <ArrowUpDown size={19} aria-hidden="true" />
                <span className="sr-only">{t.fileOrder}</span>
              </button>
              <button
                className={[
                  "inline-flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98] disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400",
                  routeMode === "ai" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-800"
                ].join(" ")}
                type="button"
                onClick={optimizeRoute}
                disabled={usableStops.length < 2 || isOptimizing}
                aria-label={t.aiOrder}
                title={t.aiOrder}
              >
                {isOptimizing ? <Loader2 className="animate-spin" size={19} aria-hidden="true" /> : <Bot size={19} aria-hidden="true" />}
                <span className="sr-only">{t.aiOrder}</span>
              </button>
            </div>

            <button
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
              type="button"
              onClick={openMaps}
              disabled={!mapsUrl || isReading || isOptimizing}
            >
              <ExternalLink size={20} aria-hidden="true" />
              <span className="sr-only">{t.openMaps}</span>
            </button>

            <div className="grid gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                  <Navigation size={17} aria-hidden="true" />
                  <span className="sr-only">{t.routeOrder}</span>
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  {orderedStops.length}
                  {locale === "ja" ? t.countUnit : ` ${t.countUnit}`}
                </span>
              </div>
              <ol className="m-0 grid list-none gap-2 p-0">
                {orderedStops.map((stop, index) => (
                  <li key={stop.id} className="grid grid-cols-[2rem_1fr_auto] items-start gap-2 rounded-lg bg-white p-2 text-sm shadow-sm">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-950 text-xs font-black text-white">{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-neutral-900">{stop.address}</span>
                      {stop.routeNote ? <span className="mt-1 block line-clamp-2 text-xs font-semibold leading-5 text-neutral-500">{stop.routeNote}</span> : null}
                    </span>
                    {stop.status === "error" ? <XCircle className="mt-1 text-red-600" size={17} aria-hidden="true" /> : <Check className="mt-1 text-neutral-700" size={17} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
              {!orderedStops.length ? <p className="m-0 text-sm font-bold text-neutral-500">{t.emptyOrder}</p> : null}
            </div>

            {error || routeNotes.length ? (
              <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
                {error ? <p className="m-0 text-red-700">{error}</p> : null}
                {routeNotes.length ? <p className="m-0 text-neutral-600">{routeNotes.join(" / ")}</p> : null}
              </div>
            ) : null}

            <p className="m-0 text-xs font-semibold leading-5 text-neutral-500">
              {t.mapsLimit}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

"use client";

import { AlertCircle, ArrowUpDown, Bot, Camera, Check, ExternalLink, GripVertical, Loader2, Navigation, RotateCcw, Trash2, Upload, XCircle } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { fetchWithAuth } from "../lib/authFetch";
import { prepareImageForUpload } from "../lib/imageUpload";
import { usePreferredLocale } from "../lib/locale";
import { buildRouteMapsUrl, getCurrentPosition } from "../lib/maps";
import type { Coordinates } from "../lib/maps";

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

type ImagePreview = {
  id: string;
  name: string;
  url: string;
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

type OptimizeRequestOrigin = {
  latitude: number;
  longitude: number;
};

const messages = {
  ja: {
    readingImage: "画像を解析中",
    imageFailed: "画像から住所を読み取れませんでした",
    imageAnalyzeFailed: "画像解析に失敗しました",
    confidence: "信頼度",
    noAddressInFile: "住所らしい行が見つかりませんでした",
    fileReadFailed: "ファイルの読み込みに失敗しました",
    needTwoStops: "ルート作成には住所が2件以上必要です",
    aiRouteFailed: "AIルート作成に失敗しました",
    addFiles: "ルート作成",
    importFiles: "ファイル取り込み",
    cameraCapture: "カメラ撮影",
    fileImportHelp: "TXT / CSV / TSV / JSON / 画像",
    cameraHelp: "住所の写真を撮ってOCR",
    imagePreview: "読み取った画像",
    imagePreviewEmpty: "画像を読み取るとここにプレビューが表示されます",
    previewAlt: "読み取った住所画像",
    globalNotes: "全体の条件",
    stopNote: "時間指定・条件",
    stopNoteHelp: "この内容はAIの順番最適化に渡されます",
    stopNotePlaceholder: "例: 10:00-11:00指定、午前中必着、大きな荷物、最後に回す",
    notesPlaceholder: "例: 10時までに新宿、午後は渋谷方面を優先。高速道路は避けたい。",
    address: "住所",
    delete: "削除",
    clear: "クリア",
    empty: "ファイルを取り込むか、カメラで住所を撮影してください",
    fileOrder: "取り込み順で使う",
    aiOrder: "AIで順番を最適化",
    optimizing: "最適化中",
    openMaps: "Google Mapsでルート作成",
    routeOrder: "ルート順",
    countUnit: "件",
    emptyOrder: "住所を追加すると順番が表示されます",
    mapsLimit: "Google Mapsの仕様上、経由地が多い場合は一部が反映されないことがあります。その場合は住所リストを分割してください。",
    uploadPanel: "1. 取り込みと条件",
    routePanel: "2. 訪問順を作成",
    uploadHelp: "ファイル取り込みかカメラ撮影で住所を追加できます。追加後に住所や条件を編集できます。",
    routeHelp: "各住所の時間指定・条件と全体条件をAIに渡して順番を作れます。",
    imported: "取り込み",
    ready: "有効",
    plannedBy: "順番",
    fileMode: "取り込み順",
    aiMode: "AI順",
    statusReady: "OK",
    statusError: "要確認",
    reorderHelp: "ドラッグ、または2件を順にタップして入れ替え",
    individualInstructionNotice: "すべての個別指示を入力してからAI最適化を押してください"
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
    addFiles: "Add addresses",
    importFiles: "Import files",
    cameraCapture: "Take photo",
    fileImportHelp: "TXT / CSV / TSV / JSON / images",
    cameraHelp: "Capture address photos for OCR",
    imagePreview: "Read images",
    imagePreviewEmpty: "Image previews appear here after OCR import",
    previewAlt: "Read address image",
    globalNotes: "Global conditions",
    stopNote: "Time window / conditions",
    stopNoteHelp: "This is sent to AI route optimization",
    stopNotePlaceholder: "Example: 10:00-11:00 window, morning only, large delivery, visit last",
    notesPlaceholder: "Example: Reach Shinjuku by 10:00, prioritize Shibuya in the afternoon, avoid highways.",
    address: "Address",
    delete: "Delete",
    clear: "Clear",
    empty: "Import files or take address photos",
    fileOrder: "Use import order",
    aiOrder: "Optimize with AI",
    optimizing: "Optimizing",
    openMaps: "Create route in Google Maps",
    routeOrder: "Route Order",
    countUnit: "stops",
    emptyOrder: "The route order appears after you add addresses",
    mapsLimit: "Google Maps may ignore some waypoints when there are many stops. Split the address list if needed.",
    uploadPanel: "1. Import and Conditions",
    routePanel: "2. Create Route",
    uploadHelp: "Add addresses by importing files or taking photos. You can edit addresses and conditions after import.",
    routeHelp: "AI can use each stop's time window, conditions, and the global conditions.",
    imported: "Imported",
    ready: "Ready",
    plannedBy: "Order",
    fileMode: "Import",
    aiMode: "AI",
    statusReady: "OK",
    statusError: "Check",
    reorderHelp: "Drag, or tap two stops to swap them",
    individualInstructionNotice: "Enter all individual instructions before running AI optimization"
  }
} satisfies Record<AppLocale, Record<string, string>>;

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
          status: "ready" as StopStatus
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
      status: "ready" as StopStatus
    }));
}

function buttonClass(active = true) {
  return [
    "secondary-action aspect-square min-h-12 px-0 sm:min-h-14",
    active ? "" : "border-neutral-200 bg-neutral-100 text-neutral-400"
  ].join(" ");
}

function headerButtonClass(active = true) {
  return [
    "grid h-10 w-10 place-items-center rounded-2xl border shadow-sm transition active:scale-[0.97]",
    active ? "border-blue-100 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50" : "border-neutral-200 bg-neutral-100 text-neutral-400"
  ].join(" ");
}

function primaryButtonClass() {
  return "primary-action min-h-14";
}

function iconChoiceClass() {
  return "choice-tile aspect-square min-h-28";
}

function routeModeButtonClass(active: boolean) {
  return [
    "inline-flex aspect-square min-h-14 items-center justify-center rounded-xl border text-sm font-bold transition active:scale-[0.98] disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400",
    active ? "border-blue-600 bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]" : "border-blue-100 bg-white/90 text-[#071936] hover:border-blue-300 hover:bg-blue-50"
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

function toOptimizeOrigin(origin: Coordinates | null): OptimizeRequestOrigin | undefined {
  if (!origin) return undefined;
  return {
    latitude: origin.latitude,
    longitude: origin.longitude
  };
}

export default function BatchRoutePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const activeReadIdRef = useRef(0);
  const clearGuardTimerRef = useRef<number | null>(null);
  const [locale, setLocale] = usePreferredLocale();
  const [stops, setStops] = useState<BatchStop[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [routeOrderIds, setRouteOrderIds] = useState<string[]>([]);
  const [routeMode, setRouteMode] = useState<RouteMode>("file");
  const [notes, setNotes] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isClearGuarded, setIsClearGuarded] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeNotes, setRouteNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);
  const t = messages[locale];

  const usableStops = useMemo(() => stops.filter((stop) => stop.address.trim()), [stops]);
  const orderedStops = useMemo(() => {
    if (!routeOrderIds.length) return usableStops;
    const byId = new Map(usableStops.map((stop) => [stop.id, stop]));
    const ordered = routeOrderIds.map((id) => byId.get(id)).filter((stop): stop is BatchStop => Boolean(stop));
    const missing = usableStops.filter((stop) => !routeOrderIds.includes(stop.id));
    return [...ordered, ...missing];
  }, [routeOrderIds, usableStops]);
  const routeAddresses = useMemo(() => orderedStops.map((stop) => stop.address.trim()).filter(Boolean), [orderedStops]);
  const mapsUrl = useMemo(() => buildRouteMapsUrl(routeAddresses), [routeAddresses]);
  const activeImagePreview = imagePreviews.length ? imagePreviews[imagePreviews.length - 1] : null;
  const canClear = Boolean(stops.length || imagePreviews.length || routeOrderIds.length || notes || routeNotes.length || error) && !isReading && !isOptimizing && !isClearGuarded;
  const hasIndividualInstructions = useMemo(() => stops.some((stop) => stop.routeNote.trim()), [stops]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      if (clearGuardTimerRef.current) {
        window.clearTimeout(clearGuardTimerRef.current);
      }
    };
  }, []);

  function guardClearFor(milliseconds: number) {
    setIsClearGuarded(true);
    if (clearGuardTimerRef.current) {
      window.clearTimeout(clearGuardTimerRef.current);
    }
    clearGuardTimerRef.current = window.setTimeout(() => {
      setIsClearGuarded(false);
      clearGuardTimerRef.current = null;
    }, milliseconds);
  }

  function clearInputs() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }

  function clearWorkspace() {
    if (!canClear) return;
    activeReadIdRef.current += 1;
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setStops([]);
    setImagePreviews([]);
    setRouteOrderIds([]);
    setRouteMode("file");
    setNotes("");
    setRouteNotes([]);
    setError(null);
    setSelectedStopId(null);
    setDraggedStopId(null);
    clearInputs();
  }

  async function readImageFile(file: File, readId: number) {
    if (readId !== activeReadIdRef.current) return;
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

      const response = await fetchWithAuth("/api/parse-addresses", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as AddressListResult & { detail?: string };
      if (readId !== activeReadIdRef.current) return;
      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign("/login?next=/batch");
          return;
        }
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
      if (readId !== activeReadIdRef.current) return;
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

  async function readTextFile(file: File, readId: number) {
    const text = await file.text();
    if (readId !== activeReadIdRef.current) return;
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

    const usageResponse = await fetchWithAuth("/api/usage/file-addresses", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ count: extractedStops.length })
    });
    const usagePayload = (await usageResponse.json()) as { detail?: string };
    if (readId !== activeReadIdRef.current) return;
    if (!usageResponse.ok) {
      if (usageResponse.status === 401) {
        window.location.assign("/login?next=/batch");
        return;
      }
      throw new Error(usagePayload.detail ?? t.fileReadFailed);
    }

    setStops((current) => [...current, ...extractedStops]);
  }

  async function processFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    setIsReading(true);
    setError(null);
    setRouteNotes([]);
    const readId = activeReadIdRef.current + 1;
    activeReadIdRef.current = readId;
    guardClearFor(1800);

    try {
      const imageFiles: File[] = [];

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        } else {
          await readTextFile(file, readId);
        }
      }

      if (readId !== activeReadIdRef.current) return;
      if (imageFiles.length) {
        const nextPreviews = imageFiles.map((file) => ({
          id: createId(),
          name: file.name,
          url: URL.createObjectURL(file)
        }));
        previewUrlsRef.current.push(...nextPreviews.map((preview) => preview.url));
        setImagePreviews((current) => [
          ...current,
          ...nextPreviews
        ]);
      }

      await runLimited(imageFiles, 3, (file) => readImageFile(file, readId));
      if (readId !== activeReadIdRef.current) return;
      setRouteMode("file");
      setRouteOrderIds([]);
    } catch (caught) {
      if (readId !== activeReadIdRef.current) return;
      setError(caught instanceof Error ? caught.message : t.fileReadFailed);
    } finally {
      if (readId === activeReadIdRef.current) {
        setIsReading(false);
        clearInputs();
        guardClearFor(1000);
      }
    }
  }

  function onPickFiles(event: ChangeEvent<HTMLInputElement>) {
    processFiles(event.target.files);
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
    setSelectedStopId((current) => (current === id ? null : current));
  }

  function applyManualOrder(nextStops: BatchStop[]) {
    setRouteMode("file");
    setRouteOrderIds(nextStops.map((stop) => stop.id));
    setRouteNotes([]);
    setError(null);
  }

  function swapStops(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const sourceIndex = orderedStops.findIndex((stop) => stop.id === sourceId);
    const targetIndex = orderedStops.findIndex((stop) => stop.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextStops = [...orderedStops];
    [nextStops[sourceIndex], nextStops[targetIndex]] = [nextStops[targetIndex], nextStops[sourceIndex]];
    applyManualOrder(nextStops);
  }

  function moveStop(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const sourceIndex = orderedStops.findIndex((stop) => stop.id === sourceId);
    const targetIndex = orderedStops.findIndex((stop) => stop.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextStops = [...orderedStops];
    const [source] = nextStops.splice(sourceIndex, 1);
    nextStops.splice(targetIndex, 0, source);
    applyManualOrder(nextStops);
  }

  function selectOrSwapStop(id: string) {
    if (!selectedStopId) {
      setSelectedStopId(id);
      return;
    }

    if (selectedStopId === id) {
      setSelectedStopId(null);
      return;
    }

    swapStops(selectedStopId, id);
    setSelectedStopId(null);
  }

  function onRouteDragStart(event: DragEvent<HTMLLIElement>, id: string) {
    setDraggedStopId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function onRouteDrop(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggedStopId;
    if (sourceId) moveStop(sourceId, targetId);
    setDraggedStopId(null);
    setSelectedStopId(null);
  }

  function useFileOrder() {
    setRouteMode("file");
    setRouteOrderIds([]);
    setRouteNotes([]);
    setError(null);
    setSelectedStopId(null);
    setDraggedStopId(null);
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
      const origin = await getCurrentPosition();
      const response = await fetchWithAuth("/api/optimize-route", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          locale,
          notes,
          origin: toOptimizeOrigin(origin),
          stops: usableStops.map((stop, index) => ({
            index,
            address: stop.address,
            note: stop.routeNote
          }))
        })
      });
      const payload = (await response.json()) as OptimizeResult & { detail?: string };
      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign("/login?next=/batch");
          return;
        }
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

  async function openMaps() {
    if (!mapsUrl) return;

    const origin = await getCurrentPosition();
    window.location.assign(buildRouteMapsUrl(routeAddresses, origin ?? undefined));
  }

  return (
    <main className="app-surface min-h-svh px-2 py-2 sm:px-6 sm:py-4 lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <AppHeader locale={locale} currentPage="batch" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="app-panel grid gap-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="app-eyebrow">{t.uploadPanel}</p>
                <h1 className="m-0 mt-2 text-2xl font-black leading-tight text-neutral-950">{t.addFiles}</h1>
                <p className="sr-only">{t.uploadHelp}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="metric-card" title={t.imported}>
                    <span className="block text-lg font-black tabular-nums text-neutral-950">{stops.length}</span>
                    <span className="block text-xs font-bold text-neutral-500">{t.imported}</span>
                  </div>
                  <div className="metric-card" title={t.ready}>
                    <span className="block text-lg font-black tabular-nums text-neutral-950">{usableStops.length}</span>
                    <span className="block text-xs font-bold text-neutral-500">{t.ready}</span>
                  </div>
                  <div className="metric-card" title={`${t.plannedBy}: ${routeMode === "ai" ? t.aiMode : t.fileMode}`}>
                    <span className="grid min-h-6 place-items-center text-neutral-950">
                      {routeMode === "ai" ? <Bot size={20} aria-hidden="true" /> : <ArrowUpDown size={20} aria-hidden="true" />}
                    </span>
                    <span className="block text-xs font-bold text-neutral-500">{routeMode === "ai" ? t.aiMode : t.fileMode}</span>
                  </div>
                </div>
                <button className={headerButtonClass(canClear)} type="button" onClick={clearWorkspace} disabled={!canClear || isReading || isOptimizing} aria-label={t.clear} title={t.clear}>
                  <RotateCcw size={18} aria-hidden="true" />
                  <span className="sr-only">{t.clear}</span>
                </button>
              </div>
            </div>

            <div className="media-stage min-h-72 lg:aspect-[4/3]" aria-label={t.imagePreview}>
              {activeImagePreview ? (
                <Image
                  className="object-contain"
                  src={activeImagePreview.url}
                  alt={`${t.previewAlt}: ${activeImagePreview.name}`}
                  fill
                  sizes="(min-width: 1024px) 620px, 100vw"
                  unoptimized
                />
              ) : (
                <div className="media-empty min-h-72">
                  <div className="grid w-full max-w-sm gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className={iconChoiceClass()}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label={t.importFiles}
                        title={t.importFiles}
                        disabled={isReading}
                      >
                        {isReading ? <Loader2 className="animate-spin" size={24} aria-hidden="true" /> : <Upload className="h-8 w-8" aria-hidden="true" />}
                        <span className="sr-only">{isReading ? t.readingImage : t.importFiles}</span>
                      </button>
                      <button
                        className={iconChoiceClass()}
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        aria-label={t.cameraCapture}
                        title={t.cameraCapture}
                        disabled={isReading}
                      >
                        {isReading ? <Loader2 className="animate-spin" size={24} aria-hidden="true" /> : <Camera className="h-8 w-8" aria-hidden="true" />}
                        <span className="sr-only">{isReading ? t.readingImage : t.cameraCapture}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} className="sr-only" type="file" accept="image/*,.txt,.csv,.tsv,.json" multiple onChange={onPickFiles} />
              <input ref={cameraInputRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={onPickFiles} />
            </div>

            <div className="grid gap-2">
              {activeImagePreview ? (
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-blue-100 bg-white/75 p-2 shadow-sm">
                  <button className={buttonClass()} type="button" onClick={() => fileInputRef.current?.click()} disabled={isReading} aria-label={t.importFiles} title={t.importFiles}>
                    {isReading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
                    <span className="sr-only">{t.importFiles}</span>
                  </button>
                  <button className={buttonClass()} type="button" onClick={() => cameraInputRef.current?.click()} disabled={isReading} aria-label={t.cameraCapture} title={t.cameraCapture}>
                    {isReading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Camera size={18} aria-hidden="true" />}
                    <span className="sr-only">{t.cameraCapture}</span>
                  </button>
                </div>
              ) : null}

              {imagePreviews.length ? (
                <section className="grid gap-2" aria-label={t.imagePreview}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="m-0 text-sm font-black text-neutral-800">{t.imagePreview}</h2>
                    <span className="text-xs font-bold tabular-nums text-neutral-500">{imagePreviews.length}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {imagePreviews.map((preview) => (
                      <figure key={preview.id} className="m-0 overflow-hidden rounded-lg border border-neutral-200 bg-white/80 shadow-sm">
                        <div className="relative aspect-[4/3] bg-white">
                          <Image className="object-contain" src={preview.url} alt={`${t.previewAlt}: ${preview.name}`} fill sizes="120px" unoptimized />
                        </div>
                        <figcaption className="truncate px-2 py-1 text-xs font-bold text-neutral-500" title={preview.name}>
                          {preview.name}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                <Bot size={17} aria-hidden="true" />
                {t.globalNotes}
              </span>
              <textarea
                className="form-field min-h-24 w-full resize-y p-3 text-base leading-6"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t.notesPlaceholder}
                rows={3}
              />
            </label>

            <div className="grid gap-2">
              {stops.length ? (
                stops.map((stop, index) => (
                  <div key={stop.id} className="app-panel-muted grid gap-2 p-3 sm:grid-cols-[2.5rem_1fr_auto] sm:items-start">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-600/20">{index + 1}</span>
                    <div className="grid gap-2">
                      <label className="grid gap-1">
                        <span className="text-xs font-bold text-neutral-500">{t.address}</span>
                        <input
                          className="form-field h-11 px-3 text-base"
                          value={stop.address}
                          onChange={(event) => updateStop(stop.id, event.target.value)}
                          placeholder={t.address}
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-xs font-bold text-neutral-500">{t.stopNote}</span>
                        <textarea
                          className="form-field min-h-16 resize-y px-3 py-2 text-sm leading-5"
                          value={stop.routeNote}
                          onChange={(event) => updateStopRouteNote(stop.id, event.target.value)}
                          placeholder={t.stopNotePlaceholder}
                          rows={2}
                          disabled={stop.status === "reading"}
                          aria-label={`${t.stopNote}: ${stop.sourceName}`}
                        />
                        <span className="sr-only">{t.stopNoteHelp}</span>
                      </label>
                      <p className="m-0 line-clamp-2 text-xs font-semibold text-neutral-500">
                        {stop.sourceName}
                        {stop.note ? ` / ${stop.note}` : ""}
                      </p>
                    </div>
                    <button className={buttonClass()} type="button" onClick={() => removeStop(stop.id)} aria-label={t.delete} title={t.delete}>
                      <Trash2 size={18} aria-hidden="true" />
                      <span className="sr-only">{t.delete}</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="app-panel-muted grid min-h-40 place-items-center p-6 text-center text-sm font-bold text-neutral-500">{t.empty}</div>
              )}
            </div>
          </section>

          <section className="app-panel grid content-start gap-3 p-4 lg:sticky lg:top-4">
            <div>
              <p className="app-eyebrow">{t.routePanel}</p>
              <h2 className="m-0 mt-1 text-2xl font-black leading-tight text-neutral-950">{t.routeOrder}</h2>
              <p className="sr-only">{t.routeHelp}</p>
            </div>

            <div className="grid grid-cols-[auto_auto_1fr] gap-2">
              <button
                className={routeModeButtonClass(routeMode === "file")}
                type="button"
                onClick={useFileOrder}
                aria-label={t.fileOrder}
                title={t.fileOrder}
              >
                <ArrowUpDown size={19} aria-hidden="true" />
                <span className="sr-only">{t.fileOrder}</span>
              </button>
              <button
                className={routeModeButtonClass(routeMode === "ai")}
                type="button"
                onClick={optimizeRoute}
                disabled={usableStops.length < 2 || isOptimizing}
                aria-label={t.aiOrder}
                title={t.aiOrder}
              >
                {isOptimizing ? <Loader2 className="animate-spin" size={19} aria-hidden="true" /> : <Bot size={19} aria-hidden="true" />}
                <span className="sr-only">{isOptimizing ? t.optimizing : t.aiOrder}</span>
              </button>
              <button className={primaryButtonClass()} type="button" onClick={openMaps} disabled={!mapsUrl || isReading || isOptimizing} aria-label={t.openMaps} title={t.openMaps}>
                <ExternalLink size={20} aria-hidden="true" />
                <span className="sr-only">{t.openMaps}</span>
              </button>
            </div>

            <div className="app-panel-muted grid gap-2 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                  <Navigation size={17} aria-hidden="true" />
                  {t.routeOrder}
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  {orderedStops.length}
                  {locale === "ja" ? t.countUnit : ` ${t.countUnit}`}
                </span>
              </div>
              <p className="m-0 text-xs font-bold leading-5 text-blue-600">{t.reorderHelp}</p>
              <ol className="m-0 grid list-none gap-2 p-0">
                {orderedStops.map((stop, index) => (
                  <li
                    key={stop.id}
                    className={[
                      "grid cursor-grab grid-cols-[auto_1fr_auto] items-start gap-2 rounded-2xl border bg-white/90 p-2 text-sm shadow-sm transition active:cursor-grabbing",
                      selectedStopId === stop.id ? "border-blue-500 ring-4 ring-blue-100" : "border-blue-100 hover:border-blue-300",
                      draggedStopId === stop.id ? "opacity-60" : ""
                    ].join(" ")}
                    draggable
                    onClick={() => selectOrSwapStop(stop.id)}
                    onDragStart={(event) => onRouteDragStart(event, stop.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => onRouteDrop(event, stop.id)}
                    onDragEnd={() => setDraggedStopId(null)}
                    title={t.reorderHelp}
                  >
                    <span className="grid gap-1">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">{index + 1}</span>
                      <span className="grid h-8 w-8 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                        <GripVertical size={16} aria-hidden="true" />
                      </span>
                    </span>
                    <span className="grid min-w-0 gap-2" onClick={(event) => event.stopPropagation()}>
                      <span className="block truncate font-bold text-neutral-900">{stop.address}</span>
                      <label className="grid gap-1">
                        <span className="sr-only">{t.stopNote}</span>
                        <input
                          className="form-field h-10 px-3 text-sm"
                          value={stop.routeNote}
                          onChange={(event) => updateStopRouteNote(stop.id, event.target.value)}
                          placeholder={t.stopNotePlaceholder}
                          aria-label={`${t.stopNote}: ${stop.address}`}
                        />
                      </label>
                    </span>
                    <span className={stop.status === "error" ? "mt-1 inline-flex items-center gap-1 text-xs font-bold text-red-600" : "mt-1 inline-flex items-center gap-1 text-xs font-bold text-neutral-700"}>
                      {stop.status === "error" ? <XCircle size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                      <span className="hidden sm:inline">{stop.status === "error" ? t.statusError : t.statusReady}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {!orderedStops.length ? <p className="m-0 text-sm font-bold text-neutral-500">{t.emptyOrder}</p> : null}
            </div>

            {hasIndividualInstructions ? (
              <div className="app-panel-muted flex items-start gap-2 border-blue-200 bg-blue-50/80 p-3 text-sm font-bold leading-6 text-blue-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <p className="m-0">{t.individualInstructionNotice}</p>
              </div>
            ) : null}

            {error || routeNotes.length ? (
              <div className="app-panel-muted p-3 text-sm leading-6 text-neutral-700">
                {error ? <p className="m-0 text-red-700">{error}</p> : null}
                {routeNotes.length ? <p className="m-0 text-neutral-600">{routeNotes.join(" / ")}</p> : null}
              </div>
            ) : null}

            <p className="sr-only">{t.mapsLimit}</p>
          </section>
        </div>
      </div>
    </main>
  );
}


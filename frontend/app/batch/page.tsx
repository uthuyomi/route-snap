"use client";

import {
  ArrowLeft,
  ArrowUpDown,
  Bot,
  Check,
  ExternalLink,
  FileText,
  ImagePlus,
  Loader2,
  Navigation,
  Route,
  Trash2,
  Upload,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useMemo, useRef, useState } from "react";

type StopStatus = "ready" | "reading" | "error";
type RouteMode = "file" | "ai";

type BatchStop = {
  id: string;
  sourceName: string;
  address: string;
  status: StopStatus;
  note?: string;
};

type AddressResult = {
  normalized_address: string;
  confidence: number;
  notes: string[];
};

type OptimizeResult = {
  ordered_indices: number[];
  notes: string[];
};

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
          if (typeof value === "string") return value;
          if (value && typeof value === "object") {
            const record = value as Record<string, unknown>;
            return String(record.address ?? record.destination ?? record.name ?? Object.values(record).filter(Boolean).join(" "));
          }
          return "";
        })
        .map((address) => address.trim())
        .filter(Boolean)
        .map((address, index) => ({
          id: createId(),
          sourceName: `${fileName} #${index + 1}`,
          address,
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

export default function BatchRoutePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [stops, setStops] = useState<BatchStop[]>([]);
  const [routeOrderIds, setRouteOrderIds] = useState<string[]>([]);
  const [routeMode, setRouteMode] = useState<RouteMode>("file");
  const [notes, setNotes] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeNotes, setRouteNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        status: "reading",
        note: "画像を解析中"
      }
    ]);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("locale", "ja");

    try {
      const response = await fetch("/api/parse-address", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as AddressResult & { detail?: string };
      if (!response.ok) {
        throw new Error(payload.detail ?? "画像から住所を読み取れませんでした");
      }
      setStops((current) =>
        current.map((stop) =>
          stop.id === id
            ? {
                ...stop,
                address: payload.normalized_address,
                status: payload.normalized_address ? "ready" : "error",
                note: payload.notes?.join(" / ") || `信頼度 ${Math.round((payload.confidence ?? 0) * 100)}%`
              }
            : stop
        )
      );
    } catch (caught) {
      setStops((current) =>
        current.map((stop) =>
          stop.id === id
            ? {
                ...stop,
                status: "error",
                note: caught instanceof Error ? caught.message : "画像解析に失敗しました"
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
          status: "error",
          note: "住所らしい行が見つかりませんでした"
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
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          await readImageFile(file);
        } else {
          await readTextFile(file);
        }
      }
      setRouteMode("file");
      setRouteOrderIds([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ファイルの読み込みに失敗しました");
    } finally {
      setIsReading(false);
      clearInput();
    }
  }

  function updateStop(id: string, address: string) {
    setStops((current) => current.map((stop) => (stop.id === id ? { ...stop, address, status: address.trim() ? "ready" : "error" } : stop)));
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
      setError("順路作成には住所が2件以上必要です");
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
          locale: "ja",
          notes,
          stops: usableStops.map((stop, index) => ({
            index,
            address: stop.address
          }))
        })
      });
      const payload = (await response.json()) as OptimizeResult & { detail?: string };
      if (!response.ok) {
        throw new Error(payload.detail ?? "AI順路作成に失敗しました");
      }
      setRouteMode("ai");
      setRouteOrderIds(payload.ordered_indices.map((index) => usableStops[index]?.id).filter((id): id is string => Boolean(id)));
      setRouteNotes(payload.notes ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI順路作成に失敗しました");
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
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white shadow-sm">
              <Route size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="m-0 text-lg font-bold leading-6">Route Snap Batch</h1>
              <p className="m-0 truncate text-xs font-medium text-neutral-500">画像・ファイルから複数住所をまとめてルート化</p>
            </div>
          </div>
          <Link className={buttonClass()} href="/" aria-label="単発ページへ戻る" title="単発ページへ戻る">
            <ArrowLeft size={18} aria-hidden="true" />
            <span>単発</span>
          </Link>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="grid gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <button
                className="inline-flex min-h-24 items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 text-sm font-bold text-neutral-700 transition hover:border-neutral-500 hover:bg-white active:scale-[0.99]"
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={24} aria-hidden="true" />
                <span>画像・ファイルを追加</span>
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
                <div className="grid h-14 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-600">
                  <FileText size={18} aria-hidden="true" />
                  <span>TXT CSV JSON</span>
                </div>
                <div className="grid h-14 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-600">
                  <ImagePlus size={18} aria-hidden="true" />
                  <span>画像OCR</span>
                </div>
              </div>
            </div>

            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                <Bot size={17} aria-hidden="true" />
                AIへの備考
              </span>
              <textarea
                className="min-h-24 w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-base leading-6 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="例: 10時までに新宿、午後は渋谷方面を優先。高速道路は避けたい。"
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
                        placeholder="住所"
                      />
                      <p className="m-0 line-clamp-2 text-xs font-semibold text-neutral-500">
                        {stop.sourceName}
                        {stop.note ? ` / ${stop.note}` : ""}
                      </p>
                    </div>
                    <button className={buttonClass()} type="button" onClick={() => removeStop(stop.id)} aria-label="削除" title="削除">
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="grid min-h-40 place-items-center rounded-lg border border-neutral-300 bg-neutral-50 p-6 text-center text-sm font-bold text-neutral-500">
                  住所が入った画像、TXT、CSV、TSV、JSONを追加してください
                </div>
              )}
            </div>
          </section>

          <section className="grid content-start gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={[
                  "inline-flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98]",
                  routeMode === "file" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-800"
                ].join(" ")}
                type="button"
                onClick={useFileOrder}
              >
                <ArrowUpDown size={19} aria-hidden="true" />
                <span>ファイル内の順番通り</span>
              </button>
              <button
                className={[
                  "inline-flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition active:scale-[0.98] disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400",
                  routeMode === "ai" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-800"
                ].join(" ")}
                type="button"
                onClick={optimizeRoute}
                disabled={usableStops.length < 2 || isOptimizing}
              >
                {isOptimizing ? <Loader2 className="animate-spin" size={19} aria-hidden="true" /> : <Bot size={19} aria-hidden="true" />}
                <span>AIで移動順を最適化</span>
              </button>
            </div>

            <button
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
              type="button"
              onClick={openMaps}
              disabled={!mapsUrl || isReading || isOptimizing}
            >
              <ExternalLink size={20} aria-hidden="true" />
              <span>Google Mapsで一括ルート作成</span>
            </button>

            <div className="grid gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                  <Navigation size={17} aria-hidden="true" />
                  ルート順
                </span>
                <span className="text-xs font-bold text-neutral-500">{orderedStops.length}件</span>
              </div>
              <ol className="m-0 grid list-none gap-2 p-0">
                {orderedStops.map((stop, index) => (
                  <li key={stop.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-lg bg-white p-2 text-sm shadow-sm">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-950 text-xs font-black text-white">{index + 1}</span>
                    <span className="min-w-0 truncate font-semibold text-neutral-800">{stop.address}</span>
                    {stop.status === "error" ? <XCircle className="text-red-600" size={17} aria-hidden="true" /> : <Check className="text-neutral-700" size={17} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
              {!orderedStops.length ? <p className="m-0 text-sm font-bold text-neutral-500">住所を追加すると順番が表示されます</p> : null}
            </div>

            {error || routeNotes.length ? (
              <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
                {error ? <p className="m-0 text-red-700">{error}</p> : null}
                {routeNotes.length ? <p className="m-0 text-neutral-600">{routeNotes.join(" / ")}</p> : null}
              </div>
            ) : null}

            <p className="m-0 text-xs font-semibold leading-5 text-neutral-500">
              Google Mapsの仕様上、経由地が多い場合は一部が反映されないことがあります。その場合は住所リストを分割してください。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

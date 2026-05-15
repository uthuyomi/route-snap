"use client";

import { CheckCircle2, Download, MonitorSmartphone, Plus, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PwaInstallSectionProps = {
  compact?: boolean;
};

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function getInstallGuide() {
  if (typeof navigator === "undefined") {
    return [
      "ブラウザでroute-snapを開きます。",
      "ブラウザメニューからアプリのインストール、またはホーム画面に追加を選びます。",
      "追加後はホーム画面やアプリ一覧から起動できます。",
    ];
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return [
      "Safariでroute-snapを開きます。",
      "画面下、または上部の共有ボタンを押します。",
      "「ホーム画面に追加」を選び、追加を押します。",
    ];
  }

  if (/android/.test(userAgent)) {
    return [
      "Chromeでroute-snapを開きます。",
      "右上のメニューから「アプリをインストール」または「ホーム画面に追加」を選びます。",
      "追加後はホーム画面からすぐ起動できます。",
    ];
  }

  return [
    "ChromeまたはEdgeでroute-snapを開きます。",
    "アドレスバー右側のインストールアイコン、またはブラウザメニューの「アプリをインストール」を選びます。",
    "インストール後はデスクトップやアプリ一覧から起動できます。",
  ];
}

export function PwaInstallSection({ compact = false }: PwaInstallSectionProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [message, setMessage] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const canPrompt = Boolean(installPrompt);
  const installGuide = useMemo(() => getInstallGuide(), []);
  const platformHint = useMemo(() => {
    if (typeof navigator === "undefined") return "PC・スマホのブラウザから追加できます。";
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return "iPhone/iPadは共有ボタンから「ホーム画面に追加」を選ぶと使えます。";
    }
    if (/android/.test(userAgent)) {
      return "Androidはボタンからインストール、またはブラウザメニューから追加できます。";
    }
    return "PCは対応ブラウザならボタンからインストールできます。";
  }, []);

  useEffect(() => {
    window.setTimeout(() => {
      setIsInstalled(isStandaloneMode());
    }, 0);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability should not block the app if the browser rejects SW registration.
      });
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      setMessage("インストール済みです。次回からホーム画面やアプリ一覧から開けます。");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setMessage(platformHint);
      setShowGuide((current) => !current);
      return;
    }

    setShowGuide(false);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setMessage(
      choice.outcome === "accepted"
        ? "インストールを開始しました。"
        : "必要になったら、いつでもこのボタンから追加できます。"
    );
  }

  return (
    <section className={compact ? "app-panel grid gap-4 p-4" : "mx-auto w-full max-w-7xl px-5 pb-9 sm:px-8"}>
      <div className={compact ? "grid gap-4 rounded-3xl bg-blue-700 p-5 text-white" : "grid gap-5 overflow-hidden rounded-2xl bg-blue-700 p-7 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center"}>
        <div className="grid gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white">
            <MonitorSmartphone size={25} aria-hidden="true" />
          </span>
          <div>
            <h2 className={compact ? "m-0 text-xl font-black" : "m-0 text-3xl font-black leading-tight"}>
              アプリをインストール
            </h2>
            <p className="m-0 mt-2 max-w-3xl text-sm font-bold leading-7 text-blue-50">
              PCでもモバイル端末でも、ホーム画面やアプリ一覧からroute-snapをすぐ開けます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-black text-blue-50">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1">
              <Smartphone size={14} aria-hidden="true" />
              モバイル対応
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1">
              <CheckCircle2 size={14} aria-hidden="true" />
              PC対応
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1">
              <Plus size={14} aria-hidden="true" />
              すぐ起動
            </span>
          </div>
        </div>

        <div className={compact ? "grid gap-2" : "grid min-w-64 gap-2"}>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 active:scale-[0.98]"
            type="button"
            onClick={installApp}
            disabled={isInstalled}
          >
            <Download size={18} aria-hidden="true" />
            <span>{isInstalled ? "インストール済み" : canPrompt ? "インストールする" : "追加方法を見る"}</span>
          </button>
          <p className="m-0 text-xs font-bold leading-6 text-blue-50">{message || platformHint}</p>
        </div>
      </div>
      {showGuide ? (
        <div className={compact ? "rounded-2xl border border-blue-100 bg-white p-4 text-[#071936]" : "mt-3 rounded-2xl border border-blue-100 bg-white p-5 text-[#071936] shadow-sm"}>
          <h3 className="m-0 text-base font-black">追加方法</h3>
          <ol className="m-0 mt-3 grid gap-2 p-0">
            {installGuide.map((step, index) => (
              <li key={step} className="grid grid-cols-[1.75rem_1fr] items-start gap-2 text-sm font-bold leading-7 text-slate-600">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

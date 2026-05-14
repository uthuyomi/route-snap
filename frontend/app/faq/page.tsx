"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CreditCard,
  FileSpreadsheet,
  HelpCircle,
  MapPinned,
  RotateCcw,
  ScanText,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { LegalFooter } from "../components/LegalFooter";
import { usePreferredLocale } from "../lib/locale";

const contactEmail = "kaiseif4e@gmail.com";

const faqItems = [
  {
    question: "配送以外でも使えますか？",
    answer:
      "はい。営業訪問、点検、訪問介護、清掃、保守、不動産巡回、設備管理など、住所を扱う現場業務で利用できます。",
    icon: Truck,
  },
  {
    question: "AIの読み取りは正確ですか？",
    answer:
      "AIの読み取り結果は正確とは限りません。実際の配送・訪問・移動前に、住所、施設名、部屋番号、訪問時間、ルートを必ず確認してください。",
    icon: BadgeCheck,
  },
  {
    question: "Google Mapsと連携できますか？",
    answer:
      "はい。読み取った住所や整理した訪問先をGoogle Mapsで開けるようにします。ナビ開始前にGoogle Maps上のルートも確認してください。",
    icon: MapPinned,
  },
  {
    question: "スマホで使えますか？",
    answer:
      "はい。ブラウザ上で利用でき、スマホ・PCの両方に対応します。スマホではホーム画面に追加すると、アプリのようにすぐ開けます。",
    icon: Smartphone,
  },
  {
    question: "無料プランで何ができますか？",
    answer:
      "無料プランでは、住所読み取りやルート整理を少量から試せます。現場の伝票・メモ・スクリーンショットで使い勝手を確認してから有料プランを選べます。",
    icon: ScanText,
  },
  {
    question: "CSVやTXTに対応していますか？",
    answer:
      "はい。CSV、TXT、TSV、JSONなどのファイルから訪問先をまとめて追加できます。料金ページでは、この利用量を「訪問先一括登録」として表示しています。",
    icon: FileSpreadsheet,
  },
  {
    question: "解約はできますか？",
    answer:
      "はい。アカウントページの支払い管理、またはメールでの問い合わせにより解約できます。解約後も支払い済み期間の終了までは利用できる場合があります。",
    icon: RotateCcw,
  },
  {
    question: "返金はありますか？",
    answer:
      "デジタルサービスの性質上、決済完了後のお客様都合による返金は原則として行いません。重複決済や当サービス起因の障害がある場合は個別に対応します。",
    icon: CreditCard,
  },
  {
    question: "住所や画像データはどのように扱われますか？",
    answer:
      "住所読み取り、ルート作成、利用履歴管理、不正利用防止、品質改善、問い合わせ対応に必要な範囲で処理します。個人情報や業務上の機密情報を含む場合があるため、必要な権限を持つ情報のみアップロードしてください。",
    icon: ShieldCheck,
  },
];

export default function FaqPage() {
  const [locale, setLocale] = usePreferredLocale();

  return (
    <main className="app-surface min-h-svh text-neutral-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <AppHeader locale={locale} onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} currentPage="home" />

        <section className="grid gap-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-emerald-100 md:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              よくある質問
            </div>
            <h1 className="m-0 mt-4 text-3xl font-black leading-tight tracking-tight text-neutral-950 sm:text-5xl">
              Route Snap の使い方と料金について
            </h1>
            <p className="m-0 mt-4 max-w-2xl text-sm font-semibold leading-7 text-neutral-600 sm:text-base">
              配送・訪問・点検・清掃など、住所を扱う現場業務で使う前に確認されやすい内容をまとめています。
            </p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {faqItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.question}
                className="group grid gap-3 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-emerald-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="m-0 text-base font-black text-neutral-950">{item.question}</h2>
                    <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 rounded-[28px] bg-[#10251d] p-5 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-7">
          <div>
            <h2 className="m-0 text-2xl font-black">解決しない場合はお問い合わせください</h2>
            <p className="m-0 mt-2 text-sm font-semibold leading-6 text-emerald-50/80">
              決済、解約、データの扱い、利用方法について確認したい場合は、{contactEmail} までご連絡ください。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-emerald-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              問い合わせる
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              料金を見る
            </Link>
          </div>
        </section>

        <LegalFooter />
      </div>
    </main>
  );
}

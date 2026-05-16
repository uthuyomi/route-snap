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
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useVisitorLocale } from "../lib/locale";

const contactEmail = "kaiseif4e@gmail.com";

const faqCopy = {
  ja: {
    eyebrow: "よくある質問",
    title: "Route Snap の使い方と料金について",
    lead: "配送・訪問・点検・清掃など、住所を扱う現場業務で使う前に確認されやすい内容をまとめています。",
    contactTitle: "解決しない場合はお問い合わせください",
    contactLead: `決済、解約、データの扱い、利用方法について確認したい場合は、${contactEmail} までご連絡ください。`,
    contact: "問い合わせる",
    pricing: "料金を見る",
    items: [
      { question: "配送以外でも使えますか？", answer: "はい。営業訪問、点検、訪問介護、清掃、保守、不動産巡回、設備管理など、住所を扱う現場業務で利用できます。", icon: Truck },
      { question: "AIの読み取りは正確ですか？", answer: "AIの読み取り結果は正確とは限りません。実際の配送・訪問・移動前に、住所、施設名、部屋番号、訪問時間、ルートを必ず確認してください。", icon: BadgeCheck },
      { question: "Google Mapsと連携できますか？", answer: "はい。読み取った住所や整理した訪問先をGoogle Mapsで開けるようにします。ナビ開始前にGoogle Maps上のルートも確認してください。", icon: MapPinned },
      { question: "スマホで使えますか？", answer: "はい。ブラウザ上で利用でき、スマホ・PCの両方に対応します。スマホではホーム画面に追加すると、アプリのようにすぐ開けます。", icon: Smartphone },
      { question: "無料プランで何ができますか？", answer: "無料プランでは、住所読み取りやルート整理を少量から試せます。現場の伝票・メモ・スクリーンショットで使い勝手を確認してから有料プランを選べます。", icon: ScanText },
      { question: "CSVやTXTに対応していますか？", answer: "はい。CSV、TXT、TSV、JSONなどのファイルから訪問先をまとめて追加できます。料金ページでは、この利用量を「訪問先一括登録」として表示しています。", icon: FileSpreadsheet },
      { question: "解約はできますか？", answer: "はい。アカウントページの支払い管理、またはメールでの問い合わせにより解約できます。解約後も支払い済み期間の終了までは利用できる場合があります。", icon: RotateCcw },
      { question: "返金はありますか？", answer: "デジタルサービスの性質上、決済完了後のお客様都合による返金は原則として行いません。重複決済や当サービス起因の障害がある場合は個別に対応します。", icon: CreditCard },
      { question: "住所や画像データはどのように扱われますか？", answer: "住所読み取り、ルート作成、利用履歴管理、不正利用防止、品質改善、問い合わせ対応に必要な範囲で処理します。個人情報や業務上の機密情報を含む場合があるため、必要な権限を持つ情報のみアップロードしてください。", icon: ShieldCheck },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Using Route Snap and choosing a plan",
    lead: "Answers for field teams that handle addresses for delivery, visits, inspections, cleaning, and similar work.",
    contactTitle: "Still need help?",
    contactLead: `For billing, cancellation, data handling, or usage questions, contact ${contactEmail}.`,
    contact: "Contact us",
    pricing: "View pricing",
    items: [
      { question: "Can I use it outside delivery?", answer: "Yes. It works for sales visits, inspections, care visits, cleaning, maintenance, property rounds, facility management, and other address-based field work.", icon: Truck },
      { question: "Is the AI reading always accurate?", answer: "AI results may be inaccurate. Always check addresses, facility names, room numbers, visit times, and routes before delivery, visits, or travel.", icon: BadgeCheck },
      { question: "Does it work with Google Maps?", answer: "Yes. You can open extracted addresses and organized destinations in Google Maps. Please confirm the route in Google Maps before starting navigation.", icon: MapPinned },
      { question: "Can I use it on a phone?", answer: "Yes. It runs in the browser on mobile and desktop. Add it to your home screen for app-like access on mobile.", icon: Smartphone },
      { question: "What can I do on the free plan?", answer: "The free plan lets you try address reading and route organization with a small amount of usage before choosing a paid plan.", icon: ScanText },
      { question: "Do CSV and TXT files work?", answer: "Yes. You can bulk add destinations from CSV, TXT, TSV, JSON, and similar files. Pricing refers to this as bulk destination import.", icon: FileSpreadsheet },
      { question: "Can I cancel?", answer: "Yes. You can manage payment from your account page or contact support. You may keep access until the end of the paid period.", icon: RotateCcw },
      { question: "Do you offer refunds?", answer: "Because this is a digital service, customer-requested refunds are generally not provided after payment. Duplicate charges or service-caused issues are reviewed individually.", icon: CreditCard },
      { question: "How are address and image data handled?", answer: "Data is processed only as needed for address reading, route creation, usage history, abuse prevention, quality improvement, and support. Upload only information you have permission to use.", icon: ShieldCheck },
    ],
  },
} as const;

export default function FaqPage() {
  const locale = useVisitorLocale();
  const t = faqCopy[locale];

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap">

        <section className="site-section grid gap-5">
          <div className="max-w-3xl">
            <div className="site-kicker">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              {t.eyebrow}
            </div>
            <h1 className="site-title mt-4">
              {t.title}
            </h1>
            <p className="site-lead mt-4">
              {t.lead}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {t.items.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.question}
                className="site-card group grid gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="m-0 text-base font-black text-[#061a3a]">{item.question}</h2>
                    <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-600">{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 rounded-2xl bg-blue-700 p-6 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="m-0 text-2xl font-black">{t.contactTitle}</h2>
            <p className="m-0 mt-3 text-sm font-bold leading-7 text-blue-50">
              {t.contactLead}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              {t.contact}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              {t.pricing}
            </Link>
          </div>
        </section>

      </div>
      <SiteFooter />
    </main>
  );
}

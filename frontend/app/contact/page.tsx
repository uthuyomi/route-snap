"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, CreditCard, HelpCircle, Mail, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useVisitorLocale } from "../lib/locale";

const contactEmail = "kaiseif4e@gmail.com";

type ContactFormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const contactCopy = {
  ja: {
    eyebrow: "お問い合わせ",
    title: "Route Snap へのお問い合わせ",
    lead: "使い方、料金、解約、返金、データの扱いについて確認したい場合は、このページから送信できます。",
    formCta: "フォームから問い合わせる",
    faq: "FAQを見る",
    contactLabel: "Contact",
    responseNote: "通常3営業日以内に返信します。内容により、本人確認や追加情報をお願いする場合があります。",
    formTitle: "お問い合わせフォーム",
    formLead: "入力内容はRoute Snap運営宛に送信されます。メールアプリを開かず、このページ内で送信完了まで確認できます。",
    name: "お名前",
    namePlaceholder: "例: 山田 太郎",
    email: "メールアドレス",
    topic: "お問い合わせ種別",
    message: "お問い合わせ内容",
    messagePlaceholder: "確認したい内容を入力してください。決済や解約の場合は、登録メールアドレスや対象プランも記載してください。",
    sending: "送信中...",
    send: "送信する",
    successTitle: "送信が完了しました",
    successMessage: "お問い合わせを送信しました。通常3営業日以内に返信します。",
    sendAnother: "別の内容を送信する",
    failed: "送信に失敗しました。",
    failedRetry: "送信に失敗しました。時間をおいて再度お試しください。",
    beforeTitle: "送信前にご確認ください",
    before1: `送信後、このページに送信完了メッセージが表示されます。送信できない場合は、${contactEmail} 宛に直接ご連絡ください。`,
    before2: "AIの読み取り結果や住所データを送る場合は、個人情報や業務上の機密情報を必要な範囲に絞ってください。",
    includeTitle: "お問い合わせ時に記載いただきたい内容",
    include: [
      "料金・決済の場合: 登録メールアドレス、対象プラン、決済日時、確認したい内容",
      "不具合の場合: 利用端末、ブラウザ、発生したページ、操作手順、表示されたエラー",
      "読み取り結果の場合: 画像の状態、住所の種類、期待した結果、実際の出力内容",
      "解約・返金の場合: 登録メールアドレス、対象プラン、理由、重複決済の有無",
    ],
    options: ["使い方について", "料金・決済について", "解約・返金について", "データの扱いについて", "不具合について", "その他"],
    topics: [
      { title: "使い方について", body: "住所読み取り、CSV/TXT取り込み、Google Maps連携、スマホでの利用方法について確認できます。", icon: HelpCircle },
      { title: "料金・決済について", body: "プラン選択、決済状況、領収書、解約、重複決済などの相談を受け付けます。", icon: CreditCard },
      { title: "データの扱いについて", body: "アップロード画像、住所データ、AI処理、プライバシーに関する確認はこちらからご連絡ください。", icon: ShieldCheck },
    ],
  },
  en: {
    eyebrow: "Contact",
    title: "Contact Route Snap",
    lead: "Send questions about usage, pricing, cancellation, refunds, or data handling from this page.",
    formCta: "Contact from the form",
    faq: "View FAQ",
    contactLabel: "Contact",
    responseNote: "We usually reply within 3 business days. We may ask for identity confirmation or more details depending on the request.",
    formTitle: "Contact form",
    formLead: "Your message is sent to the Route Snap team and can be completed on this page without opening an email app.",
    name: "Name",
    namePlaceholder: "e.g. Taro Yamada",
    email: "Email address",
    topic: "Topic",
    message: "Message",
    messagePlaceholder: "Enter what you want to confirm. For billing or cancellation, include your account email and target plan.",
    sending: "Sending...",
    send: "Send",
    successTitle: "Message sent",
    successMessage: "Your message has been sent. We usually reply within 3 business days.",
    sendAnother: "Send another message",
    failed: "Failed to send.",
    failedRetry: "Failed to send. Please wait and try again.",
    beforeTitle: "Before sending",
    before1: `After sending, a completion message appears on this page. If sending fails, contact ${contactEmail} directly.`,
    before2: "If you include AI results or address data, limit personal or confidential information to what is necessary.",
    includeTitle: "Useful details to include",
    include: [
      "Billing: account email, plan, payment date, and what you want to confirm",
      "Bug report: device, browser, page, steps, and displayed error",
      "Reading result: image condition, address type, expected result, and actual output",
      "Cancellation/refund: account email, plan, reason, and whether there was a duplicate charge",
    ],
    options: ["How to use", "Pricing and billing", "Cancellation and refunds", "Data handling", "Bug report", "Other"],
    topics: [
      { title: "How to use", body: "Ask about address reading, CSV/TXT import, Google Maps integration, and mobile usage.", icon: HelpCircle },
      { title: "Pricing and billing", body: "Ask about plan selection, payment status, receipts, cancellation, or duplicate charges.", icon: CreditCard },
      { title: "Data handling", body: "Contact us about uploaded images, address data, AI processing, and privacy.", icon: ShieldCheck },
    ],
  },
} as const;

export default function ContactPage() {
  const locale = useVisitorLocale();
  const t = contactCopy[locale];
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    email: "",
    topic: contactCopy.ja.options[0],
    message: "",
  });

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json().catch(() => ({}))) as { detail?: string };

      if (!response.ok) {
        throw new Error(result.detail ?? t.failed);
      }

      setSubmitState("success");
      setSubmitMessage(t.successMessage);
      setForm({
        name: "",
        email: "",
        topic: t.options[0],
        message: "",
      });
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : t.failedRetry);
    }
  }

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap">

        <section className="site-section grid gap-6 md:grid-cols-[1fr_22rem]">
          <div className="max-w-3xl">
            <div className="site-kicker">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t.eyebrow}
            </div>
            <h1 className="site-title mt-4">
              {t.title}
            </h1>
            <p className="site-lead mt-4">
              {t.lead}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#contact-form"
                className="site-primary"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {t.formCta}
              </Link>
              <Link
                href="/faq"
                className="site-secondary"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                {t.faq}
              </Link>
            </div>
          </div>

          <aside className="grid gap-4 rounded-2xl bg-blue-700 p-5 text-white shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <MessageSquareText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="m-0 text-xs font-black uppercase tracking-normal text-blue-100">{t.contactLabel}</p>
              <p className="m-0 mt-2 break-all text-lg font-black">{contactEmail}</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/10 p-4 text-sm font-bold leading-7 text-blue-50">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {t.responseNote}
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {t.topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <article
                key={topic.title}
                className="site-card grid gap-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="m-0 text-base font-black text-[#061a3a]">{topic.title}</h2>
                  <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-600">{topic.body}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section id="contact-form" className="site-section grid gap-6 md:grid-cols-[1fr_18rem]">
          <div>
            <h2 className="m-0 text-xl font-black text-neutral-950">{t.formTitle}</h2>
            <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-600">
              {t.formLead}
            </p>

            {submitState === "success" ? (
              <div className="mt-5 rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
                <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="m-0 text-lg font-black text-neutral-950">{t.successTitle}</h3>
                    <p className="m-0 mt-2 text-sm font-bold leading-7 text-slate-600">{submitMessage}</p>
                    <button
                      className="site-secondary mt-4"
                      type="button"
                      onClick={() => {
                        setSubmitState("idle");
                        setSubmitMessage("");
                      }}
                    >
                      {t.sendAnother}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {submitState !== "success" ? (
            <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-black text-neutral-800">
                {t.name}
                <input
                  className="site-field h-12 px-4 text-sm font-bold"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  disabled={submitState === "submitting"}
                  placeholder={t.namePlaceholder}
                  type="text"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-neutral-800">
                {t.email}
                <input
                  className="site-field h-12 px-4 text-sm font-bold"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  disabled={submitState === "submitting"}
                  placeholder="your-email@example.com"
                  required
                  type="email"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-neutral-800">
                {t.topic}
                <select
                  className="site-field h-12 px-4 text-sm font-bold"
                  value={form.topic}
                  onChange={(event) => updateField("topic", event.target.value)}
                  disabled={submitState === "submitting"}
                >
                  {t.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-black text-neutral-800">
                {t.message}
                <textarea
                  className="site-field min-h-36 resize-y px-4 py-3 text-sm font-bold leading-7"
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  disabled={submitState === "submitting"}
                  placeholder={t.messagePlaceholder}
                  required
                />
              </label>

              {submitState === "error" ? (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm font-bold leading-7 text-red-700 ring-1 ring-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {submitMessage}
                </div>
              ) : null}

              <button
                className="site-primary disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitState === "submitting"}
                type="submit"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {submitState === "submitting" ? t.sending : t.send}
              </button>
            </form>
            ) : null}
          </div>

          <aside className="grid content-start gap-4 rounded-2xl bg-blue-50 p-5 text-sm font-bold leading-7 text-slate-700 ring-1 ring-blue-100">
            <p className="m-0 font-black text-neutral-950">{t.beforeTitle}</p>
            <p className="m-0">
              {t.before1}
            </p>
            <p className="m-0">
              {t.before2}
            </p>
          </aside>
        </section>

        <section className="site-section">
          <h2 className="m-0 text-xl font-black text-neutral-950">{t.includeTitle}</h2>
          <div className="mt-5 grid gap-4 text-sm font-bold leading-7 text-slate-600 md:grid-cols-2">
            {t.include.map((item) => (
              <p key={item} className="m-0 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
                {item}
              </p>
            ))}
          </div>
        </section>

      </div>
      <SiteFooter />
    </main>
  );
}

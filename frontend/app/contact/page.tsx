"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, CreditCard, HelpCircle, Mail, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { LegalFooter } from "../components/LegalFooter";
import { usePreferredLocale } from "../lib/locale";

const contactEmail = "kaiseif4e@gmail.com";

const topics = [
  {
    title: "使い方について",
    body: "住所読み取り、CSV/TXT取り込み、Google Maps連携、スマホでの利用方法について確認できます。",
    icon: HelpCircle,
  },
  {
    title: "料金・決済について",
    body: "プラン選択、決済状況、領収書、解約、重複決済などの相談を受け付けます。",
    icon: CreditCard,
  },
  {
    title: "データの扱いについて",
    body: "アップロード画像、住所データ、AI処理、プライバシーに関する確認はこちらからご連絡ください。",
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  const [locale, setLocale] = usePreferredLocale();
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "使い方について",
    message: "",
  });

  function updateField(field: keyof typeof form, value: string) {
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
        throw new Error(result.detail ?? "送信に失敗しました。");
      }

      setSubmitState("success");
      setSubmitMessage("お問い合わせを送信しました。通常3営業日以内に返信します。");
      setForm({
        name: "",
        email: "",
        topic: "使い方について",
        message: "",
      });
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "送信に失敗しました。時間をおいて再度お試しください。");
    }
  }

  return (
    <main className="app-surface min-h-svh text-neutral-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <AppHeader locale={locale} onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} currentPage="home" />

        <section className="grid gap-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-emerald-100 md:grid-cols-[1fr_22rem] md:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
              <Mail className="h-4 w-4" aria-hidden="true" />
              お問い合わせ
            </div>
            <h1 className="m-0 mt-4 text-3xl font-black leading-tight tracking-tight text-neutral-950 sm:text-5xl">
              Route Snap へのお問い合わせ
            </h1>
            <p className="m-0 mt-4 max-w-2xl text-sm font-semibold leading-7 text-neutral-600 sm:text-base">
              使い方、料金、解約、返金、データの扱いについて確認したい場合は、このページから送信できます。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#contact-form"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                フォームから問い合わせる
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 text-sm font-black text-emerald-950 transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                FAQを見る
              </Link>
            </div>
          </div>

          <aside className="grid gap-3 rounded-[24px] bg-[#10251d] p-5 text-white shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <MessageSquareText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-emerald-100/80">Contact</p>
              <p className="m-0 mt-2 break-all text-lg font-black">{contactEmail}</p>
            </div>
            <div className="flex items-start gap-2 rounded-2xl bg-white/10 p-3 text-sm font-semibold leading-6 text-emerald-50/85">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              通常3営業日以内に返信します。内容により、本人確認や追加情報をお願いする場合があります。
            </div>
          </aside>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <article
                key={topic.title}
                className="grid gap-3 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-emerald-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="m-0 text-base font-black text-neutral-950">{topic.title}</h2>
                  <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{topic.body}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section id="contact-form" className="grid gap-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-emerald-100 md:grid-cols-[1fr_18rem] md:p-7">
          <div>
            <h2 className="m-0 text-xl font-black text-neutral-950">お問い合わせフォーム</h2>
            <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">
              入力内容はRoute Snap運営宛に送信されます。メールアプリを開かず、このページ内で送信完了まで確認できます。
            </p>

            {submitState === "success" ? (
              <div className="mt-5 rounded-[24px] bg-emerald-50 p-5 ring-1 ring-emerald-100">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-900 text-white">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="m-0 text-lg font-black text-neutral-950">送信が完了しました</h3>
                    <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{submitMessage}</p>
                    <button
                      className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-950 transition hover:border-emerald-500 hover:bg-emerald-50"
                      type="button"
                      onClick={() => {
                        setSubmitState("idle");
                        setSubmitMessage("");
                      }}
                    >
                      別の内容を送信する
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {submitState !== "success" ? (
            <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-black text-neutral-800">
                お名前
                <input
                  className="h-12 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  disabled={submitState === "submitting"}
                  placeholder="例: 山田 太郎"
                  type="text"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-neutral-800">
                メールアドレス
                <input
                  className="h-12 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  disabled={submitState === "submitting"}
                  placeholder="your-email@example.com"
                  required
                  type="email"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-neutral-800">
                お問い合わせ種別
                <select
                  className="h-12 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
                  value={form.topic}
                  onChange={(event) => updateField("topic", event.target.value)}
                  disabled={submitState === "submitting"}
                >
                  <option>使い方について</option>
                  <option>料金・決済について</option>
                  <option>解約・返金について</option>
                  <option>データの扱いについて</option>
                  <option>不具合について</option>
                  <option>その他</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-black text-neutral-800">
                お問い合わせ内容
                <textarea
                  className="min-h-36 resize-y rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-emerald-500 focus:bg-white"
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  disabled={submitState === "submitting"}
                  placeholder="確認したい内容を入力してください。決済や解約の場合は、登録メールアドレスや対象プランも記載してください。"
                  required
                />
              </label>

              {submitState === "error" ? (
                <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm font-bold leading-6 text-red-700 ring-1 ring-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {submitMessage}
                </div>
              ) : null}

              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                disabled={submitState === "submitting"}
                type="submit"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {submitState === "submitting" ? "送信中..." : "送信する"}
              </button>
            </form>
            ) : null}
          </div>

          <aside className="grid content-start gap-3 rounded-[24px] bg-emerald-50 p-5 text-sm font-semibold leading-6 text-neutral-700 ring-1 ring-emerald-100">
            <p className="m-0 font-black text-neutral-950">送信前にご確認ください</p>
            <p className="m-0">
              送信後、このページに送信完了メッセージが表示されます。送信できない場合は、{contactEmail} 宛に直接ご連絡ください。
            </p>
            <p className="m-0">
              AIの読み取り結果や住所データを送る場合は、個人情報や業務上の機密情報を必要な範囲に絞ってください。
            </p>
          </aside>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-emerald-100 md:p-7">
          <h2 className="m-0 text-xl font-black text-neutral-950">お問い合わせ時に記載いただきたい内容</h2>
          <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-neutral-600 md:grid-cols-2">
            <p className="m-0 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              料金・決済の場合: 登録メールアドレス、対象プラン、決済日時、確認したい内容
            </p>
            <p className="m-0 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              不具合の場合: 利用端末、ブラウザ、発生したページ、操作手順、表示されたエラー
            </p>
            <p className="m-0 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              読み取り結果の場合: 画像の状態、住所の種類、期待した結果、実際の出力内容
            </p>
            <p className="m-0 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              解約・返金の場合: 登録メールアドレス、対象プラン、理由、重複決済の有無
            </p>
          </div>
        </section>

        <LegalFooter locale={locale} />
      </div>
    </main>
  );
}

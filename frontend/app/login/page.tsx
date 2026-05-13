"use client";

import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AppHeader, AppLocale } from "../components/AppHeader";
import { usePreferredLocale } from "../lib/locale";

const messages = {
  ja: {
    title: "ログイン",
    lead: "無料枠を超える利用や有料プランの申し込みにはログインが必要です。",
    email: "メールアドレス",
    send: "ログインリンクを送信",
    sent: "メールを送信しました。リンクを開くとログインできます。",
    missingConfig: "Supabaseの公開URLと匿名キーが未設定です。",
    failed: "ログインメールを送信できませんでした。",
    back: "料金を見る",
    note: "ログイン後、プラン選択や利用枠の管理ができるようになります。"
  },
  en: {
    title: "Log in",
    lead: "Log in to use paid plans or continue after the free allowance.",
    email: "Email address",
    send: "Send login link",
    sent: "Email sent. Open the link to finish logging in.",
    missingConfig: "Supabase public URL and anon key are not configured.",
    failed: "Could not send the login email.",
    back: "View pricing",
    note: "After logging in, you can choose a plan and manage your allowance."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function LoginContent() {
  const [locale, setLocale] = usePreferredLocale();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const searchParams = useSearchParams();
  const t = messages[locale];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setMessage(t.missingConfig);
      return;
    }

    setIsSending(true);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const next = searchParams.get("next") || "/account";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    setIsSending(false);
    setMessage(error ? t.failed : t.sent);
  }

  return (
    <main className="min-h-svh app-surface px-4 py-4 sm:px-6 lg:py-8">
      <div className="mx-auto grid w-full max-w-3xl gap-5">
        <AppHeader locale={locale} currentPage="pricing" onToggleLocale={() => setLocale(locale === "ja" ? "en" : "ja")} />
        <section className="grid gap-5 rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-neutral-200 md:p-7">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-neutral-950 text-white">
            <ShieldCheck size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="m-0 text-3xl font-black text-neutral-950">{t.title}</h1>
            <p className="m-0 mt-2 text-sm font-semibold leading-6 text-neutral-600">{t.lead}</p>
          </div>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-2 text-sm font-black text-neutral-800">
              <span>{t.email}</span>
              <input
                className="form-field h-12 px-3"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <button className="primary-action" type="submit" disabled={isSending}>
              <Mail size={18} aria-hidden="true" />
              <span>{t.send}</span>
            </button>
          </form>
          {message ? <p className="m-0 rounded-lg bg-neutral-50 p-3 text-sm font-bold text-neutral-700">{message}</p> : null}
          <div className="grid gap-2 border-t border-neutral-200 pt-4">
            <p className="m-0 text-sm font-semibold leading-6 text-neutral-500">{t.note}</p>
            <Link className="secondary-action w-fit" href="/pricing">{t.back}</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

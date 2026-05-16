"use client";

import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AppLocale } from "../components/AppHeader";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useVisitorLocale } from "../lib/locale";

const messages = {
  ja: {
    title: "ログイン",
    lead: "無料枠を超える利用や有料プランの申し込みにはログインが必要です。",
    email: "メールアドレス",
    google: "Googleでログイン",
    send: "ログインリンクを送信",
    sent: "メールを送信しました。リンクを開くとログインできます。",
    missingConfig: "SupabaseのURLと匿名キーが未設定です。",
    failed: "ログインを開始できませんでした。",
    back: "料金を見る",
    divider: "またはメールでログイン",
    note: "ログイン後、プラン選択や利用枠の管理ができるようになります。"
  },
  en: {
    title: "Log in",
    lead: "Log in to use paid plans or continue after the free allowance.",
    email: "Email address",
    google: "Continue with Google",
    send: "Send login link",
    sent: "Email sent. Open the link to finish logging in.",
    missingConfig: "Supabase public URL and anon key are not configured.",
    failed: "Could not start login.",
    back: "View pricing",
    divider: "Or log in with email",
    note: "After logging in, you can choose a plan and manage your allowance."
  }
} satisfies Record<AppLocale, Record<string, string>>;

function LoginContent() {
  const locale = useVisitorLocale();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const searchParams = useSearchParams();
  const t = messages[locale];

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  function redirectTo() {
    const next = searchParams.get("next") || "/app";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function signInWithGoogle() {
    setMessage("");

    if (!supabase) {
      setMessage(t.missingConfig);
      return;
    }

    setIsSending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo()
      }
    });
    setIsSending(false);

    if (error) {
      setMessage(t.failed);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage(t.missingConfig);
      return;
    }

    setIsSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo()
      }
    });

    setIsSending(false);
    setMessage(error ? t.failed : t.sent);
  }

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap max-w-3xl">
        <section className="site-section grid gap-6">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="m-0 text-4xl font-black text-[#061a3a]">{t.title}</h1>
            <p className="m-0 mt-3 text-sm font-bold leading-7 text-slate-600">{t.lead}</p>
          </div>

          <button
            className="site-secondary gap-3"
            type="button"
            onClick={signInWithGoogle}
            disabled={isSending}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full border border-blue-100 bg-white text-sm font-black text-blue-700">G</span>
            <span>{t.google}</span>
          </button>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-black text-slate-400">
            <span className="h-px bg-blue-100" />
            <span>{t.divider}</span>
            <span className="h-px bg-blue-100" />
          </div>

          <form className="grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-2 text-sm font-black text-neutral-800">
              <span>{t.email}</span>
              <input
                className="site-field h-12 px-3"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <button className="site-primary" type="submit" disabled={isSending}>
              <Mail size={18} aria-hidden="true" />
              <span>{t.send}</span>
            </button>
          </form>
          {message ? <p className="m-0 rounded-lg bg-blue-50 p-4 text-sm font-bold leading-7 text-slate-700">{message}</p> : null}
          <div className="grid gap-3 border-t border-blue-100 pt-5">
            <p className="m-0 text-sm font-bold leading-7 text-slate-500">{t.note}</p>
            <Link className="site-secondary w-fit" href="/pricing">{t.back}</Link>
          </div>
        </section>
      </div>
      <SiteFooter />
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

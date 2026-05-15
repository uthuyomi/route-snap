"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusDashboard, type StatusDashboardProps } from "./StatusDashboard";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: StatusDashboardProps }
  | { status: "login" }
  | { status: "error"; message: string };

export function AccountStatusClient() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadStatus() {
      if (!supabase) {
        setState({ status: "error", message: "Supabaseの公開設定が見つかりません。" });
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        if (isActive) setState({ status: "login" });
        return;
      }

      const response = await fetch("/api/account/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!isActive) return;

      if (response.status === 401) {
        setState({ status: "login" });
        return;
      }

      if (!response.ok) {
        setState({ status: "error", message: "アカウント情報を読み込めませんでした。" });
        return;
      }

      setState({ status: "ready", data: await response.json() });
    }

    loadStatus();

    const { data } = supabase?.auth.onAuthStateChange(() => {
      loadStatus();
    }) ?? { data: null };

    return () => {
      isActive = false;
      data?.subscription.unsubscribe();
    };
  }, [supabase]);

  if (state.status === "ready") {
    return <StatusDashboard {...state.data} />;
  }

  if (state.status === "login") {
    return (
      <section className="site-section grid gap-5">
        <h1 className="m-0 text-4xl font-black text-[#061a3a]">ログインが必要です</h1>
        <p className="m-0 text-sm font-bold leading-7 text-slate-500">
          アカウントステータスを確認するには、もう一度ログインしてください。
        </p>
        <Link className="site-primary w-fit" href="/login?next=/account/status">
          ログイン
        </Link>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="site-section grid gap-3">
        <h1 className="m-0 text-4xl font-black text-[#061a3a]">読み込みエラー</h1>
        <p className="m-0 text-sm font-bold leading-7 text-slate-500">{state.message}</p>
      </section>
    );
  }

  return (
    <section className="site-section grid gap-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-blue-100" />
      <div className="h-36 animate-pulse rounded-2xl bg-blue-50" />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="h-52 animate-pulse rounded-2xl bg-blue-50" />
        <div className="h-52 animate-pulse rounded-2xl bg-blue-50" />
        <div className="h-52 animate-pulse rounded-2xl bg-blue-50" />
      </div>
    </section>
  );
}

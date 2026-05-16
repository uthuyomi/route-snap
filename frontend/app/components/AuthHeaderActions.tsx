"use client";

import { createClient, type User } from "@supabase/supabase-js";
import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useVisitorLocale } from "../lib/locale";
import { LogoutControl } from "./LogoutControl";

type AuthHeaderActionsProps = {
  loginHref?: string;
  appHref?: string;
  appLabel?: string;
};

const authCopy = {
  ja: {
    account: "アカウント",
    app: "アプリに移動",
    login: "ログイン",
    start: "無料で始める",
    logout: "ログアウト",
  },
  en: {
    account: "Account",
    app: "Open app",
    login: "Log in",
    start: "Start free",
    logout: "Log out",
  },
} as const;

function getAccountName(user: User | null, fallback: string) {
  if (!user) return "";
  const metadataName = user.user_metadata?.name || user.user_metadata?.full_name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email ?? fallback;
}

export function AuthHeaderActions({ loginHref = "/login?next=/app", appHref = "/app", appLabel }: AuthHeaderActionsProps) {
  const [user, setUser] = useState<User | null>(null);
  const locale = useVisitorLocale();
  const t = authCopy[locale];
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isActive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isActive) setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  if (user) {
    const accountName = getAccountName(user, t.account);
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Link className="hidden min-h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 md:inline-flex" href={appHref}>
          {appLabel ?? t.app}
        </Link>
        <Link className="hidden min-h-10 max-w-52 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-black text-[#061a3a] shadow-sm transition hover:border-blue-300 sm:inline-flex" href="/account/status" title={accountName}>
          <UserCircle className="shrink-0 text-blue-600" size={20} aria-hidden="true" />
          <span className="truncate">{accountName}</span>
        </Link>
        <Link className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-sm transition hover:border-blue-300 sm:hidden" href="/account/status" aria-label={accountName} title={accountName}>
          <UserCircle size={20} aria-hidden="true" />
        </Link>
        <LogoutControl className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 bg-white text-[#061a3a] shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60" label={t.logout}>
          <LogOut size={18} aria-hidden="true" />
        </LogoutControl>
      </div>
    );
  }

  return (
    <>
      <Link className="hidden min-h-10 items-center justify-center rounded-lg border border-blue-100 bg-white px-5 text-sm font-black text-[#061a3a] shadow-sm transition hover:border-blue-300 sm:inline-flex" href={loginHref}>
        {t.login}
      </Link>
      <Link className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700" href={appHref}>
        {t.start}
      </Link>
    </>
  );
}

export function AppMoveCta({ className, children, icon }: { className: string; children?: ReactNode; icon?: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const locale = useVisitorLocale();
  const t = authCopy[locale];
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isActive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isActive) setIsLoggedIn(Boolean(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Link className={className} href="/app">
      <span>{isLoggedIn ? t.app : children}</span>
      {icon}
    </Link>
  );
}

"use client";

import { createClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type LogoutControlProps = {
  children: ReactNode;
  className: string;
  label: string;
  title?: string;
};

export function LogoutControl({ children, className, label, title }: LogoutControlProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  async function signOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await supabase?.auth.signOut();
    } finally {
      window.location.assign("/logout");
    }
  }

  return (
    <button
      className={className}
      type="button"
      aria-label={label}
      title={title ?? label}
      disabled={isSigningOut}
      onClick={signOut}
    >
      {children}
    </button>
  );
}

"use client";

import { CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AccountActionsProps = {
  manageLabel: string;
  logoutLabel: string;
};

export function AccountActions({ manageLabel, logoutLabel }: AccountActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function openPortal() {
    setIsLoading(true);
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const payload = (await response.json()) as { url?: string; detail?: string };
    setIsLoading(false);

    if (response.ok && payload.url) {
      window.location.assign(payload.url);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className="primary-action" type="button" onClick={openPortal} disabled={isLoading}>
        <CreditCard size={18} aria-hidden="true" />
        <span>{manageLabel}</span>
      </button>
      <Link className="secondary-action" href="/logout">
        <LogOut size={18} aria-hidden="true" />
        <span>{logoutLabel}</span>
      </Link>
    </div>
  );
}


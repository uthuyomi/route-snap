"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useVisitorLocale } from "../lib/locale";

const menuCopy = {
  ja: {
    menu: "メニュー",
    close: "メニューを閉じる",
    nav: "サイトメニュー",
    items: [
      { href: "/?landing=1", label: "トップ" },
      { href: "/?landing=1#features", label: "機能" },
      { href: "/?landing=1#steps", label: "使い方" },
      { href: "/pricing", label: "料金" },
      { href: "/faq", label: "よくある質問" },
      { href: "/contact", label: "お問い合わせ" },
    ],
  },
  en: {
    menu: "Menu",
    close: "Close menu",
    nav: "Site menu",
    items: [
      { href: "/?landing=1", label: "Home" },
      { href: "/?landing=1#features", label: "Features" },
      { href: "/?landing=1#steps", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
} as const;

export function SiteMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useVisitorLocale();
  const t = menuCopy[locale];

  return (
    <>
      <button
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-blue-100 bg-white text-[#061a3a] shadow-sm lg:hidden"
        type="button"
        aria-label={isOpen ? t.close : t.menu}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[2147483647] lg:hidden" role="presentation">
          <button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/20" type="button" aria-label={t.close} onClick={() => setIsOpen(false)} />
          <nav className="absolute left-4 right-4 top-20 grid gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.25)]" aria-label={t.nav}>
            {t.items.map((item) => (
              <Link
                key={item.href}
                className="flex min-h-12 items-center justify-between rounded-xl border border-blue-100 bg-white px-4 text-sm font-black text-[#061a3a] shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}

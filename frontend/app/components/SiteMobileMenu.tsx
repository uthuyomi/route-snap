"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { href: "/?landing=1", label: "トップ" },
  { href: "/?landing=1#features", label: "機能" },
  { href: "/?landing=1#steps", label: "使い方" },
  { href: "/pricing", label: "料金" },
  { href: "/faq", label: "よくある質問" },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-blue-100 bg-white text-[#061a3a] shadow-sm lg:hidden"
        type="button"
        aria-label={isOpen ? "メニューを閉じる" : "メニュー"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[2147483647] lg:hidden" role="presentation">
          <button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/20" type="button" aria-label="メニューを閉じる" onClick={() => setIsOpen(false)} />
          <nav className="absolute left-4 right-4 top-20 grid gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.25)]" aria-label="サイトメニュー">
            {menuItems.map((item) => (
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

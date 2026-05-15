import { MapPinned } from "lucide-react";
import Link from "next/link";
import { AuthHeaderActions } from "./AuthHeaderActions";
import { SiteMobileMenu } from "./SiteMobileMenu";

const appName = "route-snap";

function LogoMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white">
      <MapPinned size={22} strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-blue-50 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="inline-flex items-center gap-3" href="/?landing=1" aria-label={appName}>
          <LogoMark />
          <span className="text-xl font-black tracking-normal text-[#061a3a] sm:text-2xl">{appName}</span>
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-black text-[#061a3a] lg:flex" aria-label="Route Snap">
          <Link href="/?landing=1">トップ</Link>
          <Link href="/?landing=1#features">機能</Link>
          <Link href="/?landing=1#steps">使い方</Link>
          <Link href="/pricing">料金</Link>
          <Link href="/faq">よくある質問</Link>
        </nav>

        <div className="flex items-center gap-3">
          <AuthHeaderActions />
          <SiteMobileMenu />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-blue-50 px-5 py-5 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
        <Link className="inline-flex items-center gap-2 text-[#061a3a]" href="/?landing=1">
          <LogoMark />
          <span>{appName}</span>
        </Link>
        <nav className="flex flex-wrap gap-5">
          <Link href="/?landing=1">トップ</Link>
          <Link href="/?landing=1#features">機能</Link>
          <Link href="/pricing">料金</Link>
          <Link href="/faq">よくある質問</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/legal/terms">利用規約</Link>
          <Link href="/legal/privacy">プライバシーポリシー</Link>
          <Link href="/legal/tokusho">特定商取引法に基づく表記</Link>
        </nav>
        <span>© 2024 route-snap</span>
      </div>
    </footer>
  );
}

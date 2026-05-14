import Link from "next/link";
import { AppLocale } from "./AppHeader";

const labels = {
  ja: {
    home: "トップ",
    pricing: "料金",
    login: "ログイン",
    faq: "FAQ",
    contact: "お問い合わせ",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    tokusho: "特定商取引法に基づく表記",
  },
  en: {
    home: "Home",
    pricing: "Pricing",
    login: "Log in",
    faq: "FAQ",
    contact: "Contact",
    terms: "Terms",
    privacy: "Privacy",
    tokusho: "Commercial Disclosure",
  },
} satisfies Record<AppLocale, Record<string, string>>;

export function LegalFooter({ locale = "ja" }: { locale?: AppLocale }) {
  const t = labels[locale];

  return (
    <footer className="flex flex-wrap items-center justify-center gap-3 py-4 text-xs font-bold text-neutral-500">
      <Link className="hover:text-neutral-950" href="/">
        {t.home}
      </Link>
      <Link className="hover:text-neutral-950" href="/pricing">
        {t.pricing}
      </Link>
      <Link className="hover:text-neutral-950" href="/login">
        {t.login}
      </Link>
      <Link className="hover:text-neutral-950" href="/faq">
        {t.faq}
      </Link>
      <Link className="hover:text-neutral-950" href="/contact">
        {t.contact}
      </Link>
      <Link className="hover:text-neutral-950" href="/legal/terms">
        {t.terms}
      </Link>
      <Link className="hover:text-neutral-950" href="/legal/privacy">
        {t.privacy}
      </Link>
      <Link className="hover:text-neutral-950" href="/legal/tokusho">
        {t.tokusho}
      </Link>
    </footer>
  );
}

import Link from "next/link";
import { AppLocale } from "./AppHeader";

const labels = {
  ja: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    tokusho: "特定商取引法に基づく表記"
  },
  en: {
    terms: "Terms",
    privacy: "Privacy",
    tokusho: "Commercial Disclosure"
  }
} satisfies Record<AppLocale, Record<string, string>>;

export function LegalFooter({ locale }: { locale: AppLocale }) {
  const t = labels[locale];

  return (
    <footer className="flex flex-wrap items-center justify-center gap-3 py-4 text-xs font-bold text-neutral-500">
      <Link className="hover:text-neutral-950" href="/legal/terms">{t.terms}</Link>
      <Link className="hover:text-neutral-950" href="/legal/privacy">{t.privacy}</Link>
      <Link className="hover:text-neutral-950" href="/legal/tokusho">{t.tokusho}</Link>
    </footer>
  );
}

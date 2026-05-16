"use client";

import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useVisitorLocale } from "../lib/locale";

type LegalLayoutProps = {
  title: string;
  lead: string;
  enTitle?: string;
  enLead?: string;
  enSections?: ReadonlyArray<{ title: string; body: ReadonlyArray<string> }>;
  children: React.ReactNode;
};

export function LegalLayout({ title, lead, enTitle, enLead, enSections, children }: LegalLayoutProps) {
  const locale = useVisitorLocale();
  const isEnglish = locale === "en" && enTitle && enLead && enSections;

  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap max-w-4xl">
        <Link className="w-fit text-sm font-black text-blue-600 hover:text-blue-700" href="/?landing=1">
          route-snap
        </Link>
        <section className="site-section grid gap-6">
          <div>
            <h1 className="m-0 text-3xl font-black leading-tight text-[#061a3a] sm:text-4xl">{isEnglish ? enTitle : title}</h1>
            <p className="m-0 mt-4 text-sm font-bold leading-8 text-slate-600">{isEnglish ? enLead : lead}</p>
          </div>
          <div className="grid gap-5 text-sm font-semibold leading-8 text-slate-700">
            {isEnglish
              ? enSections.map((section) => (
                  <section key={section.title}>
                    <h2 className="m-0 text-lg font-black text-neutral-950">{section.title}</h2>
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="m-0 mt-2">
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))
              : children}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

export function LegalTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid overflow-hidden rounded-2xl border border-blue-100 bg-white">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-2 border-b border-blue-100 p-4 last:border-b-0 sm:grid-cols-[12rem_1fr]">
          <dt className="font-black text-[#061a3a]">{label}</dt>
          <dd className="m-0 whitespace-pre-wrap font-semibold text-slate-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

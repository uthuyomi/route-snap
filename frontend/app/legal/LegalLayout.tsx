import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

type LegalLayoutProps = {
  title: string;
  lead: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, lead, children }: LegalLayoutProps) {
  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap max-w-4xl">
        <Link className="w-fit text-sm font-black text-blue-600 hover:text-blue-700" href="/?landing=1">
          route-snap
        </Link>
        <section className="site-section grid gap-6">
          <div>
            <h1 className="m-0 text-3xl font-black leading-tight text-[#061a3a] sm:text-4xl">{title}</h1>
            <p className="m-0 mt-4 text-sm font-bold leading-8 text-slate-600">{lead}</p>
          </div>
          <div className="grid gap-5 text-sm font-semibold leading-8 text-slate-700">{children}</div>
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

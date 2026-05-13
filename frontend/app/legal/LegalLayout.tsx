import Link from "next/link";

type LegalLayoutProps = {
  title: string;
  lead: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, lead, children }: LegalLayoutProps) {
  return (
    <main className="min-h-svh bg-[#f7f4ed] px-4 py-6 text-neutral-950 sm:px-6 lg:py-10">
      <div className="mx-auto grid w-full max-w-4xl gap-5">
        <Link className="w-fit text-sm font-black text-neutral-600 hover:text-neutral-950" href="/">
          Route Snap
        </Link>
        <section className="grid gap-5 rounded-lg bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-8">
          <div>
            <h1 className="m-0 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
            <p className="m-0 mt-3 text-sm font-semibold leading-6 text-neutral-600">{lead}</p>
          </div>
          <div className="grid gap-4 text-sm leading-7 text-neutral-700">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function LegalTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid overflow-hidden rounded-lg border border-neutral-200">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-b border-neutral-200 p-3 last:border-b-0 sm:grid-cols-[12rem_1fr]">
          <dt className="font-black text-neutral-950">{label}</dt>
          <dd className="m-0 whitespace-pre-wrap font-semibold text-neutral-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}


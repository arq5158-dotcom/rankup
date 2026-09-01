import { PageShell } from "./PageShell";

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell>
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-black text-gold-grad">{title}</h1>
        <p className="mt-2 text-[12px] text-white/35">Last updated {updated}</p>
        <article className="legal mt-8">{children}</article>
      </main>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { PrizePools } from "@/components/rank/PrizePools";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/prizes")({
  head: () =>
    seoHead({
      title: "Prizes",
      description:
        "Monthly top three take home cash plus exclusive badges. The weekly sprint is winner-take-all.",
      path: "/prizes",
    }),
  loader: async () => ({ prizes: await getPrizes() }),
  component: Page,
});

function Page() {
  const { prizes } = Route.useLoaderData();
  return (
    <PageShell active="Prizes">
      <main className="relative z-10 mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-black text-gold-grad">Prizes</h1>
        <p className="max-w-xl text-sm text-white/45">
          Monthly top three take home cash plus exclusive badges. The weekly sprint is winner-take-all.
          Amounts shown are the current published pool and may be updated before a cycle closes. See the{" "}
          <a href="/rules" className="text-gold hover:underline">
            official rules
          </a>
          .
        </p>
        <PrizePools prizes={prizes} />
      </main>
    </PageShell>
  );
}

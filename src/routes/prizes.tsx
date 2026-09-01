import { createFileRoute } from "@tanstack/react-router";
import { getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { PrizePools } from "@/components/rank/PrizePools";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/prizes")({
  head: () =>
    seoHead({
      title: "Featured Positions",
      description:
        "Monthly Gold, Silver, and Bronze plus the Weekly Champion get featured placement, badges, and history — not cash prizes.",
      path: "/prizes",
    }),
  loader: async () => ({ prizes: await getPrizes() }),
  component: Page,
});

function Page() {
  const { prizes } = Route.useLoaderData();
  return (
    <PageShell active="Positions">
      <main className="relative z-10 mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end gap-3">
          <img
            src="/rank/cup-gold.webp?v=3d4"
            alt=""
            draggable={false}
            className="trophy-3d h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <div>
            <h1 className="font-display text-3xl font-black text-gold-grad">Featured positions</h1>
            <p className="mt-1 max-w-xl text-sm text-white/45">
              Top listings get extra visibility, exclusive badges, and a place in the Hall of Fame. There is no cash prize for rank.
            </p>
          </div>
        </div>
        <p className="max-w-xl text-sm text-white/45">
          Ranking credits buy promotion. Featured titles are part of the listing. See the{" "}
          <a href="/rules" className="text-gold hover:underline">
            platform rules
          </a>
          .
        </p>
        <PrizePools prizes={prizes} />
      </main>
    </PageShell>
  );
}

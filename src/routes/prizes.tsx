import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { PrizePools } from "@/components/rank/PrizePools";
import { seoHead } from "@/lib/seo";
import { RoutePending } from "@/components/rank/RoutePending";

export const Route = createFileRoute("/prizes")({
  head: () =>
    seoHead({
      title: "Get Featured on the Leaderboard | Gold, Silver & Bronze | Pay4Rank",
      description:
        "Get featured on the live ranking leaderboard. Monthly Gold, Silver, and Bronze plus Weekly Champion unlock extra visibility, badges, and history — not cash prizes.",
      path: "/prizes",
    }),
  loader: async () => {
    const [prizes, weekly] = await Promise.all([
      getPrizes(),
      getLeaderboard({ data: { cycleType: "weekly", limit: 1 } }),
    ]);
    return { prizes, weekly };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Page,
});

function Page() {
  const { prizes, weekly } = Route.useLoaderData();
  return (
    <PageShell active="Positions">
      <div className="flex items-end gap-3">
        <img
          src="/rank/cup-gold.webp?v=3d4"
          alt=""
          draggable={false}
          className="trophy-3d h-12 w-12 object-contain sm:h-14 sm:w-14"
        />
        <div>
          <p className="page-kicker">Visibility</p>
          <h1 className="page-title">Get featured on the leaderboard</h1>
          <p className="mt-1 max-w-xl text-sm text-white/45">
            Top listings get extra visibility, exclusive badges, and a place in the Hall of Fame. There is no cash prize for rank.
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-xl text-sm text-white/45">
        Ranking credits buy promotion. Featured titles are part of the listing. See the{" "}
        <a href="/rules" className="text-gold hover:underline">
          platform rules
        </a>
        .
      </p>
      <div className="mt-6">
        <PrizePools prizes={prizes} weeklyChampion={weekly[0] ?? null} />
      </div>
    </PageShell>
  );
}
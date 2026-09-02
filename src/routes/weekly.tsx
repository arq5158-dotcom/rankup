import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { RoutePending } from "@/components/rank/RoutePending";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/weekly")({
  head: () =>
    seoHead({
      title: "Weekly Leaderboard & Champion",
      description:
        "Live weekly Pay4Rank rankings. The #1 player becomes Weekly Champion with a badge and homepage spotlight. Score resets every Sunday. Climb with credits or Free Spin.",
      path: "/weekly",
    }),
  loader: async () => {
    const [weekly, prizes] = await Promise.all([
      getLeaderboard({ data: { cycleType: "weekly" } }),
      getPrizes(),
    ]);
    return { weekly, prizes };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Weekly,
});

function Weekly() {
  const { weekly, prizes } = Route.useLoaderData();
  return (
    <PageShell active="Weekly">
      <div className="flex items-end gap-3">
        <img
          src="/rank/cup-weekly.webp?v=3d4"
          alt=""
          draggable={false}
          className="trophy-3d h-12 w-12 object-contain sm:h-14 sm:w-14"
        />
        <div>
          <p className="page-kicker">Weekly</p>
          <h1 className="page-title text-gold-grad">Weekly Challenge</h1>
          <p className="mt-1 text-sm text-white/40">Only #1 is featured this week. Rankings reset every Sunday.</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Podium entries={weekly.slice(0, 3)} />
        <PrizePools prizes={prizes} weeklyChampion={weekly[0] ?? null} />
        <LeaderboardTable entries={weekly} cycle="weekly" />
      </div>
    </PageShell>
  );
}
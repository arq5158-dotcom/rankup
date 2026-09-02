import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { RoutePending } from "@/components/rank/RoutePending";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/monthly")({
  head: () =>
    seoHead({
      title: "Monthly Ranking Leaderboard — Gold, Silver & Bronze | Pay4Rank",
      description:
        "Live monthly ranking leaderboard. Spend ranking credits for Score. Top three get Gold, Silver, and Bronze featured placement so your profile and website get seen.",
      path: "/monthly",
    }),
  loader: async () => {
    const [monthly, weekly, prizes] = await Promise.all([
      getLeaderboard({ data: { cycleType: "monthly" } }),
      getLeaderboard({ data: { cycleType: "weekly" } }),
      getPrizes(),
    ]);
    return { monthly, weekly, prizes };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Monthly,
});

function Monthly() {
  const { monthly, weekly, prizes } = Route.useLoaderData();
  return (
    <PageShell active="Monthly">
      <div className="flex items-end gap-3">
        <img
          src="/rank/cup-gold.webp?v=3d4"
          alt=""
          draggable={false}
          className="trophy-3d h-12 w-12 object-contain sm:h-14 sm:w-14"
        />
        <div>
          <p className="page-kicker">Monthly</p>
          <h1 className="page-title text-gold-grad">Monthly ranking leaderboard</h1>
          <p className="mt-1 text-sm text-white/40">Top 3 get featured placement. New month, new climb.</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Podium entries={monthly.slice(0, 3)} />
        <PrizePools prizes={prizes} weeklyChampion={weekly[0] ?? null} />
        <LeaderboardTable entries={monthly} cycle="monthly" />
      </div>
    </PageShell>
  );
}
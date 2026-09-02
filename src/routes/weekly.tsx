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
      title: "Weekly Leaderboard Promotion | This Week’s Featured Champion | Pay4Rank",
      description:
        "Weekly leaderboard promotion site. Climb this week’s live ranking for websites. #1 is Weekly Champion with a homepage spotlight. Resets Sunday.",
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
          <h1 className="page-title text-gold-grad">Weekly ranking leaderboard</h1>
          <p className="mt-1 text-sm text-white/40">
            This week’s ranking competition. Climb the live weekly leaderboard — only #1 is featured. Resets Sunday.
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Podium entries={weekly.slice(0, 3)} />
        <PrizePools prizes={prizes} weeklyChampion={weekly[0] ?? null} />
        <LeaderboardTable entries={weekly} cycle="weekly" />
        <article className="max-w-2xl space-y-3 pt-2 text-sm leading-relaxed text-white/55">
          <h2 className="font-display text-lg font-extrabold text-fg">How this weekly leaderboard works</h2>
          <p>
            This is Pay4Rank’s weekly leaderboard promotion. Score on this board is separate from
            monthly Score. Spend ranking credits here, or claim a Free Spin onto weekly. Rank #1
            this week is Weekly Champion: a badge and a homepage spotlight. The board resets every
            Sunday. Credits in your wallet do not reset.
          </p>
          <p>
            Player website links on this table are paid promotional listings and are marked
            sponsored. This page is a live ranking for websites and brands, not a Google search rank
            and not a cash contest.
          </p>
        </article>
      </div>
    </PageShell>
  );
}
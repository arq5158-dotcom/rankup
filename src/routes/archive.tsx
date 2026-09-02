import { createFileRoute, Link } from "@tanstack/react-router";
import { getArchives } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { formatScore } from "@/lib/utils";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/archive")({
  head: () =>
    seoHead({
      title: "Past Seasons & Hall of Fame",
      description:
        "Archived Pay4Rank weekly and monthly seasons, final Score totals, and past champion history.",
      path: "/archive",
    }),
  loader: async () => ({ archives: await getArchives() }),
  component: Page,
});

function Page() {
  const { archives } = Route.useLoaderData();
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <p className="page-kicker">History</p>
        <h1 className="page-title mt-1">Past seasons</h1>
        <div className="mt-6 space-y-3">
          {archives.length === 0 && (
            <p className="glass-card rounded-2xl p-8 text-center text-sm text-white/40">
              No archived cycles yet.
            </p>
          )}
          {archives.map((a) => (
            <div key={a.id} className="glass-card flex items-center justify-between rounded-2xl p-4">
              <div>
                <p className="text-sm font-bold text-fg capitalize">{a.cycle_type} cycle</p>
                <p className="text-xs text-white/35">{a.total_participants} players</p>
              </div>
              <p className="font-bold text-gold tabular-nums">{formatScore(Number(a.total_revenue))} SCORE</p>
            </div>
          ))}
        </div>
        <Link to="/" className="mt-8 inline-block text-sm text-gold">
          ← Back
        </Link>
      </div>
    </PageShell>
  );
}

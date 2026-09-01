import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";

export function NotFound() {
  return (
    <PageShell>
      <main className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase">404</p>
        <h1 className="mt-2 font-display text-3xl font-black text-fg">Page not found</h1>
        <p className="mt-3 text-sm text-white/45">
          That route is not on the board. Head back to the live leaderboard.
        </p>
        <Link to="/" className="btn-gold mt-6 rounded-full px-6 py-2.5 text-sm font-extrabold">
          Back to Pay4Rank
        </Link>
      </main>
    </PageShell>
  );
}

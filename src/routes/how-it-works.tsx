import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { Faq } from "@/components/rank/Faq";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seoHead({
      title: "How to Promote Your Website & Climb a Live Leaderboard | Pay4Rank",
      description:
        "Get more visibility for your brand, project, or website. Climb a live weekly or monthly ranking leaderboard, get featured, or use Free Spin. How Pay4Rank works.",
      path: "/how-it-works",
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell active="How It Works">
      <p className="page-kicker">The loop</p>
      <h1 className="page-title mt-1">How to climb the leaderboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-white/50">
        Looking for a way to promote your website, get your brand seen, or showcase a project? Pay4Rank
        is a live ranking leaderboard. Buy ranking credits or use Free Spin, climb weekly or monthly
        rankings, and get featured at the top.
      </p>
      <div className="mt-6 space-y-5">
        <HowItWorks />

        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-fg">Who uses a ranking leaderboard</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Founders sharing a startup, creators building a personal brand, developers launching a tool,
            communities promoting a link, and anyone who wants a public profile with a live rank instead
            of a static directory listing.
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-white/55 sm:grid-cols-2">
            <li>Promote a website with a public listing</li>
            <li>Get featured with Gold, Silver, or Bronze</li>
            <li>Compete in a weekly ranking competition</li>
            <li>Compete in a monthly ranking competition</li>
            <li>Climb for free with a daily Free Spin</li>
            <li>Add an approved website link on your profile</li>
          </ul>
        </section>

        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-fg">What this is — and is not</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Pay4Rank is on-site visibility: a competitive public board people can browse. It is not
            Google Ads, not a guaranteed search-engine rank, not a cash prize, and not a lottery.
            Credits buy Score on our leaderboard. Score buys rank on our leaderboard. Rank is how
            visible your listing is here.
          </p>
        </section>

        <Faq withSchema />
        <Link to="/" className="btn-gold tap inline-flex min-h-11 w-full items-center justify-center rounded-xl px-6 text-sm font-extrabold sm:w-auto">
          <span>View the live leaderboard</span>
        </Link>
      </div>
    </PageShell>
  );
}

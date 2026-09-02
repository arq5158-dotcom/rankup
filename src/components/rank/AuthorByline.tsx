import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const EDITORIAL = {
  name: "Pay4Rank Editorial",
  jobTitle: "Ranking leaderboard documentation",
  credentials:
    "We operate the live weekly and monthly ranking leaderboard at pay4rank.com. Guides are written from how ranking credits, Score, and featured placement actually work — not as an SEO agency and not as game-rank boosting.",
};

export function authorJsonLd() {
  return {
    "@type": "Person" as const,
    name: EDITORIAL.name,
    jobTitle: EDITORIAL.jobTitle,
    url: SITE_URL,
    description: EDITORIAL.credentials,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function AuthorByline({ date }: { date: string }) {
  return (
    <div className="mt-4 max-w-2xl border-l-2 border-gold/40 pl-3">
      <p className="text-sm font-bold text-fg">By {EDITORIAL.name}</p>
      <p className="text-[12px] text-white/45">{EDITORIAL.jobTitle}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-white/50">{EDITORIAL.credentials}</p>
      <p className="mt-1 text-[11px] text-white/35">{date}</p>
    </div>
  );
}

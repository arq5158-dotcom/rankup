export const SITE_NAME = "Pay4Rank";
export const SITE_TAGLINE = "Pay. Climb. Get Seen.";
export const SITE_DESCRIPTION =
  "Pay4Rank is a competitive promotional leaderboard. Buy ranking credits, climb live weekly and monthly boards, and get your profile, brand, or site seen.";

export const PUBLIC_PATHS = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/weekly", changefreq: "daily", priority: "0.9" },
  { path: "/monthly", changefreq: "daily", priority: "0.9" },
  { path: "/prizes", changefreq: "weekly", priority: "0.8" },
  { path: "/giveaways", changefreq: "weekly", priority: "0.7" },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.8" },
  { path: "/archive", changefreq: "weekly", priority: "0.5" },
  { path: "/rules", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "How do rankings work?",
    a: "Rankings are ordered by confirmed ranking credits purchased with Stripe for the active weekly or monthly cycle. More credits rank higher. If two profiles tie, the earlier confirmed payment holds the slot.",
  },
  {
    q: "What am I paying for?",
    a: "You are buying ranking credits — a promotional listing on the public leaderboard. Credits increase your visibility. This is not a prize drawing and you are not paying for a chance to win cash.",
  },
  {
    q: "What do top positions get?",
    a: "Gold, Silver, and Bronze (monthly) and the Weekly Rank Champion are featured placements: extra exposure, profile styling, platform badges, and a spot in the Hall of Fame. Ranking credits do not buy a cash prize. Separate community giveaways, when offered, are free to enter and are not part of the paid board.",
  },
  {
    q: "Are ranking credits refundable?",
    a: "Completed purchases are generally non-refundable. If you cancel Stripe Checkout or the payment fails, you are not charged and you are not ranked.",
  },
  {
    q: "Is this a lottery or contest for prizes?",
    a: "No. The leaderboard sells promotional ranking credits. Position is determined only by confirmed credits in a cycle — not by a random draw. Featured titles are part of the listing product, not a prize purse. Optional community giveaways are run separately: no purchase is required to enter, and buying credits does not improve your odds.",
  },
  {
    q: "Who can participate?",
    a: "You must be at least 18 years old and able to enter a payment agreement. Pay4Rank is a promotional service, not an investment.",
  },
  {
    q: "Do ranking credits enter me in giveaways?",
    a: "No. Giveaways are optional promotions, separate from the paid leaderboard. Where a giveaway is offered, you can enter without buying anything. Purchasing ranking credits does not increase your chances of winning a giveaway.",
  },
  {
    q: "Are player website links safe?",
    a: "Optional player websites are public. Pay4Rank only publishes https links that pass an automated safety review (no adult sites, shorteners, or private/local addresses). Links are third-party pages we do not control — open them at your own judgment.",
  },
];

export function seoHead({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}) {
  const full = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
      },
      { name: "author", content: SITE_NAME },
      { name: "application-name", content: SITE_NAME },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

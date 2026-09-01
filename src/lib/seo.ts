export const SITE_NAME = "Rank Up";
export const SITE_TAGLINE = "Pay. Climb. Win.";
export const SITE_DESCRIPTION =
  "Rank Up is a live prize leaderboard. Contribute securely with Stripe, climb weekly and monthly rankings, and win real prizes.";

export const PUBLIC_PATHS = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/weekly", changefreq: "daily", priority: "0.9" },
  { path: "/monthly", changefreq: "daily", priority: "0.9" },
  { path: "/prizes", changefreq: "weekly", priority: "0.8" },
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
    a: "Rankings are ordered by confirmed Stripe contribution totals for the active weekly or monthly cycle. Higher totals rank higher. If two players tie, the earlier confirmed payment wins the slot.",
  },
  {
    q: "How do I enter a cycle?",
    a: "Create an account, choose weekly or monthly, and complete checkout with Stripe. Your live rank updates only after Stripe confirms the payment — never before.",
  },
  {
    q: "What can I win?",
    a: "Monthly cycles award cash prizes to the top three finishers plus exclusive badges. Weekly cycles are winner-take-all for first place. Live amounts are listed on the Prizes page.",
  },
  {
    q: "Are contributions refundable?",
    a: "Completed contributions are generally non-refundable. If you cancel Stripe Checkout or the payment fails, you are not charged and you are not ranked.",
  },
  {
    q: "Is Rank Up a game of chance?",
    a: "No. Rank Up is not a lottery, raffle, casino, or game of chance. Placement is determined solely by confirmed contribution amounts during a cycle, not by a random draw or odds. Rank Up is void where prohibited.",
  },
  {
    q: "Who can participate?",
    a: "You must be at least 18 years old and able to enter a payment agreement. Rank Up is void where prohibited by law. Employees who administer the contest may be barred from winning.",
  },
  {
    q: "Are player website links safe?",
    a: "Optional player websites are public. Rank Up only publishes https links that pass an automated safety review (no adult sites, shorteners, or private/local addresses). Links are third-party pages we do not control — open them at your own judgment.",
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

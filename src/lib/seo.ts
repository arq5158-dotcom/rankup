export const SITE_NAME = "Pay4Rank";
export const SITE_TAGLINE = "Pay. Climb. Get Seen.";
export const SITE_URL = "https://www.pay4rank.com";
export const SITE_DESCRIPTION =
  "Pay4Rank is a live ranking SaaS. Buy credits, spend them 1:1 for Score, and climb weekly and monthly leaderboards. Featured Gold, Silver, Bronze, and Weekly Champion placements — not cash prizes.";

export function absUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p === "/" ? "/" : p}`;
}

export const PUBLIC_PATHS = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/weekly", changefreq: "hourly", priority: "0.9" },
  { path: "/monthly", changefreq: "hourly", priority: "0.9" },
  { path: "/prizes", changefreq: "weekly", priority: "0.8" },
  { path: "/spin", changefreq: "daily", priority: "0.8" },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.85" },
  { path: "/giveaways", changefreq: "weekly", priority: "0.6" },
  { path: "/archive", changefreq: "weekly", priority: "0.5" },
  { path: "/rules", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "How do Pay4Rank rankings work?",
    a: "Weekly and monthly are separate leaderboards. Buy credits, then spend them 1:1 into Score on the board you choose. Wallet credits do not affect rank until spent. Free Spin can award Score to one board. Tied scores keep the earlier climb.",
  },
  {
    q: "What am I paying for on Pay4Rank?",
    a: "You buy ranking credits for your wallet. Spending credits increases Score and visibility on the public leaderboard. This is not a prize drawing and you are not paying for a chance to win cash.",
  },
  {
    q: "What do Gold, Silver, and Bronze get?",
    a: "Monthly top three and the Weekly Champion get featured placement: extra visibility, profile styling, badges, and Hall of Fame history. Score does not buy a cash prize. Community giveaways, when offered, are separate and free to enter.",
  },
  {
    q: "Are ranking credits refundable?",
    a: "Completed credit purchases are generally non-refundable. If checkout is cancelled or payment fails, you are not charged and no credits are added. Rank only changes after you spend credits or claim a Free Spin.",
  },
  {
    q: "Is Pay4Rank a lottery or cash contest?",
    a: "No. Credits are a digital in-app currency. Position is determined by Score, not a random draw and not by dollars paid. Featured titles are listing perks, not a prize purse.",
  },
  {
    q: "Who can join Pay4Rank?",
    a: "You must be at least 18 and able to enter a payment agreement. Pay4Rank is a ranking product, not an investment.",
  },
  {
    q: "Do ranking credits enter me in giveaways?",
    a: "No. Giveaways are optional and separate from the paid boards. When a giveaway is live you can enter without buying anything. Buying credits does not improve odds.",
  },
  {
    q: "Are player website links safe?",
    a: "Optional player websites are public. Pay4Rank only publishes https links that pass an automated review. Links are third-party pages we do not control.",
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
  const full = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = absUrl(path);
  const image = absUrl("/og.jpg");
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { name: "author", content: SITE_NAME },
      { name: "application-name", content: SITE_NAME },
      { property: "og:type", content: path === "/" ? "website" : "article" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: full },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
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

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: ["Pay 4 Rank", SITE_TAGLINE],
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absUrl("/favicon.svg"),
        description: SITE_DESCRIPTION,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: absUrl("/contact"),
        },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "1.00",
          priceCurrency: "USD",
          description: "Ranking credits from $1 USD",
        },
      },
    ],
  };
}

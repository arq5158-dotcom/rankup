export const SITE_NAME = "Pay4Rank";
export const SITE_TAGLINE = "Pay. Climb. Get Seen.";
export const SITE_URL = "https://www.pay4rank.com";
export const SITE_DESCRIPTION =
  "Promote your profile, brand, or website on a live ranking leaderboard. Buy ranking credits, spend them for Score, climb weekly and monthly boards, and get featured. Pay4Rank — not a cash prize.";

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
    q: "How do I promote my website or brand on a leaderboard?",
    a: "Create a Pay4Rank profile, add your display name, photo, short message, and website. Buy ranking credits, spend them for Score on the weekly or monthly board, and climb. Higher Score means a more visible listing.",
  },
  {
    q: "How do I climb a live leaderboard?",
    a: "Spend ranking credits 1:1 for Score on the board you choose — weekly or monthly. Each credit spent adds 1 Score. You can also claim Free Spin Score. The live leaderboard reorders immediately.",
  },
  {
    q: "How do I get featured on the leaderboard?",
    a: "Monthly top three get Gold, Silver, and Bronze featured placement, badges, and Hall of Fame history. The weekly #1 becomes Weekly Champion with a homepage spotlight. Featured spots are visibility, not cash prizes.",
  },
  {
    q: "Can I rank up for free?",
    a: "Yes. Free Spin awards bonus Score with no credits spent. You still need a signed-in profile. Buying credits is optional and does not affect giveaway odds.",
  },
  {
    q: "What's the difference between weekly and monthly rankings?",
    a: "They are separate leaderboards with separate Score. Weekly resets every Sunday. Monthly resets each month. Spend credits on the board you want to climb. Credits in your wallet never reset.",
  },
  {
    q: "What am I paying for?",
    a: "Ranking credits for your wallet. Spending credits increases Score and visibility on the public leaderboard. This is not a prize drawing and not payment for a Google search rank.",
  },
  {
    q: "Are ranking credits refundable?",
    a: "Completed credit purchases are generally non-refundable. If checkout is cancelled or payment fails, you are not charged and no credits are added.",
  },
  {
    q: "Is this a lottery or cash contest?",
    a: "No. Position is determined by Score, not a random draw. Featured titles are listing perks, not a prize purse. Optional community giveaways are separate and free to enter.",
  },
  {
    q: "Who can join?",
    a: "You must be at least 18 and able to enter a payment agreement. Pay4Rank is a ranking product, not an investment.",
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

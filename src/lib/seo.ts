export const SITE_NAME = "Pay4Rank";
export const SITE_TAGLINE = "Pay. Climb. Get Seen.";
export const SITE_URL = "https://www.pay4rank.com";
export const SITE_DESCRIPTION =
  "Promote your website, brand, or project on a live ranking leaderboard. Get seen, get featured, climb weekly and monthly rankings. Buy ranking credits or use Free Spin. Pay4Rank.";

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
  { path: "/guides", changefreq: "weekly", priority: "0.7" },
  { path: "/guides/how-to-get-traffic-to-a-new-website", changefreq: "monthly", priority: "0.75" },
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
    q: "How do I promote my website or brand online?",
    a: "On Pay4Rank you create a public profile, add a photo, a short message, and your website. Then you climb a live ranking leaderboard so more people see that listing. Higher Score means a higher, more visible spot.",
  },
  {
    q: "How do I get more visibility for my project?",
    a: "Spend ranking credits for Score on the weekly or monthly board, or claim a Free Spin. Top listings get featured placement, badges, and a homepage spotlight. This is on-site visibility, not a Google Ads campaign.",
  },
  {
    q: "How do I climb a live leaderboard?",
    a: "1 credit spent = 1 Score on the board you choose. Weekly and monthly are separate. The live leaderboard reorders as soon as Score is added. Other players can overtake you at any time.",
  },
  {
    q: "How do I get featured at the top?",
    a: "Monthly #1–#3 get Gold, Silver, and Bronze featured placement. Weekly #1 is Weekly Champion with a homepage spotlight. Featured spots are listing perks, not cash prizes.",
  },
  {
    q: "Can I get on the ranking board for free?",
    a: "Yes. Free Spin awards bonus Score without spending credits. You need a signed-in profile. Buying credits is optional.",
  },
  {
    q: "What is a weekly ranking competition?",
    a: "A separate live leaderboard that resets every Sunday. Spend credits or Free Spin Score on the weekly board to compete for Weekly Champion this week.",
  },
  {
    q: "What is a monthly ranking competition?",
    a: "A separate live leaderboard that resets each month. Climb for Gold, Silver, and Bronze featured placement and Hall of Fame history.",
  },
  {
    q: "Can I add my website link to a public profile?",
    a: "Yes. Approved https website links can appear next to your listing so visitors can open your site from the leaderboard.",
  },
  {
    q: "Is this the same as paying for Google ranking or SEO?",
    a: "No. Pay4Rank does not sell Google search positions. You climb our public leaderboard. Search engines may later show Pay4Rank pages; that is separate from Score on the board.",
  },
  {
    q: "Who is this for?",
    a: "Creators, founders, personal brands, side projects, communities, and anyone who wants their profile or website seen on a competitive public ranking.",
  },
  {
    q: "How fast does my rank update?",
    a: "Score and rank update as soon as a credit spend or Free Spin claim succeeds. You do not wait until the week or month ends to move.",
  },
  {
    q: "What am I paying for?",
    a: "Ranking credits in your wallet. Spending credits increases Score and visibility on the public leaderboard. Not a lottery and not payment for a Google rank.",
  },
  {
    q: "Are ranking credits refundable?",
    a: "Completed purchases are generally non-refundable. If checkout is cancelled or payment fails, you are not charged.",
  },
  {
    q: "Is this a lottery or cash contest?",
    a: "No. Position is determined by Score. Optional community giveaways are separate, free to enter, and buying credits does not improve odds.",
  },
  {
    q: "Who can join?",
    a: "Anyone 18 or older who can enter a payment agreement. You can browse the public boards without an account.",
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
        logo: {
          "@type": "ImageObject",
          url: absUrl("/og.jpg"),
        },
        description: SITE_DESCRIPTION,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: absUrl("/contact"),
        },
      },
    ],
  };
}

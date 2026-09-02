import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const EDITORIAL = {
  name: "Pay4Rank Editorial",
  jobTitle: "Ranking leaderboard documentation",
  credentials:
    "We operate the live weekly and monthly ranking leaderboard at pay4rank.com. Guides are written from how ranking credits, Score, and featured placement actually work — not as an SEO agency and not as game-rank boosting.",
};

export const EDITORIAL_FR = {
  name: "Pay4Rank Editorial",
  jobTitle: "Documentation classement et visibilité",
  credentials:
    "Nous opérons le classement hebdomadaire et mensuel sur pay4rank.com. Nos guides décrivent le trafic, les crédits de ranking et la mise en avant — pas une agence SEO, pas du boosting de rang de jeu.",
};

export function authorJsonLd(locale: "en" | "fr" = "en") {
  const bio = locale === "fr" ? EDITORIAL_FR : EDITORIAL;
  return {
    "@type": "Person" as const,
    name: bio.name,
    jobTitle: bio.jobTitle,
    url: SITE_URL,
    description: bio.credentials,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function AuthorByline({ date, locale = "en" }: { date: string; locale?: "en" | "fr" }) {
  const bio = locale === "fr" ? EDITORIAL_FR : EDITORIAL;
  const by = locale === "fr" ? "Par" : "By";
  return (
    <div className="mt-4 max-w-2xl border-l-2 border-gold/40 pl-3">
      <p className="text-sm font-bold text-fg">
        {by} {bio.name}
      </p>
      <p className="text-[12px] text-white/45">{bio.jobTitle}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-white/50">{bio.credentials}</p>
      <p className="mt-1 text-[11px] text-white/35">{date}</p>
    </div>
  );
}

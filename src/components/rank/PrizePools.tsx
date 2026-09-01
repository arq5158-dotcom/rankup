import { Check, Crown, Info } from "lucide-react";
import { CountDown } from "./CountDown";
import { AvatarImg, Verified } from "./Avatar";
import { SafeWebLink } from "./SafeWebLink";
import { nextSundayEnd, formatScore } from "@/lib/utils";
import type { BoardEntry, PrizeRow } from "@/lib/server/rank";

function Cup({
  tone,
  className = "",
}: {
  tone: "gold" | "silver" | "bronze" | "weekly";
  className?: string;
}) {
  return (
    <img
      src={`/rank/cup-${tone}.webp?v=3d5`}
      alt=""
      draggable={false}
      decoding="async"
      className={`trophy-3d object-contain object-bottom ${className}`}
    />
  );
}

const MONTHLY = [
  {
    place: "Gold · #1",
    title: "Homepage Spotlight",
    perks: ["Champion Badge", "30-Day Feature", "Hall of Fame"],
    tone: "gold" as const,
  },
  {
    place: "Silver · #2",
    title: "Featured Profile",
    perks: ["Silver Badge", "Leaderboard Highlight", "Website Spotlight"],
    tone: "silver" as const,
  },
  {
    place: "Bronze · #3",
    title: "Enhanced Exposure",
    perks: ["Bronze Badge", "Highlighted Row", "Profile Boost"],
    tone: "bronze" as const,
  },
];

const WEEKLY_PERKS = ["Homepage Spotlight", "Champion Badge", "Featured Website", "Winner History"];

export function PrizePools({
  prizes: _prizes,
  weeklyChampion,
}: {
  prizes: PrizeRow[];
  weeklyChampion?: BoardEntry | null;
}) {
  void _prizes;
  const champ = weeklyChampion && weeklyChampion.rank === 1 ? weeklyChampion : weeklyChampion || null;

  return (
    <section id="prizes" className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 md:gap-4">
      <div className="glass-card card-3d flex flex-col rounded-[22px] p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-[12px] font-extrabold tracking-[0.22em] text-fg uppercase sm:text-[13px]">
            Monthly Top 3 Benefits
          </h3>
          <p className="mt-1.5 text-[13px] text-white/48">Finish in the Top 3 to unlock premium visibility perks.</p>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-3">
          {MONTHLY.map((p) => (
            <div
              key={p.place}
              className={`prize-cell flex flex-col rounded-[18px] px-2.5 py-4 sm:px-3.5 sm:py-5 ${
                p.tone === "gold" ? "prize-gold" : p.tone === "silver" ? "prize-silver" : "prize-bronze"
              }`}
            >
              <Cup tone={p.tone} className="mx-auto h-[68px] w-[68px] sm:h-[86px] sm:w-[86px]" />
              <p className="mt-2 text-center text-[9px] font-bold tracking-[0.16em] text-white/50 uppercase sm:text-[10px]">
                {p.place}
              </p>
              <p className="mt-1 text-center text-[12px] leading-tight font-extrabold text-fg sm:text-[14px]">{p.title}</p>
              <ul className="mt-3 space-y-1.5">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-[10px] leading-snug text-white/62 sm:text-[11px]">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-gold" strokeWidth={3} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/38">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Ranks reset monthly. Benefits remain in profile history.
        </p>
      </div>

      <div id="weekly" className="glass-card card-3d flex flex-col rounded-[22px] p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[12px] font-extrabold tracking-[0.22em] text-fg uppercase sm:text-[13px]">
              Weekly Spotlight
            </h3>
            <p className="mt-1.5 text-[13px] text-white/48">The #1 player this week takes the crown.</p>
          </div>
          <CountDown target={nextSundayEnd()} prefix="Featured for" compact />
        </div>
        <div className="weekly-card mt-auto flex-1 rounded-[18px] p-4 sm:p-5">
          {champ ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(180px,0.85fr)] lg:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <AvatarImg src={champ.profileImage} name={champ.displayName} size={92} ring="gold" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-weekly uppercase">
                    <Crown className="h-3.5 w-3.5 fill-weekly text-weekly" /> Weekly Champion
                  </p>
                  <p className="mt-1 flex min-w-0 items-center text-[22px] leading-none font-extrabold text-fg sm:text-[26px]">
                    <span className="truncate">{champ.displayName}</span>
                    <Verified />
                  </p>
                  <p className="mt-1.5 font-display text-[22px] leading-none font-black tabular-nums text-gold-grad sm:text-[26px]">
                    {formatScore(champ.amountPaid)} SCORE
                  </p>
                  <SafeWebLink href={champ.webLink} className="mt-1.5" />
                  {champ.shortNote ? (
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-white/45">{champ.shortNote}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-white/8 pt-4 lg:border-t-0 lg:pt-0">
                <Cup tone="weekly" className="weekly-cup h-[108px] w-[74px] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.16em] text-weekly uppercase">Weekly Champion Benefits</p>
                  <ul className="mt-2.5 space-y-2">
                    {WEEKLY_PERKS.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-[12px] text-white/75">
                        <Check className="h-3.5 w-3.5 shrink-0 text-weekly" strokeWidth={3} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Cup tone="weekly" className="weekly-cup h-[120px] w-[82px] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] tracking-[0.16em] text-weekly uppercase">Weekly Rank Champion</p>
                <p className="mt-1 font-display text-[26px] leading-none font-semibold text-fg">Open slot</p>
                <p className="mt-2 text-[13px] text-white/48">Be #1 this week to take the spotlight.</p>
                <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {WEEKLY_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-1.5 text-[12px] text-white/60">
                      <Check className="h-3.5 w-3.5 shrink-0 text-weekly" strokeWidth={3} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-[11px] text-white/38">Rankings reset every week. Another shot at the spotlight.</p>
      </div>
    </section>
  );
}

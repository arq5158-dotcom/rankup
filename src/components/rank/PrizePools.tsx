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
  const champ = weeklyChampion?.rank === 1 ? weeklyChampion : null;

  return (
    <section id="prizes" className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 md:gap-3">
      <div className="lux-panel flex flex-col rounded-[20px] p-4">
        <div className="mb-3">
          <h3 className="lux-kicker">Monthly Top 3 Benefits</h3>
          <p className="mt-1 text-[12px] text-white/45">Finish in the Top 3 to unlock premium visibility perks.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHLY.map((p) => (
            <div
              key={p.place}
              className={`prize-cell flex flex-col items-center rounded-[14px] px-2 py-3 ${
                p.tone === "gold" ? "prize-gold" : p.tone === "silver" ? "prize-silver" : "prize-bronze"
              }`}
            >
              <Cup tone={p.tone} className="h-14 w-14 sm:h-16 sm:w-16" />
              <p className="mt-1.5 text-center text-[9px] font-bold tracking-[0.14em] text-white/45 uppercase">
                {p.place}
              </p>
              <p className="mt-0.5 text-center text-[11px] leading-tight font-bold text-fg sm:text-[12px]">{p.title}</p>
              <ul className="mt-2 w-full space-y-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1 text-[10px] leading-snug text-white/58">
                    <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-gold" strokeWidth={3} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-white/35">
          <Info className="h-3 w-3 shrink-0" />
          Ranks reset monthly. Benefits remain in profile history.
        </p>
      </div>

      <div id="weekly" className="lux-panel lux-panel-weekly flex flex-col rounded-[20px] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="lux-kicker">Weekly Spotlight</h3>
            <p className="mt-1 text-[12px] text-white/45">The #1 player this week takes the crown.</p>
          </div>
          <CountDown target={nextSundayEnd()} prefix="Featured for" compact />
        </div>
        <div className="weekly-card rounded-[14px] p-3">
          {champ ? (
            <div className="flex items-center gap-3">
              <div className="champ-ring shrink-0">
                <AvatarImg src={champ.profileImage} name={champ.displayName} size={56} ring="none" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[9px] font-bold tracking-[0.14em] text-weekly uppercase">
                  <Crown className="h-3 w-3 fill-weekly text-weekly" /> Weekly Champion
                </p>
                <p className="mt-0.5 flex min-w-0 items-center text-[16px] leading-none font-extrabold text-fg">
                  <span className="truncate">{champ.displayName}</span>
                  <Verified />
                </p>
                <p className="mt-1 font-display text-[18px] leading-none font-black tabular-nums text-gold-grad">
                  {formatScore(champ.amountPaid)} SCORE
                </p>
                <SafeWebLink href={champ.webLink} compact className="mt-1" />
              </div>
              <Cup tone="weekly" className="weekly-cup hidden h-16 w-11 shrink-0 sm:block" />
              <div className="hidden w-[132px] shrink-0 sm:block">
                <p className="text-[8px] font-bold tracking-[0.14em] text-weekly uppercase">Champion benefits</p>
                <ul className="mt-1.5 space-y-1">
                  {WEEKLY_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-1 text-[10px] text-white/70">
                      <Check className="h-2.5 w-2.5 shrink-0 text-weekly" strokeWidth={3} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Cup tone="weekly" className="weekly-cup h-16 w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] tracking-[0.14em] text-weekly uppercase">Weekly Rank Champion</p>
                <p className="mt-0.5 text-[16px] font-extrabold text-fg">Open slot</p>
                <p className="mt-1 text-[11px] text-white/45">Be #1 this week to take the spotlight.</p>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-[10px] text-white/35">Rankings reset every week. Another shot at the spotlight.</p>
      </div>
    </section>
  );
}

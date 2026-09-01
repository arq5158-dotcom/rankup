import { Verified } from "./Avatar";
import { NoteTrigger } from "./NoteIsland";
import { formatUsd, safeImageSrc } from "@/lib/utils";
import type { BoardEntry } from "@/lib/server/rank";

const META = {
  gold: {
    plaque: "/rank/plaque-gold.webp",
    cyl: "/rank/cyl-gold.webp",
    holeX: 50.2,
    holeY: 37.6,
    avatar: 34.2,
    rankTop: 7.2,
    textTop: 56.0,
    delay: "0ms",
    ink: "text-[#2a1c06]",
    mute: "text-[#2a1c06]/55",
    name: "text-[11px] sm:text-[13px] lg:text-[14px]",
    amt: "text-[14px] sm:text-[16px] lg:text-[18px]",
    rank: "text-[13px] sm:text-[15px] lg:text-[17px]",
    filter: "saturate(1.28) hue-rotate(-18deg) contrast(1.1) brightness(1.06)",
    leaf: "#e8d08a",
    leafStroke: "#8b6914",
  },
  silver: {
    plaque: "/rank/plaque-silver.webp",
    cyl: "/rank/cyl-silver.webp",
    holeX: 50.1,
    holeY: 38.4,
    avatar: 33.4,
    rankTop: 7.6,
    textTop: 56.8,
    delay: "120ms",
    ink: "text-[#1a1a22]",
    mute: "text-[#1a1a22]/55",
    name: "text-[10px] sm:text-[12px] lg:text-[13px]",
    amt: "text-[13px] sm:text-[15px] lg:text-[16px]",
    rank: "text-[12px] sm:text-[14px] lg:text-[15px]",
    filter: "saturate(1.05) contrast(1.04)",
    leaf: "#d8d8e0",
    leafStroke: "#5c5c64",
  },
  bronze: {
    plaque: "/rank/plaque-bronze.webp",
    cyl: "/rank/cyl-bronze.webp",
    holeX: 50.1,
    holeY: 35.2,
    avatar: 34.0,
    rankTop: 6.6,
    textTop: 53.8,
    delay: "240ms",
    ink: "text-[#2a1608]",
    mute: "text-[#2a1608]/55",
    name: "text-[10px] sm:text-[12px] lg:text-[13px]",
    amt: "text-[13px] sm:text-[15px] lg:text-[16px]",
    rank: "text-[12px] sm:text-[14px] lg:text-[15px]",
    filter: "saturate(1.12) contrast(1.04) brightness(1.03)",
    leaf: "#e0a060",
    leafStroke: "#6b3e14",
  },
} as const;

function Laurel({ fill, stroke }: { fill: string; stroke: string }) {
  const left = [
    { x: 50, y: 93, r: 10, rx: 8.2 },
    { x: 41, y: 87, r: -16, rx: 8.0 },
    { x: 34, y: 79, r: -26, rx: 7.8 },
    { x: 28, y: 69, r: -36, rx: 7.6 },
    { x: 24, y: 58, r: -48, rx: 7.4 },
    { x: 23, y: 46, r: -58, rx: 7.2 },
    { x: 26, y: 34, r: -68, rx: 6.8 },
    { x: 32, y: 24, r: -78, rx: 6.4 },
    { x: 41, y: 16, r: -88, rx: 6.0 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)]" aria-hidden>
      <path
        d="M50 95 C 22 80 14 50 26 18"
        fill="none"
        stroke={stroke}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M50 95 C 78 80 86 50 74 18"
        fill="none"
        stroke={stroke}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.9"
      />
      {left.map((l, i) => (
        <g key={`L${i}`}>
          <ellipse
            cx={l.x}
            cy={l.y}
            rx={l.rx}
            ry="3.35"
            transform={`rotate(${l.r} ${l.x} ${l.y})`}
            fill={fill}
            stroke={stroke}
            strokeWidth="0.55"
          />
          <ellipse
            cx={100 - l.x}
            cy={l.y}
            rx={l.rx}
            ry="3.35"
            transform={`rotate(${-l.r} ${100 - l.x} ${l.y})`}
            fill={fill}
            stroke={stroke}
            strokeWidth="0.55"
          />
        </g>
      ))}
    </svg>
  );
}

function PedestalMark({
  place,
  variant,
}: {
  place: 1 | 2 | 3;
  variant: "gold" | "silver" | "bronze";
}) {
  const m = META[variant];
  const size =
    variant === "gold"
      ? "text-[36px] sm:text-[44px] lg:text-[52px]"
      : "text-[28px] sm:text-[36px] lg:text-[40px]";
  const ink = variant === "gold" ? "#f8e7ae" : variant === "silver" ? "#f3f3f8" : "#f5c894";
  const shade = variant === "gold" ? "#6a4e10" : variant === "silver" ? "#3a3a42" : "#5a3010";
  const hi = variant === "gold" ? "#fff6d2" : variant === "silver" ? "#ffffff" : "#ffe0b8";
  return (
    <div className="pointer-events-none absolute inset-x-[10%] top-[16%] z-10 flex h-[66%] items-center justify-center">
      <div className="relative flex aspect-square w-[94%] max-w-[176px] items-center justify-center">
        <div
          className="absolute inset-[6%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 52%, transparent 74%)",
          }}
        />
        <div className="absolute inset-0">
          <Laurel fill={m.leaf} stroke={m.leafStroke} />
        </div>
        <span
          className={`relative z-10 font-display font-bold leading-none ${size}`}
          style={{
            color: ink,
            textShadow: `0 1px 0 ${hi}, 0 2px 0 ${shade}, 0 4px 0 rgba(0,0,0,0.28), 0 10px 16px rgba(0,0,0,0.5)`,
          }}
        >
          {place}
        </span>
      </div>
    </div>
  );
}

function Plaque({
  place,
  entry,
  variant,
}: {
  place: 1 | 2 | 3;
  entry: BoardEntry;
  variant: "gold" | "silver" | "bronze";
}) {
  const m = META[variant];
  const photo = safeImageSrc(entry.profileImage);
  return (
    <figure
      className="animate-podium flex w-full flex-col items-center"
      style={{ animationDelay: m.delay }}
    >
      <div className="relative w-full">
        <img
          src={m.plaque}
          alt=""
          draggable={false}
          className="pointer-events-none relative z-10 w-full select-none"
          style={{
            filter: `${m.filter} drop-shadow(0 22px 36px rgba(0,0,0,0.62)) ${
              variant === "gold"
                ? "drop-shadow(0 0 22px rgba(201,168,76,0.38))"
                : variant === "silver"
                  ? "drop-shadow(0 0 14px rgba(180,180,190,0.22))"
                  : "drop-shadow(0 0 14px rgba(205,127,50,0.22))"
            }`,
          }}
        />
        <p
          className={`pointer-events-none absolute z-20 font-display font-bold tracking-[0.14em] ${m.ink} ${m.rank}`}
          style={{ top: `${m.rankTop}%`, left: "50%", transform: "translateX(-50%)" }}
        >
          #{place}
        </p>
        <div
          className="absolute z-20 overflow-hidden rounded-full bg-[#1a1a24]"
          style={{
            left: `${m.holeX}%`,
            top: `${m.holeY}%`,
            width: `${m.avatar}%`,
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
            boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.45)",
          }}
        >
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white/50">
              {entry.displayName.charAt(0)}
            </span>
          )}
        </div>
        <div
          className="absolute z-20 flex w-[84%] flex-col items-center px-1 text-center"
          style={{ top: `${m.textTop}%`, left: "50%", transform: "translateX(-50%)" }}
        >
          <p className={`flex max-w-full items-center justify-center font-bold ${m.ink} ${m.name}`}>
            <span className="truncate">{entry.displayName}</span>
            <Verified />
          </p>
          <p className={`font-extrabold tabular-nums ${m.ink} ${m.amt}`}>
            ${formatUsd(entry.amountPaid)}
          </p>
          {entry.shortNote ? (
            <NoteTrigger
              note={entry.shortNote}
              name={entry.displayName}
              username={entry.username}
              image={entry.profileImage}
              amount={entry.amountPaid}
              rank={place}
              lines={1}
              className={`relative z-30 mt-0.5 hidden max-w-full text-[8px] sm:block sm:text-[9px] ${m.mute}`}
            />
          ) : null}
        </div>
      </div>
      <div className="relative z-0 -mt-[6%] w-[118%] max-w-none">
        <img
          src={m.cyl}
          alt=""
          draggable={false}
          className="pointer-events-none relative z-0 w-full select-none drop-shadow-[0_16px_22px_rgba(0,0,0,0.55)]"
          style={{ filter: m.filter }}
        />
        <PedestalMark place={place} variant={variant} />
      </div>
      <figcaption className="sr-only">
        {entry.displayName} is ranked #{place} with ${formatUsd(entry.amountPaid)}
      </figcaption>
    </figure>
  );
}

export function Podium({ entries }: { entries: BoardEntry[] }) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];
  if (!first || !second || !third) {
    return (
      <div className="flex min-h-[180px] items-end justify-center pb-6 text-white/30 sm:min-h-[260px]">
        <p className="text-sm font-semibold">Waiting for champions…</p>
      </div>
    );
  }
  return (
    <div className="relative mx-auto flex w-full max-w-[560px] items-end justify-center overflow-x-clip sm:max-w-[720px] lg:max-w-[820px]">
      <div className="stage-glow animate-glow pointer-events-none absolute bottom-0 left-1/2 h-36 w-[96%] -translate-x-1/2 sm:h-52" />
      <div className="relative z-10 flex w-full items-end justify-center gap-0">
        <div className="mb-1 w-[29%] max-w-[230px] shrink-0">
          <Plaque place={2} entry={second} variant="silver" />
        </div>
        <div className="-mb-2 w-[42%] max-w-[300px] shrink-0 sm:-mb-4">
          <Plaque place={1} entry={first} variant="gold" />
        </div>
        <div className="mb-2 w-[29%] max-w-[220px] shrink-0">
          <Plaque place={3} entry={third} variant="bronze" />
        </div>
      </div>
    </div>
  );
}

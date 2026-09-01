import { useEffect, useRef } from "react";
import { AvatarImg, Verified } from "./Avatar";
import { NoteTrigger } from "./NoteIsland";
import { SafeWebLink } from "./SafeWebLink";
import { formatUsd, safeImageSrc } from "@/lib/utils";
import type { BoardEntry } from "@/lib/server/rank";

const META = {
  gold: {
    src: "/rank/cup-gold.webp?v=3d4",
    delay: "0ms",
    ring: "gold" as const,
    width: "w-[40%] max-w-[200px] sm:w-[44%] sm:max-w-[240px]",
    avatar: 52,
    lift: "-mt-1",
    glow: "drop-shadow(0 18px 22px rgba(0,0,0,0.7)) drop-shadow(0 0 26px rgba(212,180,69,0.42))",
  },
  silver: {
    src: "/rank/cup-silver.webp?v=3d4",
    delay: "90ms",
    ring: "silver" as const,
    width: "w-[28%] max-w-[142px] sm:w-[30%] sm:max-w-[168px]",
    avatar: 40,
    lift: "mt-7",
    glow: "drop-shadow(0 14px 18px rgba(0,0,0,0.65)) drop-shadow(0 0 16px rgba(180,188,204,0.32))",
  },
  bronze: {
    src: "/rank/cup-bronze.webp?v=3d4",
    delay: "160ms",
    ring: "bronze" as const,
    width: "w-[26%] max-w-[132px] sm:w-[28%] sm:max-w-[156px]",
    avatar: 38,
    lift: "mt-9",
    glow: "drop-shadow(0 14px 18px rgba(0,0,0,0.65)) drop-shadow(0 0 16px rgba(205,127,50,0.32))",
  },
} as const;

function firstPhrase(note?: string | null) {
  if (!note) return "";
  const match = note.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] || note).trim();
}

function Place({
  place,
  entry,
  variant,
}: {
  place: 1 | 2 | 3;
  entry: BoardEntry;
  variant: "gold" | "silver" | "bronze";
}) {
  const m = META[variant];
  const phrase = firstPhrase(entry.shortNote);
  const photo = safeImageSrc(entry.profileImage);
  return (
    <figure
      className={`animate-podium trophy-slot relative ${m.width} ${m.lift} shrink-0`}
      style={{ animationDelay: m.delay }}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative z-20 -mb-[16%]">
          <AvatarImg
            src={photo}
            name={entry.displayName}
            size={m.avatar}
            ring={m.ring}
            className="avatar-orb"
          />
          <span className="absolute -right-1 -bottom-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/80 px-1 text-[10px] font-extrabold text-gold ring-1 ring-gold/50">
            #{place}
          </span>
        </div>
        <div className="trophy-wrap relative z-10 w-full">
          <img
            src={m.src}
            alt=""
            draggable={false}
            className="trophy-3d pointer-events-none w-full select-none"
            style={{ filter: m.glow, animationDelay: m.delay }}
          />
        </div>
        <figcaption className="plaque-glass relative z-20 -mt-1 w-full rounded-[14px] px-1.5 py-2 text-center sm:-mt-2 sm:px-2 sm:py-2.5">
          <p className="flex min-w-0 items-center justify-center gap-0.5 text-[11px] font-bold text-fg sm:text-[13px]">
            <span className="truncate">{entry.displayName}</span>
            <Verified />
          </p>
          <p className="mt-0.5 text-[13px] font-extrabold text-gold-grad tabular-nums sm:text-[15px]">
            ${formatUsd(entry.amountPaid)}
          </p>
          {phrase ? (
            <NoteTrigger
              note={entry.shortNote}
              name={entry.displayName}
              username={entry.username}
              image={entry.profileImage}
              amount={entry.amountPaid}
              rank={place}
              webLink={entry.webLink}
              lines={1}
              className="relative z-30 mt-0.5 hidden max-w-full text-[9px] leading-tight text-white/45 sm:block"
            >
              {phrase}
            </NoteTrigger>
          ) : null}
          <SafeWebLink
            href={entry.webLink}
            compact
            className="relative z-30 mx-auto mt-1 max-w-full justify-center text-[9px] font-semibold text-gold/80 sm:text-[10px]"
          />
        </figcaption>
      </div>
    </figure>
  );
}

function useStageTilt() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tilt-x", `${(4 - y * 6).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--tilt-x", "4deg");
      el.style.setProperty("--tilt-y", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return ref;
}

export function Podium({ entries }: { entries: BoardEntry[] }) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];
  const stage = useStageTilt();
  if (!first || !second || !third) {
    return (
      <div className="flex min-h-[200px] items-end justify-center pb-4 text-white/30 sm:min-h-[260px]">
        <p className="text-sm font-semibold">Waiting for champions…</p>
      </div>
    );
  }
  return (
    <div
      ref={stage}
      className="stage-3d relative mx-auto w-full max-w-[400px] overflow-x-clip sm:max-w-[520px] lg:max-w-[560px]"
    >
      <div className="stage-rig relative">
        <div className="stage-floor" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[6%] h-28 sm:h-36">
          <div className="stage-glow-silver absolute bottom-0 left-[20%] h-16 w-[32%] -translate-x-1/2 sm:h-24" />
          <div className="stage-glow-gold absolute bottom-0 left-1/2 h-24 w-[52%] -translate-x-1/2 sm:h-32" />
          <div className="stage-glow-bronze absolute bottom-0 left-[80%] h-16 w-[32%] -translate-x-1/2 sm:h-24" />
        </div>
        <div className="relative z-10 flex w-full items-end justify-center gap-0 px-0.5 pb-1 sm:pb-2">
          <Place place={2} entry={second} variant="silver" />
          <Place place={1} entry={first} variant="gold" />
          <Place place={3} entry={third} variant="bronze" />
        </div>
      </div>
    </div>
  );
}

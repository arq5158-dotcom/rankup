import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AvatarImg, Verified } from "./Avatar";
import { SafeWebLink } from "./SafeWebLink";
import { cn, formatScore } from "@/lib/utils";

export type NoteOpenArgs = {
  note: string;
  name: string;
  username?: string | null;
  image?: string | null;
  amount?: number;
  rank?: number;
  webLink?: string | null;
  origin: DOMRect;
  restoreFocus?: HTMLElement | null;
};

type Box = { x: number; y: number; w: number; h: number };

const OpenCtx = createContext<(args: NoteOpenArgs) => void>(() => {});

export function useOpenNote() {
  return useContext(OpenCtx);
}

export function NoteIslandRoot({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<NoteOpenArgs | null>(null);
  const open = useCallback((args: NoteOpenArgs) => {
    if (!args.note.trim()) return;
    const r = args.origin;
    setPayload({ ...args, origin: new DOMRect(r.x, r.y, r.width, r.height) });
  }, []);
  return (
    <OpenCtx.Provider value={open}>
      {children}
      {payload ? (
        <NoteIsland
          key={`${payload.name}-${payload.origin.x}-${payload.origin.y}`}
          payload={payload}
          onClose={() => setPayload(null)}
        />
      ) : null}
    </OpenCtx.Provider>
  );
}

export function NoteTrigger({
  note,
  name,
  username,
  image,
  amount,
  rank,
  webLink,
  className,
  lines = 2,
  children,
}: {
  note?: string | null;
  name: string;
  username?: string | null;
  image?: string | null;
  amount?: number;
  rank?: number;
  webLink?: string | null;
  className?: string;
  lines?: 1 | 2;
  children?: ReactNode;
}) {
  const open = useOpenNote();
  if (!note) return <span className={cn("text-white/15", className)}>—</span>;
  return (
    <button
      type="button"
      aria-label={`Read full message from ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        open({
          note,
          name,
          username,
          image,
          amount,
          rank,
          webLink,
          origin: e.currentTarget.getBoundingClientRect(),
          restoreFocus: e.currentTarget,
        });
      }}
      className={cn("note-chip", lines === 2 ? "line-clamp-2" : "truncate", className)}
    >
      {children ?? note}
    </button>
  );
}

function rectBox(r: DOMRect): Box {
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

function prefersReduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function play(el: Element, frames: Keyframe[], duration: number, easing: string) {
  const anim = el.animate(frames, { duration, easing, fill: "forwards" });
  try {
    await anim.finished;
  } catch {
    /* cancelled */
  }
  try {
    anim.commitStyles();
  } catch {
    /* ignore */
  }
  anim.cancel();
}

function NoteIsland({ payload, onClose }: { payload: NoteOpenArgs; onClose: () => void }) {
  const gooId = useId().replace(/:/g, "");
  const titleId = useId();
  const veilRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const neckRef = useRef<HTMLDivElement>(null);
  const massRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const phase = useRef<"open" | "ready" | "close">("open");
  const [ready, setReady] = useState(false);
  const [goo, setGoo] = useState(true);
  const closing = useRef(false);

  const finishClose = useCallback(() => {
    onClose();
    payload.restoreFocus?.focus?.();
  }, [onClose, payload.restoreFocus]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const card = cardRef.current;
    const veil = veilRef.current;
    const mass = massRef.current;
    const reduced = prefersReduced() || phase.current !== "ready";
    if (reduced || !card || !veil) {
      void Promise.all([
        card ? play(card, [{ opacity: getComputedStyle(card).opacity }, { opacity: 0 }], 140, "ease-in") : Promise.resolve(),
        veil ? play(veil, [{ opacity: getComputedStyle(veil).opacity }, { opacity: 0 }], 140, "ease-in") : Promise.resolve(),
      ]).then(finishClose);
      return;
    }
    phase.current = "close";
    const dest = rectBox(card.getBoundingClientRect());
    const origin = rectBox(payload.origin);
    const cx = dest.x + dest.w / 2;
    const cy = dest.y + dest.h / 2;
    const ox = origin.x + origin.w / 2;
    const oy = origin.y + origin.h / 2;
    if (contentRef.current) void play(contentRef.current, [{ opacity: 1 }, { opacity: 0 }], 90, "ease-in");
    void (async () => {
      await play(
        card,
        [
          { opacity: 1, transform: "translate(-50%, -50%) scale(1)", borderRadius: "24px" },
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.14)", borderRadius: "999px" },
        ],
        180,
        "cubic-bezier(0.55, 0, 0.8, 0.2)",
      );
      if (mass) {
        mass.style.opacity = "1";
        mass.style.left = `${cx - 14}px`;
        mass.style.top = `${cy - 14}px`;
        mass.style.width = "28px";
        mass.style.height = "28px";
        mass.style.borderRadius = "999px";
        mass.style.transform = "translate(0px, 0px) scale(1)";
        await play(
          mass,
          [
            { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
            { transform: `translate(${ox - cx}px, ${oy - cy}px) scale(0.45)`, opacity: 1, offset: 0.78 },
            { transform: `translate(${ox - cx}px, ${oy - cy}px) scale(0)`, opacity: 0 },
          ],
          220,
          "cubic-bezier(0.2, 0.8, 0.2, 1)",
        );
      }
      await play(veil, [{ opacity: getComputedStyle(veil).opacity }, { opacity: 0 }], 120, "ease-in");
      finishClose();
    })();
  }, [finishClose, payload.origin]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const nodes = cardRef.current.querySelectorAll<HTMLElement>("button, a[href]");
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const veil = veilRef.current;
    const source = sourceRef.current;
    const neck = neckRef.current;
    const mass = massRef.current;
    const spark = sparkRef.current;
    const ripple = rippleRef.current;
    const stage = stageRef.current;
    if (!card || !veil || !source || !neck || !mass) return;

    const dest = rectBox(card.getBoundingClientRect());
    const origin = rectBox(payload.origin);
    const ox = origin.x + origin.w / 2;
    const oy = origin.y + origin.h / 2;
    const dx = dest.x + dest.w / 2;
    const dy = dest.y + dest.h / 2;
    const vx = dx - ox;
    const vy = dy - oy;
    const dist = Math.hypot(vx, vy) || 1;
    const nx = vx / dist;
    const ny = vy / dist;
    const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
    const drop = Math.max(22, Math.min(origin.h || 28, origin.w || 28, 40));

    source.style.left = `${origin.x}px`;
    source.style.top = `${origin.y}px`;
    source.style.width = `${Math.max(origin.w, 8)}px`;
    source.style.height = `${Math.max(origin.h, 8)}px`;
    source.style.borderRadius = `${Math.min(origin.h / 2, 14)}px`;
    source.style.opacity = "1";
    source.style.transform = "none";

    mass.style.left = `${ox - drop / 2}px`;
    mass.style.top = `${oy - drop / 2}px`;
    mass.style.width = `${drop}px`;
    mass.style.height = `${drop}px`;
    mass.style.borderRadius = "999px";
    mass.style.opacity = "0";
    mass.style.transform = "translate(0px, 0px) scale(0.4)";

    neck.style.left = `${ox}px`;
    neck.style.top = `${oy}px`;
    neck.style.width = "0px";
    neck.style.height = `${Math.max(origin.h * 0.78, 10)}px`;
    neck.style.opacity = "0";
    neck.style.transform = `translateY(-50%) rotate(${angle}deg)`;

    if (spark) {
      spark.style.left = `${ox + vx * 0.5 - 7}px`;
      spark.style.top = `${oy + vy * 0.5 - 7}px`;
      spark.style.opacity = "0";
      spark.style.transform = "scale(0.3)";
    }
    if (ripple) {
      ripple.style.left = `${dx - 36}px`;
      ripple.style.top = `${dy - 36}px`;
      ripple.style.opacity = "0";
      ripple.style.transform = "scale(0.4)";
    }

    const reduced = prefersReduced();
    let cancelled = false;

    const run = async () => {
      if (reduced || dist < 48) {
        setGoo(false);
        await Promise.all([
          play(veil, [{ opacity: 0 }, { opacity: 1 }], 180, "ease-out"),
          play(
            card,
            [
              { opacity: 0, transform: "translate(-50%, -50%) scale(0.96)" },
              { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
            ],
            220,
            "cubic-bezier(0.22, 1, 0.36, 1)",
          ),
        ]);
        if (cancelled) return;
        phase.current = "ready";
        setReady(true);
        if (contentRef.current) contentRef.current.style.opacity = "1";
        closeBtnRef.current?.focus();
        return;
      }

      void play(veil, [{ opacity: 0 }, { opacity: 0.2, offset: 0.4 }, { opacity: 1 }], 560, "ease-out");

      await play(
        source,
        [
          { transform: "scale(1)", filter: "brightness(1)" },
          { transform: "scale(1.22)", filter: "brightness(1.35)" },
        ],
        80,
        "cubic-bezier(0.3, 0, 0.1, 1)",
      );
      if (cancelled) return;

      mass.style.opacity = "1";
      neck.style.opacity = "1";

      await Promise.all([
        play(
          neck,
          [
            { width: "0px", height: `${Math.max(origin.h * 0.85, 12)}px`, opacity: 1 },
            { width: `${dist * 0.55}px`, height: `${Math.max(origin.h * 0.5, 11)}px`, offset: 0.55 },
            { width: `${dist}px`, height: "10px" },
          ],
          210,
          "cubic-bezier(0.22, 0.08, 0.2, 1)",
        ),
        play(
          mass,
          [
            { transform: "translate(0px, 0px) scale(0.7, 0.7)", opacity: 1 },
            { transform: `translate(${vx * 0.4}px, ${vy * 0.4}px) scale(1.25, 0.72)`, offset: 0.58 },
            { transform: `translate(${vx * 0.72}px, ${vy * 0.72}px) scale(1.18, 0.78)` },
          ],
          210,
          "cubic-bezier(0.22, 0.1, 0.25, 1)",
        ),
      ]);
      if (cancelled) return;

      if (spark) {
        void play(
          spark,
          [
            { opacity: 0, transform: "scale(0.2)" },
            { opacity: 1, transform: "scale(1.15)", offset: 0.3 },
            { opacity: 0, transform: "scale(1.8)" },
          ],
          240,
          "ease-out",
        );
      }

      await Promise.all([
        play(
          neck,
          [
            { width: `${dist}px`, height: "10px", opacity: 1 },
            { width: `${dist}px`, height: "2px", opacity: 1, offset: 0.4 },
            { width: `${dist * 0.3}px`, height: "0px", opacity: 0 },
          ],
          90,
          "cubic-bezier(0.7, 0, 0.95, 0.2)",
        ),
        play(
          source,
          [
            { transform: "scale(1.22)", opacity: 1 },
            { transform: `scale(0.8) translate(${-nx * 14}px, ${-ny * 14}px)`, opacity: 0.85, offset: 0.4 },
            { transform: "scale(0.3)", opacity: 0 },
          ],
          240,
          "cubic-bezier(0.34, 1.45, 0.64, 1)",
        ),
        play(
          mass,
          [
            { transform: `translate(${vx * 0.72}px, ${vy * 0.72}px) scale(1.35, 0.68)` },
            { transform: `translate(${vx}px, ${vy}px) scale(0.85, 0.85)` },
          ],
          130,
          "cubic-bezier(0.12, 0, 0, 1)",
        ),
      ]);
      if (cancelled) return;

      if (ripple) {
        void play(
          ripple,
          [
            { opacity: 0.55, transform: "scale(0.4)" },
            { opacity: 0, transform: "scale(2.2)" },
          ],
          420,
          "cubic-bezier(0.22, 1, 0.36, 1)",
        );
      }

      setGoo(false);
      if (stage) stage.style.filter = "none";

      mass.style.left = `${dx - drop / 2}px`;
      mass.style.top = `${dy - drop / 2}px`;
      mass.style.transform = "none";
      await play(
        mass,
        [
          {
            left: `${dx - drop / 2}px`,
            top: `${dy - drop / 2}px`,
            width: `${drop}px`,
            height: `${drop}px`,
            borderRadius: "999px",
            transform: "scale(0.9)",
          },
          {
            left: `${dest.x - dest.w * 0.02}px`,
            top: `${dest.y - dest.h * 0.03}px`,
            width: `${dest.w * 1.04}px`,
            height: `${dest.h * 1.06}px`,
            borderRadius: "28px",
            transform: "scale(1)",
            offset: 0.6,
          },
          {
            left: `${dest.x}px`,
            top: `${dest.y}px`,
            width: `${dest.w}px`,
            height: `${dest.h}px`,
            borderRadius: "22px",
            transform: "scale(0.985)",
            offset: 0.82,
          },
          {
            left: `${dest.x}px`,
            top: `${dest.y}px`,
            width: `${dest.w}px`,
            height: `${dest.h}px`,
            borderRadius: "24px",
            transform: "scale(1)",
          },
        ],
        300,
        "cubic-bezier(0.22, 1.35, 0.36, 1)",
      );
      if (cancelled) return;

      mass.style.opacity = "0";
      card.style.opacity = "1";
      card.style.transform = "translate(-50%, -50%) scale(1)";
      if (contentRef.current) {
        await play(
          contentRef.current,
          [
            { opacity: 0, filter: "blur(8px)", transform: "translateY(8px)" },
            { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
          ],
          180,
          "cubic-bezier(0.22, 1, 0.36, 1)",
        );
      }
      if (cancelled) return;
      phase.current = "ready";
      setReady(true);
      closeBtnRef.current?.focus();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [payload.origin]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`liquid-island ${ready ? "is-live" : ""}`} role="presentation">
      <div
        ref={veilRef}
        className="liquid-veil"
        onClick={() => {
          if (phase.current === "ready") close();
        }}
      />
      <svg className="liquid-defs" aria-hidden>
        <defs>
          <filter id={`goo-${gooId}`} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div
        ref={stageRef}
        className={`liquid-stage ${goo ? "is-goo" : ""}`}
        style={goo ? { filter: `url(#goo-${gooId})` } : undefined}
      >
        <div ref={sourceRef} className="liquid-blob" />
        <div ref={neckRef} className="liquid-neck" />
        <div ref={massRef} className="liquid-blob liquid-mass" />
      </div>
      <div ref={sparkRef} className="liquid-spark" />
      <div ref={rippleRef} className="liquid-ripple" />
      <div ref={cardRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="liquid-card glass-card">
        <div ref={contentRef} className="liquid-card-inner">
          <button ref={closeBtnRef} type="button" className="liquid-close" aria-label="Close message" onClick={close}>
            <X className="h-4 w-4" />
          </button>
          <header className="flex items-center gap-3 pr-8">
            <AvatarImg src={payload.image} name={payload.name} size={44} />
            <div className="min-w-0 flex-1">
              <p id={titleId} className="flex min-w-0 items-center text-[14px] font-semibold text-fg">
                <span className="truncate">{payload.name}</span>
                <Verified />
              </p>
              {payload.username ? <p className="truncate text-[12px] text-white/40">@{payload.username}</p> : null}
            </div>
            {payload.rank != null ? (
              <span className="shrink-0 text-[11px] font-bold tracking-wider text-gold/80">#{payload.rank}</span>
            ) : null}
          </header>
          <blockquote className="liquid-quote">{payload.note}</blockquote>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {payload.amount != null ? (
              <p className="text-[12px] font-bold text-success tabular-nums">{formatScore(payload.amount)} SCORE</p>
            ) : (
              <span />
            )}
            <SafeWebLink href={payload.webLink} compact className="text-[12px] font-semibold" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

import { formatScore, safeImageSrc } from "@/lib/utils";
import type { SpinSegment } from "@/lib/server/spin";
import { useId } from "react";

const SLICE = 60;
const FILLS = ["#c4a24a", "#6b5420", "#e8d48a", "#8a7028", "#d4b445", "#4a3a14"];

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function piePath(start: number, end: number, r = 98) {
  const a0 = start - 90;
  const a1 = end - 90;
  const p0 = polar(100, 100, r, a0);
  const p1 = polar(100, 100, r, a1);
  return `M 100 100 L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
}

export function RankWheel({
  segments,
  rotation = 0,
  spinning = false,
  size = "md",
}: {
  segments: SpinSegment[];
  rotation?: number;
  spinning?: boolean;
  size?: "sm" | "md";
}) {
  const uid = useId().replace(/:/g, "");
  const filled = Array.from({ length: 6 }, (_, i) => segments.find((s) => s.slot === i + 1) || {
    slot: i + 1,
    label: `+${100 * (i + 1)}`,
    scoreReward: 100 * (i + 1),
    image: null,
    enabled: true,
    weight: 1,
  });

  return (
    <div className={`wheel-stage ${size === "sm" ? "is-sm" : ""}`}>
      <div className="wheel-pointer" />
      <div
        className={`wheel-disk ${spinning ? "is-spinning" : ""}`}
        style={{ transform: `rotateX(16deg) rotateZ(${rotation}deg)` }}
      >
        <div className="wheel-rim" />
        <svg viewBox="0 0 200 200" className="wheel-svg" aria-hidden>
          <defs>
            {filled.map((s, i) => (
              <clipPath key={s.slot} id={`${uid}-s${i}`}>
                <path d={piePath(i * SLICE, (i + 1) * SLICE)} />
              </clipPath>
            ))}
          </defs>
          {filled.map((s, i) => {
            const img = safeImageSrc(s.image);
            const d = piePath(i * SLICE, (i + 1) * SLICE);
            return (
              <g key={s.slot} clipPath={`url(#${uid}-s${i})`}>
                <path d={d} fill={FILLS[i]} />
                {img ? (
                  <image
                    href={img}
                    x="2"
                    y="2"
                    width="196"
                    height="196"
                    preserveAspectRatio="xMidYMid slice"
                    transform={`rotate(${i * SLICE} 100 100)`}
                  />
                ) : null}
                <path d={d} fill="rgba(8,8,12,0.22)" />
              </g>
            );
          })}
          {filled.map((s, i) => {
            const mid = i * SLICE + SLICE / 2;
            const pos = polar(100, 100, 54, mid - 90);
            const flip = mid > 90 && mid < 270 ? 180 : 0;
            const img = Boolean(safeImageSrc(s.image));
            return (
              <text
                key={`t${s.slot}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid + flip} ${pos.x} ${pos.y})`}
                fill={img ? "#f7f1de" : "#08080c"}
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="0.8"
                paintOrder="stroke"
                style={{ fontSize: s.scoreReward === 0 ? 9 : 12, fontWeight: 800, letterSpacing: "0.02em" }}
              >
                {s.scoreReward === 0 ? "NO SCORE" : `+${formatScore(s.scoreReward)}`}
              </text>
            );
          })}
        </svg>
        <div className="wheel-gloss" />
        <div className="wheel-hub" />
      </div>
    </div>
  );
}

export { SLICE as WHEEL_SLICE };

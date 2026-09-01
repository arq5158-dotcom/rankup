import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parts(target: number) {
  const diff = Math.max(0, (Number.isFinite(target) ? target : 0) - Date.now());
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff % 864e5) / 36e5),
    m: Math.floor((diff % 36e5) / 6e4),
    s: Math.floor((diff % 6e4) / 1e3),
  };
}

export function CountDown({
  target,
  prefix = "Resets in",
  compact = false,
}: {
  target: number;
  prefix?: string;
  compact?: boolean;
}) {
  const [t, setT] = useState(() => parts(target));
  useEffect(() => {
    const tick = () => setT(parts(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (compact) {
    return (
      <div className="cd-pill" aria-label={`${prefix} ${t.d} days ${t.h} hours`}>
        <span className="text-[10px] font-medium tracking-wide text-white/45">{prefix}</span>
        <span className="cd-pill-box">{t.d}d</span>
        <span className="cd-pill-box">{pad(t.h)}h</span>
      </div>
    );
  }

  const units = [
    { value: t.d, label: "d" },
    { value: t.h, label: "h" },
    { value: t.m, label: "m" },
    { value: t.s, label: "s" },
  ];

  return (
    <div className="cd" aria-label={`${prefix} ${t.d} days, ${t.h} hours, ${t.m} minutes, ${t.s} seconds`}>
      <span className="cd-prefix">{prefix}</span>
      <span className="cd-track">
        {units.map((u, i) => (
          <span key={u.label} className="cd-cell">
            {i > 0 ? (
              <span className="cd-sep" aria-hidden>
                :
              </span>
            ) : null}
            <span className="cd-unit">
              <span className="cd-num">{pad(u.value)}</span>
              <span className="cd-lab">{u.label}</span>
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

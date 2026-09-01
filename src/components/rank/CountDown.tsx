import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="font-mono text-[11px] font-bold leading-none text-gold-light tabular-nums">
        {pad(value)}
      </span>
      <span className="ml-px text-[8px] font-semibold tracking-wide text-white/38">{label}</span>
    </span>
  );
}

export function CountDown({ target }: { target: number }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setT({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div
      className="inline-flex max-w-full flex-nowrap items-center gap-1.5 rounded-lg px-1 py-0.5"
      aria-label={`Resets in ${t.d} days, ${t.h} hours, ${t.m} minutes, ${t.s} seconds`}
    >
      <span className="text-[10px] font-medium tracking-wide text-white/38">Resets in</span>
      <span className="inline-flex items-center gap-1">
        <Unit value={t.d} label="d" />
        <span className="text-[10px] text-white/18">:</span>
        <Unit value={t.h} label="h" />
        <span className="text-[10px] text-white/18">:</span>
        <Unit value={t.m} label="m" />
        <span className="text-[10px] text-white/18">:</span>
        <span key={t.s} className="tick inline-flex items-baseline">
          <span className="font-mono text-[11px] font-bold leading-none text-gold-light tabular-nums">
            {pad(t.s)}
          </span>
          <span className="ml-px text-[8px] font-semibold tracking-wide text-white/38">s</span>
        </span>
      </span>
    </div>
  );
}

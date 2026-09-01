import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
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

  const units = [
    { value: t.d, label: "d" },
    { value: t.h, label: "h" },
    { value: t.m, label: "m" },
    { value: t.s, label: "s" },
  ];

  return (
    <div
      className="cd"
      aria-label={`Resets in ${t.d} days, ${t.h} hours, ${t.m} minutes, ${t.s} seconds`}
    >
      <span className="cd-prefix">Resets in</span>
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

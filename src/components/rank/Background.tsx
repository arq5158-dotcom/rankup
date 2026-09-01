const DUST = [
  { l: "12%", t: "22%", s: 2, d: "0s" },
  { l: "28%", t: "38%", s: 3, d: "1.2s" },
  { l: "46%", t: "18%", s: 2, d: "2.1s" },
  { l: "63%", t: "30%", s: 4, d: "0.4s" },
  { l: "78%", t: "16%", s: 2, d: "2.8s" },
  { l: "18%", t: "58%", s: 3, d: "1.6s" },
  { l: "55%", t: "48%", s: 2, d: "3.4s" },
  { l: "84%", t: "42%", s: 3, d: "0.8s" },
  { l: "34%", t: "70%", s: 2, d: "2.4s" },
  { l: "70%", t: "64%", s: 3, d: "1.1s" },
  { l: "8%", t: "44%", s: 2, d: "3.8s" },
  { l: "92%", t: "28%", s: 3, d: "1.9s" },
  { l: "41%", t: "8%", s: 2, d: "0.6s" },
  { l: "58%", t: "76%", s: 2, d: "2.6s" },
];

export function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />
      <img
        src="/rank/mountains.jpg"
        alt=""
        className="scene-mountains absolute inset-x-0 top-0 h-[78%] w-full object-cover object-[center_42%] opacity-[0.72]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/18 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[66%] bg-gradient-to-t from-bg via-bg/88 to-transparent" />
      <div className="god-rays absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="film-grain absolute inset-0" />
      <div className="absolute top-[16%] left-1/2 h-[240px] w-[min(620px,140%)] -translate-x-1/2 rounded-full bg-gold/18 blur-[140px]" />
      <div className="absolute top-[38%] left-1/2 h-[160px] w-[380px] -translate-x-1/2 rounded-full bg-gold/10 blur-[100px]" />
      <div className="absolute inset-0">
        {DUST.map((d, i) => (
          <span
            key={i}
            className="dust-mote"
            style={{
              left: d.l,
              top: d.t,
              width: d.s,
              height: d.s,
              animationDelay: d.d,
            }}
          />
        ))}
      </div>
    </div>
  );
}

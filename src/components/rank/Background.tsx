export function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />
      <img
        src="/rank/mountains.webp"
        alt=""
        className="absolute inset-x-0 top-0 h-[86%] w-full object-cover object-center opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-bg" />
      <div className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-bg via-bg/90 to-transparent" />
      <div className="vignette absolute inset-0" />
      <div className="bg-dots absolute inset-0 opacity-20" />
      <div className="absolute top-[14%] left-1/2 h-[360px] w-[860px] -translate-x-1/2 rounded-full bg-gold/36 blur-[140px]" />
      <div className="absolute top-[36%] left-1/2 h-[220px] w-[520px] -translate-x-1/2 rounded-full bg-gold/20 blur-[100px]" />
      <div className="absolute top-[8%] left-[12%] h-[180px] w-[280px] rounded-full bg-gold/10 blur-[90px]" />
    </div>
  );
}

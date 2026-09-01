import { ArrowRight, Crown, Eye, Lock, Zap } from "lucide-react";

const STEPS = [
  {
    icon: Lock,
    title: "Pay",
    body: "Buy credits with Stripe. $1 = 1,000 credits by default. Credits sit in your wallet until you spend them.",
    cup: "/rank/cup-gold.webp?v=3d4",
  },
  {
    icon: Zap,
    title: "Climb",
    body: "Spend credits 1:1 into Score on the weekly board or the monthly board — you choose. Each leaderboard is separate. Others can overtake you at any time.",
    cup: "/rank/cup-silver.webp?v=3d4",
  },
  {
    icon: Eye,
    title: "Get Seen",
    body: "Top listings get featured placement, badges, and the Hall of Fame. Separate giveaways never require a purchase.",
    cup: "/rank/cup-bronze.webp?v=3d4",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="glass-card card-3d rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">The loop</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-fg">How it works</h2>
        </div>
        <Crown className="h-6 w-6 text-gold/50" />
      </div>
      <div className="stagger-in grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="step-card relative overflow-hidden rounded-xl border border-white/[0.05] bg-[#12121a] p-5">
            <img
              src={s.cup}
              alt=""
              draggable={false}
              className="trophy-3d pointer-events-none absolute -right-2 -bottom-8 h-28 w-28 object-contain opacity-35"
            />
            <div className="relative mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="font-display text-2xl font-black text-white/10">0{i + 1}</span>
            </div>
            <h3 className="relative text-sm font-extrabold tracking-wide text-fg uppercase">{s.title}</h3>
            <p className="relative mt-2 text-[13px] leading-relaxed text-white/45">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-white/30">
        Promotional listings. Featured placement. 18+ only. <ArrowRight className="h-3 w-3" />
      </p>
    </section>
  );
}

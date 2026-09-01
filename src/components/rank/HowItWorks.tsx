import { ArrowRight, Crown, Lock, Trophy, Zap } from "lucide-react";

const STEPS = [
  {
    icon: Lock,
    title: "Pay",
    body: "Secure your entry with Stripe. Choose a contribution — higher amounts climb faster.",
  },
  {
    icon: Zap,
    title: "Climb",
    body: "Live rankings update the moment you pay. Outperform the field and hold your rank.",
  },
  {
    icon: Trophy,
    title: "Win",
    body: "Monthly top 3 split the prize pool. Weekly, only #1 takes the crown.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">The loop</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-fg">How it works</h2>
        </div>
        <Crown className="h-6 w-6 text-gold/50" />
      </div>
      <div className="stagger-in grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="step-card relative rounded-xl border border-white/[0.05] bg-[#12121a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="font-display text-2xl font-black text-white/10">0{i + 1}</span>
            </div>
            <h3 className="text-sm font-extrabold tracking-wide text-fg uppercase">{s.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/30">
        Fair play. Strict rules. Real prizes. <ArrowRight className="h-3 w-3" />
      </p>
    </section>
  );
}

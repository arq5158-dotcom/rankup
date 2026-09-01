import { Headphones, Scale, ShieldCheck } from "lucide-react";

const BADGES = [
  {
    icon: ShieldCheck,
    t: "Secure Platform",
    s: "SSL Encrypted",
    d: "Checkout runs on Stripe. Card numbers never touch Pay4Rank servers.",
  },
  {
    icon: Scale,
    t: "Fair ranking",
    s: "Credits only",
    d: "Rank is Score. Spend credits 1:1, or claim Free Spin Score. Ties go to the earlier Score gain. Featured titles are visibility, not prizes.",
  },
  {
    icon: Headphones,
    t: "24/7 Support",
    s: "We're here",
    d: "Payment, ranking, or listing questions — reach us any time from Contact.",
  },
];

export function TrustBadges() {
  return (
    <section aria-labelledby="trust-heading" className="glass-card rounded-2xl p-6 sm:p-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Trust</p>
      <h2 id="trust-heading" className="mt-1 font-display text-2xl font-extrabold tracking-tight text-fg">
        Built to rank fair
      </h2>
      <div className="stagger-in mt-6 grid gap-3 sm:grid-cols-3">
        {BADGES.map((b) => (
          <div key={b.t} className="step-card rounded-2xl border border-white/[0.05] bg-[#12121a] p-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold/[0.1] text-gold ring-1 ring-gold/20">
              <b.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-fg">{b.t}</p>
            <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-gold/80 uppercase">{b.s}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">{b.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

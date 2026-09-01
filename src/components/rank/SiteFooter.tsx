import { Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";

const COMPETE = [
  { to: "/", label: "Leaderboard", hash: "/#leaderboard" },
  { to: "/weekly", label: "Weekly" },
  { to: "/monthly", label: "Monthly" },
  { to: "/prizes", label: "Prizes" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/archive", label: "Past seasons" },
] as const;

const LEGAL = [
  { to: "/rules", label: "Official rules" },
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy" },
  { to: "/cookies", label: "Cookies" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="relative z-10 mt-auto border-t border-white/[0.06] bg-bg/90">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-[11px] text-white/35">© {new Date().getFullYear()} Rank Up · Payments in USD</p>
          <nav className="flex flex-wrap gap-4 text-[11px] text-white/40">
            <Link to="/terms" className="hover:text-fg">
              Terms
            </Link>
            <Link to="/rules" className="hover:text-fg">
              Rules
            </Link>
            <Link to="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link to="/contact" className="hover:text-fg">
              Support
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 mt-6 border-t border-gold/10 bg-black/40 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-[1280px] gap-7 px-4 py-7 sm:grid-cols-2 sm:px-5 lg:grid-cols-4 lg:gap-10 lg:py-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/35">
              <Crown className="h-3.5 w-3.5 fill-gold text-gold" />
            </span>
            <span className="text-[13px] font-extrabold tracking-[0.08em] text-fg">RANK UP</span>
          </Link>
          <p className="mt-2.5 max-w-xs text-[12px] leading-relaxed text-pretty text-white/38">
            A live prize leaderboard. Contribute, climb, and win — rankings update only after payment confirms.
          </p>
          <p className="mt-2.5 text-[10px] font-bold tracking-wider text-white/28 uppercase">18+ · Void where prohibited</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Compete</p>
          <ul className="mt-2.5 space-y-1.5">
            {COMPETE.map((l) =>
              "hash" in l && l.hash ? (
                <li key={l.label}>
                  <a href={l.hash} className="text-[12px] text-white/48 hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.to}>
                  <Link to={l.to} className="text-[12px] text-white/48 hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Legal</p>
          <ul className="mt-2.5 space-y-1.5">
            {LEGAL.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-[12px] text-white/48 hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Payments</p>
          <p className="mt-2.5 text-[12px] leading-relaxed text-white/42">
            Card payments are processed by Stripe. Rank Up never stores full card numbers.
          </p>
          <Link to="/contact" className="mt-2.5 inline-block text-[12px] text-gold hover:text-gold-light">
            Contact support
          </Link>
        </div>
      </div>
      <div className="border-t border-white/[0.04] py-3.5">
        <p className="text-center text-[11px] tracking-wide text-white/28">
          © {new Date().getFullYear()} Rank Up. Compete. Contribute. Win.
        </p>
      </div>
    </footer>
  );
}

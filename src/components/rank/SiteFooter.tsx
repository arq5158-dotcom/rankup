import { Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";

const COMPETE = [
  { to: "/", label: "Leaderboard" },
  { to: "/weekly", label: "Weekly" },
  { to: "/monthly", label: "Monthly" },
  { to: "/prizes", label: "Positions" },
  { to: "/spin", label: "Free Spin" },
  { to: "/wallet", label: "Wallet" },
  { to: "/giveaways", label: "Giveaways" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/archive", label: "Past seasons" },
] as const;

const GUIDES = [
  { to: "/guides", label: "All guides" },
  { to: "/guides/how-to-get-traffic-to-a-new-website", label: "New-site traffic" },
  { to: "/guides/product-hunt-launch-guide", label: "Product Hunt launch" },
  { to: "/guides/website-traffic-simple-lasting-guide", label: "Lasting traffic" },
  { to: "/guides/traffic-site-internet", label: "Traffic site internet" },
  { to: "/guides/hiring-a-link-building-agency", label: "Link building agencies" },
] as const;

const LEGAL = [
  { to: "/rules", label: "Rules" },
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy" },
  { to: "/cookies", label: "Cookies" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="relative z-10 mt-auto border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
          <p className="text-[11px] text-white/35">© {year} Pay4Rank</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
            {LEGAL.map((l) => (
              <Link key={l.to} to={l.to} className="transition-colors hover:text-fg">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 mt-8 border-t border-white/[0.07] bg-black/25">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-5 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <Link to="/" className="inline-flex shrink-0 items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/12 ring-1 ring-gold/30">
              <Crown className="h-3.5 w-3.5 fill-gold text-gold" />
            </span>
            <span className="text-[12px] font-extrabold tracking-[0.14em] text-fg">PAY4RANK</span>
          </Link>

          <nav aria-label="Compete" className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5 lg:justify-center">
            {COMPETE.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[12px] text-white/48 transition-colors hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav aria-label="Guides" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {GUIDES.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[12px] text-white/48 transition-colors hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {LEGAL.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[12px] text-white/48 transition-colors hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-white/[0.05] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-white/28 uppercase">
            18+ · Promotional listing · Not a prize contest
          </p>
          <p className="text-[11px] text-white/32">
            © {year} Pay4Rank · Credits buy Score. Score buys visibility.
          </p>
          <p className="text-[11px] text-white/32">
            Payments by Stripe ·{" "}
            <Link to="/contact" className="text-gold/80 hover:text-gold">
              Support
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

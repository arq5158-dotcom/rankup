import { useEffect, useState } from "react";
import { ChevronDown, Crown, Menu, Shield, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccount } from "@/lib/server/rank";
import { AvatarImg } from "./Avatar";
import { ProfileMenu } from "./ProfileMenu";
import { usePresence } from "./motion";

const LINKS = [
  { label: "Leaderboard", href: "/#leaderboard" },
  { label: "Weekly", href: "/weekly" },
  { label: "Monthly", href: "/monthly" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Prizes", href: "/prizes" },
];

export type AccountInfo = {
  name: string;
  email: string;
  image?: string | null;
  completeness: number;
  monthlyRank: number | null;
  weeklyRank: number | null;
  twoFactor: boolean;
  isAdmin: boolean;
  isOwner: boolean;
};

export function Navbar({
  active = "Leaderboard",
  account: accountProp,
}: {
  active?: string;
  account?: AccountInfo | null;
}) {
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [fetched, setFetched] = useState<AccountInfo | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setFetched(null);
      return;
    }
    if (accountProp) return;
    void getMyAccount()
      .then((a) => {
        setFetched({
          name: a.profile.displayName || user.displayName || "Competitor",
          email: a.profile.email || user.primaryEmail || "",
          image: a.profile.profileImage || user.profileImageUrl,
          completeness: a.completeness,
          monthlyRank: a.monthlyRank,
          weeklyRank: a.weeklyRank,
          twoFactor: a.profile.twoFactorEnabled,
          isAdmin: a.profile.isAdmin,
          isOwner: a.profile.isOwner,
        });
      })
      .catch(() => setFetched(null));
  }, [user, accountProp]);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const signedIn = Boolean(user);
  const account = accountProp ?? fetched;
  const isAdmin = account?.isAdmin ?? false;
  const displayName = account?.name || user?.displayName || "Competitor";
  const email = account?.email || user?.primaryEmail || "";
  const image = account?.image || user?.profileImageUrl || null;
  const sheet = usePresence(mobile, 200);

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <nav
          aria-label="Primary"
          className="glass-nav mx-auto grid h-12 max-w-[1440px] grid-cols-[1fr_auto] items-center rounded-full px-1.5 sm:h-[60px] sm:px-3 lg:grid-cols-[1fr_auto_1fr]"
        >
          <Link to="/" className="flex min-w-0 items-center gap-2 justify-self-start pl-1 sm:gap-2.5 sm:pl-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(240,215,138,0.42),rgba(201,168,76,0.14)_58%,transparent)] ring-1 ring-gold/50 shadow-[0_0_18px_rgba(201,168,76,0.32)]">
              <Crown className="h-4 w-4 fill-gold text-gold" />
            </span>
            <span className="leading-none">
              <span className="block text-[13px] font-extrabold tracking-[0.1em] text-fg sm:text-[15px]">
                RANK UP
              </span>
              <span className="hidden text-[6.5px] tracking-[0.28em] text-gold/60 uppercase sm:block">
                Compete. Contribute. Win.
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-current={item.label === active ? "page" : undefined}
                className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  item.label === active
                    ? "nav-active text-fg"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/85"
                }`}
              >
                {item.label}
              </a>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`relative rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                  active === "Admin"
                    ? "nav-active text-gold"
                    : "text-gold/80 hover:bg-gold/10 hover:text-gold"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center justify-end gap-1.5 justify-self-end">
            {!(hydrated && signedIn) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/login", search: { mode: "in" } })}
                  className="btn-outline btn-nav hidden lg:inline-flex"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/login", search: { mode: "up" } })}
                  className="btn-gold btn-nav hidden lg:inline-flex"
                >
                  Sign Up
                </button>
              </>
            )}
            {hydrated && signedIn && (
              <button
                type="button"
                onClick={() => {
                  setOpen((v) => !v);
                  setMobile(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-white/[0.03] shadow-[0_0_12px_rgba(201,168,76,0.18)] sm:h-9 sm:w-auto sm:gap-1.5 sm:py-0 sm:pr-2 sm:pl-0.5"
                aria-label="Account"
              >
                <AvatarImg src={image} name={displayName} size={26} ring="gold" />
                <ChevronDown className={`hidden h-3 w-3 text-white/35 sm:block chevron-rot ${open ? "is-open" : ""}`} />
              </button>
            )}
            <button
              type="button"
              className="tap flex h-10 w-10 items-center justify-center rounded-full text-white/60 lg:hidden"
              onClick={() => {
                setMobile((v) => !v);
                setOpen(false);
              }}
              aria-label={mobile ? "Close menu" : "Menu"}
              aria-expanded={mobile}
            >
              <span className="icon-swap">
                <span className={mobile ? "is-on" : "is-off"}>
                  <X className="h-5 w-5" />
                </span>
                <span className={mobile ? "is-off" : "is-on"}>
                  <Menu className="h-5 w-5" />
                </span>
              </span>
            </button>
          </div>
        </nav>
      </header>
      {sheet.shown && (
        <div className={`menu-layer z-[70] lg:hidden ${sheet.on ? "is-open" : ""}`}>
          <button
            type="button"
            className="menu-scrim"
            aria-label="Close menu"
            onClick={() => setMobile(false)}
          />
          <div className="sheet-surface glass-card absolute inset-x-3 top-[68px] max-h-[min(78dvh,640px)] overflow-y-auto rounded-2xl p-2">
            {LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobile(false)}
                className={`link-row tap flex min-h-12 items-center rounded-xl px-4 text-[15px] font-semibold transition-colors ${
                  item.label === active ? "bg-white/[0.05] text-fg" : "text-white/70 hover:bg-white/[0.04] hover:text-fg"
                }`}
              >
                {item.label}
              </a>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobile(false)}
                className="link-row tap flex min-h-12 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold text-gold"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            {!(hydrated && signedIn) && (
              <div className="mt-2 grid grid-cols-2 gap-2 px-1">
                <Link
                  to="/login"
                  search={{ mode: "in" }}
                  onClick={() => setMobile(false)}
                  className="btn-outline tap flex min-h-12 items-center justify-center rounded-xl text-sm font-bold"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  search={{ mode: "up" }}
                  onClick={() => setMobile(false)}
                  className="btn-gold tap flex min-h-12 items-center justify-center rounded-xl text-sm font-extrabold"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <a
              href="/#rank-up"
              onClick={() => setMobile(false)}
              className="btn-gold tap mt-2 flex min-h-12 items-center justify-center rounded-xl text-sm font-extrabold"
            >
              Participate Now
            </a>
          </div>
        </div>
      )}
      {signedIn && (
        <ProfileMenu
          open={open}
          onClose={() => setOpen(false)}
          name={displayName}
          email={email}
          image={image}
          completeness={account?.completeness ?? 20}
          monthlyRank={account?.monthlyRank ?? null}
          weeklyRank={account?.weeklyRank ?? null}
          twoFactor={account?.twoFactor ?? false}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}

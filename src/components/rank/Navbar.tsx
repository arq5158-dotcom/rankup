import { useEffect, useState } from "react";
import { Crown, History, Lock, LogOut, Menu, Settings, Shield, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccount } from "@/lib/server/rank";
import { AvatarImg } from "./Avatar";
import { usePresence } from "./motion";

const LINKS = [
  { label: "Leaderboard", to: "/" as const, hash: "leaderboard" },
  { label: "Weekly", to: "/weekly" as const },
  { label: "Monthly", to: "/monthly" as const },
  { label: "How It Works", to: "/how-it-works" as const },
  { label: "Positions", to: "/prizes" as const },
  { label: "Giveaways", to: "/giveaways" as const },
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
  }, [user?.id, accountProp]);

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
  const sheet = usePresence(mobile, 280);

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <nav
          aria-label="Primary"
          className="glass-nav mx-auto grid h-14 max-w-[1640px] grid-cols-[1fr_auto] items-center rounded-full px-2 sm:h-[66px] sm:px-4 lg:grid-cols-[1fr_auto_1fr]"
        >
          <Link to="/" preload="intent" className="flex min-w-0 items-center gap-2.5 justify-self-start pl-1.5 sm:gap-3 sm:pl-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,244,196,0.42),rgba(196,162,74,0.14)_58%,transparent)] ring-1 ring-gold/40 shadow-[0_0_14px_rgba(196,162,74,0.22)]">
              <Crown className="h-[18px] w-[18px] fill-gold text-gold" />
            </span>
            <span className="leading-none">
              <span className="block text-[13px] font-extrabold tracking-[0.1em] text-fg sm:text-[15px]">
                PAY4RANK
              </span>
              <span className="hidden text-[8px] tracking-[0.18em] text-gold/70 uppercase sm:block">
                Pay. Climb. Get Seen.
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                hash={item.hash}
                preload="intent"
                aria-current={item.label === active ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-150 ${
                  item.label === active
                    ? "nav-active text-fg"
                    : "text-white/52 hover:bg-white/[0.04] hover:text-white/88"
                }`}
              >
                {item.label}
              </Link>
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
              <Link
                to="/dashboard"
                search={{ tab: "profile" }}
                preload="intent"
                aria-label="Your profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-white/[0.03] shadow-[0_0_12px_rgba(212,180,69,0.2)]"
              >
                <AvatarImg src={image} name={displayName} size={26} ring="gold" />
              </Link>
            )}
            <button
              type="button"
              className="tap flex h-10 w-10 items-center justify-center rounded-full text-white/60"
              onClick={() => setMobile((v) => !v)}
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
        <div className={`menu-layer z-[70] ${sheet.on ? "is-open" : ""}`}>
          <button
            type="button"
            className="menu-scrim"
            aria-label="Close menu"
            onClick={() => setMobile(false)}
          />
          <div className="sheet-surface glass-card absolute inset-x-3 top-[80px] max-h-[min(78dvh,640px)] overflow-y-auto rounded-2xl p-2 lg:inset-x-auto lg:right-6 lg:w-[360px]">
            {hydrated && signedIn && (
              <>
                <Link
                  to="/dashboard"
                  search={{ tab: "profile" }}
                  preload="intent"
                  onClick={() => setMobile(false)}
                  className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.04]"
                >
                  <AvatarImg src={image} name={displayName} size={40} ring="gold" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-fg">{displayName}</span>
                    <span className="block truncate text-[11px] text-white/40">{email || "Signed in"}</span>
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  search={{ tab: "profile" }}
                  preload="intent"
                  onClick={() => setMobile(false)}
                  className={`link-row tap flex min-h-12 items-center gap-2.5 rounded-xl px-4 text-[15px] font-semibold ${
                    active === "Profile" ? "bg-white/[0.05] text-fg" : "text-white/70 hover:bg-white/[0.04] hover:text-fg"
                  }`}
                >
                  <Settings className="h-4 w-4" /> Profile Settings
                </Link>
                <Link
                  to="/dashboard"
                  search={{ tab: "security" }}
                  preload="intent"
                  onClick={() => setMobile(false)}
                  className="link-row tap flex min-h-12 items-center gap-2.5 rounded-xl px-4 text-[15px] font-semibold text-white/70 hover:bg-white/[0.04] hover:text-fg"
                >
                  <Lock className="h-4 w-4" /> Security
                </Link>
                <Link
                  to="/dashboard"
                  search={{ tab: "history" }}
                  preload="intent"
                  onClick={() => setMobile(false)}
                  className="link-row tap flex min-h-12 items-center gap-2.5 rounded-xl px-4 text-[15px] font-semibold text-white/70 hover:bg-white/[0.04] hover:text-fg"
                >
                  <History className="h-4 w-4" /> Contribution History
                </Link>
                <div className="my-1 border-t border-white/[0.06]" />
              </>
            )}
            {LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                hash={item.hash}
                preload="intent"
                onClick={() => setMobile(false)}
                className={`link-row tap flex min-h-12 items-center rounded-xl px-4 text-[15px] font-semibold transition-colors ${
                  item.label === active ? "bg-white/[0.05] text-fg" : "text-white/70 hover:bg-white/[0.04] hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
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
            <Link
              to="/"
              hash="rank-up"
              preload="intent"
              onClick={() => setMobile(false)}
              className="btn-gold tap mt-2 flex min-h-12 items-center justify-center rounded-xl text-sm font-extrabold"
            >
              Promote Now
            </Link>
            {hydrated && signedIn && (
              <button
                type="button"
                onClick={() => {
                  setMobile(false);
                  void signOut().then(() => {
                    window.location.href = "/";
                  });
                }}
                className="link-row tap mt-1 flex min-h-12 w-full items-center gap-2.5 rounded-xl px-4 text-[15px] font-semibold text-danger hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

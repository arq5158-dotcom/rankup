import {
  Crown,
  Flame,
  History,
  KeyRound,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { signOut } from "@/lib/auth/client";
import { AvatarImg, Verified } from "./Avatar";
import { cn } from "@/lib/utils";
import { usePresence } from "./motion";

export function ProfileCard({
  name,
  email,
  image,
  completeness,
  monthlyRank,
  weeklyRank,
  twoFactor,
  isAdmin = false,
  className,
  onNavigate,
}: {
  name: string;
  email: string;
  image?: string | null;
  completeness: number;
  monthlyRank: number | null;
  weeklyRank: number | null;
  twoFactor: boolean;
  isAdmin?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className={cn("glass-card rounded-[22px] p-4 shadow-2xl", className)}>
      <div className="mb-3 flex items-center gap-3 border-b border-white/[0.06] pb-3">
        <AvatarImg src={image} name={name} size={44} />
        <div className="min-w-0">
          <p className="flex items-center truncate text-sm font-bold text-fg">
            {name}
            <Verified />
          </p>
          <p className="truncate text-[11px] text-white/35">{email || "Signed in"}</p>
        </div>
      </div>
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="text-white/40">Profile Completeness</span>
          <span className="font-bold text-gold">{completeness}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a24]">
          <div
            className="bar-fill"
            style={{
              width: `${completeness}%`,
              background: "linear-gradient(90deg, #c9a84c, #e2c97e)",
            }}
          />
        </div>
      </div>
      <div className="space-y-0.5">
        {[
          { icon: Settings, label: "Profile Settings", to: "/dashboard" as const, search: { tab: "profile" as const }, badge: undefined as string | undefined, on: false },
          { icon: KeyRound, label: "Change Password", to: "/dashboard" as const, search: { tab: "security" as const }, badge: undefined as string | undefined, on: false },
          { icon: Shield, label: "Two-Factor Authentication", to: "/dashboard" as const, search: { tab: "security" as const }, badge: twoFactor ? "On" : "Off", on: twoFactor },
          { icon: History, label: "Contribution History", to: "/dashboard" as const, search: { tab: "history" as const }, badge: undefined as string | undefined, on: false },
        ].map((m) =>
          m.to ? (
            <Link
              key={m.label}
              to={m.to}
              search={m.search}
              onClick={onNavigate}
          className="link-row flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-white/50 hover:bg-white/[0.04] hover:text-fg"
            >
              <m.icon className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">{m.label}</span>
              {m.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    m.on ? "bg-success/15 text-success" : "bg-white/10 text-white/40"
                  }`}
                >
                  {m.on ? "Enabled" : m.badge}
                </span>
              )}
            </Link>
          ) : null,
        )}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="link-row flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-gold hover:bg-gold/10"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Admin panel</span>
          </Link>
        )}
      </div>
      <div className="mt-2 space-y-0.5 border-t border-white/[0.06] pt-2">
        <div className="flex items-center justify-between px-2.5 py-1.5 text-[13px]">
          <span className="flex items-center gap-2 text-white/45">
            <Crown className="h-3.5 w-3.5 text-gold" /> Monthly Rank
          </span>
          <span className="font-extrabold text-gold">#{monthlyRank ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 text-[13px]">
          <span className="flex items-center gap-2 text-white/45">
            <Flame className="h-3.5 w-3.5 text-weekly" /> Weekly Rank
          </span>
          <span className="font-extrabold text-weekly">#{weeklyRank ?? "—"}</span>
        </div>
      </div>
      <div className="mt-2 border-t border-white/[0.06] pt-2">
        <Link
          to="/dashboard"
          search={{ tab: "security" }}
          onClick={onNavigate}
          className="link-row flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-white/50 hover:bg-white/[0.04] hover:text-fg"
        >
          <Settings className="h-3.5 w-3.5" /> Security Settings
        </Link>
        <button
          type="button"
          onClick={() => {
            void signOut().then(() => {
              onNavigate?.();
              window.location.href = "/";
            });
          }}
          className="link-row flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-danger hover:bg-danger/10"
        >
          <LogOut className="h-3.5 w-3.5" /> Log Out
        </button>
      </div>
    </div>
  );
}

export function ProfileMenu({
  open,
  onClose,
  name,
  email,
  image,
  completeness,
  monthlyRank,
  weeklyRank,
  twoFactor,
  isAdmin = false,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  image?: string | null;
  completeness: number;
  monthlyRank: number | null;
  weeklyRank: number | null;
  twoFactor: boolean;
  isAdmin?: boolean;
}) {
  const { shown, on } = usePresence(open, 180);
  if (!shown) return null;
  return (
    <div className={cn("menu-layer", on && "is-open")} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <ProfileCard
          name={name}
          email={email}
          image={image}
          completeness={completeness}
          monthlyRank={monthlyRank}
          weeklyRank={weeklyRank}
          twoFactor={twoFactor}
          isAdmin={isAdmin}
          onNavigate={onClose}
          className="menu-surface absolute top-[68px] right-3 left-3 max-h-[min(80dvh,640px)] overflow-y-auto sm:left-auto sm:w-[280px]"
        />
      </div>
    </div>
  );
}

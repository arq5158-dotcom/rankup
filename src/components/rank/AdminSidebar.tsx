import {
  ChevronUp,
  ImageIcon,
  LayoutDashboard,
  Link2,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" as const },
  { icon: Trophy, label: "Edit Prizes", href: "/admin" as const },
  { icon: ImageIcon, label: "Add / Manage Images", href: "/admin" as const },
  { icon: Users, label: "Manage Users", href: "/admin" as const },
  { icon: Link2, label: "Link Moderation", badge: "12", href: "/admin" as const },
  { icon: RefreshCw, label: "Reset Schedules", href: "/admin" as const },
];

function Heartbeat() {
  return (
    <svg viewBox="0 0 72 20" className="h-4 w-12 text-success" aria-hidden>
      <path
        d="M0 12 H14 L18 6 L24 16 L30 4 L36 12 H72"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminSidebar({ pendingLinks = 0, enabled }: { pendingLinks?: number; enabled: boolean }) {
  if (!enabled) return null;
  return (
    <aside className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[10px] font-extrabold tracking-[0.16em] text-white/30 uppercase">Admin Panel</h4>
        <ChevronUp className="h-3 w-3 text-white/20" />
      </div>
      <div className="space-y-0.5">
        {ITEMS.map((i) => (
          <Link
            key={i.label}
            to={i.href}
            className="link-row tap flex w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-white/40 hover:bg-white/[0.03] hover:text-white/75 sm:min-h-0 sm:py-2 sm:text-[11px]"
          >
            <i.icon className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">{i.label}</span>
            {(i.badge || i.label === "Link Moderation") && (
              <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold">
                {i.label === "Link Moderation" ? pendingLinks : i.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-success/15 bg-success/[0.07] px-3 py-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            <span className="text-[10px] font-bold text-success">System Status</span>
          </div>
          <p className="mt-0.5 text-[9px] text-success/60">All Systems Operational</p>
        </div>
        <Heartbeat />
      </div>
    </aside>
  );
}

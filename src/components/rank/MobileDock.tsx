import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crown, Gift, Trophy, UserRound, Zap } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function MobileDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUserState();
  const youTo = user ? ("/dashboard" as const) : ("/login" as const);
  const wrap = useRef<HTMLElement>(null);
  const [pill, setPill] = useState({ x: 0, y: 0, w: 0, h: 0, ready: false });

  const items = [
    { id: "home", to: "/" as const, label: "Home", icon: Crown, match: pathname === "/" },
    { id: "weekly", to: "/weekly" as const, label: "Weekly", icon: Zap, match: pathname.startsWith("/weekly") },
    { id: "prizes", to: "/prizes" as const, label: "Tiers", icon: Gift, match: pathname.startsWith("/prizes") },
    {
      id: "you",
      to: youTo,
      label: user ? "You" : "Sign in",
      icon: UserRound,
      match: pathname.startsWith("/dashboard") || pathname.startsWith("/login"),
    },
  ];
  const activeId = items.find((i) => i.match)?.id ?? null;

  useLayoutEffect(() => {
    const root = wrap.current;
    if (!root || !activeId) {
      setPill((p) => ({ ...p, ready: false }));
      return;
    }
    const el = root.querySelector(`[data-dock="${activeId}"]`) as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    setPill({
      x: r.left - b.left,
      y: r.top - b.top,
      w: r.width,
      h: r.height,
      ready: true,
    });
  }, [activeId, user]);

  useEffect(() => {
    const onResize = () => {
      const root = wrap.current;
      if (!root || !activeId) return;
      const el = root.querySelector(`[data-dock="${activeId}"]`) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      setPill((p) => ({
        ...p,
        x: r.left - b.left,
        y: r.top - b.top,
        w: r.width,
        h: r.height,
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId]);

  return (
    <nav ref={wrap} aria-label="Mobile" className="mobile-dock lg:hidden">
      <span
        aria-hidden
        className={`dock-glass-pill${pill.ready ? " is-ready" : ""}`}
        style={{
          width: pill.w || undefined,
          height: pill.h || undefined,
          transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
        }}
      />
      {items.slice(0, 2).map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            preload="intent"
            data-dock={item.id}
            className={`dock-item tap ${item.match ? "is-on" : ""}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
            <span className="dock-label">{item.label}</span>
          </Link>
        );
      })}
      <Link to="/" hash="rank-up" preload="intent" className="dock-enter tap">
        <span className="dock-enter-orb">
          <Trophy className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <span className="dock-label">Enter</span>
      </Link>
      {items.slice(2).map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            preload="intent"
            data-dock={item.id}
            className={`dock-item tap ${item.match ? "is-on" : ""}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
            <span className="dock-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

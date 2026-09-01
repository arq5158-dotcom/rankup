import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { usePresence } from "./motion";

const KEY = "rankup-cookie-consent";

export function CookieBanner() {
  const [want, setWant] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setWant(true);
    } catch {
      setWant(true);
    }
  }, []);

  const { shown, on } = usePresence(want, 180);
  if (!shown) return null;

  const accept = () => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ essential: true, ts: Date.now() }),
      );
    } catch {
      /* ignore quota */
    }
    setWant(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className={`cookie-bar glass-nav fixed right-3 left-3 z-[80] mx-auto flex max-w-3xl items-center gap-3 rounded-2xl p-3 sm:p-4 ${
        on ? "is-open" : ""
      }`}
    >
      <p className="min-w-0 flex-1 text-[11px] leading-snug text-white/70 sm:text-[12px] sm:leading-relaxed">
        We use essential cookies to keep you signed in and to complete Stripe checkout. No ads. No sale of data.{" "}
        <Link to="/cookies" className="text-gold hover:underline">
          Cookie policy
        </Link>
      </p>
      <button
        type="button"
        onClick={accept}
        className="btn-gold h-11 shrink-0 rounded-full px-5 text-[12px] font-bold sm:h-9"
      >
        Got it
      </button>
    </div>
  );
}

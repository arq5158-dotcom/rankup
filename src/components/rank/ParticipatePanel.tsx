import { useEffect, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { startCheckout } from "@/lib/server/rank";
import type { CycleType } from "@/lib/players";
import { MAX_CONTRIBUTION, NOTE_MAX_CHARS, normalizeHttpUrl, publicErrorMessage } from "@/lib/utils";
import { savePayDraft } from "@/lib/pay-draft";
import { Segmented } from "./motion";

const PRESETS = [10, 25, 50, 100, 250];

export function ParticipatePanel({
  open,
  onClose,
  signedIn,
  defaultName,
  defaultNote,
  defaultLink,
  stripeReady = true,
  isOwner = false,
}: {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  defaultName: string;
  defaultNote?: string;
  defaultLink?: string;
  onSuccess?: () => void;
  stripeReady?: boolean;
  isOwner?: boolean;
}) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(50);
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState(defaultNote ?? "");
  const [link, setLink] = useState(defaultLink ?? "");
  const [cycle, setCycle] = useState<CycleType>("monthly");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setName(defaultName);
    setNote(defaultNote ?? "");
    setLink(defaultLink ?? "");
  }, [defaultName, defaultNote, defaultLink]);

  const submit = async () => {
    if (!signedIn) {
      navigate({ to: "/login", search: { mode: "in" } });
      return;
    }
    if (amount < 1 || amount > MAX_CONTRIBUTION || !name.trim()) return;
    if (!agreed) {
      toast.error("Confirm you are 18 or older and agree to the rules.");
      return;
    }
    const safeLink = link.trim() ? normalizeHttpUrl(link.trim()) : null;
    if (link.trim() && !safeLink) {
      toast.error("That website did not pass safety review. Use a full https:// link — shorteners and adult sites are blocked.");
      return;
    }
    setLoading(true);
    try {
      const res = await startCheckout({
        data: {
          amount,
          displayName: name.trim().slice(0, 24),
          shortNote: note.trim().slice(0, NOTE_MAX_CHARS) || undefined,
          webLink: safeLink || undefined,
          cycleType: cycle,
        },
      });
      savePayDraft({
        mode: res.mode,
        sessionId: res.sessionId,
        clientSecret: res.clientSecret,
        publishableKey: res.publishableKey,
        url: res.url,
        amount: res.amount,
        cycleType: res.cycleType,
        displayName: res.displayName,
        shortNote: res.shortNote,
      });
      void navigate({ to: "/pay" });
    } catch (e) {
      toast.error(publicErrorMessage(e, "Payment failed"));
      setLoading(false);
    }
  };

  if (!open) return null;

  const field =
    "h-11 w-full rounded-[14px] border border-white/[0.12] bg-[#0c0c12] px-3.5 text-sm text-fg outline-none placeholder:text-white/22 focus:border-gold/45";

  return (
    <div>
      <div className="glass-card panel-gold relative w-full rounded-[20px] p-5">
        <button
          type="button"
          onClick={onClose}
          className="tap absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition-colors duration-150 hover:text-white/70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="pr-10 text-[16px] font-bold tracking-tight text-fg">Participate & Rank Up</h3>

        <div className="mt-3.5 space-y-3">
          <Segmented
            value={cycle}
            onChange={setCycle}
            options={[
              { id: "monthly", label: "Monthly" },
              { id: "weekly", label: "Weekly" },
            ]}
          />
          <div className="field">
            <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Enter Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[24px] font-bold text-gold">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount.toFixed(2)}
                suppressHydrationWarning
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                  if (!Number.isNaN(n)) setAmount(Math.min(MAX_CONTRIBUTION, Math.max(0, n)));
                }}
                className="h-[54px] w-full rounded-[14px] border border-white/[0.12] bg-[#0c0c12] py-2.5 pr-3 pl-10 text-[28px] font-bold text-fg tabular-nums outline-none focus:border-gold/45"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={`chip tap rounded-[12px] text-xs font-bold ${amount === p ? "is-on" : ""}`}
              >
                ${p}
              </button>
            ))}
          </div>
          <div className="field">
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Display Name
            </label>
            <input
              value={name}
              maxLength={24}
              suppressHydrationWarning
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder="Your leaderboard name"
              className={field}
            />
          </div>
          <div className="field">
            <label className="mb-1 flex items-center justify-between text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              <span>Short Note (Optional)</span>
              <span className="font-medium tracking-normal text-white/25">
                {note.length}/{NOTE_MAX_CHARS}
              </span>
            </label>
            <input
              value={note}
              maxLength={NOTE_MAX_CHARS}
              suppressHydrationWarning
              onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX_CHARS))}
              placeholder="Here to compete and win!"
              className={field}
            />
          </div>
          <div className="field">
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Website URL (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={link}
                maxLength={300}
                suppressHydrationWarning
                onChange={(e) => setLink(e.target.value.slice(0, 300))}
                placeholder="https://yoursite.com"
                className={`${field} pr-8`}
              />
              {link && <Check className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-success" />}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/30">
              <Lock className="h-2.5 w-2.5 text-white/25" /> Public https links only. Adult, malware, and shortened URLs are blocked.
            </p>
          </div>
          {isOwner && !stripeReady && (
            <p className="rounded-lg border border-gold/20 bg-gold/10 px-3 py-2 text-[11px] text-gold/90">
              Add your Stripe test secret key in Admin → Stripe to enable checkout.
            </p>
          )}
          <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-white/40">
            <input
              type="checkbox"
              checked={agreed}
              suppressHydrationWarning
              onChange={(e) => setAgreed(e.target.checked)}
              className="check mt-0.5 shrink-0"
            />
            <span>
              I confirm I am 18 or older and agree to the{" "}
              <Link to="/terms" className="text-gold hover:underline">
                Terms
              </Link>
              ,{" "}
              <Link to="/rules" className="text-gold hover:underline">
                Official Rules
              </Link>
              , and{" "}
              <Link to="/privacy" className="text-gold hover:underline">
                Privacy Policy
              </Link>
              . This is not a lottery. Contributions are generally non-refundable. Void where prohibited.
            </span>
          </label>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading || amount < 1 || amount > MAX_CONTRIBUTION || !name.trim() || !agreed}
            className="btn-gold relative z-10 tap flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[14px] text-sm font-extrabold"
          >
            <Lock className="h-3.5 w-3.5" />
            {loading ? "Opening checkout…" : signedIn ? "Pay Securely & Rank Up" : "Sign in to Rank Up"}
          </button>
          <p className="flex flex-col items-center justify-center gap-0.5 pt-0.5 text-center text-[10px] text-white/30">
            <span>
              Powered by <span className="font-semibold tracking-wide text-white/55">stripe</span>
            </span>
            <span className="flex items-center gap-1 text-white/28">
              <Lock className="h-2.5 w-2.5" /> Your payment is secure and encrypted.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

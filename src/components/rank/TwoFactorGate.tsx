import { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccount } from "@/lib/server/rank";
import { unlockTwoFactor } from "@/lib/server/two-factor";
import { publicErrorMessage } from "@/lib/utils";
import { usePresence } from "./motion";

export function TwoFactorGate() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [needed, setNeeded] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { shown, on } = usePresence(needed && !isPending, 200);

  useEffect(() => {
    if (!user || pathname === "/login") {
      setNeeded(false);
      return;
    }
    void getMyAccount()
      .then((a) => setNeeded(Boolean(a.profile.username && a.profile.twoFactorEnabled && !a.twoFactorUnlocked)))
      .catch(() => setNeeded(false));
  }, [user, pathname]);

  if (!shown) return null;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await unlockTwoFactor({ data: { code } });
      setNeeded(false);
      setCode("");
    } catch (err) {
      setError(publicErrorMessage(err, "That code did not match."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`modal-layer fixed inset-0 z-[96] grid place-items-center bg-black/70 p-4 ${on ? "is-open" : ""}`}>
      <div className="modal-card glass-card w-full max-w-md rounded-2xl p-6">
        <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-gold uppercase">
          <Shield className="h-3.5 w-3.5" /> Authenticator
        </p>
        <h2 className="mt-1 font-display text-2xl font-black text-fg">Enter your code</h2>
        <p className="mt-2 text-sm text-white/45">
          This Pay4Rank session needs the 6-digit code from your authenticator app (Google Authenticator, Authy,
          1Password).
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="h-14 w-full rounded-xl border border-white/[0.06] bg-[#12121a] text-center font-mono text-2xl tracking-[0.4em] text-fg tabular-nums outline-none focus:border-gold/40"
          />
          {error ? <p className="hint-in text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={saving || code.length !== 6}
            className="btn-gold tap flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

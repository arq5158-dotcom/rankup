import { useState } from "react";
import { Copy, KeyRound, Loader2, Shield, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  beginTwoFactor,
  cancelTwoFactorSetup,
  changeEmailPassword,
  confirmTwoFactor,
  disableTwoFactor,
  type SignInMethod,
} from "@/lib/server/two-factor";
import { publicErrorMessage } from "@/lib/utils";

export function SecurityPanel({
  email,
  methods,
  twoFactorEnabled,
  onRefresh,
}: {
  email: string;
  methods: SignInMethod[];
  twoFactorEnabled: boolean;
  onRefresh: () => Promise<void>;
}) {
  const hasEmail = methods.includes("email");
  const hasGoogle = methods.includes("google");
  const hasX = methods.includes("x");
  const [setup, setSetup] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentPassword, setCurrent] = useState("");
  const [nextPassword, setNext] = useState("");
  const [confirmPassword, setConfirm] = useState("");

  const startSetup = async () => {
    setBusy(true);
    try {
      const res = await beginTwoFactor();
      setSetup({ secret: res.secret, qrDataUrl: res.qrDataUrl });
      setCode("");
    } catch (err) {
      toast.error(publicErrorMessage(err, "Could not start authenticator setup."));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await confirmTwoFactor({ data: { code } });
      toast.success("Authenticator is on.");
      setSetup(null);
      setCode("");
      await onRefresh();
    } catch (err) {
      toast.error(publicErrorMessage(err, "That code did not match."));
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      await disableTwoFactor({ data: { code } });
      toast.success("Authenticator is off.");
      setCode("");
      await onRefresh();
    } catch (err) {
      toast.error(publicErrorMessage(err, "Could not turn off authenticator."));
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    if (nextPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await changeEmailPassword({ data: { currentPassword, newPassword: nextPassword } });
      toast.success("Password updated. Other sessions were signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(publicErrorMessage(err, "Could not update password."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="glass-card rounded-2xl p-6">
        <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">How you sign in</p>
        <h2 className="mt-1 font-display text-xl font-black text-fg">Account login</h2>
        <div className="mt-4 space-y-2">
          {hasGoogle ? (
            <MethodRow
              title="Google"
              body="Rank Up never sees a Google password. 2-step verification is in your Google account — turn it on at Google if it is not already."
            />
          ) : null}
          {hasX ? (
            <MethodRow
              title="X"
              body="Rank Up never sees an X password. Extra login protection lives in your X account, not here."
            />
          ) : null}
          {hasEmail ? (
            <MethodRow
              title="Email and password"
              body={`${email || "Your email"} + a Rank Up password. Add an authenticator below so a stolen password is not enough.`}
            />
          ) : null}
          {!hasGoogle && !hasX && !hasEmail ? (
            <p className="text-sm text-white/45">Signed in. Sign-in method will show after the next refresh.</p>
          ) : null}
        </div>
      </section>

      <section className="glass-card rounded-2xl p-6">
        <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Rank Up authenticator</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-black text-fg">Two-factor on this account</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              twoFactorEnabled ? "bg-success/15 text-success" : "bg-white/10 text-white/45"
            }`}
          >
            {twoFactorEnabled ? "On" : "Off"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/45">
          This is separate from Google or X. When it is on, Rank Up asks for a 6-digit app code on new sessions
          and before checkout. Use Google Authenticator, Authy, or 1Password.
        </p>

        {!twoFactorEnabled && !setup ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void startSetup()}
            className="btn-gold mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            Add authenticator
          </button>
        ) : null}

        {setup ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12121a] p-4 sm:flex-row sm:items-start">
              <img
                src={setup.qrDataUrl}
                alt="QR code for authenticator app"
                width={180}
                height={180}
                className="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">Scan with your app</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/40">
                  Or enter this key manually. Do not screenshot it into chat.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-gold"
                  onClick={() => {
                    void navigator.clipboard.writeText(setup.secret).then(
                      () => toast.success("Key copied"),
                      () => toast.error("Could not copy"),
                    );
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> {setup.secret}
                </button>
              </div>
            </div>
            <label className="field block">
              <span className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                Code from the app
              </span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 text-center font-mono text-lg tracking-[0.3em] text-fg tabular-nums outline-none focus:border-gold/40"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || code.length !== 6}
                onClick={() => void confirm()}
                className="btn-gold inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Confirm and turn on
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setSetup(null);
                  setCode("");
                  void cancelTwoFactorSetup();
                }}
                className="btn-outline min-h-12 rounded-xl px-4 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {twoFactorEnabled ? (
          <div className="mt-5 space-y-3">
            <p className="text-[12px] text-white/40">Enter a current code to turn this off.</p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 text-center font-mono text-lg tracking-[0.3em] text-fg tabular-nums outline-none focus:border-gold/40"
            />
            <button
              type="button"
              disabled={busy || code.length !== 6}
              onClick={() => void turnOff()}
              className="btn-outline min-h-12 rounded-xl px-4 text-sm text-danger"
            >
              Turn off authenticator
            </button>
          </div>
        ) : null}
      </section>

      <section className="glass-card rounded-2xl p-6">
        <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Password</p>
        <h2 className="mt-1 font-display text-xl font-black text-fg">Change password</h2>
        {hasEmail ? (
          <div className="mt-4 space-y-3">
            {[
              { label: "Current password", value: currentPassword, set: setCurrent, auto: "current-password" },
              { label: "New password", value: nextPassword, set: setNext, auto: "new-password" },
              { label: "Confirm new password", value: confirmPassword, set: setConfirm, auto: "new-password" },
            ].map((f) => (
              <label key={f.label} className="field block">
                <span className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  {f.label}
                </span>
                <input
                  type="password"
                  autoComplete={f.auto}
                  value={f.value}
                  minLength={8}
                  maxLength={128}
                  onChange={(e) => f.set(e.target.value.slice(0, 128))}
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 text-sm text-fg outline-none focus:border-gold/40"
                />
              </label>
            ))}
            <button
              type="button"
              disabled={busy || currentPassword.length < 8 || nextPassword.length < 8}
              onClick={() => void savePassword()}
              className="btn-gold inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Update password
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-white/45">
            {hasGoogle || hasX
              ? "This account has no Rank Up password. Sign-in is Google or X — change that password with them."
              : "No Rank Up password on this account."}
          </p>
        )}
      </section>
    </div>
  );
}

function MethodRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#12121a] px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-bold text-fg">
        <Shield className="h-3.5 w-3.5 text-gold" /> {title}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-white/40">{body}</p>
    </div>
  );
}

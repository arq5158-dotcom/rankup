import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AtSign, Loader2 } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { checkUsername, getMyAccount, setUsername } from "@/lib/server/rank";
import { validateUsername } from "@/lib/username";
import { usePresence } from "./motion";

export function UsernameGate() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [needed, setNeeded] = useState(false);
  const [value, setValue] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const { shown, on } = usePresence(needed && !isPending, 200);

  useEffect(() => {
    if (!user || pathname === "/login" || pathname.startsWith("/pay")) {
      setNeeded(false);
      return;
    }
    void getMyAccount()
      .then((a) => setNeeded(!a.profile.username))
      .catch(() => setNeeded(false));
  }, [user?.id, pathname]);

  useEffect(() => {
    const parsed = validateUsername(value);
    if (!value.trim()) {
      setHint(null);
      setOk(false);
      return;
    }
    if (!parsed.ok) {
      setHint(parsed.error);
      setOk(false);
      return;
    }
    const handle = parsed.username;
    const t = window.setTimeout(() => {
      void checkUsername({ data: { username: handle } }).then((r) => {
        setHint(r.error);
        setOk(r.available);
      });
    }, 350);
    return () => window.clearTimeout(t);
  }, [value]);

  if (!shown) return null;

  return (
    <div className={`modal-layer fixed inset-0 z-[95] grid place-items-center bg-black/70 p-4 ${on ? "is-open" : ""}`}>
      <div className="modal-card glass-card w-full max-w-md rounded-2xl p-6">
        <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Required</p>
        <h2 className="mt-1 font-display text-2xl font-black text-fg">Choose a username</h2>
        <p className="mt-2 text-sm text-white/45">
          Unique handle shown under your name on the leaderboard. Letters, numbers, underscores. 3–20
          characters. No duplicates. No staff impersonation.
        </p>
        <div className="field relative mt-5">
          <AtSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            autoFocus
            value={value}
            maxLength={20}
            onChange={(e) => setValue(e.target.value.slice(0, 20))}
            placeholder="yourhandle"
            className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] pr-3 pl-9 text-sm text-fg outline-none focus:border-gold/40"
          />
        </div>
        {value.trim() ? (
          <p className={`hint-in mt-2 text-xs ${ok ? "text-success" : "text-danger"}`}>
            {ok ? "Available" : hint}
          </p>
        ) : null}
        <button
          type="button"
          disabled={!ok || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await setUsername({ data: { username: value } });
              setNeeded(false);
            } catch (err) {
              setHint(err instanceof Error ? err.message : "Could not save");
              setOk(false);
            } finally {
              setSaving(false);
            }
          }}
          className="btn-gold tap mt-4 flex w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save username
        </button>
      </div>
    </div>
  );
}

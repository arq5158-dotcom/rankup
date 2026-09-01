import { useEffect, useState } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { ArrowRight, AtSign, Crown, Lock, Mail } from "lucide-react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { seoHead } from "@/lib/seo";
import { checkUsername, setUsername } from "@/lib/server/rank";
import { validateDisplayName, validateUsername } from "@/lib/username";
import { FadeSwitch, Segmented } from "@/components/rank/motion";
import { publicErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "up" ? ("up" as const) : s.mode === "in" ? ("in" as const) : undefined,
  }),
  head: () =>
    seoHead({
      title: "Sign in",
      description: "Sign in to Pay4Rank to buy ranking credits and climb the live promotional leaderboard.",
      path: "/login",
      noindex: true,
    }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { mode: modeParam } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">(modeParam ?? "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setHandle] = useState("");
  const [userHint, setUserHint] = useState<string | null>(null);
  const [userOk, setUserOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ageOk, setAgeOk] = useState(false);

  useEffect(() => {
    if (modeParam === "up" || modeParam === "in") setMode(modeParam);
  }, [modeParam]);

  useEffect(() => {
    if (mode !== "up") return;
    const parsed = validateUsername(username);
    if (!username.trim()) {
      setUserHint(null);
      setUserOk(false);
      return;
    }
    if (!parsed.ok) {
      setUserHint(parsed.error);
      setUserOk(false);
      return;
    }
    const handle = parsed.username;
    const t = window.setTimeout(() => {
      void checkUsername({ data: { username: handle } }).then((r) => {
        setUserHint(r.error);
        setUserOk(r.available);
      });
    }, 350);
    return () => window.clearTimeout(t);
  }, [username, mode]);

  if (!isPending && user) {
    return <Navigate to="/" />;
  }

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "up") {
        if (!ageOk) throw new Error("Confirm you are 18 or older to create an account.");
        const named = validateDisplayName(name);
        if (!named.ok) throw new Error(named.error);
        const handle = validateUsername(username);
        if (!handle.ok) throw new Error(handle.error);
        const taken = await checkUsername({ data: { username: handle.username } });
        if (!taken.available) throw new Error(taken.error || "That username is taken.");
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: named.name,
        });
        if (err) throw new Error(err.message);
        try {
          await setUsername({ data: { username: handle.username } });
        } catch {
          /* UsernameGate on the next page collects it if the session isn't ready yet. */
        }
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(publicErrorMessage(err, "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <header className="relative z-10 border-b border-white/[0.04]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <span className="text-lg font-black text-fg">
              PAY<span className="text-gold">4RANK</span>
            </span>
          </Link>
          <Link to="/" className="tap inline-flex min-h-11 items-center text-sm font-semibold text-white/50 hover:text-fg">
            Back to Rankings
          </Link>
        </div>
      </header>
      <main id="main" className="relative z-10 flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="glass-card card-3d w-full max-w-md rounded-2xl p-6 fade-switch">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
              <Crown className="h-6 w-6 text-gold" />
            </div>
            <h1 className="font-display text-xl font-black text-fg">
              {mode === "in" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-white/40">Pay. Climb. Get Seen. — sign in to climb.</p>
          </div>

          {authEnabled ? (
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    void signIn(p.providerId, { callbackURL: "/", errorCallbackURL: "/login" }).catch((err) => {
                      setError(publicErrorMessage(err, "Sign-in failed. Try email or try again."));
                      setLoading(false);
                    });
                  }}
                  className="btn-outline tap w-full rounded-xl px-4 text-sm font-semibold"
                >
                  Continue with {p.label}
                </button>
              ))}
              <p className="pt-1 text-center text-[10px] leading-relaxed text-white/35">
                By continuing you confirm you are 18 or older and agree to the{" "}
                <Link to="/terms" className="text-gold">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/rules" className="text-gold">
                  Platform Rules
                </Link>
                . Ranking credits buy visibility, not a prize. 18+ only.
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-white/40">Sign-in is disabled.</p>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] tracking-wider text-white/35 uppercase">
              <span className="bg-surface/80 px-2">or email</span>
            </div>
          </div>

          <Segmented
            value={mode}
            onChange={setMode}
            className="mb-3"
            options={[
              { id: "in", label: "Sign in" },
              { id: "up", label: "Sign up" },
            ]}
          />

          <FadeSwitch id={mode}>
          <form onSubmit={(e) => void onEmail(e)} className="space-y-3">
            {mode === "up" && (
              <>
                <div className="field">
                <input
                  value={name}
                  required
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name (shown large)"
                  className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 text-sm text-fg outline-none focus:border-gold/40"
                />
                </div>
                <div className="field">
                  <div className="relative">
                    <AtSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      value={username}
                      required
                      maxLength={20}
                      autoComplete="username"
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="username"
                      className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] pr-3 pl-9 text-sm text-fg outline-none focus:border-gold/40"
                    />
                  </div>
                  {username.trim() ? (
                    <p className={`hint-in mt-1.5 text-[11px] ${userOk ? "text-success" : "text-danger"}`}>
                      {userOk ? `@${username.toLowerCase().replace(/^@/, "")} is available` : userHint}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-white/30">
                      Unique. 3–20 characters. Letters, numbers, underscore. Shown under your name.
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="field relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] pr-3 pl-9 text-sm text-fg outline-none focus:border-gold/40"
              />
            </div>
            <div className="field relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (8+ characters)"
                className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] pr-3 pl-9 text-sm text-fg outline-none focus:border-gold/40"
              />
            </div>
            {error && <p className="hint-in text-sm text-danger">{error}</p>}
            {mode === "up" && (
              <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-white/45">
                <input
                  type="checkbox"
                  checked={ageOk}
                  onChange={(e) => setAgeOk(e.target.checked)}
                  className="check mt-0.5 shrink-0"
                />
                <span>
                  I confirm I am 18 or older and agree to the{" "}
                  <Link to="/terms" className="text-gold">
                    Terms
                  </Link>
                  ,{" "}
                  <Link to="/rules" className="text-gold">
                    Platform Rules
                  </Link>
                  , and{" "}
                  <Link to="/privacy" className="text-gold">
                    Privacy Policy
                  </Link>
                  . Ranking credits buy visibility, not a prize. 18+ only.
                </span>
              </label>
            )}
            <button
              type="submit"
              disabled={loading || (mode === "up" && (!userOk || !name.trim() || !ageOk))}
              className="btn-gold relative z-10 tap flex w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
            >
              {loading ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          </FadeSwitch>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Crown, Save } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { updateMyProfile } from "@/lib/server/rank";
import { loadAccount, setAccountCache, type MyAccount } from "@/lib/account-cache";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { SecurityPanel } from "@/components/rank/SecurityPanel";
import { PhotoCropper } from "@/components/rank/PhotoCropper";
import { AvatarImg } from "@/components/rank/Avatar";
import { RoutePending } from "@/components/rank/RoutePending";
import { toast } from "sonner";
import { formatScore, formatUsd, NOTE_MAX_CHARS, publicErrorMessage } from "@/lib/utils";
import { seoHead } from "@/lib/seo";
import { FadeSwitch, Segmented } from "@/components/rank/motion";
import { USERNAME_MAX } from "@/lib/username";

type DashTab = "profile" | "security" | "history";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: s.tab === "security" || s.tab === "history" || s.tab === "profile" ? (s.tab as DashTab) : undefined,
  }),
  head: () =>
    seoHead({
      title: "Dashboard",
      description: "Manage your Pay4Rank profile, security, and ranking-credit history.",
      path: "/dashboard",
      noindex: true,
    }),
  loader: async () => {
    try {
      return { account: await loadAccount() };
    } catch {
      return { account: null as MyAccount | null };
    }
  },
  staleTime: 15_000,
  pendingComponent: RoutePending,
  component: Dashboard,
});

function Dashboard() {
  const { account: loaded } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const { tab: tabParam } = Route.useSearch();
  const [tab, setTab] = useState<DashTab>(tabParam ?? "profile");
  const [account, setAccount] = useState<MyAccount | null>(loaded);
  const [name, setName] = useState(loaded?.profile.displayName ?? "");
  const [handle, setHandle] = useState(loaded?.profile.username ?? "");
  const [note, setNote] = useState(loaded?.profile.shortNote ?? "");
  const [link, setLink] = useState(loaded?.profile.webLink ?? "");
  const [image, setImage] = useState(loaded?.profile.profileImage ?? "");
  const [saving, setSaving] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tabParam) setTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (!loaded) return;
    setAccount(loaded);
    setName(loaded.profile.displayName ?? "");
    setHandle(loaded.profile.username ?? "");
    setNote(loaded.profile.shortNote ?? "");
    setLink(loaded.profile.webLink ?? "");
    setImage(loaded.profile.profileImage ?? "");
  }, [loaded]);

  const load = async () => {
    const a = await loadAccount(true);
    setAccountCache(a);
    setAccount(a);
    setName(a.profile.displayName ?? "");
    setHandle(a.profile.username ?? "");
    setNote(a.profile.shortNote ?? "");
    setLink(a.profile.webLink ?? "");
    setImage(a.profile.profileImage ?? "");
  };

  if (isPending && !loaded) return <RoutePending />;
  if (!user && !loaded) return <RedirectToSignIn />;
  if (!account) return <RoutePending />;

  const save = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        data: {
          displayName: name,
          username: handle,
          shortNote: note,
          webLink: link,
          profileImage: image,
        },
      });
      toast.success("Profile saved");
      await load();
    } catch (e) {
      toast.error(publicErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const display = name || account.profile.displayName || user?.displayName || "Competitor";
  const email = account.profile.email || user?.primaryEmail || "";

  return (
    <div className="relative min-h-screen">
      <Navbar
        active="Profile"
        account={{
          name: display,
          email,
          image,
          completeness: account.completeness,
          monthlyRank: account.monthlyRank,
          weeklyRank: account.weeklyRank,
          twoFactor: account.profile.twoFactorEnabled,
          isAdmin: account.profile.isAdmin,
          isOwner: account.profile.isOwner,
        }}
      />
      <main className="page-enter relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <h1 className="font-display text-2xl font-black text-fg">Welcome{display ? `, ${display}` : ""}</h1>
        <p className="mt-1 text-sm text-white/40">Manage your profile, security, and contribution history.</p>

        <div className="mt-6 mb-6 grid gap-3 sm:grid-cols-3">
          <div className="glass-card rounded-2xl border border-gold/15 p-4">
            <p className="text-[10px] tracking-wider text-white/40 uppercase">Credits wallet</p>
            <p className="mt-1 font-display text-2xl font-black text-gold-grad tabular-nums">{formatScore(account.credits)}</p>
            <Link to="/" hash="buy" className="btn-gold tap mt-3 inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-extrabold">
              BUY CREDITS
            </Link>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-[10px] tracking-wider text-white/40 uppercase">Monthly score</p>
            <p className="mt-1 text-2xl font-black text-fg tabular-nums">{formatScore(account.monthlyPaid)}</p>
            <p className="mt-1 text-sm text-white/45">Rank #{account.monthlyRank ?? "—"}</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-[10px] tracking-wider text-white/40 uppercase">Weekly score</p>
            <p className="mt-1 text-2xl font-black text-fg tabular-nums">{formatScore(account.weeklyPaid ?? 0)}</p>
            <p className="mt-1 text-sm text-white/45">Rank #{account.weeklyRank ?? "—"}</p>
            <Link to="/spin" className="btn-outline tap mt-3 inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-bold">
              FREE SPIN
            </Link>
          </div>
        </div>

        <Segmented
          value={tab}
          onChange={setTab}
          className="mb-6"
          options={[
            { id: "profile", label: "Profile" },
            { id: "security", label: "Security" },
            { id: "history", label: "History" },
          ]}
        />

        <FadeSwitch id={tab}>
          {tab === "profile" && (
            <div className="glass-card space-y-4 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="tap relative shrink-0"
                  aria-label="Change profile photo"
                >
                  <AvatarImg src={image} name={display} size={84} ring="gold" />
                  <span className="absolute right-0 bottom-0 grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-[#12121a] text-gold">
                    <Camera className="h-3.5 w-3.5" />
                  </span>
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Profile photo</p>
                  <p className="mt-1 text-sm text-white/50">Upload a photo, then drag and zoom to frame it before saving.</p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn-outline tap mt-2 min-h-11 rounded-xl px-3 text-xs font-bold"
                  >
                    Choose photo
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    if (f.size > 8 * 1024 * 1024) {
                      toast.error("Use a photo under 8 MB.");
                      return;
                    }
                    setCropFile(f);
                  }}
                />
              </div>
              {[
                { label: "Display name", value: name, set: setName, hint: "Shown large on the board", max: 24 },
                {
                  label: "Username",
                  value: handle,
                  set: setHandle,
                  hint: "Unique @handle. Letters, numbers, underscore.",
                  max: USERNAME_MAX,
                },
                { label: "Short note", value: note, set: setNote, max: NOTE_MAX_CHARS },
                { label: "Website", value: link, set: setLink, max: 300, hint: "Public https:// link. Adult, malware, and shortened URLs are blocked." },
              ].map((f) => (
                <div key={f.label} className="field">
                  <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                    {f.label}
                  </label>
                  <input
                    value={f.value}
                    maxLength={f.max}
                    onChange={(e) => f.set(e.target.value.slice(0, f.max))}
                    className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 text-sm text-fg outline-none focus:border-gold/40 sm:h-auto sm:py-2.5"
                  />
                  {"hint" in f && f.hint ? <p className="mt-1 text-[11px] text-white/30">{f.hint}</p> : null}
                </div>
              ))}
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="btn-gold inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          )}

          {tab === "security" && (
            <SecurityPanel
              email={email}
              methods={account.signInMethods ?? []}
              twoFactorEnabled={account.profile.twoFactorEnabled ?? false}
              onRefresh={load}
            />
          )}

          {tab === "history" && (
            <div className="glass-card rounded-2xl p-5 sm:p-6">
              {account.payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/40">No payments yet. Enter a season from the home page.</p>
              ) : (
                <div className="space-y-3">
                  {account.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-[#12121a] p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-fg">
                          ${formatUsd(p.amount)} — {p.cycleType}
                        </p>
                        <p className="text-xs text-white/35">{p.createdAt}</p>
                      </div>
                      <span className="rounded-lg bg-success/20 px-2 py-1 text-xs font-bold text-success">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </FadeSwitch>

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-outline rounded-xl px-4 py-2 text-sm">
            ← Leaderboard
          </Link>
          {account.profile.isAdmin && (
            <Link to="/admin" className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-gold">
              Admin
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
      {cropFile ? (
        <PhotoCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={(dataUrl) => {
            setImage(dataUrl);
            setCropFile(null);
            toast.success("Photo framed. Save profile to keep it.");
          }}
        />
      ) : null}
    </div>
  );
}

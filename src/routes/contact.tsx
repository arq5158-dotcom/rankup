import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageShell } from "@/components/rank/PageShell";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact",
      description:
        "Contact Rank Up support about rankings, payments, prizes, privacy, or your account.",
      path: "/contact",
    }),
  component: Page,
});

function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Rank Up] ${topic} — ${name || "Player"}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:support@rankup.app?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell>
      <main className="relative z-10 mx-auto max-w-xl px-4 py-12 sm:px-6">
        <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Support</p>
        <h1 className="mt-2 font-display text-3xl font-black text-gold-grad">Contact</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          For ranking, payment, prize, or privacy questions. Include your display name and the Stripe
          receipt email if the issue is a contribution.
        </p>

        <form onSubmit={submit} className="glass-card mt-8 space-y-4 rounded-2xl p-6">
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            >
              {["General", "Payment", "Ranking", "Prize claim", "Privacy", "Account"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            />
          </div>
          <button
            type="submit"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold"
          >
            <Mail className="h-4 w-4" /> Open email
          </button>
          <p className="text-center text-[11px] text-white/30">
            Opens your mail app to support@rankup.app
          </p>
        </form>

        <p className="mt-6 text-center text-[12px] text-white/35">
          See also{" "}
          <Link to="/how-it-works" className="text-gold">
            How it works
          </Link>
          ,{" "}
          <Link to="/rules" className="text-gold">
            Official rules
          </Link>
          , and{" "}
          <Link to="/privacy" className="text-gold">
            Privacy
          </Link>
          .
        </p>
      </main>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/rank/LegalDoc";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      title: "Privacy Policy",
      description:
        "How Rank Up collects, uses, and protects account, payment, and leaderboard data. Stripe processes cards. We do not sell personal information.",
      path: "/privacy",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc title="Privacy Policy" updated="September 1, 2026">
      <p>
        This policy explains how Rank Up (“we”, “us”) handles information when you use the Rank Up
        website and services. It is written for players, not lawyers — but it is the policy that governs
        the service.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data.</strong> Display name, email address, password hash or sign-in provider
          identifiers, optional profile image, short note, and website link.
        </li>
        <li>
          <strong>Competition data.</strong> Contribution amounts, cycle (weekly or monthly), rank, and
          payment status for leaderboard entries.
        </li>
        <li>
          <strong>Payment data.</strong> Checkout is handled by Stripe. We receive confirmation, amount,
          currency, and Stripe session or payment identifiers. We never store full card numbers, CVC, or
          bank details.
        </li>
        <li>
          <strong>Technical data.</strong> Essential cookies for session and consent, browser type, and
          basic request logs needed to keep the service secure.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use the information above to:</p>
      <ul>
        <li>Create and secure your account</li>
        <li>Record contributions and compute live rankings</li>
        <li>Pay out prizes and contact winners</li>
        <li>Prevent fraud, abuse, and prohibited links</li>
        <li>Meet legal, tax, and accounting duties</li>
      </ul>
      <p>We do not sell personal information and we do not run advertising networks on Rank Up.</p>

      <h2>3. Processors</h2>
      <p>
        Stripe processes payments on our behalf. Authentication providers (when you sign in with a
        connected account) receive the identifiers needed to complete login. Those processors apply
        their own privacy terms to the data they handle.
      </p>

      <h2>4. Sharing</h2>
      <p>
        Leaderboard display names, notes, ranks, contribution totals, and optional website links are
        public by design — that is the product. Website links are filtered for safety but remain
        third-party pages. We share other personal data only with processors listed above, if required
        by law, or to protect the service and other players. We do not sell or share personal
        information for cross-context behavioral advertising.
      </p>

      <h2>5. Retention</h2>
      <p>
        Account and ranking records are kept while your account is active and for a reasonable period
        afterward so we can resolve disputes, prevent fraud, and keep historical seasons. You may ask
        us to delete or correct account data via the{" "}
        <Link to="/contact">contact page</Link>, subject to records we must retain.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, or export personal
        data, and to object to or restrict certain processing (including GDPR and CCPA/CPRA rights such
        as know, delete, and opt-out of sale/share — we do not sell). Send requests through{" "}
        <Link to="/contact">Contact</Link>. We will not discriminate against you for exercising these
        rights. We may need to verify your identity before fulfilling a request.
      </p>

      <h2>7. Children</h2>
      <p>
        Rank Up is for adults. We do not knowingly collect information from anyone under 18. If we
        learn that we have, we will delete the account.
      </p>

      <h2>8. Security</h2>
      <p>
        We use encrypted transport (HTTPS), hashed credentials, and Stripe-hosted checkout. No method
        of transmission is perfectly secure; you are responsible for keeping your password private.
      </p>

      <h2>9. International</h2>
      <p>
        If you access Rank Up from outside the country where our infrastructure runs, your information
        may be processed in other jurisdictions that may have different data-protection rules.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this policy. The “Last updated” date will change, and continued use after an
        update means you accept the revised policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        Privacy questions: <Link to="/contact">Contact Rank Up</Link>. Related documents:{" "}
        <Link to="/terms">Terms</Link>, <Link to="/cookies">Cookies</Link>,{" "}
        <Link to="/rules">Official rules</Link>.
      </p>
    </LegalDoc>
  );
}

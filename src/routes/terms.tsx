import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/rank/LegalDoc";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: "Terms of Service",
      description:
        "Terms for using Rank Up: accounts, Stripe contributions, live rankings, prizes, eligibility, and acceptable use.",
      path: "/terms",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc title="Terms of Service" updated="September 1, 2026">
      <p>
        These Terms of Service (“Terms”) are an agreement between you and Rank Up for use of the
        website, accounts, leaderboards, and prize cycles. By creating an account or contributing, you
        agree to these Terms, the <Link to="/rules">Official Rules</Link>, the{" "}
        <Link to="/privacy">Privacy Policy</Link>, and the <Link to="/cookies">Cookie Policy</Link>.
      </p>

      <h2>1. The service</h2>
      <p>
        Rank Up is a ranked contribution contest. Players pay a chosen amount through Stripe to enter
        a weekly or monthly cycle. Live rank is determined by confirmed contribution totals, not by
        chance. Prizes are awarded to top finishers as published on the Prizes page for that cycle.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally able to enter a binding contract and a payment
        agreement. Rank Up is void where prohibited. We may refuse, suspend, or close accounts that
        fail eligibility or these Terms.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for your login credentials and for activity on your account. Display names,
        notes, and profile images must not impersonate others, infringe rights, or include unlawful or
        abusive content. Website links are reviewed and may be removed.
      </p>

      <h2>4. Contributions and payments</h2>
      <ul>
        <li>All entry payments are processed by Stripe Checkout.</li>
        <li>Your rank updates only after Stripe confirms a successful payment.</li>
        <li>Cancelled or failed checkouts do not charge you and do not rank you.</li>
        <li>
          Completed contributions are generally <strong>non-refundable</strong>, except where Stripe or
          the law requires otherwise.
        </li>
        <li>You authorize Stripe to charge the selected amount plus any stated processing costs.</li>
      </ul>

      <h2>5. Rankings</h2>
      <p>
        Rank is ordered by confirmed contribution total in the active cycle. Ties are broken by the
        earlier confirmed payment. We may correct rankings if a payment is reversed, flagged as fraud,
        or recorded in error.
      </p>

      <h2>6. Prizes</h2>
      <p>
        Prize amounts and places are shown on the site and may be updated by administrators before a
        cycle closes. Winners may be asked to provide information reasonably needed to pay the prize
        and to meet tax rules. Unclaimed prizes after a reasonable period may be forfeited. You are
        responsible for any taxes on prizes you receive.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You may not:</p>
      <ul>
        <li>Use stolen payment methods or attempt to reverse legitimate charges in bad faith</li>
        <li>Manipulate rankings with fraudulent, automated, or collusive payments</li>
        <li>Harass other players or post illegal, hateful, or pornographic profile content</li>
        <li>Probe, scrape, or disrupt the service beyond ordinary use</li>
        <li>Misrepresent Rank Up as a lottery, casino, or game of chance</li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        Rank Up branding, design, and software are owned by us or our licensors. You keep rights to
        content you submit, and you grant us a license to display it on the leaderboard and in related
        promotional materials for the service.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        The service is provided “as is.” We do not warrant uninterrupted uptime, that rankings will be
        free of delay, or that prize amounts will meet any particular expectation beyond what is
        published for a cycle. To the fullest extent allowed by law, we disclaim implied warranties of
        merchantability, fitness, and non-infringement.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent allowed by law, Rank Up is not liable for indirect, incidental, special,
        consequential, or punitive damages, or for lost profits. Our total liability for any claim
        relating to the service is limited to the amount you contributed in the 90 days before the
        claim, or one hundred US dollars, whichever is greater.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You will defend and indemnify Rank Up against claims arising from your content, your
        contributions, or your breach of these Terms.
      </p>

      <h2>12. Changes and termination</h2>
      <p>
        We may change the Terms or the service. Material changes will be reflected by the “Last
        updated” date. We may suspend or terminate access for violations, fraud risk, or if we shut
        down a cycle or the service.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms: <Link to="/contact">Contact</Link>.
      </p>
    </LegalDoc>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/rank/LegalDoc";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/rules")({
  head: () =>
    seoHead({
      title: "Official Contest Rules",
      description:
        "Official rules for Rank Up weekly and monthly prize cycles: eligibility, how winners are chosen, prizes, and disqualification.",
      path: "/rules",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc title="Official Contest Rules" updated="September 1, 2026">
      <p>
        These Official Rules govern every Rank Up weekly and monthly prize cycle. They work together
        with the <Link to="/terms">Terms of Service</Link>. If they conflict, the Rules control prize
        determination for that cycle.
      </p>

      <h2>1. Sponsor</h2>
      <p>
        The contest is sponsored by Rank Up. Prize pools and places are published on the{" "}
        <Link to="/prizes">Prizes</Link> page and may be adjusted by an administrator before a cycle
        closes.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        Open to individuals who are 18 or older, have a Rank Up account in good standing, and can
        legally complete a Stripe payment. Employees who administer the contest may be barred from
        winning. Void where prohibited.
      </p>

      <h2>3. How to enter</h2>
      <p>
        Sign in, choose the weekly or monthly cycle, select a contribution amount, agree to these
        Rules, and complete Stripe Checkout. There is no alternate free method of entry. Amount and
        timing of confirmed payments determine rank. An incomplete checkout is not an entry.
      </p>

      <h2>4. Cycles</h2>
      <ul>
        <li>
          <strong>Monthly.</strong> Runs from the first moment of the calendar month through the last
          moment of that month in the service clock. Top three confirmed totals win the published 1st,
          2nd, and 3rd prizes.
        </li>
        <li>
          <strong>Weekly.</strong> Runs until the published Sunday reset. First place only wins the
          published weekly prize.
        </li>
      </ul>

      <h2>5. Determining winners</h2>
      <p>
        Winners are the players with the highest confirmed contribution totals in that cycle. Rank is
        not drawn at random and does not use odds. Ties are broken by the earlier confirmed Stripe
        payment. Reversed, charged-back, or fraudulent payments are removed and ranks are recomputed.
      </p>

      <h2>6. Prizes</h2>
      <p>
        Prizes are cash amounts (or the cash equivalent) listed on the Prizes page at cycle close,
        plus any stated badge. No substitution except at our discretion if a prize cannot be fulfilled
        as described. Winners may need to complete a reasonable claim process. Unclaimed prizes may be
        forfeited. Winners are responsible for taxes.
      </p>

      <h2>7. Publicity</h2>
      <p>
        Display names, notes, ranks, and contribution totals are public on the leaderboard. By
        entering, you grant Rank Up permission to show that information and to refer to your display
        name in connection with the cycle.
      </p>

      <h2>8. Disqualification</h2>
      <p>
        We may disqualify entries that use stolen cards, bots, collusion, multiple accounts to evade
        limits, or any other manipulation. Disqualified contributions do not rank and are not
        refunded except where the law requires.
      </p>

      <h2>9. Release</h2>
      <p>
        By entering, you release Rank Up and its operators from claims arising out of participation or
        prize fulfillment, to the fullest extent allowed by law.
      </p>

      <h2>10. Not a lottery or game of chance</h2>
      <p>
        Rank Up is a paid ranking contest. Winners are determined solely by confirmed contribution totals
        during a cycle. There is no random draw, no odds, no spinning wheel, and no element of chance in
        placement. Rank Up is not a lottery, raffle, sweepstakes, casino, or sportsbook. If the law in
        your location treats paid contests as prohibited gambling, you may not enter — Rank Up is void
        where prohibited.
      </p>

      <h2>11. Public website links</h2>
      <p>
        Players may optionally publish an https website on the leaderboard. Links are scanned and may be
        refused or removed (adult content, malware, shorteners, private or local addresses, and other
        unsafe destinations). Rank Up does not endorse third-party sites. Clicking a player link leaves
        Rank Up. You are responsible for the destination of any link you submit.
      </p>

      <h2>12. Taxes and winner verification</h2>
      <p>
        Prize winners are responsible for any taxes. We may require government identification, tax forms
        (such as a W-9 or equivalent), and proof of eligibility before paying a prize. Failure to complete
        a reasonable claim process within the stated window may forfeit the prize.
      </p>

      <h2>13. Responsible participation</h2>
      <p>
        Contribute only what you can afford. Rank Up is entertainment, not an investment, and there is no
        guarantee you will finish in a prize place. If gambling-like spending is a problem for you, do not
        enter and seek help from a local support service.
      </p>
    </LegalDoc>
  );
}

import { ExternalLink } from "lucide-react";
import { cn, hostFromUrl, isUrlSafe } from "@/lib/utils";

export function SafeWebLink({
  href,
  className,
  compact = false,
}: {
  href?: string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!href || !isUrlSafe(href)) return null;
  const host = hostFromUrl(href);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      referrerPolicy="no-referrer"
      title={`Opens ${host} — third-party site, not affiliated with Rank Up`}
      aria-label={`Visit ${host} (opens in a new tab, third-party site)`}
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 text-gold hover:text-gold-light",
        compact
          ? "min-h-0 rounded-full border border-gold/45 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px]"
          : "min-h-11 rounded-full border border-gold/40 bg-gold/10 px-2.5 text-[12px] font-semibold",
        className,
      )}
    >
      <ExternalLink className={cn("shrink-0", compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
      <span className="truncate">{host}</span>
    </a>
  );
}

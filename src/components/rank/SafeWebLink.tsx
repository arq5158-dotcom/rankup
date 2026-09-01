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
      title={host}
      className={cn(
        "inline-flex max-w-full min-w-0 min-h-11 items-center gap-1 text-gold/85 hover:text-gold",
        compact && "min-h-0",
        className,
      )}
    >
      <span className="truncate">{host}</span>
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

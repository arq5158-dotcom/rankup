import { cn, safeImageSrc } from "@/lib/utils";

export function AvatarImg({
  src,
  name,
  size = 40,
  className,
  ring,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  ring?: "gold" | "silver" | "bronze" | "none";
}) {
  const safe = safeImageSrc(src);
  const ringClass =
    ring === "gold"
      ? "glow-gold"
      : ring === "silver"
        ? "glow-silver"
        : ring === "bronze"
          ? "glow-bronze"
          : "border border-white/10";
  return (
    <div
      style={{ width: size, height: size }}
      className={cn("relative shrink-0 overflow-hidden rounded-full bg-[#1a1a24]", ringClass, className)}
    >
      {safe ? (
        <img src={safe} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white/40">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function Verified() {
  return (
    <span className="ml-1 inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[#1a6cff]/25">
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
        <path d="M2.5 6.2 5 8.6 9.5 3.6" stroke="#4d8dff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

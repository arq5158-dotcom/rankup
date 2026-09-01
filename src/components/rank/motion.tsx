import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function usePresence(open: boolean, ms = 180) {
  const [shown, setShown] = useState(open);
  const [on, setOn] = useState(open);
  useEffect(() => {
    if (open) {
      setShown(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setOn(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setOn(false);
    const t = window.setTimeout(() => setShown(false), ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return { shown, on };
}

export function FluidFold({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { shown, on } = usePresence(open, 300);
  if (!shown) return null;
  return (
    <div className={cn("panel-fold", on && "is-open", className)}>
      <div className="panel-fold-inner">{children}</div>
    </div>
  );
}

export function FadeSwitch({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <div key={id} className={cn("fade-switch", className)}>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });

  useLayoutEffect(() => {
    const el = wrap.current?.querySelector(`[data-seg="${CSS.escape(value)}"]`) as HTMLElement | null;
    if (!el) return;
    setPill((prev) => ({ x: el.offsetLeft, w: el.offsetWidth, ready: prev.ready }));
    const id = requestAnimationFrame(() => setPill((p) => ({ ...p, ready: true })));
    return () => cancelAnimationFrame(id);
  }, [value, options.length]);

  useEffect(() => {
    const measure = () => {
      const el = wrap.current?.querySelector(`[data-seg="${CSS.escape(value)}"]`) as HTMLElement | null;
      if (!el) return;
      setPill((prev) => ({ x: el.offsetLeft, w: el.offsetWidth, ready: prev.ready }));
    };
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value]);

  return (
    <div ref={wrap} className={cn("seg", className)} role="tablist">
      <span
        className="seg-pill"
        aria-hidden
        style={{
          width: pill.w || undefined,
          transform: `translateX(${pill.x}px)`,
          transition: pill.ready ? undefined : "none",
        }}
      />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          data-seg={o.id}
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={value === o.id ? "is-on" : ""}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

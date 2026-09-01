import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { usePresence } from "./motion";

const VIEW = 280;
const OUT = 512;

export function PhotoCropper({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
}) {
  const { shown, on } = usePresence(true, 200);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    setZoom(1);
    setOx(0);
    setOy(0);
    setNat({ w: 0, h: 0 });
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const contain = nat.w && nat.h ? Math.min(VIEW / nat.w, VIEW / nat.h) : 1;
  const cover = nat.w && nat.h ? Math.max(VIEW / nat.w, VIEW / nat.h) : 1;
  const maxZoom = Math.max(3, (cover / contain) * 2.4);
  const scale = contain * zoom;
  const dw = nat.w * scale;
  const dh = nat.h * scale;
  const maxOx = Math.max(0, (dw - VIEW) / 2);
  const maxOy = Math.max(0, (dh - VIEW) / 2);
  const cox = Math.min(maxOx, Math.max(-maxOx, ox));
  const coy = Math.min(maxOy, Math.max(-maxOy, oy));

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: cox, oy: coy };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOx(drag.current.ox + (e.clientX - drag.current.x));
    setOy(drag.current.oy + (e.clientY - drag.current.y));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) {
      setError("Could not read that photo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#12121a";
      ctx.fillRect(0, 0, OUT, OUT);
      const ratio = OUT / VIEW;
      ctx.drawImage(img, OUT / 2 + cox * ratio - (dw * ratio) / 2, OUT / 2 + coy * ratio - (dh * ratio) / 2, dw * ratio, dh * ratio);
      let quality = 0.82;
      let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > 160_000 && quality > 0.45) {
        quality -= 0.08;
        data = canvas.toDataURL("image/jpeg", quality);
      }
      if (data.length > 175_000) throw new Error("Photo is too large. Try a tighter crop.");
      onConfirm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process photo.");
    } finally {
      setBusy(false);
    }
  };

  if (!shown) return null;

  return (
    <div className={`modal-layer fixed inset-0 z-[96] grid place-items-center bg-black/75 p-4 ${on ? "is-open" : ""}`}>
      <div className="modal-card glass-card w-full max-w-sm rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-black text-fg">Adjust photo</h2>
          <button type="button" onClick={onCancel} className="tap grid h-10 w-10 place-items-center rounded-full text-white/50" aria-label="Cancel">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-[12px] text-white/40">Full photo first. Zoom in, then drag to frame the crop.</p>
        <div
          className="relative mx-auto overflow-hidden rounded-2xl bg-[#0a0a10]"
          style={{ width: VIEW, height: VIEW, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {url ? (
            <img
              ref={imgRef}
              src={url}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: nat.w ? dw : "auto",
                height: nat.h ? dh : "auto",
                maxWidth: nat.w ? "none" : VIEW,
                maxHeight: nat.h ? "none" : VIEW,
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${cox}px), calc(-50% + ${coy}px))`,
              }}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNat({ w: el.naturalWidth, h: el.naturalHeight });
              }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_80px_rgba(10,10,16,0.62)] ring-2 ring-gold/35" />
        </div>
        <label className="mt-4 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
          Zoom
          <input
            type="range"
            min={1}
            max={Number(maxZoom.toFixed(2))}
            step={0.02}
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value));
              setOx(cox);
              setOy(coy);
            }}
            className="mt-2 h-10 w-full accent-[#c4a24a]"
          />
        </label>
        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
        <button
          type="button"
          disabled={busy || !nat.w}
          onClick={() => void confirm()}
          className="btn-gold tap mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Use photo
        </button>
      </div>
    </div>
  );
}

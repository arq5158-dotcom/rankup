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
  const [zoom, setZoom] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox, oy };
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
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const cover = Math.max(VIEW / iw, VIEW / ih);
      const ratio = OUT / VIEW;
      const dw = iw * cover * zoom * ratio;
      const dh = ih * cover * zoom * ratio;
      ctx.drawImage(img, OUT / 2 + ox * ratio - dw / 2, OUT / 2 + oy * ratio - dh / 2, dw, dh);
      let quality = 0.82;
      let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > 160_000 && quality > 0.45) {
        quality -= 0.08;
        data = canvas.toDataURL("image/jpeg", quality);
      }
      if (data.length > 175_000) throw new Error("Photo is too large. Try a smaller crop.");
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
        <p className="mb-3 text-[12px] text-white/40">Drag to position. Pinch-free zoom with the slider.</p>
        <div
          className="relative mx-auto overflow-hidden rounded-full border border-gold/30 bg-[#0a0a10] shadow-[0_0_24px_rgba(196,162,74,0.18)]"
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
              className="pointer-events-none h-full w-full object-cover"
              style={{ transform: `translate(${ox}px, ${oy}px) scale(${zoom})`, transformOrigin: "center center" }}
            />
          ) : null}
        </div>
        <label className="mt-4 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-2 h-10 w-full accent-[#c4a24a]"
          />
        </label>
        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
        <button
          type="button"
          disabled={busy}
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

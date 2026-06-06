import { useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(28,28,30,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 transition-opacity hover:opacity-70"
        style={{ background: "rgba(234,234,223,0.12)", borderRadius: 0 }}
        onClick={onClose}
        aria-label="Close"
      >
        <X size={18} color="#EAEADF" />
      </button>

      {/* Image container — stop propagation so clicking image doesn't close */}
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="object-contain"
          style={{ maxWidth: "80vw", maxHeight: "85vh" }}
        />
      </div>

      {/* Hint */}
      <p
        className="absolute bottom-6 left-1/2 text-xs tracking-widest uppercase"
        style={{ transform: "translateX(-50%)", color: "rgba(234,234,223,0.35)" }}
      >
        Click anywhere to close
      </p>
    </div>
  );
}

// Trigger button to wrap around the product image
export function ZoomTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Zoom image"
      className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-80"
      style={{ background: "rgba(45,44,44,0.55)" }}
    >
      <ZoomIn size={14} color="#EAEADF" />
    </button>
  );
}

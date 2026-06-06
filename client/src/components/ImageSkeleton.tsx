import { useState, ImgHTMLAttributes } from "react";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  objectFit?: "contain" | "cover";
  padding?: string;
}

export default function ImageSkeleton({
  src,
  alt,
  aspectRatio = "1",
  containerClassName = "",
  containerStyle = {},
  objectFit = "contain",
  padding = "0",
  className = "",
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ aspectRatio, ...containerStyle }}
    >
      {/* Shimmer skeleton */}
      {!loaded && !error && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #EAEADF 25%, #F2F2EC 50%, #EAEADF 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s infinite",
          }}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "#EAEADF" }}
        >
          <span className="text-xs" style={{ color: "rgba(45,44,44,0.3)" }}>Image unavailable</span>
        </div>
      )}

      {/* Actual image */}
      {!error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full transition-opacity duration-300 ${className}`}
          style={{
            objectFit,
            padding,
            opacity: loaded ? 1 : 0,
          }}
          {...rest}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

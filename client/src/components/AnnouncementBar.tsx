export default function AnnouncementBar() {
  return (
    <div
      className="w-full"
      style={{ background: "#2D2C2C", minHeight: "72px" }}
    >
      {/* Top micro-line */}
      <div
        className="w-full h-px"
        style={{ background: "rgba(234,234,223,0.06)" }}
      />

      {/* Main content — centred, vertically padded to ~5cm */}
      <div className="flex flex-col items-center justify-center gap-2 py-5">
        {/* Primary message */}
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-center" style={{ color: "#EAEADF" }}>
          Free Shipping on Orders Over $80 AUD &nbsp;·&nbsp; 1 Day Dispatch &nbsp;·&nbsp; Minimum $150 Spend
        </p>

        {/* Secondary strip */}
        <div className="flex items-center gap-6">
          {[
            "Vegan & Cruelty-Free",
            "Clinical-Grade Actives",
            "Full Ingredient Transparency",
            "Australian Owned",
          ].map((item, i) => (
            <span key={item} className="flex items-center gap-6">
              <span
                className="text-[10px] tracking-[0.14em] uppercase font-medium"
                style={{ color: "rgba(234,234,223,0.38)" }}
              >
                {item}
              </span>
              {i < 3 && (
                <span style={{ color: "rgba(234,234,223,0.15)", fontSize: "10px" }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom micro-line */}
      <div
        className="w-full h-px"
        style={{ background: "rgba(234,234,223,0.06)" }}
      />
    </div>
  );
}

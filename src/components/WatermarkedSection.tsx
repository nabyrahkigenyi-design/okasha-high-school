import { ReactNode } from "react";

type Variant = "pattern" | "ribbons" | "mixed";
type Tone = "public" | "portal";

export function WatermarkedSection({
  children,
  variant = "mixed",
  patternOpacity = 0.06,
  className = "",
  tone = "public",
}: {
  children: ReactNode;
  variant?: Variant;
  patternOpacity?: number;
  className?: string;
  tone?: Tone;
}) {
  const washOpacity = tone === "portal" ? 0.9 : 0.55;
  const ribbonOpacityBoost = tone === "portal" ? 1.15 : 1;

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Soft gradient wash (makes watermark feel premium) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: washOpacity,
          background:
            "radial-gradient(circle at 12% 18%, rgba(102,183,230,0.18), rgba(0,0,0,0) 52%)," +
            "radial-gradient(circle at 82% 72%, rgba(245,230,200,0.22), rgba(0,0,0,0) 54%)," +
            "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(250,250,250,0.92))",
        }}
      />

      {/* Pattern layer (your current watermark.svg) */}
      {variant === "pattern" || variant === "mixed" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: patternOpacity,
            backgroundImage: "url(/watermark.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "220px 220px",
          }}
        />
      ) : null}

      {/* Ribbons / rotated accents layer */}
      {variant === "ribbons" || variant === "mixed" ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* top-right ribbon */}
          <div
            className="absolute -right-20 top-10 h-24 w-72 rotate-12 rounded-[28px] border"
            style={{ background: "var(--ohs-sky)", opacity: 0.22 * ribbonOpacityBoost }}
          />
          <div
            className="absolute -right-24 top-24 h-16 w-64 rotate-[18deg] rounded-[28px] border"
            style={{ background: "var(--ohs-cream)", opacity: 0.18 * ribbonOpacityBoost }}
          />

          {/* bottom-left ribbon */}
          <div
            className="absolute -left-24 bottom-12 h-24 w-72 -rotate-12 rounded-[28px] border"
            style={{ background: "var(--ohs-cream)", opacity: 0.2 * ribbonOpacityBoost }}
          />
          <div
            className="absolute -left-20 bottom-28 h-16 w-64 -rotate-[18deg] rounded-[28px] border"
            style={{ background: "var(--ohs-sky)", opacity: 0.16 * ribbonOpacityBoost }}
          />

          {/* subtle circles (watermark feel) */}
          <div
            className="absolute left-10 top-10 h-20 w-20 rounded-full border"
            style={{ background: "white", opacity: tone === "portal" ? 0.14 : 0.12 }}
          />
          <div
            className="absolute right-12 bottom-10 h-24 w-24 rounded-full border"
            style={{ background: "white", opacity: tone === "portal" ? 0.12 : 0.1 }}
          />
        </div>
      ) : null}

      <div className="relative">{children}</div>
    </section>
  );
}
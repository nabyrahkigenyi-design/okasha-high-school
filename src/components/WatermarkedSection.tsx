import { ReactNode } from "react";

type Variant = "pattern" | "ribbons" | "mixed";

export function WatermarkedSection({
  children,
  variant = "mixed",
  patternOpacity = 0.06,
}: {
  children: ReactNode;
  variant?: Variant;
  patternOpacity?: number;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Pattern layer (your current watermark.svg) */}
      {(variant === "pattern" || variant === "mixed") ? (
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
      {(variant === "ribbons" || variant === "mixed") ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* top-right ribbon */}
          <div
            className="absolute -right-20 top-10 h-24 w-72 rotate-12 rounded-[28px] border"
            style={{ background: "var(--ohs-sky)", opacity: 0.22 }}
          />
          <div
            className="absolute -right-24 top-24 h-16 w-64 rotate-[18deg] rounded-[28px] border"
            style={{ background: "var(--ohs-cream)", opacity: 0.18 }}
          />

          {/* bottom-left ribbon */}
          <div
            className="absolute -left-24 bottom-12 h-24 w-72 -rotate-12 rounded-[28px] border"
            style={{ background: "var(--ohs-cream)", opacity: 0.20 }}
          />
          <div
            className="absolute -left-20 bottom-28 h-16 w-64 -rotate-[18deg] rounded-[28px] border"
            style={{ background: "var(--ohs-sky)", opacity: 0.16 }}
          />

          {/* subtle circles (watermark feel) */}
          <div
            className="absolute left-10 top-10 h-20 w-20 rounded-full border"
            style={{ background: "white", opacity: 0.12 }}
          />
          <div
            className="absolute right-12 bottom-10 h-24 w-24 rounded-full border"
            style={{ background: "white", opacity: 0.10 }}
          />
        </div>
      ) : null}

      <div className="relative">{children}</div>
    </section>
  );
}

import { ReactNode } from "react";

export function WatermarkedSection({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "url(/watermark.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />
      <div className="relative">{children}</div>
    </section>
  );
}

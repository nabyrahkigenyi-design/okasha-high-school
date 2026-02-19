"use client";

import { useEffect, useMemo, useState } from "react";

type Img = { src: string; alt: string };

export default function HeroCarousel({
  images,
  intervalMs = 5000,
}: {
  images: Img[];
  intervalMs?: number;
}) {
  const safeImages = useMemo(() => images.filter((i) => i?.src), [images]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % safeImages.length), intervalMs);
    return () => clearInterval(t);
  }, [safeImages.length, intervalMs]);

  if (!safeImages.length) {
    return <div className="h-full w-full bg-white" />;
  }

  return (
    <div className="relative h-full w-full">
      {safeImages.map((img, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: idx === i ? 1 : 0,
            transition: "opacity 700ms ease",
          }}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Dots */}
      {safeImages.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {safeImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className="h-2.5 w-2.5 rounded-full border border-white/40 bg-white/70 transition"
              style={{
                transform: idx === i ? "scale(1.15)" : "scale(1)",
                opacity: idx === i ? 1 : 0.65,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

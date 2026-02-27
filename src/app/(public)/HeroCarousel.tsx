"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Img = { src: string; alt: string };

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export default function HeroCarousel({
  images,
  intervalMs = 5000,
}: {
  images: Img[];
  intervalMs?: number;
}) {
  const safeImages = useMemo(() => images.filter((i) => i?.src), [images]);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useRef(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastAdvance = useRef<number>(Date.now());

  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  // Pause when tab not visible (premium + battery friendly)
  useEffect(() => {
    const onVis = () => setPaused(document.visibilityState !== "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    if (paused) return;

    const tick = () => {
      const now = Date.now();
      if (now - lastAdvance.current >= intervalMs) {
        lastAdvance.current = now;
        setI((p) => (p + 1) % safeImages.length);
      }
    };

    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [safeImages.length, intervalMs, paused]);

  function go(next: number) {
    if (!safeImages.length) return;
    const n = (next + safeImages.length) % safeImages.length;
    lastAdvance.current = Date.now();
    setI(n);
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || touchStartY.current == null) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Only treat as swipe if mostly horizontal
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) go(i + 1);
    else go(i - 1);
  }

  if (!safeImages.length) {
    return <div className="h-full w-full bg-white" />;
  }

  const motionClass = reduce.current ? "" : "hero-kenburns";

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Hero image carousel"
    >
      {safeImages.map((img, idx) => {
        const active = idx === i;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition-opacity duration-700 ease-out",
              active ? "opacity-100" : "opacity-0",
              active ? motionClass : "",
            ].join(" ")}
            loading={idx === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        );
      })}

      {/* Dots */}
      {safeImages.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {safeImages.map((_, idx) => {
            const active = idx === i;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => go(idx)}
                className={[
                  "h-2.5 w-2.5 rounded-full border transition",
                  "border-white/40 bg-white/65",
                  "hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  active ? "scale-[1.2] opacity-100" : "opacity-70",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
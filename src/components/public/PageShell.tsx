// src/components/public/PageShell.tsx
import { WatermarkedSection } from "@/components/WatermarkedSection";

export function PageShell({
  title,
  subtitle,
  watermark,
  children,
}: {
  title: string;
  subtitle?: string;
  watermark?: boolean;
  children: React.ReactNode;
}) {
  const Wrap = ({ children }: { children: React.ReactNode }) =>
    watermark ? <WatermarkedSection>{children}</WatermarkedSection> : <>{children}</>;

  return (
    <Wrap>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
            {title}
          </h1>
          {subtitle ? <p className="mt-3 text-base text-slate-600">{subtitle}</p> : null}
        </header>

        <section className="mt-8">{children}</section>
      </main>
    </Wrap>
  );
}

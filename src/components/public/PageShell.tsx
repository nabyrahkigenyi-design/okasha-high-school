import { ReactNode } from "react";
import { WatermarkedSection } from "@/components/WatermarkedSection";

export function PageShell({
  title,
  subtitle,
  children,
  watermark = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  watermark?: boolean;
}) {
  const Wrapper = watermark ? WatermarkedSection : ({ children }: { children: ReactNode }) => <>{children}</>;

  return (
    <Wrapper>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold text-[color:var(--ohs-charcoal)]">{title}</h1>
          {subtitle ? <p className="mt-3 text-slate-600">{subtitle}</p> : null}
        </header>
        <div className="mt-8">{children}</div>
      </main>
    </Wrapper>
  );
}

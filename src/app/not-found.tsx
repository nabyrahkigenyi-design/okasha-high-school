import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-[color:var(--ohs-charcoal)]">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
      <Link className="mt-6 inline-block underline" href="/">
        Go to homepage
      </Link>
    </main>
  );
}

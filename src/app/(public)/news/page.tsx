import Link from "next/link";
import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Force dynamic rendering to see changes immediately during testing
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "News | Okasha High School",
  description: "Announcements and news from Okasha High School.",
};

export default async function NewsPage() {
  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from("news_posts")
    .select("id, slug, title, excerpt, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);

  return (
    <PageShell title="News" subtitle="School announcements and updates.">
      <div className="grid gap-5 md:grid-cols-2">
        {(posts ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/news/${p.slug}`}
            className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="text-xs text-slate-500">
              {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[color:var(--ohs-charcoal)]">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{p.excerpt ?? ""}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
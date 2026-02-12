import { notFound } from "next/navigation";
import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Disable caching for testing
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> // Type updated to Promise
}) {
  // Unwrapping params for Next.js 15+
  const { slug } = await params;

  const sb = supabaseAdmin();
  const { data: post } = await sb
    .from("news_posts")
    .select("title, content_md, published_at, cover_image_url, status")
    .eq("slug", slug)
    .maybeSingle();

  // Guard clause: if post doesn't exist or isn't published
  if (!post || post.status !== "published") notFound();

  return (
    <PageShell
      title={post.title}
      subtitle={post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
    >
      {post.cover_image_url ? (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mb-6 aspect-video w-full rounded-2xl border object-cover"
        />
      ) : null}

      <article className="rounded-2xl border bg-white p-6 lg:p-10">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content_md}
          </ReactMarkdown>
        </div>
      </article>
    </PageShell>
  );
}
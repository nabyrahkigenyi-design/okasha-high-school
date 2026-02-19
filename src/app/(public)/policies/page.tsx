import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import PolicyLibrary from "./PolicyLibrary";

export const revalidate = 3600;

export const metadata = {
  title: "Policies | Okasha High School",
  description: "School policies and documents.",
};

export default async function PoliciesPage() {
  const sb = supabaseAdmin();
  const { data: docs } = await sb
    .from("policy_documents")
    .select("id, title, summary, file_url, file_name, category, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(500);

  return (
    <PageShell
      title="Policies"
      subtitle="School policies and documents. (Updated by administration.)"
      watermark
    >
      <PolicyLibrary docs={docs ?? []} />
    </PageShell>
  );
}

import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import FeeGuide from "./FeeGuide";

export const revalidate = 3600;

export const metadata = {
  title: "Tuition & Fees | Okasha High School",
  description: "Tuition and fees information.",
};

export default async function FeesPage() {
  const sb = supabaseAdmin();
  const { data: items } = await sb
    .from("fee_items")
    .select("id, title, amount_text, notes, applies_to, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(500);

  return (
    <PageShell
      title="Tuition & Fees"
      subtitle="This page provides general guidance. Official figures can be confirmed with the school office."
      watermark
    >
      <FeeGuide items={items ?? []} />
    </PageShell>
  );
}

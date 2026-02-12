import { PageShell } from "@/components/public/PageShell";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact | Okasha High School",
  description: "Contact Okasha High School.",
};

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Use this form to reach the school office. (Details can be updated later.)"
      watermark
    >
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold text-[color:var(--ohs-charcoal)]">School Office</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Location</dt>
              <dd className="text-right">Mbikko, Buikwe District, Uganda</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Email</dt>
              <dd className="text-right">info@ohs.ac.ug (placeholder)</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Phone</dt>
              <dd className="text-right">+256 XXX XXX XXX (placeholder)</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold text-[color:var(--ohs-charcoal)]">Send a Message</h2>
          <p className="mt-2 text-sm text-slate-600">
            Messages are delivered to the school email.
          </p>
          <ContactForm />
        </section>
      </div>
    </PageShell>
  );
}

import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 3600;

export const metadata = {
  title: "Staff | Okasha High School",
  description: "School leadership and staff.",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function deptKey(d?: string | null) {
  const v = (d ?? "").trim();
  return v.length ? v : "General";
}

function DeptPill({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-white"
    >
      {label}
    </a>
  );
}

export default async function StaffPage() {
  const sb = supabaseAdmin();
  const { data: staff } = await sb
    .from("staff_members")
    .select("id, full_name, role_title, department, bio, photo_url, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(200);

  const list = staff ?? [];

  // group by department for a “real website” feel
  const byDept = new Map<string, typeof list>();
  for (const s of list) {
    const k = deptKey(s.department);
    byDept.set(k, [...(byDept.get(k) ?? []), s]);
  }

  // sort department names with General last
  const deptNames = Array.from(byDept.keys()).sort((a, b) => {
    if (a === "General") return 1;
    if (b === "General") return -1;
    return a.localeCompare(b);
  });

  // leadership spotlight (first 3)
  const leadership = list.slice(0, 3);
  const others = list.slice(3);

  return (
    <PageShell
      title="Staff"
      subtitle="Meet the leadership and staff of Okasha High School. (Content can be updated by administration.)"
      watermark
    >
      {/* DISTINCT HERO BAND (different from other pages) */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        {/* Decorative shapes */}
        <svg
          className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 opacity-30"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-sky)"
            d="M44.7,-55.2C59.5,-49.7,74.3,-39.8,77.8,-26.7C81.3,-13.6,73.6,2.7,66.8,18.3C60.1,33.9,54.4,48.8,42.7,56.4C30.9,64,13.1,64.4,-3.5,68.7C-20.1,73,-40.2,81.1,-54.9,74C-69.6,66.9,-78.9,44.7,-77.4,25.8C-75.9,6.9,-63.6,-8.7,-53.3,-21.5C-43,-34.3,-34.8,-44.3,-24,-52.5C-13.2,-60.7,0.2,-67.1,14.4,-66.2C28.6,-65.3,57.1,-57,44.7,-55.2Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-cream)"
            d="M41.8,-68C55.3,-64.2,68.1,-55.6,73.6,-43.5C79.2,-31.4,77.4,-15.7,74.7,-1.6C72.1,12.5,68.7,25,61.6,36.1C54.5,47.2,43.8,56.8,31.7,62.7C19.6,68.6,6.1,70.9,-8.2,72.6C-22.5,74.3,-45.1,75.4,-57,66C-68.9,56.6,-70.2,36.7,-70.7,19.7C-71.2,2.7,-71,-11.4,-66.3,-23.8C-61.6,-36.2,-52.4,-47,-40.9,-52.2C-29.4,-57.4,-14.7,-57.1,-0.2,-56.8C14.3,-56.4,28.4,-71.8,41.8,-68Z"
            transform="translate(100 100)"
          />
        </svg>

        <div
          className="relative p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(135,206,235,0.25), rgba(255,248,220,0.6), rgba(255,255,255,0.9))",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800">
                Leadership • Departments • Teaching & Support Staff
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                Our People Make the Difference
              </h2>
              <p className="mt-2 text-sm text-slate-700">
                At OHS, our staff combine professional teaching with discipline and care — supporting learners in both
                the National Curriculum and Islamic studies.
              </p>
              <p className="mt-3 text-sm text-slate-700" dir="rtl">
                كادرنا يجمع بين الخبرة التربوية والقيم الإسلامية لخدمة الطلاب وبناء شخصياتهم.
              </p>
            </div>

            {/* Department jump links */}
            <div className="flex flex-wrap gap-2">
              {deptNames.slice(0, 6).map((d) => (
                <DeptPill key={d} label={d} href={`#dept-${encodeURIComponent(d)}`} />
              ))}
              {deptNames.length > 6 ? (
                <span className="inline-flex items-center rounded-full border bg-white/60 px-3 py-1 text-xs text-slate-600">
                  +{deptNames.length - 6} more
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP SPOTLIGHT */}
      {leadership.length ? (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Leadership Spotlight</h2>
            <span className="text-xs text-slate-500">Top listed staff (by admin order)</span>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {leadership.map((s, idx) => (
              <article
                key={s.id}
                className="relative overflow-hidden rounded-3xl border bg-white shadow-sm"
              >
                {/* top band to differentiate cards */}
                <div
                  className="h-16"
                  style={{
                    background:
                      idx === 0
                        ? "linear-gradient(90deg, var(--ohs-sky), var(--ohs-cream))"
                        : idx === 1
                        ? "linear-gradient(90deg, var(--ohs-cream), #fff)"
                        : "linear-gradient(90deg, var(--ohs-sky), #fff)",
                  }}
                />

                <div className="p-6 pt-0">
                  <div className="-mt-7 flex items-center gap-3">
                    {s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.photo_url}
                        alt={s.full_name}
                        className="h-14 w-14 rounded-2xl border object-cover bg-white"
                      />
                    ) : (
                      <div
                        className="grid h-14 w-14 place-items-center rounded-2xl border bg-white text-sm font-bold text-slate-800"
                        aria-hidden
                      >
                        {initials(s.full_name)}
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-[color:var(--ohs-charcoal)]">{s.full_name}</h3>
                      <p className="text-sm text-slate-600">
                        {s.role_title}
                        {s.department ? ` • ${s.department}` : ""}
                      </p>
                    </div>
                  </div>

                  {s.bio ? (
                    <p className="mt-4 text-sm text-slate-700 line-clamp-5">{s.bio}</p>
                  ) : (
                    <p className="mt-4 text-sm text-slate-600">
                      Staff profile will be updated by administration.
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
                      Mentor & Guidance
                    </span>
                    <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
                      Student Support
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* DEPARTMENT SECTIONS */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Departments & Staff</h2>
          <a className="text-sm underline underline-offset-4 text-slate-700" href="#top">
            Back to top
          </a>
        </div>

        <div className="mt-5 grid gap-8">
          {deptNames.map((d, i) => {
            const members = byDept.get(d) ?? [];
            // alternate section background subtly so sections don’t feel the same
            const sectionBg =
              i % 3 === 0 ? "var(--ohs-sky)" : i % 3 === 1 ? "var(--ohs-cream)" : "white";

            return (
              <section
                key={d}
                id={`dept-${encodeURIComponent(d)}`}
                className="rounded-3xl border p-6 shadow-sm"
                style={{ background: sectionBg }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
                      {d}
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {members.length} member{members.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                      Teaching & Support
                    </span>
                    <span className="rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                      Discipline & Care
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {members.map((s) => (
                    <article
                      key={s.id}
                      className="group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* corner tag */}
                      <div
                        className="absolute -right-10 top-4 rotate-45 px-10 py-1 text-[11px] font-bold text-slate-900"
                        style={{ background: "var(--ohs-cream)" }}
                        aria-hidden
                      >
                        OHS
                      </div>

                      <div className="flex items-center gap-4">
                        {s.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.photo_url}
                            alt={s.full_name}
                            className="h-14 w-14 rounded-2xl border object-cover"
                          />
                        ) : (
                          <div
                            className="grid h-14 w-14 place-items-center rounded-2xl border bg-[color:var(--ohs-surface)] text-sm font-bold text-slate-800"
                            aria-hidden
                          >
                            {initials(s.full_name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-[color:var(--ohs-charcoal)]">
                            {s.full_name}
                          </h4>
                          <p className="mt-0.5 text-sm text-slate-600">
                            {s.role_title}
                          </p>
                          {s.department ? (
                            <p className="mt-1 text-xs text-slate-500">{s.department}</p>
                          ) : null}
                        </div>
                      </div>

                      {s.bio ? (
                        <p className="mt-3 text-sm text-slate-700 line-clamp-4">{s.bio}</p>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">
                          Profile details will be updated soon.
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
                          Professional
                        </span>
                        <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
                          Supportive
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {!others.length && !leadership.length ? (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-sm text-slate-600">
            No staff profiles published yet.
          </div>
        ) : null}
      </section>

      {/* CTA (NO green emphasis; keep neutral sky/charcoal) */}
      <section
        className="mt-10 rounded-3xl border p-6 shadow-sm"
        style={{
          background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
              Want to speak to the school office?
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Director: <a className="underline" href="tel:+256702444301">0702444301</a> • Admissions:{" "}
              <a className="underline" href="tel:+256740235451">0740235451</a>
            </p>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              للتواصل: مكتب القبول أو إدارة المدرسة — مرحباً بكم.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              href="/contact"
            >
              Send a Message
            </a>
            <a
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              href="/admissions"
            >
              Admissions
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// src/components/public/PublicFooter.tsx
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Okasha High School</div>
            <p className="mt-2 text-sm text-slate-600">
              Mixed Day & Boarding • Established 1996
            </p>
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium">Motto:</span> Education is Light — <span className="font-arabic">العلم نور</span>
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Contacts</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              <li>
                Director (Sheikh Abdrahman Twahir Kigenyi):{" "}
                <a className="underline" href="tel:+256702444301">
                  0702444301
                </a>
              </li>
              <li>
                Admissions Office:{" "}
                <a className="underline" href="tel:+256740235451">
                  0740235451
                </a>
              </li>
              <li className="text-slate-600">Mbikko, Buikwe District, Jinja, Uganda</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Quick Links</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <Link className="underline" href="/admissions">Admissions</Link>
              <Link className="underline" href="/programs">Programs</Link>
              <Link className="underline" href="/fees">Fees</Link>
              <Link className="underline" href="/policies">Policies</Link>
              <Link className="underline" href="/calendar">Calendar</Link>
              <Link className="underline" href="/contact">Contact</Link>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-8 overflow-hidden rounded-2xl border">
          <iframe
            title="Okasha High School location map"
            className="h-64 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Mbikko%2C%20Buikwe%20District%2C%20Uganda&output=embed"
          />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Okasha High School. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

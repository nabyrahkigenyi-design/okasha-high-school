import "./globals.css";
import Link from "next/link";

export const metadata = {
  metadataBase: new URL("https://ohs.ac.ug"), // placeholder
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        {/* HEADER */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-bold text-lg">
              OHS
            </Link>

            <nav className="flex items-center gap-6 text-sm">
              <Link href="/about">About</Link>
              <Link href="/admissions">Admissions</Link>
              <Link href="/programs">Programs</Link>
              <Link href="/staff">Staff</Link>
              <Link href="/calendar">Calendar</Link>
              <Link href="/news">News</Link>
              <Link href="/fees">Fees</Link>
              <Link href="/policies">Policies</Link>
              <Link href="/contact">Contact</Link>
              
              <Link 
                href="/portal" 
                className="ml-2 rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Portal
              </Link>
            </nav>
          </div>
        </header>

        <main>
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t bg-white mt-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
            © {new Date().getFullYear()} Okasha High School – Mbikko, Buikwe District, Uganda.
          </div>
        </footer>

      </body>
    </html>
  );
}
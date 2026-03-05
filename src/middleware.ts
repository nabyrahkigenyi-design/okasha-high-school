import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Config (tweak as you like)
const MAX_SESSION_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_IDLE_MS = 30 * 60 * 1000; // 30 minutes

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const isPortal = req.nextUrl.pathname.startsWith("/portal");
  if (!isPortal) return res;

  // --- Session Timeout Check ---
  const now = Date.now();
  const lastSeenRaw = req.cookies.get("ohs_last_seen")?.value;
  const sessionStartRaw = req.cookies.get("ohs_session_start")?.value;

  const lastSeen = lastSeenRaw ? Number(lastSeenRaw) : null;
  const sessionStart = sessionStartRaw ? Number(sessionStartRaw) : null;

  const idleTooLong = lastSeen ? now - lastSeen > MAX_IDLE_MS : false;
  const sessionTooOld = sessionStart ? now - sessionStart > MAX_SESSION_AGE_MS : false;

  // If expired, force logout then come back to login
  if (idleTooLong || sessionTooOld) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/logout";
    url.searchParams.set("next", "/auth/login");
    return NextResponse.redirect(url);
  }

  // --- Supabase Auth Check ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // --- Update Session Cookies ---
  // Set session start once
  if (!sessionStart) {
    res.cookies.set("ohs_session_start", String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  // Update last seen on every valid portal request
  res.cookies.set("ohs_last_seen", String(now), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return res;
}

export const config = {
  matcher: ["/portal/:path*"],
};
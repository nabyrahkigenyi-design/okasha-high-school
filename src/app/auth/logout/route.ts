import { NextResponse, type NextRequest } from "next/server";
import { supabaseSSR } from "@/lib/supabase/ssr";

export async function GET(req: NextRequest) {
  const sb = await supabaseSSR();
  await sb.auth.signOut();

  // Get the 'next' param, default to '/auth/login'
  const next = req.nextUrl.searchParams.get("next") ?? "/auth/login";
  const response = NextResponse.redirect(new URL(next, req.url));

  // Clear custom session tracking cookies
  response.cookies.delete("ohs_session_start");
  response.cookies.delete("ohs_last_seen");

  return response;
}

// Keeping POST so any existing forms/buttons in your UI still work
export async function POST(req: NextRequest) {
  const sb = await supabaseSSR();
  await sb.auth.signOut();

  const next = req.nextUrl.searchParams.get("next") ?? "/auth/login";
  const response = NextResponse.redirect(new URL(next, req.url));

  response.cookies.delete("ohs_session_start");
  response.cookies.delete("ohs_last_seen");

  return response;
}
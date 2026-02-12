import { NextResponse } from "next/server";
import { supabaseSSR } from "@/lib/supabase/ssr";

export async function POST(req: Request) {
  const sb = await supabaseSSR();
  await sb.auth.signOut();

  const url = new URL("/auth/login", req.url);
  return NextResponse.redirect(url);
}

import { NextResponse } from "next/server";
import { supabaseSSR } from "@/lib/supabase/ssr";

export async function GET() {
  const sb = await supabaseSSR();

  const { data: userData, error: userErr } = await sb.auth.getUser();

  const userId = userData.user?.id ?? null;

  let profile: any = null;
  let profileErr: any = null;

  if (userId) {
    const res = await sb
      .from("profiles")
      .select("id, full_name, role_key, is_active")
      .eq("id", userId)
      .maybeSingle();

    profile = res.data;
    profileErr = res.error?.message ?? null;
  }

  return NextResponse.json({
    userId,
    userErr: userErr?.message ?? null,
    profile,
    profileErr,
  });
}

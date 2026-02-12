import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export type RoleKey = "student" | "parent" | "teacher" | "admin";

export async function requireRole(allowed: RoleKey[]) {
  const sb = supabaseServer();

  // Expect you to implement cookie/session handling.
  // For Supabase Auth in Next.js App Router, the clean approach is:
  // - Use @supabase/ssr helpers
  // Here we keep it minimal for now and enforce via server actions + API routes.
  // Next step: add @supabase/ssr to read auth cookies.

  throw new Error("Next step: wire Supabase SSR auth helpers (we'll do this next).");
}

import "server-only";

// Keep the same role type you already use in the portal
export type RoleKey = "student" | "parent" | "teacher" | "admin";

/**
 * IMPORTANT:
 * This file previously contained a placeholder throw.
 * To avoid changing your working auth logic, we delegate to the
 * already-working RBAC implementation in "@/lib/rbac".
 */
export async function requireRole(allowed: RoleKey[]) {
  const { requireRole: requireRoleRBAC } = await import("@/lib/rbac");
  return requireRoleRBAC(allowed);
}
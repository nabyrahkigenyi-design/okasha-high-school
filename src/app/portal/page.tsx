import { requireAuth, roleHome } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function PortalIndex() {
  const profile = await requireAuth();
  redirect(roleHome(profile.role_key));
}

// src/app/portal/page.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/rbac";

export default async function PortalIndexPage() {
  const me = await requireAuth();

  switch (me.role_key) {
    case "admin":
      redirect("/portal/admin/dashboard");
    case "teacher":
      redirect("/portal/teacher/dashboard");
    case "student":
      redirect("/portal/student/dashboard");
    case "parent":
      redirect("/portal/parent/dashboard");
    default:
      redirect("/auth/login");
  }
}

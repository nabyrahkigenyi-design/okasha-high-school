"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Meta = {
  title: string;
  subtitle?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

function metaFor(pathname: string): Meta {
  const p = pathname || "";

  // normalize
  const is = (prefix: string) => p === prefix || p.startsWith(prefix + "/");

  if (p === "/portal/admin" || is("/portal/admin/dashboard")) {
    return {
      title: "Admin Dashboard",
      subtitle: "Overview and shortcuts for managing the platform.",
      primaryAction: { label: "Users", href: "/portal/admin/users" },
      secondaryAction: { label: "Academics", href: "/portal/admin/academics" },
    };
  }

  if (is("/portal/admin/users")) {
    return {
      title: "Users",
      subtitle: "Create, search, deactivate and export users.",
      primaryAction: { label: "Print / Save PDF", href: "/portal/admin/users/print" },
      secondaryAction: { label: "Academics", href: "/portal/admin/academics" },
    };
  }

  if (is("/portal/admin/academics")) {
    return {
      title: "Academics",
      subtitle: "Terms, classes, subjects, assignments and enrollments.",
      primaryAction: { label: "Go to terms", href: "/portal/admin/academics?tab=terms" },
      secondaryAction: { label: "Go to enrollments", href: "/portal/admin/academics?tab=enrollments" },
    };
  }

  if (is("/portal/admin/news")) {
    return {
      title: "News",
      subtitle: "Create, edit and publish posts for the public website.",
      primaryAction: { label: "New post", href: "/portal/admin/news" },
    };
  }

  if (is("/portal/admin/staff")) {
    return {
      title: "Staff",
      subtitle: "Manage staff members shown on the public website.",
      primaryAction: { label: "New staff", href: "/portal/admin/staff" },
    };
  }

  if (is("/portal/admin/calendar")) {
    return {
      title: "Calendar",
      subtitle: "Manage public calendar events.",
      primaryAction: { label: "New event", href: "/portal/admin/calendar" },
    };
  }

  if (is("/portal/admin/policies")) {
    return {
      title: "Policies",
      subtitle: "Upload PDFs and publish to the website.",
      primaryAction: { label: "New policy", href: "/portal/admin/policies" },
    };
  }

  if (is("/portal/admin/fees")) {
    return {
      title: "Fees",
      subtitle: "Manage tuition and fee items shown on the public website.",
      primaryAction: { label: "New item", href: "/portal/admin/fees" },
    };
  }

  if (is("/portal/admin/admissions")) {
    return {
      title: "Admissions",
      subtitle: "Upload admission PDFs and publish to the admissions page.",
      primaryAction: { label: "New doc", href: "/portal/admin/admissions" },
    };
  }

  if (is("/portal/admin/programs")) {
    return {
      title: "Programs",
      subtitle: "Create program items and assign them to tracks.",
      primaryAction: { label: "New item", href: "/portal/admin/programs" },
    };
  }

  if (is("/portal/admin/settings")) {
    return {
      title: "Settings",
      subtitle: "Global school configuration and platform defaults.",
      secondaryAction: { label: "Dashboard", href: "/portal/admin/dashboard" },
    };
  }

  // fallback
  return {
    title: "Admin",
    subtitle: "Control Panel",
    secondaryAction: { label: "Dashboard", href: "/portal/admin/dashboard" },
  };
}

export default function AdminTopBar() {
  const pathname = usePathname() ?? "";
  const meta = metaFor(pathname);

  return (
    <div className="portal-surface px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Admin
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900 truncate">
            {meta.title}
          </div>
          {meta.subtitle ? (
            <div className="mt-1 text-sm text-slate-600">{meta.subtitle}</div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {meta.secondaryAction ? (
            <Link className="portal-btn" href={meta.secondaryAction.href}>
              {meta.secondaryAction.label}
            </Link>
          ) : null}

          {meta.primaryAction ? (
            <Link className="portal-btn" href={meta.primaryAction.href}>
              {meta.primaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
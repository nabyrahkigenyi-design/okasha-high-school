"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; kind?: "default" | "danger" };
type Group = { title: string; items: Item[] };

function isActive(pathname: string, href: string) {
  // Dashboard can be /portal/admin or /portal/admin/dashboard depending on routing
  if (href === "/portal/admin/dashboard") {
    return pathname === "/portal/admin" || pathname === "/portal/admin/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({
  href,
  label,
  active,
  kind = "default",
}: {
  href: string;
  label: string;
  active: boolean;
  kind?: "default" | "danger";
}) {
  return (
    <Link
      href={href}
      className={[
        // Bigger tap target for mobile
        "portal-nav-item",
        "px-3 py-2.5 rounded-xl border transition",
        "flex items-center justify-between gap-3",
        "bg-white/60 hover:bg-white",
        "border-slate-200/70 hover:border-slate-300",
        active ? "portal-nav-item-active" : "",
        kind === "danger" ? "text-red-700 hover:text-red-800" : "text-slate-800",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <span className="truncate font-medium">{label}</span>

      {/* Active dot */}
      <span
        className={[
          "text-xs",
          active ? "opacity-100" : "opacity-0",
          "transition-opacity",
        ].join(" ")}
      >
        ●
      </span>
    </Link>
  );
}

export default function AdminSidebarNav() {
  // Always treat pathname as a normal string to avoid narrow literal typing issues
  const pathname: string = usePathname() ?? "";

  const groups: Group[] = [
    {
      title: "Home",
      items: [{ href: "/portal/admin/dashboard", label: "Dashboard" }],
    },
    {
      title: "Manage",
      items: [
        { href: "/portal/admin/users", label: "Users" },
        { href: "/portal/admin/academics", label: "Academics" },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/portal/admin/news", label: "News" },
        { href: "/portal/admin/staff", label: "Staff" },
        { href: "/portal/admin/calendar", label: "Calendar" },
        { href: "/portal/admin/policies", label: "Policies" },
        { href: "/portal/admin/fees", label: "Fees" },
        { href: "/portal/admin/admissions", label: "Admissions" },
        { href: "/portal/admin/programs", label: "Programs" },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/portal/admin/settings", label: "Settings" },
        { href: "/portal/admin/users/print", label: "Print Users", kind: "default" },
      ],
    },
  ];

  return (
    <div className="grid gap-5">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {g.title}
            </div>
            {/* subtle divider hint */}
            <div className="h-px flex-1 bg-slate-200/70 ml-3" />
          </div>

          <nav className="grid gap-2" aria-label={`${g.title} navigation`}>
            {g.items.map((it) => (
              <NavItem
                key={it.href}
                href={it.href}
                label={it.label}
                kind={it.kind}
                active={isActive(pathname, it.href)}
              />
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };
type Group = { title: string; items: Item[] };

function isActive(pathname: string, href: string) {
  if (href === "/portal/admin/dashboard") {
    return pathname === "/portal/admin" || pathname === "/portal/admin/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`portal-nav-item ${active ? "portal-nav-item-active" : ""}`}>
      <span className="truncate">{label}</span>
      <span className="opacity-60">{active ? "•" : ""}</span>
    </Link>
  );
}

export default function AdminSidebarNav() {
  const pathname = usePathname() || "";

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
        { href: "/portal/admin/users/print", label: "Print Users" },
      ],
    },
  ];

  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {g.title}
          </div>
          <nav className="grid gap-2">
            {g.items.map((it) => (
              <NavItem
                key={it.href}
                href={it.href}
                label={it.label}
                active={isActive(pathname, it.href)}
              />
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}
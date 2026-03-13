"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: IconKey; kind?: "default" | "danger" };
type Group = { title: string; items: Item[] };

type IconKey =
  | "dashboard"
  | "users"
  | "academics"
  | "news"
  | "announcements"
  | "staff"
  | "calendar"
  | "policies"
  | "fees"
  | "admissions"
  | "programs"
  | "settings"
  | "print";

function isActive(pathname: string, href: string) {
  if (href === "/portal/admin/dashboard") {
    return pathname === "/portal/admin" || pathname === "/portal/admin/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function Icon({ name }: { name: IconKey }) {
  const common = "h-4 w-4 shrink-0";
  switch (name) {
    case "dashboard":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-18v7h7V2h-7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21c.6-4 4-6 8-6s7.4 2 8 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "academics":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3 2 8l10 5 10-5-10-5Zm0 10L2 8v8l10 5 10-5V8l-10 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "news":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 7h12M6 11h12M6 15h8M4 5h16v14H4V5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "announcements":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 10v4c0 .6.4 1 1 1h2l4 4v-4h6c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1H5c-.6 0-1 .4-1 1Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8 7h10a2 2 0 0 1 2 2v6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "staff":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9c.7-3.8 4.2-6 7-6s6.3 2.2 7 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 8.5 20 7l1.5 1.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 3v3M17 3v3M4 8h16M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "policies":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 3h7l3 3v15H7V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "fees":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 7h12v14H6V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 3h6v4H9V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "admissions":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3 2 9l10 6 10-6-10-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path
            d="M6 12v6c2.2 2 5 3 6 3s3.8-1 6-3v-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "programs":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 4h10v6H7V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M5 14h14v6H5v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "settings":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.3.6a8 8 0 0 0-1.7-1L15 4h-6l-.5 2.6a8 8 0 0 0-1.7 1L4.5 7l-2 3.5L4.5 12a8 8 0 0 0 .1 2L2.5 15.5l2 3.5 2.3-.6a8 8 0 0 0 1.7 1L9 22h6l.5-2.6a8 8 0 0 0 1.7-1l2.3.6 2-3.5-2.1-1.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "print":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 8V3h10v5M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M7 14h10v7H7v-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function NavItem({
  href,
  label,
  icon,
  active,
  kind = "default",
}: {
  href: string;
  label: string;
  icon: IconKey;
  active: boolean;
  kind?: "default" | "danger";
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition",
        "bg-white/55 hover:bg-white",
        "border-slate-200/70 hover:border-slate-300",
        "shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]",
        active ? "bg-[color:var(--ohs-surface)] border-slate-300" : "",
        kind === "danger" ? "text-red-700 hover:text-red-800" : "text-slate-800",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full transition",
          active ? "bg-[color:var(--ohs-dark-green)]" : "bg-transparent group-hover:bg-slate-200",
        ].join(" ")}
      />

      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={[
            "grid place-items-center rounded-lg border bg-white/60 p-2 transition",
            active
              ? "border-slate-300 text-[color:var(--ohs-dark-green)]"
              : "border-slate-200 text-slate-600 group-hover:text-slate-800",
          ].join(" ")}
        >
          <Icon name={icon} />
        </span>

        <span className={["truncate font-medium", active ? "text-slate-950" : ""].join(" ")}>
          {label}
        </span>
      </div>

      <span
        className={[
          "text-xs transition-opacity",
          active ? "opacity-100 text-[color:var(--ohs-dark-green)]" : "opacity-0",
        ].join(" ")}
      >
        ●
      </span>
    </Link>
  );
}

export default function AdminSidebarNav() {
  const pathname: string = usePathname() ?? "";

  const groups: Group[] = [
    {
      title: "Home",
      items: [{ href: "/portal/admin/dashboard", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "Manage",
      items: [
        { href: "/portal/admin/users", label: "Users", icon: "users" },
        { href: "/portal/admin/students", label: "Students", icon: "users" },
        { href: "/portal/admin/academics", label: "Academics", icon: "academics" },
        { href: "/portal/admin/finance", label: "Finance", icon: "fees" },
        { href: "/portal/admin/parent-links", label: "Parent Links", icon: "users" },
        { href: "/portal/admin/timetables", label: "Timetables", icon: "calendar" },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/portal/admin/news", label: "News", icon: "news" },
        { href: "/portal/admin/announcements", label: "Announcements", icon: "announcements" },
        { href: "/portal/admin/staff", label: "Staff", icon: "staff" },
        { href: "/portal/admin/calendar", label: "Calendar", icon: "calendar" },
        { href: "/portal/admin/policies", label: "Policies", icon: "policies" },
        { href: "/portal/admin/fees", label: "Fees", icon: "fees" },
        { href: "/portal/admin/admissions", label: "Admissions", icon: "admissions" },
        { href: "/portal/admin/programs", label: "Programs", icon: "programs" },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/portal/admin/settings", label: "Settings", icon: "settings" },
        { href: "/portal/admin/users/print", label: "Print Users", icon: "print" },
      ],
    },
  ];

  return (
    <div className="grid gap-6">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-2 flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{g.title}</div>
            <div className="h-px flex-1 bg-slate-200/70" />
          </div>

          <nav className="grid gap-2" aria-label={`${g.title} navigation`}>
            {g.items.map((it) => (
              <NavItem
                key={it.href}
                href={it.href}
                label={it.label}
                icon={it.icon}
                active={isActive(pathname, it.href)}
                kind={it.kind}
              />
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}
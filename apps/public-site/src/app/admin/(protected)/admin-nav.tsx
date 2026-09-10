"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { LayoutDashboard, Search, Settings, ShieldCheck, User, type LucideIcon } from "lucide-react";
import type { ContentTypeConfig } from "@/lib/admin/content-types";
import { CONTENT_TYPE_ICONS, DEFAULT_CONTENT_TYPE_ICON } from "@/lib/admin/nav-icons";
import { resolveNavGroups } from "@/lib/admin/nav-groups";

function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      // The sidebar carries 24 links and the dashboard ~19 more. Left to
      // prefetch, every one fires an RSC request the moment it enters the
      // viewport, and each of those re-runs this layout's auth check against
      // Supabase — measured at ~26 extra round trips per admin page load,
      // which is what made signing in feel slow. Admin navigation is a few
      // hundred ms without them; the storm cost seconds.
      prefetch={false}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-blue-50 font-medium text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={16} className={active ? "text-blue-600" : "text-slate-400"} />
      {label}
    </Link>
  );
}

export function AdminNav({
  contentTypes,
  isAdmin,
}: {
  contentTypes: ContentTypeConfig[];
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      resolveNavGroups(contentTypes)
        .map((group) => ({
          ...group,
          items: group.items.filter((type) => !needle || type.label.toLowerCase().includes(needle)),
        }))
        .filter((group) => group.items.length > 0),
    [contentTypes, needle],
  );

  return (
    <nav className="flex flex-col gap-4 text-sm">
      <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} />
      <NavLink href="/admin/settings" label="Site Settings" icon={Settings} />

      {/* 23 links is past the point where scanning beats typing. */}
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a section…"
          aria-label="Filter admin sections"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {visible.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </p>
          {group.items.map((type) => (
            <NavLink
              key={type.slug}
              href={`/admin/${type.slug}`}
              label={type.label}
              icon={CONTENT_TYPE_ICONS[type.slug] ?? DEFAULT_CONTENT_TYPE_ICON}
              onNavigate={() => setQuery("")}
            />
          ))}
        </div>
      ))}

      {visible.length === 0 && (
        <p className="px-3 py-2 text-sm text-slate-400">No section matches “{query}”.</p>
      )}

      <div className="flex flex-col gap-1 border-t border-slate-200 pt-3">
        <NavLink href="/admin/account" label="Account" icon={User} />
        {isAdmin && <NavLink href="/admin/users" label="CMS Users" icon={ShieldCheck} />}
      </div>
    </nav>
  );
}

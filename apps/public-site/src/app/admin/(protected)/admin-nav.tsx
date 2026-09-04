"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, User, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ContentTypeConfig } from "@/lib/admin/content-types";
import { CONTENT_TYPE_ICONS, DEFAULT_CONTENT_TYPE_ICON } from "@/lib/admin/nav-icons";

// A flat 22-item nav is exactly the "overloaded navigation" anti-pattern the
// design skill flags — grouped sections (not collapsible, just visually
// separated) keep every link one click away without one undifferentiated list.

const GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Site", slugs: ["navigation-items", "home-sections", "home-section-items", "seo-metadata"] },
  {
    label: "Content",
    slugs: [
      "notices",
      "achievements",
      "projects",
      "events",
      "blog-posts",
      "committee-members",
      "alumni",
      "gallery-albums",
      "gallery-images",
      "agp-blocks",
    ],
  },
  { label: "Community", slugs: ["forum-categories", "forum-posts", "forum-replies", "contact-submissions"] },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
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
  const bySlug = new Map(contentTypes.map((type) => [type.slug, type]));

  return (
    <nav className="flex flex-col gap-4 text-sm">
      <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} />
      <NavLink href="/admin/settings" label="Site Settings" icon={Settings} />

      {GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
          {group.slugs.map((slug) => {
            const type = bySlug.get(slug);
            if (!type) return null;
            return (
              <NavLink
                key={slug}
                href={`/admin/${slug}`}
                label={type.label}
                icon={CONTENT_TYPE_ICONS[slug] ?? DEFAULT_CONTENT_TYPE_ICON}
              />
            );
          })}
        </div>
      ))}

      <div className="flex flex-col gap-1 border-t border-slate-200 pt-3">
        <NavLink href="/admin/account" label="Account" icon={User} />
        {isAdmin && <NavLink href="/admin/users" label="CMS Users" icon={ShieldCheck} />}
      </div>
    </nav>
  );
}

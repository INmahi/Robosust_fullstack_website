import Link from "next/link";
import { contentTypes } from "@/lib/admin/content-types";
import { resolveNavGroups } from "@/lib/admin/nav-groups";
import { pageHeadingClass, pageSubtextClass } from "@/lib/admin/ui-classes";
import { CONTENT_TYPE_ICONS, DEFAULT_CONTENT_TYPE_ICON } from "@/lib/admin/nav-icons";

export default function AdminDashboardPage() {
  // Same grouping as the sidebar, from the same module — the dashboard is the
  // first screen an editor lands on, so a flat grid of nineteen cards here
  // undoes the sidebar's organisation before they even reach it.
  const groups = resolveNavGroups(contentTypes);

  return (
    <div>
      <h1 className={pageHeadingClass}>Content</h1>
      <p className={`${pageSubtextClass} mb-8 max-w-2xl`}>
        Everything the public site reads lives here, grouped by the part of the site it feeds. Site
        Settings holds the logo, socials and footer text.
      </p>

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="text-sm font-semibold text-slate-800">{group.label}</h2>
            <p className="mb-3 text-xs text-slate-500">{group.blurb}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((type) => {
                const Icon = CONTENT_TYPE_ICONS[type.slug] ?? DEFAULT_CONTENT_TYPE_ICON;
                return (
                  <Link
                    key={type.slug}
                    href={`/admin/${type.slug}`}
                    // Same reason as the sidebar's links — see admin-nav.tsx.
                    prefetch={false}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-medium text-slate-800">{type.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

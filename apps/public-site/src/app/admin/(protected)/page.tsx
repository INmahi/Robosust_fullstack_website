import Link from "next/link";
import { contentTypes } from "@/lib/admin/content-types";
import { pageHeadingClass, pageSubtextClass } from "@/lib/admin/ui-classes";
import { CONTENT_TYPE_ICONS, DEFAULT_CONTENT_TYPE_ICON } from "@/lib/admin/nav-icons";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className={pageHeadingClass}>Content</h1>
      <p className={`${pageSubtextClass} mb-6 max-w-2xl`}>
        Every Phase 1 content type lives here. Public pages read this data through{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/lib/content/*</code> —
        nothing on this screen is tied to any particular frontend design.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contentTypes.map((type) => {
          const Icon = CONTENT_TYPE_ICONS[type.slug] ?? DEFAULT_CONTENT_TYPE_ICON;
          return (
            <Link
              key={type.slug}
              href={`/admin/${type.slug}`}
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
    </div>
  );
}

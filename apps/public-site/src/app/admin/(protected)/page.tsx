import Link from "next/link";
import { contentTypes } from "@/lib/admin/content-types";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">Content</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Every Phase 1 content type lives here. Public pages read this data through{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5">src/lib/content/*</code> — nothing on
        this screen is tied to any particular frontend design.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {contentTypes.map((type) => (
          <Link
            key={type.slug}
            href={`/admin/${type.slug}`}
            className="rounded border border-zinc-200 px-4 py-3 text-sm hover:border-zinc-400"
          >
            {type.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

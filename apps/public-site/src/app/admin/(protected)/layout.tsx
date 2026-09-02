import Link from "next/link";
import { requireCmsUser } from "@/lib/auth/guard";
import { logout } from "@/lib/auth/session";
import { contentTypes } from "@/lib/admin/content-types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCmsUser();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-zinc-200 p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold">RoboSUST CMS</p>
          <p className="text-xs text-zinc-500">
            {user.full_name} · {user.role}
          </p>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded px-2 py-1 hover:bg-zinc-100">
            Dashboard
          </Link>
          <Link href="/admin/settings" className="rounded px-2 py-1 hover:bg-zinc-100">
            Site Settings
          </Link>
          {contentTypes.map((type) => (
            <Link
              key={type.slug}
              href={`/admin/${type.slug}`}
              className="rounded px-2 py-1 hover:bg-zinc-100"
            >
              {type.label}
            </Link>
          ))}
          <div className="my-2 border-t border-zinc-200" />
          <Link href="/admin/account" className="rounded px-2 py-1 hover:bg-zinc-100">
            Account
          </Link>
          {user.role === "admin" && (
            <Link href="/admin/users" className="rounded px-2 py-1 hover:bg-zinc-100">
              CMS Users
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </form>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        {user.must_change_password && (
          <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your password was reset by an admin.{" "}
            <Link href="/admin/account" className="underline">
              Set a new one
            </Link>
            .
          </p>
        )}
        {children}
      </main>
    </div>
  );
}

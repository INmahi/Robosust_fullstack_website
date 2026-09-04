import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireCmsUser } from "@/lib/auth/guard";
import { logout } from "@/lib/auth/session";
import { contentTypes } from "@/lib/admin/content-types";
import { alertWarningClass } from "@/lib/admin/ui-classes";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCmsUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">RoboSUST CMS</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {user.full_name} · <span className="capitalize">{user.role}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav contentTypes={contentTypes} isAdmin={user.role === "admin"} />
        </div>

        <div className="border-t border-slate-200 p-3">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-8">
        {user.must_change_password && (
          <p role="alert" className={`${alertWarningClass} mb-6`}>
            Your password was reset by an admin.{" "}
            <Link href="/admin/account" className="font-medium underline underline-offset-2">
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

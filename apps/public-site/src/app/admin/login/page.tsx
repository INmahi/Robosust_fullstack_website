import { LayoutDashboard } from "lucide-react";
import { alertErrorClass, buttonPrimaryClass, inputClass, labelClass } from "@/lib/admin/ui-classes";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <LayoutDashboard size={20} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">RoboSUST CMS</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in with your CMS username.</p>
          </div>
        </div>

        {error && (
          <p role="alert" className={`${alertErrorClass} mb-4`}>
            {error}
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          <label className={labelClass}>
            Username
            <input name="username" required autoFocus autoComplete="username" className={inputClass} />
          </label>
          <label className={labelClass}>
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>
          <button type="submit" className={`${buttonPrimaryClass} mt-2 w-full`}>
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}

import { requireCmsUser } from "@/lib/auth/guard";
import { changePasswordAction } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireCmsUser();
  const { error, success } = await searchParams;

  return (
    <div className="max-w-sm">
      <h1 className="mb-1 text-lg font-semibold">Account</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Signed in as <strong>{user.username}</strong> ({user.full_name})
      </p>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Password updated.
        </p>
      )}

      <form action={changePasswordAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Current password
          <input
            name="currentPassword"
            type="password"
            required
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          New password
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Update password
        </button>
      </form>
    </div>
  );
}

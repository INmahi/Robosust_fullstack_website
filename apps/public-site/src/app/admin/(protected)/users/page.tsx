import { listCmsUsers } from "@/lib/auth/admin-actions";
import { createUserAction, resetPasswordAction, deleteUserAction, readFlashTempPassword } from "./actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; reset?: string; deleted?: string }>;
}) {
  const [users, tempPassword, params] = await Promise.all([
    listCmsUsers(),
    readFlashTempPassword(),
    searchParams,
  ]);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">CMS Users</h1>
      <p className="mb-6 text-sm text-zinc-500">
        No email, no Supabase-sent mail. New accounts and resets get a one-time temporary
        password shown right here — relay it to the person manually.
      </p>

      {params.error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      )}
      {tempPassword && (params.created || params.reset) && (
        <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Temporary password (shown once): <code className="font-mono">{tempPassword}</code>
        </p>
      )}
      {params.deleted && (
        <p className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          User removed.
        </p>
      )}

      <table className="mb-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            <th className="py-2">Username</th>
            <th className="py-2">Name</th>
            <th className="py-2">Role</th>
            <th className="py-2">Must change password</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-zinc-100">
              <td className="py-2">{u.username}</td>
              <td className="py-2">{u.full_name}</td>
              <td className="py-2">{u.role}</td>
              <td className="py-2">{u.must_change_password ? "Yes" : "No"}</td>
              <td className="flex gap-2 py-2">
                <form action={resetPasswordAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="text-blue-600 hover:underline">
                    Reset password
                  </button>
                </form>
                <form action={deleteUserAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mb-3 text-sm font-semibold">Add a CMS user</h2>
      <form action={createUserAction} className="flex max-w-sm flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Username
          <input
            name="username"
            required
            pattern="[a-z0-9_.-]{3,32}"
            title="3-32 chars: lowercase letters, numbers, dot, dash, underscore"
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name
          <input
            name="fullName"
            required
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Role label
          <input
            name="role"
            defaultValue="editor"
            placeholder="e.g. president, rnd_wing_head, admin"
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Create user
        </button>
      </form>
    </div>
  );
}

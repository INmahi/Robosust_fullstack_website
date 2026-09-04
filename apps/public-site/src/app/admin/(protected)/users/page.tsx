import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { listCmsUsers } from "@/lib/auth/admin-actions";
import {
  alertErrorClass,
  alertSuccessClass,
  alertWarningClass,
  buttonPrimaryClass,
  cardClass,
  inputClass,
  labelClass,
  linkActionClass,
  linkDangerClass,
  pageHeadingClass,
  pageSubtextClass,
} from "@/lib/admin/ui-classes";
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
      <h1 className={pageHeadingClass}>CMS Users</h1>
      <p className={`${pageSubtextClass} mb-6 max-w-xl`}>
        No email, no Supabase-sent mail. New accounts and resets get a one-time temporary
        password shown right here — relay it to the person manually.
      </p>

      {params.error && (
        <p role="alert" className={`${alertErrorClass} mb-4`}>
          {params.error}
        </p>
      )}
      {tempPassword && (params.created || params.reset) && (
        <p className={`${alertWarningClass} mb-4`}>
          Temporary password (shown once): <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono">{tempPassword}</code>
        </p>
      )}
      {params.deleted && <p className={`${alertSuccessClass} mb-4`}>User removed.</p>}

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Must change password</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.username}</td>
                  <td className="px-4 py-3 text-slate-700">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-700 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-slate-700">{u.must_change_password ? "Yes" : "No"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-4">
                      <form action={resetPasswordAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" className={linkActionClass}>
                          <KeyRound size={14} />
                          Reset password
                        </button>
                      </form>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" className={linkDangerClass}>
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-800">Add a CMS user</h2>
      <form action={createUserAction} className={`${cardClass} flex max-w-sm flex-col gap-4`}>
        <label className={labelClass}>
          Username
          <input
            name="username"
            required
            pattern="[a-z0-9._-]{3,32}"
            title="3-32 chars: lowercase letters, numbers, dot, dash, underscore"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Full name
          <input name="fullName" required className={inputClass} />
        </label>
        <label className={labelClass}>
          Role label
          <input
            name="role"
            defaultValue="editor"
            placeholder="e.g. president, rnd_wing_head, admin"
            className={inputClass}
          />
        </label>
        <button type="submit" className={`${buttonPrimaryClass} mt-2 self-start`}>
          <UserPlus size={16} />
          Create user
        </button>
      </form>
    </div>
  );
}

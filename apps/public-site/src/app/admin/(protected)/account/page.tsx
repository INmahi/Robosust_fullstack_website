import { requireCmsUser } from "@/lib/auth/guard";
import {
  alertErrorClass,
  alertSuccessClass,
  buttonPrimaryClass,
  cardClass,
  inputClass,
  labelClass,
  pageHeadingClass,
  pageSubtextClass,
} from "@/lib/admin/ui-classes";
import { changePasswordAction } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireCmsUser();
  const { error, success } = await searchParams;

  return (
    <div className="max-w-md">
      <h1 className={pageHeadingClass}>Account</h1>
      <p className={`${pageSubtextClass} mb-6`}>
        Signed in as <strong className="font-medium text-slate-700">{user.username}</strong> ({user.full_name})
      </p>

      {error && (
        <p role="alert" className={`${alertErrorClass} mb-4`}>
          {error}
        </p>
      )}
      {success && <p className={`${alertSuccessClass} mb-4`}>Password updated.</p>}

      <form action={changePasswordAction} className={`${cardClass} flex flex-col gap-4`}>
        <label className={labelClass}>
          Current password
          <input name="currentPassword" type="password" required className={inputClass} />
        </label>
        <label className={labelClass}>
          New password
          <input name="newPassword" type="password" required minLength={8} className={inputClass} />
        </label>
        <label className={labelClass}>
          Confirm new password
          <input name="confirmPassword" type="password" required minLength={8} className={inputClass} />
        </label>
        <button type="submit" className={`${buttonPrimaryClass} mt-2 self-start`}>
          Update password
        </button>
      </form>
    </div>
  );
}

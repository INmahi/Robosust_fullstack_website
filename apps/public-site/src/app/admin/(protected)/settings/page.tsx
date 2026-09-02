import { getSiteSettings } from "@/lib/content/site-settings";
import { updateSiteSettingsAction } from "./actions";

const fields: { key: string; label: string; type?: string }[] = [
  { key: "site_name", label: "Site name" },
  { key: "tagline", label: "Tagline" },
  { key: "logo_url", label: "Logo URL" },
  { key: "favicon_url", label: "Favicon URL" },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_youtube", label: "YouTube URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "contact_address", label: "Contact address" },
  { key: "map_embed_url", label: "Map embed URL" },
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const [settings, { success }] = await Promise.all([getSiteSettings(), searchParams]);

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-lg font-semibold">Site Settings</h1>
      <p className="mb-6 text-sm text-zinc-500">
        The single global row every page&apos;s shell (navbar, footer, contact block) reads from.
      </p>

      {success && (
        <p className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Saved.
        </p>
      )}

      <form action={updateSiteSettingsAction} className="flex flex-col gap-3">
        {fields.map((field) => (
          <label key={field.key} className="flex flex-col gap-1 text-sm font-medium">
            {field.label}
            <input
              name={field.key}
              defaultValue={(settings as Record<string, unknown>)[field.key] as string | undefined ?? ""}
              className="rounded border border-zinc-300 px-3 py-2 font-normal"
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            name="recruitment_open"
            type="checkbox"
            defaultChecked={settings.recruitment_open}
          />
          Recruitment open
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}

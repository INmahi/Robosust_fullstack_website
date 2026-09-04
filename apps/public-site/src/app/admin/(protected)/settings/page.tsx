import { getSiteSettings } from "@/lib/content/site-settings";
import { ImageUrlField } from "@/components/admin/image-url-field";
import {
  alertSuccessClass,
  buttonPrimaryClass,
  cardClass,
  inputClass,
  labelClass,
  pageHeadingClass,
  pageSubtextClass,
} from "@/lib/admin/ui-classes";
import { updateSiteSettingsAction } from "./actions";

const textFields: { key: string; label: string }[] = [
  { key: "site_name", label: "Site name" },
  { key: "tagline", label: "Tagline" },
];

const socialFields: { key: string; label: string }[] = [
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_youtube", label: "YouTube URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "social_github", label: "GitHub URL" },
  { key: "social_whatsapp", label: "WhatsApp URL (e.g. https://wa.me/8801...)" },
];

const contactFields: { key: string; label: string }[] = [
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
  const value = (key: string) => ((settings as Record<string, unknown>)[key] as string | undefined) ?? "";

  return (
    <div className="max-w-2xl">
      <h1 className={pageHeadingClass}>Site Settings</h1>
      <p className={`${pageSubtextClass} mb-6`}>
        The single global row every page&apos;s shell (navbar, hero social icons, footer, contact block) reads
        from — social links only need updating here, once, to change everywhere they appear.
      </p>

      {success && <p className={`${alertSuccessClass} mb-4`}>Saved.</p>}

      <form action={updateSiteSettingsAction} className="flex flex-col gap-6">
        <section className={`${cardClass} flex flex-col gap-4`}>
          <h2 className="text-sm font-semibold text-slate-800">Identity</h2>
          {textFields.map((field) => (
            <label key={field.key} className={labelClass}>
              {field.label}
              <input name={field.key} defaultValue={value(field.key)} className={inputClass} />
            </label>
          ))}
          <ImageUrlField name="logo_url" label="Logo" defaultValue={value("logo_url")} />
          <ImageUrlField name="favicon_url" label="Favicon" defaultValue={value("favicon_url")} />
          <ImageUrlField
            name="background_image_url"
            label="Site background image"
            defaultValue={value("background_image_url")}
          />
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <h2 className="text-sm font-semibold text-slate-800">Social links</h2>
          {socialFields.map((field) => (
            <label key={field.key} className={labelClass}>
              {field.label}
              <input name={field.key} defaultValue={value(field.key)} className={inputClass} />
            </label>
          ))}
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <h2 className="text-sm font-semibold text-slate-800">Contact</h2>
          {contactFields.map((field) => (
            <label key={field.key} className={labelClass}>
              {field.label}
              <input name={field.key} defaultValue={value(field.key)} className={inputClass} />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name="recruitment_open"
              type="checkbox"
              defaultChecked={settings.recruitment_open}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
            />
            Recruitment open
          </label>
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <h2 className="text-sm font-semibold text-slate-800">Footer</h2>
          <label className={labelClass}>
            Footer note
            <textarea
              name="footer_note"
              defaultValue={value("footer_note")}
              rows={3}
              className={inputClass}
            />
          </label>
        </section>

        <button type="submit" className={`${buttonPrimaryClass} self-start`}>
          Save
        </button>
      </form>
    </div>
  );
}

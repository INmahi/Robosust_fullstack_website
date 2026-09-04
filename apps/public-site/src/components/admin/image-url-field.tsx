"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { uploadImageAction } from "@/lib/storage/actions";
import { inputClass, labelClass } from "@/lib/admin/ui-classes";

// Text input (paste any URL) plus an optional file upload that fills it in
// via Cloudflare R2 — the two paths write to the same field, so nothing
// downstream (src/lib/content/*, public pages) needs to know which was used.
// Shared by the generic content form and the site-settings singleton form.
export function ImageUrlField({
  name,
  label,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      // Checked against `undefined`, not truthiness — see the same pattern
      // (and why) in app/admin/(protected)/users/actions.ts.
      if (result.error !== undefined) {
        setError(result.error);
      } else {
        setValue(result.url);
      }
    });
  }

  return (
    <label className={labelClass}>
      {label}
      <div className="flex gap-3">
        {value && (
          // Admin-only preview thumbnail — plain <img>, not next/image, to
          // avoid needing a remotePatterns entry for every bucket someone points this at.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
          />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <input
            name={name}
            type="text"
            required={required}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://... or upload a file below"
            className={inputClass}
          />
          <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600">
            <UploadCloud size={14} />
            {isPending ? "Uploading…" : "Upload a file"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isPending}
              className="sr-only"
            />
          </label>
        </div>
      </div>
      {error && (
        <span role="alert" className="text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

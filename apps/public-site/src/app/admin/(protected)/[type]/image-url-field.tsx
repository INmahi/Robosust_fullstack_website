"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { uploadImageAction } from "@/lib/storage/actions";

// Text input (paste any URL) plus an optional file upload that fills it in
// via Cloudflare R2 — the two paths write to the same field, so nothing
// downstream (src/lib/content/*, public pages) needs to know which was used.
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
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        name={name}
        type="text"
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://... or upload a file below"
        className="rounded border border-zinc-300 px-3 py-2 font-normal"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isPending}
        className="text-xs font-normal"
      />
      {isPending && <span className="text-xs font-normal text-zinc-500">Uploading…</span>}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
      {value && (
        // Admin-only preview thumbnail — plain <img>, not next/image, to
        // avoid needing a remotePatterns entry for every bucket someone points this at.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-1 h-20 w-20 rounded border border-zinc-200 object-cover" />
      )}
    </label>
  );
}

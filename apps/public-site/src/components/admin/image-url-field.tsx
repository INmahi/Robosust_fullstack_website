"use client";

import { useId, useRef, useState, useTransition, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { uploadImageAction } from "@/lib/storage/actions";
import { inputClass, labelClass } from "@/lib/admin/ui-classes";

// Text input (paste any URL) plus an optional file upload that fills it in
// via Cloudflare R2 — the two paths write to the same field, so nothing
// downstream (src/lib/content/*, public pages) needs to know which was used.
// Shared by the generic content form and the site-settings singleton form.
//
// Structure note — the upload control has broken twice, so don't "simplify"
// it back. Originally the whole field was one <label> with the file input's
// own <label> nested inside it: nested labels are invalid HTML, and the outer
// one owns the first control inside it (the text input), so a click on
// "Upload a file" could be claimed by the outer label and never reach the
// file input. Un-nesting them wasn't enough on its own either, so the trigger
// is now a plain <button> that calls .click() on the input through a ref —
// that depends on neither label association nor the browser's label
// activation behaviour. Chromium tolerated both broken versions, which is why
// this kept looking fine locally while being dead in the field.
export function ImageUrlField({
  name,
  label,
  required,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  /** Recommended dimensions for this specific slot — shown right where the
   * upload happens, since that's the one place someone can't miss it. */
  hint?: string;
}) {
  const fieldId = useId();
  const fileId = `${fieldId}-file`;
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    <div className={labelClass}>
      <label htmlFor={fieldId}>{label}</label>
      {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
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
            id={fieldId}
            name={name}
            type="text"
            required={required}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://... or upload a file below"
            className={inputClass}
          />
          {/* A real <button> that clicks the input itself, rather than a
              <label htmlFor>. Label activation is the part that has already
              failed here once, and it depends on correct association plus the
              browser's label-activation behaviour; calling .click() on the
              input directly depends on neither. type="button" so it can't
              submit the form it sits in. */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 ${
              isPending ? "cursor-wait opacity-70" : ""
            }`}
          >
            <UploadCloud size={15} />
            {isPending ? "Uploading…" : "Upload a file"}
          </button>
          <input
            ref={fileInputRef}
            id={fileId}
            type="file"
            // HEIC/HEIF are what phone cameras produce and the server rejects
            // them, so don't offer them in the picker in the first place.
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            disabled={isPending}
            className="sr-only"
          />
        </div>
      </div>
      {error && (
        <span role="alert" className="text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

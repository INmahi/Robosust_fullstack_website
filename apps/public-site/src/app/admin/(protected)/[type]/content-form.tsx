import type { FieldConfig } from "@/lib/admin/content-types";
import type { GenericRow } from "@/lib/admin/generic-store";
import { listRows } from "@/lib/admin/generic-store";
import { fieldValueToInputString } from "@/lib/admin/form-parsing";
import { inputClass, labelClass } from "@/lib/admin/ui-classes";
import { ImageUrlField } from "@/components/admin/image-url-field";

// Renders one input per field config. Shared by the new and edit routes so
// both stay in sync as content-types.ts grows. Async because "reference"
// fields fetch their options table (e.g. gallery_images.album_id lists real
// albums instead of asking someone to paste a UUID).
export async function ContentFormFields({
  fields,
  row,
}: {
  fields: FieldConfig[];
  row?: GenericRow;
}) {
  const rendered = await Promise.all(
    fields.map(async (field) => {
      const value = row ? fieldValueToInputString(field.kind, row[field.key]) : "";

      if (field.kind === "boolean") {
        return (
          <label key={field.key} className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name={field.key}
              type="checkbox"
              defaultChecked={row ? Boolean(row[field.key]) : false}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
            />
            {field.label}
          </label>
        );
      }

      if (field.kind === "image-url") {
        return (
          <ImageUrlField
            key={field.key}
            name={field.key}
            label={field.label}
            required={field.required}
            defaultValue={value}
          />
        );
      }

      if (field.kind === "select") {
        return (
          <label key={field.key} className={labelClass}>
            {field.label}
            <select name={field.key} required={field.required} defaultValue={value} className={inputClass}>
              <option value="">—</option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        );
      }

      if (field.kind === "reference") {
        const options = field.reference ? await listRows(field.reference.table) : [];
        const labelField = field.reference?.labelField ?? "id";
        return (
          <label key={field.key} className={labelClass}>
            {field.label}
            <select name={field.key} required={field.required} defaultValue={value} className={inputClass}>
              <option value="">—</option>
              {options.map((option) => (
                <option key={String(option.id)} value={String(option.id)}>
                  {String(option[labelField] ?? option.id)}
                </option>
              ))}
            </select>
          </label>
        );
      }

      if (field.kind === "textarea" || field.kind === "json" || field.kind === "string-array") {
        return (
          <label key={field.key} className={labelClass}>
            {field.label}
            {field.kind === "string-array" && (
              <span className="text-xs font-normal text-slate-400">One per line.</span>
            )}
            <textarea
              name={field.key}
              required={field.required}
              defaultValue={value}
              rows={field.kind === "json" ? 6 : 4}
              className={`${inputClass} ${field.kind === "json" ? "font-mono text-xs" : ""}`}
            />
          </label>
        );
      }

      const inputType =
        field.kind === "number"
          ? "number"
          : field.kind === "datetime-local"
            ? "datetime-local"
            : field.kind === "date"
              ? "date"
              : "text";

      return (
        <label key={field.key} className={labelClass}>
          {field.label}
          <input
            name={field.key}
            type={inputType}
            required={field.required}
            defaultValue={value}
            className={inputClass}
          />
        </label>
      );
    }),
  );

  return <>{rendered}</>;
}

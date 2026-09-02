import type { FieldConfig } from "@/lib/admin/content-types";
import type { GenericRow } from "@/lib/admin/generic-store";
import { fieldValueToInputString } from "@/lib/admin/form-parsing";
import { ImageUrlField } from "./image-url-field";

// Renders one <input>/<textarea>/<checkbox> per field config. Shared by the
// new and edit routes so both stay in sync as content-types.ts grows.
export function ContentFormFields({
  fields,
  row,
}: {
  fields: FieldConfig[];
  row?: GenericRow;
}) {
  return (
    <>
      {fields.map((field) => {
        const value = row ? fieldValueToInputString(field.kind, row[field.key]) : "";

        if (field.kind === "boolean") {
          return (
            <label key={field.key} className="flex items-center gap-2 text-sm font-medium">
              <input
                name={field.key}
                type="checkbox"
                defaultChecked={row ? Boolean(row[field.key]) : false}
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

        if (field.kind === "textarea" || field.kind === "json" || field.kind === "string-array") {
          return (
            <label key={field.key} className="flex flex-col gap-1 text-sm font-medium">
              {field.label}
              {field.kind === "string-array" && (
                <span className="text-xs font-normal text-zinc-500">One per line.</span>
              )}
              <textarea
                name={field.key}
                required={field.required}
                defaultValue={value}
                rows={field.kind === "json" ? 6 : 4}
                className="rounded border border-zinc-300 px-3 py-2 font-normal"
              />
            </label>
          );
        }

        const inputType = field.kind === "number" ? "number" : field.kind === "datetime-local" ? "datetime-local" : field.kind === "date" ? "date" : "text";

        return (
          <label key={field.key} className="flex flex-col gap-1 text-sm font-medium">
            {field.label}
            <input
              name={field.key}
              type={inputType}
              required={field.required}
              defaultValue={value}
              className="rounded border border-zinc-300 px-3 py-2 font-normal"
            />
          </label>
        );
      })}
    </>
  );
}

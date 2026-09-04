import type { FieldConfig } from "./content-types";
import type { GenericRow } from "./generic-store";

// FormData -> a row object shaped for Supabase, based on each field's kind.
// Centralized here so the generic new/edit forms don't hand-roll parsing per type.
export function parseFormValues(fields: FieldConfig[], formData: FormData): GenericRow {
  const row: GenericRow = {};

  for (const field of fields) {
    const raw = formData.get(field.key);

    switch (field.kind) {
      case "boolean": {
        row[field.key] = raw === "on" || raw === "true";
        break;
      }
      case "number": {
        // An empty optional number field is omitted, not sent as null: several
        // number columns (sort_order, on every table) are NOT NULL with a
        // DEFAULT — an explicit null in the payload overrides that default
        // and the insert/update fails the not-null constraint outright.
        const text = typeof raw === "string" ? raw.trim() : "";
        if (text !== "") row[field.key] = Number(text);
        break;
      }
      case "string-array": {
        const text = typeof raw === "string" ? raw : "";
        row[field.key] = text
          .split(/\r?\n|,/)
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      }
      case "json": {
        const text = typeof raw === "string" ? raw.trim() : "";
        row[field.key] = text === "" ? {} : JSON.parse(text);
        break;
      }
      default: {
        const text = typeof raw === "string" ? raw.trim() : "";
        row[field.key] = text === "" ? null : text;
      }
    }
  }

  return row;
}

export function fieldValueToInputString(kind: FieldConfig["kind"], value: unknown): string {
  if (value === null || value === undefined) return "";
  if (kind === "string-array" && Array.isArray(value)) return value.join("\n");
  if (kind === "json") return JSON.stringify(value, null, 2);
  return String(value);
}

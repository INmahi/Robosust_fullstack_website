import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, Plus, Inbox } from "lucide-react";
import { getContentTypeConfig, type FieldConfig } from "@/lib/admin/content-types";
import { listRows } from "@/lib/admin/generic-store";
import { buttonPrimaryClass, linkActionClass, linkDangerClass, pageHeadingClass } from "@/lib/admin/ui-classes";
import { deleteRowAction } from "./actions";

export default async function ContentTypeListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = getContentTypeConfig(type);
  if (!config) notFound();

  const rows = await listRows(config.table, config.sortColumn);
  const boundDelete = deleteRowAction.bind(null, type);

  // Table headers drop any "(e.g. ...)" hint the form label carries — useful
  // next to an input, just noise as a column header.
  const columnLabel = (col: string) => (config.fields.find((f) => f.key === col)?.label ?? col).split(" (")[0];

  // reference-kind columns (e.g. gallery_images.album_id) show the real
  // referenced row instead of a raw UUID — one lookup table per referenced
  // table, not per row.
  const referenceMaps = await buildReferenceMaps(config.fields, config.listColumns);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={pageHeadingClass}>{config.label}</h1>
        {config.allowCreate && (
          <Link href={`/admin/${type}/new`} className={buttonPrimaryClass}>
            <Plus size={16} />
            New
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                {config.listColumns.map((col) => (
                  <th key={col} className="px-4 py-3">
                    {columnLabel(col)}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                  {config.listColumns.map((col) => (
                    <td key={col} className="max-w-xs truncate px-4 py-3 text-slate-700">
                      {formatCell(row[col], referenceMaps.get(col))}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/${type}/${row.id}`} className={linkActionClass}>
                        <Pencil size={14} />
                        Edit
                      </Link>
                      {config.allowDelete && (
                        <form action={boundDelete}>
                          <input type="hidden" name="id" value={String(row.id)} />
                          <button type="submit" className={linkDangerClass}>
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={config.listColumns.length + 1} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Inbox size={28} strokeWidth={1.5} />
                      <p className="text-sm">Nothing here yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

async function buildReferenceMaps(
  fields: FieldConfig[],
  listColumns: string[],
): Promise<Map<string, Map<string, string>>> {
  const maps = new Map<string, Map<string, string>>();

  for (const col of listColumns) {
    const field = fields.find((f) => f.key === col);
    if (field?.kind !== "reference" || !field.reference) continue;

    const options = await listRows(field.reference.table);
    const labelField = field.reference.labelField;
    maps.set(col, new Map(options.map((o) => [String(o.id), String(o[labelField] ?? o.id)])));
  }

  return maps;
}

function formatCell(value: unknown, referenceMap?: Map<string, string>): string {
  if (value === null || value === undefined) return "—";
  if (referenceMap) return referenceMap.get(String(value)) ?? String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

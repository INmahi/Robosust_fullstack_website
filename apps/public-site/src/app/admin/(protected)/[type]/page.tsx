import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, Plus, Inbox } from "lucide-react";
import { getContentTypeConfig } from "@/lib/admin/content-types";
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
  const columnLabel = (col: string) => config.fields.find((f) => f.key === col)?.label ?? col;

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
                      {formatCell(row[col])}
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

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

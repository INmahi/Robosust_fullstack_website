import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentTypeConfig } from "@/lib/admin/content-types";
import { listRows } from "@/lib/admin/generic-store";
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{config.label}</h1>
        {config.allowCreate && (
          <Link
            href={`/admin/${type}/new`}
            className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            New
          </Link>
        )}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            {config.listColumns.map((col) => (
              <th key={col} className="py-2 pr-4">
                {col}
              </th>
            ))}
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)} className="border-b border-zinc-100">
              {config.listColumns.map((col) => (
                <td key={col} className="max-w-xs truncate py-2 pr-4">
                  {formatCell(row[col])}
                </td>
              ))}
              <td className="flex gap-3 py-2">
                <Link href={`/admin/${type}/${row.id}`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                {config.allowDelete && (
                  <form action={boundDelete}>
                    <input type="hidden" name="id" value={String(row.id)} />
                    <button type="submit" className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={config.listColumns.length + 1} className="py-6 text-center text-zinc-400">
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

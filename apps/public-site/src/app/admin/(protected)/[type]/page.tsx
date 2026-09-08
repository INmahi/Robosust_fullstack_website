import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Pencil, Trash2, Plus, Inbox } from "lucide-react";
import { getContentTypeConfig, type ContentTypeConfig, type FieldConfig } from "@/lib/admin/content-types";
import { listRows, type GenericRow } from "@/lib/admin/generic-store";
import { buttonPrimaryClass, linkActionClass, linkDangerClass, pageHeadingClass } from "@/lib/admin/ui-classes";
import { deleteRowAction } from "./actions";

type ReferenceMaps = Map<string, Map<string, string>>;

export default async function ContentTypeListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = getContentTypeConfig(type);
  if (!config) notFound();

  const rows = await listRows(config.table, config.sortColumn);
  const referenceMaps = await buildReferenceMaps(config.fields, config.listColumns);

  // Inside a group the grouped column is dropped — it would repeat the heading
  // on every row.
  const groupedColumns = config.listColumns.filter((col) => col !== config.groupBy);
  const groups = config.groupBy ? groupRows(rows, config.groupBy) : null;

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

      {groups ? (
        <div className="flex flex-col gap-3">
          {groups.map(([value, groupRows]) => (
            // Native <details>, not a client component: collapsing needs no
            // JavaScript this way, so the list still works if a chunk fails to
            // load or hydration never happens.
            <details
              key={value}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-400 transition-transform group-open:rotate-90"
                />
                <span className="text-sm font-medium text-slate-800">
                  {groupLabel(value, referenceMaps.get(config.groupBy!))}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {groupRows.length}
                </span>
              </summary>
              <RowTable
                rows={groupRows}
                columns={groupedColumns}
                config={config}
                type={type}
                referenceMaps={referenceMaps}
              />
            </details>
          ))}

          {groups.length === 0 && <EmptyState />}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <RowTable
            rows={rows}
            columns={config.listColumns}
            config={config}
            type={type}
            referenceMaps={referenceMaps}
          />
        </div>
      )}
    </div>
  );
}

function RowTable({
  rows,
  columns,
  config,
  type,
  referenceMaps,
}: {
  rows: GenericRow[];
  columns: string[];
  config: ContentTypeConfig;
  type: string;
  referenceMaps: ReferenceMaps;
}) {
  const boundDelete = deleteRowAction.bind(null, type);

  // Table headers drop any "(e.g. ...)" hint the form label carries — useful
  // next to an input, just noise as a column header.
  const columnLabel = (col: string) =>
    (config.fields.find((f) => f.key === col)?.label ?? col).split(" (")[0];

  return (
    <div className="overflow-x-auto border-t border-slate-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3">
                {columnLabel(col)}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={String(row.id)}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
            >
              {columns.map((col) => (
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
              <td colSpan={columns.length + 1} className="px-4 py-12 text-center">
                <EmptyState />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
      <Inbox size={28} strokeWidth={1.5} />
      <p className="text-sm">Nothing here yet.</p>
    </div>
  );
}

/** Buckets rows in the order they arrive, so the caller's sort decides group
 *  order. Rows with no value fall into a trailing "Unassigned" bucket rather
 *  than disappearing. */
function groupRows(rows: GenericRow[], key: string): [string, GenericRow[]][] {
  const groups = new Map<string, GenericRow[]>();

  for (const row of rows) {
    const raw = row[key];
    const value = raw === null || raw === undefined || raw === "" ? "Unassigned" : String(raw);
    const bucket = groups.get(value);
    if (bucket) bucket.push(row);
    else groups.set(value, [row]);
  }

  return [...groups.entries()];
}

/** Group headings read as words, not raw column values — and when the grouped
 *  column is a foreign key, as the referenced row's name rather than a UUID. */
function groupLabel(value: string, referenceMap?: Map<string, string>): string {
  const resolved = referenceMap?.get(value) ?? value;
  return resolved.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

async function buildReferenceMaps(
  fields: FieldConfig[],
  listColumns: string[],
): Promise<ReferenceMaps> {
  const maps: ReferenceMaps = new Map();

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

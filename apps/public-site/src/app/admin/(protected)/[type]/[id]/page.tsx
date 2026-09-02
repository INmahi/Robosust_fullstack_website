import { notFound } from "next/navigation";
import { getContentTypeConfig } from "@/lib/admin/content-types";
import { getRow } from "@/lib/admin/generic-store";
import { updateRowAction, deleteRowAction } from "../actions";
import { ContentFormFields } from "../content-form";

export default async function EditContentRowPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const config = getContentTypeConfig(type);
  if (!config) notFound();

  const row = await getRow(config.table, id);
  if (!row) notFound();

  const boundUpdate = updateRowAction.bind(null, type);
  const boundDelete = deleteRowAction.bind(null, type);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-lg font-semibold">Edit {config.label.replace(/s$/, "")}</h1>
      <form action={boundUpdate} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <ContentFormFields fields={config.fields} row={row} />
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Save
          </button>
        </div>
      </form>

      {config.allowDelete && (
        <form action={boundDelete} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Delete this {config.label.replace(/s$/, "").toLowerCase()}
          </button>
        </form>
      )}
    </div>
  );
}

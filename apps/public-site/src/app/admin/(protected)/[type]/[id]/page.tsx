import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getContentTypeConfig } from "@/lib/admin/content-types";
import { getRow } from "@/lib/admin/generic-store";
import { buttonPrimaryClass, cardClass, linkDangerClass, pageHeadingClass } from "@/lib/admin/ui-classes";
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
    <div className="max-w-xl">
      <Link
        href={`/admin/${type}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        {config.label}
      </Link>
      <h1 className={`${pageHeadingClass} mb-6`}>Edit {config.label.replace(/s$/, "")}</h1>
      <form action={boundUpdate} className={`${cardClass} flex flex-col gap-4`}>
        <input type="hidden" name="id" value={id} />
        <ContentFormFields fields={config.fields} row={row} />
        <button type="submit" className={`${buttonPrimaryClass} mt-2 self-start`}>
          Save changes
        </button>
      </form>

      {config.allowDelete && (
        <form action={boundDelete} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={linkDangerClass}>
            <Trash2 size={14} />
            Delete this {config.label.replace(/s$/, "").toLowerCase()}
          </button>
        </form>
      )}
    </div>
  );
}

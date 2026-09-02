import { notFound } from "next/navigation";
import { getContentTypeConfig } from "@/lib/admin/content-types";
import { createRowAction } from "../actions";
import { ContentFormFields } from "../content-form";

export default async function NewContentRowPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = getContentTypeConfig(type);
  if (!config || !config.allowCreate) notFound();

  const boundCreate = createRowAction.bind(null, type);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-lg font-semibold">New {config.label.replace(/s$/, "")}</h1>
      <form action={boundCreate} className="flex flex-col gap-3">
        <ContentFormFields fields={config.fields} />
        <button
          type="submit"
          className="mt-2 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Create
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContentTypeConfig } from "@/lib/admin/content-types";
import { buttonPrimaryClass, cardClass, pageHeadingClass } from "@/lib/admin/ui-classes";
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
    <div className="max-w-xl">
      <Link
        href={`/admin/${type}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        {config.label}
      </Link>
      <h1 className={`${pageHeadingClass} mb-6`}>New {config.label.replace(/s$/, "")}</h1>
      <form action={boundCreate} className={`${cardClass} flex flex-col gap-4`}>
        <ContentFormFields fields={config.fields} />
        <button type="submit" className={`${buttonPrimaryClass} mt-2 self-start`}>
          Create
        </button>
      </form>
    </div>
  );
}

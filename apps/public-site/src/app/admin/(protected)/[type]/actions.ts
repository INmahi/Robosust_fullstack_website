"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCmsUser } from "@/lib/auth/guard";
import { getContentTypeConfig } from "@/lib/admin/content-types";
import { createRow, updateRow, deleteRow } from "@/lib/admin/generic-store";
import { parseFormValues } from "@/lib/admin/form-parsing";

// Server Functions are reachable by direct POST, not just from these forms —
// every action re-checks auth itself rather than trusting the page guard.
export async function createRowAction(typeSlug: string, formData: FormData) {
  await requireCmsUser();
  const config = getContentTypeConfig(typeSlug);
  if (!config || !config.allowCreate) notFound();

  const values = parseFormValues(config.fields, formData);
  await createRow(config.table, values);

  revalidatePath(`/admin/${typeSlug}`);
  redirect(`/admin/${typeSlug}`);
}

export async function updateRowAction(typeSlug: string, formData: FormData) {
  await requireCmsUser();
  const config = getContentTypeConfig(typeSlug);
  if (!config) notFound();

  const id = String(formData.get("id") ?? "");
  const values = parseFormValues(config.fields, formData);
  await updateRow(config.table, id, values);

  revalidatePath(`/admin/${typeSlug}`);
  redirect(`/admin/${typeSlug}`);
}

export async function deleteRowAction(typeSlug: string, formData: FormData) {
  await requireCmsUser();
  const config = getContentTypeConfig(typeSlug);
  if (!config || !config.allowDelete) notFound();

  const id = String(formData.get("id") ?? "");
  await deleteRow(config.table, id);

  revalidatePath(`/admin/${typeSlug}`);
  redirect(`/admin/${typeSlug}`);
}

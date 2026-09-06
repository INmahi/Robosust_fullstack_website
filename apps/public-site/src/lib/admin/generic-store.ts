import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";

// Backs the generic /admin/[type] CRUD screen. Runs through the normal
// cookie-bound server client (not the admin/service-role client), so writes
// go through RLS exactly like any other authenticated cms_user request would
// — this table is never trusted with more access than the policies grant.
// Table names come only from the content-types.ts registry, never from
// unvalidated user input, so there's no injection surface here.
//
// `table` is a runtime string, not a literal from the Database type, so
// supabase-js's `.from()` typing can't specialize here (same limitation
// noted in content/_factory.ts) — cast to `any` at the query boundary only;
// every exported function's own signature stays fully typed.

export type GenericRow = Record<string, unknown>;

async function fromTable(table: string) {
  const supabase = await createServerSupabase();
  return supabase.from(table) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// `sortColumn` accepts several columns so a list can read grouped rather than
// flat — page_sections sorts by page first, then sort_order within the page.
export async function listRows(table: string, sortColumn?: string | string[]): Promise<GenericRow[]> {
  let query = (await fromTable(table)).select("*");
  for (const column of sortColumn ? [sortColumn].flat() : []) {
    query = query.order(column, { ascending: true });
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRow(table: string, id: string): Promise<GenericRow | null> {
  const { data, error } = await (await fromTable(table)).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createRow(table: string, values: GenericRow): Promise<GenericRow> {
  const { data, error } = await (await fromTable(table)).insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateRow(table: string, id: string, values: GenericRow): Promise<GenericRow> {
  const { data, error } = await (await fromTable(table)).update(values).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await (await fromTable(table)).delete().eq("id", id);
  if (error) throw error;
}

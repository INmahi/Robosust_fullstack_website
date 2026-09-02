import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type AgpBlock = Tables<"agp_blocks">;

const base = createContentModule("agp_blocks");

export const listAgpBlocks = base.list; // all blocks, including hidden — admin only
export const getAgpBlockById = base.getById;
export const updateAgpBlock = base.update;
// No create/delete: block_key is a fixed set (see the migration's check constraint) —
// blocks are seeded once, then only content/visible/sort_order change.

export async function getVisibleAgpBlocks(): Promise<AgpBlock[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("agp_blocks")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAgpBlockByKey(blockKey: AgpBlock["block_key"]): Promise<AgpBlock | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("agp_blocks")
    .select("*")
    .eq("block_key", blockKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

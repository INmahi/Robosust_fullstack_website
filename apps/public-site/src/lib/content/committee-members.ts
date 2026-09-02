import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type CommitteeMember = Tables<"committee_members">;

const base = createContentModule("committee_members");

export const listCommitteeMembers = base.list;
export const getCommitteeMemberById = base.getById;
export const createCommitteeMember = base.create;
export const updateCommitteeMember = base.update;
export const deleteCommitteeMember = base.remove;

// Grouped by tier_group (e.g. "Core EC", "R&D", "IT"...) for the Committee
// page's tier-by-tier layout (frontend-overview.md §6.5). tier_group is an
// intentional addition beyond SRS FR-9's literal field list, needed to
// render the grouping the frontend spec asks for.
export async function getCommitteeMembersByTier(): Promise<Record<string, CommitteeMember[]>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("committee_members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return data.reduce<Record<string, CommitteeMember[]>>((byTier, row) => {
    const key = row.tier_group ?? "Unassigned";
    (byTier[key] ??= []).push(row);
    return byTier;
  }, {});
}

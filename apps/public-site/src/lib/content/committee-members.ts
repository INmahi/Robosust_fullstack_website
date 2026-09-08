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

// Flat, ordered list for the /executive-members grid. getCommitteeMembersByTier()
// stays for the tier-by-tier Committee page frontend-overview.md §6.5 describes.
export async function getOrderedCommitteeMembers(): Promise<CommitteeMember[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("committee_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export type CommitteeWing = Tables<"committee_wings">;

/** A wing plus its members already split into the two rows the page renders:
 * heads on top, assistants beneath. */
export type CommitteeWingGroup = CommitteeWing & {
  heads: CommitteeMember[];
  assistants: CommitteeMember[];
};

const wingBase = createContentModule("committee_wings");

export const listCommitteeWings = wingBase.list;
export const createCommitteeWing = wingBase.create;
export const updateCommitteeWing = wingBase.update;
export const deleteCommitteeWing = wingBase.remove;

// The Meet the Team page's whole read path, in two queries rather than one per
// wing. Wings with nobody in them are dropped — an empty wing would render as a
// divider with a blank space under it, and wings are seeded ahead of the people
// who fill them, so this is the normal state early on, not an edge case.
export async function getCommitteeByWings(): Promise<CommitteeWingGroup[]> {
  const supabase = await createServerSupabase();

  const [{ data: wings, error: wingsError }, { data: members, error: membersError }] = await Promise.all([
    supabase.from("committee_wings").select("*").eq("visible", true).order("sort_order", { ascending: true }),
    supabase
      .from("committee_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);
  if (wingsError) throw wingsError;
  if (membersError) throw membersError;

  return wings
    .map((wing) => {
      const inWing = members.filter((member) => member.wing_id === wing.id);
      return {
        ...wing,
        heads: inWing.filter((member) => member.role_level !== "assistant"),
        assistants: inWing.filter((member) => member.role_level === "assistant"),
      };
    })
    .filter((wing) => wing.heads.length > 0 || wing.assistants.length > 0);
}

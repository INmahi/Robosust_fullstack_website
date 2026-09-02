import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type ContactSubmission = Tables<"contact_submissions">;

const base = createContentModule("contact_submissions");

export const listContactSubmissions = base.list; // cms_users only, per RLS
export const updateContactSubmission = base.update;
export const deleteContactSubmission = base.remove;

// The public /contact form's write path — no read access, insert only.
export async function submitContactForm(input: {
  name: string;
  email: string;
  department?: string;
  batch?: string;
  areaOfInterest?: string;
  message?: string;
}): Promise<ContactSubmission> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("contact_submissions")
    .insert({
      name: input.name,
      email: input.email,
      department: input.department,
      batch: input.batch,
      area_of_interest: input.areaOfInterest,
      message: input.message,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

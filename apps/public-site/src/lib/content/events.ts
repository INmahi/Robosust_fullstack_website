import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type Event = Tables<"events">;

const base = createContentModule("events");

export const listEvents = base.list;
export const getEventById = base.getById;
export const createEvent = base.create;
export const updateEvent = base.update;
export const deleteEvent = base.remove;

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getPastEvents(): Promise<Event[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .lt("event_date", new Date().toISOString())
    .order("event_date", { ascending: false });
  if (error) throw error;
  return data;
}

// Featured events drive the homepage pop-up card; registration_open ones are
// what the /events "Register" CTA is really for. Both are just event_type
// buckets — see migration 0006 for why that's one column, not two booleans.
export async function getFeaturedEvents(limit = 3): Promise<Event[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_type", "featured")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

// What the /events page lists: everything still ahead of us, soonest first,
// plus events whose date isn't set yet — "date to be announced" is a real
// state for a club event and shouldn't hide it. Past events are deliberately
// excluded (an archive view is still deferred, see IMPLEMENTATION_PLAN §5);
// ordering ascending without the filter would put the oldest event first.
export async function getEventsForListing(): Promise<Event[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .or(`event_date.gte.${new Date().toISOString()},event_date.is.null`)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

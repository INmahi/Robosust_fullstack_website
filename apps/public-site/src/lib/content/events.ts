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
    .neq("event_type", "past")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Everything an editor has retired, plus anything whose date has simply gone
// by. Either route into the archive counts: tagging `past` is how you retire an
// event that has no date or ended early, and the date check still catches the
// ones nobody got round to tagging.
export async function getPastEvents(): Promise<Event[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .or(`event_type.eq.past,event_date.lt.${new Date().toISOString()}`)
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
    // No `past` filter needed: an event is in exactly one bucket, so a
    // featured event is by definition not a past one.
    // Undated featured events count. `gte` on a null date excludes the row
    // outright, so a freshly created event whose date isn't set yet would be
    // tagged featured in /admin and silently never appear — which is exactly
    // how this first shipped broken.
    .or(`event_date.gte.${new Date().toISOString()},event_date.is.null`)
    .order("event_date", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// What the /events page lists: everything still ahead of us, soonest first,
// plus events whose date isn't set yet — "date to be announced" is a real
// state for a club event and shouldn't hide it. Past events are deliberately
// excluded (an archive view is still deferred, see IMPLEMENTATION_PLAN §5);
// ordering ascending without the filter would put the oldest event first.
export async function getEventsForListing(limit?: number): Promise<Event[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("events")
    .select("*")
    // A `past` event is out regardless of what its date says — that is the
    // whole reason the bucket exists.
    .neq("event_type", "past")
    .or(`event_date.gte.${new Date().toISOString()},event_date.is.null`)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });

  if (limit !== undefined) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

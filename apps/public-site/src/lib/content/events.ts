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

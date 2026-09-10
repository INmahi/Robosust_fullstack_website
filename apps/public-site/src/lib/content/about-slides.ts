import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type AboutSlide = Tables<"about_slides">;

const base = createContentModule("about_slides");

export const listAboutSlides = base.list; // includes hidden — admin only
export const getAboutSlideById = base.getById;
export const createAboutSlide = base.create;
export const updateAboutSlide = base.update;
export const deleteAboutSlide = base.remove;

/** Visible slides, rotated so the one flagged in /admin sits in the middle of
 *  the strip, plus that middle position as `focalIndex`.
 *
 *  The rotation is the point. Opening the flagged slide where its sort order
 *  happens to put it would park it against the left edge whenever an editor
 *  flags an early photo — and "start from the middle" is exactly what the flag
 *  is for. Rotating means the choice costs the editor no arithmetic: tick the
 *  box on any photo and it opens dead centre. Order is preserved as a cycle,
 *  which is all a photo strip needs — it isn't a narrative sequence.
 *
 *  Falls back to the first slide when nothing is flagged, so a half-filled
 *  table can't leave the slider pointing at nothing. */
export async function getAboutSlideshow(): Promise<{
  slides: AboutSlide[];
  focalIndex: number;
}> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("about_slides")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (data.length === 0) return { slides: [], focalIndex: 0 };

  const flagged = data.findIndex((slide) => slide.is_focal);
  const focal = flagged === -1 ? 0 : flagged;
  const middle = Math.floor((data.length - 1) / 2);

  // Rotate left by (focal - middle), wrapped, so `focal` lands on `middle`.
  const shift = ((focal - middle) % data.length + data.length) % data.length;
  const slides = [...data.slice(shift), ...data.slice(0, shift)];

  return { slides, focalIndex: middle };
}

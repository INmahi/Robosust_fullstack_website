import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type GalleryAlbum = Tables<"gallery_albums">;
export type GalleryImage = Tables<"gallery_images">;

const albumBase = createContentModule("gallery_albums");
const imageBase = createContentModule("gallery_images");

export const listGalleryAlbums = albumBase.list;
export const getGalleryAlbumById = albumBase.getById;
export const createGalleryAlbum = albumBase.create;
export const updateGalleryAlbum = albumBase.update;
export const deleteGalleryAlbum = albumBase.remove;

export const createGalleryImage = imageBase.create;
export const updateGalleryImage = imageBase.update;
export const deleteGalleryImage = imageBase.remove;

export async function getGalleryAlbumWithImages(
  slug: string,
): Promise<(GalleryAlbum & { images: GalleryImage[] }) | null> {
  const supabase = await createServerSupabase();
  const { data: album, error: albumError } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (albumError) throw albumError;
  if (!album) return null;

  const { data: images, error: imagesError } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true });
  if (imagesError) throw imagesError;

  return { ...album, images };
}

export async function listGalleryImagesForAlbum(albumId: string): Promise<GalleryImage[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

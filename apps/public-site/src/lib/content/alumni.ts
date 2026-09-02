import "server-only";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type Alumnus = Tables<"alumni">;

const base = createContentModule("alumni");

export const listAlumni = base.list;
export const getAlumnusById = base.getById;
export const createAlumnus = base.create;
export const updateAlumnus = base.update;
export const deleteAlumnus = base.remove;

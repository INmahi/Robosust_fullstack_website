import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@robosust/supabase/types";

type TableName = keyof Database["public"]["Tables"];

// Generic CRUD over one table, typed from the shared Database definition.
// Every apps/public-site/src/lib/content/<type>.ts module is built from this
// so the ~15 Phase 1 content types don't each re-implement select/insert/
// update/delete. Any query beyond plain CRUD (public-filtered reads, joins,
// sort order) is added as a named export alongside the factory call in that
// type's own file — see notices.ts / blog-posts.ts for the pattern.
export function createContentModule<T extends TableName>(table: T) {
  type Row = Tables<T>;
  type Insert = TablesInsert<T>;
  type Update = TablesUpdate<T>;

  // supabase-js's `.from()` overloads are designed for a literal table-name
  // argument; passed a generic `T`, its internal type chain collapses to
  // `never` (a known limitation, not a bug in the schema). The `any` here is
  // local to these five calls — every exported function above still has a
  // fully-typed signature via Row/Insert/Update, so callers get real types.
  const from = async () => {
    const supabase = await createServerSupabase();
    return supabase.from(table) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  return {
    async list(): Promise<Row[]> {
      const { data, error } = await (await from()).select("*");
      if (error) throw error;
      return data as Row[];
    },

    async getById(id: string): Promise<Row | null> {
      const { data, error } = await (await from()).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as Row | null) ?? null;
    },

    async create(values: Insert): Promise<Row> {
      const { data, error } = await (await from()).insert(values).select().single();
      if (error) throw error;
      return data as Row;
    },

    async update(id: string, values: Update): Promise<Row> {
      const { data, error } = await (await from()).update(values).eq("id", id).select().single();
      if (error) throw error;
      return data as Row;
    },

    async remove(id: string): Promise<void> {
      const { error } = await (await from()).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** The subset of the access token we actually act on. */
export type VerifiedUser = { id: string; email: string | null };

// Derived from getClaims()'s own signature rather than hand-written: auth-js
// doesn't export its JWK type, and this can't drift from the library.
type GetClaimsOptions = NonNullable<
  Parameters<SupabaseClient<Database>["auth"]["getClaims"]>[1]
>;
type Jwks = NonNullable<GetClaimsOptions["jwks"]>;

// `supabase.auth.getUser()` is a network call to the Auth server on *every*
// invocation — and this project's Postgres lives in ap-northeast-1 while the
// deployed function runs in us-east-2, so each one costs a Pacific crossing.
// `getClaims()` instead verifies the token's signature locally with WebCrypto,
// which is why the project's asymmetric (ES256) signing keys matter: with a
// symmetric secret, getClaims() silently falls back to getUser() and we'd gain
// nothing.
//
// The JWKS is cached *here*, at module scope, deliberately. auth-js caches it
// too, but on the client object — and @supabase/ssr builds a fresh client per
// request, so without this cache every verification would refetch
// .well-known/jwks.json and we'd have swapped one round trip for another.
// Module scope survives for the life of a warm server instance.
let cachedJwks: Jwks | null = null;
let cachedAt = 0;
const JWKS_TTL_MS = 10 * 60 * 1000;

async function loadJwks(): Promise<Jwks | undefined> {
  const now = Date.now();
  if (cachedJwks && cachedAt + JWKS_TTL_MS > now) return cachedJwks;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;

  try {
    const response = await fetch(`${url}/auth/v1/.well-known/jwks.json`);
    if (!response.ok) return undefined;

    const data = (await response.json()) as Jwks;
    if (!data?.keys?.length) return undefined;

    cachedJwks = data;
    cachedAt = now;
    return data;
  } catch {
    // Network trouble reaching the JWKS endpoint: fall through with undefined
    // so getClaims() does its own fetch rather than failing the request.
    return undefined;
  }
}

/**
 * The signed-in user, verified from the access token without calling the Auth
 * server. Returns null when there is no session or the token doesn't verify.
 *
 * Reading the session still refreshes an expired token (and writes the new
 * cookie through the client's setAll), so this is a drop-in for the
 * `getUser()` call the @supabase/ssr middleware pattern prescribes.
 */
export async function getVerifiedUser(
  supabase: SupabaseClient<Database>,
): Promise<VerifiedUser | null> {
  const jwks = await loadJwks();

  const { data, error } = await supabase.auth.getClaims(undefined, jwks ? { jwks } : undefined);
  if (error || !data?.claims?.sub) return null;

  return {
    id: String(data.claims.sub),
    email: typeof data.claims.email === "string" ? data.claims.email : null,
  };
}

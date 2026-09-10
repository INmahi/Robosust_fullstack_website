import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getVerifiedUser } from "./claims";
import type { Database } from "./database.types";

// Refreshes the Supabase auth cookie on every request so server components
// always see a valid session. Call from apps/public-site/src/middleware.ts.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touches the session so an expired access token gets refreshed. Verifies
  // the token locally rather than with auth.getUser(), which would be a network
  // call to the Auth server on every single matched request — see claims.ts.
  await getVerifiedUser(supabase);

  return response;
}

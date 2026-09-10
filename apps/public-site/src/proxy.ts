import { updateSession } from "@robosust/supabase/middleware";
import type { NextRequest } from "next/server";

// Next.js 16 renamed the `middleware` file convention to `proxy` — same
// mechanism, new name/export. Refreshes the Supabase auth cookie so Server
// Components always see a valid session.
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Scoped to /admin, not the whole site. Public pages read anon data under RLS
// and have no session to refresh, so matching them only added a Supabase call
// to every public page view. /admin is the entire authenticated surface, and
// the login page lives under it too.
export const config = {
  matcher: ["/admin/:path*"],
};

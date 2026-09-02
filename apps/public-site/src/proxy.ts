import { updateSession } from "@robosust/supabase/middleware";
import type { NextRequest } from "next/server";

// Next.js 16 renamed the `middleware` file convention to `proxy` — same
// mechanism, new name/export. Refreshes the Supabase auth cookie on every
// request so Server Components always see a valid session.
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

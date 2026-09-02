// One-off seed script for the 3 initial CMS users (admin/president/RND wing
// head, per the plan). Edit the USERS array below with real names, then run:
//
//   node --env-file=.env.local scripts/seed-cms-users.mjs
//
// Requires apps/public-site/supabase/migrations/0001_init.sql to already be
// applied (the cms_users table must exist). Prints each temp password once —
// relay it to that person manually; they'll be forced to change it on first
// login (must_change_password).
//
// Must match src/lib/auth/username.ts's synthetic-email domain — nothing is
// ever sent to this address, Supabase Auth just requires an email shape.
const SYNTHETIC_EMAIL_DOMAIN = "cms.internal.robosust";

const USERS = [
  { username: "admin", fullName: "CHANGE ME — System Admin", role: "admin" },
  { username: "president", fullName: "CHANGE ME — President", role: "president" },
  { username: "rnd_wing_head", fullName: "CHANGE ME — R&D Wing Head", role: "rnd_wing_head" },
];

function generateTempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16);
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in the environment.");
    console.error("Run with: node --env-file=.env.local scripts/seed-cms-users.mjs");
    process.exit(1);
  }

  const admin = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const user of USERS) {
    const email = `${user.username.toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
    const tempPassword = generateTempPassword();

    const { data: authUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) {
      console.error(`[skip] ${user.username}: ${createError.message}`);
      continue;
    }

    const { error: insertError } = await admin.from("cms_users").insert({
      id: authUser.user.id,
      username: user.username.toLowerCase(),
      email,
      full_name: user.fullName,
      role: user.role,
      must_change_password: true,
    });

    if (insertError) {
      console.error(`[error] ${user.username}: cms_users insert failed — ${insertError.message}`);
      await admin.auth.admin.deleteUser(authUser.user.id);
      continue;
    }

    console.log(`[ok] ${user.username} — temp password: ${tempPassword}`);
  }
}

main();

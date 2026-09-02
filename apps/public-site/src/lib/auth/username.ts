// Supabase Auth requires an email-shaped identifier even though we never
// send mail to it. This domain is not routable/deliverable on purpose.
const SYNTHETIC_EMAIL_DOMAIN = "cms.internal.robosust";

export function usernameToSyntheticEmail(username: string): string {
  return `${username.toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

export function generateTempPassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16);
}

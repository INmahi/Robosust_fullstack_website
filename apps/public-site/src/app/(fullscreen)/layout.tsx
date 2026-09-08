import { PublicShell } from "@/components/public/public-shell";

// Same chrome as (public), minus the footer and the back-to-top button. A
// Server Component layout can't branch on the child route, so "one viewport,
// no footer" has to be its own route group rather than a flag passed down.
// Route groups don't appear in the URL, so /join-us is unchanged.
export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell footer={false}>{children}</PublicShell>;
}

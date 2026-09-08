// Two stacked copies of the same artwork — the silver one underneath, the gold
// one on top revealed left-to-right by a clip-path wipe. The illusion only
// holds because both files are cropped to one shared bounding box (382x103):
// any geometry drift between them shows up as the logo jumping on hover.
//
// No "use client": this is pure CSS group-hover, so it stays a Server
// Component. next/link rather than <a> because eslint's
// no-html-link-for-pages flags a raw <a href="/">. The originals (nav-logo.png / nav-logo-hover.png, 500x500 with
// ~75% transparent padding) are kept in public/ but not used here — the -trim
// pair is what makes the wipe line up and the header sizing sane.
import Link from "next/link";

const LOGO_ASPECT = "aspect-[382/103]";

export function SiteLogo({ className = "h-[46px]" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="RoboSUST — home"
      className={`group relative block w-auto ${LOGO_ASPECT} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image is
          deliberately unused across the public site (CLAUDE.md "Known gaps"). */}
      <img src="/nav-logo-trim.png" alt="RoboSUST" className="h-full w-auto" />
      {/* inset(0 100% 0 0) clips everything away from the right; animating the
          right inset to 0 sweeps the reveal left → right. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/nav-logo-hover-trim.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-auto [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-500 ease-out group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none motion-reduce:duration-0"
      />
    </Link>
  );
}

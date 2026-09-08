import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { getRecruitment, type RecruitmentStatus } from "@/lib/content/recruitment";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("join-us", {
    title: "Join Us",
    description: "Recruitment status and how to join RoboSUST.",
  });
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  // Date-only column, so parse as UTC — `new Date("2027-03-01")` is already UTC
  // midnight, and formatting it in a behind-UTC zone would show 28 February.
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Each status decides its own headline, which date is the relevant one, and
// where the call to action goes. Copy lives here rather than in the CMS because
// it's the page's structure, not content — an editor sets the status and the
// dates, and the wording follows.
function present(status: RecruitmentStatus, closesOn: string | null, opensOn: string | null) {
  switch (status) {
    case "running":
      return {
        badge: "Recruitment open",
        headline: "Recruitment is",
        accent: "open right now.",
        dateLabel: "Applications close",
        date: formatDate(closesOn),
        body: "Bring curiosity and a willingness to build — the rest we work out together.",
      };
    case "opening_soon":
      return {
        badge: "Opening soon",
        headline: "Recruitment opens",
        accent: "soon.",
        dateLabel: "Applications open",
        date: formatDate(opensOn),
        body: "Meanwhile, you can always check our current and upcoming events — most of what we build starts at one of them.",
      };
    case "closed":
    default:
      return {
        badge: "Recruitment status",
        headline: "Recruitment is",
        accent: "currently closed.",
        dateLabel: "Next possible intake",
        date: formatDate(opensOn),
        body: "Meanwhile, you can always check our current and upcoming events — most of what we build starts at one of them.",
      };
  }
}

export default async function JoinUsPage() {
  const recruitment = await getRecruitment();
  const status: RecruitmentStatus = recruitment?.status ?? "closed";
  const view = present(status, recruitment?.closes_on ?? null, recruitment?.opens_on ?? null);

  // The Apply button only appears when applications are actually open AND a
  // link exists — a status of "running" with no URL yet would otherwise render
  // a button going nowhere.
  const applyHref = status === "running" ? recruitment?.registration_url : null;

  return (
    // Exactly one viewport minus the header, and no taller: overflow-hidden
    // rather than min-height, so nothing can push this into scrolling. Every
    // size below is clamped or has a smaller mobile step, because on a short
    // phone the content has to shrink to fit rather than overflow.
    <section className="relative flex h-[calc(100dvh-76px)] flex-col overflow-hidden">
      {/* Blurred on the element with scale-110, not via a backdrop-filter
          overlay: blur() leaves a soft transparent edge at the element's own
          bounds, and the scale pushes that off-screen. The art's own
          #roboticsforglory is painted out of -clean.jpg so the mark below can
          be live text rather than a blurred picture of text. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-[7px]"
        style={{ backgroundImage: "url('/join-us-bg-clean.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#05070c]/72" />
      <div className="grid-pattern absolute inset-0 opacity-25" />

      <div className="container-shell relative flex flex-1 items-center justify-center py-6">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="reveal mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/35 bg-[#0d111a]/70 px-3.5 py-1.5 backdrop-blur sm:mb-6 sm:px-4 sm:py-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "running" ? "bg-[#4ade80]" : "bg-[#d4af37]"
              }`}
            />
            <span className="text-[9px] uppercase tracking-[0.22em] text-[#d4af37] sm:text-[10px]">
              {view.badge}
            </span>
          </div>

          <h1 className="reveal text-[clamp(28px,7vw,68px)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
            {view.headline}
            <br />
            <span className="text-transparent [-webkit-text-stroke:1px_rgba(212,175,55,0.85)]">
              {view.accent}
            </span>
          </h1>

          {view.date && (
            <div className="reveal mx-auto mt-5 flex max-w-[400px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0d111a]/70 px-4 py-3.5 backdrop-blur-sm sm:mt-9 sm:gap-4 sm:px-6 sm:py-5">
              <CalendarDays className="size-5 shrink-0 text-[#d4af37] sm:size-[22px]" />
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#98a1b3] sm:text-[10px]">
                  {view.dateLabel}
                </div>
                <div className="mt-0.5 text-[17px] font-semibold text-white sm:text-[22px]">
                  {view.date}
                </div>
              </div>
            </div>
          )}

          <p className="reveal mx-auto mt-5 max-w-[520px] text-[13px] leading-6 text-[#b6bfce] sm:mt-9 sm:text-[15px] sm:leading-8">
            {recruitment?.note || view.body}
          </p>

          {applyHref ? (
            <a
              href={applyHref}
              target="_blank"
              rel="noreferrer"
              className="reveal mt-5 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-[12px] font-semibold text-[#05070c] transition hover:-translate-y-0.5 hover:bg-[#fdf6e3] sm:mt-8 sm:px-6 sm:py-3.5 sm:text-[13px]"
            >
              Apply now <ArrowUpRight size={16} />
            </a>
          ) : (
            <a
              href="/events"
              className="reveal mt-5 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-[12px] font-semibold text-[#05070c] transition hover:-translate-y-0.5 hover:bg-[#fdf6e3] sm:mt-8 sm:px-6 sm:py-3.5 sm:text-[13px]"
            >
              See our events <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>

      {/* The mark from the original artwork, restored as live text at the
          bottom of the page — sharp, where the background copy was blurred. */}
      <div className="relative pb-5 text-center sm:pb-8">
        <span className="font-[family-name:var(--font-caveat)] text-[22px] text-[#d4af37]/85 sm:text-[30px]">
          #roboticsforglory
        </span>
        <span
          aria-hidden="true"
          className="mx-auto mt-1 block h-px w-[150px] bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent sm:w-[200px]"
        />
      </div>
    </section>
  );
}

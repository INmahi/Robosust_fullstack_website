import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("join-us", {
    title: "Join Us",
    description: "Recruitment status and how to join RoboSUST.",
  });
}

// Deliberately static, not CMS-backed: it is one paragraph with a date in it,
// and wiring it to home_sections would add a row an editor has to find before
// the page makes sense. When recruitment actually opens this becomes a real
// flow (form, deadlines, criteria) and earns its own content model then.
const NEXT_RECRUITMENT = "March 2027";

export default function JoinUsPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-76px)] items-center overflow-hidden py-24">
      {/* Background is blurred at the element, not with a backdrop-filter on an
          overlay: scale-110 hides the soft transparent edge that blur() leaves
          around the element's own bounds. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-[7px]"
        style={{ backgroundImage: "url('/join-us-bg.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#05070c]/72" />
      <div className="grid-pattern absolute inset-0 opacity-25" />

      <div className="container-shell relative">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="reveal mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/35 bg-[#0d111a]/70 px-4 py-2 backdrop-blur">
            <span className="relative flex h-2 w-2">
              {/* A steady dot, not a pulsing one: the status here is "closed",
                  and a blinking indicator reads as something live. */}
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]">
              Recruitment status
            </span>
          </div>

          <h1 className="reveal text-[clamp(38px,6vw,68px)] font-bold leading-[0.98] tracking-[-0.04em] text-white">
            Recruitment is
            <br />
            <span className="text-transparent [-webkit-text-stroke:1px_rgba(212,175,55,0.85)]">
              currently closed.
            </span>
          </h1>

          <div className="reveal mx-auto mt-10 flex max-w-[420px] items-center gap-4 rounded-2xl border border-white/10 bg-[#0d111a]/70 px-6 py-5 backdrop-blur-sm">
            <CalendarDays size={22} className="shrink-0 text-[#d4af37]" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#98a1b3]">
                Next possible intake
              </div>
              <div className="mt-1 text-[22px] font-semibold text-white">{NEXT_RECRUITMENT}</div>
            </div>
          </div>

          <p className="reveal mx-auto mt-10 max-w-[520px] text-[15px] leading-8 text-[#b6bfce]">
            Meanwhile, you can always check our current and upcoming events — most of what we
            build starts at one of them.
          </p>

          <a
            href="/events"
            className="reveal mt-8 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-3.5 text-[13px] font-semibold text-[#05070c] transition hover:-translate-y-0.5 hover:bg-[#fdf6e3]"
          >
            See our events <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

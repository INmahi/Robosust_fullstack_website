import { ArrowUpRight } from "lucide-react";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { HeadingLines } from "./heading-lines";

// The closing band on /projects. Its own layout rather than SectionHeading:
// the reference puts the eyebrow + heading on the left and the CTA link on
// the right baseline, which SectionHeading's description slot can't express.
export async function ProjectsCtaSection() {
  const section = await getHomeSectionByKey("projects_cta");
  const heading = section?.heading || "The next prototype is already taking shape.";
  const ctaText = section?.cta_text || "Join the next event";
  const ctaUrl = section?.cta_url || "/events";

  return (
    <section className="border-t border-white/10 py-[110px]">
      <div className="container-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="reveal">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#8e98aa]">
            {section?.eyebrow || "02 / Keep building"}
          </div>
          <h2 className="mt-3 max-w-[650px] text-[clamp(38px,5vw,68px)] font-bold leading-[0.94] tracking-[-0.05em]">
            <HeadingLines text={heading} />
          </h2>
        </div>
        <a
          href={ctaUrl}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-white transition hover:text-[#3d7cff]"
        >
          {ctaText} <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}

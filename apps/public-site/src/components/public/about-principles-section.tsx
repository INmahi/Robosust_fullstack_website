import { ArrowUpRight } from "lucide-react";
import { getHomeSectionWithItems } from "@/lib/content/home-sections";
import { resolveSectionIcon } from "./section-icons";
import { SectionHeading } from "./section-heading";

// Falls back to the reference frontend's own copy rather than rendering an
// empty shell — the same rule the homepage's singleton-backed sections use.
const defaultPrinciples = [
  {
    id: "curiosity",
    icon: "lightbulb",
    label: "Curiosity first",
    body: "We ask better questions before we reach for an answer, then turn ideas into experiments.",
  },
  {
    id: "build",
    icon: "cpu",
    label: "Build together",
    body: "Hardware, software, design and research move faster when knowledge is shared openly.",
  },
  {
    id: "compete",
    icon: "trophy",
    label: "Compete with purpose",
    body: "Every competition is a chance to sharpen our thinking and represent SUST with pride.",
  },
];

export async function AboutPrinciplesSection() {
  const section = await getHomeSectionWithItems("about_principles");
  const principles = section && section.items.length > 0 ? section.items : defaultPrinciples;

  return (
    <section id="approach" className="py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "02 / Our approach"}
          title={section?.heading || "Learn by\nmaking."}
          description={
            section?.subheading ||
            "The lab is a place to move between theory and practice. A sketch becomes a circuit, a circuit becomes a machine, and a machine teaches us what the sketch missed."
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((principle) => {
            const Icon = resolveSectionIcon(principle.icon);
            return (
              <article
                key={principle.id}
                className="reveal rounded-[22px] border border-white/10 bg-[#0d111a] p-7"
              >
                <Icon size={22} className="text-[#ff3b46]" />
                <h2 className="mt-8 text-[24px] font-semibold">{principle.label}</h2>
                <p className="mt-3 text-[14px] leading-7 text-[#98a1b3]">{principle.body}</p>
              </article>
            );
          })}
        </div>
        {section?.cta_text && section.cta_url && (
          <a
            href={section.cta_url}
            className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-white transition hover:text-[#3d7cff]"
          >
            {section.cta_text} <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </section>
  );
}

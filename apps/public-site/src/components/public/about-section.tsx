import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { SectionHeading } from "./section-heading";

const defaultBackground =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80";
const defaultSecondaryImage =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80";

// Image column first, text panel second, no stat cards — the reference
// frontend reworked this section in cdbb656 and we follow it. The three
// stat rows that used to back the removed grid were deleted from
// home_section_items in migration 0004 so /admin doesn't keep offering
// cards that render nowhere.
export async function AboutSection() {
  const section = await getHomeSectionByKey("about");

  return (
    <section
      id="about"
      className="relative overflow-hidden py-[110px]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,7,12,0.35), rgba(5,7,12,0.72)), url('${section?.background_image_url || defaultBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "About RoboSUST"}
          title={section?.heading || "About RoboSUST"}
          description={section?.subheading}
        />
        <div className="grid gap-[18px] md:grid-cols-[1.15fr_0.85fr]">
          <div
            className="reveal min-h-[380px] rounded-[22px] border border-white/10 bg-cover bg-center"
            style={{ backgroundImage: `url('${section?.secondary_image_url || defaultSecondaryImage}')` }}
          >
            <div className="flex h-full items-end">
              <div className="mb-5 ml-5 rounded-lg bg-black/45 px-3 py-2 text-[10px] tracking-[0.2em] text-white">
                LAB / 01
              </div>
            </div>
          </div>
          <article className="panel reveal rounded-[22px] border border-white/10 bg-[#0d111a] p-[42px]">
            <div className="kicker mb-3 text-[11px] uppercase tracking-[0.18em] text-[#8e98aa]">RoboSUST</div>
            <p className="max-w-[660px] text-[15px] leading-8 text-[#aeb7c7]">
              {section?.body ||
                "Fostering innovation across disciplines, the club empowers members to transform theoretical knowledge into real-world technological solutions. Through hands-on workshops, competitive events, and collaborative projects, RoboSUST nurtures the next generation of engineers, coders, and automation enthusiasts, driving technological advancements and representing the university on national and international robotics platforms."}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

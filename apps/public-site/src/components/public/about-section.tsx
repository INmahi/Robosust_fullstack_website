import { getHomeSectionByKey, listHomeSectionItems } from "@/lib/content/home-sections";
import { SectionHeading } from "./section-heading";

const defaultBackground =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80";
const defaultSecondaryImage =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80";
const defaultStats = [
  { id: "think", value: "01", label: "Think" },
  { id: "build", value: "02", label: "Build" },
  { id: "compete", value: "03", label: "Compete" },
];

export async function AboutSection() {
  const section = await getHomeSectionByKey("about");
  const items = section ? await listHomeSectionItems(section.id) : [];
  const stats = items.length > 0 ? items : defaultStats;

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
          eyebrow={section?.eyebrow || "01 / Who we are"}
          title={section?.heading || "Engineering the next move."}
          description={section?.subheading}
        />
        <div className="grid gap-[18px] md:grid-cols-[1.15fr_0.85fr]">
          <article className="panel reveal rounded-[22px] border border-white/10 bg-[#0d111a] p-[42px]">
            <div className="kicker mb-3 text-[11px] uppercase tracking-[0.18em] text-[#8e98aa]">RoboSUST</div>
            <p className="max-w-[660px] text-[15px] leading-8 text-[#aeb7c7]">
              {section?.body ||
                "We bring students, engineers and makers together around robotics and intelligent systems. From autonomous navigation to competitive machines, the laboratory is a place to turn ambitious concepts into working hardware."}
            </p>
            <div className="mt-10 grid grid-cols-3 gap-2.5">
              {stats.map((stat) => (
                <div key={stat.id} className="rounded-2xl bg-[#090d14] p-[18px]">
                  <strong className="mb-2 block text-[28px] font-bold">{stat.value}</strong>
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[#98a1b3]">{stat.label}</span>
                </div>
              ))}
            </div>
          </article>
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
        </div>
      </div>
    </section>
  );
}

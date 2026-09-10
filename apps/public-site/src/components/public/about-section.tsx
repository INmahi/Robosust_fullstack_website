import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { AboutCounters, getAboutCounters } from "./about-counters";
import { AboutSliderSection } from "./about-slider-section";
import { SectionHeading } from "./section-heading";

const defaultBackground =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80";
const defaultSecondaryImage =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80";

/**
 * Main image on the left, counters stacked beside it, photo strip underneath.
 *
 * Both flags exist because this one section is rendered on two routes that want
 * different halves of it, and a Server Component can't tell which route it is
 * on. The homepage takes the defaults — image, counters and strip, no prose.
 * /about turns the prose on and the strip off, because there the strip is the
 * page's hero and would otherwise appear twice.
 */
export async function AboutSection({
  slider = true,
  body = false,
}: { slider?: boolean; body?: boolean } = {}) {
  const [section, counters] = await Promise.all([
    getHomeSectionByKey("about"),
    getAboutCounters(),
  ]);

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

        {/* Image and counters share a row on desktop and stack on mobile. The
            image column is the wider of the two: it's the anchor, the counters
            read fine narrow. */}
        <div className="grid gap-[18px] lg:grid-cols-[1.35fr_0.65fr]">
          <div
            className="reveal relative min-h-[300px] overflow-hidden rounded-[22px] border border-white/10 bg-cover bg-center lg:min-h-[380px]"
            style={{ backgroundImage: `url('${section?.secondary_image_url || defaultSecondaryImage}')` }}
          >
            <div className="flex h-full items-end">
              <div className="mb-5 ml-5 rounded-lg bg-black/45 px-3 py-2 text-[10px] tracking-[0.2em] text-white">
                LAB / 01
              </div>
            </div>
          </div>

          <AboutCounters counters={counters} className="flex flex-col gap-[18px]" />
        </div>

        {body && (
          <article className="panel reveal mt-[18px] rounded-[22px] border border-white/10 bg-[#0d111a] p-[30px] sm:p-[42px]">
            <div className="kicker mb-3 text-[11px] uppercase tracking-[0.18em] text-[#8e98aa]">RoboSUST</div>
            <p className="max-w-[660px] text-[15px] leading-8 text-[#aeb7c7]">
              {section?.body ||
                "Fostering innovation across disciplines, the club empowers members to transform theoretical knowledge into real-world technological solutions. Through hands-on workshops, competitive events, and collaborative projects, RoboSUST nurtures the next generation of engineers, coders, and automation enthusiasts, driving technological advancements and representing the university on national and international robotics platforms."}
            </p>
          </article>
        )}

        {slider && <AboutSliderSection className="mt-[18px]" />}
      </div>
    </section>
  );
}

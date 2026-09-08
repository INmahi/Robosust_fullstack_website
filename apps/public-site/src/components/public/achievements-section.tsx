import { getRecentAchievements } from "@/lib/content/achievements";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { AchievementSlideshow, type AchievementSlide } from "./achievement-slideshow";
import { SectionHeading } from "./section-heading";

const defaultSectionBackground =
  "https://images.unsplash.com/photo-1564053489984-317bbd7f4a8f?auto=format&fit=crop&w=1800&q=80";

// The reference frontend's own three slides, used only while the achievements
// table is empty — a singleton-backed section falls back to reference copy
// rather than rendering a hollow shell (see CLAUDE.md's empty-state rule).
// Real rows take over the moment an editor adds one in /admin.
const fallbackSlides: AchievementSlide[] = [
  {
    id: "fallback-podium",
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Students presenting a robotics project at a competition",
    label: "Featured milestone",
    title: "From prototype to podium.",
    description:
      "At RoboSUST, every competition result begins with disciplined experimentation. Our teams move from sketches and simulations to tested mechanisms, refining each subsystem until the whole robot performs with confidence.",
  },
  {
    id: "fallback-research",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Robot prototype being tested in a research workspace",
    label: "Research in motion",
    title: "Intelligence in the field.",
    description:
      "Robotics research matters when it leaves the workbench and meets a real environment. Our navigation systems combine sensing, mapping, planning and control to help machines respond intelligently to uncertainty.",
  },
  {
    id: "fallback-people",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Engineering team collaborating around a robotic machine",
    label: "People behind progress",
    title: "Built by shared momentum.",
    description:
      "Strong teams turn difficult problems into shared momentum. Across design reviews, late-night builds and demanding trials, members learn to communicate clearly, challenge assumptions and trust careful measurement.",
  },
];

export async function AchievementsSection() {
  const [section, achievements] = await Promise.all([
    getHomeSectionByKey("achievements"),
    getRecentAchievements(6),
  ]);

  const slides: AchievementSlide[] =
    achievements.length > 0
      ? achievements.map((achievement) => ({
          id: achievement.id,
          image: achievement.image_url || fallbackSlides[0].image,
          imageAlt: achievement.title,
          // The small kicker above the title: the competition it came from
          // reads best, with the year as a second choice.
          label: achievement.competition || (achievement.year ? String(achievement.year) : "Featured milestone"),
          title: achievement.title,
          description: achievement.description || "",
        }))
      : fallbackSlides;

  return (
    <section
      id="achievements"
      className="relative overflow-hidden py-[110px]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,7,12,0.5), rgba(5,7,12,0.82)), url('${section?.background_image_url || defaultSectionBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "03 / Achievements"}
          title={section?.heading || "Proof of progress."}
          description={section?.subheading}
        />
        <AchievementSlideshow slides={slides} />
      </div>
    </section>
  );
}

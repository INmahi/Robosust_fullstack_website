import type { Metadata } from "next";
import { AboutPrinciplesSection } from "@/components/public/about-principles-section";
import { AboutSection } from "@/components/public/about-section";
import { AboutSliderSection } from "@/components/public/about-slider-section";
import { AchievementsSection } from "@/components/public/achievements-section";
import { PageIntro } from "@/components/public/page-intro";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { buildPageMetadata } from "@/lib/seo";

const fallbackIntroImage =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=85";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about", {
    title: "About",
    description:
      "RoboSUST is a student-led robotics community at Shahjalal University of Science and Technology.",
  });
}

export default async function AboutPage() {
  const intro = await getHomeSectionByKey("about_intro");

  return (
    <>
      <PageIntro
        eyebrow={intro?.eyebrow || "01 / The laboratory"}
        title={intro?.heading || "More than a\nrobotics club."}
        description={
          intro?.subheading ||
          "RoboSUST is a student-led community at Shahjalal University of Science and Technology building the skills, systems and friendships that make ambitious robotics possible."
        }
        image={intro?.background_image_url || fallbackIntroImage}
      />

      {/* The photo strip belongs to the hero here, not to the About section
          below — which is why that one is rendered with slider={false}. Same
          rows, same CMS screen, shown once per page. */}
      <AboutSliderSection className="container-shell -mt-px pb-4 pt-12" />

      <div id="content">
        <AboutSection slider={false} body />
        <AboutPrinciplesSection />
        <AchievementsSection />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { ProjectsCtaSection } from "@/components/public/projects-cta-section";
import { ProjectsShelfSection } from "@/components/public/projects-shelf-section";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { buildPageMetadata } from "@/lib/seo";

const fallbackIntroImage =
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1800&q=85";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("projects", {
    title: "Projects",
    description: "Autonomous systems, embedded hardware and research projects built at RoboSUST.",
  });
}

export default async function ProjectsPage() {
  const intro = await getHomeSectionByKey("projects_intro");

  return (
    <>
      <PageIntro
        eyebrow={intro?.eyebrow || "04 / Selected work"}
        title={intro?.heading || "Machines with\na purpose."}
        description={
          intro?.subheading ||
          "Every RoboSUST project starts with a real problem, a curious team and the willingness to test an idea until it works outside the sketchbook."
        }
        image={intro?.background_image_url || fallbackIntroImage}
      />
      <ProjectsShelfSection />
      <ProjectsCtaSection />
    </>
  );
}

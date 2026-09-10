import type { Metadata } from "next";
import { MeetTheTeamSection } from "@/components/public/meet-the-team-section";
import { PageIntro } from "@/components/public/page-intro";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { buildPageMetadata } from "@/lib/seo";

const fallbackIntroImage =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("executive-members", {
    title: "Meet the Team",
    description: "The executive committee guiding RoboSUST's projects, programs and community.",
  });
}

export default async function ExecutiveMembersPage() {
  const intro = await getHomeSectionByKey("committee_intro");

  return (
    <>
      <PageIntro
        eyebrow={intro?.eyebrow || "02 / The people"}
        title={intro?.heading || "Built by\nbuilders."}
        description={
          intro?.subheading ||
          "Meet the executive team guiding RoboSUST's projects, programs and community. Their job is to keep the lab moving and make room for the next idea."
        }
        image={intro?.background_image_url || fallbackIntroImage}
        // Required, not cosmetic — see PageIntro's `snap` prop. Without it the
        // mandatory snapping on this page scrolls straight past the hero.
        snap
      />
      <MeetTheTeamSection />
    </>
  );
}

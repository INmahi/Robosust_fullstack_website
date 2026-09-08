import { AboutSection } from "@/components/public/about-section";
import { AchievementsSection } from "@/components/public/achievements-section";
import { BlogSection } from "@/components/public/blog-section";
import { EventsSection } from "@/components/public/events-section";
import { FeaturedEventAlert } from "@/components/public/featured-event-alert";
import { HeroSection } from "@/components/public/hero-section";
import { ProjectsSection } from "@/components/public/projects-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EventsSection />
      <AboutSection />
      <ProjectsSection />
      <AchievementsSection />
      <BlogSection />
      <FeaturedEventAlert />
    </>
  );
}

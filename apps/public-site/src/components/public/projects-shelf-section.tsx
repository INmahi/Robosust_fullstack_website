import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { getAllProjects } from "@/lib/content/projects";
import { ProjectCard } from "./project-card";
import { SectionHeading } from "./section-heading";

// The full project shelf on /projects — every project, where the homepage's
// ProjectsSection shows only the three flagged flagship.
export async function ProjectsShelfSection() {
  const [section, projects] = await Promise.all([
    getHomeSectionByKey("projects_shelf"),
    getAllProjects(),
  ]);
  if (projects.length === 0) return null;

  return (
    <section id="content" className="py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "01 / The project shelf"}
          title={section?.heading || "What we\nbuild."}
          description={
            section?.subheading ||
            "From autonomous navigation to human-robot interaction, our work brings together electronics, mechanics, software and a lot of iteration."
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              category={project.category || "Project"}
              title={project.title}
              description={project.description || ""}
              image={project.cover_image_url || project.images[0] || ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

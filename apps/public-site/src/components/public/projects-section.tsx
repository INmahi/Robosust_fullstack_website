import { getFlagshipProjects } from "@/lib/content/projects";
import { ProjectCard } from "./project-card";
import { SectionHeading } from "./section-heading";

export async function ProjectsSection() {
  const projects = await getFlagshipProjects(3);
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="py-[110px]">
      <div className="container-shell">
        <SectionHeading eyebrow="02 / Selected work" title="What we build." />
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

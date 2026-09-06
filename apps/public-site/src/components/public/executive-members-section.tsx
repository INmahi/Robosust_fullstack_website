import { Mail } from "lucide-react";
import { getOrderedCommitteeMembers } from "@/lib/content/committee-members";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { SectionHeading } from "./section-heading";
import { LinkedinIcon } from "./social-icons";

export async function ExecutiveMembersSection() {
  const [section, members] = await Promise.all([
    getHomeSectionByKey("committee_list"),
    getOrderedCommitteeMembers(),
  ]);
  if (members.length === 0) return null;

  return (
    <section id="content" className="py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "03 / Executive committee"}
          title={section?.heading || "The team\nbehind the work."}
          description={
            section?.subheading ||
            "A small team with a shared responsibility: create an environment where members can learn quickly, collaborate generously and take on difficult problems."
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => {
            const accent = String(index + 1).padStart(2, "0");
            return (
              <article
                key={member.id}
                // The photo becomes the card's own background under a heavy
                // gradient (the same treatment the featured-milestone card
                // uses), so a member without a photo falls back to exactly
                // the reference's flat panel rather than a broken image.
                className="reveal group relative min-h-[300px] overflow-hidden rounded-[22px] border border-white/10 bg-[#0d111a] bg-cover bg-center p-7 transition duration-300 hover:-translate-y-1 hover:border-[#3d7cff]/45"
                style={
                  member.photo_url
                    ? {
                        backgroundImage: `linear-gradient(0deg,#090c13 34%,rgba(9,12,19,.45)), url('${member.photo_url}')`,
                      }
                    : undefined
                }
              >
                <div className="relative flex items-start justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-[#7f899b]">
                  <span>{accent}</span>
                  <span>{member.tier_group || "RoboSUST"}</span>
                </div>
                <div className="absolute -right-4 top-14 text-[150px] font-bold leading-none text-white/[0.035]">
                  {accent}
                </div>
                <div className="relative mt-24">
                  <h2 className="text-[25px] font-semibold">{member.name}</h2>
                  <p className="mt-3 max-w-[240px] text-[13px] leading-6 text-[#98a1b3]">
                    {[member.designation, member.department_session].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="absolute bottom-7 left-7 flex gap-3 text-[#aeb7c7]">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      aria-label={`Email ${member.name}`}
                      className="transition hover:text-white"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="transition hover:text-white"
                    >
                      <LinkedinIcon size={16} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

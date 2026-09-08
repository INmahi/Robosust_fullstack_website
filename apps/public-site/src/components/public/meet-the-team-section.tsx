import { getCommitteeByWings } from "@/lib/content/committee-members";
import { ScrollSnapScope } from "./scroll-snap-scope";
import { TeamMemberCard } from "./team-member-card";
import { TeamWingSection, WingDivider, WingRows } from "./team-wing-section";

// Wing-by-wing scroll sequence. Every wing is its own full-viewport snap
// section and leaves the viewport as the next arrives — with one deliberate
// exception at the top, described below.
export async function MeetTheTeamSection() {
  const wings = await getCommitteeByWings();
  if (wings.length === 0) return null;

  const [leadership, vicePresidents, ...rest] = wings;

  return (
    <>
      <ScrollSnapScope />

      {/* Step 1 — leadership at full size, alone on screen. */}
      <section className="flex min-h-dvh snap-start flex-col justify-center py-16">
        <div className="container-shell">
          <WingDivider name={leadership.name} subtitle={leadership.subtitle} />
          <WingRows wing={leadership} headSize="lg" assistantSize="md" />
        </div>
      </section>

      {/* Step 2 — the exception. The leadership doesn't leave: it reappears
          shrunk along the top of this section while the vice presidents take
          the space below at full size. Rendering a compact copy here, rather
          than pinning the previous section and animating a scale, keeps native
          scrolling intact — the reader still sees them shrink and move up,
          because that is what the two snap positions look like in sequence. */}
      {vicePresidents && (
        <section className="flex min-h-dvh snap-start flex-col justify-center py-16">
          <div className="container-shell">
            <div className="reveal mb-16 text-center text-[10px] uppercase tracking-[0.22em] text-[#98a1b3]">
              {leadership.name}
            </div>
            <div className="mb-16 flex flex-wrap justify-center gap-4 opacity-80">
              {leadership.heads.map((member) => (
                <div key={member.id} className="w-[46%] max-w-[220px] sm:w-[30%]">
                  <TeamMemberCard member={member} size="sm" />
                </div>
              ))}
            </div>

            <WingDivider name={vicePresidents.name} subtitle={vicePresidents.subtitle} />
            <WingRows wing={vicePresidents} headSize="lg" assistantSize="sm" />
          </div>
        </section>
      )}

      {/* Every wing from here on fully replaces the one before it. */}
      {rest.map((wing) => (
        <TeamWingSection key={wing.id} wing={wing} />
      ))}
    </>
  );
}

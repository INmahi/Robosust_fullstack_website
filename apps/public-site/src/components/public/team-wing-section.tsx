import type { CommitteeWingGroup } from "@/lib/content/committee-members";
import { TeamMemberCard, type CardSize } from "./team-member-card";

// The reference draws each section label as a centred rule with dashes either
// side of the name.
export function WingDivider({ name, subtitle }: { name: string; subtitle?: string | null }) {
  return (
    <div className="reveal mb-20 text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-[#ff3b46]/35 sm:block" />
        <span className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#ff3b46] sm:text-[15px]">
          {name}
        </span>
        <span className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-[#ff3b46]/35 sm:block" />
      </div>
      {subtitle && <p className="mx-auto mt-3 max-w-[520px] text-[13px] text-[#98a1b3]">{subtitle}</p>}
    </div>
  );
}

// Heads share one row; assistants get their own row beneath, capped at three
// across so a fourth wraps rather than squeezing the row — "3 in a row and 2
// in the next", as specified. Both rows are centred so an incomplete final row
// sits under the middle of the one above rather than hugging the left edge.
export function WingRows({
  wing,
  headSize = "md",
  assistantSize = "sm",
}: {
  wing: CommitteeWingGroup;
  headSize?: CardSize;
  assistantSize?: CardSize;
}) {
  // Widths are computed from the gap rather than set as a max-width, because a
  // max-width lets an extra card slip onto the row whenever the container is
  // wide enough — which is how five assistants first rendered as 4 + 1 instead
  // of the required 3 + 2. calc() ties the count to the row, not to the
  // viewport. justify-center then centres a short final row under the one above.
  const headBasis = "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]";
  const assistantBasis = "w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]";
  const headCap = headSize === "lg" ? "max-w-[340px]" : "max-w-[300px]";

  return (
    <div className="flex flex-col gap-8">
      {wing.heads.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6">
          {wing.heads.map((member) => (
            <div key={member.id} className={`reveal ${headBasis} ${headCap}`}>
              <TeamMemberCard member={member} size={headSize} />
            </div>
          ))}
        </div>
      )}

      {wing.assistants.length > 0 && (
        <div className="flex flex-wrap justify-center gap-5">
          {wing.assistants.map((member) => (
            <div key={member.id} className={`reveal ${assistantBasis} max-w-[300px]`}>
              <TeamMemberCard member={member} size={assistantSize} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamWingSection({ wing }: { wing: CommitteeWingGroup }) {
  return (
    <section className="flex min-h-dvh snap-start flex-col justify-center py-16">
      <div className="container-shell">
        <WingDivider name={wing.name} subtitle={wing.subtitle} />
        <WingRows wing={wing} />
      </div>
    </section>
  );
}

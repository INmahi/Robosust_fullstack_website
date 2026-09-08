import type { CommitteeMember } from "@/lib/content/committee-members";

export type CardSize = "lg" | "md" | "sm";

// The design lifts the member portrait above the card's top edge. That means
// the image is absolutely positioned with a negative offset, and the card
// carries matching top padding so the name never collides with it. Portraits
// are transparent PNGs uploaded through /admin — with none, the silhouette
// below stands in, which is exactly what the reference design shows.
const sizes: Record<CardSize, { card: string; lift: string; image: string; name: string; role: string }> = {
  lg: {
    card: "min-h-[290px] pt-[96px] px-7 pb-7 rounded-[20px]",
    lift: "-top-[76px] h-[168px]",
    image: "h-[168px]",
    name: "text-[20px]",
    role: "text-[10px]",
  },
  md: {
    card: "min-h-[250px] pt-[84px] px-6 pb-6 rounded-[18px]",
    lift: "-top-[62px] h-[140px]",
    image: "h-[140px]",
    name: "text-[17px]",
    role: "text-[9px]",
  },
  sm: {
    card: "min-h-[190px] pt-[64px] px-5 pb-5 rounded-[16px]",
    lift: "-top-[50px] h-[112px]",
    image: "h-[112px]",
    name: "text-[15px]",
    role: "text-[9px]",
  },
};

function Silhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" fill="none" className={className} aria-hidden="true">
      <circle cx="60" cy="40" r="24" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="5 4" />
      <circle cx="60" cy="40" r="16" fill="#d4af37" fillOpacity="0.16" />
      <path
        d="M26 138c0-22 15-38 34-38s34 16 34 38"
        stroke="#d4af37"
        strokeWidth="1.5"
        fill="#d4af37"
        fillOpacity="0.08"
      />
      <path d="M60 104v20M46 118h28" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.55" />
    </svg>
  );
}

export function TeamMemberCard({ member, size = "md" }: { member: CommitteeMember; size?: CardSize }) {
  const s = sizes[size];

  return (
    <article
      className={`group relative flex w-full flex-col border border-white/10 bg-[#0d111a]/80 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/45 ${s.card}`}
    >
      {/* Vertical role plate on the left edge, straddling the border — the
          reference's most distinctive card detail. Hidden below sm, where
          there isn't width to spare for it. */}
      <div
        className={`absolute -left-[11px] top-1/2 hidden -translate-y-1/2 rounded-md border border-[#d4af37]/40 bg-[#05070c] px-1.5 py-3 font-semibold uppercase tracking-[0.18em] text-[#d4af37] sm:block ${s.role}`}
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
      >
        {member.designation}
      </div>

      <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${s.lift}`}>
        {member.photo_url ? (
          // next/image is deliberately unused across the public site — see
          // CLAUDE.md "Known gaps". Member portraits are transparent PNGs from
          // R2, and no remotePatterns entry exists for that domain.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photo_url} alt={member.name} className={`w-auto object-contain ${s.image}`} />
        ) : (
          <Silhouette className={`w-auto ${s.image}`} />
        )}
      </div>

      <div className="mt-auto flex items-start gap-3">
        <span className="mt-1 h-6 w-[3px] shrink-0 bg-[#d4af37]" />
        <div className="min-w-0">
          <h3 className={`font-semibold leading-tight text-white ${s.name}`}>{member.name}</h3>
          {member.department_session && (
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#98a1b3]">
              {member.department_session}
            </p>
          )}
          {/* The role also appears in the body on small screens, where the
              vertical plate is hidden and would otherwise take it with it. */}
          <p className="mt-1 text-[11px] text-[#98a1b3] sm:hidden">{member.designation}</p>
        </div>
      </div>
    </article>
  );
}

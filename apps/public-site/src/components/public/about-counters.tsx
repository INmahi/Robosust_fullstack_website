import { getHomeSectionWithItems } from "@/lib/content/home-sections";
import { CounterStat } from "./counter-stat";
import { resolveSectionIcon } from "./section-icons";

// Falls back to the design's own figures rather than rendering an empty
// column — the same rule the other singleton-backed sections follow.
const defaultCounters = [
  { id: "projects", label: "Projects", count_to: 20, value_suffix: "+", icon: "rocket" },
  { id: "members", label: "Members", count_to: 200, value_suffix: "+", icon: "users" },
  { id: "workshops", label: "Workshops", count_to: 20, value_suffix: "+", icon: "wrench" },
];

export type AboutCounter = {
  id: string;
  label: string | null;
  count_to: number | null;
  value_suffix: string | null;
  icon: string | null;
};

/** The counter cards, read once by whoever renders them. Exported separately
 *  so the homepage and /about can share one query rather than each fetching
 *  the same three rows. */
export async function getAboutCounters(): Promise<AboutCounter[]> {
  const section = await getHomeSectionWithItems("about");

  // Only cards with a target are counters — the About section's items table is
  // shared with other card kinds, so an item without count_to isn't one.
  const counters = (section?.items ?? []).filter((item) => item.count_to !== null);
  return counters.length > 0 ? counters : defaultCounters;
}

export function AboutCounters({
  counters,
  className = "",
}: {
  counters: AboutCounter[];
  className?: string;
}) {
  return (
    <div className={className}>
      {counters.map((counter) => {
        const Icon = resolveSectionIcon(counter.icon);
        return (
          <div
            key={counter.id}
            className="reveal group relative flex flex-1 items-center gap-4 overflow-hidden rounded-[18px] border border-[#d4af37]/20 bg-[#0d111a]/85 px-5 py-5 transition-colors hover:border-[#d4af37]/45 sm:px-6"
          >
            {/* A gold wash that only shows on hover — keeps the resting state
                flat so three of these in a column don't shout. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#d4af37]">
              <Icon size={20} />
            </span>
            <span className="relative flex flex-col">
              <CounterStat
                countTo={counter.count_to ?? 0}
                suffix={counter.value_suffix}
                className="text-[28px] font-bold leading-none tracking-[-0.03em] text-white tabular-nums sm:text-[34px]"
              />
              <span className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-[#98a1b3]">
                {counter.label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

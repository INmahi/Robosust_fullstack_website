import { ArrowDown } from "lucide-react";
import { AccentHeadingLines } from "./heading-lines";

type PageIntroProps = {
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  image: string;
};

// The masthead every page below the homepage opens with (the homepage keeps
// its own full-height HeroSection instead). Ported from the reference's
// PageIntro, minus its own pt-[76px] — (public)/layout.tsx already offsets
// the fixed header on <main>, so repeating it here would double the gap.
export function PageIntro({ eyebrow, title, description, image }: PageIntroProps) {
  return (
    <section
      className="relative flex min-h-[460px] items-end overflow-hidden border-b border-white/10 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(5,7,12,.96), rgba(5,7,12,.55)), url('${image}')`,
      }}
    >
      <div className="grid-pattern absolute inset-0 opacity-45" />
      <div className="container-shell relative w-full pb-16 pt-24">
        {eyebrow && (
          <div className="reveal mb-5 text-[11px] uppercase tracking-[0.22em] text-[#aeb7c7]">
            <span className="mr-3 inline-block h-px w-7 bg-[#ff3b46] align-middle" />
            {eyebrow}
          </div>
        )}
        <h1 className="reveal max-w-[840px] text-[clamp(54px,8vw,112px)] font-bold leading-[0.88] tracking-[-0.06em]">
          <AccentHeadingLines text={title} />
        </h1>
        {description && (
          <p className="reveal mt-7 max-w-[560px] text-[15px] leading-7 text-[#b6bfce]">{description}</p>
        )}
        <a
          href="#content"
          aria-label="Scroll to page content"
          className="mt-8 inline-grid h-10 w-10 place-items-center rounded-full border border-white/15 text-[#dce2ec] transition hover:-translate-y-0.5 hover:border-[#3d7cff]/70"
        >
          <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { getSiteSettings } from "@/lib/content/site-settings";
import { HeroBackground } from "./hero-background";
import { HeroSocialBar } from "./hero-social-bar";

const defaultHeroImage = "https://images.unsplash.com/photo-1781330189305-d92d518dc28d";

export async function HeroSection() {
  const [section, settings] = await Promise.all([getHomeSectionByKey("hero"), getSiteSettings()]);

  const image = section?.background_image_url || defaultHeroImage;
  const eyebrow = section?.eyebrow || "Robotics Laboratory based in SUST";
  const tagline = section?.heading || "Robotics For Glory.";
  const primaryLabel = section?.cta_text || "Register for AGP";
  const primaryHref = section?.cta_url || "#projects";
  const secondaryLabel = section?.secondary_cta_text || "Our mission";
  const secondaryHref = section?.secondary_cta_url || "#about";

  return (
    // min-h-dvh (not a fixed px height) so the hero always fills the initial
    // viewport exactly — otherwise the next section's background peeks in at
    // the bottom edge before the visitor scrolls.
    <section className="hero relative grid min-h-dvh items-center overflow-hidden">
      <HeroBackground image={image} />
      <div className="grid-pattern absolute inset-0 opacity-35" />
      <div className="container-shell relative flex items-center justify-between gap-8 py-10">
        <div className="max-w-[820px]">
          <div className="reveal mb-5 text-[12px] uppercase tracking-[0.22em] text-[#aeb7c7]">
            <span className="mr-3 inline-block h-px w-7 bg-[#ff3b46] align-middle" />
            {eyebrow}
          </div>
          <h1 className="text-[clamp(72px,12vw,176px)] font-bold leading-[0.82] tracking-[-0.07em]">
            ROBO
            <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)]">SUST</span>
          </h1>
          <div className="reveal mt-7 text-[clamp(20px,2.5vw,34px)] font-medium text-[#dce2eb]">{tagline}</div>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            <a
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3.5 text-[13px] font-semibold text-[#05070c] transition hover:-translate-y-0.5"
            >
              {primaryLabel} <ArrowUpRight size={16} />
            </a>
            <a
              href={secondaryHref}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4af37]/65"
            >
              {secondaryLabel}
            </a>
          </div>
        </div>
        <HeroSocialBar
          facebook={settings.social_facebook}
          linkedin={settings.social_linkedin}
          whatsapp={settings.social_whatsapp}
        />
      </div>
    </section>
  );
}

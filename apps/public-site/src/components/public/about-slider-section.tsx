import { getAboutSlideshow } from "@/lib/content/about-slides";
import { AboutSlider } from "./about-slider";

/** Fetches the strip and hands the client half plain objects. Renders nothing
 *  at all when no photos are uploaded — the codebase's empty-state rule, and
 *  better than a row of grey boxes on a page that otherwise reads fine. */
export async function AboutSliderSection({ className }: { className?: string }) {
  const { slides, focalIndex } = await getAboutSlideshow();
  if (slides.length === 0) return null;

  return (
    <div className={className}>
      <AboutSlider
        slides={slides.map((slide) => ({
          id: slide.id,
          image: slide.image_url,
          caption: slide.caption,
        }))}
        initialIndex={focalIndex}
      />
    </div>
  );
}

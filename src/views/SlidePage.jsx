import { SlideTemplate } from "../components/SlideTemplate.jsx";
import { StandardSlide } from "../components/slides/StandardSlide.jsx";
import { TufteSlide } from "../components/slides/TufteSlide.jsx";
import { ScrollSlide } from "../components/slides/ScrollSlide.jsx";
import { MarketplaceExplainer } from "../marketplace/MarketplaceExplainer.jsx";
import { MarketplaceDirectory } from "../marketplace/MarketplaceDirectory.jsx";

// Registry of custom slide components — for slides with { type: 'custom', component: '...' }.
// Both marketplace slides were added in milestone 4. The module they import from
// (v2/src/marketplace/) is the canonical source and will also power the standalone
// /skills and /skills/[slug] routes in the Next.js migration (m5).
const CUSTOM_COMPONENTS = {
  MarketplaceExplainer,
  MarketplaceDirectory,
};

// Dispatches a slide to the right renderer based on `type`.
// Content slides (standard/tufte/scroll) are wrapped in SlideTemplate for the
// shared eyebrow + title + divider chrome. Custom slides take over the full canvas.
export function SlidePage({ chapter, slide, slideKey }) {
  if (slide.type === "custom") {
    const Component = CUSTOM_COMPONENTS[slide.component];
    if (!Component) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", color: "#8C3A4F" }}>
          Missing custom component: {slide.component}
        </div>
      );
    }
    return <Component slide={slide} />;
  }

  return (
    <SlideTemplate eyebrow={`${chapter.num} · ${chapter.title}`} title={slide.title} source={slide.source}>
      {slide.type === "standard" && <StandardSlide slide={slide} />}
      {slide.type === "tufte" && <TufteSlide slide={slide} />}
      {slide.type === "scroll" && <ScrollSlide slide={slide} isActive={true} key={slideKey} />}
    </SlideTemplate>
  );
}

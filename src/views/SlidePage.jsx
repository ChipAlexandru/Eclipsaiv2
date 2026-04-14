import { SlideTemplate } from "../components/SlideTemplate.jsx";
import { StandardSlide } from "../components/slides/StandardSlide.jsx";
import { TufteSlide } from "../components/slides/TufteSlide.jsx";
import { ScrollSlide } from "../components/slides/ScrollSlide.jsx";
import { ArticleTrigger, ArticleContent } from "../components/ArticleSection.jsx";
import { MarketplaceExplainer } from "../marketplace/MarketplaceExplainer.jsx";
import { MarketplaceDirectory } from "../marketplace/MarketplaceDirectory.jsx";

// Registry of custom slide components — for slides with { type: 'custom', component: '...' }.
const CUSTOM_COMPONENTS = {
  MarketplaceExplainer,
  MarketplaceDirectory,
};

// Dispatches a slide to the right renderer based on `type`.
// Content slides (standard/tufte/scroll) are wrapped in SlideTemplate for the
// shared eyebrow + title + divider chrome. Custom slides take over the full canvas.
// When a slide has an `article` property, a "Continue reading" trigger is shown;
// clicking it expands the long-form article below the slide content.
export function SlidePage({ chapter, slide, slideKey, articleOpen, onArticleOpen, onArticleClose }) {
  // Custom slides: render inside SlideTemplate if they carry a title so they
  // share the deck's eyebrow + title + divider chrome (opt out with
  // `bareCanvas: true` for cover/splash-style custom slides).
  if (slide.type === "custom") {
    const Component = CUSTOM_COMPONENTS[slide.component];
    if (!Component) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", color: "#8C3A4F" }}>
          Missing custom component: {slide.component}
        </div>
      );
    }
    if (slide.bareCanvas || !slide.title) {
      return <Component slide={slide} />;
    }
    return (
      <SlideTemplate eyebrow={`${chapter.num} · ${chapter.title}`} title={slide.title} source={slide.source}>
        <Component slide={slide} />
        {slide.article && !articleOpen && (
          <ArticleTrigger article={slide.article} onOpen={onArticleOpen} />
        )}
        {slide.article && articleOpen && (
          <ArticleContent article={slide.article} onClose={onArticleClose} />
        )}
      </SlideTemplate>
    );
  }

  return (
    <SlideTemplate eyebrow={`${chapter.num} · ${chapter.title}`} title={slide.title} source={slide.source}>
      {slide.type === "standard" && <StandardSlide slide={slide} />}
      {slide.type === "tufte" && <TufteSlide slide={slide} />}
      {slide.type === "scroll" && <ScrollSlide slide={slide} isActive={true} key={slideKey} />}
      {slide.article && !articleOpen && (
        <ArticleTrigger article={slide.article} onOpen={onArticleOpen} />
      )}
      {slide.article && articleOpen && (
        <ArticleContent article={slide.article} onClose={onArticleClose} />
      )}
    </SlideTemplate>
  );
}

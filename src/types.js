// ─── TYPES ───────────────────────────────────────────────────────────
// Plain JS project — types expressed as JSDoc so editors/TS-in-JS still get
// autocompletion and the shapes are documentation + a lightweight runtime check.
// Authoritative shapes per CLAUDE_CODE_BRIEF.md.
//
// Five shapes: Slide, Chapter, Deck, Shelf, Feature.
// A sixth appears on Shelf.about — see AboutShape below.

/**
 * A Slide is the atomic content unit. Deck-local (decision 2A).
 * - type: 'content' renders via SlideTemplate; one of the known content
 *   subtypes ('standard' | 'tufte' | 'scroll').
 * - type: 'custom' renders a named component resolved against SlidePage's
 *   CUSTOM_COMPONENTS registry (e.g. 'MarketplaceSlide').
 *
 * @typedef {Object} Slide
 * @property {string} id                  stable id within the deck
 * @property {'standard'|'tufte'|'scroll'|'custom'} type
 * @property {string} [title]             action title, 84px serif chrome
 * @property {string} [eyebrow]           optional override; defaults to "<ch.num> · <ch.title>"
 * @property {string} [component]         for type: 'custom' — registry key
 * @property {string} [ogDescription]     one-line takeaway (~150 chars) for OG meta
 * @property {string} [source]            attribution line rendered as a small footer
 * // ── content shape fields (by subtype) ──
 * @property {string}   [body]            standard + scroll
 * @property {Array<{title:string,desc:string}>} [pillars]   standard
 * @property {{value:(string|number),label:string,sub:string}} [callout]  standard
 * @property {string[]} [paragraphs]      tufte
 * @property {Array<{marker:string,label:string,detail:string}>} [notes]  tufte
 * @property {Array<{label:string,value:(string|number),unit:string,desc:string}>} [stats] scroll
 * @property {boolean}  [isText]          scroll — when value is a string, not a number
 */

/**
 * A Chapter groups slides inside a deck.
 *
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} num        '01', '02', ... — serif numeric anchor on Cover
 * @property {string} title
 * @property {string} subtitle
 * @property {string} [iconName] lucide-react icon name; resolved by the renderer, not baked in
 * @property {Slide[]} slides
 */

/**
 * A Deck is a chapter collection with its own Cover. Decks are flat on the
 * shelf (decision 3D). Tags are metadata only with no enforced taxonomy.
 *
 * @typedef {Object} Deck
 * @property {string} id
 * @property {string} title        shown on Cover
 * @property {string[]} tags       unused until there's a second deck; kept in the shape
 * @property {Chapter[]} chapters
 * @property {string} [ogDescription] one-line pitch for the Cover OG card
 */

/**
 * Shelf-level About. Powers the AboutPopup on Home (thin, name + blurb + LinkedIn
 * + "Read more →" link) AND the dedicated /about page (full content promoted from
 * the old Chapter 5 in milestone 3).
 *
 * The popup reads `name`, `blurb`, `linkedinUrl`. The /about page additionally
 * reads `headline`, `intro`, `capabilities`, `phases`, `credential`.
 *
 * @typedef {Object} AboutCapability
 * @property {string} title
 * @property {string} desc
 *
 * @typedef {Object} AboutPhase
 * @property {string} num      '1'..'5'
 * @property {string} title
 * @property {string} desc
 *
 * @typedef {Object} AboutCredential
 * @property {string} value    big number/stat (e.g. '15+')
 * @property {string} label    short caption
 * @property {string} sub      one-line explanation
 *
 * @typedef {Object} About
 * @property {string} name
 * @property {string} blurb          one-line, rendered inside the popup
 * @property {string} linkedinUrl
 * @property {string} [headline]     /about page hero title
 * @property {string} [intro]        /about page lead paragraph
 * @property {AboutCapability[]} [capabilities]  "Skills Architecture" etc.
 * @property {AboutPhase[]} [phases] five-phase methodology
 * @property {AboutCredential} [credential]      big-number proof point
 */

/**
 * A Feature is an editorial pick shown on Home.
 * Three kinds:
 *   - 'chapter' — {deckId, chapterId, label, title, blurb} → links to first slide
 *   - 'slide'   — {deckId, chapterId, slideId, title, blurb}
 *   - 'video'   — {title, src?, poster?}
 *
 * @typedef {Object} Feature
 * @property {'chapter'|'slide'|'video'} kind
 * @property {string} title
 * @property {string} [blurb]
 * @property {string} [label]      chapter kind — section label above the title
 * @property {string} [deckId]     chapter + slide kind
 * @property {string} [chapterId]  chapter + slide kind
 * @property {string} [slideId]    slide kind
 * @property {string} [src]        video kind
 * @property {string} [poster]     video kind
 */

/**
 * The Shelf is the root of the content model. One shelf, many decks, one About.
 *
 * @typedef {Object} Shelf
 * @property {Deck[]} decks
 * @property {About} about
 * @property {Feature[]} featured
 */

// ─── RUNTIME VALIDATION ──────────────────────────────────────────────
// Lightweight guardrails. Not a full schema validator — just enough to catch
// typos and missing fields during development. Silent in production.

const VALID_SLIDE_TYPES = new Set(["standard", "tufte", "scroll", "custom"]);

/**
 * Validate a Shelf-shaped object. Returns an array of error strings;
 * empty array means the shape is well-formed.
 * @param {Shelf} shelf
 * @returns {string[]}
 */
export function validateShelf(shelf) {
  const errors = [];
  if (!shelf || typeof shelf !== "object") {
    return ["shelf: not an object"];
  }
  if (!Array.isArray(shelf.decks)) errors.push("shelf.decks: expected array");
  if (!shelf.about || typeof shelf.about !== "object") errors.push("shelf.about: expected object");
  else {
    if (!shelf.about.name) errors.push("shelf.about.name: missing");
    if (!shelf.about.blurb) errors.push("shelf.about.blurb: missing");
    if (!shelf.about.linkedinUrl) errors.push("shelf.about.linkedinUrl: missing");
  }
  if (!Array.isArray(shelf.featured)) errors.push("shelf.featured: expected array");

  (shelf.decks || []).forEach((deck, di) => {
    errors.push(...validateDeck(deck, `decks[${di}]`));
  });

  (shelf.featured || []).forEach((f, fi) => {
    const path = `featured[${fi}]`;
    if (f.kind !== "slide" && f.kind !== "video" && f.kind !== "chapter") {
      errors.push(`${path}.kind: expected 'chapter' | 'slide' | 'video', got ${f.kind}`);
    }
    if (f.kind === "slide" || f.kind === "chapter") {
      if (!f.deckId) errors.push(`${path}.deckId: missing`);
      if (!f.chapterId) errors.push(`${path}.chapterId: missing`);
      // Check deep link resolves
      const targetDeck = (shelf.decks || []).find(d => d.id === f.deckId);
      if (f.deckId && !targetDeck) {
        errors.push(`${path}: deckId '${f.deckId}' not found on shelf`);
      } else if (targetDeck) {
        const ch = targetDeck.chapters.find(c => c.id === f.chapterId);
        if (f.chapterId && !ch) errors.push(`${path}: chapterId '${f.chapterId}' not in deck '${f.deckId}'`);
        if (f.kind === "slide") {
          if (typeof f.slideId !== "string" || !f.slideId) errors.push(`${path}.slideId: expected non-empty string`);
          else if (ch && !ch.slides.some(s => s.id === f.slideId)) {
            errors.push(`${path}: slideId '${f.slideId}' not found in chapter '${f.chapterId}'`);
          }
        }
      }
    }
  });

  return errors;
}

/**
 * @param {Deck} deck
 * @param {string} path
 * @returns {string[]}
 */
export function validateDeck(deck, path = "deck") {
  const errors = [];
  if (!deck.id) errors.push(`${path}.id: missing`);
  if (!deck.title) errors.push(`${path}.title: missing`);
  if (!Array.isArray(deck.tags)) errors.push(`${path}.tags: expected array (may be empty)`);
  if (!Array.isArray(deck.chapters)) {
    errors.push(`${path}.chapters: expected array`);
    return errors;
  }
  const chapterIds = new Set();
  deck.chapters.forEach((ch, ci) => {
    const chPath = `${path}.chapters[${ci}]`;
    if (!ch.id) errors.push(`${chPath}.id: missing`);
    if (chapterIds.has(ch.id)) errors.push(`${chPath}.id: duplicate '${ch.id}' within deck`);
    chapterIds.add(ch.id);
    if (!ch.num) errors.push(`${chPath}.num: missing`);
    if (!ch.title) errors.push(`${chPath}.title: missing`);
    if (!Array.isArray(ch.slides)) {
      errors.push(`${chPath}.slides: expected array`);
      return;
    }
    const slideIds = new Set();
    ch.slides.forEach((sl, si) => {
      const slPath = `${chPath}.slides[${si}]`;
      if (!sl.id) errors.push(`${slPath}.id: missing`);
      if (slideIds.has(sl.id)) errors.push(`${slPath}.id: duplicate '${sl.id}' within chapter`);
      slideIds.add(sl.id);
      if (!VALID_SLIDE_TYPES.has(sl.type)) {
        errors.push(`${slPath}.type: expected one of ${[...VALID_SLIDE_TYPES].join("|")}, got '${sl.type}'`);
      }
      if (sl.type === "custom" && !sl.component) {
        errors.push(`${slPath}.component: custom slide missing component name`);
      }
      if (sl.type !== "custom" && !sl.title) {
        errors.push(`${slPath}.title: content slide missing title`);
      }
    });
  });
  return errors;
}

/**
 * Dev-only assertion. Logs errors to console and throws if any are found.
 * Called once from decks/index.js at module load.
 * @param {Shelf} shelf
 */
export function assertShelfValid(shelf) {
  const errors = validateShelf(shelf);
  if (errors.length > 0) {
    const msg = `Shelf validation failed:\n  - ${errors.join("\n  - ")}`;
    // eslint-disable-next-line no-console
    console.error(msg);
    throw new Error(msg);
  }
}

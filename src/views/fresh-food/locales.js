// Fresh-food locale registry and content access.
//
// English (freshFoodContent.en.js) is the canonical content contract. Every
// other locale must expose the exact same key structure, including array
// lengths; getContent() validates this and THROWS on any mismatch, so a
// missing translation key fails `next build` (all locale routes are
// statically generated) instead of silently rendering English fallback copy
// on a translated page.
import { en } from "./freshFoodContent.en.js";
import { de } from "./freshFoodContent.de.js";
import { fr } from "./freshFoodContent.fr.js";
import { it } from "./freshFoodContent.it.js";
import { ro } from "./freshFoodContent.ro.js";

// Order defines the language-selector menu. English stays at the root path.
export const LOCALES = [
  { code: "en", name: "English", path: "/" },
  { code: "de", name: "Deutsch", path: "/de" },
  { code: "fr", name: "Français", path: "/fr" },
  { code: "it", name: "Italiano", path: "/it" },
  { code: "ro", name: "Română", path: "/ro" },
];

const CONTENT = { en, de, fr, it, ro };

// Flatten an object into sorted "a.b.0.c"-style key paths. Arrays are
// traversed by index so a translated list with a missing entry is caught too.
function keyPaths(value, prefix = "", out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => keyPaths(item, `${prefix}${i}.`, out));
  } else if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) keyPaths(value[key], `${prefix}${key}.`, out);
  } else {
    out.push(prefix.slice(0, -1));
  }
  return out;
}

export function getContent(locale) {
  const content = CONTENT[locale];
  if (!content) {
    throw new Error(`fresh-food: unknown locale "${locale}" — expected one of ${Object.keys(CONTENT).join(", ")}`);
  }
  if (locale !== "en") {
    const reference = new Set(keyPaths(en));
    const actual = new Set(keyPaths(content));
    const missing = [...reference].filter((k) => !actual.has(k));
    const unexpected = [...actual].filter((k) => !reference.has(k));
    if (missing.length || unexpected.length) {
      throw new Error(
        `fresh-food: freshFoodContent.${locale} does not match the English content contract.` +
          (missing.length ? ` Missing keys: ${missing.join(", ")}.` : "") +
          (unexpected.length ? ` Unexpected keys: ${unexpected.join(", ")}.` : ""),
      );
    }
  }
  return content;
}

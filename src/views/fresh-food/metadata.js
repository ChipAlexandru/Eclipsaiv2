// Localized Next.js metadata for the fresh-food homepage routes.
//
// Every locale page declares its own canonical plus the full hreflang
// alternates set (en at the root, x-default → root). The social image is the
// shared root opengraph-image.jsx card — Next resolves it for /de, /fr, /it
// and /ro by walking up the segment tree, so no per-locale image is needed
// unless one is deliberately created later.
import { getContent } from "./locales.js";

const SITE_URL = "https://eclipsai.com";

// hreflang map, identical on every locale page.
const LANGUAGE_ALTERNATES = {
  en: "/",
  de: "/de",
  fr: "/fr",
  it: "/it",
  ro: "/ro",
  "x-default": "/",
};

export function buildFreshFoodMetadata(locale) {
  const content = getContent(locale);
  const path = locale === "en" ? "/" : `/${locale}`;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: path,
      languages: LANGUAGE_ALTERNATES,
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      siteName: "Eclipsai",
      title: content.meta.title,
      description: content.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.ogDescription,
    },
  };
}

// The fresh-food hero opens on eclipse ink, so the mobile browser chrome is
// ink on every locale (other routes default to cream in app/layout.jsx).
export const freshFoodViewport = {
  themeColor: "#19171F",
};

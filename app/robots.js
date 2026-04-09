// robots.txt — Next.js 15 convention. Allows everything and points crawlers
// at the sitemap. Kept permissive; there's no private area on the site.
const SITE_URL = "https://eclipsai.com";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

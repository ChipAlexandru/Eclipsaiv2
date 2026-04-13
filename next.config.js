// Next.js config — m5.1 scaffold + production headers.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Prevent search engines and AI crawlers from indexing Vercel preview
  // deployments (e.g. eclipsai-xyz.vercel.app). Only the production domain
  // (eclipsai.com) should be indexed. VERCEL_ENV is set automatically by
  // Vercel: "production", "preview", or "development".
  async headers() {
    const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
    if (!isPreview) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

// Next.js config — m5.1 scaffold + production headers.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Keep Railway as the sole authentication owner. Production requests under
  // /juliette are proxied server-side, so the browser stays on eclipsai.com.
  // Preview and local builds deliberately cannot reach live client data.
  async rewrites() {
    const origin = productionJuliettePortalOrigin();
    const publicPages = [
      {
        source: "/fresh-food-demo",
        destination: "/fresh-food-demo/index.html",
      },
      spruengliDemoRewrite,
    ];

    if (!origin) {
      return {
        beforeFiles: publicPages,
        afterFiles: [hausammannDemoRewrite],
        fallback: [],
      };
    }

    return {
      beforeFiles: [
        ...publicPages,
        {
          source: "/juliette",
          destination: `${origin}/juliette`,
        },
        {
          source: "/juliette/:path*",
          destination: `${origin}/juliette/:path*`,
        },
      ],
      afterFiles: [hausammannDemoRewrite],
      fallback: [],
    };
  },

  // Prevent search engines and AI crawlers from indexing Vercel preview
  // deployments (e.g. eclipsai-xyz.vercel.app). Only the production domain
  // (eclipsai.com) should be indexed. VERCEL_ENV is set automatically by
  // Vercel: "production", "preview", or "development".
  async headers() {
    const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
    if (isPreview) {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
          ],
        },
      ];
    }
    return [
      {
        source: "/Hausammann-demo-1",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/Hausammann-demo-1/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/Spruengli-demo-2",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/Spruengli-demo-2/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/juliette/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

const hausammannDemoRewrite = {
  source: "/Hausammann-demo-1",
  destination: "/Hausammann-demo-1/index.html",
};

const spruengliDemoRewrite = {
  source: "/Spruengli-demo-2",
  destination: "/demo-common/index.html?demo=spruengli",
};

function productionJuliettePortalOrigin() {
  if (process.env.VERCEL_ENV !== "production") return null;

  const configured = process.env.JULIETTE_PORTAL_ORIGIN;
  if (!configured) return null;

  let parsed;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error("JULIETTE_PORTAL_ORIGIN must be a valid HTTPS origin.");
  }

  const hasUnexpectedParts = (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  );
  if (hasUnexpectedParts) {
    throw new Error("JULIETTE_PORTAL_ORIGIN must be an HTTPS origin without credentials, a path, query, or fragment.");
  }

  return parsed.origin;
}

module.exports = nextConfig;

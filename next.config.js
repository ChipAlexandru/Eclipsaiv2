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
      ...legacyDemoAssetRewrites,
      freshFoodDemoRewrite,
      spruengliDemoRewrite,
      hausammannDemoRewrite,
      bakeryBakeryDemoRewrite,
      steinerDemoRewrite,
      restaurantDemoRewrite,
      restaurantLegacyDemoRewrite,
    ];

    if (!origin) {
      return {
        beforeFiles: publicPages,
        afterFiles: [],
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
      afterFiles: [],
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
        source: "/BakeryBakery-demo-1",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/BakeryBakery-demo-1/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/Steiner-Flughafebeck-demo-1",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/Steiner-Flughafebeck-demo-1/:path*",
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

const legacyDemoAssetRewrites = [
  ...assetAliases(
    ["fresh-food-demo", "Hausammann-demo-1", "Spruengli-demo-2", "BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1", "restaurant-profit-brain-demo"],
    "assets/source-photos/pos.jpg",
    "/demo-common/assets/shared/pos-2000.jpg",
  ),
  ...assetAliases(
    ["fresh-food-demo", "Hausammann-demo-1", "Spruengli-demo-2", "BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1", "restaurant-profit-brain-demo"],
    "assets/source-photos/phone-message.jpg",
    "/demo-common/assets/shared/phone-message.jpg",
  ),
  ...assetAliases(
    ["fresh-food-demo", "Hausammann-demo-1", "BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1"],
    "assets/source-photos/baker-production.jpg",
    "/demo-common/assets/shared/baker-production.jpg",
  ),
  ...assetAliases(
    ["BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1"],
    "assets/field-evidence/opening-production.jpg",
    "/demo-common/assets/shared/baker-production.jpg",
  ),
  ...assetAliases(
    ["fresh-food-demo", "Hausammann-demo-1", "Spruengli-demo-2", "BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1"],
    "assets/source-photos/computer.jpg",
    "/demo-common/assets/shared/computer.jpg",
  ),
  ...assetAliases(
    ["fresh-food-demo", "BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1"],
    "assets/source-photos/bakery-display-neutral.png",
    "/demo-common/assets/shared/bakery-display-neutral.jpg",
  ),
  ...assetAliases(
    ["BakeryBakery-demo-1", "Steiner-Flughafebeck-demo-1"],
    "assets/field-evidence/opening-display.png",
    "/demo-common/assets/shared/bakery-display-neutral.jpg",
  ),
  {
    source: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-03-1028.jpg",
    destination: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-03-1028-1600.jpg",
  },
  {
    source: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-04-1603.jpg",
    destination: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-04-1603-1600.jpg",
  },
];

function assetAliases(demos, assetPath, destination) {
  return demos.map((demo) => ({ source: `/${demo}/${assetPath}`, destination }));
}

const hausammannDemoRewrite = {
  source: "/Hausammann-demo-1",
  destination: "/demo-common/index.html?demo=hausammann",
};

const freshFoodDemoRewrite = {
  source: "/fresh-food-demo",
  destination: "/demo-common/index.html?demo=generic",
};

const spruengliDemoRewrite = {
  source: "/Spruengli-demo-2",
  destination: "/demo-common/index.html?demo=spruengli",
};

const bakeryBakeryDemoRewrite = {
  source: "/BakeryBakery-demo-1",
  destination: "/demo-common/index.html?demo=bakerybakery",
};

const steinerDemoRewrite = {
  source: "/Steiner-Flughafebeck-demo-1",
  destination: "/demo-common/index.html?demo=steiner",
};

const restaurantDemoRewrite = {
  source: "/restaurant-demo-0-0",
  destination: "/demo-common/index.html?demo=restaurant",
};

const restaurantLegacyDemoRewrite = {
  source: "/restaurant-profit-brain-demo",
  destination: "/demo-common/index.html?demo=restaurant",
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

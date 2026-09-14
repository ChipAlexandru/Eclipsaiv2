const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const nextConfig = require("../next.config.js");
const legacyDemoAssetRewriteCount = 30;

function withoutLegacyDemoAssetRewrites(rewrites) {
  return {
    ...rewrites,
    beforeFiles: rewrites.beforeFiles.slice(legacyDemoAssetRewriteCount),
  };
}

async function withEnvironment(values, callback) {
  const keys = ["VERCEL_ENV", "JULIETTE_PORTAL_ORIGIN"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) {
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }

  try {
    return await callback();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("production proxies the complete Juliette path to Railway", async () => {
  await withEnvironment({
    VERCEL_ENV: "production",
    JULIETTE_PORTAL_ORIGIN: "https://example-production.up.railway.app",
  }, async () => {
    assert.deepEqual(withoutLegacyDemoAssetRewrites(await nextConfig.rewrites()), {
      beforeFiles: [
        {
          source: "/fresh-food-demo",
          destination: "/demo-common/index.html?demo=generic",
        },
        {
          source: "/Spruengli-demo-2",
          destination: "/demo-common/index.html?demo=spruengli",
        },
        {
          source: "/Hausammann-demo-1",
          destination: "/demo-common/index.html?demo=hausammann",
        },
        {
          source: "/BakeryBakery-demo-1",
          destination: "/demo-common/index.html?demo=bakerybakery",
        },
        {
          source: "/Steiner-Flughafebeck-demo-1",
          destination: "/demo-common/index.html?demo=steiner",
        },
        {
          source: "/restaurant-demo-0-0",
          destination: "/demo-common/index.html?demo=restaurant",
        },
        {
          source: "/restaurant-profit-brain-demo",
          destination: "/demo-common/index.html?demo=restaurant",
        },
        {
          source: "/juliette",
          destination: "https://example-production.up.railway.app/juliette",
        },
        {
          source: "/juliette/:path*",
          destination: "https://example-production.up.railway.app/juliette/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    });
  });
});

test("preview and local builds serve the public demo without proxying production client data", async () => {
  for (const vercelEnvironment of ["preview", "development", undefined]) {
    await withEnvironment({
      VERCEL_ENV: vercelEnvironment,
      JULIETTE_PORTAL_ORIGIN: "https://example-production.up.railway.app",
    }, async () => {
      assert.deepEqual(withoutLegacyDemoAssetRewrites(await nextConfig.rewrites()), {
        beforeFiles: [
          {
            source: "/fresh-food-demo",
            destination: "/demo-common/index.html?demo=generic",
          },
          {
            source: "/Spruengli-demo-2",
            destination: "/demo-common/index.html?demo=spruengli",
          },
          {
            source: "/Hausammann-demo-1",
            destination: "/demo-common/index.html?demo=hausammann",
          },
          {
            source: "/BakeryBakery-demo-1",
            destination: "/demo-common/index.html?demo=bakerybakery",
          },
          {
            source: "/Steiner-Flughafebeck-demo-1",
            destination: "/demo-common/index.html?demo=steiner",
          },
          {
            source: "/restaurant-demo-0-0",
            destination: "/demo-common/index.html?demo=restaurant",
          },
          {
            source: "/restaurant-profit-brain-demo",
            destination: "/demo-common/index.html?demo=restaurant",
          },
        ],
        afterFiles: [],
        fallback: [],
      });
    });
  }
});

test("legacy demo asset URLs resolve to retained image files", async () => {
  const rewrites = await nextConfig.rewrites();
  const assetRewrites = rewrites.beforeFiles.slice(0, legacyDemoAssetRewriteCount);
  assert.equal(assetRewrites.length, legacyDemoAssetRewriteCount);
  assert.equal(new Set(assetRewrites.map(({ source }) => source)).size, legacyDemoAssetRewriteCount);

  for (const { source, destination } of assetRewrites) {
    assert.equal(fs.existsSync(path.join(__dirname, "..", "public", source)), false, source);
    assert.equal(fs.existsSync(path.join(__dirname, "..", "public", destination)), true, destination);
  }
});

test("production fails closed when the configured destination is unsafe", async () => {
  for (const origin of [
    "http://example-production.up.railway.app",
    "https://user:password@example-production.up.railway.app",
    "https://example-production.up.railway.app/a-path",
    "https://example-production.up.railway.app?query=true",
    "not-a-url",
  ]) {
    await withEnvironment({ VERCEL_ENV: "production", JULIETTE_PORTAL_ORIGIN: origin }, async () => {
      await assert.rejects(nextConfig.rewrites());
    });
  }
});

test("production portal responses are private and excluded from indexing", async () => {
  await withEnvironment({ VERCEL_ENV: "production" }, async () => {
    assert.deepEqual(await nextConfig.headers(), [
      {
        source: "/Hausammann-demo-1",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/Hausammann-demo-1/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/Spruengli-demo-2",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/Spruengli-demo-2/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/BakeryBakery-demo-1",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/BakeryBakery-demo-1/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/Steiner-Flughafebeck-demo-1",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/Steiner-Flughafebeck-demo-1/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/juliette/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]);
  });
});

test("preview deployments remain excluded from indexing globally", async () => {
  await withEnvironment({ VERCEL_ENV: "preview" }, async () => {
    assert.deepEqual(await nextConfig.headers(), [{
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }]);
  });
});

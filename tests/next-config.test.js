const assert = require("node:assert/strict");
const test = require("node:test");

const nextConfig = require("../next.config.js");

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
    assert.deepEqual(await nextConfig.rewrites(), {
      beforeFiles: [
        {
          source: "/fresh-food-demo",
          destination: "/fresh-food-demo/index.html",
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
      afterFiles: [{
        source: "/Hausammann-demo-1",
        destination: "/Hausammann-demo-1/index.html",
      }],
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
      assert.deepEqual(await nextConfig.rewrites(), {
        beforeFiles: [{
          source: "/fresh-food-demo",
          destination: "/fresh-food-demo/index.html",
        }],
        afterFiles: [{
          source: "/Hausammann-demo-1",
          destination: "/Hausammann-demo-1/index.html",
        }],
        fallback: [],
      });
    });
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

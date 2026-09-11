import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import CAPTURE_ROWS from "../src/avolta-demo/catalog-capture-v2.mjs";

const ROOT = process.cwd();
const CAPTURED_AT = "2026-09-11T17:30:00+02:00";
const STOREFRONT = "https://zurich.shopdutyfree.com/de/48";
const IMAGE_DIR = path.join(ROOT, "public", "avolta-demo", "products");
const CATALOG_PATH = path.join(ROOT, "src", "avolta-demo", "catalog.json");
const REPORT_PATH = path.join(ROOT, "src", "avolta-demo", "catalog-report.json");

// Captured from the official Zürich Duty Free Reserve & Collect storefront on
// 2026-09-11 using the rendered category and product pages. Prices and offer
// labels are a public-web snapshot, not live physical-store inventory.

const nameCorrections = new Map([
  ["prada-paradoxe-90ml-eau-de-parfum", "Paradoxe"],
  ["lancome-idole-100ml-eau-de-parfum", "Idôle"],
  ["giorgio-armani-si-50ml-eau-de-parfum", "Sì"],
]);

const brandCorrections = new Map([
  ["Absolutely", "Absolut"],
  ["Diplomacy", "Diplomático"],
  ["Favorger", "Favarger"],
]);

const PRODUCTS = CAPTURE_ROWS.map(([productType, capturedBrand, capturedName, variant, price, compareAt, capturedPromotion, sourceUrl, sourceImage]) => {
  const relativeUrl = sourceUrl.replace(`${STOREFRONT}/`, "");
  const handle = slug(relativeUrl.split("#")[0]);
  const brand = brandCorrections.get(capturedBrand) || capturedBrand;
  const name = nameCorrections.get(handle) || capturedName;
  const promotion = /exclusive on travel|exklusiv auf reisen/i.test(capturedPromotion || "") ? "Travel exclusive" : capturedPromotion;
  return [brand, name, productType, variant, price, compareAt, promotion, relativeUrl, sourceImage];
});

const aliases = {
  "Fragrance": ["fragrance", "perfume", "scent", "beauty"],
  "Beauty & makeup": ["beauty", "makeup", "cosmetics", "lip", "palette"],
  "Beauty & skincare": ["beauty", "skincare", "skin care", "face", "body", "travel set"],
  "Spirits": ["spirits", "alcohol", "gin", "vodka", "rum", "liqueur"],
  "Swiss chocolate": ["chocolate", "confectionery", "snack", "Swiss", "sweet"],
  "Swiss gifts": ["Swiss", "local", "souvenir", "gift"],
};

function slug(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function downloadImage(product) {
  const image = product.images[0];
  const response = await fetch(image.requestUrl, {
    headers: { Accept: "image/webp,image/*;q=0.8", "User-Agent": "Mozilla/5.0 AvoltaDemoCatalogCapture/1.0" },
  });
  if (!response.ok) throw new Error(`${product.id}: image HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length <= 256) throw new Error(`${product.id}: image too small`);
  await writeFile(path.join(IMAGE_DIR, `${product.id}.webp`), bytes);
  image.downloadedBytes = bytes.length;
  return bytes.length;
}

await mkdir(IMAGE_DIR, { recursive: true });

const products = PRODUCTS.map(([brand, name, productType, variant, price, compareAt, promotion, relativeUrl, sourceImage]) => {
  const id = slug(`${brand}-${name}-${variant}`);
  const requestUrl = sourceImage.replace("f_auto", "f_webp");
  const isTravelExclusive = /travel exclusive/i.test(promotion || "");
  return {
    id,
    handle: slug(relativeUrl.split("#")[0]),
    name,
    description: `${name} by ${brand}, captured in the official Zürich Duty Free ${productType.toLowerCase()} selection.`,
    productType,
    tags: [brand, ...aliases[productType], promotion].filter(Boolean),
    vendor: brand,
    variant,
    sourceUrl: `${STOREFRONT}/${relativeUrl}`,
    priceCurrency: "CHF",
    priceChf: price,
    compareAtPriceChf: compareAt,
    promotionEvidence: promotion,
    travelExclusive: isTravelExclusive,
    attributes: { sizeOrFormat: variant, offer: promotion || null, sourceBasis: "Official category listing" },
    capturedAt: CAPTURED_AT,
    availabilityBasis: "Listed on the official Zürich Duty Free Reserve & Collect storefront when captured; not live physical-store inventory.",
    variants: [{ id: `${id}-default`, title: variant, availableOnlineAtCapture: true, priceChf: price, compareAtPriceChf: compareAt }],
    images: [{ id: `${id}-01`, position: 1, alt: `${brand} ${name}`, localPath: `/avolta-demo/products/${id}.webp`, sourceUrl: sourceImage, requestUrl, downloadedBytes: null }],
  };
});

const failures = [];
for (const product of products) {
  try {
    await downloadImage(product);
  } catch (error) {
    failures.push({ productId: product.id, error: error instanceof Error ? error.message : String(error) });
  }
}

const ids = new Set(products.map((product) => product.id));
const categories = Object.fromEntries([...new Set(products.map((product) => product.productType))]
  .map((category) => [category, products.filter((product) => product.productType === category).length]));
const checks = {
  uniqueStableIds: ids.size === products.length,
  allRequiredFields: products.every((p) => p.id && p.name && p.vendor && p.variant && p.sourceUrl && p.priceCurrency && Number.isFinite(p.priceChf)),
  allOfficialProductUrls: products.every((p) => p.sourceUrl.startsWith(`${STOREFRONT}/`)),
  allOfficialSourceImages: products.every((p) => p.images[0].sourceUrl.startsWith("https://images.shopdutyfree.com/")),
  allImagesDownloaded: products.every((p) => p.images[0].downloadedBytes > 256),
  noTobacco: products.every((p) => !/tobacco|cigar|cigarette/i.test(`${p.name} ${p.productType} ${p.tags.join(" ")}`)),
  currencyIsChf: products.every((p) => p.priceCurrency === "CHF"),
  minimumFourCategories: Object.keys(categories).length >= 4,
};

const catalog = {
  schemaVersion: 1,
  generatedAt: CAPTURED_AT,
  source: {
    storefront: `${STOREFRONT}/`,
    banner: "Zürich Duty Free",
    location: "Zurich Airport",
    currency: "CHF",
    locale: "de-CH",
    captureTimezone: "Europe/Zurich",
    note: "Curated demo selection captured from the official public Reserve & Collect storefront. Listed online availability is not live physical-store stock.",
  },
  products,
};

const report = {
  generatedAt: CAPTURED_AT,
  source: catalog.source,
  extraction: { capturedProductCount: products.length, downloadedImageCount: products.filter((p) => p.images[0].downloadedBytes > 256).length, categories },
  coverage: {
    before: { productCount: 45, brandCount: 30, categories: { "Fragrance": 10, "Beauty & makeup": 10, "Spirits": 10, "Swiss chocolate": 10, "Swiss gifts": 5 } },
    after: {
      productCount: products.length,
      brandCount: new Set(products.map((product) => product.vendor)).size,
      categories,
      priceRangeChf: Object.fromEntries(Object.keys(categories).map((category) => { const prices = products.filter((product) => product.productType === category).map((product) => product.priceChf); return [category, { min: Math.min(...prices), max: Math.max(...prices) }]; })),
    },
  },
  checks,
  failures,
  omissions: ["Tobacco excluded by product scope.", "Catalog is a captured 205-item demo selection, not the full storefront assortment.", "Public online listing status is not treated as live store inventory.", "Category cards did not consistently expose scent-family, flavor or style attributes; none were inferred."],
};

await writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({ catalog: CATALOG_PATH, report: REPORT_PATH, products: products.length, categories, checks, failures }, null, 2));
if (failures.length || Object.values(checks).some((value) => !value)) process.exitCode = 1;

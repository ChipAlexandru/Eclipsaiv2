// Rebuild the demo's photographed catalogue from Hausammann's public product pages.
// Run: node scripts/extract-hausammann-catalog.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const base = "https://www.zopfbeck.ch/";
const categories = [
  ["pro.bro", "Brote"],
  ["pro.pat", "Patisserie"],
  ["pro.tra", "Traiteur"],
  ["pro.con", "Confiserie"],
  ["pro.gla", "Glacerie"],
];
const assetDir = resolve(root, "public/hausammann-demo/products");
const brandDir = resolve(root, "public/hausammann-demo/brand");
const sourceDir = resolve(root, "src/hausammann-demo");
await Promise.all([mkdir(assetDir, { recursive: true }), mkdir(brandDir, { recursive: true })]);

const decode = (value) => value.replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const slug = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length < 500) throw new Error(`Unexpectedly small asset: ${url}`);
  await writeFile(destination, data);
  return data.length;
}

const products = [];
const assetJobs = [];
const counts = {};
for (const [page, productType] of categories) {
  const sourceUrl = new URL(page, base).href;
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`${response.status} ${sourceUrl}`);
  const html = await response.text();
  // Mobirise's photographed product cards keep each image immediately before its h4 title.
  const cards = [...html.matchAll(/<div class="card cart-block">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)];
  for (const [, card] of cards) {
    const image = card.match(/<img[^>]+src="(assets\/images\/[^"?]+)"/);
    const title = card.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
    if (!image || !title) continue;
    const name = decode(title[1]).replace(/[\u0000-\u001f]/g, "");
    if (!name) continue;
    const imageUrl = new URL(image[1], base).href;
    const originalFile = image[1].split("/").at(-1);
    const id = `${page.replace("pro.", "")}-${slug(name)}-${products.length + 1}`;
    const localPath = `/hausammann-demo/products/${originalFile}`;
    products.push({
      id, handle: slug(name), name, productType, description: "",
      tags: [productType], priceChf: null,
      images: [{ localPath, alt: name, sourceUrl: imageUrl }],
      sourceUrl,
    });
    assetJobs.push([imageUrl, resolve(assetDir, originalFile)]);
    counts[productType] = (counts[productType] || 0) + 1;
  }
}

const uniqueJobs = [...new Map(assetJobs.map(([url, path]) => [path, [url, path]])).values()];
for (let offset = 0; offset < uniqueJobs.length; offset += 6) {
  await Promise.all(uniqueJobs.slice(offset, offset + 6).map(([url, path]) => download(url, path)));
}
const logo = "assets/images/zopfbeck-3.ch-logo-white-dzbvz.png";
await download(new URL(logo, base).href, resolve(brandDir, "zopfbeck-logo-white.png"));

const catalog = {
  brand: "Bäckerei Hausammann · Zopf-Beck",
  source: base,
  extractedAt: new Date().toISOString(),
  priceBasis: "No current, per-item public prices were verified. Prices are omitted.",
  availabilityBasis: "Catalogue presence does not establish current store availability.",
  products,
};
await writeFile(resolve(sourceDir, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(resolve(sourceDir, "catalog-report.json"), `${JSON.stringify({
  source: base, extractedAt: catalog.extractedAt, counts, photographedProducts: products.length,
  locationSource: new URL("fil.uni", base).href,
  limitations: ["Only photographed products in five public category pages are included.", "No current prices, live inventory, ingredient or allergen feed was available.", "Seasonal and variant availability must be confirmed with Hausammann."],
}, null, 2)}\n`);
console.log(`Extracted ${products.length} photographed products`, counts);

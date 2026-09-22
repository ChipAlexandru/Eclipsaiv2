import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "src/honold-demo");
const imageDir = path.join(root, "public/honold-demo/products");
const snapshotDir = process.argv.find((argument) => argument.startsWith("--snapshot-dir="))?.split("=")[1];
const base = "https://shop.honold.ch";

function decode(value) {
  return value.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'");
}

async function getPage(page) {
  if (snapshotDir) {
    const name = page === 1 ? "honold-shop.html" : `honold-shop-${page}.html`;
    return fs.readFile(path.join(snapshotDir, name), "utf8");
  }
  const url = page === 1 ? `${base}/shop/` : `${base}/shop/?product-page=${page}`;
  const response = await fetch(url, { headers: { "User-Agent": "Honold demo catalogue snapshot" } });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.text();
}

function extractPage(html, page) {
  const blocks = [...html.matchAll(/<li class="repeater-item product ([\s\S]*?)<\/li>/g)];
  if (!blocks.length) throw new Error(`No products on page ${page}`);
  return blocks.map(([, block]) => {
    const id = block.match(/post-(\d+)/)?.[1];
    if (!block.includes("product-type-simple")) throw new Error(`Unsupported variant product ${id || "unknown"}`);
    const category = block.match(/product_cat-([\w-]+)/)?.[1] || "other";
    const title = block.match(/<h5[^>]*><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const amount = block.match(/woocommerce-Price-amount amount[\s\S]*?&nbsp;([\d.]+)/)?.[1];
    const sourceImage = block.match(/<img[^>]*data-src="([^"]+)"/)?.[1];
    const imgTag = block.match(/<img[^>]*data-src="[^"]+"[^>]*>/)?.[0] || "";
    const thumb = imgTag.match(/(https:\/\/shop\.honold\.ch\/wp-content\/uploads\/[^" ]+-300x300\.(?:png|jpe?g|webp)) 300w/)?.[1];
    if (!id || !title || !amount || !sourceImage) throw new Error(`Incomplete product ${id || "unknown"} on page ${page}`);
    const name = decode(title[2].replace(/<[^>]*>/g, "")).trim();
    const imageUrl = decode(thumb || sourceImage);
    const extension = path.extname(new URL(imageUrl).pathname).toLowerCase();
    if (!/\.(png|jpg|jpeg|webp)$/.test(extension)) throw new Error(`Unsupported image ${imageUrl}`);
    return {
      id, handle: new URL(title[1]).pathname.split("/").filter(Boolean).at(-1), name,
      productType: category.replaceAll("-", " "), tags: [], description: "",
      sourceUrl: decode(title[1]), priceCurrency: "CHF", priceChf: Number(amount),
      images: [{ alt: name, localPath: `/honold-demo/products/${id}${extension}`, sourceUrl: decode(sourceImage), requestUrl: imageUrl }],
    };
  });
}

async function main() {
  const first = await getPage(1);
  const pageNumbers = [...first.matchAll(/\/shop\/\?product-page=(\d+)/g)].map((match) => Number(match[1]));
  const totalPages = Math.max(1, ...pageNumbers);
  const pages = [first];
  for (let page = 2; page <= totalPages; page++) pages.push(await getPage(page));
  const products = pages.flatMap((html, index) => extractPage(html, index + 1));
  if (new Set(products.map((product) => product.id)).size !== products.length) throw new Error("Duplicate product IDs");
  await fs.mkdir(imageDir, { recursive: true });
  const failures = [];
  for (let index = 0; index < products.length; index += 8) {
    await Promise.all(products.slice(index, index + 8).map(async (product) => {
      const image = product.images[0];
      const target = path.join(root, "public", image.localPath.slice(1));
      try {
        const response = await fetch(image.requestUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 256) throw new Error("Image too small");
        await fs.writeFile(target, bytes);
        image.downloadedBytes = bytes.length;
      } catch (error) {
        failures.push({ productId: product.id, imageUrl: image.requestUrl, error: String(error) });
      }
    }));
  }
  if (failures.length) throw new Error(`Image failures: ${JSON.stringify(failures)}`);
  const generatedAt = new Date().toISOString();
  const catalog = {
    schemaVersion: 1, generatedAt,
    source: { storefront: base, collectionUrl: `${base}/shop/`, currency: "CHF",
      note: "Public online-shop snapshot. Prices can change. No live stock, confirmed pickup, reservation, payment, or order data." },
    products,
  };
  const report = { generatedAt, sourceUrl: `${base}/shop/`, pagesFetched: totalPages,
    listedProductCount: products.length, downloadedImageCount: products.length, failures,
    priceBasis: "One displayed CHF price per simple product on the seven public shop listing pages. Variable products are rejected by the extractor.",
    limitations: ["Only shop listing pages are captured; product detail ingredients, allergens, and custom options are not included.",
      "Gutscheine are promoted through a separate navigation route and are not represented in this seven-page listing snapshot.",
      "Online listing does not prove physical-store availability or current prices at checkout."] };
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
  await fs.writeFile(path.join(sourceDir, "catalog-report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`Honold: ${products.length} products, ${products.length} photos, ${totalPages} pages`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

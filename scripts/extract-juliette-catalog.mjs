#!/usr/bin/env node

/**
 * Rebuild the Juliette demo catalogue from the public Shopify storefront.
 *
 * The script deliberately uses only public, non-transactional endpoints. It
 * reconciles every handle shown across /collections/all pagination against the
 * public products feed, downloads every gallery image at a web-sized maximum,
 * and writes both app data and a machine-readable completeness report.
 *
 * Usage: node scripts/extract-juliette-catalog.mjs [--force]
 */

import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const STORE_ORIGIN = "https://juliette-boulangerie.ch";
const COLLECTION_PATH = "/collections/all";
const PRODUCTS_PATH = "/products.json?limit=250";
const MAX_COLLECTION_PAGES = 50;
const IMAGE_WIDTH = 1400;

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "juliette-demo");
const IMAGE_DIR = path.join(ROOT, "public", "juliette-demo", "products");
const force = process.argv.includes("--force");

const fetchedSources = [];
const failures = [];

function absoluteStoreUrl(value) {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  return new URL(value, STORE_ORIGIN).toString();
}

function decodeEntities(value = "") {
  const entities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match);
}

function htmlToText(value = "") {
  return decodeEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function productHandlesFromCollection(html) {
  const handles = [];
  const pattern = /href=["']\/products\/([^"'?#/]+)(?:[?#][^"']*)?["']/gi;
  for (const match of html.matchAll(pattern)) {
    if (!handles.includes(match[1])) handles.push(match[1]);
  }
  return handles;
}

async function fetchChecked(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": "Eclipsai-Juliette-Demo-Catalog/1.0 (+https://eclipsai.com)",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  fetchedSources.push({ url, status: response.status, contentType: response.headers.get("content-type") });
  return response;
}

async function collectListedHandles() {
  const handles = [];
  const pageUrls = [];

  for (let page = 1; page <= MAX_COLLECTION_PAGES; page += 1) {
    const pageUrl = `${STORE_ORIGIN}${COLLECTION_PATH}?page=${page}`;
    const html = await (await fetchChecked(pageUrl)).text();
    const pageHandles = productHandlesFromCollection(html);
    pageUrls.push({ page, url: pageUrl, productCount: pageHandles.length });

    if (pageHandles.length === 0) break;
    for (const handle of pageHandles) {
      if (!handles.includes(handle)) handles.push(handle);
    }

    const hasNextPage = new RegExp(`data-page-url=["'][^"']*page=${page + 1}(?:[&"'])`, "i").test(html);
    if (!hasNextPage) break;
  }

  return { handles, pageUrls };
}

function imageExtension(contentType, sourceUrl) {
  const normalized = (contentType || "").split(";")[0].trim().toLowerCase();
  const map = {
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  if (map[normalized]) return map[normalized];
  const candidate = path.extname(new URL(sourceUrl).pathname).toLowerCase();
  return [".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"].includes(candidate)
    ? (candidate === ".jpeg" ? ".jpg" : candidate)
    : ".jpg";
}

async function existsAndNonEmpty(filePath) {
  try {
    return (await stat(filePath)).size > 0;
  } catch {
    return false;
  }
}

async function downloadImage(productId, index, rawUrl) {
  const sourceUrl = absoluteStoreUrl(rawUrl);
  const requestUrl = new URL(sourceUrl);
  requestUrl.searchParams.set("width", String(IMAGE_WIDTH));

  const response = await fetchChecked(requestUrl.toString(), {
    headers: { Accept: "image/avif,image/webp,image/jpeg,image/png,image/*" },
  });
  const extension = imageExtension(response.headers.get("content-type"), sourceUrl);
  const filename = `${productId}-${String(index + 1).padStart(2, "0")}${extension}`;
  const outputPath = path.join(IMAGE_DIR, filename);

  if (!force && await existsAndNonEmpty(outputPath)) {
    return { localPath: `/juliette-demo/products/${filename}`, sourceUrl, requestUrl: requestUrl.toString() };
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 256) throw new Error(`Image response was unexpectedly small (${bytes.length} bytes)`);
  const temporaryPath = `${outputPath}.partial`;
  await writeFile(temporaryPath, bytes);
  await rename(temporaryPath, outputPath);

  return {
    localPath: `/juliette-demo/products/${filename}`,
    sourceUrl,
    requestUrl: requestUrl.toString(),
    downloadedBytes: bytes.length,
  };
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(IMAGE_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const [{ handles: listedHandles, pageUrls }, productsPayload] = await Promise.all([
    collectListedHandles(),
    fetchChecked(`${STORE_ORIGIN}${PRODUCTS_PATH}`).then((response) => response.json()),
  ]);

  const sourceProducts = Array.isArray(productsPayload?.products) ? productsPayload.products : [];
  const productsByHandle = new Map(sourceProducts.map((product) => [product.handle, product]));
  const missingFromFeed = listedHandles.filter((handle) => !productsByHandle.has(handle));
  const feedNotListed = sourceProducts.map((product) => product.handle).filter((handle) => !listedHandles.includes(handle));

  const products = [];
  for (const handle of listedHandles) {
    const product = productsByHandle.get(handle);
    if (!product) continue;

    const images = [];
    for (const [imageIndex, image] of (product.images || []).entries()) {
      try {
        images.push({
          id: String(image.id ?? `${product.id}-${imageIndex + 1}`),
          position: image.position ?? imageIndex + 1,
          width: image.width ?? null,
          height: image.height ?? null,
          alt: image.alt ?? product.title,
          ...(await downloadImage(product.id, imageIndex, image.src)),
        });
      } catch (error) {
        failures.push({
          type: "image_download",
          productId: String(product.id),
          handle,
          imageIndex,
          sourceUrl: absoluteStoreUrl(image.src),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    products.push({
      id: String(product.id),
      handle,
      name: product.title,
      description: htmlToText(product.body_html),
      productType: product.product_type || null,
      tags: Array.isArray(product.tags) ? product.tags : [],
      vendor: product.vendor || null,
      publishedAt: product.published_at || null,
      createdAt: product.created_at || null,
      updatedAt: product.updated_at || null,
      sourceUrl: `${STORE_ORIGIN}/products/${handle}`,
      priceCurrency: "CHF",
      priceChf: Number(product.variants?.[0]?.price ?? 0),
      variants: (product.variants || []).map((variant) => ({
        id: String(variant.id),
        title: variant.title,
        sku: variant.sku || null,
        availableOnline: Boolean(variant.available),
        priceChf: Number(variant.price),
        compareAtPriceChf: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
        grams: variant.grams ?? null,
      })),
      images,
    });
  }

  const expectedImageCount = products.reduce((sum, product) => {
    return sum + (productsByHandle.get(product.handle)?.images?.length || 0);
  }, 0);
  const downloadedImageCount = products.reduce((sum, product) => sum + product.images.length, 0);
  const duplicateIds = products
    .map((product) => product.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);
  const productsWithoutImages = products.filter((product) => product.images.length === 0).map((product) => product.handle);

  const checks = {
    collectionAndFeedHandlesMatch: missingFromFeed.length === 0 && feedNotListed.length === 0,
    allListedProductsMapped: products.length === listedHandles.length,
    allGalleryImagesDownloaded: downloadedImageCount === expectedImageCount,
    allProductIdsUnique: duplicateIds.length === 0,
    everyProductHasAnImage: productsWithoutImages.length === 0,
    noFailures: failures.length === 0,
  };

  const catalog = {
    schemaVersion: 1,
    generatedAt,
    source: {
      storefront: STORE_ORIGIN,
      collectionUrl: `${STORE_ORIGIN}${COLLECTION_PATH}`,
      productsFeedUrl: `${STORE_ORIGIN}${PRODUCTS_PATH}`,
      currency: "CHF",
      note: "Public online catalogue data only. Online availability is not physical Erlenbach stock.",
    },
    products,
  };

  const report = {
    schemaVersion: 1,
    generatedAt,
    extraction: {
      collectionPagesFetched: pageUrls.length,
      pageUrls,
      listedProductCount: listedHandles.length,
      feedProductCount: sourceProducts.length,
      mappedProductCount: products.length,
      expectedGalleryImageCount: expectedImageCount,
      downloadedGalleryImageCount: downloadedImageCount,
      imageWidthRequested: IMAGE_WIDTH,
    },
    reconciliation: {
      missingFromFeed,
      feedNotListed,
      duplicateIds,
      productsWithoutImages,
    },
    checks,
    failures,
    fetchedSources,
  };

  await writeFile(path.join(DATA_DIR, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
  await writeFile(path.join(DATA_DIR, "catalog-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({ ...report.extraction, checks, failures: failures.length }, null, 2));
  if (Object.values(checks).some((passed) => !passed)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});

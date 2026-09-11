import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CAPTURED_AT = "2026-09-11T17:30:00+02:00";
const STOREFRONT = "https://zurich.shopdutyfree.com/de/48";
const IMAGE_DIR = path.join(ROOT, "public", "avolta-demo", "products");
const CATALOG_PATH = path.join(ROOT, "src", "avolta-demo", "catalog.json");
const REPORT_PATH = path.join(ROOT, "src", "avolta-demo", "catalog-report.json");

// Captured from the official Zürich Duty Free Reserve & Collect storefront on
// 2026-09-11 using the rendered category and product pages. Prices and offer
// labels are a public-web snapshot, not live physical-store inventory.
const PRODUCTS = [
  ["Creed", "Aventus 50ml", "Fragrance", "50ml", 192.5, null, null, "creed-aventus-100ml-eau-de-parfum#50ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_1000,w_1000/v1747304148/4903687/4903687_1_en_GB.png"],
  ["Chloé", "Love Story 75ml", "Fragrance", "75ml", 54.95, 125.5, "55% off", "chloe-love-story-50ml-eau-de-parfum#75ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1712066726/2363726/2363726_1_en_GB.png"],
  ["Amouage", "Guidance 46 100ml", "Fragrance", "100ml", 373, null, null, "amouage-guidance-46-100ml-pure-parfum", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1746541258/6542717/6542717_1_en_GB.png"],
  ["Lancôme", "La Vie Est Belle 15ml", "Fragrance", "15ml", 41.95, 89.95, null, "lancome-la-vie-est-belle-50ml-eau-de-parfum#15ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1585744412/040/003/001/3825953/3825953_1_default_default.jpg"],
  ["Maison Francis Kurkdjian", "Baccarat Rouge 540 Extrait de Parfum 35ml", "Fragrance", "35ml", 185.5, null, null, "maison-francis-kurkdjian-baccarat-rouge-540-extrait-de-parfum-70ml-eau-de-parfum#35ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1771258318/5530024/5530024_1_en_GB.png"],
  ["Parfums de Marly", "Delina Exclusif Parfum 30ml", "Fragrance", "30ml", 158.95, null, null, "parfums-de-marly-delina-exclusif-parfum-75ml-eau-de-parfum#30ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1753689606/6528878/6528878_1_en_GB.jpg"],
  ["Prada", "Paradoxe 50ml", "Fragrance", "50ml", 96.95, 115, null, "prada-paradoxe-90ml-eau-de-parfum#50ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1742983587/5250863/5250863_1_en_GB.jpg"],
  ["Calvin Klein", "CK Free for Men 100ml", "Fragrance", "100ml", 19.95, 68.5, "70% off", "calvin-klein-ck-free-for-men-50ml-eau-de-toilette#100ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1747304226/2042208/2042208_1_en_GB.jpg"],
  ["Lancôme", "Idôle 100ml", "Fragrance", "100ml", 79.95, 89.95, "Club Avolta price", "lancome-idole-100ml-eau-de-parfum#100ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1753719795/4529785/4529785_1_en_GB.png"],
  ["Hugo Boss", "Boss Bottled 100ml", "Fragrance", "100ml", 69.95, 73.95, "30% offer shown", "hugo-boss-boss-bottled-100ml-eau-de-toilette#100ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1756137605/1001400/1001400_1_en_GB.jpg"],

  ["Dior", "Addict Lip Glow Duo 2x3.2g", "Beauty & makeup", "2x3.2g", 65.95, null, "Travel exclusive", "dior-addict-lip-glow-2x32g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1736510479/6725559/6725559_1_en_GB.png"],
  ["Clarins", "Lip Perfector Duo 05 & 06 2x12ml", "Beauty & makeup", "2x12ml", 29.95, 36.95, "15% off", "clarins-lip-perfector-duo-05-06-2x12ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1729858132/6542034/6542034_1_en_GB.jpg"],
  ["Clarins", "Lip Perfector Duo 01 & 02 2x12ml", "Beauty & makeup", "2x12ml", 29.95, 36.95, "15% off", "clarins-lip-perfector-duo-01-02-2x12ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1729857705/6542033/6542033_1_en_GB.jpg"],
  ["Charlotte Tilbury", "Airbrush Setting Spray 100ml", "Beauty & makeup", "100ml", 41.5, null, null, "charlotte-tilbury-airbrush-setting-spray-100ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1694624486/5168296/5168296_1_en_GB.jpg"],
  ["Lancôme", "All Eye Need Set", "Beauty & makeup", "2ml + 5ml + 30ml + 1.14g", 19.95, 24.5, "Travel set · 15% off", "lancome-all-eye-need-set-2ml-5ml-30ml-114g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1718013860/6341544/6341544_1_en_GB.jpg"],
  ["Clarins", "Lip Perfector Duo 01 & 08 2x12ml", "Beauty & makeup", "2x12ml", 29.95, 36.95, "15% off", "clarins-lip-perfector-duo-01-08-2x12ml", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1729858149/6542035/6542035_1_en_GB.jpg"],
  ["Lancôme", "L'Absolu Palette New Harmony", "Beauty & makeup", "2 pcs", 106.5, null, null, "lancome-labsolu-palette-new-harmony-2-pcs", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1649945717/4996147/4996147_1_en_GB.jpg"],
  ["Dior", "Backstage Glow Maximizer Palette", "Beauty & makeup", "10g", 46.5, null, null, "dior-backstage-glow-maximizer-palette-multiuse-highlighter-and-blush-palette-dedadb001-universal-glow-10g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1756682229/6902193/6902193_1_en_GB.png"],
  ["Kylie Cosmetics", "Matte Lip Kit", "Beauty & makeup", "3.25g + 1g", 29.95, null, "New", "kylie-cosmetics-matte-lip-kit-b44065102-extraordinary-325g-1g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1637087689/5070011/5070011_1_en_GB.jpg"],
  ["Dior", "Addict Lip Glow Max Duo Set", "Beauty & makeup", "6ml + 3.2g", 65.95, null, "Travel exclusive", "dior-addict-lip-glow-max-duo-set-6ml-32g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1733335952/6725560/6725560_1_en_GB.jpg"],

  ["Studer", "Swiss Gold Gin", "Spirits", "70cl", 52.9, null, "Swiss selection", "studer-swiss-gold-gin-70cl", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1681459241/6008862/6008862_1_en_GB.jpg"],
  ["Absolut", "Original Vodka Sweden", "Spirits", "1l", 8, 10, "20% off", "absolut-original-vodka-sweden-1l-1000224p1134283", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1709719255/1000224/1000224_1_en_GB.jpg"],
  ["Grey Goose", "Vodka", "Spirits", "1l", 15, 18.75, "20% off", "grey-goose-vodka-1l-1040885p1136988", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1737043296/1040885/1040885_1_en_GB.png"],
  ["Belvedere", "Vodka", "Spirits", "1l", 39.6, null, null, "belvedere-vodka-1l", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1764074462/1040910/1040910_1_en_GB.jpg"],
  ["Bombay Sapphire", "Dry Gin", "Spirits", "1l", 21, 30, "30% off", "bombay-sapphire-dry-gin-1l-6510773p1214063", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1715788867/6510773/6510773_1_en_GB.jpg"],
  ["Studer", "Swiss Gold Vieille Prune", "Spirits", "70cl", 67.9, null, "Swiss selection", "studer-swiss-gold-vieille-prune-70cl", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1716567108/6010069/6010069_1_en_GB.jpg"],
  ["Gin Mare", "Capri Mediterranean Gin", "Spirits", "1l", 34.4, null, null, "gin-mare-capri-mediterranean-gin-1l", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1707307431/3507042/3507042_1_en_GB.jpg"],
  ["Zacapa", "No. 23 Rum", "Spirits", "1l", 55.5, null, null, "zacapa-no23-1l", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1650464061/1974792/1974792_1_en_GB.jpg"],
  ["Etter", "Edelweiss Zuger Kirsch", "Spirits", "35cl", 29.9, null, "Swiss selection", "etter-edelweiss-zuger-kirsch-35cl", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1711022749/1000290/1000290_1_en_GB.png"],
  ["Diplomático", "Reserva Exclusiva Rum", "Spirits", "1l", 41.52, 51.9, "20% off", "diplomatico-reserva-exclusive-1l", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1731513698/6479884/6479884_1_en_GB.jpg"],

  ["Villars", "Assorted Mini Milk Chocolates", "Swiss chocolate", "500g", 23.16, 28.95, "20% off", "villars-assorted-mini-chocolates-milk-500g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1643198440/1811939/1811939_1_en_GB.jpg"],
  ["Munz", "Swiss View Napolitains", "Swiss chocolate", "140g", 16.76, 20.95, "20% off", "munz-swiss-view-napolitains-140g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1711641456/2102143/2102143_1_en_GB.jpg"],
  ["Munz", "Swiss Views", "Swiss chocolate", "300g", 10.36, 12.95, null, "munz-swiss-views-300g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1711641445/1973098/1973098_1_en_GB.jpg"],
  ["SwissDream", "Swiss Box", "Swiss chocolate", "80g", 13.5, null, null, "swissdream-swiss-box-80g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1710856973/2233315/2233315_1_en_GB.jpg"],
  ["Villars", "Swiss Milk Chocolate with Hazelnuts", "Swiss chocolate", "300g", 11.6, 14.5, "20% off", "villars-swiss-milk-chocolate-with-hazelnuts-300g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1643198464/2988356/2988356_1_en_GB.jpg"],
  ["Villars", "Swiss Milk Chocolate", "Swiss chocolate", "300g", 11.6, 14.5, "20% off", "villars-swiss-milk-chocolate-300g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1643198453/2528123/2528123_1_en_GB.jpg"],
  ["Victorinox", "Chocolate Knife Giftpack", "Swiss chocolate", "140g", 13.5, null, null, "victorinox-chocolate-knife-acetate-giftpack-140g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1541433753/030/001/001/7610307030100/7610307030100_1_default_default.jpg"],
  ["Favarger", "La Boîte Zurich Edition", "Swiss chocolate", "240g", 21.2, 26.5, "20% off", "favarger-la-boite-zurich-edition-240g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1712059691/2643387/2643387_1_en_GB.png"],
  ["Favarger", "Milk Chocolate Bar", "Swiss chocolate", "300g", 15.95, null, null, "favarger-tablette-chocolat-lait-300g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1711641483/2345449/2345449_1_en_GB.jpg"],
  ["Ragusa", "Ragusa Milk Gift Pack", "Swiss chocolate", "400g", 19.95, null, null, "ragusa-ragusa-milk-gift-pack-400g", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1504696133/030/090/001/1951156/1951156_1_default_default.jpg"],

  ["Alpinte", "On the Rocks Matterhorn", "Swiss gifts", "As listed", 27.9, null, "New", "alpinte-on-the-rocks-matterhorn", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1741874760/6369914/6369914_1_en_GB.png"],
  ["Alpinte", "Half-Pinte Matterhorn", "Swiss gifts", "As listed", 28.9, null, null, "alpinte-halfpinte-matterhorn", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1741874751/6369915/6369915_1_en_GB.png"],
  ["Alpinte", "Panorama Shots", "Swiss gifts", "Set of 6", 79.9, null, null, "alpinte-panorama-shots-6x", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1741874769/6486995/6486995_1_en_GB.jpg"],
  ["Mawico", "Winter Cow Plush Keychain", "Swiss gifts", "As listed", 16.9, null, "New", "mawico-winter-cow-plush-keychain", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1748520011/1891781/1891781_1_en_GB.jpg"],
  ["Mawico", "Sitting Trio Cow Plush", "Swiss gifts", "28cm", 24.9, null, "New", "mawico-sitting-trio-cow-plush-28cm-1891783p1192631", "https://images.shopdutyfree.com/image/upload/c_pad,f_auto,h_542,w_542/v1748520016/1891783/1891783_1_en_GB.jpg"],
];

const aliases = {
  "Fragrance": ["fragrance", "perfume", "scent", "beauty"],
  "Beauty & makeup": ["beauty", "makeup", "cosmetics", "lip", "palette"],
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
  const id = slug(`${brand}-${name}`);
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
  checks,
  failures,
  omissions: ["Tobacco excluded by product scope.", "Catalog is a curated demo selection, not the full storefront assortment.", "Public online listing status is not treated as live store inventory."],
};

await writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({ catalog: CATALOG_PATH, report: REPORT_PATH, products: products.length, categories, checks, failures }, null, 2));
if (failures.length || Object.values(checks).some((value) => !value)) process.exitCode = 1;

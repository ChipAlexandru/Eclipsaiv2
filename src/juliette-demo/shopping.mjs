import { sampleQuantity } from "./stockAdapter.mjs";

export const INITIAL_DEMO_HANDLES = [
  "butter-croissant",
  "pain-au-chocolat-3",
  "croissant-aux-amandes-1",
  "chausson-aux-pommes-1",
  "pain-aux-raisins",
  "raspberry-croissant",
  "baby-brioche",
  "cookie",
  "baguette-de-tradition-francaise-2",
  "dinkelbrot",
  "sauerteig-bauernbrot",
  "quiche-lorraine",
  "tartelette-au-citron-meringuee-1",
  "royal-au-chocolat-3",
  "blueberry-eclair",
  "sandwich-mit-mozzarella-und-pesto",
];

export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchCatalog(products, query, limit = 12) {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 12, 20));
  if (terms.length === 0) return products.slice(0, boundedLimit);

  return products
    .map((product, sourceIndex) => {
      const name = normalizeSearchText(product.name);
      const handle = normalizeSearchText(product.handle);
      const tags = normalizeSearchText(product.tags?.join(" "));
      const type = normalizeSearchText(product.productType);
      const description = normalizeSearchText(product.description);
      const aliases = normalizeSearchText(searchAliases(product));
      let score = 0;
      for (const term of terms) {
        if (name === term) score += 20;
        if (name.includes(term)) score += 9;
        if (handle.includes(term)) score += 6;
        if (type.includes(term) || tags.includes(term)) score += 3;
        if (aliases.includes(term)) score += 4;
        if (description.includes(term)) score += 1;
      }
      return { product, score, sourceIndex };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.sourceIndex - b.sourceIndex)
    .slice(0, boundedLimit)
    .map(({ product }) => product);
}

function searchAliases(product) {
  const value = normalizeSearchText(`${product.handle} ${product.name}`);
  const aliases = [];
  if (/brot|bread|baguette/.test(value)) aliases.push("bread loaf bakery staple");
  if (/croissant|chocolat|raisins|brioche|milk bun|milchbrotchen|chausson|cannele|suisse/.test(value)) {
    aliases.push("viennoiserie breakfast pastry sweet");
  }
  if (/tart|tarte|cake|eclair|cookie|macaron|pavlova|fraisier|charlotte|royal|tokyo|pecan|honore|aprikose|feigen|patisserie/.test(value)) {
    aliases.push("patisserie pastry dessert sweet cake");
  }
  if (/sandwich|salat|salade|quiche|ficelle|spiess|skewer|burger|platte|gougere|laugen/.test(value)) {
    aliases.push("lunch savoury savory");
  }
  if (/gutschein|voucher/.test(value)) aliases.push("gift voucher");
  return aliases.join(" ");
}

export function initialDemoProducts(products) {
  const byHandle = new Map(products.map((product) => [product.handle, product]));
  return INITIAL_DEMO_HANDLES.map((handle) => byHandle.get(handle)).filter(Boolean);
}

export function sampleStockFor(productId) {
  return sampleQuantity(productId);
}

export function changeBasket(basket, productId, quantity, mode, validProductIds) {
  if (!validProductIds.has(productId)) throw new Error("Unknown product ID.");
  const amount = Math.max(0, Math.min(24, Math.trunc(Number(quantity) || 0)));
  const current = basket[productId] || 0;
  let nextQuantity;
  if (mode === "add") nextQuantity = Math.min(24, current + Math.max(1, amount));
  else if (mode === "remove") nextQuantity = Math.max(0, current - Math.max(1, amount));
  else if (mode === "set") nextQuantity = amount;
  else throw new Error("Basket mode must be add, remove, or set.");

  const next = { ...basket };
  if (nextQuantity === 0) delete next[productId];
  else next[productId] = nextQuantity;
  return next;
}

export function basketSummary(basket, productsById) {
  const items = Object.entries(basket)
    .map(([productId, quantity]) => {
      const product = productsById.get(productId);
      if (!product) return null;
      return {
        productId,
        name: product.name,
        quantity,
        unitPriceChf: product.priceChf,
        lineTotalChf: Number((product.priceChf * quantity).toFixed(2)),
      };
    })
    .filter(Boolean);
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalChf: Number(items.reduce((sum, item) => sum + item.lineTotalChf, 0).toFixed(2)),
  };
}

export function shoppingStateSnapshot({ visibleIds, selectedId, basket }, productsById) {
  return {
    visibleProducts: visibleIds.map((id) => productsById.get(id)).filter(Boolean).map(compactProduct),
    selectedProduct: selectedId ? compactProduct(productsById.get(selectedId)) : null,
    basket: basketSummary(basket, productsById),
    stockBasis: "Clearly labelled sample Erlenbach stock for demonstration only; not live store inventory.",
  };
}

export function compactProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    priceChf: product.priceChf,
    productType: product.productType,
    sampleStock: sampleStockFor(product.id),
  };
}

export function transcriptFromHistory(history) {
  return history
    .filter((item) => item.type === "message" && (item.role === "user" || item.role === "assistant"))
    .flatMap((item) => item.content.map((content) => {
      const text = content.text || content.transcript;
      return text ? { id: item.itemId, role: item.role, text } : null;
    }))
    .filter(Boolean)
    .slice(-4);
}

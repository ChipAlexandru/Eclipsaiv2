"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Captions,
  ChevronDown,
  Check,
  MapPin,
  MicOff,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Truck,
  X,
} from "lucide-react";
import {
  basketSummary,
  changeBasket,
  compactProduct,
  searchCatalog,
  shoppingStateSnapshot,
  transcriptFromHistory,
} from "./shopping.mjs";
import styles from "./honoldVoiceShop.module.css";
import {
  DEMO_BRANCHES, DEMO_DELIVERY_ADDRESS, DEMO_PROFILES, advancePreview, fulfillmentCheck,
  futureDeliveryWindows, futureSlots, makePreview, offerQuote, pickupCheck, previewStatus,
  sampleStock, slotDateId, slotDayLabel, slotLabel, zurichParts,
} from "./pickupJourney.mjs";
import {
  DEMO_VARIANTS, SAMPLE_CUSTOMERS, approveReview, basketKey, itemOffer, makeReviewId, parseOrdersByProfile,
  pickupCodeForReview, reviewFingerprint, saveSampleOrder, serializeOrdersByProfile,
} from "./experience.mjs";
import { orderIdentity, qrMatrix } from "./orderQr.mjs";
import { LANGUAGES, copyFor, localeFor, localizeReason, localizeStatus, productName, voiceInstructions } from "./i18n.mjs";

const IMAGE_WAIT_MS = 4500;
const VOICE_SESSION_DURATION_MS = 5 * 60 * 1000;

function formatChf(value, language = "de") {
  return new Intl.NumberFormat(localeFor(language), {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(value);
}

const CATEGORY_NAMES = {
  "patisserie und torten": "Pâtisserie",
  baeckerei: "Bakery",
  traiteur: "Savoury",
  schokolade: "Chocolate",
  konfekt: "Confections",
};

const PRESENTER_SCENARIOS = [
  { id: "new", label: "First visit", profileId: "guest", category: "all", featuredProductId: "1917" },
  { id: "regular", label: "Regular", profileId: "regular", category: "offer", featuredProductId: "1366" },
  { id: "gift", label: "Gift", profileId: "chocolate", category: "schokolade", featuredProductId: "255" },
];

const GIFT_OPTION_PRODUCT_IDS = new Set(["255", "265", "2518"]);

function safeToolResult(value) {
  return JSON.stringify(value);
}

function localizedProduct(product, language) {
  const compact = compactProduct(product);
  return compact ? { ...compact, name: productName(product, language) } : null;
}

function OrderQr({ order, language }) {
  const c = copyFor(language);
  const identity = orderIdentity(order);
  const matrix = qrMatrix(identity);
  const quiet = 4;
  const size = matrix.length + quiet * 2;
  return <figure className={styles.orderQr}>
    <svg role="img" aria-label={`${c.qrAlt} ${order.pickupCode}`} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fffdf6" />
      {matrix.flatMap((row, y) => row.map((black, x) => black
        ? <rect key={`${x}-${y}`} x={x + quiet} y={y + quiet} width="1" height="1" fill="#3b1e10" /> : null))}
    </svg>
    <figcaption className={styles.srOnly}>{c.qrAlt} {order.pickupCode}</figcaption>
  </figure>;
}

export function HonoldVoiceShop({ catalog, voiceEnabled = false }) {
  const products = catalog.products;
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const validProductIds = useMemo(() => new Set(productsById.keys()), [productsById]);

  const [scenarioId, setScenarioId] = useState("regular");
  const [language, setLanguage] = useState("en");
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [visibleIds, setVisibleIds] = useState(() => products.filter((product) => ["baeckerei", "patisserie und torten"].includes(product.productType)).map((product) => product.id));
  const [activeCategory, setActiveCategory] = useState("offer");
  const [selectedId, setSelectedId] = useState(null);
  const [basket, setBasket] = useState({});
  const [basketOpen, setBasketOpen] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Talk to Shop");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [pickupSimulation, setPickupSimulation] = useState(null);
  const [branchId, setBranchId] = useState("erlenbach");
  const [fulfillmentMode, setFulfillmentMode] = useState("pickup");
  const [fulfillmentOpen, setFulfillmentOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(DEMO_DELIVERY_ADDRESS);
  const [deliveryWindowId, setDeliveryWindowId] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [profileId, setProfileId] = useState("regular");
  const [slotId, setSlotId] = useState(null);
  const [pickupDay, setPickupDay] = useState(null);
  const [clockMs, setClockMs] = useState(null);
  const [pickupError, setPickupError] = useState("");
  const [imageFailures, setImageFailures] = useState(() => new Set());
  const [detailProductId, setDetailProductId] = useState(null);
  const [detailOptions, setDetailOptions] = useState({ message: "None", wrap: "Standard" });
  const [shopView, setShopView] = useState("shop");
  const [ordersByProfile, setOrdersByProfile] = useState({});
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [pendingReview, setPendingReview] = useState(null);
  const [reviewAttempted, setReviewAttempted] = useState(false);

  const sessionRef = useRef(null);
  const languageRef = useRef(language);
  const voiceTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const presentationSequenceRef = useRef(0);
  const productGridRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const captionsButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const drawerCloseRef = useRef(null);
  const pickupResultRef = useRef(null);
  const previousFocusRef = useRef(null);
  const visibleIdsRef = useRef(visibleIds);
  const selectedIdRef = useRef(selectedId);
  const basketRef = useRef(basket);
  const branchRef = useRef(branchId);
  const profileRef = useRef(profileId);
  const slotRef = useRef(slotId);
  const fulfillmentModeRef = useRef(fulfillmentMode);
  const deliveryAddressRef = useRef(deliveryAddress);
  const deliveryWindowRef = useRef(deliveryWindowId);
  const clockRef = useRef(clockMs);
  const pickupRef = useRef(pickupSimulation);
  const pendingReviewRef = useRef(null);
  const ordersRef = useRef({});
  const reviewSequenceRef = useRef(0);
  const imageFailuresRef = useRef(new Set());

  const c = copyFor(language);
  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const branch = DEMO_BRANCHES.find((item) => item.id === branchId);
  const quote = offerQuote(profileId, basketDetails, productsById);
  const activeScenario = PRESENTER_SCENARIOS.find((scenario) => scenario.id === scenarioId) || PRESENTER_SCENARIOS[0];
  const requestedFeaturedProduct = productsById.get(activeScenario.featuredProductId);
  const featuredProduct = requestedFeaturedProduct && sampleStock(requestedFeaturedProduct.id, branchId) > 0
    ? requestedFeaturedProduct
    : visibleProducts.find((product) => sampleStock(product.id, branchId) > 0) || requestedFeaturedProduct;
  const pickupOptions = clockMs ? futureSlots(clockMs, branchId) : [];
  const deliveryWindows = clockMs ? futureDeliveryWindows(clockMs, 6, language) : [];
  const fulfillmentValidation = fulfillmentCheck({ basket, mode: fulfillmentMode, branchId, slotId, address: deliveryAddress,
    deliveryWindowId, nowMs: clockMs || 0 });
  const availableSlots = pickupOptions.filter((slot) => slot.capacity >= basketDetails.itemCount);
  const pickupDays = [...new Set(availableSlots.map((slot) => slotDateId(slot.id)))].slice(0, 4);
  const activePickupDay = pickupDays.includes(pickupDay) ? pickupDay : pickupDays[0];
  const daySlots = availableSlots.filter((slot) => slotDateId(slot.id) === activePickupDay);
  const selectedDeliveryWindow = deliveryWindows.find((window) => window.id === deliveryWindowId);
  const fulfillmentTitle = fulfillmentMode === "pickup" ? branch?.name : deliveryAddress;
  const fulfillmentSubtitle = fulfillmentMode === "pickup"
    ? (slotId ? slotLabel(slotId, language) : c.choosePickupTime)
    : (selectedDeliveryWindow?.label || c.chooseDeliveryWindow);
  const hasCaptions = transcript.length > 0;
  const hasBasket = basketDetails.itemCount > 0;
  const currentOrders = ordersByProfile[profileId] || [];
  const confirmedDetails = pickupSimulation ? basketSummary(pickupSimulation.basket || {}, productsById) : null;
  const customerSample = SAMPLE_CUSTOMERS[profileId] || SAMPLE_CUSTOMERS.guest;
  const detailProduct = detailProductId ? productsById.get(detailProductId) : null;
  const gridProducts = activeCategory === null ? visibleProducts : visibleProducts.filter((product) => product.id !== featuredProduct?.id);
  const orderedGridProducts = [...gridProducts].sort((a, b) => {
    const availability = Number(sampleStock(b.id, branchId) > 0) - Number(sampleStock(a.id, branchId) > 0);
    if (availability) return availability;
    if (profileId === "regular" || profileId === "chocolate") {
      return Number(!customerSample.recommendations.includes(a.id)) - Number(!customerSample.recommendations.includes(b.id));
    }
    return 0;
  });
  const isFullCatalogue = visibleIds.length === products.length
    && visibleIds.every((id, index) => id === products[index]?.id);
  const visibleVoiceLabel = !voiceEnabled ? c.voiceButtonUnavailable
    : voiceStatus === "error" ? c.voiceButtonRetry
      : voiceStatus === "idle" ? c.voiceButtonIdle : voiceMessage;

  const stateSnapshot = useCallback(() => {
    const currentLanguage = languageRef.current;
    const currentBasket = basketSummary(basketRef.current, productsById);
    const currentBranch = branchRef.current;
    const currentTime = Date.now();
    const shopping = shoppingStateSnapshot({
      visibleIds: visibleIdsRef.current,
      selectedId: selectedIdRef.current,
      basket: basketRef.current,
    }, productsById);
    return {
      language: currentLanguage,
      ...shopping,
      visibleProducts: shopping.visibleProducts.map((item) => localizedProduct(productsById.get(item.id), currentLanguage)),
      selectedProduct: shopping.selectedProduct ? localizedProduct(productsById.get(shopping.selectedProduct.id), currentLanguage) : null,
      basket: { ...shopping.basket, items: shopping.basket.items.map((item) => ({ ...item, name: productName(productsById.get(item.productId), currentLanguage) })) },
      stockBasis: currentLanguage === "de" ? "Die Verfügbarkeit ist illustrativ und kein Live-Filialbestand; bitte bei Honold bestätigen." : shopping.stockBasis,
      demoCheckout: {
        branches: DEMO_BRANCHES, profiles: DEMO_PROFILES,
        mode: fulfillmentModeRef.current, branchId: currentBranch, profileId: profileRef.current, slotId: slotRef.current,
        address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
        nextSlotExamples: futureSlots(currentTime, currentBranch).slice(0, 8),
        pickupDates: [...new Set(futureSlots(currentTime, currentBranch).map((slot) => slotDateId(slot.id)))].slice(0, 4),
        quote: offerQuote(profileRef.current, currentBasket, productsById),
        basketSampleStock: currentBasket.items.map((item) => ({
          productId: item.productId, requested: item.quantity,
          sampleAvailable: sampleStock(item.productId, currentBranch),
        })),
        validation: (() => { const validation = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: currentBranch,
          slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: currentTime });
          return { ...validation, reason: localizeReason(validation.reason, currentLanguage) }; })(),
        pickupPreview: pickupRef.current ? { code: pickupRef.current.pickupCode, status: localizeStatus(previewStatus(pickupRef.current), currentLanguage) } : null,
        basis: currentLanguage === "de" ? "Illustrative Kundendaten, Bestände, Kapazitäten, Öffnungszeiten, Angebote und Erfüllung; keine echte Transaktion und keine echten Kundendaten." : "Illustrative customer, branch stock, capacity, hours, offer and fulfillment scenario; no real transaction or customer data.",
      },
    };
  }, [productsById]);

  const sendInterfaceState = useCallback((reason) => {
    const session = sessionRef.current;
    if (!session || session.transport.status !== "connected") return;
    try {
      session.transport.sendMessage(
        `[Interface state update after ${reason}; do not respond unless the shopper asks.] ${JSON.stringify(stateSnapshot())}`,
        {},
        { triggerResponse: false },
      );
    } catch {
      // The next state tool call will provide the current snapshot.
    }
  }, [stateSnapshot]);

  const waitForDisplayedImages = useCallback(async (ids, sequence) => {
    const deadline = performance.now() + IMAGE_WAIT_MS;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const viewportIds = ids.filter((id) => {
      const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
      const card = image?.closest("article");
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      return rect.bottom > 0
        && rect.top < window.innerHeight - 96
        && rect.right > 0
        && rect.left < window.innerWidth;
    });

    while (performance.now() < deadline) {
      if (presentationSequenceRef.current !== sequence) {
        return { stale: true, displayedIds: [], failedIds: [], viewportIds: [] };
      }
      const displayedIds = [];
      const failedIds = [];
      for (const id of viewportIds) {
        const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
        if (image?.complete && image.naturalWidth > 0) displayedIds.push(id);
        else if (image?.dataset.failed === "true" || imageFailuresRef.current.has(id)) failedIds.push(id);
      }
      if (displayedIds.length + failedIds.length === viewportIds.length) {
        return { stale: false, displayedIds, failedIds, viewportIds };
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    const displayedIds = [];
    const failedIds = [];
    for (const id of viewportIds) {
      const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
      if (image?.complete && image.naturalWidth > 0) displayedIds.push(id);
      else failedIds.push(id);
    }
    return { stale: false, displayedIds, failedIds, viewportIds, timedOut: true };
  }, []);

  const presentProducts = useCallback(async (requestedIds, focusId = null) => {
    const ids = [...new Set(requestedIds)].filter((id) => validProductIds.has(id));
    if (ids.length === 0) return { displayed: false, error: "No valid product IDs were provided." };

    const sequence = presentationSequenceRef.current + 1;
    presentationSequenceRef.current = sequence;
    visibleIdsRef.current = ids;
    setVisibleIds(ids);
    setActiveCategory(null);
    const nextSelectedId = focusId && ids.includes(focusId)
      ? focusId
      : (selectedIdRef.current && ids.includes(selectedIdRef.current) ? selectedIdRef.current : null);
    selectedIdRef.current = nextSelectedId;
    setSelectedId(nextSelectedId);
    productGridRef.current?.scrollIntoView({ block: "start" });

    const result = await waitForDisplayedImages(ids, sequence);
    if (result.stale) {
      return { displayed: false, stale: true, message: "A newer shopper selection replaced this request." };
    }

    const displayedProducts = result.displayedIds.map((id) => localizedProduct(productsById.get(id), languageRef.current));
    const visibleImagesReady = result.viewportIds.length > 0
      && result.displayedIds.length === result.viewportIds.length;
    return {
      displayed: visibleImagesReady,
      displayedProducts,
      selectedProduct: localizedProduct(productsById.get(selectedIdRef.current), languageRef.current),
      failedImageProductIds: result.failedIds,
      belowFoldProductIds: ids.filter((id) => !result.viewportIds.includes(id)),
      timedOut: Boolean(result.timedOut),
      message: visibleImagesReady
        ? "The product photos in displayedProducts are loaded in the shopper's current viewport. Products in belowFoldProductIds are below the fold and must not be described as currently visible."
        : "Only products in displayedProducts are both loaded and in the shopper's current viewport. Do not describe other requested products as currently visible.",
    };
  }, [productsById, validProductIds, waitForDisplayedImages]);

  const mutateBasket = useCallback((productId, quantity, mode, source = "touch") => {
    const next = changeBasket(basketRef.current, productId, quantity, mode, validProductIds);
    const nextSummary = basketSummary(next, productsById);
    const productBaseId = String(productId).split("::")[0];
    const currentSummary = basketSummary(basketRef.current, productsById);
    const currentRequested = currentSummary.items.filter((item) => item.productId === productBaseId).reduce((sum, item) => sum + item.quantity, 0);
    const requested = nextSummary.items.filter((item) => item.productId === productBaseId).reduce((sum, item) => sum + item.quantity, 0);
    const available = sampleStock(productBaseId, branchRef.current);
    if (requested > available && requested >= currentRequested) {
      const branchName = DEMO_BRANCHES.find((item) => item.id === branchRef.current)?.name || branchRef.current;
      const message = `Only ${available} available at ${branchName}. Try the other branch.`;
      setPickupError(message);
      if (source === "voice") throw new Error(message);
      return currentSummary;
    }
    basketRef.current = next;
    setBasket(next);
    pickupRef.current = null;
    setPickupSimulation(null);
    setPendingReview(null);
    pendingReviewRef.current = null;
    setPickupError("");
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a basket touch action"));
    return nextSummary;
  }, [productsById, sendInterfaceState, validProductIds]);

  const selectProduct = useCallback((productId) => {
    presentationSequenceRef.current += 1;
    selectedIdRef.current = productId;
    setSelectedId(productId);
    queueMicrotask(() => sendInterfaceState("the shopper selected a product by touch"));
  }, [sendInterfaceState]);

  const updatePickupPreference = useCallback((field, value, source = "touch") => {
    if (field === "branch") {
      if (!DEMO_BRANCHES.some((item) => item.id === value)) throw new Error("Choose a valid pickup branch.");
      branchRef.current = value;
      setBranchId(value);
      slotRef.current = null;
      setSlotId(null);
    } else if (field === "profile") {
      if (!DEMO_PROFILES.some((item) => item.id === value)) throw new Error("Choose a valid profile.");
      profileRef.current = value;
      setProfileId(value);
    } else if (field === "slot") {
      const options = futureSlots(Date.now(), branchRef.current);
      const chosen = options.find((item) => item.id === value);
      if (!chosen) throw new Error("Choose a valid future pickup time.");
      const itemCount = Object.values(basketRef.current).reduce((sum, quantity) => sum + quantity, 0);
      if (itemCount > chosen.capacity) throw new Error("This pickup time cannot fit your basket; choose another time.");
      slotRef.current = value;
      setSlotId(value);
      setPickupDay(slotDateId(value));
    } else throw new Error("Unknown pickup preference.");
    pickupRef.current = null;
    setPickupSimulation(null);
    setPendingReview(null);
    pendingReviewRef.current = null;
    setPickupError("");
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a pickup preference changed"));
  }, [sendInterfaceState]);

  const choosePickupDay = useCallback((day) => {
    setPickupDay(day);
    slotRef.current = null;
    setSlotId(null);
    pickupRef.current = null;
    setPickupSimulation(null);
    setPendingReview(null);
    pendingReviewRef.current = null;
    setPickupError("");
    queueMicrotask(() => sendInterfaceState("the pickup day changed"));
  }, [sendInterfaceState]);

  const createPickupSimulation = useCallback(() => {
    const summary = basketSummary(basketRef.current, productsById);
    try {
      const now = Date.now();
      clockRef.current = now;
      setClockMs(now);
      const result = makePreview({
        basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current, slotId: slotRef.current,
        address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
        profileId: profileRef.current,
        quote: offerQuote(profileRef.current, summary, productsById),
        nowMs: now,
      });
      pickupRef.current = result;
      setPickupSimulation(result);
      setPickupError("");
      return result;
    } catch (error) {
      setPickupError(error instanceof Error ? error.message : "This order is unavailable.");
      return null;
    }
  }, [productsById]);

  const buildTools = useCallback((realtimeTool, zod) => {
    const getShoppingState = realtimeTool({
      name: "get_shopping_state",
      description: "Read the current visible products, touch-selected product, sample stock, and basket. Call this before interpreting 'this one', 'that one', or basket changes.",
      parameters: zod.object({}),
      execute: async () => safeToolResult(stateSnapshot()),
    });

    const searchProducts = realtimeTool({
      name: "search_and_show_products",
      description: "Search the public Honold catalogue and immediately show the matching product photos. Use for needs, categories, product names, or recommendations.",
      parameters: zod.object({
        query: zod.string().min(1).max(100),
        limit: zod.number().int().min(1).max(12).default(6),
      }),
      execute: async ({ query, limit }) => {
        const matches = searchCatalog(products, query, limit);
        if (matches.length === 0) {
          return safeToolResult({ found: false, query, message: "No matching public catalogue products were found." });
        }
        const displayResult = await presentProducts(matches.map((product) => product.id), matches[0].id);
        return safeToolResult({ found: true, query, ...displayResult });
      },
    });

    const showProducts = realtimeTool({
      name: "show_products",
      description: "Show known products by their stable catalogue IDs and optionally focus one. The result explicitly says whether the images finished displaying.",
      parameters: zod.object({
        product_ids: zod.array(zod.string()).min(1).max(12),
        focus_product_id: zod.string().nullable().default(null),
      }),
      execute: async ({ product_ids: productIds, focus_product_id: focusProductId }) => {
        return safeToolResult(await presentProducts(productIds, focusProductId));
      },
    });

    const updateBasket = realtimeTool({
      name: "update_basket",
      description: "Add, remove, or set a quantity for one stable product ID. Read shopping state first for relative references such as 'this one'.",
      parameters: zod.object({
        product_id: zod.string(),
        quantity: zod.number().int().min(0).max(24),
        mode: zod.enum(["add", "remove", "set"]),
        gift_message: zod.enum(["None", "Happy Birthday", "Thank you"]).default("None"),
        sample_wrap: zod.enum(["Standard", "Ribbon"]).default("Standard"),
      }),
      execute: async ({ product_id: productId, quantity, mode, gift_message: message, sample_wrap: wrap }) => {
        try {
          const summary = mutateBasket(basketKey(productId, { message, wrap }), quantity, mode, "voice");
          return safeToolResult({ ok: true, basket: summary });
        } catch (error) {
          return safeToolResult({ ok: false, error: error instanceof Error ? error.message : "Basket update failed." });
        }
      },
    });

    const preparePickup = realtimeTool({
      name: "prepare_simulated_pickup",
      description: "Open and freeze the exact simulated pickup review. This never creates an order; explicit approval must follow in a separate shopper turn.",
      parameters: zod.object({}),
      execute: async () => {
        const summary = basketSummary(basketRef.current, productsById);
        if (summary.itemCount === 0) return safeToolResult({ ok: false, error: "The basket is empty." });
        const now = Date.now();
        const check = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
          slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: now });
        if (!check.ok) return safeToolResult({ ok: false, error: check.reason });
        const quote = offerQuote(profileRef.current, summary, productsById);
        const fingerprint = reviewFingerprint({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
          slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
          profileId: profileRef.current, exampleTotalChf: quote.exampleTotalChf });
        reviewSequenceRef.current += 1;
        const review = { fingerprint, reviewId: makeReviewId(fingerprint, now, reviewSequenceRef.current), createdAt: now,
          basket: { ...basketRef.current }, mode: fulfillmentModeRef.current, branchId: branchRef.current, slotId: slotRef.current,
          address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, profileId: profileRef.current, quote };
        pendingReviewRef.current = review; setPendingReview(review); setBasketOpen(true);
        return safeToolResult({
          ok: true,
          basket: summary,
          checkout: stateSnapshot().demoCheckout,
          reviewId: review.reviewId,
          reviewFingerprint: review.fingerprint,
          awaitingExplicitApproval: true,
          message: "Read the visible review in natural customer language. Only after the shopper clearly says approve or confirm in a new turn may you call approve_simulated_order with this review ID and fingerprint.",
        });
      },
    });

    const approveOrder = realtimeTool({
      name: "approve_simulated_order",
      description: "Approve simulated payment and create the sample order only after the shopper explicitly says approve or confirm for the currently visible exact review. Never call from implied intent.",
      parameters: zod.object({ review_id: zod.string(), review_fingerprint: zod.string(), explicit_intent: zod.enum(["approve", "confirm"]) }),
      execute: async ({ review_id: reviewId, review_fingerprint: fingerprint, explicit_intent: intent }) => {
        const review = pendingReviewRef.current;
        if (!review || review.reviewId !== reviewId || review.fingerprint !== fingerprint) return safeToolResult({ ok: false, error: "The review changed or expired. Prepare a fresh exact review." });
        try {
          pendingReviewRef.current = null; setPendingReview(null);
          const now = Date.now();
          const liveSummary = basketSummary(basketRef.current, productsById);
          const liveQuote = offerQuote(profileRef.current, liveSummary, productsById);
          const liveFingerprint = reviewFingerprint({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
            slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
            profileId: profileRef.current, exampleTotalChf: liveQuote.exampleTotalChf });
          if (liveFingerprint !== review.fingerprint) throw new Error("The basket, offer, branch, or time changed. Prepare a fresh exact review.");
          const liveCheck = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
            slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: now });
          if (!liveCheck.ok) throw new Error(liveCheck.reason);
          const approved = approveReview(review, intent, now);
          const result = createPickupSimulation();
          if (!result) return safeToolResult({ ok: false, error: "Final stock, slot, or price validation failed." });
          const completed = { ...result, orderId: approved.approvalId, pickupCode: pickupCodeForReview(approved.approvalId), reviewFingerprint: approved.fingerprint, payment: approved.payment };
          pickupRef.current = completed; setPickupSimulation(completed);
          basketRef.current = {}; setBasket({});
          const nextOrders = saveSampleOrder(ordersRef.current[review.profileId] || [], approved, completed);
          setOrdersByProfile((current) => ({ ...current, [review.profileId]: nextOrders }));
          return safeToolResult({ ok: true, simulated: true, payment: approved.payment, pickupCode: completed.pickupCode, status: previewStatus(completed) });
        } catch (error) { return safeToolResult({ ok: false, error: error instanceof Error ? error.message : "Approval failed." }); }
      },
    });

    const setPickupPreference = realtimeTool({
      name: "set_demo_pickup_preference",
      description: "Choose one branch or future pickup slot from get_shopping_state. Use exact IDs. Branch changes clear the selected slot. Recheck state after each change.",
      parameters: zod.object({
        field: zod.enum(["branch", "slot"]),
        value: zod.string(),
      }),
      execute: async ({ field, value }) => {
        try {
          updatePickupPreference(field, value, "voice");
          return safeToolResult({ ok: true, checkout: stateSnapshot().demoCheckout });
        } catch (error) {
          return safeToolResult({ ok: false, error: error instanceof Error ? error.message : "Preference update failed." });
        }
      },
    });

    const findPickupSlots = realtimeTool({
      name: "find_demo_pickup_slots",
      description: "Find valid future 15-minute pickup slot IDs in Zurich time. Pass local_time like 12:15 and optionally local_date like 2026-09-19. Use returned IDs with set_demo_pickup_preference.",
      parameters: zod.object({
        local_time: zod.string().regex(/^\d{2}:\d{2}$/).optional(),
        local_date: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
      execute: async ({ local_time: localTime, local_date: localDate }) => {
        const now = clockRef.current || Date.now();
        const summary = basketSummary(basketRef.current, productsById);
        const slots = futureSlots(now, branchRef.current)
          .filter((slot) => slot.capacity >= summary.itemCount)
          .filter((slot) => !localDate || slotDateId(slot.id) === localDate)
          .filter((slot) => {
            if (!localTime) return true;
            const local = zurichParts(Number(slot.id));
            return `${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}` === localTime;
          }).slice(0, 12);
        return safeToolResult({ found: slots.length > 0, branchId: branchRef.current,
          slots, message: "Illustrative slots only; no reservation. A separate exact review and explicit approval are required." });
      },
    });

    const advancePickupProgress = realtimeTool({
      name: "advance_demo_pickup_progress",
      description: "Advance the simulated pickup tracker by one stage only when the shopper explicitly asks to advance this demo. No real fulfilment action occurs.",
      parameters: zod.object({}),
      execute: async () => {
        if (!pickupRef.current) return safeToolResult({ ok: false, error: "No confirmed pickup preview exists." });
        const next = advancePreview(pickupRef.current);
        pickupRef.current = next;
        setPickupSimulation(next);
        setOrdersByProfile((current) => ({ ...current, [profileRef.current]: (current[profileRef.current] || []).map((order) => order.orderId === next.orderId ? { ...order, stage: next.stage } : order) }));
        return safeToolResult({ ok: true, code: next.pickupCode, status: previewStatus(next), simulated: true });
      },
    });

    return [getShoppingState, searchProducts, showProducts, updateBasket, findPickupSlots, setPickupPreference, preparePickup, approveOrder, advancePickupProgress];
  }, [createPickupSimulation, mutateBasket, presentProducts, products, productsById, stateSnapshot, updatePickupPreference]);

  const clearVoiceTimeout = useCallback(() => {
    if (voiceTimeoutRef.current !== null) {
      window.clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  }, []);

  const closeVoiceSession = useCallback((message) => {
    clearVoiceTimeout();
    if (sessionRef.current) sessionRef.current.close();
    sessionRef.current = null;
    setVoiceStatus("idle");
    setIsMuted(false);
    setVoiceMessage(message);
    setCaptionsOpen(false);
  }, [clearVoiceTimeout]);

  const disconnectVoice = useCallback(() => {
    closeVoiceSession(copyFor(languageRef.current).talkShop);
  }, [closeVoiceSession]);

  const startVoice = useCallback(async () => {
    if (!voiceEnabled) return;
    if (sessionRef.current) {
      const nextMuted = !isMuted;
      sessionRef.current.mute(nextMuted);
      setIsMuted(nextMuted);
      setVoiceStatus(nextMuted ? "muted" : "listening");
      setVoiceMessage(nextMuted ? copyFor(languageRef.current).muted : copyFor(languageRef.current).listening);
      return;
    }

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setVoiceStatus("unsupported");
      setVoiceMessage(copyFor(languageRef.current).voiceSecure);
      return;
    }

    setVoiceStatus("connecting");
    setVoiceMessage(copyFor(languageRef.current).connecting);

    try {
      const [{ RealtimeAgent, RealtimeSession, tool: realtimeTool }, { z }] = await Promise.all([
        import("@openai/agents/realtime"),
        import("zod"),
      ]);
      const tokenResponse = await fetch("/api/honold-demo/realtime-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const tokenPayload = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || !tokenPayload.value) {
        throw new Error(copyFor(languageRef.current).voiceService);
      }

      const initialSummary = stateSnapshot();
      const agent = new RealtimeAgent({
        name: "Honold voice shopper",
        voice: "marin",
        instructions: voiceInstructions(languageRef.current, initialSummary),
        tools: buildTools(realtimeTool, z),
      });

      const session = new RealtimeSession(agent, {
        model: tokenPayload.model || "gpt-realtime",
        transport: "webrtc",
        tracingDisabled: true,
        config: {
          outputModalities: ["audio"],
          audio: {
            input: {
              noiseReduction: { type: "near_field" },
              transcription: { model: "gpt-4o-mini-transcribe", language: languageRef.current },
              turnDetection: {
                type: "semantic_vad",
                eagerness: "medium",
                createResponse: true,
                interruptResponse: true,
              },
            },
            output: { voice: "marin", speed: 1.03 },
          },
        },
      });

      session.on("history_updated", (history) => {
        if (mountedRef.current) setTranscript(transcriptFromHistory(history));
      });
      session.on("audio_start", () => {
        if (!mountedRef.current) return;
        setVoiceStatus("speaking");
        setVoiceMessage(copyFor(languageRef.current).speaking);
      });
      session.on("audio_stopped", () => {
        if (!mountedRef.current) return;
        setVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage(session.muted ? copyFor(languageRef.current).muted : copyFor(languageRef.current).listening);
      });
      session.on("audio_interrupted", () => {
        if (!mountedRef.current) return;
        setVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage(copyFor(languageRef.current).listening);
      });
      session.on("error", () => {
        console.error("Realtime session error");
        if (!mountedRef.current) return;
        clearVoiceTimeout();
        if (sessionRef.current === session) sessionRef.current = null;
        session.close();
        setVoiceStatus("error");
        setVoiceMessage(copyFor(languageRef.current).voiceFailed);
      });

      sessionRef.current = session;
      await session.connect({ apiKey: tokenPayload.value });
      if (!mountedRef.current) {
        session.close();
        return;
      }
      clearVoiceTimeout();
      voiceTimeoutRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        closeVoiceSession(copyFor(languageRef.current).talkShop);
      }, VOICE_SESSION_DURATION_MS);
      setVoiceStatus("listening");
      setVoiceMessage(copyFor(languageRef.current).listening);
      session.sendMessage(languageRef.current === "de" ? "Begrüsse die Kundin oder den Kunden in einem kurzen Satz und frage, was sie oder er heute möchte." : "Greet the shopper in one short sentence, then ask what they would like today.");
    } catch (error) {
      clearVoiceTimeout();
      if (sessionRef.current) sessionRef.current.close();
      sessionRef.current = null;
      const denied = error?.name === "NotAllowedError" || /microphone|permission/i.test(error?.message || "");
      setVoiceStatus("error");
      setVoiceMessage(denied
        ? copyFor(languageRef.current).micDenied
        : (error instanceof Error ? error.message : copyFor(languageRef.current).voiceService));
    }
  }, [buildTools, clearVoiceTimeout, closeVoiceSession, isMuted, stateSnapshot, voiceEnabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearVoiceTimeout();
      if (sessionRef.current) sessionRef.current.close();
    };
  }, [clearVoiceTimeout]);

  useEffect(() => {
    const refreshClock = () => {
      const now = Date.now();
      clockRef.current = now;
      setClockMs(now);
    };
    refreshClock();
    const timer = window.setInterval(refreshClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("honold-demo-language");
    if (LANGUAGES.some((item) => item.id === savedLanguage)) {
      languageRef.current = savedLanguage;
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("honold-demo-fulfillment-v1") || "{}");
      if (saved.mode === "delivery") { setFulfillmentMode("delivery"); fulfillmentModeRef.current = "delivery"; }
      if (typeof saved.address === "string" && saved.address.trim()) { setDeliveryAddress(saved.address); deliveryAddressRef.current = saved.address; }
      if (typeof saved.deliveryWindowId === "string") { setDeliveryWindowId(saved.deliveryWindowId); deliveryWindowRef.current = saved.deliveryWindowId; }
    } catch {}
  }, []);

  useEffect(() => {
    fulfillmentModeRef.current = fulfillmentMode;
    deliveryAddressRef.current = deliveryAddress;
    deliveryWindowRef.current = deliveryWindowId;
    window.localStorage.setItem("honold-demo-fulfillment-v1", JSON.stringify({ mode: fulfillmentMode, address: deliveryAddress, deliveryWindowId }));
  }, [deliveryAddress, deliveryWindowId, fulfillmentMode]);

  useEffect(() => {
    const stored = parseOrdersByProfile(window.localStorage.getItem("honold-demo-orders-v1"));
    ordersRef.current = stored; setOrdersByProfile(stored); setOrdersLoaded(true);
  }, []);

  useEffect(() => {
    if (!ordersLoaded) return;
    ordersRef.current = ordersByProfile;
    window.localStorage.setItem("honold-demo-orders-v1", serializeOrdersByProfile(ordersByProfile));
  }, [ordersByProfile, ordersLoaded]);

  const showAllProducts = useCallback(async () => {
    selectedIdRef.current = null;
    setSelectedId(null);
    const showing = presentProducts(products.map((product) => product.id));
    setActiveCategory("all");
    await showing;
    requestAnimationFrame(() => voiceButtonRef.current?.focus());
    queueMicrotask(() => sendInterfaceState("the full catalogue was restored"));
  }, [presentProducts, products, sendInterfaceState]);

  const browseOfferProducts = useCallback(async () => {
    const eligibleTypes = profileId === "regular" ? ["baeckerei", "patisserie und torten"]
      : profileId === "chocolate" ? ["schokolade"] : null;
    if (!eligibleTypes) return showAllProducts();
    const showing = presentProducts(products.filter((product) => eligibleTypes.includes(product.productType)).map((product) => product.id));
    setActiveCategory("offer");
    await showing;
    queueMicrotask(() => sendInterfaceState("the shopper opened products eligible for the selected demo offer"));
  }, [presentProducts, products, profileId, sendInterfaceState, showAllProducts]);

  const browseCategory = useCallback(async (categoryId) => {
    if (categoryId === "all") return showAllProducts();
    const showing = presentProducts(products.filter((product) => product.productType === categoryId).map((product) => product.id));
    setActiveCategory(categoryId);
    await showing;
    queueMicrotask(() => sendInterfaceState("the shopper selected a catalogue category"));
  }, [presentProducts, products, sendInterfaceState, showAllProducts]);

  const applyScenario = useCallback((nextScenarioId) => {
    const scenario = PRESENTER_SCENARIOS.find((item) => item.id === nextScenarioId) || PRESENTER_SCENARIOS[0];
    const nextIds = products.map((product) => product.id);
    setScenarioId(scenario.id);
    updatePickupPreference("profile", scenario.profileId);
    presentationSequenceRef.current += 1;
    visibleIdsRef.current = nextIds;
    setVisibleIds(nextIds);
    selectedIdRef.current = scenario.featuredProductId;
    setSelectedId(scenario.featuredProductId);
    setActiveCategory("all");
    setShopView("shop");
    setDetailProductId(null);
    setBasketOpen(false);
    setScenariosOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    queueMicrotask(() => sendInterfaceState("the presenter changed the shopping scenario"));
  }, [products, sendInterfaceState, updatePickupPreference]);

  const invalidateOrderReview = useCallback(() => {
    pendingReviewRef.current = null; setPendingReview(null);
    pickupRef.current = null; setPickupSimulation(null);
    setPickupError("");
    setReviewAttempted(false);
  }, []);

  const changeFulfillmentMode = useCallback((mode) => {
    if (!['pickup', 'delivery'].includes(mode)) return;
    fulfillmentModeRef.current = mode;
    setFulfillmentMode(mode);
    invalidateOrderReview();
    setFulfillmentOpen(false);
    queueMicrotask(() => sendInterfaceState("the shopper changed fulfilment mode"));
  }, [invalidateOrderReview, sendInterfaceState]);

  const changeDeliveryDetails = useCallback((field, value) => {
    if (field === "address") { deliveryAddressRef.current = value; setDeliveryAddress(value); }
    if (field === "window") { deliveryWindowRef.current = value; setDeliveryWindowId(value); }
    invalidateOrderReview();
  }, [invalidateOrderReview]);

  const changeLanguage = useCallback((nextLanguage) => {
    if (!LANGUAGES.some((item) => item.id === nextLanguage)) return;
    languageRef.current = nextLanguage;
    setLanguage(nextLanguage);
    const nextCopy = copyFor(nextLanguage);
    setVoiceMessage((current) => voiceStatus === "idle" ? nextCopy.talkShop : voiceStatus === "muted" ? nextCopy.muted : voiceStatus === "speaking" ? nextCopy.speaking : voiceStatus === "connecting" ? nextCopy.connecting : current);
    window.localStorage.setItem("honold-demo-language", nextLanguage);
    const session = sessionRef.current;
    if (session?.transport?.status === "connected") {
      try {
        session.transport.updateSessionConfig({
          instructions: voiceInstructions(nextLanguage, stateSnapshot()),
          audio: { input: { transcription: { model: "gpt-4o-mini-transcribe", language: nextLanguage } } },
        });
        session.transport.sendMessage(
          nextLanguage === "de" ? "[Die Sprache der Oberfläche ist jetzt Deutsch. Antworte ab jetzt auf Deutsch; antworte nicht auf diese Statusmeldung.]" : "[The interface language is now English. Reply in English from now on; do not respond to this status update.]",
          {}, { triggerResponse: false },
        );
      } catch {}
    }
  }, [stateSnapshot, voiceStatus]);

  const openBasket = useCallback(() => { setReviewAttempted(false); setBasketOpen(true); }, []);
  const closeBasket = useCallback(() => setBasketOpen(false), []);
  const closeCaptions = useCallback(() => {
    setCaptionsOpen(false);
    requestAnimationFrame(() => captionsButtonRef.current?.focus());
  }, []);

  const prepareExactReview = useCallback(() => {
    if (!fulfillmentValidation.ok) return;
    const fingerprint = reviewFingerprint({ basket, mode: fulfillmentMode, branchId, slotId, address: deliveryAddress,
      deliveryWindowId, profileId, exampleTotalChf: quote.exampleTotalChf });
    const now = Date.now();
    reviewSequenceRef.current += 1;
    const review = { fingerprint, reviewId: makeReviewId(fingerprint, now, reviewSequenceRef.current), createdAt: now,
      basket: { ...basket }, mode: fulfillmentMode, branchId, slotId, address: deliveryAddress, deliveryWindowId, profileId, quote };
    pendingReviewRef.current = review; setPendingReview(review);
    return review;
  }, [basket, branchId, deliveryAddress, deliveryWindowId, fulfillmentMode, fulfillmentValidation.ok, profileId, quote, slotId]);

  const approveExactReview = useCallback((intent = "approve") => {
    try {
      const review = pendingReviewRef.current;
      pendingReviewRef.current = null; setPendingReview(null);
      const now = Date.now();
      const liveSummary = basketSummary(basketRef.current, productsById);
      const liveQuote = offerQuote(profileRef.current, liveSummary, productsById);
      const liveFingerprint = reviewFingerprint({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
        slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
        profileId: profileRef.current, exampleTotalChf: liveQuote.exampleTotalChf });
      if (!review || review.fingerprint !== liveFingerprint) throw new Error("The basket, offer, branch, or time changed. Prepare a fresh exact review.");
      const liveCheck = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
        slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: now });
      if (!liveCheck.ok) throw new Error(liveCheck.reason);
      const approved = approveReview(review, intent, now);
      const result = createPickupSimulation();
      if (!result) return null;
      const completed = { ...result, orderId: approved.approvalId, pickupCode: pickupCodeForReview(approved.approvalId), reviewFingerprint: approved.fingerprint, payment: approved.payment };
      pickupRef.current = completed;
      setPickupSimulation(completed);
      basketRef.current = {}; setBasket({});
      setBasketOpen(false);
      setOrdersByProfile((current) => ({ ...current, [profileId]: saveSampleOrder(current[profileId] || [], approved, completed) }));
      queueMicrotask(() => sendInterfaceState("the shopper explicitly approved the exact review; simulated payment and sample order were created"));
      return completed;
    } catch (error) {
      setPickupError(error instanceof Error ? error.message : "Approval failed.");
      return null;
    }
  }, [createPickupSimulation, productsById, profileId, sendInterfaceState]);

  const confirmTouchOrder = useCallback(() => {
    setReviewAttempted(true);
    if (!fulfillmentValidation.ok) {
      const missingPickup = fulfillmentMode === "pickup" && !slotId;
      const missingDelivery = fulfillmentMode === "delivery" && (!deliveryAddress.trim() || !deliveryWindowId);
      if (missingPickup || missingDelivery) setFulfillmentOpen(true);
      return null;
    }
    const review = prepareExactReview();
    if (!review) return null;
    return approveExactReview("confirm");
  }, [approveExactReview, deliveryAddress, deliveryWindowId, fulfillmentMode, fulfillmentValidation.ok, prepareExactReview, slotId]);

  const reorderSample = useCallback((order) => {
    const remaining = {};
    const next = {};
    for (const [key, quantity] of Object.entries(order.basket || {})) {
      const productId = key.split("::")[0];
      if (!validProductIds.has(productId)) continue;
      if (remaining[productId] === undefined) remaining[productId] = sampleStock(productId, branchRef.current);
      const accepted = Math.min(quantity, remaining[productId]);
      if (accepted > 0) next[key] = accepted;
      remaining[productId] -= accepted;
    }
    basketRef.current = next; setBasket(next); setShopView("shop"); setBasketOpen(true);
    setPendingReview(null); pendingReviewRef.current = null; setPickupSimulation(null); pickupRef.current = null;
    setPickupError("Your reorder is ready. Availability and prices were refreshed; check the fulfilment details and confirm again.");
  }, [validProductIds]);

  const advancePickup = useCallback(() => {
    const next = advancePreview(pickupRef.current);
    pickupRef.current = next;
    setPickupSimulation(next);
    setOrdersByProfile((current) => ({ ...current, [profileRef.current]: (current[profileRef.current] || []).map((order) => order.orderId === next.orderId ? { ...order, stage: next.stage } : order) }));
    queueMicrotask(() => sendInterfaceState("demo pickup progress advanced"));
  }, [sendInterfaceState]);

  useEffect(() => {
    if (!basketOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => drawerCloseRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBasket();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(drawerRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [])];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
      else voiceButtonRef.current?.focus();
    };
  }, [basketOpen, closeBasket]);

  useEffect(() => {
    if (!captionsOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeCaptions();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [captionsOpen, closeCaptions]);

  useEffect(() => {
    if (basketOpen && pickupSimulation) requestAnimationFrame(() => pickupResultRef.current?.focus());
  }, [basketOpen, pickupSimulation]);

  useEffect(() => {
    if (pickupSimulation) window.scrollTo({ top: 0, behavior: "auto" });
  }, [pickupSimulation]);

  return (
    <main className={styles.page} lang={language === "de" ? "de-CH" : "en"}>
      <aside className={styles.scenarioStrip} aria-label={c.demoScenarios} data-open={scenariosOpen}>
        <div className={styles.scenarioHeading}>
          <strong>{c.demoScenarios}</strong>
          <button type="button" aria-expanded={scenariosOpen} onClick={() => setScenariosOpen((open) => !open)}>
            {scenariosOpen ? c.hide : c.show} <ChevronDown size={15} aria-hidden="true" />
          </button>
        </div>
        {scenariosOpen && <div className={styles.scenarioActions}>
          {PRESENTER_SCENARIOS.map((scenario) => <button type="button" key={scenario.id}
            aria-pressed={scenarioId === scenario.id} onClick={() => applyScenario(scenario.id)}>{c[scenario.id === "new" ? "firstVisit" : scenario.id]}</button>)}
          {pickupSimulation && pickupSimulation.stage < 2 && <button type="button" className={styles.advanceStatus} onClick={advancePickup}>{c.advanceStatus}</button>}
        </div>}
      </aside>

      <header className={styles.header}>
        <button className={styles.brandButton} type="button" onClick={() => { setShopView("shop"); setPickupSimulation(null); pickupRef.current = null; }} aria-label={c.backShop}>
          <Image className={styles.brandLogo} src="/honold-demo/brand/honold-logo.svg" alt="Confiserie Honold" width={180} height={150} priority />
        </button>
        <div className={styles.headerActions}>
          <div className={styles.languageSelector} role="group" aria-label={language === "de" ? "Sprache" : "Language"}>
            {LANGUAGES.map((item) => <button key={item.id} type="button" lang={item.id} aria-label={item.label} aria-pressed={language === item.id} onClick={() => changeLanguage(item.id)}>{item.short}</button>)}
          </div>
          <button className={styles.ordersAction} type="button" onClick={() => { setShopView("orders"); setPickupSimulation(null); pickupRef.current = null; }}>
            {c.orders}{currentOrders.length ? " (" + currentOrders.length + ")" : ""}
          </button>
        </div>
      </header>

      {pickupSimulation ? (
        <section className={styles.statusScreen} aria-label={pickupSimulation.mode === "delivery" ? c.deliveryStatus : c.pickupStatus}>
          <span className={styles.kicker}>{pickupSimulation.mode === "delivery" ? c.delivery : c.pickup}</span>
          <h1>{localizeStatus(previewStatus(pickupSimulation), language)}</h1>
          <p className={styles.statusLead}>
            {pickupSimulation.mode === "delivery"
              ? pickupSimulation.address + " · " + (futureDeliveryWindows(pickupSimulation.createdAt, 6, language).find((window) => window.id === pickupSimulation.deliveryWindowId)?.label || c.deliveryWindow)
              : DEMO_BRANCHES.find((item) => item.id === pickupSimulation.branchId)?.name + " · " + slotLabel(pickupSimulation.slotId, language)}
          </p>
          <ol className={styles.statusTracker} aria-label={c.orderProgress}>
            {(pickupSimulation.mode === "delivery" ? ["Confirmed", "Packing", "On the way"] : ["Confirmed", "Preparing", "Ready"]).map((stage, index) => (
              <li key={stage} data-complete={index <= pickupSimulation.stage} data-current={index === pickupSimulation.stage}>
                <span aria-hidden="true" /><strong>{localizeStatus(stage, language)}</strong>
              </li>
            ))}
          </ol>
          {pickupSimulation.mode === "pickup" ? <div className={styles.pickupIdentity}>
            <div><span>{c.pickupNumber}</span><strong>{pickupSimulation.pickupCode}</strong><small>{c.showCode}</small></div>
            <OrderQr order={pickupSimulation} language={language} />
          </div> : <div className={styles.deliveryIdentity}>
            <Truck size={28} aria-hidden="true" /><div><strong>{localizeStatus(previewStatus(pickupSimulation), language)}</strong><span>{pickupSimulation.pickupCode}</span></div>
          </div>}
          <button className={styles.detailsToggle} type="button" aria-expanded={orderDetailsOpen} onClick={() => setOrderDetailsOpen((open) => !open)}>
            {c.orderDetails} <ChevronDown size={18} aria-hidden="true" />
          </button>
          {orderDetailsOpen && confirmedDetails && <div className={styles.confirmedDetails}>
            {confirmedDetails.items.map((item) => <div key={item.basketKey}><span>{item.quantity} × {productName(productsById.get(item.productId), language)}</span><strong>{formatChf(item.lineTotalChf)}</strong></div>)}
            {pickupSimulation.quote?.savingsChf > 0 && <div><span>{c.offerApplied}</span><strong>−{formatChf(pickupSimulation.quote.savingsChf)}</strong></div>}
            <div className={styles.confirmedTotal}><span>{c.total}</span><strong>{formatChf(pickupSimulation.quote?.exampleTotalChf || confirmedDetails.totalChf)}</strong></div>
          </div>}
          <div className={styles.statusActions}>
            <button className={styles.backToShop} type="button" onClick={() => { setPickupSimulation(null); pickupRef.current = null; setShopView("orders"); window.scrollTo({ top: 0, behavior: "auto" }); }}>{c.backOrders}</button>
            <button className={styles.secondaryStatusAction} type="button" onClick={() => { setPickupSimulation(null); pickupRef.current = null; setShopView("shop"); window.scrollTo({ top: 0, behavior: "auto" }); }}>{c.continueShopping}</button>
          </div>
        </section>
      ) : shopView === "orders" ? (
        <section className={styles.ordersView} aria-label={c.orders}>
          <span className={styles.kicker}>{c.savedOrders}</span><h1>{c.yourOrders}</h1>
          {currentOrders.length ? currentOrders.map((order) => <article key={order.approvalId}>
            <button className={styles.orderSummary} type="button" onClick={() => { pickupRef.current = order; setPickupSimulation(order); setShopView("shop"); }}>
              <strong>{order.mode === "delivery" ? c.delivery : c.pickup + " " + order.pickupCode}</strong>
              <span>{order.mode === "delivery" ? order.address : DEMO_BRANCHES.find((item) => item.id === order.branchId)?.name}</span>
              <small>{localizeStatus(previewStatus(order), language)} · {formatChf(order.quote?.exampleTotalChf || 0)}</small>
            </button>
            <button type="button" onClick={() => reorderSample(order)}>{c.orderAgain}</button>
          </article>) : <p>{c.noOrders}</p>}
        </section>
      ) : (
        <section className={styles.shopScreen} aria-label="Honold shop">
          <div className={styles.fulfillmentSegment} role="group" aria-label="Fulfilment method">
            <button type="button" aria-pressed={fulfillmentMode === "pickup"} onClick={() => changeFulfillmentMode("pickup")}><Store size={18} aria-hidden="true" /> {c.pickup}</button>
            <button type="button" aria-pressed={fulfillmentMode === "delivery"} onClick={() => changeFulfillmentMode("delivery")}><Truck size={18} aria-hidden="true" /> {c.delivery}</button>
          </div>
          <button className={styles.fulfillmentSummary} type="button" onClick={() => setFulfillmentOpen(true)}>
            <MapPin size={20} aria-hidden="true" />
            <span><strong>{fulfillmentTitle}</strong><small>{fulfillmentSubtitle}</small></span>
            <span aria-hidden="true">{c.change}</span>
          </button>

          {featuredProduct && <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <h1>{profileId === "chocolate" ? c.heroGift : profileId === "regular" ? c.heroRegular : c.heroGuest}</h1>
              <p>{profileId === "chocolate" ? c.offerGift : profileId === "regular" ? c.offerRegular : c.offerGuest}</p>
              <div className={styles.heroActions}>
                <button type="button" disabled={sampleStock(featuredProduct.id, branchId) === 0} onClick={() => mutateBasket(featuredProduct.id, 1, "add")}>
                  {c.add} {formatChf(itemOffer(profileId, featuredProduct).eligible ? itemOffer(profileId, featuredProduct).indicativeEffectiveChf : featuredProduct.priceChf)}
                </button>
                {profileId === "regular" && customerSample.usual.length > 0 && <button className={styles.orderAgain} type="button"
                  onClick={() => customerSample.usual.forEach((item) => mutateBasket(basketKey(item.productId, item.options), item.quantity, "add"))}>{c.orderUsual}</button>}
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image src={featuredProduct.images[0].localPath} alt={featuredProduct.images[0].alt || featuredProduct.name} fill sizes="(max-width: 760px) 48vw, 420px" priority />
              <span>{productName(featuredProduct, language)}</span>
            </div>
          </section>}

          <nav className={styles.categoryNav} aria-label="Shop categories">
            {[["all", c.all], ["patisserie und torten", c.cakes], ["baeckerei", c.bakery], ["traiteur", c.savoury], ["schokolade", c.chocolate], ["konfekt", c.confections]]
              .map(([id, name]) => <button type="button" key={id} aria-pressed={activeCategory === id} onClick={() => browseCategory(id)}>{name}</button>)}
          </nav>
          {!isFullCatalogue && activeCategory === null && <div className={styles.resultsContext}>
            <span>{c.results}</span><button type="button" onClick={showAllProducts}>{c.viewAll}</button>
          </div>}

          <div ref={productGridRef} className={styles.productGrid}>
            {orderedGridProducts.map((product, index) => {
              const quantity = basketDetails.items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
              const offer = itemOffer(profileId, product);
              const unavailable = sampleStock(product.id, branchId) === 0;
              const image = product.images[0];
              return <article className={styles.productCard} key={product.id} data-selected={selectedId === product.id}>
                <button className={styles.productSelect} type="button" onClick={() => { selectProduct(product.id); setDetailProductId(product.id); setDetailOptions({ message: "None", wrap: "Standard" }); }} aria-label={c.view + " " + productName(product, language)}>
                  <div className={styles.imageWrap}>
                    {!imageFailures.has(product.id) && image ? <Image data-product-image={product.id} src={image.localPath} alt={image.alt || product.name}
                      fill sizes="(max-width: 760px) 50vw, 240px" priority={index < 4}
                      onError={() => { imageFailuresRef.current.add(product.id); setImageFailures((current) => new Set(current).add(product.id)); }} />
                      : <span className={styles.imageFallback}>{c.photoUnavailable}</span>}
                  </div>
                </button>
                <div className={styles.productText}>
                  <h2>{productName(product, language)}</h2>{unavailable && <small>{c.unavailableAt} {branch?.name}</small>}
                  <div className={styles.cardPrice}><strong>{formatChf(offer.eligible ? offer.indicativeEffectiveChf : product.priceChf)}</strong>{offer.eligible && <del>{formatChf(product.priceChf)}</del>}</div>
                </div>
                {quantity === 0 ? <button className={styles.cardAdd} type="button" disabled={unavailable} onClick={() => mutateBasket(product.id, 1, "add")} aria-label={c.add + " " + productName(product, language)}>
                  <Plus size={22} aria-hidden="true" />
                </button> : <div className={styles.cardStepper} aria-label={productName(product, language) + " " + c.quantity}>
                  <button type="button" aria-label={`${quantity === 1 ? c.removeItem : c.decrease} ${productName(product, language)}`} onClick={() => mutateBasket(product.id, 1, "remove")}><Minus size={16} aria-hidden="true" /></button><span>{quantity}</span>
                  <button type="button" aria-label={`${c.increase} ${productName(product, language)}`} disabled={quantity >= sampleStock(product.id, branchId)} onClick={() => mutateBasket(product.id, 1, "add")}><Plus size={16} aria-hidden="true" /></button>
                </div>}
              </article>;
            })}
          </div>
        </section>
      )}

      {!pickupSimulation && shopView === "shop" && <section className={styles.controlDock} data-status={voiceStatus} data-has-basket={hasBasket} aria-label={c.shoppingControls}>
        <div className={styles.dockActions}>
        <button ref={voiceButtonRef} className={styles.voiceAction} type="button" onClick={startVoice}
          aria-label={!voiceEnabled ? c.voiceUnavailable : sessionRef.current ? (isMuted ? "Unmute microphone" : "Mute microphone") : c.talkShop}
          disabled={!voiceEnabled || voiceStatus === "connecting"}>
          <span className={styles.voiceGlyph} aria-hidden="true">{isMuted ? <MicOff /> : <span className={styles.voiceBars}><span /><span /><span /><span /><span /></span>}</span>
          <strong>{visibleVoiceLabel}</strong>
        </button>
        {hasCaptions && <button ref={captionsButtonRef} className={styles.iconAction} type="button" aria-label={c.captions} onClick={() => setCaptionsOpen((open) => !open)}><Captions aria-hidden="true" /></button>}
        {hasBasket && <button className={styles.basketTrigger} type="button" onClick={openBasket}
          aria-label={c.basket + ", " + basketDetails.itemCount + " " + c.items + ", " + formatChf(quote.exampleTotalChf)}>
          <ShoppingBag size={19} aria-hidden="true" /><span>{basketDetails.itemCount}</span><strong>{formatChf(quote.exampleTotalChf)}</strong>
        </button>}
        </div>
        {(voiceStatus === "error" || voiceStatus === "unsupported") && <p className={styles.voiceNotice} role="status">{voiceMessage}</p>}
      </section>}

      {captionsOpen && transcript.length > 0 && <section className={styles.captions} aria-label={c.captions}>
        <header><strong>{c.captions}</strong><button type="button" onClick={closeCaptions}><X size={16} /></button></header>
        {transcript.slice(-2).map((item) => <p key={item.id + "-" + item.role}><span>{item.role === "assistant" ? "Honold" : c.you}</span>{item.text}</p>)}
      </section>}

      {detailProduct && <div className={styles.modalBackdrop} onMouseDown={() => setDetailProductId(null)}>
        <section className={styles.productDetail} role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className={styles.closeButton} type="button" onClick={() => setDetailProductId(null)} aria-label={c.closeDetails}><X /></button>
          <div className={styles.detailImage}><Image src={detailProduct.images[0].localPath} alt={detailProduct.images[0].alt || detailProduct.name} fill sizes="360px" /></div>
          <div className={styles.detailCopy}>
            <h2 id="product-detail-title">{productName(detailProduct, language)}</h2><p>{c.productInfo}</p>
            <div className={styles.detailPrice}><strong>{formatChf(itemOffer(profileId, detailProduct).eligible ? itemOffer(profileId, detailProduct).indicativeEffectiveChf : detailProduct.priceChf)}</strong>
              {itemOffer(profileId, detailProduct).eligible && <del>{formatChf(detailProduct.priceChf)}</del>}</div>
            {GIFT_OPTION_PRODUCT_IDS.has(detailProduct.id) && Object.entries(DEMO_VARIANTS).map(([id, option]) => <label key={id}>{id === "message" ? (language === "de" ? "Geschenknachricht" : "Gift message") : (language === "de" ? "Geschenkverpackung" : "Gift wrap")}
              <select value={detailOptions[id]} onChange={(event) => setDetailOptions((current) => ({ ...current, [id]: event.target.value }))}>
                {option.values.map((value) => <option key={value} value={value}>{({ None: c.none, "Happy Birthday": c.happyBirthday, "Thank you": c.thankYou, Standard: c.standard, Ribbon: c.ribbon })[value] || value}{id === "wrap" && value === "Ribbon" ? " · CHF 2.50" : ""}</option>)}
              </select>
            </label>)}
            <button className={styles.primaryAction} type="button" disabled={sampleStock(detailProduct.id, branchId) === 0}
              onClick={() => { mutateBasket(basketKey(detailProduct.id, detailOptions), 1, "add"); setDetailProductId(null); }}>
              {sampleStock(detailProduct.id, branchId) === 0 ? c.unavailableAt + " " + branch?.name : c.addBasket}
            </button>
          </div>
        </section>
      </div>}

      {fulfillmentOpen && <div className={`${styles.modalBackdrop} ${styles.fulfillmentBackdrop}`} onMouseDown={() => setFulfillmentOpen(false)}>
        <section className={styles.fulfillmentSheet} role="dialog" aria-modal="true" aria-labelledby="fulfillment-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className={styles.kicker}>{fulfillmentMode}</span><h2 id="fulfillment-title">{fulfillmentMode === "pickup" ? c.choosePickup : c.deliveryDetails}</h2></div>
            <button className={styles.closeButton} type="button" onClick={() => setFulfillmentOpen(false)}><X /></button></header>
          {fulfillmentMode === "pickup" ? <>
            <span className={styles.fieldLabel}>{c.branch}</span>
            <div className={styles.choiceGrid}>{DEMO_BRANCHES.map((item) => <button type="button" key={item.id} aria-pressed={branchId === item.id}
              onClick={() => updatePickupPreference("branch", item.id)}>{item.name}<small>{item.address}</small></button>)}</div>
            <span className={styles.fieldLabel}>{c.day}</span>
            <div className={styles.dayGrid}>{pickupDays.map((day) => {
              const first = availableSlots.find((slot) => slotDateId(slot.id) === day);
              return <button type="button" key={day} aria-pressed={activePickupDay === day} onClick={() => choosePickupDay(day)}>{first ? slotDayLabel(first.id, language) : day}</button>;
            })}</div>
            <label className={styles.selectField}>{c.time}<select value={daySlots.some((slot) => slot.id === slotId) ? slotId : ""} onChange={(event) => updatePickupPreference("slot", event.target.value)}>
              <option value="">{c.chooseTime}</option>{daySlots.map((slot) => {
                const local = zurichParts(Number(slot.id));
                return <option key={slot.id} value={slot.id}>{String(local.hour).padStart(2, "0")}:{String(local.minute).padStart(2, "0")}</option>;
              })}
            </select></label>
          </> : <>
            <label className={styles.selectField}>{c.address}<input value={deliveryAddress} onChange={(event) => changeDeliveryDetails("address", event.target.value)} /></label>
            <span className={styles.fieldLabel}>{c.deliveryWindow}</span>
            <div className={styles.windowList}>{deliveryWindows.map((window) => <button type="button" key={window.id} aria-pressed={deliveryWindowId === window.id}
              onClick={() => changeDeliveryDetails("window", window.id)}>{window.label}</button>)}</div>
          </>}
          <button className={styles.primaryAction} type="button" onClick={() => setFulfillmentOpen(false)}
            disabled={fulfillmentMode === "pickup" ? !slotId : !deliveryAddress.trim() || !deliveryWindowId}>{c.done}</button>
        </section>
      </div>}

      {basketOpen && <div className={styles.modalBackdrop} onMouseDown={closeBasket}>
        <section ref={drawerRef} className={styles.reviewSheet} role="dialog" aria-modal="true" aria-labelledby="basket-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className={styles.kicker}>{c.review}</span><h2 id="basket-title">{c.yourOrder}</h2></div>
            <button ref={drawerCloseRef} className={styles.closeButton} type="button" onClick={closeBasket} aria-label={c.closeReview}><X /></button></header>
          <button className={styles.reviewFulfillment} type="button" onClick={() => setFulfillmentOpen(true)}>
            {fulfillmentMode === "pickup" ? <Store size={20} /> : <Truck size={20} />}
            <span><strong>{fulfillmentTitle}</strong><small>{fulfillmentSubtitle}</small></span><em>{c.change}</em>
          </button>
          {basketDetails.items.length ? <div className={styles.reviewItems}>
            {basketDetails.items.map((item) => {
              const product = productsById.get(item.productId);
              return <article key={item.basketKey}>
                <div className={styles.reviewThumb}>{product?.images?.[0] && <Image src={product.images[0].localPath} alt="" fill sizes="68px" />}</div>
                <div className={styles.reviewItemCopy}><strong>{productName(product, language)}</strong>
                  {Object.values(item.options || {}).length > 0 && <small>{Object.values(item.options).map((value) => ({ None: c.none, "Happy Birthday": c.happyBirthday, "Thank you": c.thankYou, Standard: c.standard, Ribbon: c.ribbon })[value] || value).join(" · ")}</small>}
                  <div className={styles.reviewStepper}>
                    <button type="button" aria-label={`${item.quantity === 1 ? c.removeItem : c.decrease} ${productName(product, language)}`} onClick={() => mutateBasket(item.basketKey, 1, "remove")}><Minus size={15} aria-hidden="true" /></button><span>{item.quantity}</span>
                    <button type="button" aria-label={`${c.increase} ${productName(product, language)}`} onClick={() => mutateBasket(item.basketKey, 1, "add")}><Plus size={15} aria-hidden="true" /></button>
                  </div>
                </div>
                <strong className={styles.linePrice}>{formatChf(item.lineTotalChf)}</strong>
              </article>;
            })}
          </div> : <p className={styles.emptyBasket}>{c.emptyBasket}</p>}
          {basketDetails.items.length > 0 && <div className={styles.reviewTotals}>
            <div><span>{c.subtotal}</span><strong>{formatChf(quote.subtotalChf)}</strong></div>
            {quote.savingsChf > 0 && <div className={styles.offerLine}><span>{c.offerApplied}</span><strong>−{formatChf(quote.savingsChf)}</strong></div>}
            <div className={styles.totalLine}><span>{c.total}</span><strong>{formatChf(quote.exampleTotalChf)}</strong></div>
          </div>}
          {reviewAttempted && fulfillmentValidation.reason && <p className={styles.reviewWarning} role="alert">{localizeReason(fulfillmentValidation.reason, language)}</p>}
          {pickupError && <p className={styles.reviewWarning} role="alert">{localizeReason(pickupError, language)}</p>}
          <button className={styles.confirmOrder} type="button" disabled={!basketDetails.items.length} onClick={confirmTouchOrder}>
            {fulfillmentMode === "pickup" && !slotId ? c.choosePickupTime : fulfillmentMode === "delivery" && (!deliveryAddress.trim() || !deliveryWindowId) ? c.chooseDeliveryWindow : c.confirmOrder + " · " + formatChf(quote.exampleTotalChf)}
          </button>
        </section>
      </div>}
    </main>
  );
}

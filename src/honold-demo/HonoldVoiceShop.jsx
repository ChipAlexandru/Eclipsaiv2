"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Captions,
  Check,
  MicOff,
  Minus,
  Plus,
  ShoppingBag,
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
  DEMO_BRANCHES, DEMO_PROFILES, advancePreview, futureSlots, makePreview,
  offerQuote, pickupCheck, previewStatus, sampleStock, slotDateId, slotDayLabel, slotLabel, zurichParts,
} from "./pickupJourney.mjs";
import {
  DEMO_VARIANTS, SAMPLE_CUSTOMERS, approveReview, basketKey, itemOffer, makeReviewId, parseOrdersByProfile,
  pickupCodeForReview, reviewFingerprint, saveSampleOrder, serializeOrdersByProfile,
} from "./experience.mjs";

const IMAGE_WAIT_MS = 4500;
const VOICE_SESSION_DURATION_MS = 5 * 60 * 1000;

function formatChf(value) {
  return new Intl.NumberFormat("de-CH", {
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
  { id: "new", label: "New customer", profileId: "guest", category: "all", featuredProductId: "1917" },
  { id: "regular", label: "Returning regular", profileId: "regular", category: "offer", featuredProductId: "1917" },
  { id: "gift", label: "Gift shopping", profileId: "chocolate", category: "schokolade", featuredProductId: "255" },
  { id: "afternoon", label: "Afternoon offer", profileId: "regular", category: "patisserie und torten", featuredProductId: "1366" },
];

function safeToolResult(value) {
  return JSON.stringify(value);
}

export function HonoldVoiceShop({ catalog, voiceEnabled = false }) {
  const products = catalog.products;
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const validProductIds = useMemo(() => new Set(productsById.keys()), [productsById]);

  const [scenarioId, setScenarioId] = useState("regular");
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
  const [typedMessage, setTypedMessage] = useState("");

  const sessionRef = useRef(null);
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
  const clockRef = useRef(clockMs);
  const pickupRef = useRef(pickupSimulation);
  const pendingReviewRef = useRef(null);
  const ordersRef = useRef({});
  const reviewSequenceRef = useRef(0);
  const imageFailuresRef = useRef(new Set());

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const branch = DEMO_BRANCHES.find((item) => item.id === branchId);
  const quote = offerQuote(profileId, basketDetails, productsById);
  const activeScenario = PRESENTER_SCENARIOS.find((scenario) => scenario.id === scenarioId) || PRESENTER_SCENARIOS[0];
  const featuredProduct = productsById.get(activeScenario.featuredProductId);
  const pickupOptions = clockMs ? futureSlots(clockMs, branchId) : [];
  const pickupValidation = pickupCheck({ basket, branchId, slotId, nowMs: clockMs || 0 });
  const availableSlots = pickupOptions.filter((slot) => slot.capacity >= basketDetails.itemCount);
  const pickupDays = [...new Set(availableSlots.map((slot) => slotDateId(slot.id)))].slice(0, 4);
  const activePickupDay = pickupDays.includes(pickupDay) ? pickupDay : pickupDays[0];
  const daySlots = availableSlots.filter((slot) => slotDateId(slot.id) === activePickupDay);
  const hasVoiceSession = Boolean(sessionRef.current);
  const hasCaptions = transcript.length > 0;
  const hasBasket = basketDetails.itemCount > 0;
  const currentOrders = ordersByProfile[profileId] || [];
  const customerSample = SAMPLE_CUSTOMERS[profileId] || SAMPLE_CUSTOMERS.guest;
  const detailProduct = detailProductId ? productsById.get(detailProductId) : null;
  const gridProducts = activeCategory === null ? visibleProducts : visibleProducts.filter((product) => product.id !== featuredProduct?.id);
  const isFullCatalogue = visibleIds.length === products.length
    && visibleIds.every((id, index) => id === products[index]?.id);

  const stateSnapshot = useCallback(() => {
    const currentBasket = basketSummary(basketRef.current, productsById);
    const currentBranch = branchRef.current;
    const currentTime = Date.now();
    return {
      ...shoppingStateSnapshot({
        visibleIds: visibleIdsRef.current,
        selectedId: selectedIdRef.current,
        basket: basketRef.current,
      }, productsById),
      demoCheckout: {
        branches: DEMO_BRANCHES, profiles: DEMO_PROFILES,
        branchId: currentBranch, profileId: profileRef.current, slotId: slotRef.current,
        nextSlotExamples: futureSlots(currentTime, currentBranch).slice(0, 8),
        pickupDates: [...new Set(futureSlots(currentTime, currentBranch).map((slot) => slotDateId(slot.id)))].slice(0, 4),
        quote: offerQuote(profileRef.current, currentBasket, productsById),
        basketSampleStock: currentBasket.items.map((item) => ({
          productId: item.productId, requested: item.quantity,
          sampleAvailable: sampleStock(item.productId, currentBranch),
        })),
        validation: pickupCheck({ basket: basketRef.current, branchId: currentBranch, slotId: slotRef.current, nowMs: currentTime }),
        pickupPreview: pickupRef.current ? { code: pickupRef.current.pickupCode, status: previewStatus(pickupRef.current) } : null,
        basis: "Illustrative customer, branch stock, capacity, hours, offer and fulfillment scenario; no real transaction or customer data.",
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

    const displayedProducts = result.displayedIds.map((id) => compactProduct(productsById.get(id)));
    const visibleImagesReady = result.viewportIds.length > 0
      && result.displayedIds.length === result.viewportIds.length;
    return {
      displayed: visibleImagesReady,
      displayedProducts,
      selectedProduct: compactProduct(productsById.get(selectedIdRef.current)),
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
        basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current,
        profileId: profileRef.current,
        quote: offerQuote(profileRef.current, summary, productsById),
        nowMs: now,
      });
      pickupRef.current = result;
      setPickupSimulation(result);
      setPickupError("");
      return result;
    } catch (error) {
      setPickupError(error instanceof Error ? error.message : "Pickup is unavailable.");
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
        const check = pickupCheck({ basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current, nowMs: now });
        if (!check.ok) return safeToolResult({ ok: false, error: check.reason });
        const quote = offerQuote(profileRef.current, summary, productsById);
        const fingerprint = reviewFingerprint({ basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current, profileId: profileRef.current, exampleTotalChf: quote.exampleTotalChf });
        reviewSequenceRef.current += 1;
        const review = { fingerprint, reviewId: makeReviewId(fingerprint, now, reviewSequenceRef.current), createdAt: now, basket: { ...basketRef.current }, branchId: branchRef.current, slotId: slotRef.current, profileId: profileRef.current, quote };
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
          const liveFingerprint = reviewFingerprint({ basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current, profileId: profileRef.current, exampleTotalChf: liveQuote.exampleTotalChf });
          if (liveFingerprint !== review.fingerprint) throw new Error("The basket, offer, branch, or time changed. Prepare a fresh exact review.");
          const liveCheck = pickupCheck({ basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current, nowMs: now });
          if (!liveCheck.ok) throw new Error(liveCheck.reason);
          const approved = approveReview(review, intent, now);
          const result = createPickupSimulation();
          if (!result) return safeToolResult({ ok: false, error: "Final stock, slot, or price validation failed." });
          const completed = { ...result, orderId: approved.approvalId, pickupCode: pickupCodeForReview(approved.approvalId), reviewFingerprint: approved.fingerprint, payment: approved.payment };
          pickupRef.current = completed; setPickupSimulation(completed);
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
    closeVoiceSession("Talk to Shop");
  }, [closeVoiceSession]);

  const submitTypedRequest = useCallback(async (event) => {
    event.preventDefault();
    const message = typedMessage.trim();
    if (!message) return;
    setTypedMessage("");
    try {
      if (sessionRef.current?.sendMessage) {
        sessionRef.current.sendMessage(message);
        setVoiceMessage("Typed request sent");
      } else {
        const matches = searchCatalog(products, message, 8);
        if (matches.length) await presentProducts(matches.map((product) => product.id), matches[0].id);
        setVoiceMessage(matches.length ? "Local product search shown · connect voice for AI help" : "No local catalogue match · connect voice for AI help");
      }
    } catch {
      setVoiceStatus("error"); setVoiceMessage("The typed request could not be sent. Try reconnecting voice.");
    }
  }, [presentProducts, products, typedMessage]);

  const startVoice = useCallback(async () => {
    if (!voiceEnabled) return;
    if (sessionRef.current) {
      const nextMuted = !isMuted;
      sessionRef.current.mute(nextMuted);
      setIsMuted(nextMuted);
      setVoiceStatus(nextMuted ? "muted" : "listening");
      setVoiceMessage(nextMuted ? "Muted" : "Listening");
      return;
    }

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setVoiceStatus("unsupported");
      setVoiceMessage("Voice needs a secure, modern browser with microphone access.");
      return;
    }

    setVoiceStatus("connecting");
    setVoiceMessage("Connecting…");

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
        throw new Error(tokenPayload.error || "Voice service is unavailable.");
      }

      const initialSummary = stateSnapshot();
      const agent = new RealtimeAgent({
        name: "Honold voice shopper",
        voice: "marin",
        instructions: `You are the concise voice shopping assistant for this Honold shopping experience. Reply in the shopper's language, German or English.

Keep speech warm, natural, brief, and easy to interrupt. Help the shopper discover products, see photos, change quantities, choose a branch and pickup time, and review an order. Use the same natural customer language as the interface: Offer, Usual order, Orders, Review order, Confirm order, Pickup code, Received, Preparing, and Ready.

Critical rules:
- Do not volunteer or repeat prototype, demo, simulation, snapshot, or provenance caveats during ordinary shopping exchanges. If the shopper asks whether data or an action is real, live, current, or official, answer clearly and truthfully using the facts below.
- Acknowledge searches, basket edits, branch changes and time choices once in a short sentence. Do not read back the surrounding interface, repeat every product detail, or add a second confirmation.
- Availability is not live physical-store inventory. When availability matters, say it must be confirmed with Honold.
- Product prices are a public shop snapshot and may change. Do not present the basket total as a checkout quote.
- Never say an order, reservation, payment, pickup, or store message is real. No real transaction is possible here.
- Branch hours, stock, slot capacity, customer profiles, offers, savings, example totals, progress and pickup codes are all illustrative demo data, not Honold business data or real customer data.
- Use get_shopping_state to obtain branch and profile IDs and sample availability. For a spoken time such as 12:15, call find_demo_pickup_slots, then pass a returned ID to set_demo_pickup_preference. A branch change clears the slot. Never invent a slot or claim sample stock is live.
- Explain the selected offer, eligibility, savings, pickup branch and time, and visible total before asking the shopper to confirm. If a branch lacks sample stock or a slot lacks sample capacity, offer alternatives from the state instead of implying pickup is possible.
- Use search_and_show_products whenever the shopper expresses a product need or asks for options. Describe as visible only the products returned in displayedProducts; below-fold products are not currently visible.
- Call get_shopping_state before interpreting words such as 'this one', 'that', or 'two of this one'. The touch-selected product is authoritative.
- Use only stable IDs returned by tools. Never invent products, prices, stock, ingredients, dietary suitability, or allergen facts.
- Do not make allergen assurances. Tell the shopper to confirm ingredients and allergens with Honold.
- When the shopper asks to review pickup, call prepare_simulated_pickup and read the exact visible review. Approval must occur in a later explicit shopper turn, by touch or approve_simulated_order with the unchanged review ID and fingerprint. Browsing, recommendation and review requests are never approval.
- Give one complete order readback when the exact review opens. Do not repeat that readback unless the basket, offer, branch, or time changes.
- After explicit approval, give one concise confirmation with the pickup code and status; do not recap the order again. Internally, the confirmation creates only a persistent fictional-profile sample order; Received, Preparing and Ready are manually advanced states and never real fulfilment events.
- When a tool says a newer selection made its result stale, use the newer state and do not describe the stale products.

Initial interface state: ${JSON.stringify(initialSummary)}`,
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
              transcription: { model: "gpt-4o-mini-transcribe" },
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
        setVoiceMessage("Speaking");
      });
      session.on("audio_stopped", () => {
        if (!mountedRef.current) return;
        setVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage(session.muted ? "Muted" : "Listening");
      });
      session.on("audio_interrupted", () => {
        if (!mountedRef.current) return;
        setVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage("Listening");
      });
      session.on("error", () => {
        console.error("Realtime session error");
        if (!mountedRef.current) return;
        clearVoiceTimeout();
        if (sessionRef.current === session) sessionRef.current = null;
        session.close();
        setVoiceStatus("error");
        setVoiceMessage("Voice connection failed. Try again.");
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
        closeVoiceSession("Talk to Shop");
      }, VOICE_SESSION_DURATION_MS);
      setVoiceStatus("listening");
      setVoiceMessage("Listening");
      session.sendMessage("Greet the shopper in one short sentence, then ask what they would like today.");
    } catch (error) {
      clearVoiceTimeout();
      if (sessionRef.current) sessionRef.current.close();
      sessionRef.current = null;
      const denied = error?.name === "NotAllowedError" || /microphone|permission/i.test(error?.message || "");
      setVoiceStatus("error");
      setVoiceMessage(denied
        ? "Microphone access was not granted. Allow it in your browser and try again."
        : (error instanceof Error ? error.message : "Voice service is unavailable."));
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
    const nextIds = scenario.category === "all"
      ? products.map((product) => product.id)
      : scenario.category === "offer"
        ? products.filter((product) => ["baeckerei", "patisserie und torten"].includes(product.productType)).map((product) => product.id)
        : products.filter((product) => product.productType === scenario.category).map((product) => product.id);
    setScenarioId(scenario.id);
    updatePickupPreference("profile", scenario.profileId);
    presentationSequenceRef.current += 1;
    visibleIdsRef.current = nextIds;
    setVisibleIds(nextIds);
    selectedIdRef.current = scenario.featuredProductId;
    setSelectedId(scenario.featuredProductId);
    setActiveCategory(scenario.category);
    setShopView("shop");
    setDetailProductId(null);
    setBasketOpen(false);
    queueMicrotask(() => sendInterfaceState("the presenter changed the shopping scenario"));
  }, [products, sendInterfaceState, updatePickupPreference]);

  const openBasket = useCallback(() => setBasketOpen(true), []);
  const closeBasket = useCallback(() => setBasketOpen(false), []);
  const closeCaptions = useCallback(() => {
    setCaptionsOpen(false);
    requestAnimationFrame(() => captionsButtonRef.current?.focus());
  }, []);

  const prepareExactReview = useCallback(() => {
    if (!pickupValidation.ok) return;
    const fingerprint = reviewFingerprint({ basket, branchId, slotId, profileId, exampleTotalChf: quote.exampleTotalChf });
    const now = Date.now();
    reviewSequenceRef.current += 1;
    const review = { fingerprint, reviewId: makeReviewId(fingerprint, now, reviewSequenceRef.current), createdAt: now, basket: { ...basket }, branchId, slotId, profileId, quote };
    pendingReviewRef.current = review; setPendingReview(review);
  }, [basket, branchId, pickupValidation.ok, profileId, quote, slotId]);

  const approveExactReview = useCallback((intent = "approve") => {
    try {
      const review = pendingReviewRef.current;
      pendingReviewRef.current = null; setPendingReview(null);
      const now = Date.now();
      const liveSummary = basketSummary(basketRef.current, productsById);
      const liveQuote = offerQuote(profileRef.current, liveSummary, productsById);
      const liveFingerprint = reviewFingerprint({ basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current, profileId: profileRef.current, exampleTotalChf: liveQuote.exampleTotalChf });
      if (!review || review.fingerprint !== liveFingerprint) throw new Error("The basket, offer, branch, or time changed. Prepare a fresh exact review.");
      const liveCheck = pickupCheck({ basket: basketRef.current, branchId: branchRef.current, slotId: slotRef.current, nowMs: now });
      if (!liveCheck.ok) throw new Error(liveCheck.reason);
      const approved = approveReview(review, intent, now);
      const result = createPickupSimulation();
      if (!result) return null;
      const completed = { ...result, orderId: approved.approvalId, pickupCode: pickupCodeForReview(approved.approvalId), reviewFingerprint: approved.fingerprint, payment: approved.payment };
      pickupRef.current = completed;
      setPickupSimulation(completed);
      setOrdersByProfile((current) => ({ ...current, [profileId]: saveSampleOrder(current[profileId] || [], approved, completed) }));
      queueMicrotask(() => sendInterfaceState("the shopper explicitly approved the exact review; simulated payment and sample order were created"));
      return completed;
    } catch (error) {
      setPickupError(error instanceof Error ? error.message : "Approval failed.");
      return null;
    }
  }, [createPickupSimulation, productsById, profileId, sendInterfaceState]);

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
    setPickupError("Your reorder is ready. Availability and prices were refreshed; choose a pickup time and review again.");
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

  return (
    <main className={styles.page}>
      <aside className={styles.presenterBar} aria-label="Presentation controls">
        <strong>Customer view</strong>
        <label>Shopping as
          <select aria-label="Shopping scenario" value={scenarioId} onChange={(event) => applyScenario(event.target.value)}>
            {PRESENTER_SCENARIOS.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}
          </select>
        </label>
      </aside>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.brandMark}>
            <Image
              className={styles.brandLogo}
              src="/honold-demo/brand/honold-logo.svg"
              alt="Confiserie Honold"
              width={140}
              height={120}
              priority
            />
          </h1>
        </div>
        <div className={styles.location} aria-label={`Pickup location: ${branch?.name}`}>
          <strong>{branch?.name}</strong>
        </div>
      </header>

      <nav className={styles.viewNav} aria-label="Honold sections">
        <button type="button" aria-pressed={shopView === "shop"} onClick={() => setShopView("shop")}>Shop</button>
        <button type="button" aria-pressed={shopView === "orders"} onClick={() => setShopView("orders")}>Orders {currentOrders.length ? `(${currentOrders.length})` : ""}</button>
      </nav>

      {shopView === "orders" ? <section className={styles.ordersView} aria-label="Orders">
        <h2>Your orders</h2>
        {currentOrders.length ? currentOrders.map((order) => <article key={order.approvalId}>
          <div><strong>{order.pickupCode}</strong><span>{DEMO_BRANCHES.find((item) => item.id === order.branchId)?.name} · {slotLabel(order.slotId)}</span><small>Confirmed · {previewStatus(order)}</small></div>
          <button type="button" onClick={() => reorderSample(order)}>Reorder into basket</button>
        </article>) : <p>No orders yet.</p>}
      </section> : <section className={styles.productSurface} aria-label="Honold products">
        <section className={styles.storefront} aria-label="Honold offers and featured product">
          <div className={styles.storefrontBody}>
            <div className={styles.storefrontCopy}>
              <h2>{profileId === "regular" ? "Something sweet for the day." : profileId === "chocolate" ? "Chocolate deserves a moment." : "Find your favourite treat."}</h2>
              <p>{profileId === "regular" ? "Enjoy 10% off bakery & pâtisserie, up to CHF 5." : profileId === "chocolate" ? "Enjoy 15% off chocolate, up to CHF 8." : "Explore Honold's bakery, pâtisserie and chocolate selection."}</p>
              {hasBasket && profileId !== "guest" && <span className={styles.homeSavings}>{quote.savingsChf > 0 ? `Basket saving ${formatChf(quote.savingsChf)}` : "Add an eligible treat to save"}</span>}
              <button className={styles.storefrontAction} type="button" onClick={browseOfferProducts}>
                {profileId === "guest" ? "Explore the menu" : "View selection"} <span aria-hidden="true">→</span>
              </button>
            </div>
            {featuredProduct && <div className={styles.featuredProduct}>
              <div className={styles.featuredImage}>
                <Image src={featuredProduct.images[0].localPath} alt={featuredProduct.images[0].alt || featuredProduct.name} fill sizes="(max-width: 760px) 44vw, 280px" priority />
              </div>
              <div className={styles.featuredCaption}>
                <span>{featuredProduct.name}</span>
                <strong>{formatChf(featuredProduct.priceChf)}</strong>
                {itemOffer(profileId, featuredProduct).eligible && <em>Offer {formatChf(itemOffer(profileId, featuredProduct).indicativeEffectiveChf)}</em>}
              </div>
              <button className={styles.featuredAdd} type="button" disabled={sampleStock(featuredProduct.id, branchId) === 0} onClick={() => mutateBasket(featuredProduct.id, 1, "add")} aria-label={`Add featured ${featuredProduct.name} to basket`}><Plus size={18} aria-hidden="true" /></button>
            </div>}
          </div>
        </section>

        <div className={styles.pickupStrip}>
          <div><span className={styles.eyebrow}>Pickup</span><strong>{slotId ? slotLabel(slotId) : "Choose a time that suits you"}</strong></div>
          <button type="button" onClick={openBasket}>{slotId ? "Review pickup" : "Plan pickup"} <span aria-hidden="true">→</span></button>
          {pickupSimulation && <button className={styles.pickupStatus} type="button" onClick={openBasket}>Order {pickupSimulation.pickupCode} · {previewStatus(pickupSimulation)}</button>}
        </div>

        <nav className={styles.categoryNav} aria-label="Shop categories">
          <div><h2>Shop the menu</h2></div>
          <div className={styles.categoryList}>
            {[
              ["all", "All"], ["patisserie und torten", "Cakes & pâtisserie"], ["baeckerei", "Bakery"],
              ["traiteur", "Savoury"], ["schokolade", "Chocolate"], ["konfekt", "Confections"],
            ].map(([id, name]) => <button type="button" key={id} aria-pressed={activeCategory === id} onClick={() => browseCategory(id)}>{name}</button>)}
          </div>
        </nav>
        {profileId !== "guest" && <section className={styles.returningStrip} aria-label="Your recommendations">
          <div><span className={styles.eyebrow}>Your usual</span><strong>{customerSample.history.length} recent favourites</strong></div>
          {customerSample.usual.length > 0 && <button type="button" onClick={() => customerSample.usual.forEach((item) => mutateBasket(basketKey(item.productId, item.options), item.quantity, "add"))}>Add usual order</button>}
        </section>}
        {!isFullCatalogue && (
          <div className={styles.resultsContext}>
            <span>{activeCategory === "offer" ? "Offer selection" : activeCategory ? "Category selection" : "Search results"}</span>
            <button type="button" onClick={showAllProducts}>All products</button>
          </div>
        )}

        <div ref={productGridRef} className={styles.productGrid}>
          {gridProducts.map((product, index) => {
            const quantity = basket[product.id] || 0;
            const image = product.images[0];
            const imageFailed = imageFailures.has(product.id);
            return (
              <article
                className={styles.productCard}
                data-selected={selectedId === product.id}
                key={product.id}
              >
                <button
                  className={styles.productSelect}
                  type="button"
                  onClick={() => { selectProduct(product.id); setDetailProductId(product.id); setDetailOptions({ message: "None", wrap: "Standard" }); }}
                  aria-label={`Select ${product.name} for voice reference`}
                  aria-pressed={selectedId === product.id}
                >
                  <div className={styles.imageWrap}>
                    {!imageFailed && image ? (
                      <Image
                        data-product-image={product.id}
                        src={image.localPath}
                        alt={image.alt || product.name}
                        fill
                        sizes="(max-width: 760px) 50vw, (max-width: 860px) 33vw, (max-width: 1100px) 25vw, 240px"
                        priority={index < 5}
                        onError={(event) => {
                          event.currentTarget.dataset.failed = "true";
                          imageFailuresRef.current.add(product.id);
                          setImageFailures((current) => new Set(current).add(product.id));
                        }}
                      />
                    ) : (
                      <span className={styles.imageFallback}>Photo unavailable</span>
                    )}
                  </div>
                </button>
                <div className={styles.productText}>
                  <span>{CATEGORY_NAMES[product.productType] || product.productType}</span>
                  <h2>{product.name}</h2>
                  <small data-stock={sampleStock(product.id, branchId) === 0 ? "none" : "available"}>{sampleStock(product.id, branchId) === 0 ? `Unavailable at ${branch?.name}` : `${sampleStock(product.id, branchId)} available at ${branch?.name}`}</small>
                </div>
                <div className={styles.cardBottom}>
                  <div className={styles.cardPrice}><strong className={styles.productPrice}>{formatChf(product.priceChf)}</strong>{itemOffer(profileId, product).eligible && <span>Offer {formatChf(itemOffer(profileId, product).indicativeEffectiveChf)}</span>}</div>
                  <div className={styles.cardAction}>
                  {quantity === 0 ? (
                    <button type="button" disabled={sampleStock(product.id, branchId) === 0} onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add ${product.name} to basket`}>
                      <Plus size={32} strokeWidth={2.6} aria-hidden="true" />
                    </button>
                  ) : (
                    <div className={styles.stepper} aria-label={`${product.name} quantity`}>
                      <button type="button" onClick={() => mutateBasket(product.id, 1, "remove")} aria-label={`Remove one ${product.name}`}><Minus size={16} aria-hidden="true" /></button>
                      <span>{quantity}</span>
                      <button type="button" disabled={quantity >= sampleStock(product.id, branchId)} onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add one ${product.name}`}><Plus size={16} aria-hidden="true" /></button>
                    </div>
                  )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>}

      <section
        className={styles.controlDock}
        data-status={voiceStatus}
        data-has-session={hasVoiceSession}
        data-has-captions={hasCaptions}
        data-has-basket={hasBasket}
        aria-label="Shopping controls"
      >
        <div className={styles.dockRow}>
          <button
            ref={voiceButtonRef}
            className={styles.voiceAction}
            type="button"
            onClick={startVoice}
            aria-label={!voiceEnabled ? "Voice unavailable" : sessionRef.current
              ? (isMuted ? "Unmute microphone" : "Mute microphone")
              : (voiceStatus === "error" || voiceStatus === "unsupported" ? "Try voice again" : "Talk to Shop")}
            aria-describedby={voiceStatus === "error" || voiceStatus === "unsupported" ? "voice-error" : undefined}
            disabled={!voiceEnabled || voiceStatus === "connecting"}
          >
            <span className={styles.voiceGlyph} aria-hidden="true">
              {isMuted ? (
                <MicOff className={styles.mutedGlyph} />
              ) : (
                <span className={styles.voiceBars}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </span>
            <span className={styles.voiceLabel}>
              <strong>{!voiceEnabled ? "Voice unavailable" : voiceStatus === "error" || voiceStatus === "unsupported" ? "Try voice again" : voiceMessage}</strong>
            </span>
            {voiceStatus === "connecting" && <span className={styles.connectingIndicator} aria-hidden="true" />}
            {hasVoiceSession && voiceStatus !== "connecting" && <span className={styles.readyIndicator} aria-hidden="true" />}
          </button>

          {hasCaptions && (
            <button
              ref={captionsButtonRef}
              className={styles.iconAction}
              type="button"
              aria-label={captionsOpen ? "Close captions" : "Open captions"}
              aria-expanded={captionsOpen}
              onClick={() => setCaptionsOpen((open) => !open)}
            >
              <Captions aria-hidden="true" />
            </button>
          )}

          {hasVoiceSession && (
            <button className={styles.endVoice} type="button" onClick={disconnectVoice} aria-label="End voice session">
              <X aria-hidden="true" />
            </button>
          )}

          {hasBasket && (
            <button
              className={styles.basketTrigger}
              type="button"
              onClick={openBasket}
              aria-label={`Basket, ${basketDetails.itemCount} ${basketDetails.itemCount === 1 ? "item" : "items"}, ${formatChf(basketDetails.totalChf)}`}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span>{basketDetails.itemCount}</span>
              <strong>{formatChf(basketDetails.totalChf)}</strong>
            </button>
          )}
        </div>

        <form className={styles.typedRequest} onSubmit={submitTypedRequest}>
          <input aria-label="Type a shopping request" value={typedMessage} onChange={(event) => setTypedMessage(event.target.value)} placeholder={hasVoiceSession ? "Type a request…" : "Search products…"} />
          <button type="submit">Send</button>
        </form>

        {(voiceStatus === "error" || voiceStatus === "unsupported") ? (
          <p className={styles.voiceNotice} id="voice-error" role="status" aria-live="polite">{voiceMessage}</p>
        ) : voiceStatus !== "idle" && voiceMessage !== "Talk to Shop" ? (
          <span className={styles.visuallyHidden} role="status" aria-live="polite">{voiceMessage}</span>
        ) : null}

        {captionsOpen && transcript.length > 0 && (
          <div className={styles.captions} role="region" aria-label="Live captions" aria-live="polite">
            <div className={styles.captionsHeader}>
              <strong>Captions</strong>
              <button type="button" onClick={closeCaptions} aria-label="Close captions"><X size={16} /></button>
            </div>
            {transcript.slice(-2).map((item) => (
              <p key={`${item.id}-${item.role}`}>
                <span>{item.role === "assistant" ? "Honold" : "You"}</span>
                {item.text}
              </p>
            ))}
          </div>
        )}
      </section>

      {detailProduct && <div className={styles.detailBackdrop} onMouseDown={() => setDetailProductId(null)}>
        <section className={styles.detailSheet} role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className={styles.detailClose} type="button" onClick={() => setDetailProductId(null)} aria-label="Close product details"><X /></button>
          <div className={styles.detailImage}><Image src={detailProduct.images[0].localPath} alt={detailProduct.images[0].alt || detailProduct.name} fill sizes="360px" /></div>
          <div className={styles.detailCopy}>
            <span className={styles.eyebrow}>{CATEGORY_NAMES[detailProduct.productType] || detailProduct.productType}</span>
            <h2 id="product-detail-title">{detailProduct.name}</h2>
            <p>For ingredient and allergen information, please ask our team.</p>
            <div className={styles.detailPrice}><span>List price <strong>{formatChf(detailProduct.priceChf)}</strong></span>{itemOffer(profileId, detailProduct).eligible && <span>Offer price <strong>{formatChf(itemOffer(profileId, detailProduct).indicativeEffectiveChf)}</strong></span>}</div>
            <small>Your final saving is calculated across your basket and follows the offer limit.</small>
            {Object.entries(DEMO_VARIANTS).map(([id, option]) => <label key={id}>{option.label} <em>{id === "wrap" ? "+CHF 2.50 for Ribbon" : "Optional"}</em>
              <select value={detailOptions[id]} onChange={(event) => setDetailOptions((current) => ({ ...current, [id]: event.target.value }))}>{option.values.map((value) => <option key={value}>{value}</option>)}</select>
            </label>)}
            <button className={styles.detailAdd} type="button" disabled={sampleStock(detailProduct.id, branchId) === 0} onClick={() => { mutateBasket(basketKey(detailProduct.id, detailOptions), 1, "add"); setDetailProductId(null); }}>
              {sampleStock(detailProduct.id, branchId) === 0 ? `Unavailable at ${branch?.name}` : "Add configured item"}
            </button>
            {sampleStock(detailProduct.id, branchId) === 0 && <p>Try the other branch; availability will be checked again.</p>}
          </div>
        </section>
      </div>}

      {basketOpen && (
        <div className={styles.drawerBackdrop} onMouseDown={closeBasket}>
          <section
            ref={drawerRef}
            className={styles.basketDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="basket-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.drawerHeader}>
              <div>
                <span>Pickup</span>
                <h2 id="basket-title">Your basket</h2>
              </div>
              <button ref={drawerCloseRef} type="button" onClick={closeBasket} aria-label="Close basket"><X aria-hidden="true" /></button>
            </header>


            {pickupSimulation && (
              <div ref={pickupResultRef} className={styles.progressCard} role="status" tabIndex={-1}>
                <span className={styles.eyebrow}>Pickup status</span>
                <strong>Pickup code {pickupSimulation.pickupCode}</strong>
                <span>{DEMO_BRANCHES.find((item) => item.id === pickupSimulation.branchId)?.name} · {slotLabel(pickupSimulation.slotId)}</span>
                <ol className={styles.progressSteps} aria-label="Order progress">
                  {["Received", "Preparing", "Ready"].map((stage, index) => (
                    <li key={stage} data-complete={index <= pickupSimulation.stage}>{stage}</li>
                  ))}
                </ol>
                {previewStatus(pickupSimulation) !== "Ready" && (
                  <button type="button" onClick={advancePickup}>Update status</button>
                )}
              </div>
            )}

            {basketDetails.items.length === 0 ? (
              <p className={styles.drawerEmpty}>Your basket is empty. Choose a branch and time, then add a product to plan your pickup.</p>
            ) : (
                <div className={styles.basketItems}>
                  {basketDetails.items.map((item) => (
                    <div className={styles.basketItem} key={item.productId}>
                      <div>
                        <strong>{item.name}</strong>
                        {Object.keys(item.options || {}).length > 0 && <span>{Object.values(item.options).join(" · ")}</span>}
                        <span>{formatChf(item.unitPriceChf)} each</span>
                        <span data-short={item.quantity > sampleStock(item.productId, branchId)}>
                          Available: {sampleStock(item.productId, branchId)}
                        </span>
                      </div>
                      <div className={styles.basketItemRight}>
                        <strong>{formatChf(item.lineTotalChf)}</strong>
                        <div className={styles.miniStepper} aria-label={`${item.name} quantity in basket`}>
                          <button type="button" onClick={() => mutateBasket(item.basketKey, 1, "remove")} aria-label={`Remove one ${item.name}`}><Minus size={15} aria-hidden="true" /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => mutateBasket(item.basketKey, 1, "add")} aria-label={`Add one ${item.name}`}><Plus size={15} aria-hidden="true" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
                <section className={styles.pickupConfig} aria-label="Pickup choices">
                  <h3>Plan your pickup</h3>
                  <div className={styles.offerBox}>
                    <strong className={styles.savingsHeadline}>{quote.savingsChf > 0 ? `You save ${formatChf(quote.savingsChf)}` : profileId === "guest" ? "No offer selected" : "Add eligible items"}</strong>
                    <span>{quote.profileName} · {quote.description}</span>
                    <span>Applies to {formatChf(quote.eligibleSubtotalChf)} in eligible items</span>
                    <div className={styles.offerMath}>
                      <span>List subtotal {formatChf(quote.subtotalChf)}</span>
                      <strong>−{formatChf(quote.savingsChf)}</strong>
                    </div>
                  </div>
                  <span className={styles.fieldLabel}>Pickup branch</span>
                  <div className={styles.branchGrid} role="group" aria-label="Pickup branch">
                    {DEMO_BRANCHES.map((item) => <button type="button" key={item.id}
                      aria-pressed={branchId === item.id} onClick={() => updatePickupPreference("branch", item.id)}>
                      {item.name}
                    </button>)}
                  </div>
                  <span className={styles.branchAddress}>{branch?.address}</span>
                  <span className={styles.fieldLabel}>Pickup time · Zurich</span>
                  {availableSlots.length ? (
                    <>
                      <div className={styles.dayGrid} aria-label="Pickup day">
                        {pickupDays.map((day) => {
                          const first = availableSlots.find((slot) => slotDateId(slot.id) === day);
                          return <button type="button" key={day} aria-pressed={activePickupDay === day} onClick={() => choosePickupDay(day)}>
                            {first ? slotDayLabel(first.id) : day}
                          </button>;
                        })}
                      </div>
                      <select aria-label="Pickup time" value={daySlots.some((slot) => slot.id === slotId) ? slotId : ""}
                        onChange={(event) => updatePickupPreference("slot", event.target.value)}>
                        <option value="">Choose a time</option>
                        {daySlots.map((slot) => {
                          const local = zurichParts(Number(slot.id));
                          return <option key={slot.id} value={slot.id}>
                            {String(local.hour).padStart(2, "0")}:{String(local.minute).padStart(2, "0")}
                          </option>;
                        })}
                      </select>
                    </>
                  ) : <p className={styles.optionWarning}>No pickup time can fit this basket. Reduce quantity or try the other branch.</p>}
                  {pickupValidation.stockIssues.length > 0 && (
                    <p className={styles.optionWarning}>Availability is limited at {branch?.name}. Reduce the flagged quantity or try the other branch.</p>
                  )}
                </section>

                {hasBasket && <div className={styles.drawerFooter}>
                  <div className={styles.total}><span>Total</span><strong>{formatChf(quote.exampleTotalChf)}</strong></div>
                  {pickupValidation.reason && <p className={styles.optionWarning} role="status">{pickupValidation.reason}</p>}
                  {pickupError && <p className={styles.optionWarning} role="alert">{pickupError}</p>}
                  {!pickupSimulation && (
                    pendingReview ? <div className={styles.exactReview}>
                      <strong>Ready to confirm</strong>
                      <span>{basketDetails.itemCount} items · {branch?.name} · {slotLabel(slotId)} · {formatChf(quote.exampleTotalChf)}</span>
                      <small>Check your items, offer, branch and pickup time. Any change will refresh this review.</small>
                      <button className={styles.confirmPickup} type="button" onClick={() => approveExactReview("approve")}><Check size={18} aria-hidden="true" /> Confirm order</button>
                    </div> : <button className={styles.confirmPickup} type="button" onClick={prepareExactReview} disabled={!pickupValidation.ok}>
                      <Check size={18} aria-hidden="true" /> Review order
                    </button>
                  )}
                </div>}
          </section>
        </div>
      )}
    </main>
  );
}

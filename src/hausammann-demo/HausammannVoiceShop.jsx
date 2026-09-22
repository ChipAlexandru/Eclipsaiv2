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
import {
  DEMO_BRANCHES, DEMO_PROFILES, SHOPPING_SCENARIOS, TRACKER_STAGES, checkPickup,
  listPickupSlots, nextTrackerStage, offerFor, pickupAlternatives, pickupCode,
} from "./pickup.mjs";
import {
  alternateSampleBranch, defaultOptionIdFor, demoOptionsFor, demoProfileStory, formatDemoChf, lineKeyFor,
  parseLineKey, parseOrders, quoteBasket, quoteProduct, reviewFingerprint, sampleStockFor, serializeOrders,
} from "./commerce.mjs";
import styles from "./hausammannVoiceShop.module.css";

const IMAGE_WAIT_MS = 4500;
const VOICE_SESSION_DURATION_MS = 5 * 60 * 1000;

function safeToolResult(value) {
  return JSON.stringify(value);
}

export function HausammannVoiceShop({ catalog, voiceEnabled = false }) {
  const products = catalog.products;
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const validProductIds = useMemo(() => new Set(productsById.keys()), [productsById]);

  const [visibleIds, setVisibleIds] = useState(() => products.map((product) => product.id));
  const [selectedId, setSelectedId] = useState(null);
  const [basket, setBasket] = useState({});
  const [basketOpen, setBasketOpen] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Talk to shop");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [pickupSimulation, setPickupSimulation] = useState(null);
  const [demoNow, setDemoNow] = useState(null);
  const [pickupChoice, setPickupChoice] = useState({ profileId: "bread", branchId: "uni88", slotId: "" });
  const [checkoutError, setCheckoutError] = useState("");
  const [imageFailures, setImageFailures] = useState(() => new Set());
  const [detailProductId, setDetailProductId] = useState(null);
  const [detailOptionId, setDetailOptionId] = useState("standard");
  const [pendingReview, setPendingReview] = useState(null);
  const [ordersByProfile, setOrdersByProfile] = useState({});
  const [ordersHydrated, setOrdersHydrated] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [typedRequest, setTypedRequest] = useState("");

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
  const nowRef = useRef(null);
  const pickupChoiceRef = useRef(pickupChoice);
  const pickupSimulationRef = useRef(null);
  const pendingReviewRef = useRef(null);
  const ordersByProfileRef = useRef({});
  const imageFailuresRef = useRef(new Set());

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const hasVoiceSession = Boolean(sessionRef.current);
  const hasCaptions = transcript.length > 0;
  const hasBasket = basketDetails.itemCount > 0;
  const slots = demoNow ? listPickupSlots(demoNow, pickupChoice.branchId) : [];
  const slotGroups = [...new Set(slots.map((slot) => slot.id.slice(0, 10)))].map((day) => ({
    day,
    label: slots.find((slot) => slot.id.startsWith(day))?.label.split(",")[0] || day,
    slots: slots.filter((slot) => slot.id.startsWith(day)),
  }));
  const pickupDate = pickupChoice.slotId.slice(0, 10) || slotGroups[0]?.day || "";
  const daySlots = slotGroups.find((group) => group.day === pickupDate)?.slots || [];
  const pickupCheck = demoNow ? checkPickup({ basket, branchId: pickupChoice.branchId, slotId: pickupChoice.slotId, now: demoNow, productsById }) : { valid: false, issues: ["Loading pickup times…"] };
  const sampleOffer = offerFor(pickupChoice.profileId, basket, productsById);
  const basketQuote = quoteBasket(basket, productsById, pickupChoice.profileId);
  const profileStory = demoProfileStory(pickupChoice.profileId, products);
  const profileOrders = ordersByProfile[pickupChoice.profileId] || [];
  const alternatives = demoNow && hasBasket && !pickupCheck.valid
    ? pickupAlternatives({ basket, now: demoNow, productsById }) : [];
  const isFullCatalogue = visibleIds.length === products.length
    && visibleIds.every((id, index) => id === products[index]?.id);
  const categories = ["All", ...new Set(products.map((product) => product.productType))];
  const activeCategory = categories.slice(1).find((category) => {
    const categoryIds = products.filter((product) => product.productType === category).map((product) => product.id);
    return categoryIds.length === visibleIds.length && categoryIds.every((id, index) => id === visibleIds[index]);
  }) || (isFullCatalogue ? "All" : null);
  const featuredProduct = products.find((product) => product.productType === sampleOffer.category) || products[0];
  const featuredQuote = quoteProduct(featuredProduct, pickupChoice.profileId);
  const offerHeading = sampleOffer.percent ? sampleOffer.title : "Fresh picks for today";

  useEffect(() => {
    const currentOrders = window.localStorage.getItem("hausammann-orders-v2");
    const stored = parseOrders(currentOrders || window.localStorage.getItem("hausammann-demo-orders-v1"));
    ordersByProfileRef.current = stored;
    setOrdersByProfile(stored);
    setOrdersHydrated(true);
  }, []);

  useEffect(() => {
    if (!ordersHydrated) return;
    window.localStorage.setItem("hausammann-orders-v2", serializeOrders(ordersByProfile));
  }, [ordersByProfile, ordersHydrated]);

  useEffect(() => {
    if (!ordersHydrated) return;
    const latest = (ordersByProfile[pickupChoice.profileId] || [])[0] || null;
    pickupSimulationRef.current = latest;
    setPickupSimulation(latest);
  }, [ordersByProfile, ordersHydrated, pickupChoice.profileId]);

  const stateSnapshot = useCallback(() => {
    const choice = pickupChoiceRef.current;
    const now = nowRef.current;
    return {
      ...shoppingStateSnapshot({ visibleIds: visibleIdsRef.current, selectedId: selectedIdRef.current, basket: basketRef.current }, productsById),
      demoPickup: {
        illustrative: true, branches: DEMO_BRANCHES, profiles: DEMO_PROFILES,
        choice,
        availableDates: now ? [...new Set(listPickupSlots(now, choice.branchId).map((slot) => slot.id.slice(0, 10)))] : [],
        selectedDateSlots: now ? listPickupSlots(now, choice.branchId).filter((slot) => slot.id.startsWith(choice.slotId.slice(0, 10))) : [],
        offer: offerFor(choice.profileId, basketRef.current, productsById),
        validation: now ? checkPickup({ basket: basketRef.current, branchId: choice.branchId, slotId: choice.slotId, now, productsById }) : null,
        alternatives: now ? pickupAlternatives({ basket: basketRef.current, now, productsById }) : [],
        tracker: pickupSimulationRef.current,
      },
      demoCommerce: {
        syntheticPrices: true,
        quote: quoteBasket(basketRef.current, productsById, choice.profileId),
        pendingReview: pendingReviewRef.current,
        sampleOrders: (ordersByProfileRef.current[choice.profileId] || []).map((order) => ({ id: order.id, code: order.code, status: TRACKER_STAGES[order.stage], totalRappen: order.totalRappen })),
      },
    };
  }, [productsById]);

  useEffect(() => {
    const current = new Date();
    nowRef.current = current;
    setDemoNow(current);
    const slot = listPickupSlots(current, pickupChoiceRef.current.branchId).find((item) => item.available);
    if (slot) {
      pickupChoiceRef.current = { ...pickupChoiceRef.current, slotId: slot.id };
      setPickupChoice(pickupChoiceRef.current);
    }
  }, []);

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

  const mutateBasket = useCallback((productId, quantity, mode, source = "touch", requestedOptionId) => {
    const product = productsById.get(productId);
    const optionId = requestedOptionId || defaultOptionIdFor(product);
    if (!demoOptionsFor(product).some((option) => option.id === optionId)) throw new Error("Unknown option ID for this product.");
    const stock = sampleStockFor(productId, pickupChoiceRef.current.branchId);
    if (mode === "add" && !stock.available) throw new Error("This product is unavailable at the selected branch.");
    const next = changeBasket(basketRef.current, productId, quantity, mode, validProductIds, optionId);
    const currentTotal = Object.entries(basketRef.current).filter(([key]) => parseLineKey(key).productId === productId).reduce((sum, [, value]) => sum + value, 0);
    const nextTotal = Object.entries(next).filter(([key]) => parseLineKey(key).productId === productId).reduce((sum, [, value]) => sum + value, 0);
    if (nextTotal > stock.remaining && nextTotal > currentTotal) throw new Error(`Only ${stock.remaining} available across all options.`);
    basketRef.current = next;
    setBasket(next);
    pendingReviewRef.current = null;
    setPendingReview(null);
    setCheckoutError("");
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a basket touch action"));
    return basketSummary(next, productsById);
  }, [productsById, sendInterfaceState, validProductIds]);

  const mutateBasketTouch = useCallback((productId, quantity, mode, optionId) => {
    try { return mutateBasket(productId, quantity, mode, "touch", optionId); }
    catch (error) { setCheckoutError(error instanceof Error ? error.message : "Basket update failed."); setBasketOpen(true); return null; }
  }, [mutateBasket]);

  const selectProduct = useCallback((productId) => {
    presentationSequenceRef.current += 1;
    selectedIdRef.current = productId;
    setSelectedId(productId);
    setDetailProductId(productId);
    setDetailOptionId(defaultOptionIdFor(productsById.get(productId)));
    queueMicrotask(() => sendInterfaceState("the shopper selected a product by touch"));
  }, [productsById, sendInterfaceState]);

  const updatePickupChoice = useCallback((patch, source = "touch") => {
    const next = { ...pickupChoiceRef.current, ...patch };
    if (patch.branchId && patch.branchId !== pickupChoiceRef.current.branchId && !patch.slotId) {
      next.slotId = listPickupSlots(nowRef.current || new Date(), patch.branchId).find((item) => item.available)?.id || "";
    }
    pickupChoiceRef.current = next;
    setPickupChoice(next);
    pendingReviewRef.current = null;
    setPendingReview(null);
    setCheckoutError("");
    if (source === "touch") queueMicrotask(() => sendInterfaceState("pickup preferences changed"));
    return next;
  }, [sendInterfaceState]);

  const updatePickupDate = useCallback((day) => {
    const slot = listPickupSlots(nowRef.current || new Date(), pickupChoiceRef.current.branchId)
      .find((item) => item.id.startsWith(`${day}T`) && item.available);
    updatePickupChoice({ slotId: slot?.id || "" });
  }, [updatePickupChoice]);

  const prepareExactReview = useCallback(() => {
    const choice = pickupChoiceRef.current;
    const now = new Date();
    nowRef.current = now;
    setDemoNow(now);
    const check = checkPickup({ basket: basketRef.current, branchId: choice.branchId, slotId: choice.slotId, now, productsById });
    if (!check.valid) {
      setCheckoutError(check.issues.join(" "));
      return null;
    }
    const quote = quoteBasket(basketRef.current, productsById, choice.profileId);
    const fingerprint = reviewFingerprint({ basket: basketRef.current, ...choice, quote });
    const approvalToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const review = {
      id: `approval-${approvalToken}`, approvalToken, fingerprint,
      basket: { ...basketRef.current }, quote, profileId: choice.profileId,
      branchId: choice.branchId, branchName: DEMO_BRANCHES.find((branch) => branch.id === choice.branchId)?.name,
      slotId: choice.slotId, slotLabel: check.slot.label, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60_000).toISOString(),
    };
    pendingReviewRef.current = review;
    setPendingReview(review);
    setCheckoutError("");
    return review;
  }, [productsById]);

  const createPickupSimulation = useCallback((reviewId) => {
    const review = pendingReviewRef.current;
    if (!review || review.id !== reviewId) {
      setCheckoutError("Your order review expired. Please review your order again.");
      return null;
    }
    const choice = pickupChoiceRef.current;
    const now = new Date();
    const check = checkPickup({ basket: basketRef.current, branchId: choice.branchId, slotId: choice.slotId, now, productsById });
    const currentQuote = quoteBasket(basketRef.current, productsById, choice.profileId);
    const currentFingerprint = reviewFingerprint({ basket: basketRef.current, ...choice, quote: currentQuote });
    if (Date.now() > Date.parse(review.expiresAt) || !check.valid || currentFingerprint !== review.fingerprint) {
      pendingReviewRef.current = null;
      setPendingReview(null);
      setCheckoutError("Your basket, price, availability or pickup changed. Please review the updated order.");
      return null;
    }
    const summary = basketSummary(basketRef.current, productsById);
    const existingOrders = ordersByProfileRef.current[choice.profileId] || [];
    const existingCodes = new Set(existingOrders.map((order) => order.code));
    let codeSalt = 0;
    let uniqueCode = pickupCode({ basket: basketRef.current, branchId: choice.branchId, slotId: choice.slotId, approvalToken: review.approvalToken, salt: codeSalt });
    while (existingCodes.has(uniqueCode)) {
      codeSalt += 1;
      uniqueCode = pickupCode({ basket: basketRef.current, branchId: choice.branchId, slotId: choice.slotId, approvalToken: review.approvalToken, salt: codeSalt });
    }
    const result = {
      branchId: choice.branchId,
      branchName: DEMO_BRANCHES.find((branch) => branch.id === choice.branchId)?.name,
      slotId: choice.slotId,
      slotLabel: check.slot.label,
      profileId: choice.profileId,
      offer: offerFor(choice.profileId, basketRef.current, productsById),
      code: uniqueCode,
      stage: 0,
      id: `sample-${review.id}`,
      reviewId: review.id,
      approvalToken: review.approvalToken,
      totalRappen: currentQuote.totalRappen,
      quote: currentQuote,
      createdAt: new Date().toISOString(),
      payment: "Confirmed",
      ...summary,
      simulated: true,
    };
    const existing = existingOrders.some((order) => order.approvalToken === review.approvalToken);
    if (existing) {
      setCheckoutError("This order has already been confirmed.");
      return null;
    }
    const nextOrders = { ...ordersByProfileRef.current, [choice.profileId]: [result, ...(ordersByProfileRef.current[choice.profileId] || [])] };
    ordersByProfileRef.current = nextOrders;
    setOrdersByProfile(nextOrders);
    pickupSimulationRef.current = result;
    setPickupSimulation(result);
    pendingReviewRef.current = null;
    setPendingReview(null);
    basketRef.current = {};
    setBasket({});
    setCheckoutError("");
    return result;
  }, [productsById]);

  const advanceProgress = useCallback(() => {
    const current = pickupSimulationRef.current;
    if (!current) return null;
    const next = { ...current, stage: nextTrackerStage(current.stage) };
    pickupSimulationRef.current = next;
    setPickupSimulation(next);
    const nextOrders = { ...ordersByProfileRef.current, [next.profileId]: (ordersByProfileRef.current[next.profileId] || []).map((order) => order.id === next.id ? next : order) };
    ordersByProfileRef.current = nextOrders;
    setOrdersByProfile(nextOrders);
    queueMicrotask(() => sendInterfaceState("simulated order progress advanced"));
    return next;
  }, [sendInterfaceState]);

  const buildTools = useCallback((realtimeTool, zod) => {
    const getShoppingState = realtimeTool({
      name: "get_shopping_state",
      description: "Read the current visible products, touch-selected product, basket and catalogue facts. Call this before interpreting 'this one', 'that one', or basket changes.",
      parameters: zod.object({}),
      execute: async () => safeToolResult(stateSnapshot()),
    });

    const searchProducts = realtimeTool({
      name: "search_and_show_products",
      description: "Search the photographed public Hausammann catalogue and immediately show the matching product photos. Use for needs, categories, product names, or recommendations.",
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
        option_id: zod.string().optional(),
        quantity: zod.number().int().min(0).max(24),
        mode: zod.enum(["add", "remove", "set"]),
      }),
      execute: async ({ product_id: productId, option_id: requestedOptionId, quantity, mode }) => {
        try {
          const optionId = requestedOptionId || defaultOptionIdFor(productsById.get(productId));
          if (!demoOptionsFor(productsById.get(productId)).some((option) => option.id === optionId)) throw new Error("Unknown option ID for this product.");
          const summary = mutateBasket(productId, quantity, mode, "voice", optionId);
          return safeToolResult({ ok: true, basket: summary });
        } catch (error) {
          return safeToolResult({ ok: false, error: error instanceof Error ? error.message : "Basket update failed." });
        }
      },
    });

    const preparePickup = realtimeTool({
      name: "prepare_simulated_pickup",
      description: "Prepare an exact, expiring sample-order review with selected branch, pickup time, options, stock, subtotal, offer and total. This never creates a real order and requires a separate explicit touch or voice approval.",
      parameters: zod.object({}),
      execute: async () => {
        const summary = basketSummary(basketRef.current, productsById);
        if (summary.itemCount === 0) return safeToolResult({ ok: false, error: "The basket is empty." });
        setBasketOpen(true);
        const review = prepareExactReview();
        if (!review) return safeToolResult({ ok: false, error: "The basket, sample stock or pickup selection is not valid.", demoPickup: stateSnapshot().demoPickup });
        return safeToolResult({
          ok: true, review, basket: summary, demoPickup: stateSnapshot().demoPickup,
          awaitingExplicitApproval: true,
          message: "Read back the exact items/options, sample branch/time, subtotal, discount and total. Ask for explicit approval. Do not approve merely because the shopper browsed or requested recommendations.",
        });
      },
    });

    const approvePickup = realtimeTool({
      name: "approve_simulated_order",
      description: "Approve only after the shopper clearly says to confirm/pay for the exact current review. The review ID binds approval to unchanged basket, pricing, sample stock, branch and time.",
      parameters: zod.object({ review_id: zod.string(), explicit_approval: zod.boolean() }),
      execute: async ({ review_id: reviewId, explicit_approval: explicitApproval }) => {
        if (!explicitApproval) return safeToolResult({ ok: false, error: "Explicit approval is required." });
        const result = createPickupSimulation(reviewId);
        return safeToolResult(result ? { ok: true, order: result, localOnly: true, message: "Order confirmed for pickup in this experience. Share the pickup code and status." } : { ok: false, error: "Review expired, changed, or was already used." });
      },
    });

    const setPickupPreferences = realtimeTool({
      name: "set_demo_pickup_preferences",
      description: "Change the same demo profile, branch and future pickup slot shown in the touch basket review. Read get_shopping_state first for valid IDs. This invalidates any previous preview.",
      parameters: zod.object({
        profile_id: zod.enum(["guest", "bread", "lunch", "afternoon"]).optional(),
        branch_id: zod.enum(["uni88", "raegimaert"]).optional(),
        slot_id: zod.string().optional(),
      }),
      execute: async ({ profile_id: profileId, branch_id: branchId, slot_id: slotId }) => {
        const patch = {};
        if (profileId) patch.profileId = profileId;
        if (branchId) patch.branchId = branchId;
        if (slotId) {
          const effectiveBranch = branchId || pickupChoiceRef.current.branchId;
          if (!listPickupSlots(nowRef.current || new Date(), effectiveBranch).some((slot) => slot.id === slotId)) {
            return safeToolResult({ ok: false, error: "Choose a future slot ID returned by get_shopping_state." });
          }
          patch.slotId = slotId;
        }
        updatePickupChoice(patch, "voice");
        return safeToolResult({ ok: true, demoPickup: stateSnapshot().demoPickup });
      },
    });

    const getPickupSlots = realtimeTool({
      name: "get_demo_pickup_slots",
      description: "List all quarter-hour sample pickup times on one available Zurich date for a demo branch, including times marked full. Use before choosing a time on a different date.",
      parameters: zod.object({
        date_id: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        branch_id: zod.enum(["uni88", "raegimaert"]).optional(),
      }),
      execute: async ({ date_id: dateId, branch_id: branchId }) => {
        const branch = branchId || pickupChoiceRef.current.branchId;
        const slots = listPickupSlots(nowRef.current || new Date(), branch).filter((slot) => slot.id.startsWith(`${dateId}T`));
        return safeToolResult(slots.length ? { ok: true, branchId: branch, dateId, slots, illustrative: true } : { ok: false, error: "This date is outside the future demo pickup window." });
      },
    });

    const advanceDemoProgress = realtimeTool({
      name: "advance_simulated_progress",
      description: "Advance the existing sample pickup tracker by one stage, from Received to Preparing to Ready. It does not contact a store.",
      parameters: zod.object({}),
      execute: async () => {
        const result = advanceProgress();
        return safeToolResult(result ? { ok: true, stage: TRACKER_STAGES[result.stage], code: result.code, simulated: true } : { ok: false, error: "Confirm a sample pickup preview first." });
      },
    });

    return [getShoppingState, searchProducts, showProducts, updateBasket, getPickupSlots, setPickupPreferences, preparePickup, approvePickup, advanceDemoProgress];
  }, [advanceProgress, createPickupSimulation, mutateBasket, prepareExactReview, presentProducts, products, productsById, stateSnapshot, updatePickupChoice]);

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
    closeVoiceSession("Talk to shop");
  }, [closeVoiceSession]);

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
      const tokenResponse = await fetch("/api/hausammann-demo/realtime-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const tokenPayload = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || !tokenPayload.value) {
        throw new Error(tokenPayload.error || "Voice service is unavailable.");
      }

      const initialSummary = stateSnapshot();
      const agent = new RealtimeAgent({
        name: "Hausammann voice shopper",
        voice: "marin",
        instructions: `You are Hausammann's concise English voice shopping assistant.

Keep speech warm, natural, brief, and easy to interrupt. Help the shopper discover products, see photos, change quantities, choose a future sample pickup time, review a sample offer, and follow a simulated pickup tracker.

Speak like a finished Hausammann shopping app. Use natural customer language such as your offer, your usual, review order, confirm order, pickup code and order status. Do not volunteer implementation caveats or repeatedly say demo, sample, synthetic, simulated, fictional or preview. If directly asked whether the experience is connected to a store or payment provider, answer honestly that it is a local experience without live store or payment integration.
After searches, selections and basket changes, acknowledge the action in one short sentence without reading back labels already visible on screen. Do not repeat an offer, product name, branch or time unless it resolves ambiguity. Give one complete exact readback only when preparing the order review. After final confirmation, state the pickup code and current status once.

Critical rules:
- There is no live store inventory. Branch stock, capacity, product limits, pickup times, customer profiles, history, recommendations, offers, prices, payment and progress stages are entirely synthetic demo data.
- Never say an order, reservation, payment, pickup, or store message is real. No real transaction is possible here.
- Use search_and_show_products whenever the shopper expresses a product need or asks for options. Describe as visible only the products returned in displayedProducts; below-fold products are not currently visible.
- Call get_shopping_state before interpreting words such as 'this one', 'that', or 'two of this one'. The touch-selected product is authoritative.
- Use only stable IDs and option IDs returned by tools. Catalogue products and stated descriptions come from the official source. Prices, stock and options marked demo are synthetic. Never invent ingredients, dietary suitability, or allergen facts.
- Do not make allergen assurances. Tell the shopper to confirm ingredients and allergens with Hausammann.
- Use get_shopping_state to read available future dates and the selected date's quarter-hour slots. For another date, call get_demo_pickup_slots, then use set_demo_pickup_preferences with a returned slot ID. These use the same review as touch and invalidate a prior preview.
- Distinguish an indicative single-item effective price from the exact current basket quote, which applies eligibility, rounding and the CHF 12 demo discount cap.
- When the shopper asks to review pickup, call prepare_simulated_pickup and read back its exact items/options, branch, time, subtotal, discount and total. Then ask for explicit approval. Only after a clear confirm/pay instruction may you call approve_simulated_order with that exact review ID and explicit_approval true. Browsing, recommendations, adding items, or asking to review never counts as approval.
- A changed basket, option, profile, branch, slot, sample price or stock invalidates approval. Never retry an expired review without preparing and reading a new one. Never duplicate a confirmed sample order.
- After a touch-confirmed sample preview, describe the Received, Preparing and Ready tracker as simulated. The advance_simulated_progress tool can move one stage if the shopper asks.
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
              transcription: { model: "gpt-4o-mini-transcribe", language: "en" },
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
        closeVoiceSession("Talk to shop");
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

  const showAllProducts = useCallback(async () => {
    selectedIdRef.current = null;
    setSelectedId(null);
    await presentProducts(products.map((product) => product.id));
    requestAnimationFrame(() => voiceButtonRef.current?.focus());
    queueMicrotask(() => sendInterfaceState("the full catalogue was restored"));
  }, [presentProducts, products, sendInterfaceState]);

  const exploreOffer = useCallback(async () => {
    const category = offerFor(pickupChoiceRef.current.profileId, basketRef.current, productsById).category;
    const matches = category ? products.filter((product) => product.productType === category) : products;
    await presentProducts(matches.map((product) => product.id));
    queueMicrotask(() => sendInterfaceState("the shopper explored the offer category"));
  }, [presentProducts, products, productsById, sendInterfaceState]);

  const openBasket = useCallback(() => {
    const current = new Date();
    nowRef.current = current;
    setDemoNow(current);
    const choice = pickupChoiceRef.current;
    if (!listPickupSlots(current, choice.branchId).some((slot) => slot.id === choice.slotId && slot.available)) {
      const first = listPickupSlots(current, choice.branchId).find((slot) => slot.available);
      if (first) updatePickupChoice({ slotId: first.id }, "voice");
    }
    setBasketOpen(true);
  }, [updatePickupChoice]);
  const closeBasket = useCallback(() => setBasketOpen(false), []);
  const closeCaptions = useCallback(() => {
    setCaptionsOpen(false);
    requestAnimationFrame(() => captionsButtonRef.current?.focus());
  }, []);

  const reorderLines = useCallback((lines) => {
    const next = {};
    const notices = [];
    const usedByProduct = new Map();
    for (const line of lines || []) {
      const stock = sampleStockFor(line.productId, pickupChoiceRef.current.branchId);
      if (!stock.available) { notices.push(`${line.name} skipped`); continue; }
      const used = usedByProduct.get(line.productId) || 0;
      const accepted = Math.max(0, Math.min(line.quantity, stock.remaining - used));
      if (accepted < line.quantity) notices.push(`${line.name} reduced to ${accepted}`);
      if (accepted) {
        const optionId = line.optionId || defaultOptionIdFor(productsById.get(line.productId));
        next[lineKeyFor(line.productId, optionId)] = accepted;
        usedByProduct.set(line.productId, used + accepted);
      }
    }
    basketRef.current = next;
    setBasket(next);
    pendingReviewRef.current = null;
    setPendingReview(null);
    setCheckoutError(notices.length ? `${notices.join("; ")} because availability changed. Review your current prices and offer.` : "Your usual order is ready with current prices and offers.");
    setBasketOpen(true);
  }, [productsById]);

  const submitTypedRequest = useCallback(async (event) => {
    event.preventDefault();
    const request = typedRequest.trim();
    if (!request) return;
    if (sessionRef.current?.transport?.status === "connected" && typeof sessionRef.current.sendMessage === "function") {
      try { sessionRef.current.sendMessage(request); setTypedRequest(""); return; }
      catch { setVoiceMessage("Typed assistant message failed. Try catalogue search instead."); }
    }
    const matches = searchCatalog(products, request, 8);
    if (matches.length) await presentProducts(matches.map((product) => product.id), matches[0].id);
    setVoiceMessage(matches.length ? `Showing ${matches.length} matches` : "No matching catalogue products");
    setTypedRequest("");
  }, [presentProducts, products, typedRequest]);

  const confirmPickup = useCallback(() => {
    if (!pendingReview) {
      const review = prepareExactReview();
      if (review) queueMicrotask(() => sendInterfaceState("an exact simulated order review was prepared and awaits explicit approval"));
      return;
    }
    const result = createPickupSimulation(pendingReview.id);
    if (result) queueMicrotask(() => sendInterfaceState("the shopper explicitly approved a simulated payment and sample order"));
  }, [createPickupSimulation, pendingReview, prepareExactReview, sendInterfaceState]);

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
    <>
    <aside className={styles.scenarioBar} aria-label="Presentation scenario">
      <div className={styles.scenarioInner}>
        <span className={styles.scenarioLabel}>Shopping as</span>
        <div className={styles.scenarioOptions}>
          {SHOPPING_SCENARIOS.map((scenario) => (
            <button key={scenario.id} type="button" aria-pressed={pickupChoice.profileId === scenario.id} onClick={() => updatePickupChoice({ profileId: scenario.id })}>
              <strong>{scenario.label}</strong><small>{scenario.detail}</small>
            </button>
          ))}
        </div>
      </div>
    </aside>
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.brandMark}>
            <Image
              className={styles.brandLogo}
              src="/hausammann-demo/brand/zopfbeck-logo-white.png"
              alt="Bäckerei Hausammann · Zopf-Beck"
              width={176}
              height={78}
              priority
            />
            <span className={styles.brandName}>Bäckerei<br />Hausammann</span>
          </h1>
        </div>
        <div className={styles.location} aria-label={`Pickup branch: ${DEMO_BRANCHES.find((branch) => branch.id === pickupChoice.branchId)?.name}`}>
          <strong>{DEMO_BRANCHES.find((branch) => branch.id === pickupChoice.branchId)?.name}</strong>
          <button type="button" onClick={() => setOrdersOpen(true)}>Orders{profileOrders.length ? ` · ${profileOrders.length}` : ""}</button>
        </div>
      </header>

      <section className={styles.homePanel} aria-label="Shopping home">
        <div className={styles.homeOfferArea}>
          <div className={styles.homeOfferCard}>
            <div className={styles.homeOfferCopy}>
              <span className={styles.homeOfferKicker}>A LITTLE SOMETHING FOR YOU</span>
              <strong className={styles.homeOfferTitle}>{offerHeading}</strong>
              {(sampleOffer.applied || sampleOffer.category) && <p>{sampleOffer.applied
                ? `${sampleOffer.eligibleQuantity} eligible ${sampleOffer.category} item${sampleOffer.eligibleQuantity === 1 ? "" : "s"} in your basket`
                : `Explore our ${sampleOffer.category} selection`}</p>}
              <div className={styles.featuredPrice}>
                <span>{formatDemoChf(featuredQuote.listRappen)}</span>
                {featuredQuote.eligible && <strong>{formatDemoChf(featuredQuote.indicativeEffectiveRappen)} with your offer</strong>}
              </div>
              <button type="button" onClick={exploreOffer}>Shop {sampleOffer.category || "the catalogue"} <span aria-hidden="true">→</span></button>
            </div>
            <div className={styles.homeOfferVisual}>
              {featuredProduct?.images?.[0] && <Image src={featuredProduct.images[0].localPath} alt={featuredProduct.name} fill sizes="(max-width: 760px) 40vw, 300px" priority />}
              {!sampleOffer.percent && <strong className={styles.homeOfferValue}>NEW<small>TODAY</small></strong>}
            </div>
          </div>
        </div>
        <div className={styles.homePickupArea}>
          <strong>Pickup</strong>
          {pickupChoice.slotId && <span>{slots.find((slot) => slot.id === pickupChoice.slotId)?.label}</span>}
          <div className={styles.homePickupActions}>
            <button type="button" onClick={openBasket}>{pickupSimulation ? `Track · ${TRACKER_STAGES[pickupSimulation.stage]}` : (pickupChoice.slotId ? "Review pickup" : "Choose time")}</button>
          </div>
        </div>
        {profileStory.usual && <div className={styles.returningStrip}>
          <div><span>YOUR USUAL</span><strong>{profileStory.usual.name}</strong></div>
          <button type="button" onClick={() => reorderLines([{ productId: profileStory.usual.id, optionId: defaultOptionIdFor(profileStory.usual), name: profileStory.usual.name, quantity: 1 }])}>Reorder</button>
          <button type="button" onClick={() => void presentProducts(profileStory.recommendations.map((product) => product.id))}>Recommended for you</button>
        </div>}
      </section>

      <section className={styles.productSurface} aria-label="Hausammann products">
        <div className={styles.shopHeading}>
          <div><h2>What would you like today?</h2></div>
          <span>{products.length} products to explore</span>
        </div>
        <nav className={styles.categoryNav} aria-label="Product categories">
          {categories.map((category) => (
            <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => {
              const matches = category === "All" ? products : products.filter((product) => product.productType === category);
              void presentProducts(matches.map((product) => product.id));
              queueMicrotask(() => sendInterfaceState(`the shopper selected ${category} products`));
            }}>{category === "All" ? "All products" : category}</button>
          ))}
        </nav>
        {!isFullCatalogue && (
          <div className={styles.resultsContext}>
            <span>{activeCategory || "Search results"} · {visibleProducts.length}</span>
            <button type="button" onClick={showAllProducts}>All products</button>
          </div>
        )}

        <div ref={productGridRef} className={styles.productGrid}>
          {visibleProducts.map((product, index) => {
            const productLines = Object.entries(basket).filter(([lineKey]) => parseLineKey(lineKey).productId === product.id);
            const quantity = productLines.reduce((sum, [, value]) => sum + value, 0);
            const activeOptionId = parseLineKey(productLines[0]?.[0] || product.id).optionId;
            const image = product.images[0];
            const imageFailed = imageFailures.has(product.id);
            const price = quoteProduct(product, pickupChoice.profileId);
            const stock = sampleStockFor(product.id, pickupChoice.branchId);
            const otherBranch = alternateSampleBranch(product.id, pickupChoice.branchId, DEMO_BRANCHES);
            return (
              <article
                className={styles.productCard}
                data-selected={selectedId === product.id}
                key={product.id}
              >
                <button
                  className={styles.productSelect}
                  type="button"
                  onClick={() => selectProduct(product.id)}
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
                  <div className={styles.productText}>
                    <span className={styles.productCategory}>{product.productType}</span>
                    <h3>{product.name}</h3>
                    <div className={styles.cardPrice}><strong>{formatDemoChf(price.listRappen)}</strong></div>
                    {price.eligible && <span className={styles.effectivePrice}>{formatDemoChf(price.indicativeEffectiveRappen)} with your offer</span>}
                    <span className={stock.available ? styles.stockOk : styles.stockOut}>{stock.label}{!stock.available && otherBranch ? ` · Try ${otherBranch.name}` : ""}</span>
                  </div>
                </button>
                <div className={styles.cardAction}>
                  {quantity === 0 ? (
                    <button type="button" disabled={!stock.available} onClick={() => mutateBasketTouch(product.id, 1, "add", defaultOptionIdFor(product))} aria-label={`Add ${product.name} to basket`}>
                      <Plus size={32} strokeWidth={2.6} aria-hidden="true" />
                    </button>
                  ) : (
                    <div className={styles.stepper} aria-label={`${product.name} quantity`}>
                      <button type="button" onClick={() => mutateBasketTouch(product.id, 1, "remove", activeOptionId)} aria-label={`Remove one ${product.name}`}><Minus size={16} aria-hidden="true" /></button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => mutateBasketTouch(product.id, 1, "add", activeOptionId)} aria-label={`Add one ${product.name}`}><Plus size={16} aria-hidden="true" /></button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <form className={styles.typedAssistant} onSubmit={submitTypedRequest} aria-label="Type to the shopping assistant">
        <input value={typedRequest} onChange={(event) => setTypedRequest(event.target.value)} placeholder={hasVoiceSession ? "Type to the assistant…" : "Search the catalogue…"} aria-label={hasVoiceSession ? "Shopping request" : "Catalogue search"} />
        <button type="submit">{hasVoiceSession ? "Ask" : "Search"}</button>
      </form>

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
              : (voiceStatus === "error" || voiceStatus === "unsupported" ? "Try voice again" : "Talk to shop")}
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
              aria-label={`Basket, ${basketDetails.itemCount} ${basketDetails.itemCount === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span>{basketDetails.itemCount}</span>

            </button>
          )}
        </div>

        {(voiceStatus === "error" || voiceStatus === "unsupported") ? (
          <p className={styles.voiceNotice} id="voice-error" role="status" aria-live="polite">{voiceMessage}</p>
        ) : (
          <span className={styles.visuallyHidden} role="status" aria-live="polite">{voiceMessage}</span>
        )}

        {captionsOpen && transcript.length > 0 && (
          <div className={styles.captions} role="region" aria-label="Live captions" aria-live="polite">
            <div className={styles.captionsHeader}>
              <strong>Captions</strong>
              <button type="button" onClick={closeCaptions} aria-label="Close captions"><X size={16} /></button>
            </div>
            {transcript.slice(-2).map((item) => (
              <p key={`${item.id}-${item.role}`}>
                <span>{item.role === "assistant" ? "Hausammann" : "You"}</span>
                {item.text}
              </p>
            ))}
          </div>
        )}
      </section>

      {detailProductId && (() => {
        const product = productsById.get(detailProductId);
        const options = demoOptionsFor(product);
        const quote = quoteProduct(product, pickupChoice.profileId, detailOptionId);
        const stock = sampleStockFor(product.id, pickupChoice.branchId);
        return (
          <div className={styles.modalBackdrop} onMouseDown={() => setDetailProductId(null)}>
            <section className={styles.productModal} role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={(event) => event.stopPropagation()}>
              <button className={styles.modalClose} type="button" onClick={() => setDetailProductId(null)} aria-label="Close product details"><X /></button>
              <div className={styles.detailImage}>{product.images[0] && <Image src={product.images[0].localPath} alt={product.name} fill sizes="400px" />}</div>
              <div className={styles.detailCopy}>
                <span>{product.productType}</span>
                <h2 id="product-detail-title">{product.name}</h2>
                {product.description && <p>{product.description}</p>}
                <a href={product.sourceUrl} target="_blank" rel="noreferrer">More about this product</a>
                <fieldset><legend>Choose an option</legend>{options.map((option) => <label key={option.id}><input type="radio" name="detail-option" checked={detailOptionId === option.id} onChange={() => setDetailOptionId(option.id)} /> {option.label}</label>)}</fieldset>
                <div className={styles.detailPrice}><strong>{formatDemoChf(quote.listRappen)}</strong>{quote.eligible && <em>{formatDemoChf(quote.indicativeEffectiveRappen)} with your offer</em>}</div>
                <p className={stock.available ? styles.stockOk : styles.stockOut}>{stock.label} at {DEMO_BRANCHES.find((branch) => branch.id === pickupChoice.branchId)?.name}</p>
                <p className={styles.allergenNote}>Questions about ingredients or allergens? Please ask our team before ordering.</p>
                <button className={styles.detailAdd} type="button" disabled={!stock.available} onClick={() => { if (mutateBasketTouch(product.id, 1, "add", detailOptionId)) setDetailProductId(null); }}>Add selected option</button>
              </div>
            </section>
          </div>
        );
      })()}

      {ordersOpen && (
        <div className={styles.modalBackdrop} onMouseDown={() => setOrdersOpen(false)}>
          <section className={styles.ordersPanel} role="dialog" aria-modal="true" aria-labelledby="orders-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={() => setOrdersOpen(false)} aria-label="Close orders"><X /></button>
            <span>YOUR ACCOUNT</span><h2 id="orders-title">Orders</h2>
            {profileOrders.length === 0 ? <p>No orders yet.</p> : profileOrders.map((order) => <article key={order.id}>
              <div><strong>{order.code}</strong><span>{TRACKER_STAGES[order.stage]}</span></div>
              <p>{order.slotLabel} · {order.branchName}</p><p>{order.itemCount} items · {formatDemoChf(order.totalRappen)}</p>
              <button type="button" onClick={() => { reorderLines(order.quote.lines); setOrdersOpen(false); }}>Reorder</button>
            </article>)}
          </section>
        </div>
      )}

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
                <h2 id="basket-title">Your basket</h2>
              </div>
              <button ref={drawerCloseRef} type="button" onClick={closeBasket} aria-label="Close basket"><X aria-hidden="true" /></button>
            </header>

            {pickupSimulation && (
              <div ref={pickupResultRef} className={styles.pickupResult} role="status" tabIndex={-1}>
                <div className={styles.trackerHead}>
                  <strong>Your pickup · {pickupSimulation.branchName}</strong>
                  <span>{pickupSimulation.slotLabel} · Europe/Zurich</span>
                </div>
                <ol className={styles.trackerStages} aria-label="Pickup progress">
                  {TRACKER_STAGES.map((stage, index) => (
                    <li key={stage} data-current={pickupSimulation.stage === index} data-complete={pickupSimulation.stage > index}>{stage}</li>
                  ))}
                </ol>
                <div className={styles.pickupCode}><span>Pickup code</span><strong>{pickupSimulation.code}</strong></div>
                {pickupSimulation.stage < TRACKER_STAGES.length - 1 && (
                  <button className={styles.advanceProgress} type="button" onClick={advanceProgress}>Update status</button>
                )}
              </div>
            )}

            {basketQuote.lines.length === 0 ? (
              <p className={styles.drawerEmpty}>Your basket is empty. Choose a pickup time, then add something from the catalogue.</p>
            ) : (
              <div className={styles.basketItems}>
                  {basketQuote.lines.map((item) => (
                    <div className={styles.basketItem} key={item.lineKey}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.optionLabel} · {formatDemoChf(item.unitRappen)} each</span>
                      </div>
                      <div className={styles.basketItemRight}>

                        <div className={styles.miniStepper} aria-label={`${item.name} quantity in basket`}>
                          <button type="button" onClick={() => mutateBasketTouch(item.productId, 1, "remove", item.optionId)} aria-label={`Remove one ${item.name}`}><Minus size={15} aria-hidden="true" /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => mutateBasketTouch(item.productId, 1, "add", item.optionId)} aria-label={`Add one ${item.name}`}><Plus size={15} aria-hidden="true" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className={styles.pickupFields}>
                  <div className={styles.choiceSection} role="group" aria-label="Pickup branch">
                    <strong>Pickup branch</strong>
                    <div className={styles.branchChips}>
                      {DEMO_BRANCHES.map((branch) => (
                        <button key={branch.id} type="button" aria-pressed={pickupChoice.branchId === branch.id} onClick={() => updatePickupChoice({ branchId: branch.id })}>{branch.name}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.choiceSection} role="group" aria-label="Pickup date · Zurich">
                    <strong>Pickup date · Zurich</strong>
                    <div className={styles.dateChips}>
                      {slotGroups.map((group) => <button key={group.day} type="button" aria-pressed={pickupDate === group.day} onClick={() => updatePickupDate(group.day)}>{group.label}</button>)}
                    </div>
                  </div>
                  <label>Pickup time · Zurich
                    <select value={pickupChoice.slotId} onChange={(event) => updatePickupChoice({ slotId: event.target.value })}>
                      <option value="">Choose a time</option>
                      {daySlots.map((slot) => <option key={slot.id} value={slot.id} disabled={!slot.available}>{slot.label.split(", ")[1]}{slot.available ? "" : " · full"}</option>)}
                    </select>
                  </label>
                  {sampleOffer.percent > 0 && <div className={styles.offerPanel} data-applied={sampleOffer.applied}>
                    <div className={styles.offerHero}>
                      <span>Your offer</span>
                      <strong>{sampleOffer.percent ? `${sampleOffer.percent}%` : "—"}</strong>
                    </div>
                    <div className={styles.offerCopy}>
                      <strong>{sampleOffer.title}</strong>
                      <p>{sampleOffer.applied ? `${sampleOffer.eligibleQuantity} eligible ${sampleOffer.category} item${sampleOffer.eligibleQuantity === 1 ? "" : "s"}` : sampleOffer.explanation}</p>
                    </div>
                    <span className={styles.offerPriceNote}>Your offer is applied to eligible items.</span>
                  </div>}
                  <div className={styles.availabilityPanel} role="status">
                    <strong>{pickupCheck.valid ? "Available for this pickup" : (basketDetails.itemCount === 0 ? "Add a product to continue" : "Choose another pickup option")}</strong>
                    {pickupCheck.valid
                      ? <p>{pickupCheck.totalQuantity} {pickupCheck.totalQuantity === 1 ? "item fits" : "items fit"} this branch and time.</p>
                      : pickupCheck.issues.map((issue) => <p key={issue}>{issue}</p>)}
                    {alternatives.length > 0 && !pickupCheck.valid && (
                      <div className={styles.alternativeList}>
                        <span>Try these times</span>
                        {alternatives.map((alternative) => (
                          <button key={`${alternative.branchId}-${alternative.slotId}`} type="button" onClick={() => updatePickupChoice({ branchId: alternative.branchId, slotId: alternative.slotId })}>
                            {alternative.branchName} · {alternative.slotLabel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
            </div>

            <div className={styles.drawerFooter}>
                  {checkoutError && <p className={styles.checkoutError} role="alert">{checkoutError}</p>}
                  {basketQuote.itemCount > 0 && <div className={styles.exactTotal}>
                    <span>Subtotal <strong>{formatDemoChf(basketQuote.subtotalRappen)}</strong></span>
                    {basketQuote.percent > 0 && <span>Your offer {basketQuote.percent}% <strong>− {formatDemoChf(basketQuote.discountRappen)}</strong></span>}
                    {basketQuote.discountCapped && <small>Maximum offer saving applied.</small>}
                    <span className={styles.totalLine}>Order total <strong>{formatDemoChf(basketQuote.totalRappen)}</strong></span>
                  </div>}
                  {basketQuote.itemCount > 0 && <button className={styles.confirmPickup} type="button" onClick={confirmPickup} disabled={!pickupCheck.valid}>
                    <Check size={18} aria-hidden="true" /> {pendingReview ? `Confirm order · ${formatDemoChf(pendingReview.quote.totalRappen)}` : "Review order"}
                  </button>}
            </div>
          </section>
        </div>
      )}
    </main>
    </>
  );
}

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
import { checkoutQuestion, connectionRecovery, createCustomerActionController, createPanelActionController, executeCustomerAction, isCurrentSession, resolvePanelTransition, retireSessionRuntime } from "./voiceActions.mjs";

const IMAGE_WAIT_MS = 360;
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
  const customerActionsRef = useRef({});
  const uiRef = useRef({ view: "shop", modal: null, activeCategory: "offer", selectedOrderId: null, detailOptions: { message: "None", wrap: "Standard" } });
  const intentionalCloseRef = useRef(false);
  const voiceDiagnosticsRef = useRef([]);
  const activeToolRef = useRef(null);
  const sessionGenerationRef = useRef(0);
  const customerActionAbortRef = useRef(null);
  const voiceStageRef = useRef(voiceStatus);
  const basketOpenRef = useRef(basketOpen);
  const fulfillmentOpenRef = useRef(fulfillmentOpen);
  const orderDetailsOpenRef = useRef(orderDetailsOpen);

  const updateVoiceStatus = useCallback((status) => {
    voiceStageRef.current = status;
    setVoiceStatus(status);
  }, []);
  const updateBasketOpen = useCallback((open) => {
    basketOpenRef.current = open;
    setBasketOpen(open);
  }, []);
  const updateFulfillmentOpen = useCallback((open) => {
    fulfillmentOpenRef.current = open;
    setFulfillmentOpen(open);
  }, []);
  const transitionUi = useCallback((target = {}) => {
    const next = resolvePanelTransition({
      ...uiRef.current,
      ...target,
      detailOptions: target.detailOptions || uiRef.current.detailOptions,
    });
    updateBasketOpen(next.basketOpen);
    updateFulfillmentOpen(next.fulfillmentOpen);
    setDetailProductId(next.detailProductId);
    setDetailOptions(next.detailOptions);
    setOrderDetailsOpen(next.orderDetailsOpen);
    orderDetailsOpenRef.current = next.orderDetailsOpen;
    setShopView(next.view === "orders" ? "orders" : "shop");
    uiRef.current = {
      ...uiRef.current,
      view: next.view,
      modal: next.modal,
      activeCategory: target.activeCategory ?? uiRef.current.activeCategory,
      selectedProductId: next.selectedProductId,
      selectedOrderId: next.selectedOrderId,
      detailOptions: next.detailOptions,
      orderDetailsOpen: next.orderDetailsOpen,
    };
    return next;
  }, [updateBasketOpen, updateFulfillmentOpen]);
  const panelActions = useMemo(() => createPanelActionController(transitionUi, () => basketOpenRef.current), [transitionUi]);

  const recordVoiceStage = useCallback((stage, details = {}) => {
    const event = { stage, at: Date.now(), ...details };
    voiceDiagnosticsRef.current = [...voiceDiagnosticsRef.current.slice(-11), event];
    console.info("Honold voice stage", event);
  }, []);

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
    const activeOrders = ordersRef.current[profileRef.current] || [];
    const ui = uiRef.current;
    return {
      language: currentLanguage,
      ...shopping,
      visibleProducts: shopping.visibleProducts.map((item) => localizedProduct(productsById.get(item.id), currentLanguage)),
      selectedProduct: shopping.selectedProduct ? localizedProduct(productsById.get(shopping.selectedProduct.id), currentLanguage) : null,
      basket: { ...shopping.basket, items: shopping.basket.items.map((item) => ({ ...item, name: productName(productsById.get(item.productId), currentLanguage) })) },
      stockBasis: currentLanguage === "de" ? "Die Verfügbarkeit ist illustrativ und kein Live-Filialbestand; bitte bei Honold bestätigen." : shopping.stockBasis,
      ui: {
        view: pickupRef.current ? "order_status" : ui.view,
        modal: ui.modal,
        activeCategory: ui.activeCategory,
        selectedProductId: selectedIdRef.current,
        selectedOrderId: ui.selectedOrderId,
        detailOptions: ui.detailOptions,
        orderDetailsOpen: orderDetailsOpenRef.current,
        voiceStage: voiceStageRef.current,
      },
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
      review: pendingReviewRef.current ? {
        reviewId: pendingReviewRef.current.reviewId,
        fingerprint: pendingReviewRef.current.fingerprint,
        awaitingExplicitApproval: true,
      } : null,
      orders: activeOrders.map((order) => ({
        orderId: order.orderId || order.approvalId,
        mode: order.mode,
        branchId: order.branchId,
        address: order.address,
        pickupCode: order.pickupCode,
        status: localizeStatus(previewStatus(order), currentLanguage),
        totalChf: order.quote?.exampleTotalChf || 0,
      })),
    };
  }, [productsById]);

  const runCustomerAction = useCallback(async (action, input = {}) => {
    const session = sessionRef.current;
    const generation = sessionGenerationRef.current;
    if (!session) return { ok: false, status: "error", action, error: "The voice session ended. Start it again." };
    customerActionAbortRef.current?.abort(new Error("A newer shopper action replaced this action."));
    const abortController = new AbortController();
    customerActionAbortRef.current = abortController;
    try {
      const result = await executeCustomerAction({
        action,
        input,
        actions: customerActionsRef.current,
        snapshot: stateSnapshot,
        abortController,
        isCurrent: () => isCurrentSession(sessionRef.current, sessionGenerationRef.current, session, generation),
      });
      recordVoiceStage("tool_result", { action, status: result.status, durationMs: result.timing?.durationMs || 0 });
      return result;
    } finally {
      if (customerActionAbortRef.current === abortController) customerActionAbortRef.current = null;
    }
  }, [recordVoiceStage, stateSnapshot]);

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

  const presentProducts = useCallback(async (requestedIds, focusId = null, context = null) => {
    if (context && !context.isCurrent()) return { displayed: false, stale: true, message: "The voice session or shopper action changed." };
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
    pickupRef.current = null;
    setPickupSimulation(null);
    transitionUi({ view: "shop", modal: null, activeCategory: null, selectedProductId: nextSelectedId });
    productGridRef.current?.scrollIntoView({ block: "start" });

    const result = await waitForDisplayedImages(ids, sequence);
    if (result.stale || (context && !context.isCurrent())) {
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
  }, [productsById, transitionUi, validProductIds, waitForDisplayedImages]);

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
    uiRef.current = { ...uiRef.current, selectedProductId: productId };
    queueMicrotask(() => sendInterfaceState("the shopper selected a product by touch"));
  }, [sendInterfaceState]);

  const updatePickupPreference = useCallback((field, value, source = "touch") => {
    if (field === "branch") {
      if (!DEMO_BRANCHES.some((item) => item.id === value)) throw new Error("Choose a valid pickup branch.");
      branchRef.current = value;
      setBranchId(value);
      slotRef.current = null;
      setSlotId(null);
      setPickupDay(null);
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
      execute: async ({ query, limit }) => safeToolResult(await runCustomerAction("search_products", { query, limit })),
    });

    const showProducts = realtimeTool({
      name: "show_products",
      description: "Show known products by their stable catalogue IDs and optionally focus one. The result explicitly says whether the images finished displaying.",
      parameters: zod.object({
        product_ids: zod.array(zod.string()).min(1).max(12),
        focus_product_id: zod.string().nullable().default(null),
      }),
      execute: async ({ product_ids: productIds, focus_product_id: focusProductId }) =>
        safeToolResult(await runCustomerAction("show_products", { productIds, focusProductId })),
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
        return safeToolResult(await runCustomerAction("update_basket", { productId, quantity, mode, message, wrap }));
      },
    });

    const navigateShop = realtimeTool({
      name: "navigate_shop",
      description: "Immediately navigate the shopper UI. Opening the basket never starts checkout and never requires a store or time. Use one exact action.",
      parameters: zod.object({
        action: zod.enum(["open_basket", "close_basket", "open_fulfillment", "close_fulfillment", "show_orders", "continue_shopping", "back_to_orders", "close_product"]),
      }),
      execute: async ({ action }) => safeToolResult(await runCustomerAction(action)),
    });

    const browseCatalog = realtimeTool({
      name: "browse_catalog",
      description: "Show a catalogue category or all products. Use category IDs all, offer, patisserie und torten, baeckerei, traiteur, schokolade, or konfekt.",
      parameters: zod.object({ category: zod.enum(["all", "offer", "patisserie und torten", "baeckerei", "traiteur", "schokolade", "konfekt"]) }),
      execute: async ({ category }) => safeToolResult(await runCustomerAction("browse_category", { category })),
    });

    const showProductDetails = realtimeTool({
      name: "show_product_details",
      description: "Open the visible product detail sheet for one stable catalogue ID.",
      parameters: zod.object({ product_id: zod.string() }),
      execute: async ({ product_id: productId }) => safeToolResult(await runCustomerAction("open_product", { productId })),
    });

    const setProductOptions = realtimeTool({
      name: "set_product_options",
      description: "Set eligible gift options for the open product. This does not add the product until update_basket is called with the same options.",
      parameters: zod.object({
        gift_message: zod.enum(["None", "Happy Birthday", "Thank you"]),
        sample_wrap: zod.enum(["Standard", "Ribbon"]),
      }),
      execute: async ({ gift_message: message, sample_wrap: wrap }) => safeToolResult(await runCustomerAction("set_product_options", { message, wrap })),
    });

    const setFulfillment = realtimeTool({
      name: "set_fulfillment",
      description: "Choose pickup or delivery details and show the relevant selector. Branch changes revalidate stock and clear an incompatible time. Use exact branch, slot, and window IDs returned in state.",
      parameters: zod.object({
        field: zod.enum(["mode", "branch", "slot", "address", "delivery_window"]),
        value: zod.string(),
      }),
      execute: async ({ field, value }) => safeToolResult(await runCustomerAction("set_fulfillment", { field, value })),
    });

    const startCheckout = realtimeTool({
      name: "start_checkout",
      description: "Start checkout from the basket. Always opens the basket. If one detail is missing, displays the relevant selector and returns one concise question. Only when all details are valid does it freeze an exact review for a later explicit approval turn.",
      parameters: zod.object({}),
      execute: async () => safeToolResult(await runCustomerAction("start_checkout")),
    });

    const manageOrders = realtimeTool({
      name: "manage_orders",
      description: "Show saved orders, open one order/status, or prepare a refreshed reorder in the basket. Use an exact order ID from state.",
      parameters: zod.object({
        action: zod.enum(["show_orders", "open_order", "show_status", "toggle_order_details", "reorder"]),
        order_id: zod.string().nullable().default(null),
        details_open: zod.boolean().nullable().default(null),
      }),
      execute: async ({ action, order_id: orderId, details_open: open }) => safeToolResult(await runCustomerAction(action, { orderId, open })),
    });

    const setLanguageTool = realtimeTool({
      name: "change_language",
      description: "Change both the interface and spoken language to English or German.",
      parameters: zod.object({ language: zod.enum(["en", "de"]) }),
      execute: async ({ language: nextLanguage }) => safeToolResult(await runCustomerAction("change_language", { language: nextLanguage })),
    });

    const approveOrder = realtimeTool({
      name: "approve_simulated_order",
      description: "Approve simulated payment and create the sample order only after the shopper explicitly says approve or confirm for the currently visible exact review. Never call from implied intent.",
      parameters: zod.object({ review_id: zod.string(), review_fingerprint: zod.string(), explicit_intent: zod.enum(["approve", "confirm"]) }),
      execute: async ({ review_id: reviewId, review_fingerprint: fingerprint, explicit_intent: intent }) =>
        safeToolResult(await runCustomerAction("approve_order", { reviewId, fingerprint, intent })),
    });

    const findPickupSlots = realtimeTool({
      name: "find_demo_pickup_slots",
      description: "Find valid future 15-minute pickup slot IDs in Zurich time. Pass local_time like 12:15 and optionally local_date like 2026-09-19. Use a returned ID with set_fulfillment.",
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

    return [getShoppingState, searchProducts, showProducts, updateBasket, navigateShop, browseCatalog, showProductDetails,
      setProductOptions, setFulfillment, startCheckout, manageOrders, setLanguageTool, findPickupSlots, approveOrder];
  }, [createPickupSimulation, presentProducts, products, productsById, runCustomerAction, stateSnapshot, updatePickupPreference]);

  const clearVoiceTimeout = useCallback(() => {
    if (voiceTimeoutRef.current !== null) {
      window.clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  }, []);

  const closeVoiceSession = useCallback((message) => {
    clearVoiceTimeout();
    intentionalCloseRef.current = true;
    const session = sessionRef.current;
    retireSessionRuntime({ session, sessionRef, generationRef: sessionGenerationRef, actionAbortRef: customerActionAbortRef });
    updateVoiceStatus("idle");
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
      updateVoiceStatus(nextMuted ? "muted" : "listening");
      setVoiceMessage(nextMuted ? copyFor(languageRef.current).muted : copyFor(languageRef.current).listening);
      return;
    }

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      updateVoiceStatus("unsupported");
      setVoiceMessage(copyFor(languageRef.current).voiceSecure);
      return;
    }

    updateVoiceStatus("connecting");
    setVoiceMessage(copyFor(languageRef.current).connecting);
    intentionalCloseRef.current = false;
    const generation = sessionGenerationRef.current + 1;
    sessionGenerationRef.current = generation;
    recordVoiceStage("connecting");

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
      const currentSession = () => mountedRef.current
        && isCurrentSession(sessionRef.current, sessionGenerationRef.current, session, generation);

      session.on("history_updated", (history) => {
        if (currentSession()) setTranscript(transcriptFromHistory(history));
      });
      session.on("agent_start", () => {
        if (!currentSession()) return;
        updateVoiceStatus("working");
        setVoiceMessage(copyFor(languageRef.current).working);
        recordVoiceStage("working");
      });
      session.on("agent_end", () => {
        if (!currentSession()) return;
        if (voiceStageRef.current !== "speaking") {
          updateVoiceStatus(session.muted ? "muted" : "listening");
          setVoiceMessage(session.muted ? copyFor(languageRef.current).muted : copyFor(languageRef.current).listening);
        }
        recordVoiceStage("response_complete");
      });
      session.on("agent_tool_start", (_context, _agent, tool) => {
        if (!currentSession()) return;
        const name = tool?.name || "unknown";
        activeToolRef.current = { name, startedAt: performance.now() };
        updateVoiceStatus("working");
        setVoiceMessage(copyFor(languageRef.current).working);
        recordVoiceStage("tool_start", { action: name });
      });
      session.on("agent_tool_end", (_context, _agent, tool) => {
        if (!currentSession()) return;
        const active = activeToolRef.current;
        const durationMs = active ? Math.round(performance.now() - active.startedAt) : 0;
        activeToolRef.current = null;
        recordVoiceStage("tool_end", { action: tool?.name || active?.name || "unknown", durationMs });
      });
      session.on("audio_start", () => {
        if (!currentSession()) return;
        updateVoiceStatus("speaking");
        setVoiceMessage(copyFor(languageRef.current).speaking);
      });
      session.on("audio_stopped", () => {
        if (!currentSession()) return;
        updateVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage(session.muted ? copyFor(languageRef.current).muted : copyFor(languageRef.current).listening);
      });
      session.on("audio_interrupted", () => {
        if (!currentSession()) return;
        updateVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage(copyFor(languageRef.current).listening);
      });
      session.on("error", (event) => {
        if (!currentSession()) return;
        recordVoiceStage("error", { errorType: event?.error?.name || "RealtimeError" });
        clearVoiceTimeout();
        intentionalCloseRef.current = true;
        retireSessionRuntime({ session, sessionRef, generationRef: sessionGenerationRef, actionAbortRef: customerActionAbortRef, reason: "The voice session failed." });
        updateVoiceStatus("error");
        setVoiceMessage(copyFor(languageRef.current).voiceFailed);
      });

      session.transport.on?.("connection_change", (status) => {
        if (!currentSession()) return;
        recordVoiceStage("connection", { status });
        const recovery = connectionRecovery(status, intentionalCloseRef.current);
        if (!recovery) return;
        clearVoiceTimeout();
        intentionalCloseRef.current = true;
        retireSessionRuntime({ session, sessionRef, generationRef: sessionGenerationRef, actionAbortRef: customerActionAbortRef, reason: "The voice session disconnected." });
        updateVoiceStatus(recovery.voiceStatus);
        setIsMuted(false);
        setVoiceMessage(copyFor(languageRef.current)[recovery.messageKey]);
      });

      sessionRef.current = session;
      await session.connect({ apiKey: tokenPayload.value });
      if (!currentSession()) {
        session.close();
        return;
      }
      clearVoiceTimeout();
      voiceTimeoutRef.current = window.setTimeout(() => {
        if (!currentSession()) return;
        intentionalCloseRef.current = true;
        retireSessionRuntime({ session, sessionRef, generationRef: sessionGenerationRef, actionAbortRef: customerActionAbortRef, reason: "The voice session expired." });
        updateVoiceStatus("error");
        setIsMuted(false);
        setVoiceMessage(copyFor(languageRef.current).voiceExpired);
        recordVoiceStage("expired");
      }, VOICE_SESSION_DURATION_MS);
      updateVoiceStatus("listening");
      setVoiceMessage(copyFor(languageRef.current).listening);
      recordVoiceStage("connected");
      session.sendMessage(languageRef.current === "de" ? "Begrüsse die Kundin oder den Kunden in einem kurzen Satz und frage, was sie oder er heute möchte." : "Greet the shopper in one short sentence, then ask what they would like today.");
    } catch (error) {
      if (sessionGenerationRef.current !== generation) return;
      clearVoiceTimeout();
      const session = sessionRef.current;
      retireSessionRuntime({ session, sessionRef, generationRef: sessionGenerationRef, actionAbortRef: customerActionAbortRef, reason: "The voice session could not start." });
      const denied = error?.name === "NotAllowedError" || /microphone|permission/i.test(error?.message || "");
      updateVoiceStatus("error");
      setVoiceMessage(denied
        ? copyFor(languageRef.current).micDenied
        : (error instanceof Error ? error.message : copyFor(languageRef.current).voiceService));
    }
  }, [buildTools, clearVoiceTimeout, closeVoiceSession, isMuted, recordVoiceStage, stateSnapshot, voiceEnabled, voiceStatus]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearVoiceTimeout();
      retireSessionRuntime({ session: sessionRef.current, sessionRef, generationRef: sessionGenerationRef, actionAbortRef: customerActionAbortRef, reason: "The component unmounted." });
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

  const showAllProducts = useCallback(async (context = null) => {
    selectedIdRef.current = null;
    setSelectedId(null);
    const showing = presentProducts(products.map((product) => product.id), null, context);
    setActiveCategory("all");
    uiRef.current = { ...uiRef.current, view: "shop", modal: null, activeCategory: "all", selectedProductId: null };
    const result = await showing;
    if (context && !context.isCurrent()) return result;
    requestAnimationFrame(() => voiceButtonRef.current?.focus());
    queueMicrotask(() => sendInterfaceState("the full catalogue was restored"));
    return result;
  }, [presentProducts, products, sendInterfaceState]);

  const browseOfferProducts = useCallback(async (context = null) => {
    const eligibleTypes = profileId === "regular" ? ["baeckerei", "patisserie und torten"]
      : profileId === "chocolate" ? ["schokolade"] : null;
    if (!eligibleTypes) return showAllProducts(context);
    const showing = presentProducts(products.filter((product) => eligibleTypes.includes(product.productType)).map((product) => product.id), null, context);
    setActiveCategory("offer");
    uiRef.current = { ...uiRef.current, view: "shop", modal: null, activeCategory: "offer" };
    const result = await showing;
    if (context && !context.isCurrent()) return result;
    queueMicrotask(() => sendInterfaceState("the shopper opened products eligible for the selected demo offer"));
    return result;
  }, [presentProducts, products, profileId, sendInterfaceState, showAllProducts]);

  const browseCategory = useCallback(async (categoryId, context = null) => {
    if (categoryId === "all") return showAllProducts(context);
    const showing = presentProducts(products.filter((product) => product.productType === categoryId).map((product) => product.id), null, context);
    setActiveCategory(categoryId);
    uiRef.current = { ...uiRef.current, view: "shop", modal: null, activeCategory: categoryId };
    const result = await showing;
    if (context && !context.isCurrent()) return result;
    queueMicrotask(() => sendInterfaceState("the shopper selected a catalogue category"));
    return result;
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
    transitionUi({ view: "shop", modal: null, activeCategory: "all", selectedProductId: scenario.featuredProductId });
    setScenariosOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    queueMicrotask(() => sendInterfaceState("the presenter changed the shopping scenario"));
  }, [products, sendInterfaceState, transitionUi, updatePickupPreference]);

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
    transitionUi({ view: "shop", modal: null });
    queueMicrotask(() => sendInterfaceState("the shopper changed fulfilment mode"));
  }, [invalidateOrderReview, sendInterfaceState, transitionUi]);

  const changeDeliveryDetails = useCallback((field, value) => {
    if (field === "address") { deliveryAddressRef.current = value; setDeliveryAddress(value); }
    if (field === "window") { deliveryWindowRef.current = value; setDeliveryWindowId(value); }
    invalidateOrderReview();
    queueMicrotask(() => sendInterfaceState("the shopper changed delivery details"));
  }, [invalidateOrderReview, sendInterfaceState]);

  const changeLanguage = useCallback((nextLanguage) => {
    if (!LANGUAGES.some((item) => item.id === nextLanguage)) return;
    languageRef.current = nextLanguage;
    setLanguage(nextLanguage);
    const nextCopy = copyFor(nextLanguage);
    setVoiceMessage((current) => voiceStatus === "idle" ? nextCopy.talkShop : voiceStatus === "muted" ? nextCopy.muted : voiceStatus === "speaking" ? nextCopy.speaking : voiceStatus === "connecting" ? nextCopy.connecting : current);
    window.localStorage.setItem("honold-demo-language", nextLanguage);
    uiRef.current = { ...uiRef.current };
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

  const openBasket = useCallback(() => {
    setReviewAttempted(false);
    pickupRef.current = null;
    setPickupSimulation(null);
    panelActions.openBasket();
    return { basket: basketSummary(basketRef.current, productsById), message: basketRef.current && Object.keys(basketRef.current).length ? "Basket opened." : "The basket is empty." };
  }, [panelActions, productsById]);
  const closeBasket = useCallback(() => {
    panelActions.closePanels();
    return { message: "Basket closed." };
  }, [panelActions]);
  const closeCaptions = useCallback(() => {
    setCaptionsOpen(false);
    requestAnimationFrame(() => captionsButtonRef.current?.focus());
  }, []);

  const prepareExactReview = useCallback(() => {
    const now = Date.now();
    const summary = basketSummary(basketRef.current, productsById);
    const validation = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
      slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: now });
    if (!validation.ok) return null;
    const currentQuote = offerQuote(profileRef.current, summary, productsById);
    const fingerprint = reviewFingerprint({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
      slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
      profileId: profileRef.current, exampleTotalChf: currentQuote.exampleTotalChf });
    reviewSequenceRef.current += 1;
    const review = { fingerprint, reviewId: makeReviewId(fingerprint, now, reviewSequenceRef.current), createdAt: now,
      basket: { ...basketRef.current }, mode: fulfillmentModeRef.current, branchId: branchRef.current, slotId: slotRef.current,
      address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, profileId: profileRef.current, quote: currentQuote };
    pendingReviewRef.current = review; setPendingReview(review);
    return review;
  }, [productsById]);

  const approveExactReview = useCallback((intent = "approve", expected = null) => {
    try {
      const review = pendingReviewRef.current;
      if (!review || (expected && (review.reviewId !== expected.reviewId || review.fingerprint !== expected.fingerprint))) {
        throw new Error("The review changed or expired. Prepare a fresh exact review.");
      }
      const now = Date.now();
      const liveSummary = basketSummary(basketRef.current, productsById);
      const liveQuote = offerQuote(profileRef.current, liveSummary, productsById);
      const liveFingerprint = reviewFingerprint({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
        slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current,
        profileId: profileRef.current, exampleTotalChf: liveQuote.exampleTotalChf });
      if (review.fingerprint !== liveFingerprint) throw new Error("The basket, offer, branch, or time changed. Prepare a fresh exact review.");
      const liveCheck = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
        slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: now });
      if (!liveCheck.ok) throw new Error(liveCheck.reason);
      const approved = approveReview(review, intent, now);
      const result = createPickupSimulation();
      if (!result) throw new Error("Final stock, slot, or price validation failed.");
      const completed = { ...result, orderId: approved.approvalId, pickupCode: pickupCodeForReview(approved.approvalId), reviewFingerprint: approved.fingerprint, payment: approved.payment };
      pendingReviewRef.current = null; setPendingReview(null);
      pickupRef.current = completed;
      setPickupSimulation(completed);
      basketRef.current = {}; setBasket({});
      const nextOrders = saveSampleOrder(ordersRef.current[review.profileId] || [], approved, completed);
      ordersRef.current = { ...ordersRef.current, [review.profileId]: nextOrders };
      setOrdersByProfile(ordersRef.current);
      panelActions.showOrderStatus(completed.orderId, false);
      queueMicrotask(() => sendInterfaceState("the shopper explicitly approved the exact review; simulated payment and sample order were created"));
      return { simulated: true, orderId: completed.orderId, payment: approved.payment, pickupCode: completed.pickupCode, status: previewStatus(completed) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Approval failed.";
      setPickupError(message);
      return { ok: false, status: "blocked", error: message };
    }
  }, [createPickupSimulation, panelActions, productsById, sendInterfaceState]);

  const confirmTouchOrder = useCallback(() => {
    setReviewAttempted(true);
    if (!fulfillmentValidation.ok) {
      const missingPickup = fulfillmentMode === "pickup" && !slotId;
      const missingDelivery = fulfillmentMode === "delivery" && (!deliveryAddress.trim() || !deliveryWindowId);
      if (missingPickup || missingDelivery) panelActions.checkout(true);
      return null;
    }
    if (!pendingReviewRef.current) return prepareExactReview();
    return approveExactReview("confirm");
  }, [approveExactReview, deliveryAddress, deliveryWindowId, fulfillmentMode, fulfillmentValidation.ok, panelActions, prepareExactReview, slotId]);

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
    basketRef.current = next; setBasket(next);
    setPendingReview(null); pendingReviewRef.current = null; setPickupSimulation(null); pickupRef.current = null;
    setPickupError("Your reorder is ready. Availability and prices were refreshed; check the fulfilment details and confirm again.");
    panelActions.openBasket({ selectedOrderId: order.orderId || order.approvalId });
    queueMicrotask(() => sendInterfaceState("the shopper prepared a refreshed reorder"));
    return basketSummary(next, productsById);
  }, [panelActions, productsById, sendInterfaceState, validProductIds]);

  const advancePickup = useCallback(() => {
    const next = advancePreview(pickupRef.current);
    pickupRef.current = next;
    setPickupSimulation(next);
    setOrdersByProfile((current) => ({ ...current, [profileRef.current]: (current[profileRef.current] || []).map((order) => order.orderId === next.orderId ? { ...order, stage: next.stage } : order) }));
    queueMicrotask(() => sendInterfaceState("demo pickup progress advanced"));
  }, [sendInterfaceState]);

  const openProductAction = useCallback((productId) => {
    const product = productsById.get(productId);
    if (!product) throw new Error("Choose a valid product.");
    selectProduct(productId);
    pickupRef.current = null;
    setPickupSimulation(null);
    const options = { message: "None", wrap: "Standard" };
    panelActions.openProduct(productId, options);
    return { product: localizedProduct(product, languageRef.current), options, giftOptionsAvailable: GIFT_OPTION_PRODUCT_IDS.has(productId) };
  }, [panelActions, productsById, selectProduct]);

  const closeProductAction = useCallback(() => {
    panelActions.closePanels();
    return { message: "Product details closed." };
  }, [panelActions]);

  const setProductOptionsAction = useCallback(({ message, wrap }) => {
    const productId = uiRef.current.selectedProductId;
    if (!productId || uiRef.current.modal !== "product_detail") throw new Error("Open a product first.");
    if (!GIFT_OPTION_PRODUCT_IDS.has(productId)) return { ok: false, status: "blocked", error: "This product has no gift options." };
    const options = { message, wrap };
    setDetailOptions(options);
    uiRef.current = { ...uiRef.current, detailOptions: options };
    return { productId, options };
  }, []);

  const openFulfillmentAction = useCallback(() => {
    pickupRef.current = null;
    setPickupSimulation(null);
    panelActions.openFulfillment();
    return { checkout: stateSnapshot().demoCheckout };
  }, [panelActions, stateSnapshot]);

  const closeFulfillmentAction = useCallback(() => {
    panelActions.closeFulfillment();
    return { message: "Fulfilment choices closed." };
  }, [panelActions]);

  const setFulfillmentAction = useCallback(({ field, value }) => {
    const keepBasket = basketOpenRef.current;
    pickupRef.current = null;
    setPickupSimulation(null);
    if (field === "mode") {
      if (!["pickup", "delivery"].includes(value)) throw new Error("Choose pickup or delivery.");
      changeFulfillmentMode(value);
    } else if (field === "branch") {
      updatePickupPreference("branch", value, "voice");
    } else if (field === "slot") {
      updatePickupPreference("slot", value, "voice");
    } else if (field === "address") {
      changeDeliveryDetails("address", value);
    } else if (field === "delivery_window") {
      changeDeliveryDetails("window", value);
    }
    panelActions.openFulfillment(keepBasket);
    const next = stateSnapshot().demoCheckout;
    const branchStockIssues = next.basketSampleStock.filter((item) => item.requested > item.sampleAvailable);
    return {
      checkout: next,
      stockIssues: branchStockIssues,
      alternatives: branchStockIssues.length ? DEMO_BRANCHES.filter((item) => item.id !== branchRef.current) : [],
      message: branchStockIssues.length
        ? "The store changed and some basket quantities are unavailable here. Offer the other listed store or a quantity change."
        : "Fulfilment updated.",
    };
  }, [changeDeliveryDetails, changeFulfillmentMode, panelActions, stateSnapshot, updatePickupPreference]);

  const startCheckoutAction = useCallback(() => {
    openBasket();
    const now = Date.now();
    const validation = fulfillmentCheck({ basket: basketRef.current, mode: fulfillmentModeRef.current, branchId: branchRef.current,
      slotId: slotRef.current, address: deliveryAddressRef.current, deliveryWindowId: deliveryWindowRef.current, nowMs: now });
    if (!validation.ok) {
      const needsSelector = /pickup branch|pickup slot|pickup time|delivery address|delivery window/i.test(validation.reason || "");
      if (needsSelector) {
        panelActions.checkout(true);
      }
      return {
        ok: false,
        status: "blocked",
        missing: validation.reason,
        question: checkoutQuestion(validation, languageRef.current),
        checkout: stateSnapshot().demoCheckout,
      };
    }
    const review = prepareExactReview();
    panelActions.checkout(false);
    return {
      reviewId: review.reviewId,
      reviewFingerprint: review.fingerprint,
      awaitingExplicitApproval: true,
      basket: basketSummary(basketRef.current, productsById),
      checkout: stateSnapshot().demoCheckout,
      message: "The exact review is visible. Briefly state total, offer, and fulfilment once, then wait for a later explicit confirmation.",
    };
  }, [openBasket, panelActions, prepareExactReview, productsById, stateSnapshot]);

  const showOrdersAction = useCallback(() => {
    setPickupSimulation(null);
    pickupRef.current = null;
    panelActions.showOrders();
    return { orders: stateSnapshot().orders };
  }, [panelActions, stateSnapshot]);

  const openOrderAction = useCallback((orderId) => {
    const orders = ordersRef.current[profileRef.current] || [];
    const order = orderId ? orders.find((item) => (item.orderId || item.approvalId) === orderId) : orders[0];
    if (!order) return { ok: false, status: "blocked", error: "No saved order is available." };
    pickupRef.current = order;
    setPickupSimulation(order);
    panelActions.showOrderStatus(order.orderId || order.approvalId, true);
    return { order: stateSnapshot().orders.find((item) => item.orderId === (order.orderId || order.approvalId)) || null };
  }, [panelActions, stateSnapshot]);

  const continueShoppingAction = useCallback(() => {
    setPickupSimulation(null);
    pickupRef.current = null;
    panelActions.continueShopping();
    return { message: "Shop opened." };
  }, [panelActions]);

  const backToOrdersAction = useCallback(() => {
    setPickupSimulation(null);
    pickupRef.current = null;
    panelActions.showOrders();
    return { orders: stateSnapshot().orders };
  }, [panelActions, stateSnapshot]);

  const toggleOrderDetailsAction = useCallback((open = null) => {
    if (!pickupRef.current) return { ok: false, status: "blocked", error: "Open an order status first." };
    const nextOpen = typeof open === "boolean" ? open : !orderDetailsOpenRef.current;
    panelActions.showOrderStatus(pickupRef.current.orderId || pickupRef.current.approvalId, nextOpen);
    return { orderDetailsOpen: nextOpen };
  }, [panelActions]);

  const searchProductsAction = useCallback(async ({ query, limit }, context) => {
    const matches = searchCatalog(products, query, limit);
    if (matches.length === 0) return { found: false, query, message: "No matching public catalogue products were found." };
    const displayResult = await presentProducts(matches.map((product) => product.id), matches[0].id, context);
    return { found: true, query, ...displayResult };
  }, [presentProducts, products]);

  const showProductsAction = useCallback(({ productIds, focusProductId }, context) =>
    presentProducts(productIds, focusProductId, context), [presentProducts]);

  customerActionsRef.current = createCustomerActionController({
    openBasket,
    closeBasket,
    openFulfillment: openFulfillmentAction,
    closeFulfillment: closeFulfillmentAction,
    searchProducts: searchProductsAction,
    showProducts: showProductsAction,
    browseCategory: (category, context) => category === "offer" ? browseOfferProducts(context) : browseCategory(category, context),
    openProduct: openProductAction,
    closeProduct: closeProductAction,
    setProductOptions: setProductOptionsAction,
    updateBasket: ({ productId, quantity, mode, message, wrap }) => ({
      basket: mutateBasket(basketKey(productId, { message, wrap }), quantity, mode, "voice"),
      message: mode === "remove" || (mode === "set" && quantity === 0) ? "Basket updated." : "Added to basket.",
    }),
    setFulfillment: setFulfillmentAction,
    startCheckout: startCheckoutAction,
    approveExactReview,
    showOrders: showOrdersAction,
    openOrder: openOrderAction,
    toggleOrderDetails: toggleOrderDetailsAction,
    reorder: (orderId) => {
      const order = (ordersRef.current[profileRef.current] || []).find((item) => (item.orderId || item.approvalId) === orderId);
      if (!order) return { ok: false, status: "blocked", error: "Choose a saved order first." };
      return { basket: reorderSample(order), message: "The refreshed reorder is open in the basket." };
    },
    continueShopping: continueShoppingAction,
    backToOrders: backToOrdersAction,
    changeLanguage: (nextLanguage) => { changeLanguage(nextLanguage); return { language: nextLanguage }; },
  });

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
        <button className={styles.brandButton} type="button" onClick={continueShoppingAction} aria-label={c.backShop}>
          <Image className={styles.brandLogo} src="/honold-demo/brand/honold-logo.svg" alt="Confiserie Honold" width={180} height={150} priority />
        </button>
        <div className={styles.headerActions}>
          <div className={styles.languageSelector} role="group" aria-label={language === "de" ? "Sprache" : "Language"}>
            {LANGUAGES.map((item) => <button key={item.id} type="button" lang={item.id} aria-label={item.label} aria-pressed={language === item.id} onClick={() => changeLanguage(item.id)}>{item.short}</button>)}
          </div>
          <button className={styles.ordersAction} type="button" onClick={showOrdersAction}>
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
          <button className={styles.detailsToggle} type="button" aria-expanded={orderDetailsOpen} onClick={() => toggleOrderDetailsAction()}>
            {c.orderDetails} <ChevronDown size={18} aria-hidden="true" />
          </button>
          {orderDetailsOpen && confirmedDetails && <div className={styles.confirmedDetails}>
            {confirmedDetails.items.map((item) => <div key={item.basketKey}><span>{item.quantity} × {productName(productsById.get(item.productId), language)}</span><strong>{formatChf(item.lineTotalChf)}</strong></div>)}
            {pickupSimulation.quote?.savingsChf > 0 && <div><span>{c.offerApplied}</span><strong>−{formatChf(pickupSimulation.quote.savingsChf)}</strong></div>}
            <div className={styles.confirmedTotal}><span>{c.total}</span><strong>{formatChf(pickupSimulation.quote?.exampleTotalChf || confirmedDetails.totalChf)}</strong></div>
          </div>}
          <div className={styles.statusActions}>
            <button className={styles.backToShop} type="button" onClick={backToOrdersAction}>{c.backOrders}</button>
            <button className={styles.secondaryStatusAction} type="button" onClick={continueShoppingAction}>{c.continueShopping}</button>
          </div>
        </section>
      ) : shopView === "orders" ? (
        <section className={styles.ordersView} aria-label={c.orders}>
          <span className={styles.kicker}>{c.savedOrders}</span><h1>{c.yourOrders}</h1>
          {currentOrders.length ? currentOrders.map((order) => <article key={order.approvalId}>
            <button className={styles.orderSummary} type="button" onClick={() => openOrderAction(order.orderId || order.approvalId)}>
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
          <button className={styles.fulfillmentSummary} type="button" onClick={openFulfillmentAction}>
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
                <button className={styles.productSelect} type="button" onClick={() => openProductAction(product.id)} aria-label={c.view + " " + productName(product, language)}>
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

      {sessionRef.current && (pickupSimulation || shopView !== "shop" || basketOpen || fulfillmentOpen || Boolean(detailProduct)) && <aside className={styles.voiceSessionBar} aria-label={c.shoppingControls}>
        <span aria-live="polite">{voiceMessage}</span>
        <button type="button" onClick={startVoice}>{isMuted ? c.unmute : c.mute}</button>
        <button type="button" onClick={disconnectVoice}>{c.endVoice}</button>
      </aside>}

      {captionsOpen && transcript.length > 0 && <section className={styles.captions} aria-label={c.captions}>
        <header><strong>{c.captions}</strong><button type="button" onClick={closeCaptions}><X size={16} /></button></header>
        {transcript.slice(-2).map((item) => <p key={item.id + "-" + item.role}><span>{item.role === "assistant" ? "Honold" : c.you}</span>{item.text}</p>)}
      </section>}

      {detailProduct && <div className={styles.modalBackdrop} onMouseDown={closeProductAction}>
        <section className={styles.productDetail} role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className={styles.closeButton} type="button" onClick={closeProductAction} aria-label={c.closeDetails}><X /></button>
          <div className={styles.detailImage}><Image src={detailProduct.images[0].localPath} alt={detailProduct.images[0].alt || detailProduct.name} fill sizes="360px" /></div>
          <div className={styles.detailCopy}>
            <h2 id="product-detail-title">{productName(detailProduct, language)}</h2><p>{c.productInfo}</p>
            <div className={styles.detailPrice}><strong>{formatChf(itemOffer(profileId, detailProduct).eligible ? itemOffer(profileId, detailProduct).indicativeEffectiveChf : detailProduct.priceChf)}</strong>
              {itemOffer(profileId, detailProduct).eligible && <del>{formatChf(detailProduct.priceChf)}</del>}</div>
            {GIFT_OPTION_PRODUCT_IDS.has(detailProduct.id) && Object.entries(DEMO_VARIANTS).map(([id, option]) => <label key={id}>{id === "message" ? (language === "de" ? "Geschenknachricht" : "Gift message") : (language === "de" ? "Geschenkverpackung" : "Gift wrap")}
              <select value={detailOptions[id]} onChange={(event) => setProductOptionsAction({ ...detailOptions, [id]: event.target.value })}>
                {option.values.map((value) => <option key={value} value={value}>{({ None: c.none, "Happy Birthday": c.happyBirthday, "Thank you": c.thankYou, Standard: c.standard, Ribbon: c.ribbon })[value] || value}{id === "wrap" && value === "Ribbon" ? " · CHF 2.50" : ""}</option>)}
              </select>
            </label>)}
            <button className={styles.primaryAction} type="button" disabled={sampleStock(detailProduct.id, branchId) === 0}
              onClick={() => { mutateBasket(basketKey(detailProduct.id, detailOptions), 1, "add"); closeProductAction(); }}>
              {sampleStock(detailProduct.id, branchId) === 0 ? c.unavailableAt + " " + branch?.name : c.addBasket}
            </button>
          </div>
        </section>
      </div>}

      {fulfillmentOpen && <div className={`${styles.modalBackdrop} ${styles.fulfillmentBackdrop}`} onMouseDown={closeFulfillmentAction}>
        <section className={styles.fulfillmentSheet} role="dialog" aria-modal="true" aria-labelledby="fulfillment-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className={styles.kicker}>{fulfillmentMode}</span><h2 id="fulfillment-title">{fulfillmentMode === "pickup" ? c.choosePickup : c.deliveryDetails}</h2></div>
            <button className={styles.closeButton} type="button" onClick={closeFulfillmentAction}><X /></button></header>
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
          <button className={styles.primaryAction} type="button" onClick={closeFulfillmentAction}
            disabled={fulfillmentMode === "pickup" ? !slotId : !deliveryAddress.trim() || !deliveryWindowId}>{c.done}</button>
        </section>
      </div>}

      {basketOpen && <div className={styles.modalBackdrop} onMouseDown={closeBasket}>
        <section ref={drawerRef} className={styles.reviewSheet} role="dialog" aria-modal="true" aria-labelledby="basket-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className={styles.kicker}>{c.review}</span><h2 id="basket-title">{c.yourOrder}</h2></div>
            <button ref={drawerCloseRef} className={styles.closeButton} type="button" onClick={closeBasket} aria-label={c.closeReview}><X /></button></header>
          <button className={styles.reviewFulfillment} type="button" onClick={openFulfillmentAction}>
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
            {fulfillmentMode === "pickup" && !slotId ? c.choosePickupTime : fulfillmentMode === "delivery" && (!deliveryAddress.trim() || !deliveryWindowId) ? c.chooseDeliveryWindow : (pendingReview ? c.confirmOrder : c.reviewOrder) + " · " + formatChf(quote.exampleTotalChf)}
          </button>
        </section>
      </div>}
    </main>
  );
}

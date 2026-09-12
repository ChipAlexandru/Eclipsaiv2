"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, GitCompareArrows, Heart, MapPin, Mic, MicOff, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { basketSummary, changeQuantity, compactProduct, departureEligibility, reservationFingerprint, resultsLimitForTravel, searchCatalog, shoppingStateSnapshot } from "./shopping.mjs";
import { isAllowedAvoltaRealtimeModel } from "./realtimeConfig.mjs";
import { assessReplayJourney, boardingCountdown, createReplayAnchor, journeyStageLabel, nextMeaningfulOrderAnnouncement, normalizeJourneyStage, orderProgress, pairedCountdowns, recommendFulfillment, replayClockState, replayFlightStatus, replayNow } from "./flightReplay.mjs";
import styles from "./avoltaVoiceShop.module.css";

const IMAGE_WAIT_MS = 1800;
const VOICE_DEMO_DURATION_MS = 5 * 60 * 1000;
const STORAGE_KEY = "avolta-zrh-flight-day-v2";
const FIRST_VOICE_OPENING = "Welcome the traveler to Avolta now. In warm, natural language, say you can help them make the most of their journey by finding something they will love and arranging the easiest supported way to get it whether they are on the way or already at the airport, then ask where they are flying today. This opening may use up to three short sentences. Do not mention the demo day, replay, simulation, data, tools or setup.";
const RESUMED_VOICE_OPENING = "Resume naturally from the current shopping and journey context without repeating the welcome or any demo explanation. Briefly invite the traveler to continue, and ask one context-aware question only if it is useful.";
const DEFAULT_TRAVEL = { stage: "unknown", minutesAvailable: "", departureDateTime: "", gate: "", destination: "", flightQuery: "", arrivalEstimate: "", needsCheckin: false, selectedFlight: null };

function formatMoney(value, currency = "CHF") { return new Intl.NumberFormat("en-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(value); }
function safe(value) { return JSON.stringify(value); }
function formatClock(value) { return value ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Zurich" }).format(new Date(value)) : "Time unavailable"; }
function customerFlight(flight) { return flight ? { id: flight.id, flightNumber: flight.flightNumber, codeshares: flight.codeshares, destinationCode: flight.destinationCode, destination: flight.destination, scheduledDeparture: flight.scheduledDeparture, estimatedDeparture: flight.estimatedDeparture, boardingTime: flight.boardingTime, gate: flight.gate } : null; }
function customerFulfillment(fulfillment) { return fulfillment ? { method: fulfillment.method, destination: fulfillment.destination, etaMinutes: fulfillment.etaMinutes, reason: fulfillment.reason } : null; }

export function AvoltaVoiceShop({ catalog, flightDay }) {
  const products = catalog.products;
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const validProductIds = useMemo(() => new Set(productsById.keys()), [productsById]);
  const [visibleIds, setVisibleIds] = useState(() => products.map((product) => product.id));
  const [selectedId, setSelectedId] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [shortlist, setShortlist] = useState({});
  const [basket, setBasket] = useState({});
  const [travel, setTravel] = useState(DEFAULT_TRAVEL);
  const [activeCategory, setActiveCategory] = useState("All");
  const [focusedView, setFocusedView] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Talk to Order");
  const [isMuted, setIsMuted] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [playbackState, setPlaybackState] = useState("idle");
  const [audioEvidence, setAudioEvidence] = useState({ trackReceived: false, modelAudioStarted: false, bytesReceived: 0, totalAudioEnergy: 0 });
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [review, setReview] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [order, setOrder] = useState(null);
  const [reservationError, setReservationError] = useState("");
  const [imageFailures, setImageFailures] = useState(() => new Set());
  const [storageReady, setStorageReady] = useState(false);
  const [clockReady, setClockReady] = useState(false);
  const [demoNow, setDemoNow] = useState(() => new Date(`${flightDay.serviceDate}T12:00:00Z`));
  const [flightContext, setFlightContext] = useState(null);
  const [pendingFlight, setPendingFlight] = useState(null);
  const [flightLookupActive, setFlightLookupActive] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const sessionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const audioOutputRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const audioPollRef = useRef(null);
  const mountedRef = useRef(true);
  const presentationSequenceRef = useRef(0);
  const visibleIdsRef = useRef(visibleIds);
  const selectedIdRef = useRef(selectedId);
  const comparisonRef = useRef(comparison);
  const shortlistRef = useRef(shortlist);
  const basketRef = useRef(basket);
  const travelRef = useRef(travel);
  const reviewRef = useRef(review);
  const reservationRef = useRef(reservation);
  const orderRef = useRef(order);
  const demoNowRef = useRef(demoNow);
  const clockAnchorRef = useRef(null);
  const imageFailuresRef = useRef(new Set());
  const journeyContextRef = useRef(null);
  const flightMatchesRef = useRef([]);
  const pendingFlightRef = useRef(null);
  const announcedOrderStatesRef = useRef([]);
  const previousOrderStateRef = useRef(null);
  const voiceWelcomedRef = useRef(false);

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const selectedProduct = selectedId ? productsById.get(selectedId) : null;
  useEffect(() => {
    const explicitTime = process.env.NODE_ENV !== "production" ? new URLSearchParams(window.location.search).get("demoTime") : null;
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      const anchor = createReplayAnchor({ fixtureVersion: flightDay.fixtureVersion, serviceDate: flightDay.serviceDate, realNow: new Date(), storedAnchor: stored?.clockAnchor, explicitTime });
      clockAnchorRef.current = anchor;
      const replayedNow = replayNow(anchor, new Date()); demoNowRef.current = replayedNow; setDemoNow(replayedNow);
      if (stored?.shortlist) { shortlistRef.current = stored.shortlist; setShortlist(stored.shortlist); }
      if (stored?.basket) { basketRef.current = stored.basket; setBasket(stored.basket); }
      if (stored?.travel) { travelRef.current = { ...DEFAULT_TRAVEL, ...stored.travel }; setTravel(travelRef.current); }
      if (stored?.reservation) { reservationRef.current = stored.reservation; setReservation(stored.reservation); }
      if (stored?.order) { orderRef.current = stored.order; setOrder(stored.order); }
      if (Array.isArray(stored?.announcedOrderStates)) announcedOrderStatesRef.current = stored.announcedOrderStates;
      voiceWelcomedRef.current = Boolean(stored?.voiceWelcomed);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, clockAnchor: anchor }));
    } catch {
      const anchor = createReplayAnchor({ fixtureVersion: flightDay.fixtureVersion, serviceDate: flightDay.serviceDate, realNow: new Date(), explicitTime });
      clockAnchorRef.current = anchor;
      const replayedNow = replayNow(anchor, new Date()); demoNowRef.current = replayedNow; setDemoNow(replayedNow);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be unavailable; in-memory replay still works. */ }
    }
    setClockReady(true);
    setStorageReady(true);
  }, [flightDay.fixtureVersion, flightDay.serviceDate]);
  useEffect(() => {
    if (!clockReady) return undefined;
    const update = () => { const next = replayNow(clockAnchorRef.current, new Date()); demoNowRef.current = next; setDemoNow(next); };
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, [clockReady]);
  useEffect(() => {
    if (!storageReady || !clockAnchorRef.current) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ clockAnchor: clockAnchorRef.current, shortlist, basket, travel, reservation, order, announcedOrderStates: announcedOrderStatesRef.current, voiceWelcomed: voiceWelcomedRef.current })); } catch { /* In-memory state remains available when browser storage is blocked. */ }
  }, [basket, order, reservation, shortlist, storageReady, travel]);

  const currentViewportIds = useCallback(() => {
    if (typeof document === "undefined") return [];
    const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
    return [...document.querySelectorAll("[data-product-card]")].filter((card) => { const rect = card.getBoundingClientRect(); return rect.bottom > 0 && rect.top < viewportBottom; }).map((card) => card.dataset.productCard).filter((id) => validProductIds.has(id)).slice(0, 8);
  }, [validProductIds]);
  const stateSnapshot = useCallback(() => {
    const viewportIds = currentViewportIds();
    const clock = clockAnchorRef.current ? replayClockState(clockAnchorRef.current, new Date()) : { now: demoNowRef.current.toISOString(), replayDate: flightDay.serviceDate, scheduleEnded: false };
    return { ...shoppingStateSnapshot({ visibleIds: viewportIds.length ? viewportIds : (selectedIdRef.current ? [selectedIdRef.current] : visibleIdsRef.current.slice(0, 8)), selectedId: selectedIdRef.current, shortlist: shortlistRef.current, basket: basketRef.current, travel: travelRef.current }, productsById), browseScope: focusedView ? "voice recommendation" : activeCategory, browseProductCount: visibleIdsRef.current.length, demoClock: { ...clock, fixtureVersion: flightDay.fixtureVersion, basis: "captured-day replay, not a live airport feed" }, pendingFlight: pendingFlightRef.current, order: orderRef.current ? { ...orderRef.current, progress: orderProgress(orderRef.current, demoNowRef.current) } : null };
  }, [activeCategory, currentViewportIds, flightDay.fixtureVersion, flightDay.serviceDate, focusedView, productsById]);
  const sendInterfaceState = useCallback((reason) => {
    const session = sessionRef.current;
    if (!session || session.transport.status !== "connected") return;
    try { session.transport.sendMessage(`[Interface state after ${reason}; do not respond unless asked.] ${safe(stateSnapshot())}`, {}, { triggerResponse: false }); } catch { /* The state tool remains authoritative. */ }
  }, [stateSnapshot]);

  const waitForDisplayedImages = useCallback(async (ids, sequence) => {
    const viewportIds = ids.slice(0, 4);
    const deadline = performance.now() + IMAGE_WAIT_MS;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    while (performance.now() < deadline) {
      if (presentationSequenceRef.current !== sequence) return { stale: true, displayedIds: [], failedIds: [] };
      const displayedIds = []; const failedIds = [];
      for (const id of viewportIds) {
        const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
        if (image?.complete && image.naturalWidth > 0) displayedIds.push(id); else if (image?.dataset.failed === "true" || imageFailuresRef.current.has(id)) failedIds.push(id);
      }
      if (displayedIds.length + failedIds.length === viewportIds.length) return { stale: false, displayedIds, failedIds, checkedIds: viewportIds };
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    const displayedIds = []; const failedIds = [];
    for (const id of viewportIds) { const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`); if (image?.complete && image.naturalWidth > 0) displayedIds.push(id); else failedIds.push(id); }
    return { stale: false, displayedIds, failedIds, checkedIds: viewportIds, timedOut: true };
  }, []);
  const presentProducts = useCallback(async (requestedIds, focusId = null) => {
    const ids = [...new Set(requestedIds)].filter((id) => validProductIds.has(id)).slice(0, 20);
    if (!ids.length) return { displayed: false, error: "No products from the available selection matched." };
    const sequence = ++presentationSequenceRef.current;
    visibleIdsRef.current = ids; setVisibleIds(ids); setFocusedView(true); setActiveCategory("All");
    const nextSelected = focusId && ids.includes(focusId) ? focusId : ids[0]; selectedIdRef.current = nextSelected; setSelectedId(nextSelected);
    const result = await waitForDisplayedImages(ids, sequence);
    if (result.stale) return { displayed: false, stale: true, message: "A newer selection replaced these results." };
    return { displayed: result.displayedIds.length === result.checkedIds.length, displayedProducts: result.displayedIds.map((id) => compactProduct(productsById.get(id))), selectedProduct: compactProduct(productsById.get(nextSelected)), failedImageProductIds: result.failedIds, recommendationProductCount: ids.length, imageReadinessScope: "first products in the recommendation viewport", message: result.displayedIds.length === result.checkedIds.length ? "The on-screen recommendation images are displayed." : "Some on-screen images did not load; only displayedProducts are confirmed visible." };
  }, [productsById, validProductIds, waitForDisplayedImages]);

  const invalidateReview = useCallback(() => { reviewRef.current = null; setReview(null); setReservationError(""); }, []);
  const mutateBasket = useCallback((productId, quantity, mode, source = "touch") => {
    const next = changeQuantity(basketRef.current, productId, quantity, mode, validProductIds); basketRef.current = next; setBasket(next); invalidateReview();
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a basket touch action"));
    return basketSummary(next, productsById);
  }, [invalidateReview, productsById, sendInterfaceState, validProductIds]);
  const mutateShortlist = useCallback((productId, keep, source = "touch") => {
    if (!validProductIds.has(productId)) throw new Error("Unknown product ID.");
    const next = { ...shortlistRef.current }; if (keep) next[productId] = true; else delete next[productId]; shortlistRef.current = next; setShortlist(next);
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a shortlist touch action"));
    return Object.keys(next).map((id) => compactProduct(productsById.get(id))).filter(Boolean);
  }, [productsById, sendInterfaceState, validProductIds]);
  const updateTravel = useCallback((patch, source = "touch") => {
    const next = { ...travelRef.current, ...patch, ...(patch.stage ? { stage: normalizeJourneyStage(patch.stage) } : {}) }; travelRef.current = next; setTravel(next); invalidateReview();
    if (source === "touch") queueMicrotask(() => sendInterfaceState("travel context changed")); return next;
  }, [invalidateReview, sendInterfaceState]);
  const proposeFlight = useCallback((flight) => { if (!flight) return null; pendingFlightRef.current = flight; setPendingFlight(flight); setFlightLookupActive(true); return flight; }, []);
  const confirmFlight = useCallback((flight, source = "voice") => { if (!flight) return null; pendingFlightRef.current = null; setPendingFlight(null); setFlightLookupActive(false); updateTravel({ selectedFlight: flight, destination: flight.destination || "", gate: flight.gate || "", departureDateTime: flight.scheduledDeparture || "" }, source); return flight; }, [updateTravel]);
  const clearConfirmedFlight = useCallback(() => { pendingFlightRef.current = null; setPendingFlight(null); setFlightLookupActive(false); updateTravel({ selectedFlight: null, destination: "", gate: "", departureDateTime: "" }, "voice"); return { cleared: true }; }, [updateTravel]);
  const refreshJourney = useCallback(async (query = "") => {
    try {
      const response = await fetch("/api/avolta-demo/journey-context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, demoNow: demoNowRef.current.toISOString() }) });
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || "Flight information is unavailable.");
      journeyContextRef.current = payload; const matches = payload.flightSearch?.matches || []; flightMatchesRef.current = matches;
      setFlightContext(payload); if (query) { setFlightLookupActive(true); if (matches.length === 1) proposeFlight(matches[0]); }
      return payload;
    } catch (error) { return { error: error.message || "Flight information is unavailable." }; }
  }, [proposeFlight]);
  useEffect(() => { if (clockReady) refreshJourney(); }, [clockReady, refreshJourney]);
  useEffect(() => {
    if (voiceStatus !== "idle" || travel.selectedFlight || pendingFlight || flightLookupActive || !flightContext?.illustrativeFlights?.length) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setPreviewIndex((index) => (index + 1) % flightContext.illustrativeFlights.length), 5000);
    return () => window.clearInterval(timer);
  }, [flightContext, flightLookupActive, pendingFlight, travel.selectedFlight, voiceStatus]);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !flightContext?.illustrativeFlights?.length) return;
    const acceptanceState = new URLSearchParams(window.location.search).get("demoState");
    if (!["candidate", "confirmed", "order"].includes(acceptanceState)) return;
    const flight = flightContext.illustrativeFlights.find((item) => item.gate && item.boardingTime && new Date(item.boardingTime).getTime() - demoNowRef.current.getTime() >= 20 * 60_000) || flightContext.illustrativeFlights[0];
    if (acceptanceState === "candidate") { proposeFlight(flight); return; }
    confirmFlight(flight, "acceptance");
    updateTravel({ stage: "at_gate" }, "acceptance");
    if (acceptanceState !== "order") return;
    const product = products[0];
    const nextBasket = { [product.id]: 1 }; basketRef.current = nextBasket; setBasket(nextBasket);
    const summary = basketSummary(nextBasket, productsById);
    const fulfillment = recommendFulfillment({ stage: "at_gate", flight, demoNow: demoNowRef.current });
    const result = { fingerprint: "acceptance-only", summary, travel: { ...travelRef.current, stage: "at_gate", selectedFlight: flight }, fulfillment, pickupLocation: fulfillment.destination, serviceConcept: "Simulated same-journey fulfillment", reviewedAtDemo: demoNowRef.current.toISOString(), reference: "ZRH-120926", confirmedAt: new Date().toISOString(), confirmedAtDemo: new Date(demoNowRef.current.getTime() - 90_000).toISOString(), conceptReservation: true, fulfillmentSimulated: true, submittedExternally: false };
    reservationRef.current = result; orderRef.current = result; setReservation(result); setOrder(result);
  }, [confirmFlight, flightContext, products, productsById, updateTravel]);
  const setComparisonState = useCallback((ids, source = "touch") => {
    const next = [...new Set(ids)].filter((id) => validProductIds.has(id)).slice(0, 2); comparisonRef.current = next; setComparison(next);
    if (source === "touch") queueMicrotask(() => sendInterfaceState("comparison changed")); return next.map((id) => compactProduct(productsById.get(id)));
  }, [productsById, sendInterfaceState, validProductIds]);
  const prepareReview = useCallback(() => {
    const summary = basketSummary(basketRef.current, productsById); const flight = travelRef.current.selectedFlight;
    if (!summary.itemCount) return { ok: false, error: "Add at least one product to your bag." };
    if (!flight) return { ok: false, error: "Confirm your flight before reviewing the order." };
    const eligibility = departureEligibility(flight.scheduledDeparture, demoNowRef.current);
    if (!eligibility.eligible) return { ok: false, error: eligibility.reason };
    const fulfillment = recommendFulfillment({ stage: travelRef.current.stage, flight, demoNow: demoNowRef.current });
    if (fulfillment.method === "none") return { ok: false, error: fulfillment.reason };
    const fingerprint = `${reservationFingerprint(basketRef.current, travelRef.current)}:${flight.id}:${fulfillment.method}:${fulfillment.destination}`;
    const draft = { fingerprint, summary, travel: { ...travelRef.current }, fulfillment, pickupLocation: fulfillment.destination, serviceConcept: "Simulated same-journey fulfillment", reviewedAtDemo: demoNowRef.current.toISOString() };
    reviewRef.current = draft; setReview(draft); setReservationError(""); return { ok: true, review: draft };
  }, [productsById]);
  const createReservation = useCallback(() => {
    const flight = travelRef.current.selectedFlight; const fulfillment = recommendFulfillment({ stage: travelRef.current.stage, flight, demoNow: demoNowRef.current });
    const fingerprint = `${reservationFingerprint(basketRef.current, travelRef.current)}:${flight?.id || "none"}:${fulfillment.method}:${fulfillment.destination}`;
    if (!reviewRef.current || reviewRef.current.fingerprint !== fingerprint) return { ok: false, error: "The bag changed. Review it again before confirming." };
    if (reservationRef.current?.fingerprint === fingerprint) return { ok: true, duplicatePrevented: true, order: { reference: reservationRef.current.reference, fulfillment: customerFulfillment(reservationRef.current.fulfillment), progress: orderProgress(reservationRef.current, demoNowRef.current) } };
    const result = { ...reviewRef.current, reference: `ZRH-${flightDay.serviceDate.slice(0, 4)}-${String(Date.now()).slice(-6)}`, confirmedAt: new Date().toISOString(), confirmedAtDemo: demoNowRef.current.toISOString(), conceptReservation: true, fulfillmentSimulated: true, submittedExternally: false };
    reservationRef.current = result; orderRef.current = result; setReservation(result); setOrder(result); previousOrderStateRef.current = "Preparing"; setApprovalRequest(null); setActivePanel("basket"); return { ok: true, order: { reference: result.reference, fulfillment: customerFulfillment(result.fulfillment), progress: orderProgress(result, demoNowRef.current) } };
  }, [flightDay.serviceDate]);
  const showProductDetails = useCallback((productId) => { if (!validProductIds.has(productId)) return null; selectedIdRef.current = productId; setSelectedId(productId); setActivePanel("detail"); return compactProduct(productsById.get(productId)); }, [productsById, validProductIds]);
  const markCollectionCollected = useCallback(() => {
    const current = orderRef.current;
    if (!current || current.fulfillment?.method !== "collection") return { ok: false, error: "There is no collection order." };
    if (orderProgress(current, demoNowRef.current)?.state !== "Ready for pickup") return { ok: false, error: "The order is not ready for pickup yet." };
    const next = { ...current, collectedAtDemo: demoNowRef.current.toISOString() };
    orderRef.current = next; reservationRef.current = next; setOrder(next); setReservation(next);
    return { ok: true, progress: orderProgress(next, demoNowRef.current) };
  }, []);

  const buildTools = useCallback((tool, z) => {
    const getState = tool({ name: "get_shopping_state", description: "Read products in the viewport, touch-selected product, comparison, shortlist, bag and travel state. Always call before relative phrases. Touch selection is authoritative; ordinals refer to viewport order.", parameters: z.object({}), execute: async () => safe({ ...stateSnapshot(), comparison: comparisonRef.current.map((id) => compactProduct(productsById.get(id))) }) });
    const search = tool({ name: "search_and_show_products", description: "Search and display a small relevant recommendation. Ordinary shopping never requires flight or queue data.", parameters: z.object({ query: z.string().min(1).max(120) }), execute: async ({ query }) => { const matches = searchCatalog(products, query, resultsLimitForTravel(travelRef.current)); if (!matches.length) return safe({ found: false, query, limitation: `No matching item exists in the available ${products.length}-product selection.` }); return safe({ found: true, query, ...(await presentProducts(matches.map((product) => product.id), matches[0].id)) }); } });
    const show = tool({ name: "show_products", description: "Display known products by stable ID.", parameters: z.object({ product_ids: z.array(z.string()).min(1).max(12), focus_product_id: z.string().nullable().default(null) }), execute: async ({ product_ids, focus_product_id }) => safe(await presentProducts(product_ids, focus_product_id)) });
    const details = tool({ name: "show_product_details", description: "Open secondary details for one known product only when the shopper asks.", parameters: z.object({ product_id: z.string() }), execute: async ({ product_id }) => safe({ product: showProductDetails(product_id) || null }) });
    const compare = tool({ name: "compare_products", description: "Compare exactly two known products and open the secondary comparison sheet.", parameters: z.object({ product_ids: z.array(z.string()).length(2) }), execute: async ({ product_ids }) => { const result = setComparisonState(product_ids, "voice"); setActivePanel("compare"); return safe({ comparison: result }); } });
    const keep = tool({ name: "update_shortlist", description: "Add or remove one known item from the secondary saved list.", parameters: z.object({ product_id: z.string(), keep: z.boolean() }), execute: async ({ product_id, keep: shouldKeep }) => safe({ shortlist: mutateShortlist(product_id, shouldKeep, "voice") }) });
    const showSaved = tool({ name: "show_saved_products", description: "Open the secondary saved-products sheet when asked.", parameters: z.object({}), execute: async () => { setActivePanel("saved"); return safe({ shortlist: Object.keys(shortlistRef.current).map((id) => compactProduct(productsById.get(id))).filter(Boolean) }); } });
    const basketTool = tool({ name: "update_demo_order_bag", description: "Add, remove or set quantity for one known product in the demo order bag.", parameters: z.object({ product_id: z.string(), quantity: z.number().int().min(0).max(12), mode: z.enum(["add", "remove", "set"]) }), execute: async ({ product_id, quantity, mode }) => { try { return safe({ ok: true, basket: mutateBasket(product_id, quantity, mode, "voice") }); } catch (error) { return safe({ ok: false, error: error.message }); } } });
    const travelTool = tool({ name: "update_travel_context", description: "Record only traveler-provided location or timing context. Never infer location from flight or time; corrections may move backward.", parameters: z.object({ stage: z.enum(["unknown", "on_the_way", "at_airport", "past_security", "at_gate"]).optional(), minutes_available: z.string().optional(), arrival_estimate: z.string().optional(), needs_checkin: z.boolean().optional() }), execute: async (args) => safe({ travel: updateTravel({ ...(args.stage ? { stage: args.stage } : {}), ...(args.minutes_available !== undefined ? { minutesAvailable: args.minutes_available } : {}), ...(args.arrival_estimate !== undefined ? { arrivalEstimate: args.arrival_estimate } : {}), ...(args.needs_checkin !== undefined ? { needsCheckin: args.needs_checkin } : {}) }, "voice") }) });
    const findFlight = tool({ name: "find_replay_flight", description: "Search the available Zürich departures by flight number, codeshare or destination. Results are proposals only; never lock a flight without explicit confirmation.", parameters: z.object({ query: z.string().min(1).max(80) }), execute: async ({ query }) => { const context = await refreshJourney(query); if (context.error) return safe(context); return safe({ query, matches: (context.flightSearch?.matches || []).map(customerFlight), ambiguous: Boolean(context.flightSearch?.ambiguous), scheduleEnded: context.scheduleEnded }); } });
    const proposeFlightTool = tool({ name: "propose_replay_flight", description: "Put one exact result on screen for verbal confirmation. This does not confirm or lock it.", parameters: z.object({ flight_id: z.string() }), execute: async ({ flight_id }) => { const flight = flightMatchesRef.current.find((item) => item.id === flight_id); return safe(flight ? { proposed: customerFlight(proposeFlight(flight)), requiresExplicitConfirmation: true } : { error: "That flight was not in the latest results." }); } });
    const confirmFlightTool = tool({ name: "confirm_replay_flight", description: "Lock the proposed flight only after the traveler explicitly agrees to the exact flight number, destination and time.", parameters: z.object({ flight_id: z.string() }), execute: async ({ flight_id }) => { const candidate = pendingFlightRef.current; return safe(candidate?.id === flight_id ? { confirmed: customerFlight(confirmFlight(candidate, "voice")) } : { error: "Propose that exact flight and obtain explicit confirmation first." }); } });
    const correctFlightTool = tool({ name: "correct_confirmed_flight", description: "Clear the confirmed flight when the traveler says it is wrong or wants to correct it; then search and reconfirm.", parameters: z.object({}), execute: async () => safe(clearConfirmedFlight()) });
    const assess = tool({ name: "assess_journey", description: "Interpret timing from the confirmed flight, shared clock and traveler-provided location. No live queues or traffic are used.", parameters: z.object({}), execute: async () => { const result = assessReplayJourney({ stage: travelRef.current.stage, flight: travelRef.current.selectedFlight, arrivalEstimate: travelRef.current.arrivalEstimate, minutesAvailable: travelRef.current.minutesAvailable }, demoNowRef.current); return safe({ outcome: result.outcome, availableShoppingMinutes: result.availableShoppingMinutes, recommendation: result.recommendation, known: result.known, missing: result.missing }); } });
    const fulfillmentTool = tool({ name: "recommend_demo_fulfillment", description: "Recommend one supported fulfillment method based on confirmed gate, traveler-provided location and boarding time. Do not present a menu or imply an external transaction.", parameters: z.object({}), execute: async () => safe(customerFulfillment(recommendFulfillment({ stage: travelRef.current.stage, flight: travelRef.current.selectedFlight, demoNow: demoNowRef.current }))) });
    const reviewTool = tool({ name: "review_demo_order", description: "Validate and open one concise order review. This does not confirm the order.", parameters: z.object({}), execute: async () => { const result = prepareReview(); if (result.ok) setActivePanel("review"); return safe(result.ok ? { ok: true, review: { summary: result.review.summary, flight: customerFlight(result.review.travel.selectedFlight), fulfillment: customerFulfillment(result.review.fulfillment) } } : result); } });
    const confirmTool = tool({ name: "confirm_demo_order", description: "Confirm the reviewed order only after explicit traveler approval. Internally creates no payment, stock hold, store message or dispatch.", parameters: z.object({}), needsApproval: true, execute: async () => safe(createReservation()) });
    const collectTool = tool({ name: "mark_demo_collection_collected", description: "Mark a ready collection order collected only when the traveler explicitly says they collected it.", parameters: z.object({}), execute: async () => safe(markCollectionCollected()) });
    return [getState, search, show, details, compare, keep, showSaved, basketTool, travelTool, findFlight, proposeFlightTool, confirmFlightTool, correctFlightTool, assess, fulfillmentTool, reviewTool, confirmTool, collectTool];
  }, [clearConfirmedFlight, confirmFlight, createReservation, markCollectionCollected, mutateBasket, mutateShortlist, prepareReview, presentProducts, products, productsById, proposeFlight, refreshJourney, setComparisonState, showProductDetails, stateSnapshot, updateTravel]);

  const clearVoiceTimeout = useCallback(() => { if (voiceTimeoutRef.current !== null) { window.clearTimeout(voiceTimeoutRef.current); voiceTimeoutRef.current = null; } }, []);
  const clearAudioPoll = useCallback(() => { if (audioPollRef.current !== null) { window.clearInterval(audioPollRef.current); audioPollRef.current = null; } }, []);
  const collectAudioEvidence = useCallback(() => {
    clearAudioPoll(); let samples = 0;
    audioPollRef.current = window.setInterval(async () => {
      const peer = peerConnectionRef.current; if (!peer || samples++ > 24) { clearAudioPoll(); return; }
      try {
        const stats = await peer.getStats(); let bytesReceived = 0; let totalAudioEnergy = 0;
        stats.forEach((entry) => { if (entry.type === "inbound-rtp" && entry.kind === "audio") { bytesReceived += Number(entry.bytesReceived || 0); totalAudioEnergy += Number(entry.totalAudioEnergy || 0); } });
        if (mountedRef.current) setAudioEvidence((current) => ({ ...current, bytesReceived: Math.max(current.bytesReceived, bytesReceived), totalAudioEnergy: Math.max(current.totalAudioEnergy, totalAudioEnergy) }));
      } catch { /* Playback recovery remains available without diagnostics. */ }
    }, 250);
  }, [clearAudioPoll]);
  const ensureAudioPlayback = useCallback(async () => {
    const audio = audioOutputRef.current; if (!audio?.srcObject) return false; audio.muted = false; audio.volume = 1;
    try { await audio.play(); if (mountedRef.current) { setPlaybackState("playing"); setSoundBlocked(false); } return true; }
    catch { if (mountedRef.current) { setPlaybackState("blocked"); setSoundBlocked(true); } return false; }
  }, []);
  const closeVoiceSession = useCallback((message) => {
    clearVoiceTimeout(); clearAudioPoll(); sessionRef.current?.close(); sessionRef.current = null; peerConnectionRef.current = null;
    const audio = audioOutputRef.current; if (audio) { audio.pause(); audio.srcObject = null; }
    setVoiceStatus("idle"); setIsMuted(false); setSoundBlocked(false); setPlaybackState("idle"); setVoiceMessage(message); setApprovalRequest(null);
  }, [clearAudioPoll, clearVoiceTimeout]);

  useEffect(() => {
    const progress = orderProgress(order, demoNow);
    if (!progress) { previousOrderStateRef.current = null; return; }
    if (previousOrderStateRef.current === null) { previousOrderStateRef.current = progress.state; return; }
    const announcement = nextMeaningfulOrderAnnouncement(previousOrderStateRef.current, progress.state, announcedOrderStatesRef.current);
    previousOrderStateRef.current = progress.state;
    if (!announcement) return;
    announcedOrderStatesRef.current = [...announcedOrderStatesRef.current, announcement];
    const session = sessionRef.current;
    if (!session || session.transport.status !== "connected" || isMuted || voiceStatus !== "listening") return;
    try { session.transport.sendMessage(`[One-time order update. Say one short sentence, then listen.] The order is now ${announcement}.`, {}, { triggerResponse: true }); } catch { /* The visible tracker remains authoritative. */ }
  }, [demoNow, isMuted, order, voiceStatus]);

  const startVoice = useCallback(async () => {
    if (sessionRef.current) { const muted = !isMuted; sessionRef.current.mute(muted); setIsMuted(muted); setVoiceStatus(muted ? "muted" : "listening"); setVoiceMessage(muted ? "Microphone muted." : "Listening — speak naturally."); return; }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setVoiceStatus("unsupported"); setVoiceMessage("Voice needs a secure browser with microphone access."); return; }
    setVoiceStatus("connecting"); setVoiceMessage("Connecting…"); setPlaybackState("waiting"); setSoundBlocked(false); setAudioEvidence({ trackReceived: false, modelAudioStarted: false, bytesReceived: 0, totalAudioEnergy: 0 });
    try {
      const [{ RealtimeAgent, RealtimeSession, OpenAIRealtimeWebRTC, tool }, { z }] = await Promise.all([import("@openai/agents/realtime"), import("zod")]);
      const response = await fetch("/api/avolta-demo/realtime-token", { method: "POST", headers: { "Content-Type": "application/json" } }); const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.value) throw new Error(payload.error || "Voice service is unavailable."); if (!isAllowedAvoltaRealtimeModel(payload.model)) throw new Error("Voice model configuration is unavailable.");
      const audioElement = audioOutputRef.current; if (!audioElement) throw new Error("Audio output could not be initialized.");
      const transport = new OpenAIRealtimeWebRTC({ audioElement, changePeerConnection: async (peerConnection) => {
        peerConnectionRef.current = peerConnection;
        peerConnection.addEventListener("track", (event) => { if (event.track?.kind !== "audio") return; if (mountedRef.current) setAudioEvidence((current) => ({ ...current, trackReceived: true })); window.setTimeout(() => { ensureAudioPlayback(); collectAudioEvidence(); }, 0); });
        return peerConnection;
      } });
      const agent = new RealtimeAgent({ name: "Avolta travel shopping concierge", voice: "marin", tools: buildTools(tool, z), instructions: `You are Avolta's warm, concise and confident English voice shopping concierge for Zürich Duty Free at Zürich Airport.

This experience uses one captured airport day on a shared internal clock, and fulfillment has no real-world side effects. Keep that context internal during ordinary shopping and answer truthfully if asked. Browse remains open and product-first, and gifting is only one possible intent.

Rules:
- On the first connection, welcome the traveler to Avolta, offer a concise and inviting picture of how you can help along their journey, then naturally ask about their flight. Never open with replay, simulation or technical setup, and never reduce the welcome to a bare flight-intake question. The opening may use up to three short sentences.
- On a resumed connection, continue from current state without replaying the welcome. If the traveler volunteers flight, location or timing, acknowledge and use it rather than asking again. Do not require a questionnaire before shopping.
- The selection contains ${products.length} public products captured on 2026-09-11. It is not the full assortment and public listing status is not live store stock.
- Use search_and_show_products for needs or options. Never claim images are visible until the tool confirms the on-screen recommendation images. The full ${products.length}-product catalog remains independently browsable.
- Call get_shopping_state before resolving “this,” “that,” ordinals, touch selections or bag changes. Touch selection is authoritative; otherwise use current viewport order.
- Use show_product_details only when asked for details. Save and compare are secondary capabilities; show their sheets only when requested.
- Never invent products, attributes, offers, exclusivity, prices, walking time, gates, stock, pickup eligibility or delivery services.
- A flight result's capturedObservation is end-of-day provenance only, never a status history. Use the shared demo clock and structured replay status; do not announce captured “Departed” text as an earlier-morning fact.
- Identify the flight in one or two clarifying questions: flight number when supplied, otherwise destination and approximate time. Search with find_replay_flight, resolve codeshares or ambiguity, use propose_replay_flight, state the exact flight number, destination and departure time, then wait for explicit assent before confirm_replay_flight.
- Ask present location naturally when it is useful and record only what the traveler says with update_travel_context. Reuse volunteered context instead of repeating the question. Flight and time never prove location. Corrections may move the journey backward. Missing gate or boarding time stays unknown.
- Use assess_journey only for timing advice. Do not treat a delayed departure as shopping time without boarding evidence, and never guarantee a connection or boarding outcome.
- If the traveler asks for a product before flight or location is known, answer that request and show suitable products first. Then gather only the travel context that becomes useful for timing or fulfillment. Otherwise move into shopping with one light question about need, recipient or taste. Give one concrete reason and at most two choices, show them immediately, then ask one useful question or listen. Avoid generic budget scripts and long lists.
- Use recommend_demo_fulfillment to recommend one supported method, not a menu. Connect it briefly to the traveler's situation: browsing with ample time, collection along the route, gate delivery only when the tool supports it, or the gate first when time is too tight. Do not volunteer implementation labels, invent walking time or promise infeasible delivery.
- An order requires products, a confirmed flight, review_demo_order, a concise spoken review of items, quantity, total, destination and arrival or ready time, explicit affirmative approval, then confirm_demo_order. Never imply payment, real stock hold, store message, dispatch or notification, but do not volunteer a technical disclaimer unless asked.
- Ordinary replies after the opening are one or two short sentences. Do not narrate tools, read countdowns constantly or replay missed progress updates.

Initial interface state: ${safe(stateSnapshot())}` });
      const session = new RealtimeSession(agent, { model: payload.model, transport, tracingDisabled: true, config: { outputModalities: ["audio"], audio: { input: { noiseReduction: { type: "near_field" }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" }, turnDetection: { type: "semantic_vad", eagerness: "medium", createResponse: true, interruptResponse: true } }, output: { voice: "marin", speed: 1.03 } } } });
      session.on("audio_start", () => { if (mountedRef.current) { setAudioEvidence((current) => ({ ...current, modelAudioStarted: true })); setVoiceStatus("speaking"); setVoiceMessage("Speaking — interrupt anytime."); ensureAudioPlayback(); collectAudioEvidence(); } });
      session.on("audio_stopped", () => { if (mountedRef.current) { setVoiceStatus(session.muted ? "muted" : "listening"); setVoiceMessage(session.muted ? "Microphone muted." : "Listening — speak naturally."); } });
      session.on("audio_interrupted", () => { if (mountedRef.current) { setVoiceStatus("listening"); setVoiceMessage("Listening — go ahead."); } });
      session.on("tool_approval_requested", (_context, _agent, request) => { if (mountedRef.current) { setApprovalRequest({ type: "voice", request }); setActivePanel("review"); } });
      session.on("error", () => { if (mountedRef.current) { setVoiceStatus("error"); setVoiceMessage("The voice connection had a problem. End it and try again."); } });
      sessionRef.current = session; await session.connect({ apiKey: payload.value }); await ensureAudioPlayback(); collectAudioEvidence();
      clearVoiceTimeout(); voiceTimeoutRef.current = window.setTimeout(() => closeVoiceSession("Five-minute voice session ended. Start again anytime."), VOICE_DEMO_DURATION_MS);
      const startupInstruction = voiceWelcomedRef.current ? RESUMED_VOICE_OPENING : FIRST_VOICE_OPENING;
      voiceWelcomedRef.current = true;
      try {
        const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, voiceWelcomed: true }));
      } catch { /* The in-memory flag still prevents a repeated welcome in this page session. */ }
      setVoiceStatus("listening"); setVoiceMessage("Listening — speak naturally."); session.sendMessage(startupInstruction);
    } catch (error) {
      clearAudioPoll(); sessionRef.current?.close(); sessionRef.current = null; peerConnectionRef.current = null; setVoiceStatus("error");
      setVoiceMessage(error?.name === "NotAllowedError" ? "Microphone access was not granted. Browsing is still available." : (error.message || "Voice service is unavailable."));
    }
  }, [buildTools, clearAudioPoll, clearVoiceTimeout, closeVoiceSession, collectAudioEvidence, ensureAudioPlayback, isMuted, products.length, stateSnapshot]);
  useEffect(() => () => { mountedRef.current = false; clearVoiceTimeout(); clearAudioPoll(); sessionRef.current?.close(); }, [clearAudioPoll, clearVoiceTimeout]);

  const showFullCollection = useCallback((category = "All") => { const matches = category === "All" ? products : products.filter((product) => product.productType === category); presentationSequenceRef.current += 1; visibleIdsRef.current = matches.map((product) => product.id); setVisibleIds(visibleIdsRef.current); setFocusedView(false); setActiveCategory(category); selectedIdRef.current = null; setSelectedId(null); queueMicrotask(() => sendInterfaceState("the browse collection changed")); }, [products, sendInterfaceState]);
  const selectProduct = useCallback((productId) => { presentationSequenceRef.current += 1; selectedIdRef.current = productId; setSelectedId(productId); queueMicrotask(() => sendInterfaceState("the shopper selected a product by touch")); }, [sendInterfaceState]);
  const openTouchReview = () => { const result = prepareReview(); if (!result.ok) setReservationError(result.error); else { setApprovalRequest({ type: "touch" }); setActivePanel("review"); } };
  const confirmApproval = async () => { const pending = approvalRequest; if (pending?.type === "voice") await sessionRef.current?.approve(pending.request.approvalItem); else createReservation(); };
  const rejectApproval = async () => { const pending = approvalRequest; setApprovalRequest(null); setActivePanel("basket"); if (pending?.type === "voice") await sessionRef.current?.reject(pending.request.approvalItem, { message: "The traveler did not confirm." }); };
  const panelLabel = activePanel === "detail" ? "Product details" : activePanel === "saved" ? "Saved products" : activePanel === "compare" ? "Product comparison" : activePanel === "review" ? "Order review" : "Order bag";
  const reviewFlight = review?.travel?.selectedFlight;
  const hasVoiceSession = Boolean(sessionRef.current);
  const hasBasket = basketDetails.itemCount > 0;
  const confirmedFlight = travel.selectedFlight;
  const previewFlight = flightContext?.illustrativeFlights?.[previewIndex % Math.max(1, flightContext?.illustrativeFlights?.length || 1)] || null;
  const displayedFlight = confirmedFlight || pendingFlight || previewFlight;
  const displayedFlightStatus = replayFlightStatus(displayedFlight, demoNow);
  const displayedBoarding = boardingCountdown(displayedFlight, demoNow);
  const orderState = orderProgress(order, demoNow);
  const countdowns = confirmedFlight && order ? pairedCountdowns(confirmedFlight, order, demoNow) : null;
  const scheduleEnded = clockAnchorRef.current ? replayClockState(clockAnchorRef.current, new Date()).scheduleEnded : false;
  const flightDisplayState = confirmedFlight ? "confirmed" : pendingFlight ? "candidate" : voiceStatus !== "idle" ? "focused" : "idle";
  const displayedDestination = displayedFlight ? ((confirmedFlight || pendingFlight) ? `ZRH → ${displayedFlight.destinationCode || displayedFlight.destination || "—"}` : (displayedFlight.destination || displayedFlight.destinationCode || "—")) : "—";

  return (
    <main className={styles.page} data-audio-track={audioEvidence.trackReceived ? "received" : "none"} data-audio-model={audioEvidence.modelAudioStarted ? "started" : "waiting"} data-audio-bytes={audioEvidence.bytesReceived} data-audio-energy={audioEvidence.totalAudioEnergy} data-audio-playback={playbackState}>
      <audio ref={audioOutputRef} className={styles.audioOutput} autoPlay playsInline preload="auto" data-avolta-audio-output data-playback={playbackState} />
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.brandMark}>A</span><div><strong>ZÜRICH DUTY FREE</strong><small>Avolta</small></div></div>
        <div className={styles.location}><MapPin size={15} aria-hidden="true" /><div><strong>Zürich Airport</strong></div></div>
      </header>

      <section className={styles.productSurface} aria-label="Zürich Duty Free products">
        <div className={styles.contextRail} data-has-order={Boolean(order)}>
          <article className={styles.flightCard} data-flight-state={flightDisplayState} data-flight-id={displayedFlight?.id || "none"}>
            <div className={styles.departureTopline}><span>Departures</span>{pendingFlight && <b>Your flight?</b>}{confirmedFlight && <b>{displayedFlightStatus.label}</b>}</div>
            {displayedFlight && (!scheduleEnded || confirmedFlight || pendingFlight) ? <div className={styles.departureBoard} key={`${flightDisplayState}-${displayedFlight.id || displayedFlight.flightNumber}`}>
              <div className={styles.departureHead}><span>Time</span><span>Destination</span><span>Flight</span><span>Gate</span></div>
              <div className={styles.departureRow}><time>{formatClock(displayedFlight.scheduledDeparture)}</time><strong>{displayedDestination}</strong><span>{displayedFlight.flightNumber || "—"}</span><b>{displayedFlight.gate || "—"}</b></div>
            </div> : <div className={styles.noDepartures}>No more departures</div>}
            {confirmedFlight && <div className={styles.contextDetails}><span>{displayedFlightStatus.label}</span><strong>{displayedBoarding.label}</strong></div>}
            {confirmedFlight && <div className={styles.journeyTrack} aria-label={`Journey: ${journeyStageLabel(travel.stage)}`}><span data-active={travel.stage === "unknown"}>Unknown</span>{["on_the_way", "at_airport", "past_security", "at_gate"].map((stage) => <span key={stage} data-active={travel.stage === stage}>{journeyStageLabel(stage)}</span>)}</div>}
          </article>
          {order && orderState && <article className={styles.orderCard}>
            <div className={styles.contextTopline}><span>{order.fulfillment.method === "gate_delivery" ? "Gate delivery" : "Collection"}</span><b>{order.reference}</b></div>
            <div className={styles.orderMain}><strong>{orderState.state}</strong><span>{order.fulfillment.destination}</span></div>
            <div className={styles.progressTrack}>{orderState.path.map((step, index) => <span key={step} data-complete={index <= orderState.stateIndex}><i />{step}</span>)}</div>
            {countdowns && <div className={styles.pairedCountdown}><span>{countdowns.boarding.label}</span><strong>{countdowns.order.targetLabel}</strong></div>}
          </article>}
        </div>
        {focusedView && <div className={styles.resultsContext}><span>Selected for you</span><button type="button" onClick={() => showFullCollection("All")}>All products</button></div>}
        <div className={styles.productGrid}>{visibleProducts.map((product, index) => { const image = product.images[0]; const failed = imageFailures.has(product.id); const quantity = basket[product.id] || 0; const selected = selectedId === product.id; return <article className={styles.productCard} data-product-card={product.id} data-selected={selected} key={product.id}><button type="button" className={styles.productSelect} onClick={() => selectProduct(product.id)} aria-label={`Select ${product.vendor} ${product.name} for voice reference`} aria-pressed={selected}><div className={styles.imageWrap}>{!failed ? <Image data-product-image={product.id} src={image.localPath} alt={image.alt} fill loading={index < 10 ? "eager" : "lazy"} sizes="(max-width: 760px) 50vw, (max-width: 860px) 33vw, (max-width: 1100px) 25vw, 240px" onError={(event) => { event.currentTarget.dataset.failed = "true"; imageFailuresRef.current.add(product.id); setImageFailures((current) => new Set(current).add(product.id)); }} /> : <span className={styles.imageFallback}>Photo unavailable</span>}<div className={styles.productText}><small>{product.vendor}</small><h2>{product.name}</h2><span>{product.variant}</span><strong>{formatMoney(product.priceChf)}</strong></div>{product.promotionEvidence && <i>{product.promotionEvidence}</i>}</div></button><div className={styles.cardAction}>{quantity ? <div className={styles.stepper} aria-label={`${product.name} quantity`}><button type="button" onClick={() => mutateBasket(product.id, 1, "remove")} aria-label={`Remove one ${product.name}`}><Minus size={15} aria-hidden="true" /></button><span>{quantity}</span><button type="button" onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add one ${product.name}`}><Plus size={15} aria-hidden="true" /></button></div> : <button type="button" onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add ${product.vendor} ${product.name} to bag`}><Plus size={31} strokeWidth={2.5} aria-hidden="true" /></button>}</div></article>; })}</div>
      </section>

      <section className={styles.controlDock} data-status={voiceStatus} data-has-session={hasVoiceSession} data-has-basket={hasBasket} aria-label="Shopping controls">
        {(voiceStatus === "error" || voiceStatus === "unsupported") && <p className={styles.voiceNotice} role="status" aria-live="polite">{voiceMessage}</p>}
        <div className={styles.dockRow}>
          <button className={styles.voiceAction} type="button" onClick={startVoice} disabled={voiceStatus === "connecting"} aria-label={hasVoiceSession ? (isMuted ? "Unmute microphone" : "Mute microphone") : "Talk to Order"}><span className={styles.voiceGlyph}>{isMuted ? <MicOff /> : <Mic />}</span><span className={styles.voiceLabel}><strong>{voiceStatus === "idle" ? "Talk to Order" : voiceMessage}</strong></span>{voiceStatus === "connecting" && <span className={styles.connectingIndicator} />}{hasVoiceSession && voiceStatus !== "connecting" && <span className={styles.readyIndicator} />}</button>
          {soundBlocked && <button className={styles.soundButton} type="button" onClick={ensureAudioPlayback}>Enable sound</button>}
          {hasVoiceSession && <button className={styles.endVoice} type="button" onClick={() => closeVoiceSession("Talk to Order")} aria-label="End voice session"><X size={17} /></button>}
          {hasBasket && <button className={styles.basketTrigger} type="button" onClick={() => setActivePanel("basket")} aria-label={`Order bag, ${basketDetails.itemCount} ${basketDetails.itemCount === 1 ? "item" : "items"}, ${formatMoney(basketDetails.total)}`}><ShoppingBag size={17} /><span>{basketDetails.itemCount}</span><strong>{formatMoney(basketDetails.total)}</strong></button>}
        </div>
        {voiceStatus !== "error" && voiceStatus !== "unsupported" && <span className={styles.visuallyHidden} role="status" aria-live="polite">{voiceMessage}</span>}
      </section>

      {activePanel && <div className={styles.sheetBackdrop} onMouseDown={() => setActivePanel(null)}><section className={styles.sheet} role="dialog" aria-modal="true" aria-label={panelLabel} onMouseDown={(event) => event.stopPropagation()}><button className={styles.sheetClose} type="button" onClick={() => setActivePanel(null)} aria-label="Close"><X size={20} /></button>
        {activePanel === "detail" && selectedProduct && <><p className={styles.eyebrow}>Product details</p><h2>{selectedProduct.name}</h2><p className={styles.sheetBrand}>{selectedProduct.vendor}</p><div className={styles.detailImage}><Image src={selectedProduct.images[0].localPath} alt={selectedProduct.images[0].alt} fill sizes="420px" /></div><div className={styles.detailPrice}><strong>{formatMoney(selectedProduct.priceChf)}</strong>{selectedProduct.compareAtPriceChf && <del>{formatMoney(selectedProduct.compareAtPriceChf)}</del>}<span>{selectedProduct.variant}</span></div>{selectedProduct.description && <p className={styles.detailDescription}>{selectedProduct.description}</p>}<div className={styles.secondaryActions}><button type="button" data-active={shortlist[selectedProduct.id]} onClick={() => mutateShortlist(selectedProduct.id, !shortlist[selectedProduct.id])}><Heart size={17} fill={shortlist[selectedProduct.id] ? "currentColor" : "none"} /> {shortlist[selectedProduct.id] ? "Saved" : "Save"}</button><button type="button" data-active={comparison.includes(selectedProduct.id)} onClick={() => { const next = comparison.includes(selectedProduct.id) ? comparison.filter((id) => id !== selectedProduct.id) : [...comparison, selectedProduct.id]; setComparisonState(next); if (next.length === 2) setActivePanel("compare"); }}><GitCompareArrows size={17} /> Compare</button></div><button className={styles.primarySheetAction} type="button" onClick={() => mutateBasket(selectedProduct.id, 1, "add")}><Plus size={17} /> Add to bag</button><a className={styles.detailSource} href={selectedProduct.sourceUrl} target="_blank" rel="noreferrer">View product source</a></>}
        {activePanel === "saved" && <><p className={styles.eyebrow}>Saved for later</p><h2>{Object.keys(shortlist).length || "No"} saved</h2>{!Object.keys(shortlist).length ? <p className={styles.empty}>Ask the shop to save a product, or use Save inside product details.</p> : <div className={styles.sheetList}>{Object.keys(shortlist).map((id) => { const product = productsById.get(id); return product && <button type="button" key={id} onClick={() => showProductDetails(id)}><span>{product.vendor}<strong>{product.name}</strong><small>{product.variant}</small></span><b>{formatMoney(product.priceChf)}</b></button>; })}</div>}</>}
        {activePanel === "compare" && <><p className={styles.eyebrow}>Compare</p><h2>{comparison.length || "No"} selected</h2>{comparison.length < 2 && <p className={styles.empty}>Choose Compare inside the details of two products, or ask by voice.</p>}<div className={styles.compareList}>{comparison.map((id) => { const product = productsById.get(id); return product && <article key={id}><div className={styles.compareImage}><Image src={product.images[0].localPath} alt={product.images[0].alt} fill sizes="180px" /></div><small>{product.vendor}</small><h3>{product.name}</h3><p>{product.variant}</p><strong>{formatMoney(product.priceChf)}</strong><button type="button" onClick={() => setComparisonState(comparison.filter((item) => item !== id))}>Remove</button></article>; })}</div></>}
        {activePanel === "basket" && <><p className={styles.eyebrow}>Order bag</p><h2>{basketDetails.itemCount || "No"} {basketDetails.itemCount === 1 ? "item" : "items"}</h2>{reservation && <div className={styles.reservationResult}><span><Check size={16} /> Order confirmed</span><strong>{reservation.reference}</strong><p>{reservation.fulfillment.destination}</p><small>{orderProgress(reservation, demoNow)?.state}</small></div>}{!basketDetails.itemCount ? <p className={styles.empty}>Add a product when something catches your eye.</p> : <><div className={styles.basketItems}>{basketDetails.items.map((item) => <div className={styles.basketItem} key={item.productId}><div><strong>{item.brand} {item.name}</strong><small>{item.variant} · {formatMoney(item.unitPrice)}</small></div><div><b>{formatMoney(item.lineTotal)}</b><div className={styles.miniStepper}><button type="button" onClick={() => mutateBasket(item.productId, 1, "remove")}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => mutateBasket(item.productId, 1, "add")}><Plus size={13} /></button></div></div></div>)}</div>{travel.selectedFlight ? <p className={styles.flightReuse}>Confirmed {travel.selectedFlight.flightNumber || "flight"} to {travel.destination || travel.selectedFlight.destinationCode || "destination"}{travel.gate ? ` · Gate ${travel.gate}` : " · gate not assigned"}.</p> : <p className={styles.flightReuse}>Confirm your flight with the concierge before ordering.</p>}{reservationError && <p className={styles.error}>{reservationError}</p>}<div className={styles.total}><span>Total</span><strong>{formatMoney(basketDetails.total)}</strong></div><button className={styles.reviewButton} type="button" onClick={openTouchReview}>Review order</button></>}</>}
        {activePanel === "review" && review && <><p className={styles.eyebrow}>Review order</p><h2>{review.fulfillment.method === "gate_delivery" ? "Gate delivery" : "Collection"}</h2><div className={styles.pickup}><MapPin /><div><strong>{review.fulfillment.destination}</strong><span>{reviewFlight?.flightNumber || "Confirmed flight"} to {reviewFlight?.destination || reviewFlight?.destinationCode || "destination"}{reviewFlight?.gate ? ` · Gate ${reviewFlight.gate}` : ""}</span><span>{review.fulfillment.method === "gate_delivery" ? "Arrives" : "Ready"} in {review.fulfillment.etaMinutes} min</span></div></div><div className={styles.reviewItems}>{review.summary.items.map((item) => <p key={item.productId}><span>{item.quantity} × {item.brand} {item.name}<small>{item.variant}</small></span><strong>{formatMoney(item.lineTotal)}</strong></p>)}</div><div className={styles.total}><span>Total</span><strong>{formatMoney(review.summary.total)}</strong></div><div className={styles.reviewActions}><button type="button" onClick={rejectApproval}>Change bag</button><button type="button" onClick={confirmApproval}><Check size={17} /> Confirm order</button></div></>}
      </section></div>}
    </main>
  );
}

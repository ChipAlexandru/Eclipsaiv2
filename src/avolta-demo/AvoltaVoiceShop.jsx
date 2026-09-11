"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, GitCompareArrows, Heart, MapPin, Mic, MicOff, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import {
  basketSummary, changeQuantity, compactProduct, departureEligibility,
  reservationFingerprint, resultsLimitForTravel, searchCatalog, shoppingStateSnapshot,
} from "./shopping.mjs";
import { isAllowedAvoltaRealtimeModel } from "./realtimeConfig.mjs";
import { assessJourney, nextZurichMidnight } from "./liveContext.mjs";
import styles from "./avoltaVoiceShop.module.css";

const IMAGE_WAIT_MS = 1800;
const VOICE_DEMO_DURATION_MS = 5 * 60 * 1000;
const STORAGE_KEY = "avolta-zrh-voice-shop-v2";
const DEFAULT_TRAVEL = { stage: "on_the_way", minutesAvailable: "", departureDateTime: "", gate: "", destination: "", flightQuery: "", arrivalEstimate: "", needsCheckin: false, selectedFlight: null };

function formatMoney(value, currency = "CHF") {
  return new Intl.NumberFormat("en-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);
}

function safe(value) { return JSON.stringify(value); }

function dateTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(date).filter(({ type }) => type !== "literal").reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function AvoltaVoiceShop({ catalog }) {
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
  const [voiceMessage, setVoiceMessage] = useState("Start a natural conversation.");
  const [isMuted, setIsMuted] = useState(false);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [review, setReview] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState("");
  const [imageFailures, setImageFailures] = useState(() => new Set());
  const [storageReady, setStorageReady] = useState(false);

  const sessionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
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
  const imageFailuresRef = useRef(new Set());
  const journeyContextRef = useRef(null);
  const flightMatchesRef = useRef([]);

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const selectedProduct = selectedId ? productsById.get(selectedId) : null;
  const categories = ["All", ...new Set(products.map((product) => product.productType))];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored?.shortlist) { shortlistRef.current = stored.shortlist; setShortlist(stored.shortlist); }
      if (stored?.reservation && new Date(stored.travelExpiresAt).getTime() > Date.now()) { reservationRef.current = stored.reservation; setReservation(stored.reservation); }
    } catch { /* Keep a clean local demo state. */ }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (storageReady) localStorage.setItem(STORAGE_KEY, JSON.stringify({ shortlist, reservation, travelExpiresAt: nextZurichMidnight().toISOString() }));
  }, [reservation, shortlist, storageReady]);

  const currentViewportIds = useCallback(() => {
    if (typeof document === "undefined") return [];
    const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
    return [...document.querySelectorAll("[data-product-card]")]
      .filter((card) => { const rect = card.getBoundingClientRect(); return rect.bottom > 0 && rect.top < viewportBottom; })
      .map((card) => card.dataset.productCard)
      .filter((id) => validProductIds.has(id))
      .slice(0, 8);
  }, [validProductIds]);

  const stateSnapshot = useCallback(() => {
    const viewportIds = currentViewportIds();
    return { ...shoppingStateSnapshot({
      visibleIds: viewportIds.length ? viewportIds : (selectedIdRef.current ? [selectedIdRef.current] : visibleIdsRef.current.slice(0, 8)),
      selectedId: selectedIdRef.current, shortlist: shortlistRef.current, basket: basketRef.current, travel: travelRef.current,
    }, productsById), browseScope: focusedView ? "voice recommendation" : activeCategory, browseProductCount: visibleIdsRef.current.length };
  }, [activeCategory, currentViewportIds, focusedView, productsById]);

  const sendInterfaceState = useCallback((reason) => {
    const session = sessionRef.current;
    if (!session || session.transport.status !== "connected") return;
    try { session.transport.sendMessage(`[Interface state after ${reason}; do not respond unless asked.] ${safe(stateSnapshot())}`, {}, { triggerResponse: false }); }
    catch { /* The state tool remains authoritative. */ }
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
        if (image?.complete && image.naturalWidth > 0) displayedIds.push(id);
        else if (image?.dataset.failed === "true" || imageFailuresRef.current.has(id)) failedIds.push(id);
      }
      if (displayedIds.length + failedIds.length === viewportIds.length) return { stale: false, displayedIds, failedIds, checkedIds: viewportIds };
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    const displayedIds = []; const failedIds = [];
    for (const id of viewportIds) {
      const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
      if (image?.complete && image.naturalWidth > 0) displayedIds.push(id); else failedIds.push(id);
    }
    return { stale: false, displayedIds, failedIds, checkedIds: viewportIds, timedOut: true };
  }, []);

  const presentProducts = useCallback(async (requestedIds, focusId = null) => {
    const ids = [...new Set(requestedIds)].filter((id) => validProductIds.has(id)).slice(0, 20);
    if (!ids.length) return { displayed: false, error: "No products from the captured selection matched." };
    const sequence = ++presentationSequenceRef.current;
    visibleIdsRef.current = ids; setVisibleIds(ids);
    setFocusedView(true); setActiveCategory("All");
    const nextSelected = focusId && ids.includes(focusId) ? focusId : ids[0];
    selectedIdRef.current = nextSelected; setSelectedId(nextSelected);
    requestAnimationFrame(() => document.querySelector(`.${styles.catalogue}`)?.scrollIntoView({ behavior: "auto", block: "start" }));
    const result = await waitForDisplayedImages(ids, sequence);
    if (result.stale) return { displayed: false, stale: true, message: "A newer selection replaced these results." };
    return {
      displayed: result.displayedIds.length === result.checkedIds.length,
      displayedProducts: result.displayedIds.map((id) => compactProduct(productsById.get(id))),
      selectedProduct: compactProduct(productsById.get(nextSelected)), failedImageProductIds: result.failedIds,
      recommendationProductCount: ids.length,
      imageReadinessScope: "first products in the current recommendation viewport",
      message: result.displayedIds.length === result.checkedIds.length ? "The first recommendation images in the current viewport are displayed." : "Some on-screen images did not load; only displayedProducts are confirmed visible.",
    };
  }, [productsById, validProductIds, waitForDisplayedImages]);

  const invalidateReview = useCallback(() => { reviewRef.current = null; setReview(null); setReservationError(""); }, []);

  const mutateBasket = useCallback((productId, quantity, mode, source = "touch") => {
    const next = changeQuantity(basketRef.current, productId, quantity, mode, validProductIds);
    basketRef.current = next; setBasket(next); invalidateReview();
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a basket touch action"));
    return basketSummary(next, productsById);
  }, [invalidateReview, productsById, sendInterfaceState, validProductIds]);

  const mutateShortlist = useCallback((productId, keep, source = "touch") => {
    if (!validProductIds.has(productId)) throw new Error("Unknown product ID.");
    const next = { ...shortlistRef.current };
    if (keep) next[productId] = true; else delete next[productId];
    shortlistRef.current = next; setShortlist(next);
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a shortlist touch action"));
    return Object.keys(next).map((id) => compactProduct(productsById.get(id))).filter(Boolean);
  }, [productsById, sendInterfaceState, validProductIds]);

  const updateTravel = useCallback((patch, source = "touch") => {
    const next = { ...travelRef.current, ...patch };
    travelRef.current = next; setTravel(next); invalidateReview();
    if (source === "touch") queueMicrotask(() => sendInterfaceState("travel context changed"));
    return next;
  }, [invalidateReview, sendInterfaceState]);

  const selectFlight = useCallback((flight, source = "touch") => {
    if (!flight) return null;
    updateTravel({ selectedFlight: flight, destination: flight.destination || "", gate: flight.gate || "", departureDateTime: flight.scheduledDeparture || "" }, source);
    return flight;
  }, [updateTravel]);

  const refreshJourney = useCallback(async (query = "") => {
    try {
      const response = await fetch("/api/avolta-demo/journey-context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Live airport context is unavailable.");
      journeyContextRef.current = payload;
      const matches = payload.flightSearch?.matches || [];
      flightMatchesRef.current = matches;
      if (matches.length === 1) selectFlight(matches[0], "touch");
      else if (query) updateTravel({ selectedFlight: null, destination: "", gate: "", departureDateTime: "" }, "touch");
      return payload;
    } catch (error) {
      return { error: error.message || "Live airport context is unavailable." };
    }
  }, [selectFlight, updateTravel]);

  useEffect(() => { refreshJourney(); }, [refreshJourney]);

  const setComparisonState = useCallback((ids, source = "touch") => {
    const next = [...new Set(ids)].filter((id) => validProductIds.has(id)).slice(0, 2);
    comparisonRef.current = next; setComparison(next);
    if (source === "touch") queueMicrotask(() => sendInterfaceState("comparison changed"));
    return next.map((id) => compactProduct(productsById.get(id)));
  }, [productsById, sendInterfaceState, validProductIds]);

  const prepareReview = useCallback(() => {
    const summary = basketSummary(basketRef.current, productsById);
    const eligibility = departureEligibility(travelRef.current.departureDateTime);
    if (!summary.itemCount) return { ok: false, error: "Add at least one product to your reservation basket." };
    if (!eligibility.eligible) return { ok: false, error: eligibility.reason };
    const draft = { fingerprint: reservationFingerprint(basketRef.current, travelRef.current), summary, travel: { ...travelRef.current },
      pickupLocation: "Zürich Duty Free departure shop", serviceConcept: "Quick pickup during the current journey", reviewedAt: new Date().toISOString() };
    reviewRef.current = draft; setReview(draft); setReservationError("");
    return { ok: true, review: draft };
  }, [productsById]);

  const createReservation = useCallback(() => {
    const fingerprint = reservationFingerprint(basketRef.current, travelRef.current);
    if (!reviewRef.current || reviewRef.current.fingerprint !== fingerprint) return { ok: false, error: "The draft changed. Review it again before confirming." };
    if (reservationRef.current?.fingerprint === fingerprint) return { ok: true, duplicatePrevented: true, reservation: reservationRef.current };
    const result = { ...reviewRef.current, reference: `ZRH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      confirmedAt: new Date().toISOString(), expiresAt: nextZurichMidnight().toISOString(), conceptReservation: true, submittedExternally: false };
    reservationRef.current = result; setReservation(result); setApprovalRequest(null); setActivePanel("basket");
    return { ok: true, reservation: result };
  }, []);

  const buildTools = useCallback((tool, z) => {
    const getState = tool({ name: "get_shopping_state", description: "Read the products currently in the viewport, the touch-selected product, comparison, shortlist, basket and travel state. Always call before resolving relative phrases such as this one or the second one. The touch-selected product is authoritative; ordinals refer to viewport order, never an offscreen catalog index.", parameters: z.object({}), execute: async () => safe({ ...stateSnapshot(), comparison: comparisonRef.current.map((id) => compactProduct(productsById.get(id))) }) });
    const search = tool({ name: "search_and_show_products", description: "Search and display a small relevant recommendation from the captured Zürich Duty Free selection. Use expressed needs, categories, brands or budgets. This does not replace the shopper's access to the full catalog.", parameters: z.object({ query: z.string().min(1).max(120) }), execute: async ({ query }) => {
      const matches = searchCatalog(products, query, resultsLimitForTravel(travelRef.current));
      if (!matches.length) return safe({ found: false, query, limitation: `No matching item exists in the captured ${products.length}-product demo selection.` });
      return safe({ found: true, query, ...(await presentProducts(matches.map((p) => p.id), matches[0].id)) });
    } });
    const show = tool({ name: "show_products", description: "Display known products by stable ID.", parameters: z.object({ product_ids: z.array(z.string()).min(1).max(12), focus_product_id: z.string().nullable().default(null) }), execute: async ({ product_ids, focus_product_id }) => safe(await presentProducts(product_ids, focus_product_id)) });
    const compare = tool({ name: "compare_products", description: "Compare exactly two known product IDs and synchronize the interface comparison. Read shopping state first for relative references.", parameters: z.object({ product_ids: z.array(z.string()).length(2) }), execute: async ({ product_ids }) => safe({ comparison: setComparisonState(product_ids, "voice") }) });
    const keep = tool({ name: "update_shortlist", description: "Add or remove one known item from the persistent shortlist.", parameters: z.object({ product_id: z.string(), keep: z.boolean() }), execute: async ({ product_id, keep: shouldKeep }) => safe({ shortlist: mutateShortlist(product_id, shouldKeep, "voice") }) });
    const basketTool = tool({ name: "update_reservation_basket", description: "Add, remove or set quantity for one known product in the reservation basket.", parameters: z.object({ product_id: z.string(), quantity: z.number().int().min(0).max(12), mode: z.enum(["add", "remove", "set"]) }), execute: async ({ product_id, quantity, mode }) => { try { return safe({ ok: true, basket: mutateBasket(product_id, quantity, mode, "voice") }); } catch (error) { return safe({ ok: false, error: error.message }); } } });
    const travelTool = tool({ name: "update_travel_context", description: "Update traveler-provided journey context. Ask one necessary question at a time; never infer stage, location or boarding safety.", parameters: z.object({ stage: z.enum(["on_the_way", "before_security", "airside", "near_gate"]).optional(), minutes_available: z.string().optional(), departure_date_time: z.string().optional(), arrival_estimate: z.string().optional(), needs_checkin: z.boolean().optional(), gate: z.string().optional(), destination: z.string().optional() }), execute: async (args) => safe({ travel: updateTravel({ ...(args.stage ? { stage: args.stage } : {}), ...(args.minutes_available !== undefined ? { minutesAvailable: args.minutes_available } : {}), ...(args.departure_date_time !== undefined ? { departureDateTime: args.departure_date_time } : {}), ...(args.arrival_estimate !== undefined ? { arrivalEstimate: args.arrival_estimate } : {}), ...(args.needs_checkin !== undefined ? { needsCheckin: args.needs_checkin } : {}), ...(args.gate !== undefined ? { gate: args.gate } : {}), ...(args.destination !== undefined ? { destination: args.destination } : {}) }, "voice") }) });
    const findFlight = tool({ name: "find_today_flight", description: "Find today's Zurich departure by exact flight number, codeshare, destination code or destination name. Never select an ambiguous result.", parameters: z.object({ query: z.string().min(1).max(80) }), execute: async ({ query }) => safe(await refreshJourney(query)) });
    const chooseFlight = tool({ name: "select_today_flight", description: "Select one flight from the most recent flight search by its exact stable id.", parameters: z.object({ flight_id: z.string() }), execute: async ({ flight_id }) => { const flight = flightMatchesRef.current.find((item) => item.id === flight_id); return safe(flight ? { selected: selectFlight(flight, "voice") } : { error: "That flight was not in the latest search results." }); } });
    const assess = tool({ name: "assess_journey", description: "Return the deterministic journey recommendation using selected flight, stage, traveler arrival estimate and quietly cached airport queues. Use only for context-sensitive timing advice, never as a prerequisite for ordinary product browsing.", parameters: z.object({}), execute: async () => { let context = journeyContextRef.current; if (!context) { const refreshed = await refreshJourney(""); if (refreshed.error) return safe({ available: false, uncertainty: "Live airport context is unavailable; continue shopping without timing claims." }); context = refreshed; } return safe(assessJourney({ stage: travelRef.current.stage, flight: travelRef.current.selectedFlight, arrivalEstimate: travelRef.current.arrivalEstimate, minutesAvailable: travelRef.current.minutesAvailable, needsCheckin: travelRef.current.needsCheckin, queues: context?.queues })); } });
    const reviewTool = tool({ name: "review_departure_reservation", description: "Validate and prepare the current basket and travel details for quick departure-pickup review. This does not confirm anything.", parameters: z.object({}), execute: async () => safe(prepareReview()) });
    const confirmTool = tool({ name: "confirm_departure_reservation", description: "Confirm the already reviewed concept reservation. Requires explicit shopper approval and never submits to the store.", parameters: z.object({}), needsApproval: true, execute: async () => safe(createReservation()) });
    return [getState, search, show, compare, keep, basketTool, travelTool, findFlight, chooseFlight, assess, reviewTool, confirmTool];
  }, [createReservation, mutateBasket, mutateShortlist, prepareReview, presentProducts, products, productsById, refreshJourney, selectFlight, setComparisonState, stateSnapshot, updateTravel]);

  const clearVoiceTimeout = useCallback(() => { if (voiceTimeoutRef.current !== null) { window.clearTimeout(voiceTimeoutRef.current); voiceTimeoutRef.current = null; } }, []);
  const closeVoiceSession = useCallback((message) => { clearVoiceTimeout(); sessionRef.current?.close(); sessionRef.current = null; setVoiceStatus("idle"); setIsMuted(false); setVoiceMessage(message); setApprovalRequest(null); }, [clearVoiceTimeout]);

  const startVoice = useCallback(async () => {
    if (sessionRef.current) { const muted = !isMuted; sessionRef.current.mute(muted); setIsMuted(muted); setVoiceStatus(muted ? "muted" : "listening"); setVoiceMessage(muted ? "Microphone muted." : "Listening — speak naturally."); return; }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setVoiceStatus("unsupported"); setVoiceMessage("Voice needs a secure browser with microphone access."); return; }
    setVoiceStatus("connecting"); setVoiceMessage("Connecting securely…");
    try {
      const [{ RealtimeAgent, RealtimeSession, tool }, { z }] = await Promise.all([import("@openai/agents/realtime"), import("zod")]);
      const response = await fetch("/api/avolta-demo/realtime-token", { method: "POST", headers: { "Content-Type": "application/json" } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.value) throw new Error(payload.error || "Voice service is unavailable.");
      if (!isAllowedAvoltaRealtimeModel(payload.model)) throw new Error("Voice model configuration is unavailable.");
      const agent = new RealtimeAgent({ name: "Zürich Duty Free voice shopping concept", voice: "marin", tools: buildTools(tool, z), instructions: `You are a concise, warm English voice shopping companion for Zürich Duty Free, presented as an Avolta concept.

Open-ended discovery comes first. Briefly explain that you can match today's flight, account for the traveler's actual stage and live airport queues, then help them discover and choose. Invite their destination or flight naturally, but let them skip straight to browsing. Gifting is one intent, never the default.

Rules:
- The selection contains ${products.length} public products captured on 2026-09-11. It is not the full assortment and public listing status is not live store stock.
- Use search_and_show_products for needs or options. Never claim images are visible until the tool confirms the on-screen recommendation images. The full ${products.length}-product catalog remains independently browsable.
- Call get_shopping_state before resolving “this,” “that,” ordinals, touch selections, or basket changes. Touch selection is authoritative; otherwise use current viewport order, never an offscreen global index.
- Never invent products, attributes, offers, exclusivity, prices, walking time, gates, stock or pickup eligibility. Offer a supported alternative when data is missing.
- For today's flight, use find_today_flight and explicitly resolve ambiguous destinations or codeshares with the traveler. A flight never proves passenger location. Missing gate or boarding time is normal; never invent either.
- Use assess_journey only before context-sensitive timing advice, not for ordinary product discovery, comparison, saving or basket changes. Treat stale/unavailable readings and missing facts as unknown, never zero. A later estimated departure does not create shopping time.
- Ordinary replies are one or two short sentences. Give one concrete, source-backed reason, at most two choices, then ask one useful question or listen. Remember rejections and never read card text aloud.
- This concept proposes quick pickup during the traveler’s current journey; it does not inherit the current public Reserve & Collect advance-booking rules. A reservation requires products, an upcoming departure, review_departure_reservation, an explicit affirmative confirmation, then confirm_departure_reservation. Never invent an exact ready time or imply a store submission, stock hold, payment or notification.
- Keep the concept-reservation distinction discreet during browsing and accurate at confirmation.

Initial interface state: ${safe(stateSnapshot())}` });
      const session = new RealtimeSession(agent, { model: payload.model, transport: "webrtc", tracingDisabled: true, config: { outputModalities: ["audio"], audio: { input: { noiseReduction: { type: "near_field" }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" }, turnDetection: { type: "semantic_vad", eagerness: "medium", createResponse: true, interruptResponse: true } }, output: { voice: "marin", speed: 1.03 } } } });
      session.on("audio_start", () => { if (mountedRef.current) { setVoiceStatus("speaking"); setVoiceMessage("Speaking — interrupt anytime."); } });
      session.on("audio_stopped", () => { if (mountedRef.current) { setVoiceStatus(session.muted ? "muted" : "listening"); setVoiceMessage(session.muted ? "Microphone muted." : "Listening — speak naturally."); } });
      session.on("audio_interrupted", () => { if (mountedRef.current) { setVoiceStatus("listening"); setVoiceMessage("Listening — go ahead."); } });
      session.on("tool_approval_requested", (_context, _agent, request) => { if (mountedRef.current) setApprovalRequest({ type: "voice", request }); });
      session.on("error", () => { if (mountedRef.current) { setVoiceStatus("error"); setVoiceMessage("The voice connection had a problem. End it and try again."); } });
      sessionRef.current = session; await session.connect({ apiKey: payload.value });
      clearVoiceTimeout(); voiceTimeoutRef.current = window.setTimeout(() => closeVoiceSession("Five-minute voice session ended. Start again anytime."), VOICE_DEMO_DURATION_MS);
      setVoiceStatus("listening"); setVoiceMessage("Listening — speak naturally.");
      session.sendMessage("[[opening-instruction]] In one short sentence, explain that you can use today's flight and journey stage to help uncover something worth picking up, then ask for the destination or flight while making clear they can simply browse.");
    } catch (error) {
      sessionRef.current?.close(); sessionRef.current = null; setVoiceStatus("error");
      setVoiceMessage(error?.name === "NotAllowedError" ? "Microphone access was not granted. Touch browsing is still available." : (error.message || "Voice service is unavailable."));
    }
  }, [buildTools, clearVoiceTimeout, closeVoiceSession, isMuted, stateSnapshot]);

  useEffect(() => () => { mountedRef.current = false; clearVoiceTimeout(); sessionRef.current?.close(); }, [clearVoiceTimeout]);

  const showFullCollection = useCallback((category = "All") => {
    const matches = category === "All" ? products : products.filter((product) => product.productType === category);
    presentationSequenceRef.current += 1;
    visibleIdsRef.current = matches.map((product) => product.id); setVisibleIds(visibleIdsRef.current);
    setFocusedView(false); setActiveCategory(category);
    selectedIdRef.current = null; setSelectedId(null);
    queueMicrotask(() => sendInterfaceState("the browse collection changed"));
  }, [products, sendInterfaceState]);

  const selectProduct = useCallback((productId) => {
    presentationSequenceRef.current += 1;
    selectedIdRef.current = productId; setSelectedId(productId); setActivePanel("detail");
    queueMicrotask(() => sendInterfaceState("the shopper selected a product by touch"));
  }, [sendInterfaceState]);

  const openTouchReview = () => { const result = prepareReview(); if (!result.ok) setReservationError(result.error); else setApprovalRequest({ type: "touch" }); };
  const confirmApproval = async () => { const pending = approvalRequest; if (pending?.type === "voice") await sessionRef.current?.approve(pending.request.approvalItem); else createReservation(); };
  const rejectApproval = async () => { const pending = approvalRequest; setApprovalRequest(null); if (pending?.type === "voice") await sessionRef.current?.reject(pending.request.approvalItem, { message: "The traveler did not confirm." }); };
  const resetDemo = () => { shortlistRef.current = {}; basketRef.current = {}; reviewRef.current = null; reservationRef.current = null; flightMatchesRef.current = []; setShortlist({}); setBasket({}); setReview(null); setReservation(null); setApprovalRequest(null); setActivePanel(null); setTravel(DEFAULT_TRAVEL); travelRef.current = DEFAULT_TRAVEL; showFullCollection("All"); localStorage.removeItem(STORAGE_KEY); };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.brandMark}>A</span><div><strong>ZÜRICH DUTY FREE</strong><small>an Avolta voice-shopping concept</small></div></div>
        <div className={styles.headerActions}>
          <button type="button" onClick={() => setActivePanel("saved")} aria-label={`Saved products, ${Object.keys(shortlist).length}`}><Heart size={17} /><span>Saved</span>{Object.keys(shortlist).length > 0 && <b>{Object.keys(shortlist).length}</b>}</button>
          <button type="button" onClick={() => setActivePanel("compare")} aria-label={`Compare products, ${comparison.length}`}><GitCompareArrows size={17} /><span>Compare</span>{comparison.length > 0 && <b>{comparison.length}</b>}</button>
          <button type="button" onClick={() => setActivePanel("basket")} aria-label={`Pickup bag, ${basketDetails.itemCount} items`}><ShoppingBag size={17} /><span>Bag</span>{basketDetails.itemCount > 0 && <b>{basketDetails.itemCount}</b>}</button>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.kicker}><Sparkles size={14} /> Explore before you fly</p>
        <h1>What might be worth picking up?</h1>
        <p>Talk to your shopping companion, or browse all {products.length} captured Zürich Duty Free finds.</p>
      </section>

      <div className={styles.voiceDock} data-status={voiceStatus} aria-live="polite">
        <div className={styles.voiceCard}>
          <button className={styles.micButton} type="button" onClick={startVoice} disabled={voiceStatus === "connecting"} aria-label={sessionRef.current ? (isMuted ? "Unmute microphone" : "Mute microphone") : "Start voice shopping"}>{isMuted ? <MicOff /> : <Mic />}<span /></button>
          <div><strong>{voiceStatus === "idle" ? "Talk to the shop" : voiceMessage}</strong><small>{voiceStatus === "idle" ? "Tap the microphone" : voiceStatus === "error" || voiceStatus === "unsupported" ? "Check microphone access and try again" : "Voice session active"}</small></div>
          {sessionRef.current && <button className={styles.endVoice} type="button" onClick={() => closeVoiceSession("Conversation ended. Start again anytime.")}>End</button>}
        </div>
      </div>

      <section className={styles.catalogue}>
        <div className={styles.catalogueTop}>
          <div><p className={styles.kicker}>{focusedView ? "Picked for this conversation" : "Captured Zürich selection"}</p><h2>{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}</h2></div>
          {focusedView && <button className={styles.allProducts} type="button" onClick={() => showFullCollection("All")}>Back to all {products.length}</button>}
        </div>
        <div className={styles.categories}>{categories.map((category) => <button key={category} type="button" data-active={!focusedView && activeCategory === category} onClick={() => showFullCollection(category)}>{category}{category !== "All" && <span>{products.filter((product) => product.productType === category).length}</span>}</button>)}</div>
        <div className={styles.productGrid}>{visibleProducts.map((product, index) => { const image = product.images[0]; const failed = imageFailures.has(product.id); const quantity = basket[product.id] || 0; const kept = shortlist[product.id]; const compared = comparison.includes(product.id); return (
          <article className={styles.productCard} data-product-card={product.id} data-selected={selectedId === product.id} key={product.id}>
            <button type="button" className={styles.productMain} onClick={() => selectProduct(product.id)} aria-label={`View ${product.vendor} ${product.name}`}>
              <div className={styles.imageWrap}>{!failed ? <Image data-product-image={product.id} src={image.localPath} alt={image.alt} fill loading={index < 6 ? "eager" : "lazy"} sizes="(max-width: 560px) 50vw, (max-width: 1000px) 33vw, 25vw" onError={(e) => { e.currentTarget.dataset.failed = "true"; imageFailuresRef.current.add(product.id); setImageFailures((current) => new Set(current).add(product.id)); }} /> : <span>Photo unavailable</span>}{product.promotionEvidence && <i>{product.promotionEvidence}</i>}</div>
              <div className={styles.productCopy}><small>{product.vendor}</small><h3>{product.name}</h3><p>{product.variant}</p><div><strong>{formatMoney(product.priceChf)}</strong>{product.compareAtPriceChf && <del>{formatMoney(product.compareAtPriceChf)}</del>}</div></div>
            </button>
            <div className={styles.cardActions}><button type="button" data-active={kept} onClick={() => mutateShortlist(product.id, !kept)} aria-label={`${kept ? "Remove" : "Save"} ${product.name}`}><Heart size={16} fill={kept ? "currentColor" : "none"} /></button><button type="button" data-active={compared} onClick={() => setComparisonState(compared ? comparison.filter((id) => id !== product.id) : [...comparison, product.id])} aria-label={`${compared ? "Remove" : "Add"} ${product.name} ${compared ? "from" : "to"} comparison`}><GitCompareArrows size={15} /></button>{quantity ? <div className={styles.stepper}><button type="button" onClick={() => mutateBasket(product.id, 1, "remove")}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => mutateBasket(product.id, 1, "add")}><Plus size={14} /></button></div> : <button type="button" className={styles.addButton} onClick={() => mutateBasket(product.id, 1, "add")}><Plus size={15} /> Bag</button>}</div>
          </article>); })}</div>
        <p className={styles.catalogueNote}>Public product selection captured 11 September 2026. Online listings are not live store stock.</p>
      </section>

      {activePanel && <div className={styles.sheetBackdrop} onMouseDown={() => setActivePanel(null)}><section className={styles.sheet} role="dialog" aria-modal="true" aria-label={activePanel === "detail" ? "Product details" : activePanel === "saved" ? "Saved products" : activePanel === "compare" ? "Product comparison" : "Pickup bag"} onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.sheetClose} type="button" onClick={() => setActivePanel(null)} aria-label="Close"><X size={20} /></button>

        {activePanel === "detail" && selectedProduct && <>
          <p className={styles.kicker}>Product details</p><h2>{selectedProduct.name}</h2><p className={styles.sheetBrand}>{selectedProduct.vendor}</p>
          <div className={styles.detailImage}><Image src={selectedProduct.images[0].localPath} alt={selectedProduct.images[0].alt} fill sizes="420px" /></div>
          <div className={styles.detailPrice}><strong>{formatMoney(selectedProduct.priceChf)}</strong>{selectedProduct.compareAtPriceChf && <del>{formatMoney(selectedProduct.compareAtPriceChf)}</del>}<span>{selectedProduct.variant}</span></div>
          {selectedProduct.description && <p className={styles.detailDescription}>{selectedProduct.description}</p>}
          <div className={styles.sheetActions}><button type="button" data-active={shortlist[selectedProduct.id]} onClick={() => mutateShortlist(selectedProduct.id, !shortlist[selectedProduct.id])}><Heart size={17} /> {shortlist[selectedProduct.id] ? "Saved" : "Save"}</button><button type="button" onClick={() => mutateBasket(selectedProduct.id, 1, "add")}><ShoppingBag size={17} /> Add to bag</button></div>
          <a className={styles.detailSource} href={selectedProduct.sourceUrl} target="_blank" rel="noreferrer">View captured public listing</a>
        </>}

        {activePanel === "saved" && <><p className={styles.kicker}>Saved for later</p><h2>{Object.keys(shortlist).length || "No"} saved</h2>{!Object.keys(shortlist).length ? <p className={styles.empty}>Use the heart on any product to keep it here.</p> : <div className={styles.sheetList}>{Object.keys(shortlist).map((id) => { const product = productsById.get(id); return product && <button type="button" key={id} onClick={() => { selectedIdRef.current = id; setSelectedId(id); setActivePanel("detail"); }}><span>{product.vendor}<strong>{product.name}</strong><small>{product.variant}</small></span><b>{formatMoney(product.priceChf)}</b></button>; })}</div>}</>}

        {activePanel === "compare" && <><p className={styles.kicker}>Compare</p><h2>{comparison.length || "No"} selected</h2>{comparison.length < 2 && <p className={styles.empty}>Choose two products with the compare icon.</p>}<div className={styles.compareList}>{comparison.map((id) => { const product = productsById.get(id); return product && <article key={id}><div className={styles.compareImage}><Image src={product.images[0].localPath} alt={product.images[0].alt} fill sizes="180px" /></div><small>{product.vendor}</small><h3>{product.name}</h3><p>{product.variant}</p><strong>{formatMoney(product.priceChf)}</strong><button type="button" onClick={() => setComparisonState(comparison.filter((item) => item !== id))}>Remove</button></article>; })}</div></>}

        {activePanel === "basket" && <><p className={styles.kicker}>Quick pickup</p><h2>{basketDetails.itemCount || "No"} {basketDetails.itemCount === 1 ? "item" : "items"}</h2>
          {reservation && <div className={styles.reservationResult}><span><Check size={16} /> Reservation summary</span><strong>{reservation.reference}</strong><p>{reservation.pickupLocation}</p>{reservation.summary?.items?.map((item) => <p className={styles.reservedItem} key={item.productId}>{item.quantity} × {item.brand} {item.name} · {formatMoney(item.lineTotal)}</p>)}<small>Concept reservation · not sent to the store</small></div>}
          {!basketDetails.itemCount ? <p className={styles.empty}>Add a product when something catches your eye.</p> : <><div className={styles.basketItems}>{basketDetails.items.map((item) => <div className={styles.basketItem} key={item.productId}><div><strong>{item.brand} {item.name}</strong><small>{item.variant} · {formatMoney(item.unitPrice)}</small></div><div><b>{formatMoney(item.lineTotal)}</b><div className={styles.stepper}><button type="button" onClick={() => mutateBasket(item.productId, 1, "remove")}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => mutateBasket(item.productId, 1, "add")}><Plus size={13} /></button></div></div></div>)}</div><label className={styles.departureField}>Departure date & time<input type="datetime-local" value={dateTimeInputValue(travel.departureDateTime)} onChange={(e) => updateTravel({ departureDateTime: e.target.value })} /></label>{reservationError && <p className={styles.error}>{reservationError}</p>}<div className={styles.total}><span>Captured-price total</span><strong>{formatMoney(basketDetails.total)}</strong></div><button className={styles.reviewButton} type="button" onClick={openTouchReview}>Review pickup</button><p className={styles.discreet}>Concept reservation · public listing is not live store stock.</p></>}
        </>}
      </section></div>}

      {approvalRequest && review && <div className={styles.modalBackdrop}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="review-title"><p className={styles.kicker}>Final review</p><h2 id="review-title">Quick airport pickup</h2><div className={styles.pickup}><MapPin /><div><strong>Zürich Duty Free departure shop</strong><span>Requested for this journey · departure {new Date(review.travel.departureDateTime).toLocaleString("en-CH")} · {review.travel.gate || "Gate not provided"}</span></div></div><div className={styles.reviewItems}>{review.summary.items.map((item) => <p key={item.productId}><span>{item.quantity} × {item.brand} {item.name}<small>{item.variant}</small></span><strong>{formatMoney(item.lineTotal)}</strong></p>)}</div><div className={styles.total}><span>Total</span><strong>{formatMoney(review.summary.total)}</strong></div><p className={styles.conceptNote}>This confirms a concept reservation on this device. It is not submitted to Zürich Duty Free and does not hold stock.</p><div className={styles.modalActions}><button type="button" onClick={rejectApproval}>Keep exploring</button><button type="button" onClick={confirmApproval}><Check size={17} /> Confirm reservation</button></div></section></div>}

      <button className={styles.resetButton} type="button" onClick={resetDemo}>Reset demo</button>
    </main>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Clock3, Heart, MapPin, Mic, MicOff, Minus, Plane, Plus, RefreshCw, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import {
  basketSummary, changeQuantity, compactProduct, departureEligibility, initialDemoProducts,
  reservationFingerprint, resultsLimitForTravel, searchCatalog, shoppingStateSnapshot, transcriptFromHistory,
} from "./shopping.mjs";
import { isAllowedAvoltaRealtimeModel } from "./realtimeConfig.mjs";
import { assessJourney, nextZurichMidnight } from "./liveContext.mjs";
import styles from "./avoltaVoiceShop.module.css";

const IMAGE_WAIT_MS = 4500;
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
  const initialProducts = useMemo(() => initialDemoProducts(products), [products]);

  const [visibleIds, setVisibleIds] = useState(() => initialProducts.map((product) => product.id));
  const [selectedId, setSelectedId] = useState(() => initialProducts[0]?.id || null);
  const [comparison, setComparison] = useState([]);
  const [shortlist, setShortlist] = useState({});
  const [basket, setBasket] = useState({});
  const [travel, setTravel] = useState(DEFAULT_TRAVEL);
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Start a natural conversation.");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [review, setReview] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState("");
  const [imageFailures, setImageFailures] = useState(() => new Set());
  const [storageReady, setStorageReady] = useState(false);
  const [journeyContext, setJourneyContext] = useState(null);
  const [flightMatches, setFlightMatches] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState("");

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

  const stateSnapshot = useCallback(() => shoppingStateSnapshot({
    visibleIds: visibleIdsRef.current, selectedId: selectedIdRef.current, shortlist: shortlistRef.current,
    basket: basketRef.current, travel: travelRef.current,
  }, productsById), [productsById]);

  const sendInterfaceState = useCallback((reason) => {
    const session = sessionRef.current;
    if (!session || session.transport.status !== "connected") return;
    try { session.transport.sendMessage(`[Interface state after ${reason}; do not respond unless asked.] ${safe(stateSnapshot())}`, {}, { triggerResponse: false }); }
    catch { /* The state tool remains authoritative. */ }
  }, [stateSnapshot]);

  const waitForDisplayedImages = useCallback(async (ids, sequence) => {
    const deadline = performance.now() + IMAGE_WAIT_MS;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    while (performance.now() < deadline) {
      if (presentationSequenceRef.current !== sequence) return { stale: true, displayedIds: [], failedIds: [] };
      const displayedIds = []; const failedIds = [];
      for (const id of ids) {
        const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
        if (image?.complete && image.naturalWidth > 0) displayedIds.push(id);
        else if (image?.dataset.failed === "true" || imageFailuresRef.current.has(id)) failedIds.push(id);
      }
      if (displayedIds.length + failedIds.length === ids.length) return { stale: false, displayedIds, failedIds };
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    return { stale: false, displayedIds: [], failedIds: ids, timedOut: true };
  }, []);

  const presentProducts = useCallback(async (requestedIds, focusId = null) => {
    const ids = [...new Set(requestedIds)].filter((id) => validProductIds.has(id)).slice(0, 20);
    if (!ids.length) return { displayed: false, error: "No products from the captured selection matched." };
    const sequence = ++presentationSequenceRef.current;
    visibleIdsRef.current = ids; setVisibleIds(ids);
    const nextSelected = focusId && ids.includes(focusId) ? focusId : ids[0];
    selectedIdRef.current = nextSelected; setSelectedId(nextSelected);
    const result = await waitForDisplayedImages(ids, sequence);
    if (result.stale) return { displayed: false, stale: true, message: "A newer selection replaced these results." };
    return {
      displayed: result.displayedIds.length === ids.length,
      displayedProducts: result.displayedIds.map((id) => compactProduct(productsById.get(id))),
      selectedProduct: compactProduct(productsById.get(nextSelected)), failedImageProductIds: result.failedIds,
      message: result.displayedIds.length === ids.length ? "The requested product images are displayed." : "Some images did not load; only displayedProducts are visible.",
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
    setJourneyLoading(true); setJourneyError("");
    try {
      const response = await fetch("/api/avolta-demo/journey-context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Live airport context is unavailable.");
      journeyContextRef.current = payload; setJourneyContext(payload);
      const matches = payload.flightSearch?.matches || [];
      flightMatchesRef.current = matches; setFlightMatches(matches);
      if (matches.length === 1) selectFlight(matches[0], "touch");
      else if (query) updateTravel({ selectedFlight: null, destination: "", gate: "", departureDateTime: "" }, "touch");
      return payload;
    } catch (error) {
      setJourneyError(error.message || "Live airport context is unavailable.");
      return { error: error.message || "Live airport context is unavailable." };
    } finally { setJourneyLoading(false); }
  }, [selectFlight, updateTravel]);

  useEffect(() => { refreshJourney(); }, [refreshJourney]);

  const journeyAssessment = useMemo(() => assessJourney({
    stage: travel.stage, flight: travel.selectedFlight, arrivalEstimate: travel.arrivalEstimate,
    minutesAvailable: travel.minutesAvailable, needsCheckin: travel.needsCheckin, queues: journeyContext?.queues,
  }), [journeyContext, travel]);

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
    reservationRef.current = result; setReservation(result); setApprovalRequest(null);
    return { ok: true, reservation: result };
  }, []);

  const buildTools = useCallback((tool, z) => {
    const getState = tool({ name: "get_shopping_state", description: "Read current visible, selected, comparison, shortlist, basket and travel state. Always call before resolving relative phrases such as this one or the second one.", parameters: z.object({}), execute: async () => safe({ ...stateSnapshot(), comparison: comparisonRef.current.map((id) => compactProduct(productsById.get(id))) }) });
    const search = tool({ name: "search_and_show_products", description: "Search and display items from the captured Zürich Duty Free selection. Use expressed needs, categories, brands or budgets. A small result limit is selected from travel time.", parameters: z.object({ query: z.string().min(1).max(120) }), execute: async ({ query }) => {
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
    const assess = tool({ name: "assess_journey", description: "Return the deterministic journey recommendation using selected flight, stage, traveler arrival estimate and fresh airport queues. Use this before context-sensitive shopping advice.", parameters: z.object({}), execute: async () => { const refreshed = await refreshJourney(travelRef.current.flightQuery || ""); if (refreshed.error) return safe(refreshed); return safe(assessJourney({ stage: travelRef.current.stage, flight: travelRef.current.selectedFlight, arrivalEstimate: travelRef.current.arrivalEstimate, minutesAvailable: travelRef.current.minutesAvailable, needsCheckin: travelRef.current.needsCheckin, queues: journeyContextRef.current?.queues })); } });
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
- Use search_and_show_products for needs or options. Never claim images are visible until the tool confirms display.
- Call get_shopping_state before resolving “this,” “that,” ordinals, touch selections, or basket changes.
- Never invent products, attributes, offers, exclusivity, prices, walking time, gates, stock or pickup eligibility. Offer a supported alternative when data is missing.
- For today's flight, use find_today_flight and explicitly resolve ambiguous destinations or codeshares with the traveler. A flight never proves passenger location. Missing gate or boarding time is normal; never invent either.
- Use assess_journey before context-sensitive advice. Treat stale/unavailable readings and missing facts as unknown, never zero. A later estimated departure does not create shopping time.
- Ordinary replies are one or two short sentences. Give one concrete, source-backed reason, at most two choices, then ask one useful question or listen. Remember rejections and never read card text aloud.
- This concept proposes quick pickup during the traveler’s current journey; it does not inherit the current public Reserve & Collect advance-booking rules. A reservation requires products, an upcoming departure, review_departure_reservation, an explicit affirmative confirmation, then confirm_departure_reservation. Never invent an exact ready time or imply a store submission, stock hold, payment or notification.
- Keep the concept-reservation distinction discreet during browsing and accurate at confirmation.

Initial interface state: ${safe(stateSnapshot())}` });
      const session = new RealtimeSession(agent, { model: payload.model, transport: "webrtc", tracingDisabled: true, config: { outputModalities: ["audio"], audio: { input: { noiseReduction: { type: "near_field" }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" }, turnDetection: { type: "semantic_vad", eagerness: "medium", createResponse: true, interruptResponse: true } }, output: { voice: "marin", speed: 1.03 } } } });
      session.on("history_updated", (history) => mountedRef.current && setTranscript(transcriptFromHistory(history)));
      session.on("audio_start", () => { if (mountedRef.current) { setVoiceStatus("speaking"); setVoiceMessage("Speaking — interrupt anytime."); } });
      session.on("audio_stopped", () => { if (mountedRef.current) { setVoiceStatus(session.muted ? "muted" : "listening"); setVoiceMessage(session.muted ? "Microphone muted." : "Listening — speak naturally."); } });
      session.on("audio_interrupted", () => { if (mountedRef.current) { setVoiceStatus("listening"); setVoiceMessage("Listening — go ahead."); } });
      session.on("tool_approval_requested", (_context, _agent, request) => { if (mountedRef.current) setApprovalRequest({ type: "voice", request }); });
      session.on("error", () => { if (mountedRef.current) { setVoiceStatus("error"); setVoiceMessage("The voice connection had a problem. End it and try again."); } });
      sessionRef.current = session; await session.connect({ apiKey: payload.value });
      clearVoiceTimeout(); voiceTimeoutRef.current = window.setTimeout(() => closeVoiceSession("Five-minute voice session ended. Start again anytime."), VOICE_DEMO_DURATION_MS);
      setVoiceStatus("listening"); setVoiceMessage("Listening — speak naturally.");
      session.sendMessage("In one short sentence, explain that you can use today's flight and journey stage to help uncover something worth picking up, then ask for the destination or flight while making clear they can simply browse.");
    } catch (error) {
      sessionRef.current?.close(); sessionRef.current = null; setVoiceStatus("error");
      setVoiceMessage(error?.name === "NotAllowedError" ? "Microphone access was not granted. Touch browsing is still available." : (error.message || "Voice service is unavailable."));
    }
  }, [buildTools, clearVoiceTimeout, closeVoiceSession, isMuted, stateSnapshot]);

  useEffect(() => () => { mountedRef.current = false; clearVoiceTimeout(); sessionRef.current?.close(); }, [clearVoiceTimeout]);

  const runSearch = useCallback(async (query = searchValue) => {
    const value = query.trim(); const matches = value ? searchCatalog(products, value, resultsLimitForTravel(travelRef.current)) : initialProducts;
    setSearchValue(value); setActiveCategory("All");
    if (matches.length) await presentProducts(matches.map((p) => p.id), matches[0].id);
    queueMicrotask(() => sendInterfaceState("a touch search"));
  }, [initialProducts, presentProducts, products, searchValue, sendInterfaceState]);

  const filterCategory = useCallback(async (category) => {
    setActiveCategory(category); setSearchValue("");
    const matches = category === "All" ? initialProducts : products.filter((p) => p.productType === category).slice(0, resultsLimitForTravel(travelRef.current));
    await presentProducts(matches.map((p) => p.id), matches[0]?.id); queueMicrotask(() => sendInterfaceState("a category change"));
  }, [initialProducts, presentProducts, products, sendInterfaceState]);

  const openTouchReview = () => { const result = prepareReview(); if (!result.ok) setReservationError(result.error); else setApprovalRequest({ type: "touch" }); };
  const confirmApproval = async () => { const pending = approvalRequest; if (pending?.type === "voice") await sessionRef.current?.approve(pending.request.approvalItem); else createReservation(); };
  const rejectApproval = async () => { const pending = approvalRequest; setApprovalRequest(null); if (pending?.type === "voice") await sessionRef.current?.reject(pending.request.approvalItem, { message: "The traveler did not confirm." }); };
  const resetDemo = () => { shortlistRef.current = {}; basketRef.current = {}; reviewRef.current = null; reservationRef.current = null; flightMatchesRef.current = []; setShortlist({}); setBasket({}); setReview(null); setReservation(null); setApprovalRequest(null); setFlightMatches([]); setTravel(DEFAULT_TRAVEL); travelRef.current = DEFAULT_TRAVEL; localStorage.removeItem(STORAGE_KEY); };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.brandMark}>A</span><div><strong>ZÜRICH DUTY FREE</strong><small>an Avolta voice-shopping concept</small></div></div>
        <div className={styles.headerMeta}><span>Quick airport pickup</span><button type="button" onClick={resetDemo}>Reset</button></div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><Sparkles size={15} /> Explore before you fly</p>
          <h1>Your airport shop,<br /><em>in conversation.</em></h1>
          <p>Tell me today’s flight—or simply what has caught your interest. I’ll help you explore 205 Zürich Duty Free finds around the journey you actually have.</p>
        </div>
        <div className={styles.voiceCard} data-status={voiceStatus}>
          <button className={styles.micButton} type="button" onClick={startVoice} disabled={voiceStatus === "connecting"} aria-label={sessionRef.current ? (isMuted ? "Unmute microphone" : "Mute microphone") : "Start voice shopping"}>{isMuted ? <MicOff /> : <Mic />}<span /></button>
          <div><strong>{voiceStatus === "idle" ? "Start talking" : voiceMessage}</strong><small>{voiceStatus === "idle" ? "Tap the microphone · English" : "OpenAI Realtime · five-minute session"}</small></div>
          {sessionRef.current && <button className={styles.endVoice} type="button" onClick={() => closeVoiceSession("Conversation ended. Start again anytime.")}>End</button>}
        </div>
        {transcript.length > 0 && <div className={styles.transcript} aria-live="polite">{transcript.slice(-2).map((item) => <p key={`${item.id}-${item.role}`}><b>{item.role === "assistant" ? "Shop" : "You"}</b>{item.text}</p>)}</div>}
      </section>

      <section className={styles.travelBar} aria-label="Travel context">
        <div><Plane size={18} /><label>Where are you now?<select value={travel.stage} onChange={(e) => updateTravel({ stage: e.target.value })}><option value="on_the_way">On the way</option><option value="before_security">Before security</option><option value="airside">Airside</option><option value="near_gate">At / near the gate</option></select></label></div>
        <div className={styles.flightField}><Search size={18} /><label>Today’s flight or destination<input value={travel.flightQuery} onChange={(e) => updateTravel({ flightQuery: e.target.value })} placeholder="e.g. LX 64 or Miami" /></label><button type="button" onClick={() => refreshJourney(travel.flightQuery)} disabled={journeyLoading}>{journeyLoading ? "Checking…" : "Match"}</button></div>
        {(travel.stage === "on_the_way" || travel.stage === "before_security") ? <div><Clock3 size={18} /><label>{travel.stage === "on_the_way" ? "Airport arrival estimate" : "Time to explore"}<input type={travel.stage === "on_the_way" ? "datetime-local" : "number"} value={travel.stage === "on_the_way" ? dateTimeInputValue(travel.arrivalEstimate) : travel.minutesAvailable} onChange={(e) => updateTravel(travel.stage === "on_the_way" ? { arrivalEstimate: e.target.value } : { minutesAvailable: e.target.value })} placeholder="Your estimate" /></label></div> : <div><Clock3 size={18} /><label>Time you can spare<input inputMode="numeric" value={travel.minutesAvailable} onChange={(e) => updateTravel({ minutesAvailable: e.target.value })} placeholder="Minutes, if known" /></label></div>}
        {(travel.stage === "on_the_way" || travel.stage === "before_security") ? <div><label>Checked baggage?<select value={travel.needsCheckin ? "yes" : "no"} onChange={(e) => updateTravel({ needsCheckin: e.target.value === "yes" })}><option value="no">No / already checked</option><option value="yes">Yes, check-in needed</option></select></label></div> : <div><MapPin size={18} /><label>Gate<input value={travel.gate} onChange={(e) => updateTravel({ gate: e.target.value })} placeholder="If known" /></label></div>}
      </section>

      <section className={styles.journeyPanel} aria-live="polite">
        <div className={styles.journeyLead}><div><p className={styles.kicker}>Today at Zürich Airport</p><h2>{travel.selectedFlight ? `${travel.selectedFlight.flightNumber} · ${travel.selectedFlight.destination}` : "Match your departure when useful"}</h2></div><button type="button" onClick={() => refreshJourney(travel.flightQuery)} disabled={journeyLoading}><RefreshCw size={15} /> Refresh</button></div>
        {journeyError && <p className={styles.journeyError}><AlertTriangle size={15} /> {journeyError} Shopping remains available.</p>}
        {flightMatches.length > 1 && !travel.selectedFlight && <div className={styles.flightMatches}><span>Please choose the exact departure:</span>{flightMatches.slice(0, 6).map((flight) => <button type="button" key={flight.id} onClick={() => selectFlight(flight)}><strong>{flight.flightNumber}</strong> {flight.destination} · {flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toLocaleTimeString("en-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }) : "time unavailable"}</button>)}</div>}
        <div className={styles.journeyFacts}>
          <span data-status={journeyContext?.sourceStatus || "unavailable"}>Flights {journeyContext?.sourceStatus || "loading"}{journeyContext?.fetchedAt ? ` · ${new Date(journeyContext.fetchedAt).toLocaleTimeString("en-CH", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
          <span data-status={journeyContext?.queues?.security?.status || "unavailable"}>Security {journeyContext?.queues?.security?.value != null ? `${journeyContext.queues.security.value} min` : "unavailable"}</span>
          {travel.selectedFlight?.gate && <span>Gate {travel.selectedFlight.gate}</span>}
          {travel.selectedFlight?.statusText && <span>{travel.selectedFlight.statusText}</span>}
        </div>
        <div className={styles.assessment} data-outcome={journeyAssessment.outcome}><strong>{!travel.selectedFlight && journeyAssessment.availableShoppingMinutes == null ? "Journey not assessed" : journeyAssessment.outcome === "explore" ? "Explore" : journeyAssessment.outcome === "quick_pickup" ? "Keep it focused" : "Prioritize the gate"}</strong><p>{!travel.selectedFlight && journeyAssessment.availableShoppingMinutes == null ? "Match today’s flight when you want journey-aware advice—or keep exploring without it." : <>{journeyAssessment.recommendation}{journeyAssessment.availableShoppingMinutes != null ? ` About ${journeyAssessment.availableShoppingMinutes} conservative shopping minutes remain.` : ""}</>}</p>{journeyAssessment.missing.length > 0 && <small>Still unknown: {journeyAssessment.missing.join(", ")}.</small>}</div>
      </section>

      <div className={styles.layout}>
        <section className={styles.catalogue}>
          <div className={styles.catalogueTop}><div><p className={styles.kicker}>Captured Zurich selection</p><h2>{visibleProducts.length} products to explore</h2></div><form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className={styles.search}><Search size={18} /><input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder={`Search ${products.length} products`} aria-label="Search captured Zürich Duty Free selection" />{searchValue && <button type="button" onClick={() => runSearch("")} aria-label="Clear search"><X size={16} /></button>}</form></div>
          <div className={styles.categories}>{categories.map((category) => <button key={category} type="button" data-active={activeCategory === category} onClick={() => filterCategory(category)}>{category}</button>)}</div>
          {comparison.length === 2 && <div className={styles.compareStrip}><span>Comparing</span>{comparison.map((id) => <strong key={id}>{productsById.get(id)?.vendor} {productsById.get(id)?.name}</strong>)}<button type="button" onClick={() => setComparisonState([])}>Clear</button></div>}
          <div className={styles.productGrid}>{visibleProducts.map((product) => { const image = product.images[0]; const failed = imageFailures.has(product.id); const quantity = basket[product.id] || 0; const kept = shortlist[product.id]; const compared = comparison.includes(product.id); return (
            <article className={styles.productCard} data-selected={selectedId === product.id} key={product.id}>
              <button type="button" className={styles.productMain} onClick={() => { selectedIdRef.current = product.id; setSelectedId(product.id); sendInterfaceState("a product was selected"); }} aria-pressed={selectedId === product.id}>
                <div className={styles.imageWrap}>{!failed ? <Image data-product-image={product.id} src={image.localPath} alt={image.alt} fill sizes="(max-width: 720px) 50vw, 260px" onError={(e) => { e.currentTarget.dataset.failed = "true"; imageFailuresRef.current.add(product.id); setImageFailures((current) => new Set(current).add(product.id)); }} /> : <span>Photo unavailable</span>}{product.promotionEvidence && <i>{product.promotionEvidence}</i>}</div>
                <div className={styles.productCopy}><small>{product.vendor}</small><h3>{product.name}</h3><p>{product.variant}</p><div><strong>{formatMoney(product.priceChf)}</strong>{product.compareAtPriceChf && <del>{formatMoney(product.compareAtPriceChf)}</del>}</div></div>
              </button>
              <div className={styles.cardActions}><button type="button" data-active={kept} onClick={() => mutateShortlist(product.id, !kept)} aria-label={`${kept ? "Remove" : "Add"} ${product.name} ${kept ? "from" : "to"} shortlist`}><Heart size={16} fill={kept ? "currentColor" : "none"} /></button><button type="button" data-active={compared} onClick={() => setComparisonState(compared ? comparison.filter((id) => id !== product.id) : [...comparison, product.id])}>Compare</button>{quantity ? <div className={styles.stepper}><button type="button" onClick={() => mutateBasket(product.id, 1, "remove")}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => mutateBasket(product.id, 1, "add")}><Plus size={14} /></button></div> : <button type="button" className={styles.addButton} onClick={() => mutateBasket(product.id, 1, "add")}><Plus size={15} /> Reserve</button>}</div>
              <a className={styles.sourceLink} href={product.sourceUrl} target="_blank" rel="noreferrer">Source · captured 11 Sep 2026</a>
            </article>); })}</div>
        </section>

        <aside className={styles.sidePanel}>
          <div className={styles.shortlistBlock}><div className={styles.panelTitle}><div><p className={styles.kicker}>Saved for later</p><h2>{Object.keys(shortlist).length} shortlisted</h2></div><Heart /></div>{!Object.keys(shortlist).length ? <p className={styles.empty}>Keep anything interesting. Your shortlist stays on this device when you return.</p> : <div className={styles.savedList}>{Object.keys(shortlist).map((id) => { const product = productsById.get(id); return product && <button type="button" key={id} onClick={() => presentProducts([id], id)}>{product.vendor}<strong>{product.name}</strong></button>; })}</div>}</div>
          <div className={styles.basketBlock} id="reservation"><div className={styles.panelTitle}><div><p className={styles.kicker}>Quick pickup</p><h2>{basketDetails.itemCount || "No"} {basketDetails.itemCount === 1 ? "item" : "items"}</h2></div><ShoppingBag /></div>
            {reservation && <div className={styles.reservationResult}><span><Check size={16} /> Reservation summary</span><strong>{reservation.reference}</strong><p>{reservation.pickupLocation}</p>{reservation.summary?.items?.map((item) => <p className={styles.reservedItem} key={item.productId}>{item.quantity} × {item.brand} {item.name} · {formatMoney(item.lineTotal)}</p>)}<small>Concept reservation · not sent to the store</small></div>}
            {!basketDetails.itemCount ? <p className={styles.empty}>Add products when you are ready. Browsing and shortlisting never force a reservation.</p> : <div className={styles.basketItems}>{basketDetails.items.map((item) => <div className={styles.basketItem} key={item.productId}><div><strong>{item.brand} {item.name}</strong><small>{item.variant} · {formatMoney(item.unitPrice)}</small></div><div><b>{formatMoney(item.lineTotal)}</b><div className={styles.stepper}><button type="button" onClick={() => mutateBasket(item.productId, 1, "remove")}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => mutateBasket(item.productId, 1, "add")}><Plus size={13} /></button></div></div></div>)}</div>}
            <label className={styles.departureField}>Departure date & time<input type="datetime-local" value={dateTimeInputValue(travel.departureDateTime)} onChange={(e) => updateTravel({ departureDateTime: e.target.value })} /></label>
            {reservationError && <p className={styles.error}>{reservationError}</p>}
            <div className={styles.total}><span>Captured-price total</span><strong>{formatMoney(basketDetails.total)}</strong></div>
            <button className={styles.reviewButton} type="button" disabled={!basketDetails.itemCount} onClick={openTouchReview}>Review reservation</button>
            <p className={styles.discreet}>Curated public selection; online listing is not live store stock.</p>
          </div>
        </aside>
      </div>

      {approvalRequest && review && <div className={styles.modalBackdrop}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="review-title"><p className={styles.kicker}>Final review</p><h2 id="review-title">Quick airport pickup</h2><div className={styles.pickup}><MapPin /><div><strong>Zürich Duty Free departure shop</strong><span>Requested for this journey · departure {new Date(review.travel.departureDateTime).toLocaleString("en-CH")} · {review.travel.gate || "Gate not provided"}</span></div></div><div className={styles.reviewItems}>{review.summary.items.map((item) => <p key={item.productId}><span>{item.quantity} × {item.brand} {item.name}<small>{item.variant}</small></span><strong>{formatMoney(item.lineTotal)}</strong></p>)}</div><div className={styles.total}><span>Total</span><strong>{formatMoney(review.summary.total)}</strong></div><p className={styles.conceptNote}>This confirms a concept reservation on this device. It is not submitted to Zürich Duty Free and does not hold stock.</p><div className={styles.modalActions}><button type="button" onClick={rejectApproval}>Keep exploring</button><button type="button" onClick={confirmApproval}><Check size={17} /> Confirm reservation</button></div></section></div>}
    </main>
  );
}

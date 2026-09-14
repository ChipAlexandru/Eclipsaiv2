"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, GitCompareArrows, Heart, MapPin, Mic, MicOff, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { basketSummary, changeQuantity, compactProduct, departureEligibility, reservationFingerprint, resultsLimitForTravel, searchCatalog, shoppingStateSnapshot } from "./shopping.mjs";
import { applyAvoltaRealtimeSessionEvidence, beginAvoltaRealtimeVerification, DEFAULT_AVOLTA_REALTIME_MODEL, idleAvoltaRealtimeVerification, isAllowedAvoltaRealtimeModel } from "./realtimeConfig.mjs";
import { assessReplayJourney, boardingCountdown, createReplayAnchor, journeyStageLabel, nextMeaningfulOrderAnnouncement, normalizeJourneyStage, orderProgress, pairedCountdowns, recommendFulfillment, replayClockState, replayFlightStatus, replayNow, shouldRebasePassiveReplay } from "./flightReplay.mjs";
import styles from "./avoltaVoiceShop.module.css";

const IMAGE_WAIT_MS = 1800;
const INTRO_DURATION_MS = 5000;
const VOICE_DEMO_DURATION_MS = 5 * 60 * 1000;
const STORAGE_KEY = "avolta-zrh-flight-day-v3";
const RESUMED_VOICE_OPENING = "Resume naturally from the current shopping and journey context without repeating the welcome or any demo explanation. Briefly invite the traveler to continue, ask at most one context-aware question if it is useful, then stop speaking and wait. Never fill silence with another question or an invented answer.";
const DEFAULT_TRAVEL = { stage: "unknown", minutesAvailable: "", departureDateTime: "", gate: "", destination: "", flightQuery: "", arrivalEstimate: "", needsCheckin: false, selectedFlight: null };
const VOICE_MODEL_CHOICES = [
  { label: "Mini", model: "gpt-realtime-2.1-mini" },
  { label: "Standard", model: "gpt-realtime-2.1" },
];
const CURATED_PRODUCT_IDS = [
  "favarger-la-boite-zurich-edition-240g",
  "mawico-sitting-trio-cow-plush-25cm",
  "creed-aventus-50ml",
  "chloe-love-story-75ml",
  "amouage-guidance-46-100ml",
  "maison-francis-kurkdjian-baccarat-rouge-540-extrait-de-parfum-35ml",
  "sol-de-janeiro-bum-bum-jet-set-30ml-90ml-50ml",
  "studer-swiss-gold-gin-70cl",
  "zacapa-no-23-1l",
  "munz-swiss-view-napolitains-140g",
  "goldkenn-mini-safe-200g",
  "villars-zurich-destination-old-fashioned-assorted-chocolate-200g",
];
const EDGE_SAFE_PRODUCT_IDS = new Set([
  "hugo-boss-dark-blue-repack-75ml",
  "calvin-klein-ck-free-for-men-100ml",
  "lancome-idole-100ml",
  "creed-absolu-aventus-100ml",
  "chloe-love-story-75ml",
  "maison-francis-kurkdjian-baccarat-rouge-540-extrait-de-parfum-35ml",
  "studer-swiss-gold-gin-70cl",
  "zacapa-no-23-1l",
  "goldkenn-mini-safe-200g",
  "villars-zurich-destination-old-fashioned-assorted-chocolate-200g",
]);
const DENSE_PRODUCT_IDS = new Set([
  "creed-aventus-50ml",
  "amouage-guidance-46-100ml",
  "sol-de-janeiro-bum-bum-jet-set-30ml-90ml-50ml",
  "munz-swiss-view-napolitains-140g",
  "favarger-la-boite-zurich-edition-240g",
  "mawico-sitting-trio-cow-plush-25cm",
]);

function formatMoney(value, currency = "CHF") { const [whole, decimals] = Number(value).toFixed(2).split("."); return `${currency} ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, "’")}.${decimals}`; }
function safe(value) { return JSON.stringify(value); }
function formatClock(value) { return value ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Zurich" }).format(new Date(value)) : "Time unavailable"; }
function customerFlight(flight) { return flight ? { id: flight.id, flightNumber: flight.flightNumber, codeshares: flight.codeshares, destinationCode: flight.destinationCode, destination: flight.destination, scheduledDeparture: flight.scheduledDeparture, estimatedDeparture: flight.estimatedDeparture, boardingTime: flight.boardingTime, gate: flight.gate } : null; }
function customerFulfillment(fulfillment) { return fulfillment ? { method: fulfillment.method, destination: fulfillment.destination, etaMinutes: fulfillment.etaMinutes, reason: fulfillment.reason } : null; }
function productImageFraming(product) { return EDGE_SAFE_PRODUCT_IDS.has(product.id) ? "edge-safe" : DENSE_PRODUCT_IDS.has(product.id) ? "dense" : /\b(set|pack|box|kit|duo|collection|napolitains|hearts)\b/i.test(product.name) ? "wide" : ["Fragrance", "Spirits"].includes(product.productType) ? "tall" : "standard"; }
function travelWithItinerary(flight) { return flight ? { ...DEFAULT_TRAVEL, selectedFlight: flight, destination: flight.destination || "", gate: flight.gate || "", departureDateTime: flight.scheduledDeparture || "" } : DEFAULT_TRAVEL; }
function firstVoiceOpening(flight, demoNow, stage) {
  const destination = flight?.destination || flight?.destinationCode || null;
  const countdown = boardingCountdown(flight, demoNow);
  const boardingMinutes = countdown.known ? Math.max(0, Math.ceil(countdown.seconds / 60)) : null;
  const itinerarySentence = destination && countdown.known
    ? `Acknowledge that the traveler is flying to ${destination} and currently has ${boardingMinutes} minutes until boarding.`
    : destination
      ? `Acknowledge that the traveler is flying to ${destination}; the boarding time is not available, so do not invent a countdown.`
      : "No usable itinerary is available, so ask for the traveler's flight without inventing a destination or countdown.";
  const question = normalizeJourneyStage(stage) === "unknown"
    ? "After a short promise to help them find something they will love and get it to them before they fly, ask whether they are on their way or already at the airport."
    : "Use the location already shared. After a short helpful service promise, ask one relevant shopping question without asking their location again.";
  return `Begin now with the exact sentence "Welcome to Avolta." ${itinerarySentence} ${question} Ask exactly one question, then stop speaking and wait. Use the current itinerary and countdown supplied here rather than recalling an older number. Do not ask for confirmation of the assumed starting flight. Do not claim to have accessed a booking, airline account or personal record. Do not mention the demo day, replay, simulation, data, tools or setup.`;
}

export function AvoltaVoiceShop({ catalog, flightDay }) {
  const products = catalog.products;
  const initialAssumedFlight = flightDay.initialContext?.assumedFlight || null;
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const validProductIds = useMemo(() => new Set(productsById.keys()), [productsById]);
  const [visibleIds, setVisibleIds] = useState(() => CURATED_PRODUCT_IDS.filter((id) => products.some((product) => product.id === id)));
  const [selectedId, setSelectedId] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [shortlist, setShortlist] = useState({});
  const [basket, setBasket] = useState({});
  const [travel, setTravel] = useState(() => travelWithItinerary(initialAssumedFlight));
  const [activeCategory, setActiveCategory] = useState("All");
  const [focusedView, setFocusedView] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Talk to Order");
  const [activeVoiceModel, setActiveVoiceModel] = useState(null);
  const [voiceModelVerification, setVoiceModelVerification] = useState(idleAvoltaRealtimeVerification);
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
  const [flightContext, setFlightContext] = useState(() => flightDay.initialContext || null);
  const [flightContextStatus, setFlightContextStatus] = useState(() => flightDay.initialContext ? "ready" : "loading");
  const [pendingFlight, setPendingFlight] = useState(null);
  const [introExpanded, setIntroExpanded] = useState(true);
  const [atPageTop, setAtPageTop] = useState(true);

  const sessionRef = useRef(null);
  const activeVoiceModelRef = useRef(null);
  const voiceStartSequenceRef = useRef(0);
  const voiceModelVerificationRef = useRef(voiceModelVerification);
  const voiceTimeoutRef = useRef(null);
  const introTimerRef = useRef(null);
  const introSeenRef = useRef(false);
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
  const journeyContextRef = useRef(flightDay.initialContext || null);
  const flightMatchesRef = useRef([]);
  const pendingFlightRef = useRef(null);
  const itineraryDismissedRef = useRef(false);
  const announcedOrderStatesRef = useRef([]);
  const previousOrderStateRef = useRef(null);
  const voiceWelcomedRef = useRef(false);

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const selectedProduct = selectedId ? productsById.get(selectedId) : null;
  const collapseIntro = useCallback(() => {
    if (introTimerRef.current !== null) { window.clearTimeout(introTimerRef.current); introTimerRef.current = null; }
    introSeenRef.current = true;
    setIntroExpanded(false);
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, introSeen: true }));
    } catch { /* A failed preference write should not block the shop. */ }
  }, []);
  useEffect(() => {
    const explicitTime = process.env.NODE_ENV !== "production" ? new URLSearchParams(window.location.search).get("demoTime") : null;
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      const realNow = new Date();
      let anchor = createReplayAnchor({ fixtureVersion: flightDay.fixtureVersion, serviceDate: flightDay.serviceDate, realNow, storedAnchor: stored?.clockAnchor, explicitTime });
      if (shouldRebasePassiveReplay(anchor, realNow, stored)) anchor = createReplayAnchor({ fixtureVersion: flightDay.fixtureVersion, serviceDate: flightDay.serviceDate, realNow, explicitTime });
      clockAnchorRef.current = anchor;
      const replayedNow = replayNow(anchor, new Date()); demoNowRef.current = replayedNow; setDemoNow(replayedNow);
      if (stored?.shortlist) { shortlistRef.current = stored.shortlist; setShortlist(stored.shortlist); }
      if (stored?.basket) { basketRef.current = stored.basket; setBasket(stored.basket); }
      if (stored?.travel) { travelRef.current = { ...DEFAULT_TRAVEL, ...stored.travel }; setTravel(travelRef.current); }
      itineraryDismissedRef.current = Boolean(stored?.itineraryDismissed);
      if (stored?.reservation) { reservationRef.current = stored.reservation; setReservation(stored.reservation); }
      if (stored?.order) { orderRef.current = stored.order; setOrder(stored.order); }
      if (Array.isArray(stored?.announcedOrderStates)) announcedOrderStatesRef.current = stored.announcedOrderStates;
      voiceWelcomedRef.current = Boolean(stored?.voiceWelcomed);
      introSeenRef.current = Boolean(stored?.introSeen || stored?.order);
      setIntroExpanded(!introSeenRef.current);
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
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ clockAnchor: clockAnchorRef.current, shortlist, basket, travel, itineraryDismissed: itineraryDismissedRef.current, reservation, order, introSeen: introSeenRef.current, announcedOrderStates: announcedOrderStatesRef.current, voiceWelcomed: voiceWelcomedRef.current })); } catch { /* In-memory state remains available when browser storage is blocked. */ }
  }, [basket, order, reservation, shortlist, storageReady, travel]);
  useEffect(() => {
    if (!storageReady || !introExpanded) return undefined;
    introTimerRef.current = window.setTimeout(collapseIntro, INTRO_DURATION_MS);
    const collapseOnScroll = () => { if (window.scrollY > 6) collapseIntro(); };
    window.addEventListener("scroll", collapseOnScroll, { passive: true });
    return () => {
      if (introTimerRef.current !== null) { window.clearTimeout(introTimerRef.current); introTimerRef.current = null; }
      window.removeEventListener("scroll", collapseOnScroll);
    };
  }, [collapseIntro, introExpanded, storageReady]);
  useEffect(() => {
    const updateTopState = () => setAtPageTop(window.scrollY <= 6);
    updateTopState();
    window.addEventListener("scroll", updateTopState, { passive: true });
    return () => window.removeEventListener("scroll", updateTopState);
  }, []);

  const currentViewportIds = useCallback(() => {
    if (typeof document === "undefined") return [];
    const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
    return [...document.querySelectorAll("[data-product-card]")].filter((card) => { const rect = card.getBoundingClientRect(); return rect.bottom > 0 && rect.top < viewportBottom; }).map((card) => card.dataset.productCard).filter((id) => validProductIds.has(id)).slice(0, 8);
  }, [validProductIds]);
  const stateSnapshot = useCallback(() => {
    const viewportIds = currentViewportIds();
    const clock = clockAnchorRef.current ? replayClockState(clockAnchorRef.current, new Date()) : { now: demoNowRef.current.toISOString(), replayDate: flightDay.serviceDate, scheduleEnded: false };
    return { ...shoppingStateSnapshot({ visibleIds: viewportIds.length ? viewportIds : (selectedIdRef.current ? [selectedIdRef.current] : visibleIdsRef.current.slice(0, 8)), selectedId: selectedIdRef.current, shortlist: shortlistRef.current, basket: basketRef.current, travel: travelRef.current }, productsById), browseScope: focusedView ? "voice recommendation" : activeCategory, browseProductCount: visibleIdsRef.current.length, demoClock: { ...clock, fixtureVersion: flightDay.fixtureVersion, basis: "captured-day replay, not a live airport feed" }, itineraryProvenance: travelRef.current.selectedFlight?.assumptionBasis ? { basis: "assumed demo itinerary", selection: travelRef.current.selectedFlight.assumptionBasis, retrievedFromPersonalBooking: false } : null, pendingFlight: pendingFlightRef.current, order: orderRef.current ? { ...orderRef.current, progress: orderProgress(orderRef.current, demoNowRef.current) } : null };
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
  const proposeFlight = useCallback((flight) => {
    if (!flight) return null;
    itineraryDismissedRef.current = true;
    if (travelRef.current.selectedFlight?.id !== flight.id) updateTravel({ selectedFlight: null, destination: "", gate: "", departureDateTime: "" }, "voice");
    pendingFlightRef.current = flight; setPendingFlight(flight); return flight;
  }, [updateTravel]);
  const confirmFlight = useCallback((flight, source = "voice") => { if (!flight) return null; itineraryDismissedRef.current = true; pendingFlightRef.current = null; setPendingFlight(null); updateTravel({ selectedFlight: flight, destination: flight.destination || "", gate: flight.gate || "", departureDateTime: flight.scheduledDeparture || "" }, source); return flight; }, [updateTravel]);
  const clearConfirmedFlight = useCallback(() => { itineraryDismissedRef.current = true; pendingFlightRef.current = null; setPendingFlight(null); updateTravel({ selectedFlight: null, destination: "", gate: "", departureDateTime: "" }, "voice"); return { cleared: true }; }, [updateTravel]);
  const refreshJourney = useCallback(async (query = "") => {
    if (!query && !journeyContextRef.current) setFlightContextStatus("loading");
    let lastError = new Error("Flight information is unavailable.");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt) await new Promise((resolve) => window.setTimeout(resolve, attempt === 1 ? 500 : 1500));
      try {
        const response = await fetch("/api/avolta-demo/journey-context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, demoNow: demoNowRef.current.toISOString() }) });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) { const error = new Error(payload.error || "Flight information is unavailable."); error.status = response.status; throw error; }
        if (!Array.isArray(payload.illustrativeFlights)) throw new Error("Flight information is unavailable.");
        journeyContextRef.current = payload; const matches = payload.flightSearch?.matches || []; flightMatchesRef.current = matches;
        setFlightContext(payload); if (!query) setFlightContextStatus("ready");
        if (!query && !travelRef.current.selectedFlight && !pendingFlightRef.current && !itineraryDismissedRef.current && payload.assumedFlight) updateTravel({ selectedFlight: payload.assumedFlight, destination: payload.assumedFlight.destination || "", gate: payload.assumedFlight.gate || "", departureDateTime: payload.assumedFlight.scheduledDeparture || "" }, "assumption");
        if (query && matches.length === 1) proposeFlight(matches[0]);
        return payload;
      } catch (error) {
        lastError = error;
        if (error.status && error.status < 500) break;
      }
    }
    if (!query) setFlightContextStatus(journeyContextRef.current ? "fallback" : "error");
    return { error: lastError.message || "Flight information is unavailable." };
  }, [proposeFlight, updateTravel]);
  const replayMinute = Math.floor(demoNow.getTime() / 60_000);
  useEffect(() => { if (clockReady) refreshJourney(); }, [clockReady, refreshJourney, replayMinute]);
  useEffect(() => {
    if (!clockReady) return undefined;
    const refreshOnResume = () => { if (document.visibilityState === "visible") refreshJourney(); };
    document.addEventListener("visibilitychange", refreshOnResume);
    return () => document.removeEventListener("visibilitychange", refreshOnResume);
  }, [clockReady, refreshJourney]);
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
  const disposeVoiceTransport = useCallback(() => {
    clearVoiceTimeout(); clearAudioPoll(); sessionRef.current?.close(); sessionRef.current = null; peerConnectionRef.current = null;
    const audio = audioOutputRef.current; if (audio) { audio.pause(); audio.srcObject = null; }
  }, [clearAudioPoll, clearVoiceTimeout]);
  const clearPendingVoiceApproval = useCallback(() => {
    setApprovalRequest((current) => {
      if (current?.type === "voice") { reviewRef.current = null; setReview(null); setActivePanel("basket"); }
      return null;
    });
  }, []);
  const closeVoiceSession = useCallback((message) => {
    voiceStartSequenceRef.current += 1; disposeVoiceTransport(); activeVoiceModelRef.current = null; setActiveVoiceModel(null);
    const verification = idleAvoltaRealtimeVerification(); voiceModelVerificationRef.current = verification; setVoiceModelVerification(verification);
    setVoiceStatus("idle"); setIsMuted(false); setSoundBlocked(false); setPlaybackState("idle"); setVoiceMessage(message); clearPendingVoiceApproval();
  }, [clearPendingVoiceApproval, disposeVoiceTransport]);

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

  const startVoice = useCallback(async (requestedModel = null) => {
    collapseIntro();
    const comparisonStart = requestedModel !== null;
    const selectedModel = requestedModel || DEFAULT_AVOLTA_REALTIME_MODEL;
    if (!isAllowedAvoltaRealtimeModel(selectedModel)) { setVoiceStatus("error"); setVoiceMessage("That voice model is unavailable."); return; }
    if (sessionRef.current && activeVoiceModelRef.current === selectedModel) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setVoiceStatus("unsupported"); setVoiceMessage("Voice needs a secure browser with microphone access."); return; }
    const sequence = ++voiceStartSequenceRef.current;
    disposeVoiceTransport(); clearPendingVoiceApproval(); activeVoiceModelRef.current = selectedModel; setActiveVoiceModel(selectedModel);
    const pendingVerification = beginAvoltaRealtimeVerification(sequence, selectedModel); voiceModelVerificationRef.current = pendingVerification; setVoiceModelVerification(pendingVerification);
    setVoiceStatus("connecting"); setVoiceMessage("Connecting…"); setPlaybackState("waiting"); setSoundBlocked(false); setAudioEvidence({ trackReceived: false, modelAudioStarted: false, bytesReceived: 0, totalAudioEnergy: 0 });
    let session = null;
    try {
      const [{ RealtimeAgent, RealtimeSession, OpenAIRealtimeWebRTC, tool }, { z }] = await Promise.all([import("@openai/agents/realtime"), import("zod")]);
      if (voiceStartSequenceRef.current !== sequence) return;
      const response = await fetch("/api/avolta-demo/realtime-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: selectedModel }) }); const payload = await response.json().catch(() => ({}));
      if (voiceStartSequenceRef.current !== sequence) return;
      if (!response.ok || !payload.value) throw new Error(payload.error || "Voice service is unavailable.");
      if (payload.requestedModel !== selectedModel) throw new Error("The selected voice model could not be confirmed.");
      const verification = beginAvoltaRealtimeVerification(sequence, selectedModel, payload.serverReportedModel);
      voiceModelVerificationRef.current = verification; setVoiceModelVerification(verification);
      if (verification.status === "mismatch") throw new Error("The selected voice model did not match the server response.");
      const audioElement = audioOutputRef.current; if (!audioElement) throw new Error("Audio output could not be initialized.");
      const transport = new OpenAIRealtimeWebRTC({ audioElement, changePeerConnection: async (peerConnection) => {
        if (voiceStartSequenceRef.current !== sequence) { peerConnection.close(); return peerConnection; }
        peerConnectionRef.current = peerConnection;
        peerConnection.addEventListener("track", (event) => { if (event.track?.kind !== "audio" || voiceStartSequenceRef.current !== sequence) return; if (mountedRef.current) setAudioEvidence((current) => ({ ...current, trackReceived: true })); window.setTimeout(() => { if (voiceStartSequenceRef.current === sequence) { ensureAudioPlayback(); collectAudioEvidence(); } }, 0); });
        return peerConnection;
      } });
      const agent = new RealtimeAgent({ name: "Avolta travel shopping concierge", voice: "marin", tools: buildTools(tool, z), instructions: `You are Avolta's warm, calm and perceptive English voice shopping concierge for Zürich Duty Free at Zürich Airport. Help each traveler discover something they will genuinely enjoy and choose the easiest convenient way to get it wherever they are in their journey. Adapt naturally to their location, available time and stated preferences.

Conversation contract:
- For every fresh comparison session, follow the supplied startup instruction exactly: say “Welcome to Avolta.” first, acknowledge the established destination and current boarding countdown when available, give the brief service promise, ask exactly one relevant question, then stop and wait.
- Never ask a second question, answer on the traveler's behalf, or continue simply because there is silence. Treat pauses as listening time. After any reply, say only what is useful, ask no more than one question, and listen again.
- This is a flexible conversation, not a flight-intake questionnaire. If the traveler asks for a product, gift, category, brand, price or idea at any point, help with that request immediately. Gather only the journey context that materially improves timing or fulfillment.
- Treat the selected flight in the initial interface state as the traveler's established starting itinerary for this demo. Do not ask them to confirm it and do not claim it came from a booking, airline account or personal record. Reuse anything the traveler has already volunteered about their flight, destination, location, available time, recipient or taste. Acknowledge corrections and update your understanding without making them repeat themselves.
- Let the traveler interrupt. Stop the current line of thought and address the interruption directly. Ordinary replies are one or two short sentences; avoid long lists, generic budget scripts and repeated summaries.

Discovery and guidance:
- Browse is open and product-first; gifting is only one possible intent. When no product intent is known, use one light question about what would make the journey better or what they feel like exploring.
- The selection contains ${products.length} public products captured on 2026-09-11. It is not the full assortment and public listing status is not live store stock.
- Use search_and_show_products for needs or options. Give one concrete, grounded reason for each recommendation and normally show one or two choices. Never claim images are visible until the tool confirms them. The full catalog remains independently browsable.
- Use show_product_details only when details would help or are requested. Save and compare are secondary capabilities; show their sheets only when requested.
- Call get_shopping_state before resolving “this,” “that,” ordinals, touch selections or bag changes. Touch selection is authoritative; otherwise use current viewport order.
- Never invent products, attributes, offers, exclusivity, prices, walking time, gates, stock, pickup eligibility or delivery services.

Journey and fulfillment:
- Do not run flight intake for the established starting itinerary. If the traveler corrects it, identify the replacement with the minimum clarification needed: use the flight number when supplied, otherwise destination and approximate time. Search with find_replay_flight, resolve genuine ambiguity, use propose_replay_flight, state the exact flight number, destination and departure time, then wait for explicit assent before confirm_replay_flight.
- Ask present location only when it changes practical advice, and record only what the traveler says with update_travel_context. Flight and time never prove location. Missing gate or boarding time stays unknown.
- A flight result's capturedObservation is end-of-day provenance only, never status history. Use the shared demo clock and structured replay status; never announce captured “Departed” text as an earlier-morning fact.
- Use assess_journey only for timing advice. Interpret available time conservatively, do not treat a delayed departure as extra shopping time without boarding evidence, and never guarantee a connection or boarding outcome.
- Use recommend_demo_fulfillment to recommend one supported next step rather than reciting a menu: browsing when there is ample time, collection when it fits the route, gate delivery only when supported, or the gate first when time is too tight. Explain the recommendation briefly and never invent walking time or promise infeasible delivery.

Order discipline:
- An order requires products, a confirmed flight and review_demo_order. Speak one concise review containing the items, quantities, total, destination and arrival or ready time. Ask for explicit approval and stop. Call confirm_demo_order only after an unambiguous affirmative response.
- Never treat silence, hesitation or an unrelated reply as order approval. Never imply payment, real stock hold, a store message, dispatch or notification. Do not volunteer a technical disclaimer unless asked.
- Announce only meaningful order-state changes, once, in one short sentence. Do not narrate tools, read countdowns constantly, or replay updates that happened while disconnected.

Internal operating context: this experience uses one captured airport day on a shared internal clock, and fulfillment has no real-world side effects. Keep that context internal during ordinary shopping and answer truthfully if asked.

Initial interface state: ${safe(stateSnapshot())}` });
      session = new RealtimeSession(agent, { model: selectedModel, transport, tracingDisabled: true, config: { outputModalities: ["audio"], audio: { input: { noiseReduction: { type: "near_field" }, transcription: { model: "gpt-4o-mini-transcribe", language: "en" }, turnDetection: { type: "semantic_vad", eagerness: "medium", createResponse: true, interruptResponse: true } }, output: { voice: "marin", speed: 1.03 } } } });
      const isCurrentSession = () => mountedRef.current && voiceStartSequenceRef.current === sequence && sessionRef.current === session;
      session.on("transport_event", (event) => {
        if (!isCurrentSession()) return;
        const nextVerification = applyAvoltaRealtimeSessionEvidence(voiceModelVerificationRef.current, sequence, event);
        if (nextVerification === voiceModelVerificationRef.current) return;
        voiceModelVerificationRef.current = nextVerification; setVoiceModelVerification(nextVerification);
        if (nextVerification.status !== "mismatch") return;
        voiceStartSequenceRef.current += 1; clearVoiceTimeout(); clearAudioPoll(); clearPendingVoiceApproval(); session.close();
        if (sessionRef.current === session) sessionRef.current = null;
        peerConnectionRef.current = null; const audio = audioOutputRef.current; if (audio) { audio.pause(); audio.srcObject = null; }
        activeVoiceModelRef.current = null; setActiveVoiceModel(null); setIsMuted(false); setSoundBlocked(false); setPlaybackState("idle");
        setVoiceStatus("error"); setVoiceMessage("The selected voice model did not match the active session.");
      });
      session.on("audio_start", () => { if (isCurrentSession()) { setAudioEvidence((current) => ({ ...current, modelAudioStarted: true })); setVoiceStatus("speaking"); setVoiceMessage("Speaking. Interrupt anytime."); ensureAudioPlayback(); collectAudioEvidence(); } });
      session.on("audio_stopped", () => { if (isCurrentSession()) { setVoiceStatus(session.muted ? "muted" : "listening"); setVoiceMessage(session.muted ? "Microphone muted." : "Listening. Speak naturally."); } });
      session.on("audio_interrupted", () => { if (isCurrentSession()) { setVoiceStatus("listening"); setVoiceMessage("Listening. Go ahead."); } });
      session.on("tool_approval_requested", (_context, _agent, request) => { if (isCurrentSession()) { setApprovalRequest({ type: "voice", request }); setActivePanel("review"); } });
      session.on("error", () => { if (isCurrentSession()) { setVoiceStatus("error"); setVoiceMessage("The voice connection had a problem. End it and try again."); } });
      sessionRef.current = session; await session.connect({ apiKey: payload.value });
      if (!isCurrentSession()) { if (sessionRef.current === session) sessionRef.current = null; session.close(); return; }
      await ensureAudioPlayback(); collectAudioEvidence();
      clearVoiceTimeout(); voiceTimeoutRef.current = window.setTimeout(() => { if (voiceStartSequenceRef.current === sequence) closeVoiceSession("Five-minute voice session ended. Start again anytime."); }, VOICE_DEMO_DURATION_MS);
      const freshOpening = firstVoiceOpening(travelRef.current.selectedFlight, demoNowRef.current, travelRef.current.stage);
      const startupInstruction = comparisonStart ? freshOpening : (voiceWelcomedRef.current ? RESUMED_VOICE_OPENING : freshOpening);
      voiceWelcomedRef.current = true;
      try {
        const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, voiceWelcomed: true }));
      } catch { /* The in-memory flag still prevents a repeated welcome in this page session. */ }
      setVoiceStatus("listening"); setVoiceMessage("Listening. Speak naturally."); session.sendMessage(startupInstruction);
    } catch (error) {
      session?.close();
      if (voiceStartSequenceRef.current !== sequence) return;
      clearAudioPoll(); if (sessionRef.current === session) sessionRef.current = null; peerConnectionRef.current = null; activeVoiceModelRef.current = null; setActiveVoiceModel(null); setVoiceStatus("error");
      if (voiceModelVerificationRef.current.generation === sequence && voiceModelVerificationRef.current.status !== "mismatch") { const verification = idleAvoltaRealtimeVerification(); voiceModelVerificationRef.current = verification; setVoiceModelVerification(verification); }
      setVoiceMessage(error?.name === "NotAllowedError" ? "Microphone access was not granted. Browsing is still available." : (error.message || "Voice service is unavailable."));
    }
  }, [buildTools, clearAudioPoll, clearPendingVoiceApproval, clearVoiceTimeout, closeVoiceSession, collapseIntro, collectAudioEvidence, disposeVoiceTransport, ensureAudioPlayback, products.length, stateSnapshot]);
  const toggleVoiceMute = useCallback(() => {
    const session = sessionRef.current; if (!session) return;
    const muted = !isMuted; session.mute(muted); setIsMuted(muted); setVoiceStatus(muted ? "muted" : "listening"); setVoiceMessage(muted ? "Microphone muted." : "Listening. Speak naturally.");
  }, [isMuted]);
  useEffect(() => () => { mountedRef.current = false; if (introTimerRef.current !== null) window.clearTimeout(introTimerRef.current); clearVoiceTimeout(); clearAudioPoll(); sessionRef.current?.close(); }, [clearAudioPoll, clearVoiceTimeout]);

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
  const scheduleEnded = clockAnchorRef.current ? replayClockState(clockAnchorRef.current, new Date()).scheduleEnded : false;
  const displayedFlight = pendingFlight || confirmedFlight;
  const displayedFlightStatus = replayFlightStatus(displayedFlight, demoNow);
  const displayedBoarding = boardingCountdown(displayedFlight, demoNow);
  const orderState = orderProgress(order, demoNow);
  const countdowns = confirmedFlight && order ? pairedCountdowns(confirmedFlight, order, demoNow) : null;
  const flightDisplayState = pendingFlight ? "candidate" : confirmedFlight ? "established" : "empty";
  const displayedDestination = displayedFlight?.destinationCode || displayedFlight?.destination || "Destination pending";
  const actionableFlightStatus = ["Scheduled", "Boarding window approaching"].includes(displayedFlightStatus.label) ? null : displayedFlightStatus.label;
  const journeyStage = normalizeJourneyStage(travel.stage);
  const journeyStartLabel = journeyStage === "unknown" ? "Your journey" : journeyStage === "at_gate" ? `At gate ${travel.gate || displayedFlight?.gate || ""}`.trim() : journeyStageLabel(journeyStage);
  const journeyStartDetail = journeyStage === "unknown" ? "Now" : "From what you shared";
  const timelineStatus = pendingFlight ? "Confirm replacement" : confirmedFlight ? (actionableFlightStatus || "Your flight") : flightContextStatus === "loading" ? "Finding your flight" : "Tell me your flight";
  const timelineCountdown = displayedFlight ? (displayedBoarding.known ? (displayedBoarding.seconds === 0 ? "Boarding time reached" : `${Math.max(1, Math.ceil(displayedBoarding.seconds / 60))} min to boarding`) : "Boarding time pending") : (scheduleEnded ? "No future flight available" : "Flight details pending");
  const flightIdentity = displayedFlight ? `${displayedFlight.flightNumber || "Flight pending"} · ${displayedDestination}` : "Your flight";
  const flightDetail = displayedFlight ? `${displayedFlight.gate ? `Gate ${displayedFlight.gate}` : "Gate pending"} · ${displayedFlight.boardingTime ? `Boarding ${formatClock(displayedFlight.boardingTime)}` : "Boarding time pending"}` : (flightContextStatus === "error" ? "Flight information unavailable" : "Share a number or destination");

  return (
    <main className={styles.page} data-audio-track={audioEvidence.trackReceived ? "received" : "none"} data-audio-model={audioEvidence.modelAudioStarted ? "started" : "waiting"} data-audio-bytes={audioEvidence.bytesReceived} data-audio-energy={audioEvidence.totalAudioEnergy} data-audio-playback={playbackState}>
      <audio ref={audioOutputRef} className={styles.audioOutput} autoPlay playsInline preload="auto" data-avolta-audio-output data-playback={playbackState} />
      <header className={styles.brandHeader} data-intro-expanded={introExpanded} data-at-top={atPageTop} data-shop-takeover={!atPageTop || voiceStatus !== "idle"} data-flight-state={flightDisplayState} data-has-order={Boolean(order)} aria-label="Avolta Zürich Duty Free">
        <div className={styles.brandHeaderInner}>
          <div className={styles.brandRow}>
            <div className={styles.brand}><Image className={styles.brandLogo} src="/avolta-demo/brand/avolta-logo.svg" alt="Avolta" width={141} height={25} priority /></div>
            <div className={styles.location}><strong>Zürich Duty Free</strong></div>
          </div>
          <section className={styles.arrivalIntro} aria-label="Voice shopping introduction" aria-hidden={!introExpanded}>
            <div className={styles.invitationCopy}>
              <p>Let’s find something you’ll love. We’ll help you get it before you fly.</p>
            </div>
            <div className={styles.zurichSignature} aria-hidden="true" />
          </section>
          <section className={styles.flightTimeline} data-flight-state={flightDisplayState} data-stage={journeyStage} data-context-status={flightContextStatus} aria-label={`${timelineStatus}. ${timelineCountdown}. ${flightIdentity}. ${flightDetail}.`}>
            <div className={styles.timelineText}>
              <div className={styles.timelineStart}><strong>{journeyStartLabel}</strong><span>{journeyStartDetail}</span></div>
              <div className={styles.timelineCountdown}><strong>{timelineCountdown}</strong><span>{timelineStatus}</span></div>
              <div className={styles.timelineEnd}><strong>{flightIdentity}</strong><span>{flightDetail}</span></div>
            </div>
            <div className={styles.timelineRail} aria-hidden="true">
              <i className={styles.timelineStartDot} />
              <span />
              {journeyStage !== "unknown" && <i className={styles.timelinePosition} data-stage={journeyStage} />}
              <i className={styles.timelineEndDot} />
            </div>
            {order && orderState && <div className={styles.orderPulse}><span>{order.fulfillment.method === "gate_delivery" ? "Gate delivery" : "Collection"}</span><strong>{orderState.state}</strong><b>{countdowns?.order.targetLabel}</b></div>}
          </section>
        </div>
      </header>

      <section className={styles.productSurface} aria-label="Zürich Duty Free products" onPointerDownCapture={collapseIntro} onKeyDownCapture={collapseIntro}>
        {focusedView && <div className={styles.resultsContext}><span>Selected for you</span><button type="button" onClick={() => showFullCollection("All")}>All products</button></div>}
        <div className={styles.productGrid}>{visibleProducts.map((product, index) => { const image = product.images[0]; const failed = imageFailures.has(product.id); const quantity = basket[product.id] || 0; const selected = selectedId === product.id; return <article className={styles.productCard} data-product-card={product.id} data-selected={selected} key={product.id}><button type="button" className={styles.productSelect} onClick={() => selectProduct(product.id)} aria-label={`Select ${product.vendor} ${product.name} for voice reference`} aria-pressed={selected}><div className={styles.imageWrap}><div className={styles.productImage} data-framing={productImageFraming(product)}>{!failed ? <Image data-product-image={product.id} src={image.localPath} alt={image.alt} fill priority={index === 0} loading={index === 0 ? undefined : index < 10 ? "eager" : "lazy"} sizes="(max-width: 980px) 50vw, 33vw" onError={(event) => { event.currentTarget.dataset.failed = "true"; imageFailuresRef.current.add(product.id); setImageFailures((current) => new Set(current).add(product.id)); }} /> : <span className={styles.imageFallback}>Photo unavailable</span>}</div><div className={styles.productText}><small>{product.vendor}</small><h2>{product.name}</h2><span>{product.variant}</span><strong>{formatMoney(product.priceChf)}</strong></div></div></button><div className={styles.cardAction}>{quantity ? <div className={styles.stepper} aria-label={`${product.name} quantity`}><button type="button" onClick={() => mutateBasket(product.id, 1, "remove")} aria-label={`Remove one ${product.name}`}><Minus size={15} aria-hidden="true" /></button><span>{quantity}</span><button type="button" onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add one ${product.name}`}><Plus size={15} aria-hidden="true" /></button></div> : <button type="button" onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add ${product.vendor} ${product.name} to bag`}><Plus size={23} strokeWidth={2.4} aria-hidden="true" /></button>}</div></article>; })}</div>
      </section>

      <section className={styles.controlDock} data-status={voiceStatus} data-has-session={hasVoiceSession} data-has-basket={hasBasket} data-voice-model-verification={voiceModelVerification.status} data-voice-requested-model={voiceModelVerification.requestedModel || ""} data-voice-server-reported-model={voiceModelVerification.serverReportedModel || ""} data-voice-session-reported-model={voiceModelVerification.sessionReportedModel || ""} data-voice-model-verification-source={voiceModelVerification.source || ""} aria-label="Shopping controls">
        <div className={styles.modelRow} aria-label="Choose voice model">
          {VOICE_MODEL_CHOICES.map((choice) => { const active = activeVoiceModel === choice.model; const connecting = active && voiceStatus === "connecting"; return <button className={styles.voiceModelAction} data-primary={choice.model === DEFAULT_AVOLTA_REALTIME_MODEL} data-active={active} type="button" key={choice.model} onClick={() => startVoice(choice.model)} disabled={active && (hasVoiceSession || connecting)} aria-label={`Start ${choice.label} voice session with ${choice.model}`} aria-pressed={active}><span className={styles.voiceGlyph}><Mic /></span><span className={styles.voiceModelLabel}><strong>{choice.label}</strong><small>{choice.model}</small></span>{connecting && <span className={styles.connectingIndicator} />}{active && hasVoiceSession && voiceStatus !== "connecting" && <span className={styles.readyIndicator} />}</button>; })}
        </div>
        {(hasVoiceSession || soundBlocked || hasBasket) && <div className={styles.dockRow}>
          {hasVoiceSession && <span className={styles.voiceStatusChip} data-status={voiceStatus}>{isMuted ? "Muted" : voiceStatus === "speaking" ? "Speaking" : voiceStatus === "connecting" ? "Connecting" : "Live"}</span>}
          {hasVoiceSession && <button className={styles.muteVoice} type="button" onClick={toggleVoiceMute} aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}>{isMuted ? <MicOff size={16} /> : <Mic size={16} />}<span>{isMuted ? "Unmute" : "Mute"}</span></button>}
          {soundBlocked && <button className={styles.soundButton} type="button" onClick={ensureAudioPlayback}>Enable sound</button>}
          {hasVoiceSession && <button className={styles.endVoice} type="button" onClick={() => closeVoiceSession("Talk to Order")} aria-label="End voice session"><X size={17} /></button>}
          {hasBasket && <button className={styles.basketTrigger} type="button" onClick={() => setActivePanel("basket")} aria-label={`Order bag, ${basketDetails.itemCount} ${basketDetails.itemCount === 1 ? "item" : "items"}, ${formatMoney(basketDetails.total)}`}><ShoppingBag size={17} /><span>{basketDetails.itemCount}</span><strong>{formatMoney(basketDetails.total)}</strong></button>}
        </div>}
        {(voiceStatus === "error" || voiceStatus === "unsupported") && <p className={styles.voiceNotice} role="status" aria-live="polite">{voiceMessage}</p>}
        {voiceStatus !== "error" && voiceStatus !== "unsupported" && <span className={styles.visuallyHidden} role="status" aria-live="polite">{voiceMessage}</span>}
      </section>

      {activePanel && <div className={styles.sheetBackdrop} onMouseDown={() => setActivePanel(null)}><section className={styles.sheet} role="dialog" aria-modal="true" aria-label={panelLabel} onMouseDown={(event) => event.stopPropagation()}><button className={styles.sheetClose} type="button" onClick={() => setActivePanel(null)} aria-label="Close"><X size={20} /></button>
        {activePanel === "detail" && selectedProduct && <><p className={styles.eyebrow}>Product details</p><h2>{selectedProduct.name}</h2><p className={styles.sheetBrand}>{selectedProduct.vendor}</p><div className={styles.detailImage}><Image src={selectedProduct.images[0].localPath} alt={selectedProduct.images[0].alt} fill sizes="420px" /></div><div className={styles.detailPrice}><strong>{formatMoney(selectedProduct.priceChf)}</strong>{selectedProduct.compareAtPriceChf && <del>{formatMoney(selectedProduct.compareAtPriceChf)}</del>}<span>{selectedProduct.variant}</span>{selectedProduct.promotionEvidence && <em>{selectedProduct.promotionEvidence}</em>}</div>{selectedProduct.description && <p className={styles.detailDescription}>{selectedProduct.description}</p>}<div className={styles.secondaryActions}><button type="button" data-active={shortlist[selectedProduct.id]} onClick={() => mutateShortlist(selectedProduct.id, !shortlist[selectedProduct.id])}><Heart size={17} fill={shortlist[selectedProduct.id] ? "currentColor" : "none"} /> {shortlist[selectedProduct.id] ? "Saved" : "Save"}</button><button type="button" data-active={comparison.includes(selectedProduct.id)} onClick={() => { const next = comparison.includes(selectedProduct.id) ? comparison.filter((id) => id !== selectedProduct.id) : [...comparison, selectedProduct.id]; setComparisonState(next); if (next.length === 2) setActivePanel("compare"); }}><GitCompareArrows size={17} /> Compare</button></div><button className={styles.primarySheetAction} type="button" onClick={() => mutateBasket(selectedProduct.id, 1, "add")}><Plus size={17} /> Add to bag</button><a className={styles.detailSource} href={selectedProduct.sourceUrl} target="_blank" rel="noreferrer">View product source</a></>}
        {activePanel === "saved" && <><p className={styles.eyebrow}>Saved for later</p><h2>{Object.keys(shortlist).length || "No"} saved</h2>{!Object.keys(shortlist).length ? <p className={styles.empty}>Ask the shop to save a product, or use Save inside product details.</p> : <div className={styles.sheetList}>{Object.keys(shortlist).map((id) => { const product = productsById.get(id); return product && <button type="button" key={id} onClick={() => showProductDetails(id)}><span>{product.vendor}<strong>{product.name}</strong><small>{product.variant}</small></span><b>{formatMoney(product.priceChf)}</b></button>; })}</div>}</>}
        {activePanel === "compare" && <><p className={styles.eyebrow}>Compare</p><h2>{comparison.length || "No"} selected</h2>{comparison.length < 2 && <p className={styles.empty}>Choose Compare inside the details of two products, or ask by voice.</p>}<div className={styles.compareList}>{comparison.map((id) => { const product = productsById.get(id); return product && <article key={id}><div className={styles.compareImage}><Image src={product.images[0].localPath} alt={product.images[0].alt} fill sizes="180px" /></div><small>{product.vendor}</small><h3>{product.name}</h3><p>{product.variant}</p><strong>{formatMoney(product.priceChf)}</strong><button type="button" onClick={() => setComparisonState(comparison.filter((item) => item !== id))}>Remove</button></article>; })}</div></>}
        {activePanel === "basket" && <><p className={styles.eyebrow}>Order bag</p><h2>{basketDetails.itemCount || "No"} {basketDetails.itemCount === 1 ? "item" : "items"}</h2>{reservation && <div className={styles.reservationResult}><span><Check size={16} /> Order confirmed</span><strong>{reservation.reference}</strong><p>{reservation.fulfillment.destination}</p><small>{orderProgress(reservation, demoNow)?.state}</small></div>}{!basketDetails.itemCount ? <p className={styles.empty}>Add a product when something catches your eye.</p> : <><div className={styles.basketItems}>{basketDetails.items.map((item) => <div className={styles.basketItem} key={item.productId}><div><strong>{item.brand} {item.name}</strong><small>{item.variant} · {formatMoney(item.unitPrice)}</small></div><div><b>{formatMoney(item.lineTotal)}</b><div className={styles.miniStepper}><button type="button" onClick={() => mutateBasket(item.productId, 1, "remove")}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => mutateBasket(item.productId, 1, "add")}><Plus size={13} /></button></div></div></div>)}</div>{travel.selectedFlight ? <p className={styles.flightReuse}>Confirmed {travel.selectedFlight.flightNumber || "flight"} to {travel.destination || travel.selectedFlight.destinationCode || "destination"}{travel.gate ? ` · Gate ${travel.gate}` : " · gate not assigned"}.</p> : <p className={styles.flightReuse}>Confirm your flight with the concierge before ordering.</p>}{reservationError && <p className={styles.error}>{reservationError}</p>}<div className={styles.total}><span>Total</span><strong>{formatMoney(basketDetails.total)}</strong></div><button className={styles.reviewButton} type="button" onClick={openTouchReview}>Review order</button></>}</>}
        {activePanel === "review" && review && <><p className={styles.eyebrow}>Review order</p><h2>{review.fulfillment.method === "gate_delivery" ? "Gate delivery" : "Collection"}</h2><div className={styles.pickup}><MapPin /><div><strong>{review.fulfillment.destination}</strong><span>{reviewFlight?.flightNumber || "Confirmed flight"} to {reviewFlight?.destination || reviewFlight?.destinationCode || "destination"}{reviewFlight?.gate ? ` · Gate ${reviewFlight.gate}` : ""}</span><span>{review.fulfillment.method === "gate_delivery" ? "Arrives" : "Ready"} in {review.fulfillment.etaMinutes} min</span></div></div><div className={styles.reviewItems}>{review.summary.items.map((item) => <p key={item.productId}><span>{item.quantity} × {item.brand} {item.name}<small>{item.variant}</small></span><strong>{formatMoney(item.lineTotal)}</strong></p>)}</div><div className={styles.total}><span>Total</span><strong>{formatMoney(review.summary.total)}</strong></div><div className={styles.reviewActions}><button type="button" onClick={rejectApproval}>Change bag</button><button type="button" onClick={confirmApproval}><Check size={17} /> Confirm order</button></div></>}
      </section></div>}
    </main>
  );
}

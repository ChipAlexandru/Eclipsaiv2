"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Captions,
  Check,
  MapPin,
  MicOff,
  Minus,
  Plus,
  Search,
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
import styles from "./julietteVoiceShop.module.css";

const IMAGE_WAIT_MS = 4500;
const VOICE_SESSION_DURATION_MS = 5 * 60 * 1000;

function formatChf(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(value);
}

function safeToolResult(value) {
  return JSON.stringify(value);
}

export function JulietteVoiceShop({ catalog }) {
  const products = catalog.products;
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const validProductIds = useMemo(() => new Set(productsById.keys()), [productsById]);

  const [visibleIds, setVisibleIds] = useState(() => products.map((product) => product.id));
  const [selectedId, setSelectedId] = useState(null);
  const [basket, setBasket] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [basketOpen, setBasketOpen] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Talk to Juliette");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [pickupSimulation, setPickupSimulation] = useState(null);
  const [imageFailures, setImageFailures] = useState(() => new Set());

  const sessionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const presentationSequenceRef = useRef(0);
  const productGridRef = useRef(null);
  const searchButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const captionsButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const drawerCloseRef = useRef(null);
  const pickupResultRef = useRef(null);
  const previousFocusRef = useRef(null);
  const visibleIdsRef = useRef(visibleIds);
  const selectedIdRef = useRef(selectedId);
  const basketRef = useRef(basket);
  const imageFailuresRef = useRef(new Set());

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const basketDetails = basketSummary(basket, productsById);
  const hasVoiceSession = Boolean(sessionRef.current);
  const hasCaptions = transcript.length > 0;
  const hasBasket = basketDetails.itemCount > 0;
  const isFullCatalogue = visibleIds.length === products.length
    && visibleIds.every((id, index) => id === products[index]?.id);

  const stateSnapshot = useCallback(() => shoppingStateSnapshot({
    visibleIds: visibleIdsRef.current,
    selectedId: selectedIdRef.current,
    basket: basketRef.current,
  }, productsById), [productsById]);

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

  const mutateBasket = useCallback((productId, quantity, mode, source = "touch") => {
    const next = changeBasket(basketRef.current, productId, quantity, mode, validProductIds);
    basketRef.current = next;
    setBasket(next);
    setPickupSimulation(null);
    if (source === "touch") queueMicrotask(() => sendInterfaceState("a basket touch action"));
    return basketSummary(next, productsById);
  }, [productsById, sendInterfaceState, validProductIds]);

  const selectProduct = useCallback((productId) => {
    presentationSequenceRef.current += 1;
    selectedIdRef.current = productId;
    setSelectedId(productId);
    queueMicrotask(() => sendInterfaceState("the shopper selected a product by touch"));
  }, [sendInterfaceState]);

  const createPickupSimulation = useCallback(() => {
    const summary = basketSummary(basketRef.current, productsById);
    if (summary.itemCount === 0) return null;
    const result = {
      location: "Juliette Erlenbach",
      ...summary,
      simulated: true,
    };
    setPickupSimulation(result);
    return result;
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
      description: "Search the public Juliette catalogue and immediately show the matching product photos. Use for needs, categories, product names, or recommendations.",
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
      }),
      execute: async ({ product_id: productId, quantity, mode }) => {
        try {
          const summary = mutateBasket(productId, quantity, mode, "voice");
          return safeToolResult({ ok: true, basket: summary });
        } catch (error) {
          return safeToolResult({ ok: false, error: error instanceof Error ? error.message : "Basket update failed." });
        }
      },
    });

    const preparePickup = realtimeTool({
      name: "prepare_simulated_pickup",
      description: "Open the shared basket review for a Juliette Erlenbach pickup preview. This never creates an order, payment, reservation, or store message. The shopper must use the single touch confirmation in that review.",
      parameters: zod.object({
        location: zod.literal("Juliette Erlenbach"),
      }),
      execute: async () => {
        const summary = basketSummary(basketRef.current, productsById);
        if (summary.itemCount === 0) return safeToolResult({ ok: false, error: "The basket is empty." });
        setBasketOpen(true);
        return safeToolResult({
          ok: true,
          basket: summary,
          awaitingTouchConfirmation: true,
          message: "The basket review is open. The shopper must tap Confirm pickup preview. No order has been placed.",
        });
      },
    });

    return [getShoppingState, searchProducts, showProducts, updateBasket, preparePickup];
  }, [mutateBasket, presentProducts, products, productsById, stateSnapshot]);

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
    closeVoiceSession("Talk to Juliette");
  }, [closeVoiceSession]);

  const startVoice = useCallback(async () => {
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
      const tokenResponse = await fetch("/api/juliette-demo/realtime-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const tokenPayload = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || !tokenPayload.value) {
        throw new Error(tokenPayload.error || "Voice service is unavailable.");
      }

      const initialSummary = stateSnapshot();
      const agent = new RealtimeAgent({
        name: "Juliette voice shopper",
        voice: "marin",
        instructions: `You are Juliette's concise English voice shopping assistant.

Keep speech warm, natural, brief, and easy to interrupt. Help the shopper discover products, see photos, change quantities, and prepare a pickup preview at Juliette Erlenbach.

Critical rules:
- Availability is not live physical-store inventory. When availability matters, say it must be confirmed with Juliette.
- Never say an order, reservation, payment, pickup, or store message is real. No real transaction is possible here.
- Use search_and_show_products whenever the shopper expresses a product need or asks for options. Describe as visible only the products returned in displayedProducts; below-fold products are not currently visible.
- Call get_shopping_state before interpreting words such as 'this one', 'that', or 'two of this one'. The touch-selected product is authoritative.
- Use only stable IDs returned by tools. Never invent products, prices, stock, ingredients, dietary suitability, or allergen facts.
- Do not make allergen assurances. Tell the shopper to confirm ingredients and allergens with Juliette.
- When the shopper asks to review pickup, summarize the basket and call prepare_simulated_pickup. It opens the same basket review used by touch. Do not say the pickup is confirmed; the shopper must use its single touch confirmation.
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
        closeVoiceSession("Talk to Juliette");
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
  }, [buildTools, clearVoiceTimeout, closeVoiceSession, isMuted, stateSnapshot]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearVoiceTimeout();
      if (sessionRef.current) sessionRef.current.close();
    };
  }, [clearVoiceTimeout]);

  const runTouchSearch = useCallback(async (event) => {
    event.preventDefault();
    const matches = searchCatalog(products, searchValue, 8);
    if (matches.length === 0) {
      setSearchStatus("No matching products.");
      return;
    }
    selectedIdRef.current = null;
    setSelectedId(null);
    setSearchStatus("Results updated.");
    await presentProducts(matches.map((product) => product.id));
    queueMicrotask(() => sendInterfaceState("a catalogue search by touch"));
  }, [presentProducts, products, searchValue, sendInterfaceState]);

  const showAllProducts = useCallback(async () => {
    setSearchValue("");
    setSearchStatus("");
    setSearchOpen(false);
    selectedIdRef.current = null;
    setSelectedId(null);
    await presentProducts(products.map((product) => product.id));
    requestAnimationFrame(() => searchButtonRef.current?.focus());
    queueMicrotask(() => sendInterfaceState("the full catalogue was restored"));
  }, [presentProducts, products, sendInterfaceState]);

  const openBasket = useCallback(() => setBasketOpen(true), []);
  const closeBasket = useCallback(() => setBasketOpen(false), []);
  const closeCaptions = useCallback(() => {
    setCaptionsOpen(false);
    requestAnimationFrame(() => captionsButtonRef.current?.focus());
  }, []);

  const confirmPickup = useCallback(() => {
    const result = createPickupSimulation();
    if (result) queueMicrotask(() => sendInterfaceState("the shopper confirmed a pickup preview; no order was placed"));
  }, [createPickupSimulation, sendInterfaceState]);

  useEffect(() => {
    if (!searchOpen) return;
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

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
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.brandMark}>
            <Image
              className={styles.brandLogo}
              src="/juliette-demo/brand/juliette-pain-damour.svg"
              alt="Juliette – pain d’amour"
              width={176}
              height={78}
              priority
            />
          </h1>
          <span className={styles.location}><MapPin size={14} aria-hidden="true" /> Erlenbach</span>
        </div>
        <button
          ref={searchButtonRef}
          className={styles.searchToggle}
          type="button"
          aria-expanded={searchOpen}
          aria-controls="juliette-search"
          onClick={() => setSearchOpen((open) => !open)}
        >
          {searchOpen ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          <span>{searchOpen ? "Close" : "Search"}</span>
        </button>
      </header>

      {searchOpen && (
        <form id="juliette-search" className={styles.searchTray} onSubmit={runTouchSearch} role="search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={searchInputRef}
            value={searchValue}
            onChange={(event) => { setSearchValue(event.target.value); setSearchStatus(""); }}
            placeholder="Search the Juliette catalogue"
            aria-label="Search Juliette catalogue"
          />
          <button type="submit" disabled={!searchValue.trim()}>Search</button>
          <span className={styles.visuallyHidden} aria-live="polite">{searchStatus}</span>
        </form>
      )}

      <section className={styles.productSurface} aria-label="Juliette products">
        {!isFullCatalogue && (
          <div className={styles.resultsContext}>
            <span>Search results</span>
            <button type="button" onClick={showAllProducts}>All products</button>
          </div>
        )}

        <div ref={productGridRef} className={styles.productGrid}>
          {visibleProducts.map((product, index) => {
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
                        sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 300px"
                        priority={index < 4}
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
                    <h2>{product.name}</h2>
                  </div>
                </button>
                <div className={styles.cardAction}>
                  <strong className={styles.productPrice}>{formatChf(product.priceChf)}</strong>
                  {quantity === 0 ? (
                    <button type="button" onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add ${product.name} to basket`}>
                      <Plus size={16} aria-hidden="true" /> Add
                    </button>
                  ) : (
                    <div className={styles.stepper} aria-label={`${product.name} quantity`}>
                      <button type="button" onClick={() => mutateBasket(product.id, 1, "remove")} aria-label={`Remove one ${product.name}`}><Minus size={16} aria-hidden="true" /></button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => mutateBasket(product.id, 1, "add")} aria-label={`Add one ${product.name}`}><Plus size={16} aria-hidden="true" /></button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className={styles.controlDock}
        data-status={voiceStatus}
        data-has-session={hasVoiceSession}
        data-has-captions={hasCaptions}
        data-has-basket={hasBasket}
        data-search-open={searchOpen}
        aria-label="Shopping controls"
      >
        <div className={styles.dockRow}>
          <button
            ref={voiceButtonRef}
            className={styles.voiceAction}
            type="button"
            onClick={startVoice}
            aria-label={sessionRef.current
              ? (isMuted ? "Unmute microphone" : "Mute microphone")
              : (voiceStatus === "error" || voiceStatus === "unsupported" ? "Try voice again" : "Talk to Juliette")}
            aria-describedby={voiceStatus === "error" || voiceStatus === "unsupported" ? "voice-error" : undefined}
            disabled={voiceStatus === "connecting"}
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
              <strong>{voiceStatus === "error" || voiceStatus === "unsupported" ? "Try voice again" : voiceMessage}</strong>
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
                <span>{item.role === "assistant" ? "Juliette" : "You"}</span>
                {item.text}
              </p>
            ))}
          </div>
        )}
      </section>

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
                <span>Juliette Erlenbach</span>
                <h2 id="basket-title">Your basket</h2>
              </div>
              <button ref={drawerCloseRef} type="button" onClick={closeBasket} aria-label="Close basket"><X aria-hidden="true" /></button>
            </header>

            {pickupSimulation && (
              <div ref={pickupResultRef} className={styles.pickupResult} role="status" tabIndex={-1}>
                <Check size={18} aria-hidden="true" />
                <div>
                  <strong>Pickup preview · Erlenbach</strong>
                  <span>No order placed</span>
                </div>
              </div>
            )}

            {basketDetails.items.length === 0 ? (
              <p className={styles.drawerEmpty}>Your basket is empty.</p>
            ) : (
              <>
                <div className={styles.basketItems}>
                  {basketDetails.items.map((item) => (
                    <div className={styles.basketItem} key={item.productId}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatChf(item.unitPriceChf)} each</span>
                      </div>
                      <div className={styles.basketItemRight}>
                        <strong>{formatChf(item.lineTotalChf)}</strong>
                        <div className={styles.miniStepper} aria-label={`${item.name} quantity in basket`}>
                          <button type="button" onClick={() => mutateBasket(item.productId, 1, "remove")} aria-label={`Remove one ${item.name}`}><Minus size={15} aria-hidden="true" /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => mutateBasket(item.productId, 1, "add")} aria-label={`Add one ${item.name}`}><Plus size={15} aria-hidden="true" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.drawerFooter}>
                  <div className={styles.total}><span>Total</span><strong>{formatChf(basketDetails.totalChf)}</strong></div>
                  {!pickupSimulation && (
                    <button className={styles.confirmPickup} type="button" onClick={confirmPickup}>
                      <Check size={18} aria-hidden="true" /> Confirm pickup preview
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

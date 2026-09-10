"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Mic,
  MicOff,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import {
  basketSummary,
  changeBasket,
  compactProduct,
  initialDemoProducts,
  sampleStockFor,
  searchCatalog,
  shoppingStateSnapshot,
  transcriptFromHistory,
} from "./shopping.mjs";
import styles from "./julietteVoiceShop.module.css";

const IMAGE_WAIT_MS = 4500;
const VOICE_DEMO_DURATION_MS = 5 * 60 * 1000;

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
  const initialProducts = useMemo(() => initialDemoProducts(products), [products]);

  const [visibleIds, setVisibleIds] = useState(() => initialProducts.map((product) => product.id));
  const [selectedId, setSelectedId] = useState(() => initialProducts[0]?.id || null);
  const [basket, setBasket] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceMessage, setVoiceMessage] = useState("Tap to start a natural voice conversation.");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [pickupSimulation, setPickupSimulation] = useState(null);
  const [imageFailures, setImageFailures] = useState(() => new Set());

  const sessionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const presentationSequenceRef = useRef(0);
  const visibleIdsRef = useRef(visibleIds);
  const selectedIdRef = useRef(selectedId);
  const basketRef = useRef(basket);
  const imageFailuresRef = useRef(new Set());

  const visibleProducts = visibleIds.map((id) => productsById.get(id)).filter(Boolean);
  const selectedProduct = selectedId ? productsById.get(selectedId) : null;
  const basketDetails = basketSummary(basket, productsById);

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

    while (performance.now() < deadline) {
      if (presentationSequenceRef.current !== sequence) {
        return { stale: true, displayedIds: [], failedIds: [] };
      }
      const displayedIds = [];
      const failedIds = [];
      for (const id of ids) {
        const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
        if (image?.complete && image.naturalWidth > 0) displayedIds.push(id);
        else if (image?.dataset.failed === "true" || imageFailuresRef.current.has(id)) failedIds.push(id);
      }
      if (displayedIds.length + failedIds.length === ids.length) {
        return { stale: false, displayedIds, failedIds };
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    const displayedIds = [];
    const failedIds = [];
    for (const id of ids) {
      const image = document.querySelector(`[data-product-image="${CSS.escape(id)}"]`);
      if (image?.complete && image.naturalWidth > 0) displayedIds.push(id);
      else failedIds.push(id);
    }
    return { stale: false, displayedIds, failedIds, timedOut: true };
  }, []);

  const presentProducts = useCallback(async (requestedIds, focusId = null) => {
    const ids = [...new Set(requestedIds)].filter((id) => validProductIds.has(id)).slice(0, 20);
    if (ids.length === 0) return { displayed: false, error: "No valid product IDs were provided." };

    const sequence = presentationSequenceRef.current + 1;
    presentationSequenceRef.current = sequence;
    visibleIdsRef.current = ids;
    setVisibleIds(ids);
    const nextSelectedId = focusId && ids.includes(focusId) ? focusId : ids[0];
    selectedIdRef.current = nextSelectedId;
    setSelectedId(nextSelectedId);

    const result = await waitForDisplayedImages(ids, sequence);
    if (result.stale) {
      return { displayed: false, stale: true, message: "A newer shopper selection replaced this request." };
    }

    const displayedProducts = result.displayedIds.map((id) => compactProduct(productsById.get(id)));
    const allDisplayed = result.displayedIds.length === ids.length;
    return {
      displayed: allDisplayed,
      displayedProducts,
      selectedProduct: compactProduct(productsById.get(selectedIdRef.current)),
      failedImageProductIds: result.failedIds,
      timedOut: Boolean(result.timedOut),
      message: allDisplayed
        ? "All requested product images are now displayed in the interface."
        : "Some requested images did not become ready. Only the products in displayedProducts are visibly displayed; do not say all images are ready.",
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
      reference: `JUL-DEMO-${String(Date.now()).slice(-4)}`,
      location: "Juliette Erlenbach",
      pickupWindow: "Tomorrow, 10:30–11:00",
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
      description: "Prepare a clearly labelled simulated pickup result for Juliette Erlenbach. This never creates an order, payment, reservation, or store message. Call only after summarizing the basket and asking the shopper to confirm.",
      parameters: zod.object({
        location: zod.literal("Juliette Erlenbach"),
      }),
      needsApproval: true,
      execute: async () => {
        const result = createPickupSimulation();
        if (!result) return safeToolResult({ ok: false, error: "The basket is empty." });
        return safeToolResult({
          ok: true,
          ...result,
          message: "Simulation complete. No order was created or sent to Juliette.",
        });
      },
    });

    return [getShoppingState, searchProducts, showProducts, updateBasket, preparePickup];
  }, [createPickupSimulation, mutateBasket, presentProducts, products, stateSnapshot]);

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
    setApprovalRequest(null);
  }, [clearVoiceTimeout]);

  const disconnectVoice = useCallback(() => {
    closeVoiceSession("Voice conversation ended. Tap to start again.");
  }, [closeVoiceSession]);

  const startVoice = useCallback(async () => {
    if (sessionRef.current) {
      const nextMuted = !isMuted;
      sessionRef.current.mute(nextMuted);
      setIsMuted(nextMuted);
      setVoiceStatus(nextMuted ? "muted" : "listening");
      setVoiceMessage(nextMuted ? "Microphone muted." : "Listening — speak naturally.");
      return;
    }

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setVoiceStatus("unsupported");
      setVoiceMessage("Voice needs a secure, modern browser with microphone access.");
      return;
    }

    setVoiceStatus("connecting");
    setVoiceMessage("Connecting securely…");

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
        instructions: `You are Juliette's concise English voice shopping assistant for a mobile demo.

Keep speech warm, natural, brief, and easy to interrupt. Help the shopper discover products, see photos, change quantities, and prepare a simulated pickup at Juliette Erlenbach.

Critical rules:
- This is a demonstration. Stock numbers are labelled sample data and are not live physical-store inventory.
- Never say an order, reservation, payment, pickup, or store message is real. No real transaction is possible here.
- Use search_and_show_products whenever the shopper expresses a product need or asks for options. Do not claim photos are visible until its result says they are displayed.
- Call get_shopping_state before interpreting words such as 'this one', 'that', or 'two of this one'. The touch-selected product is authoritative.
- Use only stable IDs returned by tools. Never invent products, prices, stock, ingredients, dietary suitability, or allergen facts.
- Do not make allergen assurances. Tell the shopper to confirm ingredients and allergens with Juliette.
- Before prepare_simulated_pickup, summarize the basket and explicitly ask for confirmation. The interface will require a final touch confirmation too.
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
        setVoiceMessage("Juliette is speaking — interrupt anytime.");
      });
      session.on("audio_stopped", () => {
        if (!mountedRef.current) return;
        setVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage(session.muted ? "Microphone muted." : "Listening — speak naturally.");
      });
      session.on("audio_interrupted", () => {
        if (!mountedRef.current) return;
        setVoiceStatus(session.muted ? "muted" : "listening");
        setVoiceMessage("Listening — go ahead.");
      });
      session.on("tool_approval_requested", (_context, _agent, request) => {
        if (mountedRef.current) setApprovalRequest({ type: "voice", request });
      });
      session.on("error", () => {
        console.error("Realtime session error");
        if (!mountedRef.current) return;
        setVoiceStatus("error");
        setVoiceMessage("The voice connection had a problem. End it and try again.");
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
        closeVoiceSession("Five-minute demo ended. Tap to start again.");
      }, VOICE_DEMO_DURATION_MS);
      setVoiceStatus("listening");
      setVoiceMessage("Listening — speak naturally.");
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
    const matches = searchCatalog(products, searchValue, 12);
    if (matches.length === 0) return;
    await presentProducts(matches.map((product) => product.id), matches[0].id);
    queueMicrotask(() => sendInterfaceState("a catalogue search by touch"));
  }, [presentProducts, products, searchValue, sendInterfaceState]);

  const resetProducts = useCallback(async () => {
    setSearchValue("");
    await presentProducts(initialProducts.map((product) => product.id), initialProducts[0]?.id);
    queueMicrotask(() => sendInterfaceState("the sample selection was restored"));
  }, [initialProducts, presentProducts, sendInterfaceState]);

  const confirmPickup = useCallback(async () => {
    const pending = approvalRequest;
    setApprovalRequest(null);
    if (pending?.type === "voice") {
      await sessionRef.current?.approve(pending.request.approvalItem);
    } else {
      createPickupSimulation();
    }
  }, [approvalRequest, createPickupSimulation]);

  const rejectPickup = useCallback(async () => {
    const pending = approvalRequest;
    setApprovalRequest(null);
    if (pending?.type === "voice") {
      await sessionRef.current?.reject(pending.request.approvalItem, {
        message: "The shopper did not confirm the simulated pickup.",
      });
    }
  }, [approvalRequest]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.backLink} href="/" aria-label="Back to Eclipsai home">
          <ArrowLeft size={17} aria-hidden="true" />
          Eclipsai
        </a>
        <div className={styles.wordmark}>juliette</div>
        <span className={styles.demoLabel}>Voice demo</span>
      </header>

      <section className={styles.intro} aria-labelledby="shop-title">
        <div>
          <div className={styles.stockBadge}>
            <Sparkles size={14} aria-hidden="true" />
            Sample Erlenbach stock · not live
          </div>
          <h1 id="shop-title">What would you like today?</h1>
          <p>Talk naturally, tap a product, or build the basket yourself.</p>
        </div>

        <div className={styles.voicePanel} data-status={voiceStatus}>
          <button
            className={styles.micButton}
            type="button"
            onClick={startVoice}
            aria-label={sessionRef.current ? (isMuted ? "Unmute microphone" : "Mute microphone") : "Start voice shopping"}
            disabled={voiceStatus === "connecting"}
          >
            {isMuted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
            <span className={styles.pulse} aria-hidden="true" />
          </button>
          <div className={styles.voiceCopy}>
            <strong>{voiceStatus === "idle" ? "Start voice shopping" : voiceMessage}</strong>
            <span>{voiceStatus === "idle" ? "English · five-minute demo · allow microphone access" : "OpenAI Realtime · WebRTC"}</span>
          </div>
          {sessionRef.current && (
            <button className={styles.endVoice} type="button" onClick={disconnectVoice}>End</button>
          )}
        </div>

        {transcript.length > 0 && (
          <div className={styles.transcript} aria-live="polite">
            {transcript.slice(-2).map((item) => (
              <p key={`${item.id}-${item.role}`} data-role={item.role}>
                <span>{item.role === "assistant" ? "Juliette" : "You"}</span>
                {item.text}
              </p>
            ))}
          </div>
        )}
      </section>

      <div className={styles.workspace}>
        <section className={styles.catalogue} aria-labelledby="selection-title">
          <div className={styles.catalogueHeader}>
            <div>
              <p className={styles.eyebrow}>Today’s sample selection</p>
              <h2 id="selection-title">{visibleProducts.length} products</h2>
            </div>
            <form className={styles.searchForm} onSubmit={runTouchSearch} role="search">
              <Search size={17} aria-hidden="true" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={`Search all ${products.length} products`}
                aria-label="Search Juliette catalogue"
              />
              {searchValue && (
                <button type="button" onClick={resetProducts} aria-label="Clear search"><X size={16} /></button>
              )}
            </form>
          </div>

          <div className={styles.productGrid}>
            {visibleProducts.map((product) => {
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
                          sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 260px"
                          priority={initialProducts.slice(0, 4).some((initial) => initial.id === product.id)}
                          onError={(event) => {
                            event.currentTarget.dataset.failed = "true";
                            imageFailuresRef.current.add(product.id);
                            setImageFailures((current) => new Set(current).add(product.id));
                          }}
                        />
                      ) : (
                        <span className={styles.imageFallback}>Photo unavailable</span>
                      )}
                      {selectedId === product.id && <span className={styles.selectedPill}>This one</span>}
                    </div>
                    <div className={styles.productText}>
                      <h3>{product.name}</h3>
                      <div>
                        <strong>{formatChf(product.priceChf)}</strong>
                        <span>Demo: {sampleStockFor(product.id)} left</span>
                      </div>
                    </div>
                  </button>
                  <div className={styles.cardAction}>
                    {quantity === 0 ? (
                      <button type="button" onClick={(event) => { event.stopPropagation(); mutateBasket(product.id, 1, "add"); }}>
                        <Plus size={16} aria-hidden="true" /> Add
                      </button>
                    ) : (
                      <div className={styles.stepper} aria-label={`${product.name} quantity`}>
                        <button type="button" onClick={(event) => { event.stopPropagation(); mutateBasket(product.id, 1, "remove"); }} aria-label={`Remove one ${product.name}`}><Minus size={15} /></button>
                        <span>{quantity}</span>
                        <button type="button" onClick={(event) => { event.stopPropagation(); mutateBasket(product.id, 1, "add"); }} aria-label={`Add one ${product.name}`}><Plus size={15} /></button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {visibleProducts.length !== initialProducts.length && (
            <button className={styles.resetButton} type="button" onClick={resetProducts}>
              See today’s sample selection
            </button>
          )}
        </section>

        <aside className={styles.basket} id="basket" aria-labelledby="basket-title">
          <div className={styles.basketTitle}>
            <div>
              <p className={styles.eyebrow}>Your basket</p>
              <h2 id="basket-title">{basketDetails.itemCount || "No"} {basketDetails.itemCount === 1 ? "item" : "items"}</h2>
            </div>
            <ShoppingBag aria-hidden="true" />
          </div>

          {pickupSimulation && (
            <div className={styles.simulationResult} role="status">
              <span><Check size={16} aria-hidden="true" /> Pickup preview ready</span>
              <strong>{pickupSimulation.pickupWindow}</strong>
              <p>Juliette Erlenbach · {pickupSimulation.reference}</p>
              <small>Simulation only — nothing was ordered, reserved, paid, or sent.</small>
            </div>
          )}

          {basketDetails.items.length === 0 ? (
            <div className={styles.emptyBasket}>
              <p>Tap Add, or say “two of this one” after selecting a product.</p>
              {selectedProduct && <span>Selected: {selectedProduct.name}</span>}
            </div>
          ) : (
            <div className={styles.basketItems}>
              {basketDetails.items.map((item) => (
                <div className={styles.basketItem} key={item.productId}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{formatChf(item.unitPriceChf)} each</span>
                  </div>
                  <div className={styles.basketItemRight}>
                    <strong>{formatChf(item.lineTotalChf)}</strong>
                    <div className={styles.miniStepper}>
                      <button type="button" onClick={() => mutateBasket(item.productId, 1, "remove")} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => mutateBasket(item.productId, 1, "add")} aria-label={`Add one ${item.name}`}><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.basketFooter}>
            <div><span>Sample total</span><strong>{formatChf(basketDetails.totalChf)}</strong></div>
            <button
              type="button"
              disabled={basketDetails.itemCount === 0}
              onClick={() => setApprovalRequest({ type: "touch" })}
            >
              Preview Erlenbach pickup
              <ChevronDown size={17} aria-hidden="true" />
            </button>
            <p>No checkout or payment in this demo.</p>
          </div>
        </aside>
      </div>

      <div className={styles.mobileBasketBar} data-visible={basketDetails.itemCount > 0}>
        <div><ShoppingBag size={18} aria-hidden="true" /><span>{basketDetails.itemCount} {basketDetails.itemCount === 1 ? "item" : "items"}</span><strong>{formatChf(basketDetails.totalChf)}</strong></div>
        <a href="#basket">Review</a>
      </div>

      {approvalRequest && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className={styles.confirmIcon}><ShoppingBag aria-hidden="true" /></div>
            <p className={styles.eyebrow}>Final confirmation</p>
            <h2 id="confirm-title">Preview this pickup?</h2>
            <p>{basketDetails.itemCount} {basketDetails.itemCount === 1 ? "item" : "items"} · {formatChf(basketDetails.totalChf)} · Juliette Erlenbach</p>
            <div className={styles.simulationNotice}>
              This only creates a simulated result on this screen. No real order, reservation, payment, or store message will be made.
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={rejectPickup}>Not now</button>
              <button type="button" onClick={confirmPickup}><Check size={17} /> Confirm simulation</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

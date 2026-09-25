"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Clock, Mic, Minus, Plus, ShoppingBag, Store, X } from "lucide-react";
import styles from "./honoldOrder.module.css";
import { CATEGORIES, basketTotals, buildMenu, chf, statusAt, STATUS_STEPS } from "./menu.mjs";
import { DEFAULT_STORE, STORES, hhmm, hoursLabel, hoursOn, localClock, resolvePickup, slotsFor, storeById } from "./stores.mjs";
import { t } from "./copy.mjs";
import * as actions from "./actions.mjs";
import { EMPTY_MEMORY, loadMemory, memoryContext, rememberOrder, rememberVisit, rememberWords, saveMemory } from "./memory.mjs";
import { buildTools, transcriptLines, voiceInstructions } from "./voice.mjs";
import { qrMatrix } from "../honold-demo/orderQr.mjs";

const SESSION_MS = 6 * 60 * 1000;
const WEEKDAYS = { de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };

function readStore(key, fallback) {
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function writeStore(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function readyText(pickup, lang, nowMs) {
  if (!pickup?.ok) return "–";
  const c = t(lang);
  const time = hhmm(pickup.minute);
  if (pickup.dayOffset === 0) return time;
  if (pickup.dayOffset === 1) return `${c.tomorrow} ${time}`;
  const { weekday } = localClock(nowMs);
  return `${WEEKDAYS[lang][(weekday + pickup.dayOffset) % 7]} ${time}`;
}

function readyPhrase(pickup, lang, nowMs) {
  if (!pickup?.ok) return "–";
  const time = hhmm(pickup.minute);
  const de = lang !== "en";
  if (pickup.dayOffset === 0) return de ? `Bereit um ${time}` : `Ready at ${time}`;
  if (pickup.dayOffset === 1) return de ? `Bereit morgen um ${time}` : `Ready tomorrow at ${time}`;
  const { weekday } = localClock(nowMs);
  const day = WEEKDAYS[de ? "de" : "en"][(weekday + pickup.dayOffset) % 7];
  return de ? `Bereit ${day} um ${time}` : `Ready ${day} at ${time}`;
}

const INITIAL = {
  lang: "de", view: "menu", sheet: null, category: "baeckerei", forYou: null,
  basket: {}, basketOrder: [], gifts: {}, proposal: null, acceptedProposal: null, storeId: DEFAULT_STORE, when: { mode: "asap" }, order: null, lastOrder: null, paying: false,
};

export function HonoldOrder({ catalog, voiceEnabled }) {
  const menu = useMemo(() => buildMenu(catalog), [catalog]);
  const [state, setState] = useState(INITIAL);
  const stateRef = useRef(INITIAL);
  const [nowMs, setNowMs] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [voice, setVoice] = useState({ status: "idle", message: "" });
  const modeRef = useRef("voice");
  const memoryRef = useRef(EMPTY_MEMORY);
  const listRef = useRef(null);
  const sessionRef = useRef(null);
  const sessionGenerationRef = useRef(0);
  const connectionAbortRef = useRef(null);
  const timerRef = useRef(null);
  const toolStateRef = useRef(null);
  const syncTimerRef = useRef(null);
  const c = t(state.lang);

  const commit = useCallback((patch) => {
    const prev = stateRef.current;
    const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  // Client-only clock and remembered preferences (avoids server/client time mismatch).
  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    memoryRef.current = loadMemory();
    const lastOrder = readStore("honold-order-last", null);
    commit({
      lang: readStore("honold-order-lang", "de"),
      lastOrder,
      storeId: memoryRef.current.storeId && storeById(memoryRef.current.storeId) ? memoryRef.current.storeId : DEFAULT_STORE,
    });
    return () => clearInterval(id);
  }, [commit]);

  const now = nowMs ?? 0;
  const pickup = useMemo(() => (nowMs ? resolvePickup(state.storeId, state.when, nowMs) : null), [state.storeId, state.when, nowMs]);
  const store = storeById(state.storeId);
  const totals = useMemo(() => basketTotals(state.basket, menu.byId, state.basketOrder), [state.basket, state.basketOrder, menu.byId]);
  const status = statusAt(state.order, now);

  // A chosen time that has passed falls back to "as soon as possible".
  useEffect(() => {
    if (pickup && !pickup.ok && state.when.mode === "at") commit({ when: { mode: "asap" } });
  }, [pickup, state.when, commit]);

  const toast = useCallback((text) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list.slice(-2), { id, text }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 2200);
  }, []);

  // ---------- one entry point for every button, used by touch and voice ----------
  const run = useCallback((name, args = {}, { viaVoice = false } = {}) => {
    const before = stateRef.current;
    const out = actions[name](before, args, { menu, nowMs: Date.now() });
    if (out.next) commit(out.next);
    if (!out.result.ok && !viaVoice) toast(({ basket_quantity_limit: "Maximal 99 pro Produkt", proposal_pending: "Bitte Auswahl zuerst übernehmen oder verwerfen", quantity_out_of_range: "Menge von 0 bis 99" })[out.result.reason] || "Bitte Auswahl prüfen");
    if (viaVoice) toolStateRef.current = stateRef.current;
    const after = stateRef.current;
    // side effects
    if (viaVoice && !before.proposal && (name === "updateBasket" || name === "orderAgain" || name === "acceptProposal")) {
      for (const [id, q] of Object.entries(after.basket)) {
        const diff = q - (before.basket[id] || 0);
        if (diff > 0) toast(`+${diff} ${menu.byId[id].name}`);
      }
    }
    if (name === "showProducts" || name === "browseCategory") listRef.current?.scrollTo?.({ top: 0, behavior: "smooth" });
    if (name === "setLanguage" && out.next) writeStore("honold-order-lang", out.next.lang);
    if (out.effect === "pay") {
      writeStore("honold-order-last", after.lastOrder);
      memoryRef.current = rememberOrder(memoryRef.current, { storeId: after.storeId, summary: after.lastOrder.summary });
      saveMemory(memoryRef.current);
      setTimeout(() => commit((s) => s.paying && s.order?.placedAtMs === after.order?.placedAtMs
        ? { ...s, paying: false, sheet: null, view: "order", basket: {}, basketOrder: [], forYou: null, acceptedProposal: null }
        : s), 1100);
    }
    if (name === "setPickup" && out.result.ok) {
      memoryRef.current = { ...memoryRef.current, storeId: stateRef.current.storeId };
      saveMemory(memoryRef.current);
    }
    return out.result;
  }, [commit, menu, toast]);

  const runRef = useRef(run);
  useEffect(() => { runRef.current = run; }, [run]);
  // ?debug=voice exposes the exact tool entry point so the voice flow can be tested without audio.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") !== "voice") return;
    window.__honoldOrderRun = (n, a) => runRef.current(n, a, { viaVoice: true });
  }, []);

  // touch helpers
  const tapQty = (id, quantity, mode) => run("updateBasket", { items: [{ id, quantity, mode }] });

  // ---------- voice ----------
  const stateLine = useCallback(() => JSON.stringify({
    now: (() => { const { weekday, minute } = localClock(Date.now()); return `${WEEKDAYS.en[weekday]} ${hhmm(minute)} Zurich`; })(),
    ...actions.screenSummary(stateRef.current, menu, Date.now()),
  }), [menu]);

  // Touch changes → one silent system note (debounced). Voice-made changes are skipped.
  useEffect(() => {
    if (stateRef.current === toolStateRef.current) return;
    const session = sessionRef.current;
    if (!session || session.transport?.status !== "connected") return;
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      try {
        session.transport.sendEvent({ type: "conversation.item.create", item: { type: "message", role: "system", content: [{ type: "input_text", text: `[Status] ${stateLine()}` }] } });
      } catch {}
    }, 500);
  }, [state.basket, state.storeId, state.when, state.view, state.sheet, state.category, state.proposal, state.gifts, stateLine]);

  // Language switch while talking: new instructions + transcription language.
  const langRef = useRef(state.lang);
  useEffect(() => {
    if (langRef.current === state.lang) return;
    langRef.current = state.lang;
    writeStore("honold-order-lang", state.lang);
    const session = sessionRef.current;
    if (!session || session.transport?.status !== "connected") return;
    try {
      session.transport.updateSessionConfig({
        instructions: voiceInstructions({ lang: state.lang, menu, stateLine: stateLine(), memoryLine: memoryContext(memoryRef.current, Date.now(), storeById(memoryRef.current.storeId)?.name) }),
        audio: { input: { transcription: { model: "gpt-4o-mini-transcribe", language: state.lang } } },
      });
    } catch {}
  }, [state.lang, menu, stateLine]);

  const endVoice = useCallback((message = "") => {
    sessionGenerationRef.current += 1;
    connectionAbortRef.current?.abort();
    connectionAbortRef.current = null;
    clearTimeout(timerRef.current);
    const session = sessionRef.current;
    sessionRef.current = null;
    try { session?.close(); } catch {}
    setVoice({ status: "idle", message });
  }, []);

  useEffect(() => () => endVoice(), [endVoice]);

  const TOOL_NAMES = ["updateBasket", "proposeOrder", "editProposal", "discardProposal", "reopenProposal", "proposeUsual", "acceptProposal", "setGift", "showProducts", "browseCategory", "setPickup", "goTo", "placeOrder", "orderAgain", "newOrder", "setLanguage"];

  // mode "voice": microphone + spoken answers (WebRTC). mode "text": typed questions, written answers (WebSocket, no microphone).
  const startSession = useCallback(async (mode = "voice", firstText = "") => {
    if (!voiceEnabled) { setVoice({ status: "idle", message: t(stateRef.current.lang).voiceOff }); return; }
    const generation = ++sessionGenerationRef.current;
    const controller = new AbortController();
    connectionAbortRef.current = controller;
    const lang = stateRef.current.lang;
    modeRef.current = mode;
    setVoice({ status: "connecting", message: t(lang).connecting });
    try {
      const [{ RealtimeAgent, RealtimeSession, tool }, { z }] = await Promise.all([import("@openai/agents/realtime"), import("zod")]);
      if (generation !== sessionGenerationRef.current) return;
      const tokenRes = await fetch("/api/honold-order/realtime-token", { method: "POST", signal: controller.signal });
      const token = await tokenRes.json().catch(() => ({}));
      if (generation !== sessionGenerationRef.current) return;
      if (!tokenRes.ok || !token.value) throw new Error("token");
      const memoryLine = memoryContext(memoryRef.current, Date.now(), storeById(memoryRef.current.storeId)?.name);
      memoryRef.current = rememberVisit(memoryRef.current, Date.now());
      saveMemory(memoryRef.current);
      const viaVoice = (name) => (args) => generation === sessionGenerationRef.current && sessionRef.current
        ? runRef.current(name, args, { viaVoice: true }) : { ok: false, reason: "stale_session" };
      const api = Object.fromEntries(TOOL_NAMES.map((n) => [n, viaVoice(n)]));
      const agent = new RealtimeAgent({
        name: "Honold",
        voice: "marin",
        instructions: voiceInstructions({ lang, menu, stateLine: stateLine(), memoryLine }),
        tools: buildTools({ tool, z, api, isCurrent: () => generation === sessionGenerationRef.current && Boolean(sessionRef.current) }),
      });
      const reasoning = token.reasoning ? { reasoning: { effort: token.reasoning } } : {};
      const session = new RealtimeSession(agent, mode === "text"
        ? { model: token.model || "gpt-realtime-2.1", transport: "websocket", tracingDisabled: true, config: { outputModalities: ["text"], ...reasoning } }
        : {
          model: token.model || "gpt-realtime-2.1",
          transport: "webrtc",
          tracingDisabled: true,
          config: {
            outputModalities: ["audio"],
            ...reasoning,
            audio: {
              input: {
                noiseReduction: { type: "near_field" },
                transcription: { model: "gpt-4o-mini-transcribe", language: lang },
                turnDetection: { type: "semantic_vad", eagerness: "high", createResponse: true, interruptResponse: true },
              },
              output: { voice: "marin", speed: 1.05 },
            },
          },
        });
      const live = () => sessionRef.current === session && generation === sessionGenerationRef.current;
      const ready = mode === "text" ? "typing" : "listening";
      session.on("history_updated", (history) => {
        if (!live()) return;
        const lines = transcriptLines(history);
        memoryRef.current = rememberWords(memoryRef.current, lines.filter((l) => l.role === "user").map((l) => l.text));
        saveMemory(memoryRef.current);
      });
      session.on("agent_start", () => { if (live()) setVoice((v) => ({ ...v, status: "thinking" })); });
      session.on("agent_tool_start", () => { if (live()) setVoice((v) => ({ ...v, status: "thinking" })); });
      session.on("audio_start", () => { if (live()) setVoice((v) => ({ ...v, status: "speaking" })); });
      session.on("audio_stopped", () => { if (live()) setVoice((v) => ({ ...v, status: ready })); });
      session.on("audio_interrupted", () => { if (live()) setVoice((v) => ({ ...v, status: ready })); });
      session.on("agent_end", () => { if (live()) setVoice((v) => (v.status === "thinking" ? { ...v, status: ready } : v)); });
      // A failed answer (e.g. the OpenAI account's tokens-per-minute limit) is retried after the wait OpenAI names.
      let retries = 0;
      session.on("transport_event", (e) => {
        if (!live() || e?.type !== "response.done") return;
        if (e.response?.status !== "failed") { retries = 0; return; }
        const err = e.response?.status_details?.error || {};
        if (retries >= 3) { setVoice((v) => ({ ...v, status: ready, message: t(stateRef.current.lang).busyGiveUp })); return; }
        retries += 1;
        const waitS = err.code === "rate_limit_exceeded" ? Math.min(12, Number(/in ([\d.]+)\s*s/.exec(err.message || "")?.[1] || 4)) + 0.4 : 1;
        setVoice((v) => ({ ...v, status: "thinking" }));
        setVoice((v) => ({ ...v, message: t(stateRef.current.lang).busy }));
        setTimeout(() => { if (live()) { try { session.transport.sendEvent({ type: "response.create" }); } catch {} } }, waitS * 1000);
      });
      session.on("error", (event) => {
        if (!live()) return;
        const kind = event?.error?.type || event?.error?.error?.type || "";
        if (/invalid_request|server_error/i.test(kind)) return; // keep the session on recoverable errors
        endVoice(t(stateRef.current.lang).voiceFailed);
      });
      sessionRef.current = session;
      await session.connect({ apiKey: token.value });
      if (!live()) { session.close(); return; }
      connectionAbortRef.current = null;
      session.transport.on?.("connection_change", (s) => { if (live() && s === "disconnected") endVoice(t(stateRef.current.lang).voiceFailed); });
      timerRef.current = setTimeout(() => endVoice(), SESSION_MS);
      setVoice({ status: ready, message: "" });
      if (mode === "text") session.sendMessage(firstText);
      else session.sendMessage("[Start] The customer just tapped the microphone. Give your OPENING now.");
    } catch (error) {
      if (generation !== sessionGenerationRef.current || error?.name === "AbortError") return;
      const denied = error?.name === "NotAllowedError" || /permission|microphone/i.test(error?.message || "");
      endVoice(denied ? t(stateRef.current.lang).micDenied : t(stateRef.current.lang).voiceFailed);
    }
  }, [endVoice, menu, stateLine, voiceEnabled]);

  // Microphone: start talking; tap again to stop. From a typed conversation it switches to voice.
  const onMic = useCallback(() => {
    if (voice.status === "connecting" || (sessionRef.current && modeRef.current === "voice")) { endVoice(); return; }
    if (sessionRef.current) endVoice();
    startSession("voice");
  }, [endVoice, startSession, voice.status]);

  // ---------- render ----------
  const listProducts = state.category === "foryou" && state.forYou
    ? state.forYou.ids.map((id) => menu.byId[id]).filter(Boolean)
    : menu.byCategory[state.category] || [];
  const listTitle = state.category === "foryou" && state.forYou
    ? state.forYou.title || c.forYou
    : CATEGORIES.find((x) => x.id === state.category)?.[state.lang === "en" ? "en" : "de"];

  const voiceActive = voice.status !== "idle";
  const isVoice = voiceActive && modeRef.current === "voice";

  return (
    <div className={styles.page} lang={state.lang === "en" ? "en" : "de-CH"} translate="no">
      <div className={styles.app} data-voice={voiceActive}>
        <header className={styles.header}>
          <button type="button" className={styles.logoButton} onClick={() => run("goTo", { view: "menu" })} aria-label="Honold">
            <img src="/honold-demo/brand/honold-logo.svg" alt="Honold" className={styles.logo} />
          </button>
          <div className={styles.lang} role="group" aria-label="Sprache / Language">
            {["de", "en"].map((l) => (
              <button key={l} type="button" aria-pressed={state.lang === l} onClick={() => run("setLanguage", { language: l })}>{l.toUpperCase()}</button>
            ))}
          </div>
        </header>

        {state.view === "menu" && (
          <>
            <button type="button" className={styles.pickupBar} onClick={() => run("goTo", { view: "pickup" })}>
              <Store size={20} aria-hidden="true" />
              <span className={styles.pickupText}>
                <small>{c.pickupAt}</small>
                <strong>{store?.name}</strong>
              </span>
              <span className={styles.readyChip}><Clock size={14} aria-hidden="true" />{nowMs ? readyText(pickup, state.lang, now) : "–"}</span>
              <ChevronRight size={18} aria-hidden="true" className={styles.chev} />
            </button>
            <p className={styles.tagline}>
              {nowMs && <span className={styles.greeting}>{c.greeting(localClock(now).minute)}</span>}
              {c.tagline}
            </p>
            {state.proposal && !state.sheet && (
              <div className={styles.draftBar}>
                <button type="button" onClick={() => run("goTo", { view: "proposal" })}>{state.lang === "en" ? "Continue selection" : "Auswahl weiterbearbeiten"} · {state.proposal.items.length}</button>
                <button type="button" onClick={() => run("discardProposal")} aria-label={state.lang === "en" ? "Discard selection" : "Auswahl verwerfen"}><X size={16} /></button>
              </div>
            )}
            {state.acceptedProposal && !state.proposal && (
              <button type="button" className={styles.editSelection} onClick={() => run("reopenProposal")}>{state.lang === "en" ? "Edit selection" : "Auswahl bearbeiten"}</button>
            )}

            {state.lastOrder && !totals.count && (
              <div className={styles.again}>
                <span><small>{c.lastOrder}</small>{state.lastOrder.summary}</span>
                <button type="button" onClick={() => run("orderAgain")}>{c.orderAgain}</button>
              </div>
            )}

            <div className={styles.menu}>
              <nav className={styles.rail} aria-label="Kategorien">
                {state.forYou && (
                  <button type="button" aria-pressed={state.category === "foryou"} className={styles.railForYou} onClick={() => commit({ category: "foryou" })}>{c.forYou}</button>
                )}
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} type="button" aria-pressed={state.category === cat.id} onClick={() => run("browseCategory", { category: cat.id })}>
                    {state.lang === "en" ? cat.en : cat.de}
                  </button>
                ))}
              </nav>
              <section className={styles.list} ref={listRef} aria-live="polite">
                <h2>{listTitle}</h2>
                {listProducts.map((p) => {
                  const qty = state.proposal ? state.proposal.items.find((i) => i.id === p.id)?.quantity || 0 : state.basket[p.id] || 0;
                  return (
                    <article key={p.id} className={styles.item} data-in-basket={qty > 0}>
                      <div className={styles.photo}>{p.image && <img src={p.image} alt="" loading="lazy" />}</div>
                      <div className={styles.itemText}>
                        <h3>{p.name}</h3>
                        <span>{chf(p.priceChf, state.lang)}</span>
                      </div>
                      {qty === 0 ? (
                        <button type="button" className={styles.addBtn} aria-label={`${c.add}: ${p.name}`} onClick={() => tapQty(p.id, 1, "add")}><Plus size={18} /></button>
                      ) : (
                        <div className={styles.stepper}>
                          <button type="button" aria-label="−" onClick={() => tapQty(p.id, qty - 1, "set")}><Minus size={15} /></button>
                          <span>{qty}</span>
                          <button type="button" aria-label="+" onClick={() => tapQty(p.id, 1, "add")}><Plus size={15} /></button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            </div>
          </>
        )}

        {state.view === "order" && state.order && (
          <OrderView order={state.order} status={status} lang={state.lang} now={now}
            onSkip={() => commit((s) => ({ ...s, order: actions.skipAhead(s.order) }))}
            onNew={() => run("newOrder")} />
        )}

        <div className={styles.toasts} aria-live="polite">
          {toasts.map((x) => <div key={x.id} className={styles.toast}><Check size={14} aria-hidden="true" />{x.text}</div>)}
        </div>

        <div className={styles.dock} data-sheet={Boolean(state.sheet)}>
          <button type="button" className={styles.mic} data-status={isVoice ? voice.status : "idle"} onClick={onMic}
            aria-label={isVoice || voice.status === "connecting" ? c.end : c.talk}>
            {isVoice && voice.status === "speaking" ? <span className={styles.bars} aria-hidden="true"><i /><i /><i /><i /></span>
              : isVoice || voice.status === "connecting" ? <X size={22} /> : <Mic size={22} />}
          </button>
          {(voiceActive || voice.message) && <span className={styles.voiceStatus} role="status">{voice.message ||
            (voice.status === "connecting" ? c.connecting : voice.status === "listening" ? c.listening : voice.status === "thinking" ? c.thinking : "")}</span>}
          {totals.count > 0 && state.view === "menu" && !state.sheet && (
            <button type="button" className={styles.cartPill} onClick={() => run("goTo", { view: "checkout" })} aria-label={c.toCheckout}>
              <span className={styles.cartIcon}><ShoppingBag size={17} aria-hidden="true" /><b>{totals.count}</b></span>
              <strong>{chf(totals.totalChf, state.lang)}</strong>
            </button>
          )}
        </div>

        {state.sheet && (
          <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget && !state.paying) run("goTo", { view: "menu" }); }}>
            {state.sheet === "proposal" && state.proposal && (
              <ProposalSheet lang={state.lang} proposal={state.proposal} menu={menu} store={store} pickup={pickup} now={now}
                onQty={(id, q) => run("adjustProposal", { id, quantity: q })}
                onHeadcount={(headcount) => run("editProposal", { headcount })}
                onGift={(id, gift) => run("setGift", { id, ...gift })}
                onChangePickup={() => commit({ sheet: "pickup", pickupReturn: "proposal" })}
                onAccept={() => run("acceptProposal")}
                onBrowse={() => run("goTo", { view: "menu" })}
                onDiscard={() => run("discardProposal")}
                onClose={() => run("goTo", { view: "menu" })} />
            )}
            {state.sheet === "checkout" && (
              <CheckoutSheet lang={state.lang} totals={totals} gifts={state.gifts} store={store} pickup={pickup} now={now} paying={state.paying} proposal={state.proposal}
                onGift={(id, gift) => run("setGift", { id, ...gift, target: "basket" })}
                onClose={() => run("goTo", { view: "menu" })}
                onOpenProposal={() => run("goTo", { view: "proposal" })}
                onChangePickup={() => run("goTo", { view: "pickup" })}
                onQty={(id, q) => run("updateBasket", { items: [{ id, quantity: q, mode: "set" }], target: "basket" })}
                onPay={() => run("placeOrder", { customerSaidYes: true, basketOnly: true })} />
            )}
            {state.sheet === "pickup" && (
              <PickupSheet lang={state.lang} state={state} now={now}
                onStore={(id) => run("setPickup", { storeId: id, time: null, day: null })}
                onWhen={(when) => commit({ when })}
                onDone={() => commit({ sheet: stateRef.current.pickupReturn || null, pickupReturn: null })} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GiftControls({ lang, id, gift, onGift }) {
  const c = t(lang);
  const g = gift || { ribbon: false, card: null };
  return (
    <div className={styles.gift}>
      <button type="button" aria-pressed={g.ribbon} onClick={() => onGift(id, { ribbon: !g.ribbon, card: g.card })}>{c.ribbon}</button>
      <select aria-label={c.card} value={g.card || ""} onChange={(e) => onGift(id, { ribbon: g.ribbon, card: e.target.value || null })}>
        <option value="">{c.noCard}</option>
        {actions.CARD_TEXTS.map((x) => <option key={x} value={x}>{c.card}: {x}</option>)}
      </select>
    </div>
  );
}

function ProposalSheet({ lang, proposal, menu, store, pickup, now, onQty, onHeadcount, onGift, onChangePickup, onAccept, onBrowse, onDiscard, onClose }) {
  const c = t(lang);
  const lines = proposal.items.map((i) => ({ ...menu.byId[i.id], ...i, lineChf: Math.round(menu.byId[i.id].priceChf * i.quantity * 100) / 100 }));
  const total = Math.round(lines.reduce((s, l) => s + l.lineChf, 0) * 100) / 100;
  const pieces = lines.reduce((s, l) => s + l.quantity, 0);
  return (
    <section className={styles.sheet} role="dialog" aria-label={proposal.title || c.suggestion}>
      <header className={styles.sheetHead}>
        <div>
          <small className={styles.kicker}>{c.suggestion}</small>
          <h2>{proposal.title || c.suggestion}</h2>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label={c.close}><X size={18} /></button>
      </header>
      {proposal.headcount && <div className={styles.headcountRow}><span>{lang === "en" ? "People" : "Personen"}</span><div className={styles.stepper}>
        <button type="button" aria-label={lang === "en" ? "Fewer people" : "Weniger Personen"} disabled={proposal.headcount <= 1} onClick={() => onHeadcount(proposal.headcount - 1)}><Minus size={14} /></button>
        <span>{proposal.headcount}</span>
        <button type="button" aria-label={lang === "en" ? "More people" : "Mehr Personen"} disabled={proposal.headcount >= 99} onClick={() => onHeadcount(proposal.headcount + 1)}><Plus size={14} /></button>
      </div></div>}
      {proposal.constraints && <p className={styles.constraint}>{proposal.constraints}{/allerg|gluten|vegan|vegetar|laktose|lactose|nuss|nut|ei\b|egg|diet/i.test(proposal.constraints) && <small>{lang === "en" ? "Please confirm dietary details with the shop." : "Bitte Ernährungsangaben in der Filiale bestätigen."}</small>}</p>}
      <div className={styles.lines}>
        {lines.map((l) => (
          <div key={l.id} className={styles.line}>
            <div className={styles.linePhoto}>{l.image && <img src={l.image} alt="" />}</div>
            <span className={styles.lineName}>{l.name}</span>
            <div className={styles.stepper}>
              <button type="button" aria-label="−" onClick={() => onQty(l.id, l.quantity - 1)}><Minus size={14} /></button>
              <span>{l.quantity}</span>
              <button type="button" aria-label="+" disabled={l.quantity >= 99} onClick={() => onQty(l.id, l.quantity + 1)}><Plus size={14} /></button>
            </div>
            <span className={styles.linePrice}>{l.quantity} × {chf(l.priceChf, lang)}</span>
            {actions.GIFT_CATEGORIES.has(l.category) && <GiftControls lang={lang} id={l.id} gift={l.gift} onGift={onGift} />}
          </div>
        ))}
      </div>
      <button type="button" className={styles.browseMore} onClick={onBrowse}>{lang === "en" ? "Browse products" : "Produkte ansehen"}</button>
      <button type="button" className={styles.row} onClick={onChangePickup}>
        <Store size={18} aria-hidden="true" />
        <span><small>{c.pickup}</small><strong>{store?.name} · {readyPhrase(pickup, lang, now)}</strong></span>
        <em>{c.change}</em>
      </button>
      <div className={styles.totalRow}><span>{c.pieces(pieces)}{proposal.headcount ? ` · ${chf(total / proposal.headcount, lang)} ${lang === "en" ? "per person" : "pro Person"}` : ""}</span><strong>{chf(total, lang)}</strong></div>
      <button type="button" className={styles.payBtn} disabled={!pieces} onClick={onAccept}>{c.addToBasket}</button>
      <button type="button" className={styles.discardBtn} onClick={onDiscard}>{lang === "en" ? "Discard selection" : "Auswahl verwerfen"}</button>
    </section>
  );
}

function CheckoutSheet({ lang, totals, gifts, store, pickup, now, paying, proposal, onGift, onClose, onOpenProposal, onChangePickup, onQty, onPay }) {
  const c = t(lang);
  return (
    <section className={styles.sheet} role="dialog" aria-label={c.yourOrder}>
      <header className={styles.sheetHead}>
        <h2>{c.yourOrder}</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label={c.close}><X size={18} /></button>
      </header>
      {totals.lines.length === 0 && <p className={styles.empty}>{c.empty}</p>}
      {proposal && <button type="button" className={styles.pendingDraft} onClick={onOpenProposal}>{lang === "en" ? "Selection saved separately · edit" : "Auswahl separat gespeichert · bearbeiten"}</button>}
      <div className={styles.lines}>
        {totals.lines.map((l) => (
          <div key={l.id} className={styles.line}>
            <div className={styles.linePhoto}>{l.image && <img src={l.image} alt="" />}</div>
            <span className={styles.lineName}>{l.name}</span>
            <div className={styles.stepper}>
              <button type="button" aria-label="−" onClick={() => onQty(l.id, l.quantity - 1)}><Minus size={14} /></button>
              <span>{l.quantity}</span>
              <button type="button" aria-label="+" onClick={() => onQty(l.id, l.quantity + 1)}><Plus size={14} /></button>
            </div>
            <span className={styles.linePrice}>{chf(l.lineChf, lang)}</span>
            {actions.GIFT_CATEGORIES.has(l.category) && <GiftControls lang={lang} id={l.id} gift={gifts?.[l.id]} onGift={onGift} />}
          </div>
        ))}
      </div>
      <button type="button" className={styles.row} onClick={onChangePickup}>
        <Store size={18} aria-hidden="true" />
        <span><small>{c.pickup}</small><strong>{store?.name} · {readyPhrase(pickup, lang, now)}</strong></span>
        <em>{c.change}</em>
      </button>
      <div className={styles.row} aria-label={c.payment}>
        <span className={styles.twint}>TWINT</span>
        <span><small>{c.payment}</small><strong>TWINT</strong></span>
      </div>
      <div className={styles.totalRow}><span>{c.total}</span><strong>{chf(totals.totalChf, lang)}</strong></div>
      <button type="button" className={styles.payBtn} data-paying={paying} disabled={!totals.count || paying || !pickup?.ok} onClick={onPay}>
        {paying ? <><span className={styles.spinner} aria-hidden="true" />{c.paying}</> : c.pay(chf(totals.totalChf, lang))}
      </button>
      <p className={styles.demoNote}>{c.demoNote}</p>
    </section>
  );
}

function PickupSheet({ lang, state, now, onStore, onWhen, onDone }) {
  const c = t(lang);
  const [day, setDay] = useState(state.when.mode === "at" ? state.when.dayOffset : 0);
  const { weekday } = localClock(now);
  const asap = resolvePickup(state.storeId, { mode: "asap" }, now);
  const slots = slotsFor(state.storeId, now, day);
  return (
    <section className={styles.sheet} role="dialog" aria-label={c.chooseStore}>
      <header className={styles.sheetHead}>
        <h2>{c.chooseStore}</h2>
        <button type="button" className={styles.close} onClick={onDone} aria-label={c.close}><X size={18} /></button>
      </header>
      <h3 className={styles.label}>{c.store}</h3>
      <div className={styles.stores}>
        {STORES.map((s) => {
          const hours = hoursOn(s, weekday);
          return (
            <button key={s.id} type="button" aria-pressed={state.storeId === s.id} onClick={() => onStore(s.id)}>
              <strong>{s.name}</strong>
              <small>{s.address}</small>
              <em>{c.today}: {hoursLabel(hours) || c.closed}</em>
            </button>
          );
        })}
      </div>
      <h3 className={styles.label}>{c.time}</h3>
      <button type="button" className={styles.asap} aria-pressed={state.when.mode === "asap"} onClick={() => onWhen({ mode: "asap" })}>
        <Clock size={16} aria-hidden="true" />{c.readyAsap}<b>{readyText(asap, lang, now)}</b>
      </button>
      <div className={styles.days}>
        {[0, 1].map((d) => (
          <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)}>{d === 0 ? c.today : c.tomorrow[0].toUpperCase() + c.tomorrow.slice(1)}</button>
        ))}
      </div>
      <div className={styles.slots}>
        {slots.length === 0 && <p className={styles.empty}>{c.closed}</p>}
        {slots.map((s) => (
          <button key={s.minute} type="button" aria-pressed={state.when.mode === "at" && state.when.dayOffset === day && state.when.minute === s.minute}
            onClick={() => onWhen({ mode: "at", dayOffset: day, minute: s.minute })}>{hhmm(s.minute)}</button>
        ))}
      </div>
      <button type="button" className={styles.payBtn} onClick={onDone}>{c.done}</button>
    </section>
  );
}

function OrderView({ order, status, lang, now, onSkip, onNew }) {
  const c = t(lang);
  const store = storeById(order.storeId);
  const stepIndex = STATUS_STEPS.indexOf(status);
  const ready = readyPhrase(order.readyMinute != null ? { ok: true, minute: order.readyMinute, dayOffset: order.readyDayOffset } : null, lang, order.placedAtMs);
  const qr = qrMatrix(`HONOLD-DEMO|${order.number}|${order.storeId}|${order.placedAtMs}`);
  return (
    <section className={styles.orderView} data-status={status}>
      <p className={styles.orderLead}>{c.statusLead[status]}</p>
      <div className={styles.numberCard}>
        <small>{c.pickupNumber}</small>
        <strong>{order.number}</strong>
        <span>{store?.name} · {ready}</span>
        <svg className={styles.pickupQr} role="img" aria-label={lang === "en" ? "Demo pickup QR code" : "Demo Abhol-QR-Code"} viewBox={`-2 -2 ${qr.length + 4} ${qr.length + 4}`} shapeRendering="crispEdges">
          <rect x="-2" y="-2" width={qr.length + 4} height={qr.length + 4} fill="white" />
          {qr.flatMap((row, y) => row.map((black, x) => black ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#2d190f" /> : null))}
        </svg>
      </div>
      <button type="button" className={styles.progress} onClick={onSkip} aria-label={c.timelapse}>
        <ol>
          {STATUS_STEPS.map((s, i) => (
            <li key={s} data-done={i <= stepIndex} data-current={i === stepIndex}><i aria-hidden="true">{i < stepIndex || status === "ready" ? <Check size={12} /> : null}</i>{c.status[s]}</li>
          ))}
        </ol>
        <div className={styles.track}><span style={{ width: `${(stepIndex / 2) * 100}%` }} /></div>
      </button>
      <p className={styles.counterHint}>{c.counterHint}</p>
      <div className={styles.orderLines}>
        {order.lines.map((l) => <div key={l.id}><span>{l.quantity}× {l.name}{l.gift && <small className={styles.giftNote}>{actions.giftLabel(l.gift, lang)}</small>}</span><span>{chf(l.lineChf, lang)}</span></div>)}
        <div className={styles.orderTotal}><span>{c.total} · TWINT</span><strong>{chf(order.totalChf, lang)}</strong></div>
      </div>
      <p className={styles.address}>{store?.address}</p>
      <button type="button" className={styles.payBtn} onClick={onNew}>{c.newOrder}</button>
      <p className={styles.demoNote}>{c.demoNote}</p>
    </section>
  );
}

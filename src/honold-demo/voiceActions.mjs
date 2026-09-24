const DEFAULT_TIMEOUT_MS = 2500;

export function checkoutQuestion(validation, language = "en") {
  const reason = validation?.reason || "";
  const german = language === "de";
  if (/Add a product/i.test(reason)) return german ? "Was möchtest du in den Warenkorb legen?" : "What would you like to add to your basket?";
  if (/pickup branch/i.test(reason)) return german ? "In welcher Filiale möchtest du abholen?" : "Which store would you like to collect from?";
  if (/pickup slot|pickup time/i.test(reason)) return german ? "An welchem Tag und zu welcher Zeit möchtest du abholen?" : "Which day and time would you like to collect?";
  if (/delivery address/i.test(reason)) return german ? "An welche Adresse sollen wir liefern?" : "What address should we deliver to?";
  if (/delivery window/i.test(reason)) return german ? "Welches Lieferfenster passt dir?" : "Which delivery window works for you?";
  if (/stock/i.test(reason)) return german ? "Möchtest du die Menge anpassen oder eine andere Filiale wählen?" : "Would you like to change the quantity or choose another store?";
  return german ? "Welche Angabe möchtest du als Nächstes ergänzen?" : "Which detail would you like to choose next?";
}

export function screenFromSnapshot(snapshot = {}) {
  const ui = snapshot.ui || {};
  return {
    view: ui.view || "shop",
    modal: ui.modal || null,
    selectedProductId: ui.selectedProductId || null,
    selectedOrderId: ui.selectedOrderId || null,
  };
}

export function connectionRecovery(status, intentional = false) {
  if (status !== "disconnected" || intentional) return null;
  return { voiceStatus: "error", messageKey: "voiceDisconnected", retryAvailable: true };
}

export function resolvePanelTransition({
  view = "shop",
  modal = null,
  underlay = null,
  selectedProductId = null,
  selectedOrderId = null,
  detailOptions = { message: "None", wrap: "Standard" },
  orderDetailsOpen = false,
} = {}) {
  const basketOpen = modal === "basket" || (modal === "fulfillment" && underlay === "basket");
  return {
    view,
    modal,
    basketOpen,
    fulfillmentOpen: modal === "fulfillment",
    detailProductId: modal === "product_detail" ? selectedProductId : null,
    selectedProductId,
    selectedOrderId,
    detailOptions,
    orderDetailsOpen: view === "order_status" && Boolean(orderDetailsOpen),
  };
}

export function createPanelActionController(commit, getBasketOpen = () => false) {
  return {
    openBasket: (extra = {}) => commit({ view: "shop", modal: "basket", ...extra }),
    closePanels: (extra = {}) => commit({ view: "shop", modal: null, ...extra }),
    openProduct: (selectedProductId, detailOptions) => commit({ view: "shop", modal: "product_detail", selectedProductId, detailOptions }),
    openFulfillment: (keepBasket = getBasketOpen()) => commit({ view: "shop", modal: "fulfillment", underlay: keepBasket ? "basket" : null }),
    closeFulfillment: () => commit({ view: "shop", modal: getBasketOpen() ? "basket" : null }),
    checkout: (needsDetail) => commit(needsDetail
      ? { view: "shop", modal: "fulfillment", underlay: "basket" }
      : { view: "shop", modal: "basket" }),
    showOrders: () => commit({ view: "orders", modal: null, selectedOrderId: null }),
    showOrderStatus: (selectedOrderId, orderDetailsOpen = false) => commit({ view: "order_status", modal: null, selectedOrderId, orderDetailsOpen }),
    continueShopping: () => commit({ view: "shop", modal: null, selectedOrderId: null }),
  };
}

export function createCustomerActionController(handlers) {
  return {
    open_basket: () => handlers.openBasket(),
    close_basket: () => handlers.closeBasket(),
    open_fulfillment: () => handlers.openFulfillment(),
    close_fulfillment: () => handlers.closeFulfillment(),
    search_products: (input, context) => handlers.searchProducts(input, context),
    show_products: (input, context) => handlers.showProducts(input, context),
    browse_category: ({ category }, context) => handlers.browseCategory(category, context),
    open_product: ({ productId }) => handlers.openProduct(productId),
    close_product: () => handlers.closeProduct(),
    set_product_options: (input) => handlers.setProductOptions(input),
    update_basket: (input, context) => handlers.updateBasket(input, context),
    set_fulfillment: (input) => handlers.setFulfillment(input),
    start_checkout: () => handlers.startCheckout(),
    approve_order: ({ reviewId, fingerprint, intent }) => handlers.approveExactReview(intent, { reviewId, fingerprint }),
    show_orders: () => handlers.showOrders(),
    open_order: ({ orderId }) => handlers.openOrder(orderId),
    show_status: ({ orderId }) => handlers.openOrder(orderId),
    toggle_order_details: ({ open }) => handlers.toggleOrderDetails(open),
    reorder: ({ orderId }) => handlers.reorder(orderId),
    continue_shopping: () => handlers.continueShopping(),
    back_to_orders: () => handlers.backToOrders(),
    change_language: ({ language }) => handlers.changeLanguage(language),
  };
}

export function isCurrentSession(currentSession, currentGeneration, session, generation) {
  return currentSession === session && currentGeneration === generation;
}

export function retireSessionRuntime({ session, sessionRef, generationRef, actionAbortRef, reason = "The voice session ended." }) {
  if (sessionRef.current === session) sessionRef.current = null;
  generationRef.current += 1;
  actionAbortRef.current?.abort(new Error(reason));
  actionAbortRef.current = null;
  session?.close?.();
}

function withTimeout(promise, timeoutMs, action, controller) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort(new Error(`${action} timed out.`));
      reject(new Error(`${action} timed out.`));
    }, timeoutMs);
  });
  const aborted = new Promise((_, reject) => {
    if (controller.signal.aborted) {
      reject(controller.signal.reason || new Error(`${action} cancelled.`));
      return;
    }
    controller.signal.addEventListener("abort", () => reject(controller.signal.reason || new Error(`${action} cancelled.`)), { once: true });
  });
  return Promise.race([promise, timeout, aborted]).finally(() => clearTimeout(timer));
}

export async function executeCustomerAction({
  action,
  input = {},
  actions,
  snapshot,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = () => Date.now(),
  abortController = new AbortController(),
  isCurrent = () => true,
}) {
  const startedAt = now();
  const handler = actions?.[action];
  const controller = abortController;
  const executionIsCurrent = () => !controller.signal.aborted && isCurrent();
  if (typeof handler !== "function") {
    return {
      ok: false,
      status: "error",
      action,
      error: "This action is not available.",
      screen: screenFromSnapshot(snapshot?.()),
      timing: { stage: "tool", durationMs: Math.max(0, now() - startedAt) },
    };
  }

  try {
    const value = await withTimeout(Promise.resolve(handler(input, {
      signal: controller.signal,
      isCurrent: executionIsCurrent,
    })), timeoutMs, action, controller);
    if (!executionIsCurrent()) throw controller.signal.reason || new Error(`${action} was replaced by a newer session.`);
    const latest = snapshot?.() || {};
    const blocked = value?.status === "blocked" || value?.ok === false;
    const { status: detailStatus, ...payload } = value || {};
    return {
      ...payload,
      ok: !blocked,
      status: blocked ? "blocked" : "success",
      action,
      ...(detailStatus && !blocked ? { resultStatus: detailStatus } : {}),
      screen: screenFromSnapshot(latest),
      timing: { stage: "tool", durationMs: Math.max(0, now() - startedAt) },
    };
  } catch (error) {
    return {
      ok: false,
      status: /timed out/i.test(error?.message || "") ? "timeout" : "error",
      action,
      error: error instanceof Error ? error.message : "The action failed.",
      screen: screenFromSnapshot(snapshot?.()),
      timing: { stage: "tool", durationMs: Math.max(0, now() - startedAt) },
    };
  }
}

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const feature = path.join(root, "src", "avolta-demo");
const catalog = JSON.parse(fs.readFileSync(path.join(feature, "catalog.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(path.join(feature, "catalog-report.json"), "utf8"));

test("curated Zürich Duty Free catalog is source-backed and image-complete", () => {
  assert.equal(catalog.source.currency, "CHF");
  assert.match(catalog.source.storefront, /^https:\/\/zurich\.shopdutyfree\.com\/de\/48/);
  assert.match(catalog.source.note, /not live physical-store stock/i);
  assert.equal(catalog.products.length, 205);
  assert.deepEqual(report.failures, []);
  assert.ok(Object.values(report.checks).every(Boolean));
  assert.deepEqual(report.extraction.categories, {
    "Fragrance": 50, "Beauty & skincare": 50, "Spirits": 50, "Swiss chocolate": 50, "Swiss gifts": 5,
  });
  assert.equal(report.coverage.before.productCount, 45);
  assert.equal(report.coverage.after.productCount, 205);
  assert.ok(report.coverage.after.brandCount >= 50);

  const ids = new Set();
  for (const product of catalog.products) {
    assert.ok(product.id && product.name && product.vendor && product.variant && product.sourceUrl);
    assert.equal(product.priceCurrency, "CHF");
    assert.ok(Number.isFinite(product.priceChf));
    assert.match(product.sourceUrl, /^https:\/\/zurich\.shopdutyfree\.com\/de\/48\//);
    assert.match(product.capturedAt, /2026-09-11/);
    assert.match(product.availabilityBasis, /not live physical-store inventory/i);
    assert.ok(!ids.has(product.id)); ids.add(product.id);
    assert.ok(product.images[0].sourceUrl.startsWith("https://images.shopdutyfree.com/"));
    assert.ok(fs.statSync(path.join(root, "public", product.images[0].localPath)).size > 256);
    assert.doesNotMatch(`${product.name} ${product.productType} ${product.tags.join(" ")}`, /tobacco|cigar|cigarette/i);
  }
});

test("shopping helpers support exploration, context depth, basket totals and reservation invalidation", async () => {
  const shopping = await import(pathToFileURL(path.join(feature, "shopping.mjs")));
  assert.ok(shopping.searchCatalog(catalog.products, "fragrance", 20).length >= 10);
  const affordableChocolate = shopping.searchCatalog(catalog.products, "chocolate under 50", 20);
  assert.ok(affordableChocolate.some((p) => p.productType === "Swiss chocolate"));
  assert.ok(affordableChocolate.every((p) => p.priceChf <= 50));
  const affordableFragrance = shopping.searchCatalog(catalog.products, "Fragrances under CHF 100", 20);
  assert.ok(affordableFragrance.length > 0);
  assert.ok(affordableFragrance.every((p) => p.productType === "Fragrance" && p.priceChf <= 100));
  assert.ok(shopping.searchCatalog(catalog.products, "Swiss gift", 20).length >= 5);
  assert.equal(shopping.resultsLimitForTravel({ minutesAvailable: "20" }), 4);
  assert.equal(shopping.resultsLimitForTravel({ minutesAvailable: "60" }), 12);

  const validIds = new Set(catalog.products.map((p) => p.id));
  const product = catalog.products[0];
  const two = shopping.changeQuantity({}, product.id, 2, "set", validIds);
  const three = shopping.changeQuantity(two, product.id, 1, "add", validIds);
  const summary = shopping.basketSummary(three, new Map(catalog.products.map((p) => [p.id, p])));
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.total, Number((product.priceChf * 3).toFixed(2)));
  assert.throws(() => shopping.changeQuantity({}, "invented", 1, "add", validIds), /Unknown product/);

  const future = new Date(Date.now() + 48 * 36e5).toISOString();
  const sameDay = new Date(Date.now() + 1 * 36e5).toISOString();
  const past = new Date(Date.now() - 1 * 36e5).toISOString();
  assert.equal(shopping.departureEligibility(future).eligible, true);
  assert.equal(shopping.departureEligibility(sameDay).eligible, true);
  assert.equal(shopping.departureEligibility(past).eligible, false);
  const a = shopping.reservationFingerprint(two, { departureDateTime: future, gate: "A", destination: "Paris" });
  const b = shopping.reservationFingerprint(three, { departureDateTime: future, gate: "A", destination: "Paris" });
  assert.notEqual(a, b);

  const transcript = shopping.transcriptFromHistory([
    { type: "message", role: "user", itemId: "hidden", content: [{ text: "[[opening-instruction]] internal" }] },
    { type: "message", role: "assistant", itemId: "welcome", content: [{ transcript: "Where are you flying today?" }] },
  ]);
  assert.deepEqual(transcript, [{ id: "welcome", role: "assistant", text: "Where are you flying today?" }]);
});

test("microphone acquisition cannot leave voice connecting forever and disposes a late stream", async () => {
  const { acquireMicrophoneWithTimeout } = await import(pathToFileURL(path.join(feature, "voiceLifecycle.mjs")));
  let resolveMicrophone;
  let stopped = 0;
  const pendingMicrophone = new Promise((resolve) => { resolveMicrophone = resolve; });

  await assert.rejects(
    acquireMicrophoneWithTimeout({ getUserMedia: () => pendingMicrophone, timeoutMs: 10 }),
    (error) => error?.name === "VoiceMicrophoneTimeoutError",
  );

  resolveMicrophone({ getTracks: () => [{ stop: () => { stopped += 1; } }] });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(stopped, 1);
});

test("voice lifecycle evidence is content-free and stale tool results cannot restart speech", async () => {
  const lifecycle = await import(pathToFileURL(path.join(feature, "voiceLifecycle.mjs")));
  assert.deepEqual(lifecycle.realtimeLifecycleSignal({ type: "input_audio_buffer.speech_started", item_id: "traveler-1" }), { event: "user_speech_start", itemId: "traveler-1" });
  assert.deepEqual(lifecycle.realtimeLifecycleSignal({ type: "input_audio_buffer.speech_stopped", item_id: "traveler-1" }), { event: "user_speech_stop", itemId: "traveler-1" });
  assert.deepEqual(lifecycle.realtimeLifecycleSignal({ type: "conversation.item.input_audio_transcription.completed", item_id: "traveler-1", transcript: "private words" }), { event: "user_transcript_complete", itemId: "traveler-1" });
  assert.deepEqual(lifecycle.realtimeLifecycleSignal({ type: "response.created", response: { id: "response-1" } }), { event: "response_start", responseId: "response-1" });
  assert.deepEqual(lifecycle.realtimeLifecycleSignal({ type: "response.done", response: { id: "response-1", status: "cancelled" } }), { event: "response_cancelled", responseId: "response-1", status: "cancelled" });
  assert.equal(lifecycle.realtimeLifecycleSignal({ type: "rate_limits.updated" }), null);

  let turnGeneration = 3;
  const suppressed = [];
  const fresh = await lifecycle.runTurnBoundOperation({ toolName: "fresh", turnGeneration, getCurrentTurnGeneration: () => turnGeneration, operation: async () => "fresh-result", backgroundResult: (value) => ({ background: value }), suppressedResult: "stale-result", onSuppressed: (details) => suppressed.push(details) });
  assert.equal(fresh, "fresh-result");
  const stale = await lifecycle.runTurnBoundOperation({ toolName: "search", turnGeneration, getCurrentTurnGeneration: () => turnGeneration, operation: async () => { turnGeneration += 1; return "obsolete-result"; }, backgroundResult: (value) => ({ background: value }), suppressedResult: "stale-result", onSuppressed: (details) => suppressed.push(details) });
  assert.deepEqual(stale, { background: "stale-result" });
  assert.deepEqual(suppressed, [{ toolName: "search", turnGeneration: 3, currentTurnGeneration: 4 }]);

  let nextTimerId = 0;
  const timers = new Map();
  const responseRequests = [];
  const coordinatorEvents = [];
  const coordinator = lifecycle.createToolResponseCoordinator({
    requestResponse: (details) => responseRequests.push(details),
    setTimer: (callback) => { const id = ++nextTimerId; timers.set(id, callback); return id; },
    clearTimer: (id) => timers.delete(id),
    onEvent: (event, details) => coordinatorEvents.push({ event, ...details }),
  });
  const runTimers = () => { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } };
  coordinator.onTravelerTurn(1);
  coordinator.onToolStart({ callId: "call-a", responseId: "response-a", turnGeneration: 1 });
  coordinator.onToolStart({ callId: "call-b", responseId: "response-a", turnGeneration: 1 });
  coordinator.onToolEnd({ callId: "call-a", turnGeneration: 1 });
  coordinator.onResponseDone("response-a");
  runTimers();
  assert.equal(responseRequests.length, 0);
  coordinator.onToolEnd({ callId: "call-b", turnGeneration: 1 });
  runTimers();
  assert.deepEqual(responseRequests, [{ turnGeneration: 1, sourceResponseIds: ["response-a"], toolCount: 2 }]);
  assert.equal(coordinatorEvents.filter((entry) => entry.event === "tool_continuation_requested").length, 1);

  coordinator.onToolStart({ callId: "obsolete", responseId: "response-old", turnGeneration: 1 });
  coordinator.onTravelerTurn(2);
  coordinator.onResponseDone("response-old");
  coordinator.onToolEnd({ callId: "obsolete", turnGeneration: 2 });
  runTimers();
  assert.equal(responseRequests.length, 1);
  assert.equal(coordinatorEvents.at(-1).event, "stale_tool_continuation_suppressed");

  coordinator.onTravelerTurn(3);
  coordinator.onToolStart({ callId: "slow-old", responseId: "response-slow-old", turnGeneration: 3 });
  coordinator.onTravelerTurn(4);
  coordinator.onToolStart({ callId: "current", responseId: "response-current", turnGeneration: 4 });
  coordinator.onResponseDone("response-current");
  coordinator.onToolEnd({ callId: "current", turnGeneration: 4 });
  coordinator.onToolStart({ callId: "late-old-dispatch", responseId: "response-slow-old", turnGeneration: 3 });
  assert.equal(coordinator.isBusy(), true);
  runTimers();
  assert.deepEqual(responseRequests.at(-1), { turnGeneration: 4, sourceResponseIds: ["response-current"], toolCount: 1 });
  assert.equal(coordinator.isBusy(), false);
  coordinator.onToolEnd({ callId: "slow-old", turnGeneration: 4 });
  coordinator.onToolEnd({ callId: "late-old-dispatch", turnGeneration: 4 });
  runTimers();
  assert.equal(responseRequests.length, 2);
  assert.equal(coordinatorEvents.filter((entry) => entry.event === "stale_tool_continuation_suppressed").length, 3);
  coordinator.close();
});

test("spoken order approval is bound to the next clear reply and the exact review", async () => {
  const approval = await import(pathToFileURL(path.join(feature, "voiceOrderApproval.mjs")));
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  const review = { fingerprint: "bag-a:flight-a:collection:store", summary: { itemCount: 1 }, fulfillment: { method: "collection", destination: "Zürich Duty Free", etaMinutes: 4 } };
  const reviewUserItemId = "request-review";
  const historyThroughQuestion = [
    { itemId: "older-yes", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Yes" }] },
    { itemId: reviewUserItemId, type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Please review it." }] },
    { itemId: "assistant-review", type: "message", role: "assistant", status: "completed", content: [{ type: "output_audio", transcript: "Do you confirm the order?" }] },
  ];
  const pendingRefusal = [...historyThroughQuestion, { itemId: "current-reply", type: "message", role: "user", status: "in_progress", content: [{ type: "input_audio", transcript: null }] }];
  assert.deepEqual(approval.latestUserTurn(pendingRefusal), { itemId: "current-reply", status: "in_progress", text: null });
  const pendingReply = approval.findOrderConfirmationReply(pendingRefusal, reviewUserItemId);
  assert.equal(pendingReply.reply.itemId, "current-reply");
  assert.equal(approval.validateSpokenOrderApproval({ review, expectedFingerprint: review.fingerprint, reviewUserItemId, confirmationReply: pendingReply }).reason, "reply_transcript_pending");
  let currentHistory = pendingRefusal;
  let publishHistory = null;
  const delayedReplyPromise = approval.waitForScopedConfirmationReply({ getHistory: () => currentHistory, reviewUserItemId, timeoutMs: 100, subscribe: (notify) => { publishHistory = notify; return () => { publishHistory = null; }; } });
  currentHistory = pendingRefusal.map((item) => item.itemId === "current-reply" ? { ...item, status: "completed", content: [{ type: "input_audio", transcript: "Yes, thank you" }] } : item);
  publishHistory(currentHistory);
  assert.equal((await delayedReplyPromise).reply.itemId, "current-reply");
  let cancelWait = null;
  const cancelledReplyPromise = approval.waitForScopedConfirmationReply({ getHistory: () => pendingRefusal, reviewUserItemId, timeoutMs: 100, subscribe: (notify) => { cancelWait = notify; return () => { cancelWait = null; }; } });
  cancelWait(null);
  assert.equal(await cancelledReplyPromise, null);

  assert.equal(approval.classifySpokenOrderApproval("Yes"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("Confirm"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("Confirmed"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("Please confirm"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("Please confirm the order"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("Yes, thank you"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("Yes, please go ahead"), "approved");
  assert.equal(approval.classifySpokenOrderApproval("No, change it"), "refused");
  assert.equal(approval.classifySpokenOrderApproval("Yes, I like that brand"), "ambiguous");
  assert.equal(approval.classifySpokenOrderApproval("Is the order confirmed?"), "ambiguous");
  assert.equal(approval.classifySpokenOrderApproval("Is the order confirmed"), "ambiguous");
  assert.equal(approval.classifySpokenOrderApproval("Do you confirm the order?"), "ambiguous");
  assert.equal(approval.classifySpokenOrderApproval("Do you confirm the order"), "ambiguous");
  assert.equal(approval.classifyPrioritySpokenOrderApproval("I confirm"), "approved");
  assert.equal(approval.classifyPrioritySpokenOrderApproval("Yes, I confirm"), "approved");
  assert.equal(approval.classifyPrioritySpokenOrderApproval("I confirm the order, please"), "approved");
  assert.equal(approval.classifyPrioritySpokenOrderApproval("Go ahead with the order"), "approved");
  assert.equal(approval.classifyPrioritySpokenOrderApproval("Yes"), "ambiguous");
  assert.equal(approval.classifyPrioritySpokenOrderApproval("I confirm, but change the item"), "refused");
  assert.equal(approval.isOrderConfirmationQuestion("Would you like to confirm this order?"), true);
  assert.equal(approval.isOrderConfirmationQuestion("Can I finalize your purchase?"), true);
  assert.equal(approval.isOrderConfirmationQuestion("I cannot confirm the order."), false);
  assert.equal(approval.materiallyEqual({ quantity: 1, travel: { stage: "at_gate", gate: "A" } }, { travel: { gate: "A", stage: "at_gate" }, quantity: 1 }), true);
  assert.equal(approval.materiallyEqual({ quantity: 1 }, { quantity: 2 }), false);

  const interruptedReviewHistory = [
    { itemId: reviewUserItemId, type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Please review it." }] },
    { itemId: "interrupted-summary", type: "message", role: "assistant", status: "in_progress", content: [{ type: "output_audio", transcript: "One item, Favarger chocolate, for collection" }] },
    { itemId: "internal-state", type: "message", role: "user", status: "completed", content: [{ type: "input_text", text: "[Interface state; do not respond.]" }] },
    { itemId: "priority-confirm", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "I confirm" }] },
    { itemId: "newer-internal-state", type: "message", role: "user", status: "completed", content: [{ type: "input_text", text: "[Interface state after review.]" }] },
  ];
  assert.deepEqual(approval.latestTravelerTurn(interruptedReviewHistory), { itemId: "priority-confirm", status: "completed", text: "I confirm" });
  const priorityReply = approval.findOrderConfirmationReply(interruptedReviewHistory, reviewUserItemId);
  assert.equal(priorityReply.mode, "priority_interrupt");
  assert.equal(priorityReply.reply.itemId, "priority-confirm");
  const prioritySession = {};
  const priorityApprovalState = { fingerprint: review.fingerprint, reviewUserItemId, generation: 8, session: prioritySession };
  assert.equal(approval.validatePriorityOrderConfirmation({ approvalState: priorityApprovalState, currentApprovalState: priorityApprovalState, currentGeneration: 8, currentSession: prioritySession, review, confirmationReply: priorityReply }).ok, true);
  assert.equal(approval.validatePriorityOrderConfirmation({ approvalState: priorityApprovalState, currentApprovalState: null, currentGeneration: 8, currentSession: prioritySession, review, confirmationReply: priorityReply }).reason, "approval_cancelled");
  assert.equal(approval.validatePriorityOrderConfirmation({ approvalState: priorityApprovalState, currentApprovalState: priorityApprovalState, currentGeneration: 9, currentSession: prioritySession, review, confirmationReply: priorityReply }).reason, "approval_cancelled");
  assert.equal(approval.validatePriorityOrderConfirmation({ approvalState: priorityApprovalState, currentApprovalState: priorityApprovalState, currentGeneration: 8, currentSession: prioritySession, review: { ...review, fingerprint: "changed" }, confirmationReply: priorityReply }).reason, "stale_review");
  for (const transcript of ["Yes, I confirm", "I confirm the order, please"]) {
    const naturalHistory = interruptedReviewHistory.map((item) => item.itemId === "priority-confirm" ? { ...item, content: [{ type: "input_audio", transcript }] } : item);
    const naturalReply = approval.findOrderConfirmationReply(naturalHistory, reviewUserItemId);
    const naturalApproval = approval.validatePriorityOrderConfirmation({ approvalState: priorityApprovalState, currentApprovalState: priorityApprovalState, currentGeneration: 8, currentSession: prioritySession, review, confirmationReply: naturalReply });
    assert.equal(naturalReply.mode, "priority_interrupt");
    assert.equal(naturalApproval.ok, true);
    const naturalCommit = approval.finalizeReviewedOrder({ review, currentFingerprint: naturalApproval.fingerprint, expectedFingerprint: naturalApproval.fingerprint, reference: `ZRH-${transcript.length}`, confirmedAt: "real-now", confirmedAtDemo: "demo-now" });
    assert.equal(naturalCommit.ok, true);
  }
  const interruptedBareYes = interruptedReviewHistory.map((item) => item.itemId === "priority-confirm" ? { ...item, content: [{ type: "input_audio", transcript: "Yes" }] } : item);
  assert.equal(approval.findOrderConfirmationReply(interruptedBareYes, reviewUserItemId).reason, "question_not_spoken");
  const interruptedChange = interruptedReviewHistory.map((item) => item.itemId === "priority-confirm" ? { ...item, content: [{ type: "input_audio", transcript: "I confirm, but change the item" }] } : item);
  const changeReply = approval.findOrderConfirmationReply(interruptedChange, reviewUserItemId);
  assert.equal(changeReply.mode, "priority_interrupt");
  assert.equal(approval.transitionApprovalForCompletedReply(priorityApprovalState, changeReply).action, "explicit_refusal");
  const outOfOrderHistory = [
    ...interruptedReviewHistory.slice(0, 2),
    { itemId: "earlier-unsettled", type: "message", role: "user", status: "in_progress", content: [{ type: "input_audio", transcript: null }] },
    { itemId: "later-confirm", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "I confirm" }] },
  ];
  const blockedOutOfOrder = approval.findOrderConfirmationReply(outOfOrderHistory, reviewUserItemId);
  assert.equal(blockedOutOfOrder.reason, "reply_transcript_pending");
  assert.equal(blockedOutOfOrder.reply.itemId, "earlier-unsettled");
  const settledOutOfOrder = outOfOrderHistory.map((item) => item.itemId === "earlier-unsettled" ? { ...item, status: "completed", content: [{ type: "input_audio", transcript: "Wait, change that" }] } : item);
  const refusalBeforeLaterApproval = approval.findOrderConfirmationReply(settledOutOfOrder, reviewUserItemId);
  assert.equal(refusalBeforeLaterApproval.reply.itemId, "earlier-unsettled");
  assert.equal(approval.transitionApprovalForCompletedReply(priorityApprovalState, refusalBeforeLaterApproval).action, "explicit_refusal");

  const refusalHistory = pendingRefusal.map((item) => item.itemId === "current-reply" ? { ...item, status: "completed", content: [{ type: "input_audio", transcript: "No, not yet" }] } : item);
  const refusalReply = approval.findOrderConfirmationReply(refusalHistory, reviewUserItemId);
  assert.equal(approval.validateSpokenOrderApproval({ review, expectedFingerprint: review.fingerprint, reviewUserItemId, confirmationReply: refusalReply }).reason, "explicit_refusal");
  const divertedThenYes = [...historyThroughQuestion,
    { itemId: "diversion", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "What time is it?" }] },
    { itemId: "assistant-diversion", type: "message", role: "assistant", status: "completed", content: [{ type: "output_audio", transcript: "It is eight." }] },
    { itemId: "later-yes", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Yes" }] },
  ];
  const diversionReply = approval.findOrderConfirmationReply(divertedThenYes, reviewUserItemId);
  assert.equal(diversionReply.reply.itemId, "diversion");
  assert.equal(approval.validateSpokenOrderApproval({ review, expectedFingerprint: review.fingerprint, reviewUserItemId, confirmationReply: diversionReply }).reason, "ambiguous");
  const ambiguousTransition = approval.transitionApprovalForCompletedReply({ fingerprint: review.fingerprint, reviewUserItemId, generation: 7, session: {} }, diversionReply);
  assert.equal(ambiguousTransition.action, "ambiguous_reask");
  assert.equal(ambiguousTransition.approvalState.reviewUserItemId, "diversion");
  const reaskedHistory = [...divertedThenYes.slice(0, -2),
    { itemId: "assistant-reask", type: "message", role: "assistant", status: "completed", content: [{ type: "output_audio", transcript: "Do you confirm the order?" }] },
    { itemId: "reply-after-reask", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Confirm" }] },
  ];
  const reaskedReply = approval.findOrderConfirmationReply(reaskedHistory, ambiguousTransition.approvalState.reviewUserItemId);
  assert.equal(reaskedReply.reply.itemId, "reply-after-reask");
  assert.equal(approval.validateSpokenOrderApproval({ review, expectedFingerprint: review.fingerprint, reviewUserItemId: ambiguousTransition.approvalState.reviewUserItemId, confirmationReply: reaskedReply }).ok, true);
  const refusalTransition = approval.transitionApprovalForCompletedReply({ fingerprint: review.fingerprint, reviewUserItemId, generation: 7, session: {} }, refusalReply);
  assert.equal(refusalTransition.action, "explicit_refusal");
  assert.equal(refusalTransition.approvalState, null);

  const yesHistory = [...historyThroughQuestion, { itemId: "reply-yes", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Yes, thank you" }] }];
  const yesReply = approval.findOrderConfirmationReply(yesHistory, reviewUserItemId);
  assert.equal(approval.validateSpokenOrderApproval({ review, expectedFingerprint: "stale-review", reviewUserItemId, confirmationReply: yesReply }).reason, "stale_review");
  assert.equal(approval.validateSpokenOrderApproval({ review, expectedFingerprint: review.fingerprint, reviewUserItemId, confirmationReply: yesReply }).ok, true);
  assert.equal(approval.shouldKeepApprovalArmed(approval.validateSpokenOrderApproval({ review, expectedFingerprint: review.fingerprint, reviewUserItemId, confirmationReply: pendingReply })), true);
  const session = {};
  const approvalState = { generation: 7, session };
  assert.equal(approval.isApprovalSessionCurrent({ approvalState, currentApprovalState: approvalState, currentGeneration: 7, currentSession: session }), true);
  assert.equal(approval.isApprovalSessionCurrent({ approvalState, currentApprovalState: null, currentGeneration: 7, currentSession: session }), false);
  assert.equal(approval.isApprovalSessionCurrent({ approvalState, currentApprovalState: { generation: 7, session }, currentGeneration: 7, currentSession: session }), false);
  assert.equal(approval.isApprovalSessionCurrent({ approvalState, currentApprovalState: approvalState, currentGeneration: 8, currentSession: session }), false);
  assert.equal(approval.isApprovalSessionCurrent({ approvalState, currentApprovalState: approvalState, currentGeneration: 7, currentSession: null }), false);

  const first = approval.finalizeReviewedOrder({ review, currentFingerprint: review.fingerprint, expectedFingerprint: review.fingerprint, reference: "ZRH-1", confirmedAt: "real-now", confirmedAtDemo: "demo-now" });
  assert.equal(first.ok, true);
  assert.equal(first.duplicatePrevented, false);
  assert.equal(first.reservation.submittedExternally, false);
  const repeated = approval.finalizeReviewedOrder({ review, currentFingerprint: review.fingerprint, expectedFingerprint: review.fingerprint, existingReservation: first.reservation, reference: "ZRH-2", confirmedAt: "later", confirmedAtDemo: "later-demo" });
  assert.equal(repeated.duplicatePrevented, true);
  assert.strictEqual(repeated.reservation, first.reservation);
  assert.equal(approval.finalizeReviewedOrder({ review, currentFingerprint: "bag-changed", expectedFingerprint: review.fingerprint }).ok, false);

  const wiredSession = {};
  const wiredApprovalState = { fingerprint: review.fingerprint, reviewUserItemId, generation: 11, session: wiredSession };
  const confirmHistory = [...historyThroughQuestion, { itemId: "reply-confirm", type: "message", role: "user", status: "completed", content: [{ type: "input_audio", transcript: "Confirm" }] }];
  let overlay = "review";
  let visibleOrder = null;
  let trackerVisible = false;
  const flowEvents = [];
  const wiredResult = await approval.completeSpokenOrderConfirmation({
    approvalState: wiredApprovalState,
    expectedFingerprint: review.fingerprint,
    getCurrentApprovalState: () => wiredApprovalState,
    getCurrentGeneration: () => 11,
    getCurrentSession: () => wiredSession,
    getReview: () => review,
    waitForConfirmationReply: async () => approval.findOrderConfirmationReply(confirmHistory, reviewUserItemId),
    onConsentValidated: () => flowEvents.push("consent_validated"),
    finalizeOrder: (expectedFingerprint) => {
      const result = approval.finalizeReviewedOrder({ review, currentFingerprint: review.fingerprint, expectedFingerprint, reference: "ZRH-WIRED", confirmedAt: "2026-09-14T08:00:00.000Z", confirmedAtDemo: "2026-09-14T08:00:00.000Z" });
      if (result.ok) { visibleOrder = result.reservation; overlay = null; trackerVisible = true; flowEvents.push("order_committed"); }
      return result;
    },
  });
  assert.equal(wiredResult.ok, true);
  assert.equal(wiredResult.closeOverlay, true);
  assert.equal(wiredResult.showOrderTracker, true);
  assert.equal(overlay, null);
  assert.equal(trackerVisible, true);
  assert.equal(visibleOrder.reference, "ZRH-WIRED");
  assert.equal(replay.orderProgress(visibleOrder, "2026-09-14T08:00:00.000Z").state, "Preparing");
  assert.deepEqual(flowEvents, ["consent_validated", "order_committed"]);

  let racedReservation = null;
  const racedResult = await approval.completeSpokenOrderConfirmation({
    approvalState: wiredApprovalState,
    expectedFingerprint: review.fingerprint,
    getCurrentApprovalState: () => null,
    getCurrentGeneration: () => 11,
    getCurrentSession: () => wiredSession,
    getReview: () => review,
    getExistingReservation: () => racedReservation,
    waitForConfirmationReply: async () => {
      racedReservation = first.reservation;
      return priorityReply;
    },
    finalizeOrder: () => ({ ok: true, duplicatePrevented: true, reservation: racedReservation }),
  });
  assert.equal(racedResult.ok, true);
  assert.equal(racedResult.consent, "already_validated");
  assert.equal(racedResult.closeOverlay, true);
  assert.equal(racedResult.showOrderTracker, true);

  const pendingResult = await approval.completeSpokenOrderConfirmation({ approvalState: wiredApprovalState, expectedFingerprint: review.fingerprint, getCurrentApprovalState: () => wiredApprovalState, getCurrentGeneration: () => 11, getCurrentSession: () => wiredSession, getReview: () => review, waitForConfirmationReply: async () => pendingReply, finalizeOrder: () => { throw new Error("pending consent must not commit"); } });
  assert.equal(pendingResult.pending, true);
  assert.equal(pendingResult.clearApproval, false);
  assert.equal(pendingResult.closeOverlay, false);

  const refusalResult = await approval.completeSpokenOrderConfirmation({ approvalState: wiredApprovalState, expectedFingerprint: review.fingerprint, getCurrentApprovalState: () => wiredApprovalState, getCurrentGeneration: () => 11, getCurrentSession: () => wiredSession, getReview: () => review, waitForConfirmationReply: async () => approval.findOrderConfirmationReply(refusalHistory, reviewUserItemId), finalizeOrder: () => { throw new Error("refusal must not commit"); } });
  assert.equal(refusalResult.reason, "explicit_refusal");
  assert.equal(refusalResult.clearApproval, true);
  const cancelledResult = await approval.completeSpokenOrderConfirmation({ approvalState: wiredApprovalState, expectedFingerprint: review.fingerprint, getCurrentApprovalState: () => null, getCurrentGeneration: () => 11, getCurrentSession: () => wiredSession, getReview: () => review, waitForConfirmationReply: async () => yesReply, finalizeOrder: () => { throw new Error("cancelled session must not commit"); } });
  assert.equal(cancelledResult.reason, "approval_cancelled");
  assert.equal(cancelledResult.closeOverlay, false);

  const replacementApproval = { ...wiredApprovalState, reviewUserItemId: "replacement-review" };
  let currentApproval = wiredApprovalState;
  const staleAsyncResult = await approval.completeSpokenOrderConfirmation({
    approvalState: wiredApprovalState,
    expectedFingerprint: review.fingerprint,
    getCurrentApprovalState: () => currentApproval,
    getCurrentGeneration: () => 11,
    getCurrentSession: () => wiredSession,
    getReview: () => review,
    waitForConfirmationReply: async () => { currentApproval = replacementApproval; return yesReply; },
    finalizeOrder: () => { throw new Error("a stale confirmation must not commit"); },
  });
  assert.equal(staleAsyncResult.reason, "approval_replaced");
  assert.equal(staleAsyncResult.clearApproval, false);
  if (staleAsyncResult.clearApproval && currentApproval === wiredApprovalState) currentApproval = null;
  assert.strictEqual(currentApproval, replacementApproval);

  const ambiguousReaskResult = await approval.completeSpokenOrderConfirmation({ approvalState: wiredApprovalState, expectedFingerprint: review.fingerprint, getCurrentApprovalState: () => replacementApproval, getCurrentGeneration: () => 11, getCurrentSession: () => wiredSession, getReview: () => review, getRevocation: () => ({ approvalState: wiredApprovalState, reason: "ambiguous_reask" }), waitForConfirmationReply: async () => diversionReply, finalizeOrder: () => { throw new Error("an ambiguous reply must not commit"); } });
  assert.equal(ambiguousReaskResult.reason, "ambiguous_reask");
  assert.equal(ambiguousReaskResult.pending, true);
  assert.equal(ambiguousReaskResult.clearApproval, false);

  const bagChangedResult = await approval.completeSpokenOrderConfirmation({ approvalState: wiredApprovalState, expectedFingerprint: review.fingerprint, getCurrentApprovalState: () => null, getCurrentGeneration: () => 11, getCurrentSession: () => wiredSession, getReview: () => null, getRevocation: () => ({ approvalState: wiredApprovalState, reason: "bag_changed" }), waitForConfirmationReply: async () => yesReply, finalizeOrder: () => { throw new Error("a changed bag must not commit"); } });
  assert.equal(bagChangedResult.reason, "bag_changed");
  assert.match(bagChangedResult.error, /reviewed order changed/i);
  assert.equal(bagChangedResult.clearApproval, true);
  assert.equal(approval.approvalCancellationReason({ approvalState: wiredApprovalState, currentApprovalState: null, currentGeneration: 12, currentSession: wiredSession, revocation: null }), "session_replaced");
  assert.equal(approval.approvalCancellationReason({ approvalState: wiredApprovalState, currentApprovalState: null, currentGeneration: 11, currentSession: null, revocation: null }), "session_ended");
});

test("Realtime model verification keeps server and active-session evidence distinct and generation-scoped", async () => {
  const realtime = await import(pathToFileURL(path.join(feature, "realtimeConfig.mjs")));
  const pending = realtime.beginAvoltaRealtimeVerification(7, "gpt-realtime-2.1-mini", null);
  assert.deepEqual(pending, {
    generation: 7,
    status: "pending",
    requestedModel: "gpt-realtime-2.1-mini",
    serverReportedModel: null,
    sessionReportedModel: null,
    source: null,
  });
  const unavailable = realtime.applyAvoltaRealtimeSessionEvidence(pending, 7, { type: "session.created", session: {} });
  assert.equal(unavailable.status, "unavailable");
  assert.equal(unavailable.sessionReportedModel, null);
  const verified = realtime.applyAvoltaRealtimeSessionEvidence(unavailable, 7, { type: "session.updated", session: { model: "gpt-realtime-2.1-mini", instructions: "not retained" } });
  assert.equal(verified.status, "verified");
  assert.equal(verified.sessionReportedModel, "gpt-realtime-2.1-mini");
  assert.equal(verified.source, "session.updated");
  assert.equal(Object.hasOwn(verified, "instructions"), false);
  assert.strictEqual(realtime.applyAvoltaRealtimeSessionEvidence(verified, 6, { type: "session.updated", session: { model: "gpt-realtime-2.1" } }), verified);
  assert.strictEqual(realtime.applyAvoltaRealtimeSessionEvidence(verified, 7, { type: "response.done", response: { model: "gpt-realtime-2.1" } }), verified);
  assert.strictEqual(realtime.applyAvoltaRealtimeSessionEvidence(verified, 7, { type: "session.updated", session: {} }), verified);
  const mismatch = realtime.applyAvoltaRealtimeSessionEvidence(pending, 7, { type: "session.created", session: { model: "gpt-realtime-2.1" } });
  assert.equal(mismatch.status, "mismatch");
  assert.equal(mismatch.sessionReportedModel, "gpt-realtime-2.1");
  assert.equal(realtime.beginAvoltaRealtimeVerification(8, "gpt-realtime-2.1", "gpt-realtime-2.1-mini").status, "mismatch");
});

test("Avolta feature is isolated, protected and keeps reservation confirmation explicit", () => {
  const client = fs.readFileSync(path.join(feature, "AvoltaVoiceShop.jsx"), "utf8");
  const page = fs.readFileSync(path.join(root, "app", "avolta-demo", "page.jsx"), "utf8");
  const token = fs.readFileSync(path.join(root, "app", "api", "avolta-demo", "realtime-token", "route.js"), "utf8");
  const access = fs.readFileSync(path.join(root, "app", "api", "avolta-demo", "access", "route.js"), "utf8");
  const robots = fs.readFileSync(path.join(root, "app", "robots.js"), "utf8");

  for (const source of [client, page, token, access]) assert.doesNotMatch(source, /src\/juliette-demo|app\/juliette-demo/);
  assert.doesNotMatch(client, /process\.env\.OPENAI_API_KEY/);
  assert.doesNotMatch(client, /needsApproval:\s*true/);
  assert.match(client, /review_demo_order/);
  assert.match(client, /confirm_demo_order/);
  assert.match(client, /VOICE_DEMO_DURATION_MS = 5 \* 60 \* 1000/);
  assert.match(client, /VOICE_CONNECT_TIMEOUT_MS = 18000/);
  assert.match(client, /submittedExternally:\s*false/);
  assert.doesNotMatch(client, /Fragrances under CHF 100/);
  assert.doesNotMatch(client, /promptRow/);
  assert.match(client, /find_replay_flight/);
  assert.match(client, /propose_replay_flight/);
  assert.match(client, /confirm_replay_flight/);
  assert.match(client, /candidate\?\.id === flight_id/);
  assert.match(client, /const displayedFlight = pendingFlight \|\| confirmedFlight/);
  assert.match(client, /assess_journey/);
  assert.match(client, /exact sentence \"Welcome to Avolta\.\"/);
  assert.match(client, /const AVOLTA_PRONUNCIATION = "Say Avolta as one smoothly connected brand name, with stress on the middle syllable and no pause after the initial vowel—not as the letter A followed by Volta\. Always keep the official written spelling Avolta and never explain these pronunciation instructions aloud\."/);
  assert.equal(client.match(/\$\{AVOLTA_PRONUNCIATION\}/g)?.length, 2);
  assert.doesNotMatch(client, /ah-VOL-ta|three syllables/);
  assert.match(client, /help each traveler discover something they will genuinely enjoy and choose the easiest convenient way to get it/i);
  assert.match(client, /Do not mention the demo day, replay, simulation, data, tools or setup/);
  assert.match(client, /without repeating the welcome/);
  assert.match(client, /currently has \$\{boardingMinutes\} minutes until boarding/);
  assert.match(client, /Do not ask for confirmation of the assumed starting flight/);
  assert.match(client, /Do not claim to have accessed a booking, airline account or personal record/);
  assert.match(client, /If the traveler asks for a product, gift, category, brand, price or idea at any point/);
  assert.match(client, /Reuse anything the traveler has already volunteered/);
  assert.match(client, /Never ask a second question, answer on the traveler's behalf, or continue simply because there is silence/);
  assert.match(client, /Speak once after the tool completes/);
  assert.match(client, /Ask exactly “Do you confirm the order\?”/);
  assert.match(client, /review_fingerprint/);
  assert.match(client, /completeSpokenOrderConfirmation/);
  assert.match(client, /setActivePanel\(null\); setReservationError/);
  assert.match(client, /recordVoiceOrderEvent\("manual_confirmation"\); createReservation\(\)/);
  assert.match(client, /const rejectApproval = async \(\) => \{[^}]*invalidateReview\("explicit_change_requested"\)/);
  assert.match(client, /getCurrentApprovalState: \(\) => voiceReviewApprovalRef\.current/);
  assert.match(client, /getRevocation: \(\) => voiceApprovalRevocationsRef\.current\.get\(approvalState\)/);
  assert.match(client, /getExistingReservation: \(\) => reservationRef\.current/);
  assert.match(client, /if \(result\.clearApproval && voiceReviewApprovalRef\.current === approvalState\)/);
  assert.match(client, /materiallyEqual\(basketRef\.current, next\)/);
  assert.match(client, /materiallyEqual\(travelRef\.current, next\)/);
  assert.match(client, /reservationRef\.current\?\.fingerprint === review_fingerprint/);
  assert.match(client, /data-voice-tool-starts=/);
  assert.match(client, /data-voice-order-flow=/);
  assert.match(client, /data-voice-lifecycle=/);
  assert.match(client, /CONFIRMATION_TRANSCRIPT_WAIT_MS = 1600/);
  assert.match(client, /backgroundResult/);
  assert.match(client, /stale_tool_result_suppressed/);
  assert.match(client, /createToolResponseCoordinator/);
  assert.match(client, /const coordinatedTool = \(definition\) => tool/);
  assert.match(client, /isBackgroundResult\(result\) \? result : backgroundResult\(result\)/);
  assert.match(client, /queueResponseOrigin\("tool_continuation"/);
  assert.match(client, /response\.output_audio\.delta/);
  assert.match(client, /order_update_suppressed_busy/);
  assert.match(client, /responseOwnershipRef\.current\.get\(responseId\)\?\.turnGeneration \?\? voiceTurnGenerationRef\.current/);
  assert.match(client, /uncoordinated_tool_output/);
  assert.match(client, /tool_execution_error/);
  assert.match(client, /A response that contains one or more tool calls produces no spoken audio/);
  assert.match(client, /latestTravelerTurn/);
  assert.match(client, /explicit order command such as “I confirm” or “go ahead with the order,” stop the summary immediately/);
  assert.doesNotMatch(client, /In one short sentence, say this is a replayed Zürich Airport demo day with simulated fulfillment/);
  assert.match(token, /hasAccess\(cookieStore\)/);
  assert.match(token, /MAX_STARTS = 12/);
  assert.match(token, /process\.env\.AVOLTA_OPENAI_API_KEY/);
  assert.doesNotMatch(token, /process\.env\.OPENAI_API_KEY/);
  assert.match(token, /process\.env\.AVOLTA_OPENAI_REALTIME_MODEL/);
  assert.match(token, /const requestedModel = body\?\.model/);
  assert.match(token, /!isAllowedAvoltaRealtimeModel\(requestedModel\)/);
  assert.match(token, /Unsupported voice model selection/);
  assert.match(token, /serverReportedModel && serverReportedModel !== model/);
  assert.match(token, /requestedModel: model, serverReportedModel/);
  assert.doesNotMatch(token, /payload\?\.session\?\.model \|\| model/);
  assert.doesNotMatch(token, /console\.log\([^)]*AVOLTA_OPENAI_API_KEY/);
  assert.match(client, /body: JSON\.stringify\(\{ model: selectedModel \}\)/);
  assert.match(client, /payload\.requestedModel !== selectedModel/);
  assert.match(client, /beginAvoltaRealtimeVerification\(sequence, selectedModel, payload\.serverReportedModel\)/);
  assert.match(client, /session\.on\("transport_event"/);
  assert.match(client, /applyAvoltaRealtimeSessionEvidence\(voiceModelVerificationRef\.current, sequence, event\)/);
  assert.match(client, /data-voice-model-verification=/);
  assert.match(client, /data-voice-session-reported-model=/);
  assert.match(client, /voiceStartSequenceRef\.current !== sequence/);
  assert.match(client, /disposeVoiceTransport\(\); clearPendingVoiceApproval\(\)/);
  assert.match(client, /acquireMicrophoneWithTimeout\(\{/);
  assert.match(client, /getUserMedia: \(constraints\) => navigator\.mediaDevices\.getUserMedia\(constraints\)/);
  assert.match(client, /mediaStream: microphoneStream/);
  assert.match(client, /Promise\.race\(\[/);
  assert.match(client, /Microphone permission did not complete\. Check your browser permission and try again\./);
  assert.match(client, /Voice connection timed out\. Check microphone permission and try again\./);
  assert.match(client, /comparisonStart \? freshOpening/);
  assert.match(access, /httpOnly:\s*true/);
  assert.match(page, /robots:\s*\{ index: false, follow: false/);
  assert.match(robots, /\/avolta-demo/);
});

test("Avolta shopper UX moves from a journey-led arrival to compact two-column shopping", () => {
  const client = fs.readFileSync(path.join(feature, "AvoltaVoiceShop.jsx"), "utf8");
  const css = fs.readFileSync(path.join(feature, "avoltaVoiceShop.module.css"), "utf8");
  const page = fs.readFileSync(path.join(root, "app", "avolta-demo", "page.jsx"), "utf8");
  const brandAsset = fs.readFileSync(path.join(root, "public", "avolta-demo", "brand", "avolta-logo.svg"), "utf8");
  const renderedClient = client.slice(client.lastIndexOf("\n  return ("));
  const provenance = fs.readFileSync(path.join(root, "docs", "avolta-design-reference.md"), "utf8");
  assert.match(client, /const CURATED_PRODUCT_IDS = \[/);
  assert.match(client, /const CURATED_PRODUCT_IDS = \[\s*"favarger-la-boite-zurich-edition-240g",\s*"mawico-sitting-trio-cow-plush-25cm",\s*"creed-aventus-50ml"/);
  assert.match(client, /useState\(\(\) => CURATED_PRODUCT_IDS\.filter/);
  assert.doesNotMatch(renderedClient, />Welcome to Avolta\.</);
  assert.match(client, /className=\{styles\.brandHeader\} data-intro-expanded=\{introExpanded\}/);
  assert.match(client, /const \[introExpanded, setIntroExpanded\] = useState\(false\)/);
  assert.match(client, /window\.requestAnimationFrame\(\(\) => \{ settleFrame = window\.requestAnimationFrame/);
  assert.match(client, /if \(storageReady && atTop && !introSeenRef\.current\) setIntroExpanded\(true\)/);
  assert.match(client, /data-at-top=\{atPageTop\} data-shop-takeover=\{!atPageTop \|\| voiceStatus !== "idle"\}/);
  assert.match(client, /className=\{styles\.arrivalIntro\}/);
  assert.match(client, /className=\{styles\.zurichSignature\}/);
  assert.match(client, /<p>Let’s find something you’ll love\. We’ll help you get it before you fly\.<\/p>/);
  assert.match(client, /const INTRO_DURATION_MS = 5000/);
  assert.match(client, /window\.setTimeout\(collapseIntro, INTRO_DURATION_MS\)/);
  assert.match(client, /window\.addEventListener\("scroll", collapseOnScroll/);
  assert.match(client, /onPointerDownCapture=\{collapseIntro\}/);
  assert.match(client, /sessionStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(\{ \.\.\.stored, introSeen: true \}\)\)/);
  assert.match(client, /data-primary=\{choice\.model === DEFAULT_AVOLTA_REALTIME_MODEL\}/);
  assert.match(client, /<div className=\{styles\.modelRow\} aria-label="Choose voice model">/);
  assert.match(client, />All products</);
  assert.match(client, /<strong>Let’s talk<\/strong><small>\{choice\.label\}<\/small>/);
  assert.doesNotMatch(client, />\{choice\.model\}<\/small>|"Talk to Order"/);
  assert.match(client, /\{ label: "Mini", model: "gpt-realtime-2\.1-mini" \}/);
  assert.match(client, /\{ label: "Standard", model: "gpt-realtime-2\.1" \}/);
  assert.match(client, /aria-label="Choose voice model"/);
  assert.match(client, /className=\{styles\.muteVoice\}/);
  assert.match(client, /aria-pressed=\{active\}/);
  assert.match(client, /showFullCollection/);
  assert.match(client, /currentViewportIds/);
  assert.match(client, /const viewportIds = ids\.slice\(0, 4\)/);
  assert.doesNotMatch(client, /IMAGE_WAIT_MS/);
  assert.doesNotMatch(client, /while \(performance\.now\(\) < deadline\)/);
  assert.match(client, /selectionReady: true/);
  assert.match(client, /loadingImageProductIds/);
  assert.match(client, /className=\{styles\.productSurface\}/);
  assert.match(client, /className=\{styles\.controlDock\}/);
  assert.match(client, /src="\/avolta-demo\/brand\/avolta-logo\.svg" alt="Avolta"/);
  assert.match(page, /src="\/avolta-demo\/brand\/avolta-logo\.svg" alt="Avolta"/);
  assert.match(client, /<strong>Zürich Duty Free<\/strong>/);
  assert.doesNotMatch(client, /styles\.brandMark|<span[^>]*>A<\/span>/);
  assert.match(brandAsset, /viewBox="0 0 101 18"/);
  assert.match(brandAsset, /fill="#8F53F0"/);
  assert.match(provenance, /avoltaworld\.com\/themes\/wndrs\/images\/logo\.svg/);
  assert.match(provenance, /flughafen-zuerich\.ch\/en\/passengers\/shopping-and-enjoy\/shops\/duty-free/);
  assert.match(client, /hasBasket && <button className=\{styles\.basketTrigger\}/);
  assert.doesNotMatch(client, /className=\{styles\.(?:catalogueTop|categories|bagButton)\}/);
  assert.doesNotMatch(client, />205 products<|Zürich Airport selection|>What would you like to pick up\?</);
  assert.match(css, /\.productGrid \{[^}]*grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.productGrid \{[^}]*grid-template-columns:\s*repeat\(2,/);
  assert.match(client, /data-framing=\{productImageFraming\(product\)\}/);
  assert.match(css, /\.productImage\[data-framing="tall"\]/);
  assert.match(css, /\.productImage\[data-framing="wide"\]/);
  assert.match(css, /\.productImage\[data-framing="dense"\]/);
  assert.match(css, /\.productImage\[data-framing="edge-safe"\]/);
  assert.match(css, /\.productCard:not\(:nth-child\(3n\)\) \{[^}]*border-inline-end/);
  assert.match(css, /zurich-signature\.svg/);
  assert.match(client, /EDGE_SAFE_PRODUCT_IDS/);
  assert.match(css, /\.productImage img \{[^}]*mix-blend-mode:\s*normal/);
  assert.doesNotMatch(css, /\.imageWrap::(?:before|after)/);
  assert.doesNotMatch(css, /\.productText \{[^}]*text-shadow/);
  assert.match(css, /\.productText \{[^}]*inset:\s*0 0 auto/);
  assert.match(css, /\.productText \{[^}]*background:\s*transparent/);
  assert.match(css, /\.productImage \{[^}]*background:\s*#fff/);
  assert.match(css, /\.modelRow, \.dockRow \{[^}]*display:\s*flex/);
  assert.match(css, /\.voiceModelAction \{[^}]*width:\s*15\.25rem[^}]*min-height:\s*3\.75rem[^}]*border-radius:\s*999px/);
  assert.match(css, /\.voiceModelLabel strong \{[^}]*font-size:\s*1rem/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.modelRow \{[^}]*width:\s*min\(31rem, calc\(100vw - 1rem\)\)/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.productCard \{[^}]*aspect-ratio:\s*1 \/ 1\.02/);
  assert.match(provenance, /8ae73af3fbe60fa142789d12bac1dfd4a359bc33/);
  assert.doesNotMatch(client, /className=\{styles\.(?:transcript|travelBar|journeyPanel|sidePanel|sourceLink)\}/);
  assert.match(client, /session\.on\("history_updated"/);
  assert.doesNotMatch(client, /Today at Zürich Airport|Journey not assessed|Security \{/);
  assert.doesNotMatch(client, /Terminal 1/);
  assert.doesNotMatch(client, /className=\{styles\.(?:headerActions|cardActions|modalBackdrop)\}/);
  assert.match(client, /journeyStage === "unknown" \? "Your journey"/);
  assert.match(client, /journeyStage === "unknown" \? "Now"/);
  assert.match(client, /data-flight-state=\{flightDisplayState\}/);
  assert.match(client, /data-context-status=\{flightContextStatus\}/);
  assert.match(client, /setFlightContextStatus\(journeyContextRef\.current \? "fallback" : "error"\)/);
  assert.match(client, /"No future flight available"/);
  assert.match(client, /Gate pending/);
  assert.match(client, /"Boarding time pending"/);
  assert.match(client, /displayedFlight\.destination \|\| displayedDestination\}\$\{displayedFlight\.gate \? ` · Gate/);
  assert.match(client, /displayedFlight\.flightNumber \|\| "Flight pending"\} · \$\{displayedFlight\.boardingTime/);
  assert.match(page, /departureCount: upcomingFlights\(capturedFlights,/);
  assert.match(page, /assumedFlight: selectAssumedItinerary\(capturedFlights, initialNow\)/);
  assert.doesNotMatch(page, /liveContextServer/);
  assert.doesNotMatch(client, /setInterval\([^,]+, 5000\)/);
  assert.match(client, /visibilitychange/);
  assert.match(client, /const replayMinute = Math\.floor\(demoNow\.getTime\(\) \/ 60_000\)/);
  assert.match(client, /const displayedFlight = pendingFlight \|\| confirmedFlight/);
  assert.match(client, /itineraryProvenance:[^\n]+basis: "assumed demo itinerary"/);
  assert.match(client, /retrievedFromPersonalBooking: false/);
  assert.match(client, /useState\(\(\) => travelWithItinerary\(initialAssumedFlight\)\)/);
  assert.match(client, /!assumedItineraryAlignedRef\.current/);
  assert.match(client, /else if \(travelRef\.current\.selectedFlight\?\.assumptionBasis\) updateTravel\(\{ selectedFlight: null/);
  assert.match(client, /className=\{styles\.flightTimeline\}/);
  assert.match(client, /className=\{styles\.timelineRail\}/);
  assert.match(client, /journeyStage !== "unknown" && <i className=\{styles\.timelinePosition\}/);
  assert.doesNotMatch(client, /upcomingPreviewFlights|flightLookupActive|suggestedFlight/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.brandHeader \{[^}]*position:\s*fixed[^}]*height:\s*var\(--compact-header-height\)/);
  assert.match(css, /\.brandHeader\[data-intro-expanded="true"\] \{[^}]*75svh/);
  assert.match(css, /\.brandHeader \{[^}]*--compact-header-height:\s*6\.25rem/);
  assert.match(css, /\.timelineText strong \{[^}]*font-size:\s*1rem/);
  assert.match(css, /\.timelineCountdown strong \{[^}]*font-size:\s*1\.5rem/);
  assert.match(css, /\.timelineStartDot, \.timelineEndDot, \.timelinePosition \{[^}]*width:\s*\.9rem/);
  assert.doesNotMatch(css, /\.brandHeader::after/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.brandHeader \{ --compact-header-height:\s*9\.15rem; \}/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.brandHeader\[data-has-order="true"\] \{ --compact-header-height:\s*10\.45rem; \}/);
  assert.match(css, /@media \(max-width: 340px\)[\s\S]*\.brandHeader \{ --compact-header-height:\s*10\.1rem; \}/);
  assert.match(css, /@media \(max-width: 340px\)[\s\S]*\.brandHeader\[data-has-order="true"\] \{ --compact-header-height:\s*11\.65rem; \}/);
  assert.match(css, /@media \(max-width: 340px\)[\s\S]*\.brandHeader\[data-at-top="true"\]\[data-intro-expanded="false"\]\[data-shop-takeover="false"\] \{ height:\s*10\.55rem; \}/);
  assert.match(css, /data-at-top="true"\]\[data-intro-expanded="false"\]\[data-shop-takeover="false"\]/);
  assert.match(css, /\.brandHeader, \.arrivalIntro \{ transition:\s*none/);
  assert.match(css, /-webkit-mask:\s*url\("\/avolta-demo\/brand\/avolta-logo\.svg"\)/);
  assert.doesNotMatch(renderedClient, />Suggested</);
  assert.doesNotMatch(renderedClient, /Awaiting flight confirmation|Demo day ·|Avolta concept|Simulated gate delivery|Simulated collection|Review demo order|Demo order review|Confirm demo order|Estimated demo time|simulated fulfillment/);
  assert.doesNotMatch(renderedClient, /<span data-active=\{travel\.stage === "unknown"\}>Unknown<\/span>/);
  assert.match(client, /\["Scheduled", "Boarding window approaching"\]\.includes\(displayedFlightStatus\.label\)/);
  assert.doesNotMatch(renderedClient, /className=\{styles\.(?:departureHead|departureBoard|flightCard|contextRail)\}/);
  assert.match(client, /className=\{styles\.orderPulse\}/);
  assert.doesNotMatch(renderedClient, /product\.promotionEvidence && <i>/);
  assert.match(renderedClient, /selectedProduct\.promotionEvidence && <em>/);
  assert.doesNotMatch(page, /concept|preview|Enter the experience|AVOLTA_DEMO_PASSCODE/i);
  assert.match(client, /data-has-order=\{Boolean\(order\)\}/);
  assert.doesNotMatch(client, />Reset demo</);
  assert.match(client, /!session \|\| session\.transport\.status !== "connected" \|\| isMuted \|\| voiceStatus !== "listening"/);
  assert.match(client, /announcedOrderStatesRef/);
  assert.match(client, /const selectProduct = useCallback\(\(productId\) => \{[^}]*setSelectedId\(productId\)/);
  assert.doesNotMatch(client, /const selectProduct = useCallback\(\(productId\) => \{[^}]*setActivePanel/);
  assert.match(client, /setActivePanel\("detail"\)/);
  assert.match(client, /setActivePanel\("basket"\)/);
});

test("Avolta voice output uses an attached audio element and records playback evidence", () => {
  const client = fs.readFileSync(path.join(feature, "AvoltaVoiceShop.jsx"), "utf8");
  assert.match(client, /<audio ref=\{audioOutputRef\}/);
  assert.match(client, /new OpenAIRealtimeWebRTC\(\{ audioElement/);
  assert.match(client, /peerConnection\.addEventListener\("track"/);
  assert.match(client, /await audio\.play\(\)/);
  assert.match(client, /entry\.type === "inbound-rtp" && entry\.kind === "audio"/);
  assert.match(client, /voice: "marin"/);
  assert.match(client, /speed: 1\.03/);
  assert.match(client, /type: "semantic_vad", eagerness: "medium"/);
  assert.match(client, /data-audio-track=/);
  assert.match(client, /data-audio-bytes=/);
  assert.match(client, /data-audio-energy=/);
  assert.match(client, /data-audio-playback=/);
});

test("captured flight fixture is complete, immutable and never fetched at runtime", async () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(feature, "flight-day.fixture.json"), "utf8"));
  const server = fs.readFileSync(path.join(feature, "liveContextServer.mjs"), "utf8");
  const route = fs.readFileSync(path.join(root, "app", "api", "avolta-demo", "journey-context", "route.js"), "utf8");
  assert.equal(fixture.fixtureVersion, "zrh-departures-2026-09-12-v1");
  assert.equal(fixture.provenance.serviceDate, "2026-09-12");
  assert.equal(fixture.provenance.timeZone, "Europe/Zurich");
  assert.equal(fixture.flights.length, 393);
  assert.deepEqual(fixture.provenance.fieldCoverage, { scheduledDeparture: 393, estimatedDeparture: 206, actualDeparture: 342, boardingTime: 328, gate: 328, codeshare: 225 });
  assert.doesNotMatch(`${server}\n${route}`, /fetch\(|unstable_cache|revalidate/);
  assert.doesNotMatch(route, /liveContextServer|createRequire/);
  assert.match(route, /const capturedFlights = normalizeFixtureFlights\(flightDay\)/);
  assert.match(route, /matchFlights\(context\.flights/);
  const context = await import(pathToFileURL(path.join(feature, "liveContextServer.mjs")));
  const middayContext = context.getReplayJourneyContext(new Date("2026-09-12T10:00:00Z"));
  assert.equal(middayContext.departureCount, 220);
  assert.equal(middayContext.flights.length, 393);
  assert.equal(middayContext.sources.runtimeNetwork, false);
});

test("one Zurich replay clock maps morning and evening, survives refresh, observes DST and advances past midnight", async () => {
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  assert.equal(replay.mapZurichTimeOfDayToFixture(new Date("2026-07-01T06:15:30Z"), "2026-09-12").toISOString(), "2026-09-12T06:15:30.000Z");
  assert.equal(replay.mapZurichTimeOfDayToFixture(new Date("2026-12-01T19:45:00Z"), "2026-09-12").toISOString(), "2026-09-12T18:45:00.000Z");
  assert.equal(replay.nextZurichMidnight(new Date("2026-03-28T12:00:00Z")).toISOString(), "2026-03-28T23:00:00.000Z");
  assert.equal(replay.nextZurichMidnight(new Date("2026-03-29T12:00:00Z")).toISOString(), "2026-03-29T22:00:00.000Z");
  assert.equal(replay.nextZurichMidnight(new Date("2026-10-25T12:00:00Z")).toISOString(), "2026-10-25T23:00:00.000Z");
  const anchor = replay.createReplayAnchor({ fixtureVersion: "v1", serviceDate: "2026-09-12", realNow: new Date("2030-01-01T10:00:00Z"), explicitTime: "23:59:00" });
  const restored = replay.createReplayAnchor({ fixtureVersion: "v1", serviceDate: "2026-09-12", realNow: new Date("2030-01-01T10:01:00Z"), storedAnchor: anchor });
  assert.strictEqual(restored, anchor);
  assert.equal(replay.replayNow(anchor, new Date("2030-01-01T10:00:30Z")).toISOString(), "2026-09-12T21:59:30.000Z");
  assert.equal(replay.replayClockState(anchor, new Date("2030-01-01T10:02:00Z")).scheduleEnded, true);
  assert.equal(replay.shouldRebasePassiveReplay(anchor, new Date("2030-01-01T10:02:00Z")), true);
  assert.equal(replay.shouldRebasePassiveReplay(anchor, new Date("2030-01-01T10:02:00Z"), { travel: { selectedFlight: { id: "confirmed" } } }), false);
  assert.equal(replay.shouldRebasePassiveReplay(anchor, new Date("2030-01-01T10:02:00Z"), { order: { reference: "ZRH-1" } }), false);
});

test("flight replay matches codeshares and ambiguity while keeping source observations separate", async () => {
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  const fixture = JSON.parse(fs.readFileSync(path.join(feature, "flight-day.fixture.json"), "utf8"));
  const flights = replay.normalizeFixtureFlights(fixture);
  assert.equal(replay.matchFlights(flights, "LX 8402").matches[0].flightNumber, "WK402");
  assert.equal(replay.matchFlights(flights, "London").ambiguous, true);
  const morning = replay.illustrativeFlights(flights, new Date("2026-09-12T04:00:00Z"), 4);
  assert.deepEqual(morning.map((flight) => flight.flightNumber), ["WK130", "WK398", "WK214", "WK264"]);
  const midday = replay.illustrativeFlights(flights, new Date("2026-09-12T10:00:00Z"), 4);
  assert.deepEqual(midday.map((flight) => flight.flightNumber), ["LX1888", "LX2142", "LX1222", "LX332"]);
  const evening = replay.illustrativeFlights(flights, new Date("2026-09-12T17:00:00Z"), 4);
  assert.deepEqual(evening.map((flight) => flight.flightNumber), ["AY1514", "A3853", "AZ573", "LX1110"]);
  const assumedItinerary = replay.selectAssumedItinerary(flights, new Date("2026-09-12T10:00:00Z"));
  assert.equal(assumedItinerary.flightNumber, "CX382");
  assert.equal(assumedItinerary.assumptionBasis, "arrival_window");
  assert.ok(assumedItinerary.gate && assumedItinerary.boardingTime);
  assert.ok((new Date(assumedItinerary.effectiveDeparture || assumedItinerary.scheduledDeparture).getTime() - new Date("2026-09-12T10:00:00Z").getTime()) / 60_000 >= 90);
  assert.equal(replay.selectAssumedItinerary(flights, new Date("2026-09-12T20:45:01Z")), null);
  const itineraryCandidates = [
    { id: "missing", flightNumber: "LX1", destination: "Paris", destinationCode: "CDG", scheduledDeparture: "2026-09-12T12:00:00Z", boardingTime: null, gate: null, simulationEvents: [] },
    { id: "complete", flightNumber: "LX2", destination: "London", destinationCode: "LHR", scheduledDeparture: "2026-09-12T12:10:00Z", boardingTime: "2026-09-12T11:40:00Z", gate: "A52", simulationEvents: [] },
  ];
  assert.equal(replay.selectAssumedItinerary(itineraryCandidates, new Date("2026-09-12T10:20:00Z")).id, "complete");
  const missingGateItinerary = replay.selectAssumedItinerary([itineraryCandidates[0]], new Date("2026-09-12T10:20:00Z"));
  assert.equal(missingGateItinerary.id, "missing");
  assert.equal(missingGateItinerary.gate, null);
  assert.equal(missingGateItinerary.boardingTime, null);
  const withinNineteenMinutes = replay.illustrativeFlights(flights, new Date("2026-09-12T10:46:00Z"), 4);
  assert.equal(new Date(withinNineteenMinutes[0].scheduledDeparture).getTime() - new Date("2026-09-12T10:46:00Z").getTime(), 4 * 60_000);
  const nearLast = replay.illustrativeFlights(flights, new Date("2026-09-12T20:41:00Z"), 4);
  assert.deepEqual(nearLast.map((flight) => flight.flightNumber), ["WK170", "LX1638"]);
  assert.deepEqual(replay.illustrativeFlights(flights, new Date("2026-09-12T20:45:01Z"), 4), []);
  const beforeAdvance = replay.illustrativeFlights(flights, new Date("2026-09-12T11:04:59Z"), 4);
  const afterAdvance = replay.illustrativeFlights(flights, new Date("2026-09-12T11:05:01Z"), 4);
  assert.deepEqual(beforeAdvance.map((flight) => flight.flightNumber), ["LX008", "WK002", "LX2114", "LX160"]);
  assert.deepEqual(afterAdvance.map((flight) => flight.flightNumber), ["LX072", "WK332", "LX040", "LX038"]);
  const equalTimeAndCodeshare = [
    { id: "first", flightNumber: "LX100", codeshares: ["UA 900"], destinationCode: "LHR", destination: "London", scheduledDeparture: "2026-09-12T12:00:00Z", simulationEvents: [] },
    { id: "duplicate", flightNumber: "UA900", codeshares: ["LX 100"], destinationCode: "LHR", destination: "London", scheduledDeparture: "2026-09-12T12:00:00Z", simulationEvents: [] },
    { id: "second", flightNumber: "BA200", codeshares: [], destinationCode: "LCY", destination: "London City", scheduledDeparture: "2026-09-12T12:00:00Z", simulationEvents: [] },
  ];
  assert.deepEqual(replay.upcomingFlights(equalTimeAndCodeshare, new Date("2026-09-12T11:59:00Z")).map((flight) => flight.id), ["first", "second"]);
  const missing = { ...flights[0], boardingTime: null, gate: null };
  assert.equal(replay.boardingCountdown(missing, new Date("2026-09-12T01:00:00Z")).known, false);
  assert.equal(replay.boardingCountdown(missing, new Date("2026-09-12T01:00:00Z")).label, "Boarding time unavailable");
  const capturedDeparted = { ...flights[0], scheduledDeparture: "2026-09-12T12:00:00Z", boardingTime: "2026-09-12T11:30:00Z", capturedObservation: { statusText: "Departed", actualDeparture: "2026-09-12T12:04:00Z" } };
  assert.equal(replay.replayFlightStatus(capturedDeparted, new Date("2026-09-12T08:00:00Z")).label, "Scheduled");
  const cancelled = { ...capturedDeparted, simulationEvents: [{ type: "cancelled", at: "2026-09-12T07:00:00Z" }] };
  assert.equal(replay.replayFlightStatus(cancelled, new Date("2026-09-12T08:00:00Z")).isCancelled, true);
  assert.equal(replay.upcomingFlights([cancelled], new Date("2026-09-12T08:00:00Z")).length, 0);
  const rescheduled = { ...capturedDeparted, simulationEvents: [{ type: "departure_time_change", at: "2026-09-12T07:00:00Z", effectiveDeparture: "2026-09-12T12:30:00Z" }] };
  assert.equal(replay.effectiveDepartureAt(rescheduled, new Date("2026-09-12T08:00:00Z")), "2026-09-12T12:30:00.000Z");
  assert.equal(replay.upcomingFlights([rescheduled], new Date("2026-09-12T12:15:00Z"))[0].effectiveDeparture, "2026-09-12T12:30:00.000Z");
  assert.equal(replay.boardingCountdown(capturedDeparted, new Date("2026-09-12T13:00:00Z")).seconds, 0);
  assert.equal(replay.formatRemaining(29), "<1 min");
  assert.equal(replay.formatRemaining(60), "1 min");
  assert.equal(replay.formatRemaining(6898), "1h 55m");
});

test("journey and simulated order paths share the replay clock and announce meaningful changes once", async () => {
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  const flight = { id: "f", flightNumber: "LX1", destination: "London", scheduledDeparture: "2026-09-12T13:00:00Z", boardingTime: "2026-09-12T12:20:00Z", gate: "E52" };
  const now = new Date("2026-09-12T11:00:00Z");
  assert.equal(replay.assessReplayJourney({ stage: "past_security", flight }, now).outcome, "explore");
  assert.equal(replay.normalizeJourneyStage("near_gate"), "at_gate");
  assert.equal(replay.normalizeJourneyStage("at_airport"), "at_airport");
  assert.equal(replay.recommendFulfillment({ stage: "at_gate", flight, demoNow: now }).method, "gate_delivery");
  assert.equal(replay.recommendFulfillment({ stage: "past_security", flight, demoNow: now }).method, "collection");
  assert.equal(replay.recommendFulfillment({ stage: "at_gate", flight: { ...flight, boardingTime: "2026-09-12T11:08:00Z" }, demoNow: now }).method, "none");
  const delivery = { confirmedAtDemo: now.toISOString(), fulfillment: { method: "gate_delivery" } };
  assert.equal(replay.orderProgress(delivery, new Date("2026-09-12T11:02:00Z")).state, "Ready");
  assert.equal(replay.orderProgress(delivery, new Date("2026-09-12T11:06:00Z")).state, "Arriving");
  assert.equal(replay.orderProgress(delivery, new Date("2026-09-12T11:08:00Z")).state, "Delivered");
  const collection = { confirmedAtDemo: now.toISOString(), fulfillment: { method: "collection" } };
  assert.equal(replay.orderProgress(collection, new Date("2026-09-12T11:04:00Z")).state, "Ready for pickup");
  assert.equal(replay.orderProgress({ ...collection, collectedAtDemo: "2026-09-12T11:05:00Z" }, new Date("2026-09-12T11:05:00Z")).state, "Collected");
  assert.equal(replay.nextMeaningfulOrderAnnouncement("Preparing", "Ready", []), "Ready");
  assert.equal(replay.nextMeaningfulOrderAnnouncement("Preparing", "Ready", ["Ready"]), null);
  assert.equal(replay.nextMeaningfulOrderAnnouncement("Ready", "On the way", []), null);
});

test("Avolta Realtime model configuration defaults to the standard comparison model and fails closed", async () => {
  const config = await import(pathToFileURL(path.join(feature, "realtimeConfig.mjs")));
  assert.equal(config.resolveAvoltaRealtimeModel(), "gpt-realtime-2.1");
  assert.equal(config.resolveAvoltaRealtimeModel("gpt-realtime-2.1-mini"), "gpt-realtime-2.1-mini");
  assert.equal(config.resolveAvoltaRealtimeModel("gpt-realtime-2.1"), "gpt-realtime-2.1");
  assert.throws(() => config.resolveAvoltaRealtimeModel("gpt-realtime"), /Unsupported/);
  assert.equal(config.isAllowedAvoltaRealtimeModel("gpt-realtime-2.1"), true);
  assert.equal(config.isAllowedAvoltaRealtimeModel("gpt-realtime"), false);
});

test("Avolta paths contain no Juliette or bakery-specific copy", () => {
  const files = [
    ...fs.readdirSync(feature).filter((name) => /\.(jsx|mjs|json|md|css)$/.test(name) && name !== "IMPORT_MANIFEST.md").map((name) => path.join(feature, name)),
    path.join(root, "app", "avolta-demo", "page.jsx"),
    path.join(root, "app", "api", "avolta-demo", "access", "route.js"),
    path.join(root, "app", "api", "avolta-demo", "realtime-token", "route.js"),
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /Juliette|Erlenbach|croissant|bakery/i, file);
  }
});

function normalizeUtterance(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const APPROVAL_WORDS = new Set([
  "absolutely", "ahead", "approve", "approved", "confirm", "confirmed", "correct", "do", "go", "good", "i", "is", "it", "okay", "ok", "order", "please", "sounds", "thanks", "thank", "that", "thats", "the", "this", "yes", "yeah", "yep", "you", "yup",
]);
const APPROVAL_SIGNAL = /^(?:yes|yeah|yep|yup|absolutely|confirm|confirmed|approve|approved|ok|okay)$|\b(?:go ahead|please do|do it|sounds good|thats correct|that is correct)\b/;

const REFUSAL_PATTERN = /\b(no|nope|cancel|stop|wait|hold|change|dont|do not|not yet)\b/;
const QUESTION_OR_STATUS_PATTERN = /^(?:is|was|were|has|have|had|did|does|do you|can you|could you|would you|will you|shall i|shall we)\b/;

export function classifySpokenOrderApproval(utterance) {
  const normalized = normalizeUtterance(utterance);
  if (!normalized) return "ambiguous";
  if (REFUSAL_PATTERN.test(normalized)) return "refused";
  if (QUESTION_OR_STATUS_PATTERN.test(normalized)) return "ambiguous";
  const words = normalized.split(" ");
  if (words.length > 8 || words.some((word) => !APPROVAL_WORDS.has(word))) return "ambiguous";
  return words.some((word) => APPROVAL_SIGNAL.test(word)) || APPROVAL_SIGNAL.test(normalized) ? "approved" : "ambiguous";
}

function messageText(item) {
  return (item?.content || []).map((entry) => entry?.type === "input_audio" || entry?.type === "output_audio" ? entry.transcript : entry?.type === "input_text" || entry?.type === "output_text" ? entry.text : "").filter(Boolean).join(" ").trim() || null;
}

export function latestUserTurn(history) {
  if (!Array.isArray(history)) return null;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item?.type === "message" && item.role === "user" && item.itemId) return { itemId: item.itemId, status: item.status, text: messageText(item) };
  }
  return null;
}

export function findOrderConfirmationReply(history, reviewUserItemId) {
  if (!Array.isArray(history) || !reviewUserItemId) return { ok: false, reason: "missing_review_boundary" };
  const reviewIndex = history.findIndex((item) => item?.itemId === reviewUserItemId);
  if (reviewIndex < 0) return { ok: false, reason: "missing_review_boundary" };
  const questionIndex = history.findIndex((item, index) => index > reviewIndex && item?.type === "message" && item.role === "assistant" && item.status === "completed" && isOrderConfirmationQuestion(messageText(item)));
  if (questionIndex < 0) return { ok: false, reason: "question_not_spoken" };
  const reply = history.slice(questionIndex + 1).find((item) => item?.type === "message" && item.role === "user" && item.itemId);
  if (!reply) return { ok: false, reason: "no_new_reply" };
  return { ok: true, questionItemId: history[questionIndex].itemId, reply: { itemId: reply.itemId, status: reply.status, text: messageText(reply) } };
}

export function isOrderConfirmationQuestion(value) {
  const normalized = normalizeUtterance(value);
  if (!normalized || !/\b(?:do|would|can|could|will|shall|ready|please)\b/.test(normalized)) return false;
  return /\b(?:confirm|approve|finalize)\b(?:\s+\w+){0,5}\s+\b(?:order|purchase)\b/.test(normalized)
    || /\b(?:order|purchase)\b(?:\s+\w+){0,5}\s+\b(?:confirm|approve|finalize)\b/.test(normalized);
}

export function waitForScopedConfirmationReply({ getHistory, subscribe, reviewUserItemId, timeoutMs = 1800 }) {
  const inspect = () => findOrderConfirmationReply(getHistory(), reviewUserItemId);
  const current = inspect();
  if (current.ok && current.reply?.status === "completed" && current.reply?.text) return Promise.resolve(current);
  return new Promise((resolve) => {
    let timeoutId = null;
    let unsubscribe = () => {};
    const finish = (result = null) => { if (timeoutId !== null) clearTimeout(timeoutId); unsubscribe(); resolve(result); };
    const onHistory = (history) => {
      if (history === null) { finish(null); return; }
      const result = inspect();
      if (result.ok && result.reply?.status === "completed" && result.reply?.text) finish(result);
    };
    unsubscribe = subscribe(onHistory) || unsubscribe;
    timeoutId = setTimeout(() => finish(inspect()), timeoutMs);
  });
}

export function validateSpokenOrderApproval({ review, expectedFingerprint, reviewUserItemId, confirmationReply }) {
  if (!review || !expectedFingerprint || review.fingerprint !== expectedFingerprint) return { ok: false, reason: "stale_review", error: "The reviewed order changed. Review it again before confirming." };
  if (!reviewUserItemId) return { ok: false, reason: "missing_review_boundary", error: "Ask the traveler to review the order again before confirming." };
  if (!confirmationReply?.ok) return { ok: false, pending: true, retryable: true, reason: confirmationReply?.reason || "no_new_reply", error: confirmationReply?.reason === "question_not_spoken" ? "Ask the order confirmation question and wait for the answer." : "The traveler’s confirmation reply is still pending." };
  if (confirmationReply.reply?.status !== "completed" || !confirmationReply.reply?.text) return { ok: false, pending: true, retryable: true, reason: "reply_transcript_pending", error: "The traveler’s confirmation transcript is still settling." };
  const decision = classifySpokenOrderApproval(confirmationReply.reply.text);
  if (decision === "approved") return { ok: true, decision, fingerprint: review.fingerprint };
  if (decision === "refused") return { ok: false, decision, reason: "refused", error: "The traveler did not confirm the order." };
  return { ok: false, decision, reason: "ambiguous", error: "The reply was not an unambiguous order confirmation. Ask again and wait." };
}

export function shouldKeepApprovalArmed(result) {
  return Boolean(result && !result.ok && result.pending && result.retryable);
}

export async function completeSpokenOrderConfirmation({ approvalState, expectedFingerprint, getCurrentApprovalState, getCurrentGeneration, getCurrentSession, getReview, waitForConfirmationReply, finalizeOrder, onConsentValidated = () => {} }) {
  if (!approvalState) return { ok: false, reason: "approval_cancelled", error: "The order confirmation was cancelled. Review the order again before confirming.", closeOverlay: false, showOrderTracker: false, clearApproval: true };
  const confirmationReply = await waitForConfirmationReply(approvalState);
  const sessionIsCurrent = isApprovalSessionCurrent({ approvalState, currentApprovalState: getCurrentApprovalState(), currentGeneration: getCurrentGeneration(), currentSession: getCurrentSession() });
  const approval = sessionIsCurrent
    ? validateSpokenOrderApproval({ review: getReview(), expectedFingerprint, reviewUserItemId: approvalState?.reviewUserItemId, confirmationReply })
    : { ok: false, reason: "approval_cancelled", error: "The order confirmation was cancelled. Review the order again before confirming." };
  if (!approval.ok) return { ...approval, closeOverlay: false, showOrderTracker: false, clearApproval: !shouldKeepApprovalArmed(approval) };
  onConsentValidated(approval);
  const committed = finalizeOrder(expectedFingerprint);
  return committed.ok
    ? { ...committed, consent: "validated", closeOverlay: true, showOrderTracker: true, clearApproval: true }
    : { ...committed, reason: "order_commit_failed", closeOverlay: false, showOrderTracker: false, clearApproval: false };
}

export function isApprovalSessionCurrent({ approvalState, currentApprovalState, currentGeneration, currentSession }) {
  return Boolean(approvalState && approvalState === currentApprovalState && currentSession && approvalState.generation === currentGeneration && approvalState.session === currentSession);
}

export function finalizeReviewedOrder({ review, currentFingerprint, expectedFingerprint = null, existingReservation = null, reference, confirmedAt, confirmedAtDemo }) {
  if (expectedFingerprint && expectedFingerprint !== currentFingerprint) return { ok: false, error: "The reviewed order changed. Review it again before confirming." };
  if (!review || review.fingerprint !== currentFingerprint) return { ok: false, error: "The bag changed. Review it again before confirming." };
  if (existingReservation?.fingerprint === currentFingerprint) return { ok: true, duplicatePrevented: true, reservation: existingReservation };
  return {
    ok: true,
    duplicatePrevented: false,
    reservation: {
      ...review,
      reference,
      confirmedAt,
      confirmedAtDemo,
      conceptReservation: true,
      fulfillmentSimulated: true,
      submittedExternally: false,
    },
  };
}

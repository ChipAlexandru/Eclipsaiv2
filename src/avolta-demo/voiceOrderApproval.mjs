function normalizeUtterance(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const APPROVAL_PHRASES = new Set([
  "yes",
  "yes please",
  "yes confirm",
  "yes confirm it",
  "yes confirm the order",
  "yes please confirm it",
  "yes please confirm the order",
  "yes go ahead",
  "i confirm",
  "i confirm it",
  "i confirm the order",
  "confirm it",
  "confirm the order",
  "go ahead",
  "go ahead please",
  "please do",
  "do it",
  "sounds good",
  "that sounds good",
  "thats correct",
]);

const REFUSAL_PATTERN = /\b(no|nope|cancel|stop|wait|hold|change|dont|do not|not yet)\b/;

export function classifySpokenOrderApproval(utterance) {
  const normalized = normalizeUtterance(utterance);
  if (!normalized) return "ambiguous";
  if (REFUSAL_PATTERN.test(normalized)) return "refused";
  return APPROVAL_PHRASES.has(normalized) ? "approved" : "ambiguous";
}

export function latestCompletedUserUtterance(history) {
  if (!Array.isArray(history)) return null;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item?.type !== "message" || item.role !== "user" || item.status !== "completed") continue;
    const text = (item.content || []).map((entry) => entry?.type === "input_audio" ? entry.transcript : entry?.type === "input_text" ? entry.text : "").filter(Boolean).join(" ").trim();
    if (text) return { itemId: item.itemId, text };
  }
  return null;
}

export function latestUserItemId(history) {
  if (!Array.isArray(history)) return null;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item?.type === "message" && item.role === "user" && item.itemId) return item.itemId;
  }
  return null;
}

export function validateSpokenOrderApproval({ review, expectedFingerprint, reviewUserItemId, latestUser }) {
  if (!review || !expectedFingerprint || review.fingerprint !== expectedFingerprint) return { ok: false, reason: "stale_review", error: "The reviewed order changed. Review it again before confirming." };
  if (!reviewUserItemId) return { ok: false, reason: "missing_review_boundary", error: "Ask the traveler to review the order again before confirming." };
  if (!latestUser?.itemId || latestUser.itemId === reviewUserItemId) return { ok: false, reason: "no_new_reply", error: "Wait for the traveler to answer the order confirmation question." };
  const decision = classifySpokenOrderApproval(latestUser.text);
  if (decision === "approved") return { ok: true, decision, fingerprint: review.fingerprint };
  if (decision === "refused") return { ok: false, decision, reason: "refused", error: "The traveler did not confirm the order." };
  return { ok: false, decision, reason: "ambiguous", error: "The reply was not an unambiguous order confirmation. Ask again and wait." };
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

export const DEFAULT_AVOLTA_REALTIME_MODEL = "gpt-realtime-2.1";
export const AVOLTA_REALTIME_MODELS = [DEFAULT_AVOLTA_REALTIME_MODEL, "gpt-realtime-2.1-mini"];

export function isAllowedAvoltaRealtimeModel(value) {
  return AVOLTA_REALTIME_MODELS.includes(value);
}

export function resolveAvoltaRealtimeModel(value) {
  if (!value) return DEFAULT_AVOLTA_REALTIME_MODEL;
  if (!isAllowedAvoltaRealtimeModel(value)) throw new Error("Unsupported Avolta Realtime model configuration.");
  return value;
}

export function idleAvoltaRealtimeVerification() {
  return {
    generation: null,
    status: "idle",
    requestedModel: null,
    serverReportedModel: null,
    sessionReportedModel: null,
    source: null,
  };
}

export function beginAvoltaRealtimeVerification(generation, requestedModel, serverReportedModel = null) {
  if (!isAllowedAvoltaRealtimeModel(requestedModel)) throw new Error("Unsupported Avolta Realtime model selection.");
  const normalizedServerModel = typeof serverReportedModel === "string" ? serverReportedModel : null;
  return {
    generation,
    status: normalizedServerModel && normalizedServerModel !== requestedModel ? "mismatch" : "pending",
    requestedModel,
    serverReportedModel: normalizedServerModel,
    sessionReportedModel: null,
    source: null,
  };
}

export function applyAvoltaRealtimeSessionEvidence(current, generation, event) {
  if (!current || current.generation !== generation) return current;
  if (event?.type !== "session.created" && event?.type !== "session.updated") return current;
  const sessionReportedModel = typeof event?.session?.model === "string" ? event.session.model : null;
  if (!sessionReportedModel) {
    if (current.status === "verified") return current;
    return { ...current, status: "unavailable", source: event.type };
  }
  return {
    ...current,
    status: isAllowedAvoltaRealtimeModel(sessionReportedModel) && sessionReportedModel === current.requestedModel ? "verified" : "mismatch",
    sessionReportedModel,
    source: event.type,
  };
}

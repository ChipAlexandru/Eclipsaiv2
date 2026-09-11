export const DEFAULT_AVOLTA_REALTIME_MODEL = "gpt-realtime-2.1-mini";
export const AVOLTA_REALTIME_MODELS = [DEFAULT_AVOLTA_REALTIME_MODEL, "gpt-realtime-2.1"];

export function isAllowedAvoltaRealtimeModel(value) {
  return AVOLTA_REALTIME_MODELS.includes(value);
}

export function resolveAvoltaRealtimeModel(value) {
  if (!value) return DEFAULT_AVOLTA_REALTIME_MODEL;
  if (!isAllowedAvoltaRealtimeModel(value)) throw new Error("Unsupported Avolta Realtime model configuration.");
  return value;
}

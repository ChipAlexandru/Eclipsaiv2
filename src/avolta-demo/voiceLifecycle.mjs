function stopStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

export function realtimeLifecycleSignal(event) {
  if (!event?.type) return null;
  if (event.type === "input_audio_buffer.speech_started") return { event: "user_speech_start", itemId: event.item_id || null };
  if (event.type === "input_audio_buffer.speech_stopped") return { event: "user_speech_stop", itemId: event.item_id || null };
  if (event.type === "conversation.item.input_audio_transcription.completed") return { event: "user_transcript_complete", itemId: event.item_id || null };
  if (event.type === "conversation.item.input_audio_transcription.failed") return { event: "user_transcript_failed", itemId: event.item_id || null };
  if (event.type === "response.created") return { event: "response_start", responseId: event.response?.id || null };
  if (event.type === "response.done") return { event: event.response?.status === "cancelled" ? "response_cancelled" : "response_end", responseId: event.response?.id || null, status: event.response?.status || null };
  return null;
}

export async function runTurnBoundOperation({ toolName, turnGeneration, getCurrentTurnGeneration, operation, backgroundResult, suppressedResult, onSuppressed = () => {} }) {
  const result = await operation();
  if (turnGeneration === getCurrentTurnGeneration()) return result;
  onSuppressed({ toolName, turnGeneration, currentTurnGeneration: getCurrentTurnGeneration() });
  return backgroundResult(suppressedResult);
}

export async function acquireMicrophoneWithTimeout({ getUserMedia, timeoutMs, isCurrent = () => true, setTimer = globalThis.setTimeout, clearTimer = globalThis.clearTimeout }) {
  if (typeof getUserMedia !== "function") throw new Error("Microphone access is unavailable in this browser.");

  let expired = false;
  let requestSettled = false;
  let timeoutId = null;
  const microphoneRequest = Promise.resolve().then(() => getUserMedia({ audio: true }));

  void microphoneRequest.then(
    (stream) => {
      requestSettled = true;
      if (expired || !isCurrent()) stopStream(stream);
    },
    () => { requestSettled = true; },
  );

  try {
    const stream = await Promise.race([
      microphoneRequest,
      new Promise((_, reject) => {
        timeoutId = setTimer(() => {
          expired = true;
          const error = new Error("Microphone permission timed out.");
          error.name = "VoiceMicrophoneTimeoutError";
          reject(error);
        }, timeoutMs);
      }),
    ]);
    if (!isCurrent()) {
      stopStream(stream);
      const error = new Error("Voice start was cancelled.");
      error.name = "VoiceStartCancelledError";
      throw error;
    }
    return stream;
  } finally {
    if (timeoutId !== null) clearTimer(timeoutId);
    if (!requestSettled) expired = true;
  }
}

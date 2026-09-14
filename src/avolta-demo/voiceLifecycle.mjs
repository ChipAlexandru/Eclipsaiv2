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

export function createToolResponseCoordinator({ requestResponse, settleMs = 40, setTimer = globalThis.setTimeout, clearTimer = globalThis.clearTimeout, onEvent = () => {} }) {
  const activeCalls = new Map();
  const completedResponses = new Set();
  const pendingCalls = new Map();
  let currentTurnGeneration = 0;
  let timerId = null;

  const clearScheduled = () => {
    if (timerId === null) return;
    clearTimer(timerId);
    timerId = null;
  };
  const schedule = () => {
    clearScheduled();
    if (activeCalls.size || !pendingCalls.size) return;
    const pending = [...pendingCalls.values()];
    if (pending.some((entry) => entry.responseId && !completedResponses.has(entry.responseId))) return;
    timerId = setTimer(() => {
      timerId = null;
      const eligible = [...pendingCalls.values()].filter((entry) => entry.turnGeneration === currentTurnGeneration);
      pendingCalls.clear();
      if (!eligible.length) return;
      const sourceResponseIds = [...new Set(eligible.map((entry) => entry.responseId).filter(Boolean))];
      onEvent("tool_continuation_requested", { turnGeneration: currentTurnGeneration, sourceResponseIds, toolCount: eligible.length });
      requestResponse({ turnGeneration: currentTurnGeneration, sourceResponseIds, toolCount: eligible.length });
    }, settleMs);
  };

  return {
    onTravelerTurn(turnGeneration) {
      currentTurnGeneration = turnGeneration;
      clearScheduled();
      for (const [callId, entry] of pendingCalls) if (entry.turnGeneration !== currentTurnGeneration) pendingCalls.delete(callId);
    },
    onToolStart({ callId, responseId, turnGeneration }) {
      if (!callId) return;
      clearScheduled();
      activeCalls.set(callId, { callId, responseId: responseId || null, turnGeneration });
    },
    onToolEnd({ callId, turnGeneration }) {
      const entry = activeCalls.get(callId);
      activeCalls.delete(callId);
      if (entry?.turnGeneration === turnGeneration && turnGeneration === currentTurnGeneration) pendingCalls.set(callId, entry);
      else if (entry) onEvent("stale_tool_continuation_suppressed", { callId, turnGeneration: entry.turnGeneration, currentTurnGeneration });
      schedule();
    },
    onResponseDone(responseId) {
      if (responseId) completedResponses.add(responseId);
      schedule();
    },
    isBusy() { return Boolean(activeCalls.size || pendingCalls.size || timerId !== null); },
    close() { clearScheduled(); activeCalls.clear(); pendingCalls.clear(); completedResponses.clear(); },
  };
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

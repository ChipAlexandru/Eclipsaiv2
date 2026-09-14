function stopStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
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

export function honoldVoiceEnabled(env = process.env) {
  return Boolean(env.HONOLD_OPENAI_API_KEY);
}

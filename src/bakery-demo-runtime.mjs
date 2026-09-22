// Public bakery demos use touch/search only, even when the host has a shared API key.
export function bakeryDemoVoiceEnabled(env = process.env) {
  return !env.VERCEL && !env.VERCEL_ENV;
}

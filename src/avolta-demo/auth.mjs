import { createHash, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE = "avolta_demo_access";

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function accessConfigured() {
  return Boolean(process.env.AVOLTA_DEMO_PASSCODE);
}

export function passcodeMatches(candidate) {
  const passcode = process.env.AVOLTA_DEMO_PASSCODE;
  if (!passcode || typeof candidate !== "string") return false;
  const expected = Buffer.from(digest(passcode));
  const supplied = Buffer.from(digest(candidate));
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function expectedAccessCookie() {
  const passcode = process.env.AVOLTA_DEMO_PASSCODE;
  return passcode ? digest(`avolta-demo:${passcode}`) : null;
}

export function hasAccess(cookieStore) {
  const expected = expectedAccessCookie();
  const value = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!expected || !value || expected.length !== value.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(value));
}

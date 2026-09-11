import { NextResponse } from "next/server";
import { ACCESS_COOKIE, expectedAccessCookie, passcodeMatches } from "../../../../src/avolta-demo/auth.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  const formData = await request.formData();
  const passcode = formData.get("passcode");
  const url = new URL("/avolta-demo", request.url);
  if (!passcodeMatches(passcode)) {
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(ACCESS_COOKIE, expectedAccessCookie(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60,
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

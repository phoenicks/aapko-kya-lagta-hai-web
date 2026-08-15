import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "apk_sid";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Every visitor gets an anonymous, random session id in a first-party
// cookie — no accounts, no personal data. It's used only to (a) let someone
// change their own vote instead of voting twice, and (b) count "active
// users" as distinct sessions seen in the last 24h for the admin dashboard.
export function getOrCreateSessionId() {
  const store = cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return { sessionId: existing, isNew: false };

  const sessionId = crypto.randomUUID();
  store.set(COOKIE_NAME, sessionId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return { sessionId, isNew: true };
}

export function readSessionId() {
  return cookies().get(COOKIE_NAME)?.value || null;
}

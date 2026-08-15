import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "apk_admin";
const SESSION_LENGTH_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET is not set");
  return s;
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

// Stateless signed-cookie session: no session table needed for a single
// admin. The cookie encodes an expiry + an HMAC so it can't be forged or
// extended without knowing ADMIN_SECRET.
export function createAdminSessionValue() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_LENGTH_MS })
  ).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isValidAdminSessionValue(value) {
  if (!value || typeof value !== "string" || !value.includes(".")) return false;
  const [payload, signature] = value.split(".");
  let expected;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  const a = Buffer.from(signature || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export function setAdminCookie() {
  cookies().set(COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_LENGTH_MS / 1000,
    path: "/",
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// For use in Server Components (app/admin/page.js).
export function isAdminAuthenticated() {
  return isValidAdminSessionValue(cookies().get(COOKIE_NAME)?.value);
}

// For use inside API route handlers (they receive a Request, not the
// cookies() helper's write access, but reading via cookies() still works
// in the Next.js App Router route handler context).
export function requireAdmin() {
  return isValidAdminSessionValue(cookies().get(COOKIE_NAME)?.value);
}

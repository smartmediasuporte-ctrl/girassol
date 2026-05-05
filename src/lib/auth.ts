// Auth admin minimalista: cookie HMAC-signed.
// Single-store: senha vem de ADMIN_PASSWORD env (ou hash em AdminUser).

import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET ausente ou muito curto (>=16 chars)");
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function buildCookie(): string {
  const ts = Date.now().toString();
  const sig = sign(ts);
  return `${ts}.${sig}`;
}

function parseCookie(value: string): { ts: number } | null {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [ts, sig] = parts;
  const expected = sign(ts);
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return null;
  if (Date.now() - tsNum > SESSION_TTL_MS) return null;
  return { ts: tsNum };
}

export function attemptLogin(password: string): boolean {
  const envPwd = process.env.ADMIN_PASSWORD;
  if (!envPwd) return false;
  if (
    password.length !== envPwd.length ||
    !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(envPwd))
  ) {
    return false;
  }
  cookies().set(COOKIE_NAME, buildCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return true;
}

export function logout() {
  cookies().delete(COOKIE_NAME);
}

export function isAdmin(): boolean {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return false;
  return parseCookie(c.value) != null;
}

export class AdminAuthError extends Error {}

export function requireAdmin() {
  if (!isAdmin()) throw new AdminAuthError("Sessão necessária");
}

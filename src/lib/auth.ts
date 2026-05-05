// Auth admin minimalista: cookie HMAC-signed.
// Não usamos NextAuth pra evitar overhead — login simples por senha.
// Senha: ADMIN_PASSWORD global (env) OU storeAdminPasswordHash por loja (futuro).

import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { findStoreByTenant } from "./repos";
import type { Store } from "./types";

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

function buildCookie(storeId: string): string {
  const ts = Date.now().toString();
  const payload = `${storeId}.${ts}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function parseCookie(value: string): { storeId: string; ts: number } | null {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [storeId, ts, sig] = parts;
  const expected = sign(`${storeId}.${ts}`);
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return null;
  if (Date.now() - tsNum > SESSION_TTL_MS) return null;
  return { storeId, ts: tsNum };
}

// Hash de senha por-loja (PBKDF2 com salt no próprio hash)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 32, "sha256");
  return `pbkdf2$100000$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("pbkdf2$")) {
    const [, iterStr, saltHex, hashHex] = stored.split("$");
    const iter = Number(iterStr);
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const got = crypto.pbkdf2Sync(password, salt, iter, expected.length, "sha256");
    return (
      got.length === expected.length && crypto.timingSafeEqual(got, expected)
    );
  }
  // Plaintext fallback (não use em prod) — só pra ADMIN_PASSWORD do env
  return false;
}

export async function tenantStoreFromHeaders(): Promise<Store | null> {
  const h = headers();
  const sub = h.get("x-tenant-subdomain");
  const cd = h.get("x-tenant-custom-domain");
  return findStoreByTenant({
    subdomain: sub === "NULL" ? null : sub,
    customDomain: cd === "NULL" ? null : cd,
  });
}

export async function attemptLogin(password: string): Promise<Store | null> {
  const store = await tenantStoreFromHeaders();
  if (!store) return null;

  // Hash por-loja tem prioridade; senão cai no env global
  const { prisma } = await import("./db");
  const dbStore = await prisma.store.findUnique({ where: { id: store.id } });
  if (dbStore?.adminPasswordHash) {
    if (!verifyPassword(password, dbStore.adminPasswordHash)) return null;
  } else {
    const envPwd = process.env.ADMIN_PASSWORD;
    if (!envPwd) return null;
    if (
      password.length !== envPwd.length ||
      !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(envPwd))
    ) {
      return null;
    }
  }

  cookies().set(COOKIE_NAME, buildCookie(store.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return store;
}

export function logout() {
  cookies().delete(COOKIE_NAME);
}

export async function requireAdmin(): Promise<Store> {
  const store = await tenantStoreFromHeaders();
  if (!store) throw new AdminAuthError("Loja não identificada");

  const c = cookies().get(COOKIE_NAME);
  if (!c) throw new AdminAuthError("Sessão ausente");
  const parsed = parseCookie(c.value);
  if (!parsed) throw new AdminAuthError("Sessão inválida");
  if (parsed.storeId !== store.id) {
    throw new AdminAuthError("Sessão pertence a outra loja");
  }
  return store;
}

export class AdminAuthError extends Error {}

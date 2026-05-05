// Validação de subdomínio para auto-cadastro de loja.

const RESERVED = new Set([
  "www",
  "admin",
  "api",
  "app",
  "auth",
  "blog",
  "cdn",
  "criar-loja",
  "dashboard",
  "demo", // já é tenant fixo no seed
  "dev",
  "docs",
  "help",
  "login",
  "mail",
  "nextjs",
  "pedido",
  "pedidos",
  "produtos",
  "produto",
  "root",
  "static",
  "support",
  "test",
  "vercel",
  "ws",
]);

const PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export type SubdomainValidation =
  | { ok: true; value: string }
  | { ok: false; reason: string };

export function validateSubdomain(input: string): SubdomainValidation {
  const v = input.trim().toLowerCase();
  if (!v) return { ok: false, reason: "Subdomínio obrigatório" };
  if (v.length < 3) return { ok: false, reason: "Mínimo 3 caracteres" };
  if (v.length > 30) return { ok: false, reason: "Máximo 30 caracteres" };
  if (!PATTERN.test(v)) {
    return {
      ok: false,
      reason: "Use apenas letras minúsculas, números e hífen (não pode começar/terminar com hífen)",
    };
  }
  if (RESERVED.has(v)) return { ok: false, reason: "Subdomínio reservado" };
  return { ok: true, value: v };
}

// ───── Custom domain ─────
// Aceita domínios completos: lojinha.com.br, www.minhaloja.shop, shop.exemplo.io
// Não aceita: localhost, IPs, paths, espaços
const DOMAIN_PATTERN =
  /^(?=.{4,253}$)(?!:\/\/)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

const PLATFORM_DOMAINS = ["girassol.local", "girassol.com.br", "localhost"];

export function validateCustomDomain(
  input: string,
): { ok: true; value: string } | { ok: false; reason: string } {
  const v = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!v) return { ok: false, reason: "Domínio obrigatório" };
  if (!DOMAIN_PATTERN.test(v)) {
    return { ok: false, reason: "Formato inválido. Ex: minhaloja.com.br" };
  }
  if (
    PLATFORM_DOMAINS.includes(v) ||
    PLATFORM_DOMAINS.some((p) => v.endsWith("." + p))
  ) {
    return { ok: false, reason: "Use um domínio próprio (não da plataforma)" };
  }
  return { ok: true, value: v };
}

// Camada HTTP — replica o padrão visto no Instabuy:
// - usa API_URL_INTERNAL no server, NEXT_PUBLIC_API_URL no client
// - manda subdomain + custom_domain + host raw como query params
// - normaliza response shape: { data, status, count, http_status }

import { tenantQueryParams } from "./tenant";
import { getTenantFromRequest } from "./tenant-server";

export type ApiEnvelope<T> = {
  data: T;
  status: "success" | "error";
  count: number;
  http_status: number;
};

export class ApiError extends Error {
  constructor(
    public httpStatus: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getBaseUrl(): string {
  if (typeof window === "undefined") {
    if (process.env.API_URL_INTERNAL) return process.env.API_URL_INTERNAL;
    // Em Vercel, VERCEL_URL é injetado automaticamente em todos os deployments
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { params?: Record<string, string> } = {},
): Promise<ApiEnvelope<T>> {
  const base = getBaseUrl();
  // Lê o tenant resolvido pelo middleware (cobre subdomínio + custom + override)
  const tenant = getTenantFromRequest();

  const qp = tenantQueryParams(tenant);
  if (tenant.host) qp.set("host", tenant.host);
  for (const [k, v] of Object.entries(init.params ?? {})) qp.set(k, v);

  const url = `${base}${path}${path.includes("?") ? "&" : "?"}${qp.toString()}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    next: { revalidate: 60 },
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = { data: null, status: "error", count: 0, http_status: res.status };
  }

  const env = body as ApiEnvelope<T>;
  if (env?.status === "error") {
    throw new ApiError(env.http_status ?? res.status, env, String(env.data ?? "API error"));
  }
  return env;
}

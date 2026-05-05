import { NextResponse, type NextRequest } from "next/server";
import { deriveTenant } from "./lib/tenant";

const TENANT_COOKIE = "preview_tenant";

// Multi-tenant resolver:
// 1. Host (subdomínio ou custom domain) — produção real
// 2. Query param ?_tenant=X — preview/Vercel sem domínio próprio
// 3. Cookie preview_tenant — sticky depois do query param
// 4. DEFAULT_TENANT env — fallback final
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const fromHost = deriveTenant(host);

  let subdomain = fromHost.subdomain;
  let customDomain = fromHost.custom_domain;
  let setCookie: { name: string; value: string } | null = null;

  if (!subdomain && !customDomain) {
    const url = req.nextUrl;
    const queryTenant = url.searchParams.get("_tenant");
    if (queryTenant) {
      subdomain = queryTenant.toLowerCase();
      setCookie = { name: TENANT_COOKIE, value: subdomain };
    } else {
      const cookie = req.cookies.get(TENANT_COOKIE);
      if (cookie?.value) {
        subdomain = cookie.value;
      } else if (process.env.DEFAULT_TENANT) {
        subdomain = process.env.DEFAULT_TENANT;
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-subdomain", subdomain ?? "NULL");
  requestHeaders.set("x-tenant-custom-domain", customDomain ?? "NULL");
  requestHeaders.set("x-tenant-host", fromHost.host);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (setCookie) {
    res.cookies.set(setCookie.name, setCookie.value, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

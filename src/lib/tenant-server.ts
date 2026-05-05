// Helpers de tenant que dependem de next/headers (Server Components / API Routes).
// Mantido separado de tenant.ts pra que tenant.ts possa ser usado em Edge middleware.

import { headers } from "next/headers";
import type { Tenant } from "./tenant";

export function getTenantFromRequest(): Tenant {
  const h = headers();
  const sub = h.get("x-tenant-subdomain");
  const cd = h.get("x-tenant-custom-domain");
  return {
    subdomain: sub && sub !== "NULL" ? sub : null,
    custom_domain: cd && cd !== "NULL" ? cd : null,
    host: h.get("x-tenant-host") ?? "",
  };
}

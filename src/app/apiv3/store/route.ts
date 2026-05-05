import { type NextRequest } from "next/server";
import { findStoreByTenant } from "@/lib/repos";
import { notFound, ok } from "@/lib/envelope";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const store = await findStoreByTenant({
    subdomain: sp.get("subdomain"),
    customDomain: sp.get("custom_domain"),
  });
  if (!store) return notFound();
  return ok(store);
}

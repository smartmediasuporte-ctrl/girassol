import { type NextRequest } from "next/server";
import { findStoreByTenant, listProducts } from "@/lib/repos";
import { notFound, ok } from "@/lib/envelope";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const store = await findStoreByTenant({
    subdomain: sp.get("subdomain"),
    customDomain: sp.get("custom_domain"),
  });
  if (!store) return notFound();

  const list = await listProducts(store.id, {
    category: sp.get("category") ?? undefined,
    q: sp.get("q") ?? undefined,
  });
  return ok(list, list.length);
}

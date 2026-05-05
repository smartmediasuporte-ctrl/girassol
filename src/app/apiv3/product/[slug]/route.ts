import { type NextRequest } from "next/server";
import { findProductBySlug, findStoreByTenant } from "@/lib/repos";
import { notFound, ok } from "@/lib/envelope";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: { slug: string } }) {
  const sp = req.nextUrl.searchParams;
  const store = await findStoreByTenant({
    subdomain: sp.get("subdomain"),
    customDomain: sp.get("custom_domain"),
  });
  if (!store) return notFound();

  const product = await findProductBySlug(store.id, ctx.params.slug);
  if (!product) return notFound();
  return ok(product);
}

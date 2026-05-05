import { notFound } from "next/navigation";
import { findProductBySlug, findStoreByTenant } from "@/lib/repos";
import { getTenantFromRequest } from "@/lib/tenant-server";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<Product | null> {
  const tenant = getTenantFromRequest();
  const store = await findStoreByTenant({
    subdomain: tenant.subdomain,
    customDomain: tenant.custom_domain,
  });
  if (!store) return null;
  return findProductBySlug(store.id, slug);
}

export default async function PdpPage({ params }: { params: { slug: string } }) {
  const product = await load(params.slug);
  if (!product) notFound();

  const hasDiscount =
    product.list_price_cents != null && product.list_price_cents > product.price_cents;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
      </div>
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-black/50">
          {product.category}
        </div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-black/70">{product.description}</p>

        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-bold">{formatBRL(product.price_cents)}</div>
          {hasDiscount && (
            <div className="text-sm text-black/40 line-through">
              {formatBRL(product.list_price_cents!)}
            </div>
          )}
          <div className="text-xs text-black/50">/ {product.unit}</div>
        </div>

        <AddToCartButton product={product} />

        <div className="rounded-xl border border-black/10 p-4 text-sm">
          <div className="font-semibold">Estoque: {product.stock} {product.unit}</div>
        </div>
      </div>
    </div>
  );
}

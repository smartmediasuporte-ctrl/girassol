"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const hasDiscount =
    product.list_price_cents != null && product.list_price_cents > product.price_cents;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="aspect-square w-full bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/produto/${product.slug}`} className="block">
          <div className="line-clamp-2 text-sm font-medium">{product.name}</div>
        </Link>
        <div className="text-xs text-black/50">{product.category} · {product.unit}</div>
        <div className="mt-auto flex items-baseline gap-2">
          <div className="text-lg font-bold">{formatBRL(product.price_cents)}</div>
          {hasDiscount && (
            <div className="text-xs text-black/40 line-through">
              {formatBRL(product.list_price_cents!)}
            </div>
          )}
        </div>
        <button
          onClick={() =>
            add({
              product_id: product.id,
              slug: product.slug,
              name: product.name,
              image_url: product.image_url,
              price_cents: product.price_cents,
              qty: 1,
            })
          }
          className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-black hover:bg-brand-600"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

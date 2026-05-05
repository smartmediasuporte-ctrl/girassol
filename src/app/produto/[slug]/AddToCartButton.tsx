"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-black/10">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-lg"
        >
          −
        </button>
        <input
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 border-0 bg-transparent text-center"
        />
        <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-lg">
          +
        </button>
      </div>
      <button
        onClick={() => {
          add({
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            image_url: product.image_url,
            price_cents: product.price_cents,
            qty,
          });
          router.push("/carrinho");
        }}
        className="flex-1 rounded-lg bg-brand-500 px-6 py-3 font-semibold text-black hover:bg-brand-600"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}

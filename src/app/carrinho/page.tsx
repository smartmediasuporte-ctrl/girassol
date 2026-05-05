"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, remove, subtotalCents, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 p-10 text-center">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-sm text-black/60">Adicione produtos para começar.</p>
        <Link
          href="/produtos"
          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Carrinho</h1>
        <div className="divide-y divide-black/5 rounded-xl border border-black/5 bg-white">
          {items.map((it) => (
            <div key={it.product_id} className="flex items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image_url}
                alt={it.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{it.name}</div>
                <div className="text-xs text-black/50">
                  {formatBRL(it.price_cents)} cada
                </div>
              </div>
              <div className="flex items-center rounded-lg border border-black/10">
                <button
                  onClick={() => setQty(it.product_id, it.qty - 1)}
                  className="px-2 py-1"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{it.qty}</span>
                <button
                  onClick={() => setQty(it.product_id, it.qty + 1)}
                  className="px-2 py-1"
                >
                  +
                </button>
              </div>
              <div className="w-20 text-right text-sm font-semibold">
                {formatBRL(it.price_cents * it.qty)}
              </div>
              <button
                onClick={() => remove(it.product_id)}
                className="text-xs text-red-600 hover:underline"
              >
                remover
              </button>
            </div>
          ))}
        </div>
        <button onClick={clear} className="text-sm text-black/60 underline">
          esvaziar carrinho
        </button>
      </div>

      <aside className="h-fit space-y-3 rounded-xl border border-black/5 bg-white p-4">
        <h2 className="font-semibold">Resumo</h2>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-semibold">{formatBRL(subtotalCents)}</span>
        </div>
        <div className="text-xs text-black/50">
          Frete e total final calculados no checkout.
        </div>
        <Link
          href="/checkout"
          className="block rounded-lg bg-brand-500 px-4 py-3 text-center font-semibold text-black hover:bg-brand-600"
        >
          Finalizar compra
        </Link>
      </aside>
    </div>
  );
}

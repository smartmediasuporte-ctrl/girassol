"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/carrinho"
      className="relative rounded-full bg-black px-4 py-2 text-white hover:bg-black/80"
    >
      Carrinho
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}

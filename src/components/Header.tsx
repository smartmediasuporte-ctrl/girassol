import Link from "next/link";
import type { Store } from "@/lib/types";
import { CartButton } from "./CartButton";

export function Header({ store }: { store: Store | null }) {
  // Sem tenant: mostra branding da plataforma + CTA criar
  if (!store) {
    return (
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white">
              <span className="text-lg font-bold">G</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Girassol</div>
              <div className="text-xs text-black/60">Plataforma de e-commerce</div>
            </div>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <Link
              href="/criar-loja"
              className="rounded-full bg-black px-4 py-2 text-white hover:bg-black/85"
            >
              Criar loja
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="grid h-9 w-9 place-items-center rounded-full text-white"
            style={{ background: store.primary_color }}
          >
            <span className="text-lg font-bold">{store.name[0]}</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{store.name}</div>
            <div className="text-xs text-black/60">{store.slogan}</div>
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">Início</Link>
          <Link href="/produtos" className="hover:underline">Produtos</Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}

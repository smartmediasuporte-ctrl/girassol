import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { apiFetch } from "@/lib/http";
import type { Store } from "@/lib/types";

export const metadata: Metadata = {
  title: "Girassol Storefront",
  description: "Storefront multi-tenant",
};

async function getStore(): Promise<Store | null> {
  try {
    const env = await apiFetch<Store>("/apiv3/store");
    return env.data;
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Toca em headers() pra forçar render dinâmico (multi-tenant depende do Host)
  headers();
  const store = await getStore();

  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header store={store} />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Footer store={store} />
        </CartProvider>
      </body>
    </html>
  );
}

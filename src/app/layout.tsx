import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { findStoreByTenant } from "@/lib/repos";
import { getTenantFromRequest } from "@/lib/tenant-server";

export const metadata: Metadata = {
  title: "Girassol Storefront",
  description: "Storefront multi-tenant",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = getTenantFromRequest();
  const store = await findStoreByTenant({
    subdomain: tenant.subdomain,
    customDomain: tenant.custom_domain,
  });

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

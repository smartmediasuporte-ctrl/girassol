import Link from "next/link";
import { getTenantFromRequest } from "@/lib/tenant-server";
import { findStoreByTenant, listProducts } from "@/lib/repos";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function load() {
  const tenant = getTenantFromRequest();
  const store = await findStoreByTenant({
    subdomain: tenant.subdomain,
    customDomain: tenant.custom_domain,
  });
  if (!store) return { store: null, featured: [] as any[] };
  const products = await listProducts(store.id);
  return { store, featured: products.slice(0, 8) };
}

export default async function HomePage() {
  const { store, featured } = await load();

  if (!store) {
    // Sem tenant válido → mostra landing/marketing.
    const tenant = getTenantFromRequest();
    const triedSubdomain = tenant.subdomain ?? tenant.custom_domain;

    return (
      <div className="space-y-10">
        {triedSubdomain && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Não encontramos a loja <code>{triedSubdomain}</code>. Talvez ela ainda não exista.
          </div>
        )}

        <section className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-10 text-white">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Sua loja online em 30 segundos.
          </h1>
          <p className="mt-3 max-w-xl text-white/90">
            Storefront multi-tenant com catálogo, carrinho, PIX integrado (Mercado Pago / Asaas)
            e painel admin. Hospede no seu próprio subdomínio.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/criar-loja"
              className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/85"
            >
              Criar minha loja grátis
            </Link>
            <Link
              href="/?_tenant=girassolemporio"
              className="rounded-lg bg-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/25"
            >
              Ver loja de exemplo
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Feature
            title="PIX de verdade"
            text="QR code dinâmico via Mercado Pago ou Asaas. Webhook automático atualiza status do pedido."
          />
          <Feature
            title="Painel admin pronto"
            text="Login, gestão de pedidos, CRUD de produtos e dashboard de faturamento — sem mexer em código."
          />
          <Feature
            title="Multi-tenant nativo"
            text="Cada lojista tem o próprio subdomínio. Dados isolados no banco, sessões separadas."
          />
        </section>

        <div className="text-xs text-black/40">
          <Link href="/debug" className="underline">/debug</Link> ·{" "}
          <Link href="/criar-loja" className="underline">/criar-loja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section
        className="rounded-2xl p-8 text-white"
        style={{ background: store.primary_color }}
      >
        <h1 className="text-3xl font-bold">{store.name}</h1>
        <p className="mt-1 max-w-xl text-white/90">{store.slogan}</p>
        <Link
          href="/produtos"
          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
        >
          Ver catálogo
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Destaques</h2>
          <Link href="/produtos" className="text-sm text-black/60 hover:underline">
            ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-black/60">{text}</p>
    </div>
  );
}

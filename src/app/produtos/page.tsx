import { findStoreByTenant, listProducts } from "@/lib/repos";
import { getTenantFromRequest } from "@/lib/tenant-server";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function load(searchParams: { category?: string; q?: string }) {
  const tenant = getTenantFromRequest();
  const store = await findStoreByTenant({
    subdomain: tenant.subdomain,
    customDomain: tenant.custom_domain,
  });
  if (!store) return [];
  return listProducts(store.id, {
    category: searchParams.category,
    q: searchParams.q,
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const products = await load(searchParams);
  const cats = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <form className="ml-auto flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Buscar produto…"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white">
            Buscar
          </button>
        </form>
      </div>

      {cats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/produtos"
            className={`rounded-full border px-3 py-1 text-sm ${
              !searchParams.category
                ? "border-black bg-black text-white"
                : "border-black/10 hover:bg-black/5"
            }`}
          >
            Todos
          </Link>
          {cats.map((c) => (
            <Link
              key={c}
              href={`/produtos?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                searchParams.category === c
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:bg-black/5"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-black/60">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { listCategoriesWithItems } from "@/lib/repos";
import { MenuItemCard } from "@/components/MenuItemCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cardápio",
  description:
    "Confira o cardápio do Restaurante Girassol — pratos vegetarianos, naturais, sucos, açaí e lanches saudáveis em Brasília.",
};

export default async function CardapioPage({
  searchParams,
}: {
  searchParams: { c?: string; tag?: string };
}) {
  const categories = await listCategoriesWithItems();
  const selectedCat = searchParams.c;
  const selectedTag = searchParams.tag;

  // filtra
  const filtered = categories
    .filter((c) => !selectedCat || c.slug === selectedCat)
    .map((c) => ({
      ...c,
      items: selectedTag
        ? c.items.filter((it) => it.tags.includes(selectedTag))
        : c.items,
    }))
    .filter((c) => c.items.length > 0);

  const allTags = Array.from(
    new Set(categories.flatMap((c) => c.items.flatMap((i) => i.tags))),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-sun-600">Cardápio</p>
        <h1 className="mt-2 font-display text-5xl text-ink-900">
          Sabor que vem da terra
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-700">
          Pratos vegetarianos preparados com ingredientes frescos, integrais e selecionados.
          Filtre por categoria ou restrição alimentar.
        </p>
      </header>

      {/* Categorias */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
        <FilterChip active={!selectedCat} href="/cardapio">
          Todos
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={selectedCat === c.slug}
            href={`/cardapio?c=${c.slug}${selectedTag ? `&tag=${selectedTag}` : ""}`}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
          {selectedTag && (
            <Link
              href={`/cardapio${selectedCat ? `?c=${selectedCat}` : ""}`}
              className="rounded-full bg-cream-200 px-3 py-1 text-ink-700 hover:bg-cream-300"
            >
              ✕ limpar filtro
            </Link>
          )}
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/cardapio?${selectedCat ? `c=${selectedCat}&` : ""}tag=${t}`}
              className={`rounded-full px-3 py-1 ring-1 ring-inset ${
                selectedTag === t
                  ? "bg-leaf-500 text-white ring-leaf-500"
                  : "bg-white text-leaf-700 ring-leaf-200 hover:bg-leaf-50"
              }`}
            >
              {tagLabel(t)}
            </Link>
          ))}
        </div>
      )}

      {/* Categorias com items */}
      <div className="mt-12 space-y-16">
        {filtered.map((c) => (
          <section key={c.id}>
            <div className="mb-5 flex items-end gap-3">
              <h2 className="font-display text-3xl text-ink-900">{c.name}</h2>
              {c.description && (
                <p className="hidden text-sm text-ink-500 md:block">— {c.description}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {c.items.map((it) => (
                <MenuItemCard key={it.id} item={it} dense />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-cream-300 p-12 text-center text-ink-500">
            Nenhum item encontrado nesse filtro.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 ring-1 ring-inset transition ${
        active
          ? "bg-sun-500 text-white ring-sun-500"
          : "bg-white text-ink-700 ring-cream-300 hover:bg-cream-100"
      }`}
    >
      {children}
    </Link>
  );
}

function tagLabel(t: string): string {
  const m: Record<string, string> = {
    vegan: "Vegano",
    vegetarian: "Vegetariano",
    gluten_free: "Sem glúten",
    lactose_free: "Sem lactose",
    sugar_free: "Sem açúcar",
    raw: "Cru",
  };
  return m[t] ?? t;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!isAdmin()) redirect("/admin/login");

  const [items, categories, posts] = await Promise.all([
    prisma.menuItem.count(),
    prisma.menuCategory.count(),
    prisma.post.count(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-ink-900">Painel</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card href="/admin/cardapio" label="Pratos do cardápio" value={items} />
        <Card href="/admin/categorias" label="Categorias" value={categories} />
        <Card href="/admin/posts" label="Posts da comunidade" value={posts} />
      </div>

      <section>
        <h2 className="font-display text-xl text-ink-900">Atalhos</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/cardapio/novo"
            className="rounded-full bg-sun-500 px-4 py-2 font-semibold text-white hover:bg-sun-600"
          >
            + Novo prato
          </Link>
          <Link
            href="/admin/posts/novo"
            className="rounded-full border border-leaf-500 px-4 py-2 font-semibold text-leaf-700 hover:bg-leaf-500 hover:text-white"
          >
            + Novo post
          </Link>
          <Link
            href="/admin/configuracoes"
            className="rounded-full bg-white px-4 py-2 font-semibold text-ink-700 ring-1 ring-cream-300 hover:bg-cream-100"
          >
            Configurações do site
          </Link>
        </div>
      </section>
    </div>
  );
}

function Card({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream-200/60 hover:shadow-md"
    >
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-2 font-display text-3xl text-ink-900">{value}</div>
    </Link>
  );
}

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  if (!isAdmin()) redirect("/admin/login");
  const cats = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });

  async function create(formData: FormData) {
    "use server";
    requireAdmin();
    const slug = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    if (!slug) return;
    await prisma.menuCategory.create({
      data: {
        slug,
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? "") || null,
        sortOrder: parseInt(String(formData.get("sortOrder") ?? "0")) || 0,
      },
    });
    revalidatePath("/admin/categorias");
    revalidatePath("/cardapio");
  }

  async function remove(formData: FormData) {
    "use server";
    requireAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.menuCategory.delete({ where: { id } });
    revalidatePath("/admin/categorias");
    revalidatePath("/cardapio");
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <h1 className="font-display text-3xl text-ink-900">Categorias</h1>
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-cream-200/60">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Itens</th>
                <th className="px-3 py-2">Ordem</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id} className="border-t border-cream-200/60">
                  <td className="px-3 py-2 font-medium text-ink-900">{c.name}</td>
                  <td className="px-3 py-2 text-xs text-ink-500">{c.slug}</td>
                  <td className="px-3 py-2">{c._count.items}</td>
                  <td className="px-3 py-2">{c.sortOrder}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={remove}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-xs text-red-600 hover:underline">
                        excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {cats.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-500">
                    Nenhuma categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-4 ring-1 ring-cream-200/60">
        <h2 className="font-display text-lg text-ink-900">Nova categoria</h2>
        <form action={create} className="mt-3 space-y-2 text-sm">
          <input
            name="name"
            required
            placeholder="Nome (ex: Sucos & Vitaminas)"
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          />
          <input
            name="slug"
            required
            placeholder="slug (ex: sucos-vitaminas)"
            pattern="[a-z0-9-]+"
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          />
          <input
            name="description"
            placeholder="Descrição curta (opcional)"
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          />
          <input
            name="sortOrder"
            type="number"
            placeholder="Ordem (0)"
            defaultValue={0}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          />
          <button className="w-full rounded-full bg-sun-500 px-4 py-2 font-semibold text-white hover:bg-sun-600">
            + Criar
          </button>
        </form>
      </aside>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listAllItems } from "@/lib/repos";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCardapio() {
  if (!isAdmin()) redirect("/admin/login");
  const items = await listAllItems(true);

  async function remove(formData: FormData) {
    "use server";
    if (!isAdmin()) return;
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.menuItem.delete({ where: { id } });
    revalidatePath("/admin/cardapio");
    revalidatePath("/cardapio");
    revalidatePath("/");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl text-ink-900">Cardápio</h1>
        <Link
          href="/admin/cardapio/novo"
          className="rounded-full bg-sun-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sun-600"
        >
          + Novo prato
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-cream-200/60">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Preço</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Destaque</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-cream-200/60">
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/cardapio/${it.id}`}
                    className="font-medium text-ink-900 hover:text-sun-600"
                  >
                    {it.name}
                  </Link>
                  <div className="text-xs text-ink-500">{it.slug}</div>
                </td>
                <td className="px-4 py-2 text-ink-700">{it.categoryName}</td>
                <td className="px-4 py-2 font-semibold">{formatBRL(it.priceCents)}</td>
                <td className="px-4 py-2 text-xs text-ink-500">
                  {it.tags.join(", ") || "—"}
                </td>
                <td className="px-4 py-2 text-xs">{it.highlight ? "⭐" : ""}</td>
                <td className="px-4 py-2 text-right">
                  <form action={remove}>
                    <input type="hidden" name="id" value={it.id} />
                    <button className="text-xs text-red-600 hover:underline">
                      excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-ink-500">
                  Nenhum prato cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { deleteProduct, listProducts } from "@/lib/repos";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductsAdmin() {
  let store;
  try {
    store = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  const products = await listProducts(store.id, { includeInactive: true });

  async function remove(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await deleteProduct(id);
    revalidatePath("/admin/produtos");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          + Novo produto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-black/50">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Preço</th>
              <th className="px-3 py-2">Estoque</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="font-medium underline"
                  >
                    {p.name}
                  </Link>
                  <div className="font-mono text-xs text-black/50">{p.slug}</div>
                </td>
                <td className="px-3 py-2">{p.category}</td>
                <td className="px-3 py-2 font-semibold">{formatBRL(p.price_cents)}</td>
                <td className="px-3 py-2">{p.stock} {p.unit}</td>
                <td className="px-3 py-2 text-right">
                  <form action={remove}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-xs text-red-600 hover:underline">
                      excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-black/50">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

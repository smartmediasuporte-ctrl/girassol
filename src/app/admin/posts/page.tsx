import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPosts } from "@/lib/repos";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  if (!isAdmin()) redirect("/admin/login");
  const posts = await listPosts({ includeUnpublished: true });

  async function remove(formData: FormData) {
    "use server";
    requireAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/posts");
    revalidatePath("/comunidade");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl text-ink-900">Posts</h1>
        <Link
          href="/admin/posts/novo"
          className="rounded-full bg-sun-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sun-600"
        >
          + Novo post
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-cream-200/60">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Publicado</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-cream-200/60">
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="font-medium text-ink-900 hover:text-sun-600"
                  >
                    {p.title}
                  </Link>
                  <div className="text-xs text-ink-500">{p.slug}</div>
                </td>
                <td className="px-4 py-2 text-ink-700">{p.category}</td>
                <td className="px-4 py-2">{p.published ? "✓" : "rascunho"}</td>
                <td className="px-4 py-2 text-xs text-ink-500">
                  {formatDate(p.publishedAt)}
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={remove}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-xs text-red-600 hover:underline">
                      excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-ink-500">
                  Nenhum post.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

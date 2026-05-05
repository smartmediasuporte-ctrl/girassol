import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listAllCategories } from "@/lib/repos";
import { MenuItemForm } from "../MenuItemForm";

export const dynamic = "force-dynamic";

export default async function NewItem() {
  if (!isAdmin()) redirect("/admin/login");
  const categories = await listAllCategories(true);

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-cream-200/60">
        <h1 className="font-display text-2xl text-ink-900">Crie uma categoria primeiro</h1>
        <p className="mt-2 text-sm text-ink-500">
          Antes de criar pratos, você precisa de pelo menos uma categoria.
        </p>
        <a
          href="/admin/categorias"
          className="mt-4 inline-block rounded-full bg-sun-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Ir para categorias
        </a>
      </div>
    );
  }

  async function create(formData: FormData) {
    "use server";
    requireAdmin();
    const tags = formData.getAll("tags").map(String).filter(Boolean).join(",");
    await prisma.menuItem.create({
      data: {
        slug: String(formData.get("slug") ?? ""),
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        imageUrl: String(formData.get("imageUrl") ?? "") || null,
        priceCents: Math.round(parseFloat(String(formData.get("price") ?? "0")) * 100),
        categoryId: String(formData.get("categoryId") ?? ""),
        tags,
        sortOrder: parseInt(String(formData.get("sortOrder") ?? "0")) || 0,
        highlight: formData.get("highlight") === "on",
        active: formData.get("active") === "on",
      },
    });
    revalidatePath("/admin/cardapio");
    revalidatePath("/cardapio");
    revalidatePath("/");
    redirect("/admin/cardapio");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 font-display text-3xl text-ink-900">Novo prato</h1>
      <MenuItemForm action={create} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}

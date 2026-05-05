import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findItemById, listAllCategories } from "@/lib/repos";
import { MenuItemForm } from "../MenuItemForm";

export const dynamic = "force-dynamic";

export default async function EditItem({ params }: { params: { id: string } }) {
  if (!isAdmin()) redirect("/admin/login");
  const [item, categories] = await Promise.all([
    findItemById(params.id),
    listAllCategories(true),
  ]);
  if (!item) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Prato não encontrado.
      </div>
    );
  }

  async function save(formData: FormData) {
    "use server";
    requireAdmin();
    const tags = formData.getAll("tags").map(String).filter(Boolean).join(",");
    await prisma.menuItem.update({
      where: { id: params.id },
      data: {
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
    revalidatePath(`/admin/cardapio/${params.id}`);
    revalidatePath("/cardapio");
    revalidatePath("/");
    redirect("/admin/cardapio");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 font-display text-3xl text-ink-900">Editar prato</h1>
      <MenuItemForm
        action={save}
        item={item}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        isEdit
      />
    </div>
  );
}

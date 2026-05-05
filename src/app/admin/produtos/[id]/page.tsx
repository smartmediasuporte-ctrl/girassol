import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { findProductById, updateProduct } from "@/lib/repos";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  const product = await findProductById(params.id);
  if (!product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Produto não encontrado.
      </div>
    );
  }

  async function save(formData: FormData) {
    "use server";
    await requireAdmin();
    await updateProduct(params.id, {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      image_url: String(formData.get("image_url") || "/product-placeholder.svg"),
      price_cents: Math.round(parseFloat(String(formData.get("price") ?? "0")) * 100),
      list_price_cents: formData.get("list_price")
        ? Math.round(parseFloat(String(formData.get("list_price"))) * 100)
        : null,
      category: String(formData.get("category") ?? ""),
      unit: String(formData.get("unit") ?? "un"),
      stock: parseInt(String(formData.get("stock") ?? "0")) || 0,
    });
    revalidatePath("/admin/produtos");
    revalidatePath(`/admin/produtos/${params.id}`);
    redirect("/admin/produtos");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Editar produto</h1>
      <ProductForm action={save} product={product} isEdit />
    </div>
  );
}

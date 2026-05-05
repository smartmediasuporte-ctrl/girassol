import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { createProduct } from "@/lib/repos";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  async function create(formData: FormData) {
    "use server";
    const store = await requireAdmin();
    await createProduct(store.id, {
      slug: String(formData.get("slug") ?? ""),
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
    redirect("/admin/produtos");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Novo produto</h1>
      <ProductForm action={create} />
    </div>
  );
}

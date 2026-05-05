import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PostForm } from "../PostForm";

export const dynamic = "force-dynamic";

export default function NewPost() {
  if (!isAdmin()) redirect("/admin/login");

  async function create(formData: FormData) {
    "use server";
    requireAdmin();
    await prisma.post.create({
      data: {
        slug: String(formData.get("slug") ?? ""),
        title: String(formData.get("title") ?? ""),
        excerpt: String(formData.get("excerpt") ?? ""),
        content: String(formData.get("content") ?? ""),
        coverUrl: String(formData.get("coverUrl") ?? "") || null,
        category: String(formData.get("category") ?? "blog"),
        published: formData.get("published") === "on",
      },
    });
    revalidatePath("/admin/posts");
    revalidatePath("/comunidade");
    revalidatePath("/");
    redirect("/admin/posts");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-3xl text-ink-900">Novo post</h1>
      <PostForm action={create} />
    </div>
  );
}

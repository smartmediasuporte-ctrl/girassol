import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findPostById } from "@/lib/repos";
import { PostForm } from "../PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: { id: string } }) {
  if (!isAdmin()) redirect("/admin/login");
  const post = await findPostById(params.id);
  if (!post) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Post não encontrado.
      </div>
    );
  }

  async function save(formData: FormData) {
    "use server";
    requireAdmin();
    await prisma.post.update({
      where: { id: params.id },
      data: {
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
    revalidatePath(`/comunidade/${post!.slug}`);
    revalidatePath("/");
    redirect("/admin/posts");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-3xl text-ink-900">Editar post</h1>
      <PostForm action={save} post={post} isEdit />
    </div>
  );
}

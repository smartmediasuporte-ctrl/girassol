import type { PostDTO } from "@/lib/repos";
import { ImageUploader } from "@/components/ImageUploader";

export function PostForm({
  action,
  post,
  isEdit,
}: {
  action: (fd: FormData) => Promise<void>;
  post?: PostDTO;
  isEdit?: boolean;
}) {
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-cream-200/60">
      <ImageUploader
        name="coverUrl"
        label="Imagem de capa"
        defaultValue={post?.coverUrl ?? undefined}
        aspect="wide"
        folder="posts"
      />

      <Field label="Slug">
        <input
          name="slug"
          required
          defaultValue={post?.slug}
          readOnly={isEdit}
          className="w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 read-only:bg-cream-200"
        />
      </Field>

      <Field label="Título">
        <input
          name="title"
          required
          defaultValue={post?.title}
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
        />
      </Field>

      <Field label="Resumo (excerpt)">
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={post?.excerpt}
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
        />
      </Field>

      <Field label="Conteúdo (HTML simples ou texto com parágrafos)">
        <textarea
          name="content"
          required
          rows={14}
          defaultValue={post?.content}
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 font-mono text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria">
          <select
            name="category"
            defaultValue={post?.category ?? "blog"}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          >
            <option value="blog">Blog</option>
            <option value="evento">Evento</option>
            <option value="receita">Receita</option>
          </select>
        </Field>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={post ? post.published : true}
            />
            Publicar imediatamente
          </label>
        </div>
      </div>

      <button className="rounded-full bg-sun-500 px-6 py-2 font-semibold text-white hover:bg-sun-600">
        {isEdit ? "Salvar alterações" : "Criar post"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 font-medium text-ink-700">{label}</div>
      {children}
    </label>
  );
}

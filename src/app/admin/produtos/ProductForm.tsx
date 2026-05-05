import type { Product } from "@/lib/types";
import { ImageUploader } from "@/components/ImageUploader";

export function ProductForm({
  action,
  product,
  isEdit,
}: {
  action: (fd: FormData) => Promise<void>;
  product?: Product;
  isEdit?: boolean;
}) {
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-black/5 bg-white p-4">
      <ImageUploader
        name="image_url"
        label="Imagem do produto"
        defaultValue={product?.image_url}
        aspect="square"
      />
      <Field label="Slug">
        <input
          name="slug"
          required
          defaultValue={product?.slug}
          readOnly={isEdit}
          className="w-full rounded-lg border border-black/10 px-3 py-2 read-only:bg-neutral-100"
        />
      </Field>
      <Field label="Nome">
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </Field>
      <Field label="Descrição">
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (R$)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Preço de tabela (opcional)">
          <input
            name="list_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              product?.list_price_cents != null
                ? (product.list_price_cents / 100).toFixed(2)
                : ""
            }
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Categoria">
          <input
            name="category"
            required
            defaultValue={product?.category}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Unidade">
          <input
            name="unit"
            required
            defaultValue={product?.unit ?? "un"}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Estoque">
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={product?.stock ?? 0}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
      </div>
      <button className="rounded-lg bg-black px-4 py-2 font-semibold text-white">
        {isEdit ? "Salvar alterações" : "Criar produto"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 font-medium text-black/70">{label}</div>
      {children}
    </label>
  );
}

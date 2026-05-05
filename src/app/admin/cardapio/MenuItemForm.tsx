import type { MenuItemDTO } from "@/lib/repos";
import { ImageUploader } from "@/components/ImageUploader";

const TAG_OPTIONS = [
  { value: "vegan", label: "Vegano" },
  { value: "vegetarian", label: "Vegetariano" },
  { value: "gluten_free", label: "Sem glúten" },
  { value: "lactose_free", label: "Sem lactose" },
  { value: "sugar_free", label: "Sem açúcar" },
  { value: "raw", label: "Cru / Raw" },
];

export function MenuItemForm({
  action,
  item,
  categories,
  isEdit,
}: {
  action: (fd: FormData) => Promise<void>;
  item?: MenuItemDTO;
  categories: { id: string; name: string }[];
  isEdit?: boolean;
}) {
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-cream-200/60">
      <ImageUploader
        name="imageUrl"
        label="Foto do prato"
        defaultValue={item?.imageUrl ?? undefined}
        aspect="square"
        folder="menu"
      />

      <Field label="Slug (URL)">
        <input
          name="slug"
          required
          defaultValue={item?.slug}
          readOnly={isEdit}
          className="w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 read-only:bg-cream-200"
        />
      </Field>

      <Field label="Nome">
        <input
          name="name"
          required
          defaultValue={item?.name}
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
        />
      </Field>

      <Field label="Descrição">
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={item?.description}
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria">
          <select
            name="categoryId"
            required
            defaultValue={item?.categoryId}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preço (R$)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={item ? (item.priceCents / 100).toFixed(2) : ""}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          />
        </Field>
      </div>

      <fieldset>
        <div className="mb-1 text-sm font-medium text-ink-700">Tags / restrições</div>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {TAG_OPTIONS.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tags"
                value={t.value}
                defaultChecked={item?.tags.includes(t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ordem">
          <input
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
          />
        </Field>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="highlight" defaultChecked={item?.highlight} />
            Destacar na home
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={item ? item.active : true}
            />
            Ativo
          </label>
        </div>
      </div>

      <button className="rounded-full bg-sun-500 px-6 py-2 font-semibold text-white hover:bg-sun-600">
        {isEdit ? "Salvar alterações" : "Criar prato"}
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

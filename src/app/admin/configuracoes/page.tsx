import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { ensureSettings, updateSettings } from "@/lib/settings";
import { ImageUploader } from "@/components/ImageUploader";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  if (!isAdmin()) redirect("/admin/login");
  const settings = await ensureSettings();

  async function save(formData: FormData) {
    "use server";
    requireAdmin();
    await updateSettings({
      siteName: String(formData.get("siteName") ?? "").trim(),
      tagline: String(formData.get("tagline") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").replace(/\D/g, ""),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      instagram: String(formData.get("instagram") ?? "").replace(/^@/, "").trim(),
      addressLine: String(formData.get("addressLine") ?? "").trim(),
      mapEmbedUrl: String(formData.get("mapEmbedUrl") ?? "").trim() || null,
      hoursWeek: String(formData.get("hoursWeek") ?? "").trim(),
      hoursWeekend: String(formData.get("hoursWeekend") ?? "").trim(),
      heroTitle: String(formData.get("heroTitle") ?? "").trim(),
      heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim(),
      heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim() || null,
      aboutShort: String(formData.get("aboutShort") ?? "").trim(),
      promoActive: formData.get("promoActive") === "on",
      promoTitle: String(formData.get("promoTitle") ?? "").trim(),
      promoSubtitle: String(formData.get("promoSubtitle") ?? "").trim(),
      seoDescription: String(formData.get("seoDescription") ?? "").trim(),
    });
    revalidatePath("/");
    revalidatePath("/admin/configuracoes");
    revalidatePath("/visite");
    redirect("/admin/configuracoes?saved=1");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl text-ink-900">Configurações do site</h1>
      {searchParams.saved && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Salvo com sucesso.
        </div>
      )}

      <form action={save} className="space-y-6 rounded-2xl bg-white p-6 ring-1 ring-cream-200/60">
        <Section title="Identidade">
          <Field label="Nome do site">
            <input
              name="siteName"
              defaultValue={settings.siteName}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <Field label="Tagline (rodapé)">
            <input
              name="tagline"
              defaultValue={settings.tagline}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
        </Section>

        <Section title="Hero da home">
          <Field label="Título grande">
            <input
              name="heroTitle"
              defaultValue={settings.heroTitle}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <Field label="Subtítulo">
            <textarea
              name="heroSubtitle"
              rows={2}
              defaultValue={settings.heroSubtitle}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <ImageUploader
            name="heroImageUrl"
            label="Imagem do hero (vertical 4:5)"
            defaultValue={settings.heroImageUrl ?? undefined}
            aspect="auto"
            folder="site"
          />
          <Field label="Sobre curto (mostrado em alguns pontos)">
            <textarea
              name="aboutShort"
              rows={2}
              defaultValue={settings.aboutShort}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
        </Section>

        <Section title="Banner promo (Tarde no Girassol)">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="promoActive" defaultChecked={settings.promoActive} />
            Mostrar banner promocional na home
          </label>
          <Field label="Título da promo">
            <input
              name="promoTitle"
              defaultValue={settings.promoTitle}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <Field label="Subtítulo da promo">
            <input
              name="promoSubtitle"
              defaultValue={settings.promoSubtitle}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
        </Section>

        <Section title="Contato">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="WhatsApp (com DDI/DDD)">
              <input
                name="whatsapp"
                defaultValue={settings.whatsapp}
                placeholder="556132421542"
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
              />
            </Field>
            <Field label="Telefone (display)">
              <input
                name="phone"
                defaultValue={settings.phone}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
              />
            </Field>
            <Field label="Email">
              <input
                name="email"
                type="email"
                defaultValue={settings.email ?? ""}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
              />
            </Field>
            <Field label="Instagram (sem @)">
              <input
                name="instagram"
                defaultValue={settings.instagram ?? ""}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
              />
            </Field>
          </div>
        </Section>

        <Section title="Localização e horários">
          <Field label="Endereço (display)">
            <input
              name="addressLine"
              defaultValue={settings.addressLine}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <Field label="URL do iframe Google Maps (opcional)">
            <input
              name="mapEmbedUrl"
              defaultValue={settings.mapEmbedUrl ?? ""}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <Field label="Horário semana">
            <input
              name="hoursWeek"
              defaultValue={settings.hoursWeek}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
          <Field label="Horário fim de semana">
            <input
              name="hoursWeekend"
              defaultValue={settings.hoursWeekend}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
        </Section>

        <Section title="SEO">
          <Field label="Descrição SEO (meta description)">
            <textarea
              name="seoDescription"
              rows={2}
              defaultValue={settings.seoDescription}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2"
            />
          </Field>
        </Section>

        <button className="rounded-full bg-sun-500 px-6 py-2 font-semibold text-white hover:bg-sun-600">
          Salvar configurações
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-lg text-ink-900">{title}</legend>
      {children}
    </fieldset>
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

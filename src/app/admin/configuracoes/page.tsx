import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminAuthError, hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { updateStore } from "@/lib/repos";
import { prisma } from "@/lib/db";
import { ImageUploader } from "@/components/ImageUploader";
import { validateCustomDomain } from "@/lib/subdomain";

export const dynamic = "force-dynamic";

type Search = { saved?: string; error?: string };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  let store;
  try {
    store = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  async function save(formData: FormData) {
    "use server";
    const store = await requireAdmin();

    // Custom domain: aceita vazio (remove) ou domínio válido
    const cdRaw = String(formData.get("custom_domain") ?? "").trim();
    let customDomain: string | null = null;
    if (cdRaw) {
      const v = validateCustomDomain(cdRaw);
      if (!v.ok) {
        redirect(`/admin/configuracoes?error=${encodeURIComponent(v.reason)}`);
      }
      customDomain = (v as { ok: true; value: string }).value;

      // Verifica que não está usado por OUTRA loja
      const existing = await prisma.store.findUnique({
        where: { customDomain },
      });
      if (existing && existing.id !== store.id) {
        redirect(
          `/admin/configuracoes?error=${encodeURIComponent("Domínio já cadastrado em outra loja")}`,
        );
      }
    }

    try {
      await updateStore(store.id, {
        custom_domain: customDomain,
        name: String(formData.get("name") ?? "").trim(),
        slogan: String(formData.get("slogan") ?? "").trim(),
        whatsapp: String(formData.get("whatsapp") ?? "").replace(/\D/g, ""),
        address: String(formData.get("address") ?? "").trim(),
        primary_color: String(formData.get("primary_color") ?? "#ffb300"),
        logo_url: String(formData.get("logo_url") || "/logo-placeholder.svg"),
        banner_url: String(formData.get("banner_url") || "/banner-placeholder.svg"),
        delivery_fee_cents: Math.round(
          parseFloat(String(formData.get("delivery_fee") ?? "0")) * 100,
        ),
        min_order_cents: Math.round(
          parseFloat(String(formData.get("min_order") ?? "0")) * 100,
        ),
        open: formData.get("open") === "on",
      });
    } catch (err: any) {
      redirect(`/admin/configuracoes?error=${encodeURIComponent(err?.message ?? String(err))}`);
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/admin");
    revalidatePath("/");
    redirect("/admin/configuracoes?saved=1");
  }

  async function changePassword(formData: FormData) {
    "use server";
    const store = await requireAdmin();
    const current = String(formData.get("current_password") ?? "");
    const next = String(formData.get("new_password") ?? "");

    if (next.length < 6) {
      redirect("/admin/configuracoes?error=Nova%20senha%20m%C3%ADn%206%20chars");
    }

    const dbStore = await prisma.store.findUnique({ where: { id: store.id } });
    if (dbStore?.adminPasswordHash) {
      if (!verifyPassword(current, dbStore.adminPasswordHash)) {
        redirect("/admin/configuracoes?error=Senha%20atual%20incorreta");
      }
    } else {
      // Loja ainda usa ADMIN_PASSWORD global; aceita a senha global como "current"
      const envPwd = process.env.ADMIN_PASSWORD ?? "";
      if (current !== envPwd) {
        redirect("/admin/configuracoes?error=Senha%20atual%20incorreta");
      }
    }

    await updateStore(store.id, { adminPasswordHash: hashPassword(next) });
    redirect("/admin/configuracoes?saved=password");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {searchParams.saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {searchParams.saved === "password"
            ? "Senha atualizada com sucesso."
            : "Configurações salvas com sucesso."}
        </div>
      )}
      {searchParams.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {searchParams.error}
        </div>
      )}

      <form action={save} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-semibold">Identidade visual</h2>

        <ImageUploader
          name="logo_url"
          label="Logo (recomendado quadrado)"
          defaultValue={store.logo_url}
          aspect="square"
          placeholder="/logo-placeholder.svg"
        />

        <ImageUploader
          name="banner_url"
          label="Banner (proporção larga)"
          defaultValue={store.banner_url}
          aspect="wide"
          placeholder="/banner-placeholder.svg"
        />

        <Field label="Cor primária">
          <input
            name="primary_color"
            type="color"
            defaultValue={store.primary_color}
            className="h-10 w-32 rounded-lg border border-black/10"
          />
        </Field>

        <hr className="my-2" />
        <h2 className="text-lg font-semibold">Domínio próprio</h2>
        <Field
          label="Custom domain (opcional)"
          hint="ex: minhaloja.com.br — deixe vazio pra usar só o subdomínio"
        >
          <input
            name="custom_domain"
            defaultValue={store.custom_domain ?? ""}
            placeholder="minhaloja.com.br"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        {store.custom_domain && (
          <div className="rounded-lg bg-neutral-50 p-3 text-xs text-black/70">
            <strong>Para ativar:</strong> aponte um registro <code>CNAME</code> ou{" "}
            <code>A</code> de <code>{store.custom_domain}</code> pra esta plataforma
            no seu provedor DNS. Após o DNS propagar, sua loja ficará acessível em{" "}
            <code>https://{store.custom_domain}</code>.
          </div>
        )}

        <hr className="my-2" />
        <h2 className="text-lg font-semibold">Dados da loja</h2>

        <Field label="Nome">
          <input
            name="name"
            required
            defaultValue={store.name}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <Field label="Slogan">
          <input
            name="slogan"
            required
            defaultValue={store.slogan}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <Field label="WhatsApp" hint="formato 5561999999999">
          <input
            name="whatsapp"
            required
            defaultValue={store.whatsapp}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <Field label="Endereço">
          <input
            name="address"
            required
            defaultValue={store.address}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Frete fixo (R$)">
            <input
              name="delivery_fee"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={(store.delivery_fee_cents / 100).toFixed(2)}
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </Field>
          <Field label="Pedido mínimo (R$)">
            <input
              name="min_order"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={(store.min_order_cents / 100).toFixed(2)}
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="open" defaultChecked={store.open} />
          Loja aberta (recebendo pedidos)
        </label>

        <button className="rounded-lg bg-black px-5 py-2 font-semibold text-white hover:bg-black/85">
          Salvar configurações
        </button>
      </form>

      <form
        action={changePassword}
        className="space-y-3 rounded-2xl border border-black/5 bg-white p-6"
      >
        <h2 className="text-lg font-semibold">Trocar senha do admin</h2>
        <Field label="Senha atual">
          <input
            name="current_password"
            type="password"
            required
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <Field label="Nova senha" hint="mínimo 6 caracteres">
          <input
            name="new_password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>
        <button className="rounded-lg bg-black px-5 py-2 font-semibold text-white hover:bg-black/85">
          Trocar senha
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-medium text-black/70">{label}</span>
        {hint && <span className="ml-auto text-xs text-black/40">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

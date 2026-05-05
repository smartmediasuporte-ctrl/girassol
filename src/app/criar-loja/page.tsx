import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validateSubdomain } from "@/lib/subdomain";

export const dynamic = "force-dynamic";

type Search = {
  error?: string;
  ok?: string;
  subdomain?: string;
  name?: string;
  whatsapp?: string;
};

async function createStore(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const address = String(formData.get("address") ?? "").trim();
  const subdomainRaw = String(formData.get("subdomain") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const primaryColor = String(formData.get("primary_color") ?? "#ffb300");
  const deliveryFee = parseFloat(String(formData.get("delivery_fee") ?? "0"));
  const minOrder = parseFloat(String(formData.get("min_order") ?? "0"));

  // Mantém form preenchido em caso de erro
  const params = new URLSearchParams();
  if (subdomainRaw) params.set("subdomain", subdomainRaw);
  if (name) params.set("name", name);
  if (whatsapp) params.set("whatsapp", whatsapp);

  const fail = (msg: string) => {
    params.set("error", msg);
    return redirect(`/criar-loja?${params.toString()}`);
  };

  if (!name || name.length < 2) fail("Nome da loja inválido");
  if (!slogan) fail("Descreva sua loja em uma frase");
  if (!whatsapp || whatsapp.length < 10)
    fail("WhatsApp inválido (use formato 5561999999999)");
  if (!address) fail("Endereço obrigatório");
  if (!password || password.length < 6) fail("Senha mínima de 6 caracteres");

  const sub = validateSubdomain(subdomainRaw);
  if (!sub.ok) fail(sub.reason);
  const subdomain = (sub as { ok: true; value: string }).value;

  const existing = await prisma.store.findUnique({ where: { subdomain } });
  if (existing) fail(`Subdomínio "${subdomain}" já está em uso`);

  await prisma.store.create({
    data: {
      subdomain,
      name,
      slogan,
      whatsapp,
      address,
      primaryColor,
      logoUrl: "/logo-placeholder.svg",
      bannerUrl: "/banner-placeholder.svg",
      deliveryFeeCents: Math.round((isFinite(deliveryFee) ? deliveryFee : 0) * 100),
      minOrderCents: Math.round((isFinite(minOrder) ? minOrder : 0) * 100),
      open: true,
      adminPasswordHash: hashPassword(password),
    },
  });

  redirect(`/criar-loja?ok=${subdomain}`);
}

export default function CreateStorePage({ searchParams }: { searchParams: Search }) {
  const h = headers();
  const host = (h.get("host") ?? "").split(":")[0];
  const port = (h.get("host") ?? "").split(":")[1];

  // Domínio raiz pra montar URL da loja recém-criada
  const root =
    host === "localhost" || host?.endsWith(".localhost")
      ? "localhost"
      : host?.split(".").slice(-2).join(".") ?? "girassol.com.br";

  if (searchParams.ok) {
    // Em domínio raiz da plataforma: usa subdomínio.
    // Em URL Vercel ou outro host neutro: usa override por query.
    const isNeutral = host === "localhost" || host?.endsWith(".vercel.app") || !host;
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    const portStr = port && port !== "80" && port !== "443" ? `:${port}` : "";

    const subdomainUrl = `${proto}://${searchParams.ok}.${root}${portStr}`;
    const queryUrl = `${proto}://${host}${portStr ? "" : ""}/?_tenant=${searchParams.ok}`;
    const adminUrl = isNeutral
      ? `/admin/login?_tenant=${searchParams.ok}`
      : `${subdomainUrl}/admin/login`;
    const publicUrl = isNeutral ? queryUrl : subdomainUrl;

    return (
      <div className="mx-auto max-w-md rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-green-800">Loja criada! 🎉</h1>
        <p className="mt-2 text-sm text-green-700">
          Sua loja <strong>{searchParams.ok}</strong> está no ar.
        </p>
        <a
          href={adminUrl}
          className="mt-4 inline-block rounded-lg bg-black px-5 py-2 font-semibold text-white"
        >
          Entrar no painel admin
        </a>
        <p className="mt-3 text-xs text-green-700/80">
          URL pública: <code>{publicUrl}</code>
        </p>
        {isNeutral && (
          <p className="mt-2 text-xs text-green-700/70">
            (sem domínio próprio; usando override <code>?_tenant=</code> — pra subdomínio
            real, configure DNS apontando <code>*.seudominio.com</code> pra esta plataforma)
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Crie sua loja</h1>
      <p className="mt-1 text-sm text-black/60">
        Em 30 segundos você tem um storefront com PIX, painel admin e link no WhatsApp.
      </p>

      {searchParams.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {searchParams.error}
        </div>
      )}

      <form
        action={createStore}
        className="mt-6 space-y-4 rounded-2xl border border-black/5 bg-white p-6"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome da loja" required>
            <input
              name="name"
              required
              defaultValue={searchParams.name}
              placeholder="Girassol Empório"
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </Field>
          <Field label="Subdomínio" required hint="3-30 chars, a-z 0-9 -">
            <div className="flex items-center rounded-lg border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-500">
              <input
                name="subdomain"
                required
                pattern="[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?"
                defaultValue={searchParams.subdomain}
                placeholder="minhaloja"
                className="flex-1 outline-none"
              />
              <span className="text-sm text-black/40">.{host || "girassol.com.br"}</span>
            </div>
          </Field>
        </div>

        <Field label="Slogan / descrição curta" required>
          <input
            name="slogan"
            required
            placeholder="Hortifruti & mercearia natural — Brasília"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="WhatsApp" required hint="formato 5561999999999">
            <input
              name="whatsapp"
              required
              defaultValue={searchParams.whatsapp}
              placeholder="5561999999999"
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </Field>
          <Field label="Cor primária">
            <input
              name="primary_color"
              type="color"
              defaultValue="#ffb300"
              className="h-10 w-full rounded-lg border border-black/10"
            />
          </Field>
        </div>

        <Field label="Endereço da loja" required>
          <input
            name="address"
            required
            placeholder="Rua, número, bairro, cidade/UF"
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
              defaultValue="9.90"
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </Field>
          <Field label="Pedido mínimo (R$)">
            <input
              name="min_order"
              type="number"
              step="0.01"
              min="0"
              defaultValue="50.00"
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </Field>
        </div>

        <Field label="Senha do painel admin" required hint="mínimo 6 caracteres">
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </Field>

        <button className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-black/85">
          Criar loja
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-medium text-black/70">{label}</span>
        {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-auto text-xs text-black/40">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

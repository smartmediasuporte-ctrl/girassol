import { redirect } from "next/navigation";
import { attemptLogin, tenantStoreFromHeaders } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function doLogin(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const store = await attemptLogin(password);
  if (!store) {
    redirect("/admin/login?error=invalid");
  }
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const store = await tenantStoreFromHeaders();
  if (cookies().get("admin_session")) redirect("/admin");

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-black/10 bg-white p-6">
      <h1 className="text-xl font-bold">Login admin</h1>
      <p className="mt-1 text-sm text-black/60">
        {store ? `Loja: ${store.name}` : "Loja não identificada"}
      </p>
      <form action={doLogin} className="mt-4 space-y-3">
        <input
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Senha"
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
        {searchParams.error === "invalid" && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Senha inválida.
          </div>
        )}
        <button className="w-full rounded-lg bg-black px-4 py-2 font-semibold text-white">
          Entrar
        </button>
      </form>
      <p className="mt-3 text-xs text-black/50">
        Senha padrão (dev): valor de <code>ADMIN_PASSWORD</code> em <code>.env.local</code>.
      </p>
    </div>
  );
}

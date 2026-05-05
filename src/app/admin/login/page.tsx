import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { attemptLogin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function doLogin(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  if (!attemptLogin(password)) redirect("/admin/login?error=invalid");
  redirect("/admin");
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  if (cookies().get("admin_session")) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-cream-200/60">
      <h1 className="font-display text-2xl text-ink-900">Login admin</h1>
      <p className="mt-1 text-sm text-ink-500">
        Acesso restrito ao time do Girassol.
      </p>
      <form action={doLogin} className="mt-4 space-y-3">
        <input
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Senha"
          className="w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2"
        />
        {searchParams.error === "invalid" && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Senha inválida.
          </div>
        )}
        <button className="w-full rounded-lg bg-sun-500 px-4 py-2 font-semibold text-white hover:bg-sun-600">
          Entrar
        </button>
      </form>
    </div>
  );
}

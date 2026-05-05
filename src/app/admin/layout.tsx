import Link from "next/link";
import { headers } from "next/headers";
import { tenantStoreFromHeaders } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  headers(); // força dinâmico
  const store = await tenantStoreFromHeaders();
  const isAuthed = cookies().get("admin_session") != null;

  return (
    <div className="min-h-[60vh]">
      <div className="-mx-4 mb-6 border-b border-black/10 bg-white px-4 py-3 text-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <span className="font-semibold">Admin · {store?.name ?? "—"}</span>
          {isAuthed && (
            <>
              <Link href="/admin" className="text-black/70 hover:underline">
                Dashboard
              </Link>
              <Link href="/admin/pedidos" className="text-black/70 hover:underline">
                Pedidos
              </Link>
              <Link href="/admin/produtos" className="text-black/70 hover:underline">
                Produtos
              </Link>
              <Link href="/admin/configuracoes" className="text-black/70 hover:underline">
                Configurações
              </Link>
              <form action="/admin/logout" method="post" className="ml-auto">
                <button className="text-red-600 hover:underline">Sair</button>
              </form>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

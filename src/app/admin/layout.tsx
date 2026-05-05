import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthed = cookies().get("admin_session") != null;
  return (
    <div className="min-h-[60vh]">
      <div className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
          <Link href="/admin" className="font-display text-base text-ink-900">
            Admin · Girassol
          </Link>
          {isAuthed && (
            <>
              <Link href="/admin" className="text-ink-700 hover:text-sun-600">
                Início
              </Link>
              <Link href="/admin/cardapio" className="text-ink-700 hover:text-sun-600">
                Cardápio
              </Link>
              <Link href="/admin/categorias" className="text-ink-700 hover:text-sun-600">
                Categorias
              </Link>
              <Link href="/admin/posts" className="text-ink-700 hover:text-sun-600">
                Posts
              </Link>
              <Link href="/admin/configuracoes" className="text-ink-700 hover:text-sun-600">
                Configurações
              </Link>
              <form action="/admin/logout" method="post" className="ml-auto">
                <button className="text-red-600 hover:underline">Sair</button>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

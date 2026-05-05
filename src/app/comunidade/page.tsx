import Link from "next/link";
import { listPosts } from "@/lib/repos";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comunidade",
  description:
    "Receitas, dicas e histórias do Restaurante Girassol — alimentação saudável e consciente.",
};

export default async function ComunidadePage() {
  const posts = await listPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-sun-600">Comunidade</p>
        <h1 className="mt-2 font-display text-5xl text-ink-900">No nosso jardim</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-700">
          Receitas, dicas, eventos e histórias de quem cultiva uma vida mais saudável.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/comunidade/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream-200/60 transition hover:shadow-md"
          >
            {p.coverUrl && (
              <div className="aspect-[16/10] overflow-hidden bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.coverUrl}
                  alt={p.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                <span className="text-sun-600">{p.category}</span>
                <span className="text-ink-500">{formatDate(p.publishedAt)}</span>
              </div>
              <h2 className="font-display text-xl text-ink-900">{p.title}</h2>
              <p className="line-clamp-3 text-sm text-ink-500">{p.excerpt}</p>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-cream-300 p-12 text-center text-ink-500">
            Em breve, o primeiro post.
          </div>
        )}
      </div>
    </div>
  );
}

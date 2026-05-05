import Link from "next/link";
import { notFound } from "next/navigation";
import { findPostBySlug, listPosts } from "@/lib/repos";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await findPostBySlug(params.slug);
  if (!post) return { title: "Post não encontrado" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await findPostBySlug(params.slug);
  if (!post || !post.published) notFound();

  const others = (await listPosts({ limit: 4 })).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/comunidade" className="text-sm text-leaf-700 hover:underline">
        ← voltar
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          <span className="text-sun-600">{post.category}</span>
          <span className="text-ink-500">{formatDate(post.publishedAt)}</span>
        </div>
        <h1 className="mt-3 font-display text-5xl leading-tight text-ink-900">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-ink-700">{post.excerpt}</p>
      </header>

      {post.coverUrl && (
        <div className="mt-8 overflow-hidden rounded-3xl bg-cream-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverUrl} alt={post.title} className="w-full object-cover" />
        </div>
      )}

      <div
        className="prose-girassol mt-10"
        dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
      />

      {others.length > 0 && (
        <section className="mt-16 border-t border-cream-200 pt-10">
          <h2 className="font-display text-2xl text-ink-900">Continue lendo</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <Link
                key={o.id}
                href={`/comunidade/${o.slug}`}
                className="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-cream-200/60 hover:shadow-md"
              >
                <div className="text-[10px] uppercase tracking-widest text-sun-600">
                  {o.category}
                </div>
                <div className="mt-1 font-display text-base text-ink-900">{o.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

// Renderer simples: aceita HTML básico OU markdown leve (parágrafo por linha em branco).
function renderContent(content: string): string {
  // Se já tem tags HTML, retorna direto
  if (/<\w+/.test(content)) return content;
  return content
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

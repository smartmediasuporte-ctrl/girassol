import Link from "next/link";
import { getSettings } from "@/lib/settings";
import {
  listGalleryImages,
  listHighlightedItems,
  listPosts,
  listTestimonials,
} from "@/lib/repos";
import { MenuItemCard } from "@/components/MenuItemCard";
import { whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, highlights, testimonials, gallery, posts] = await Promise.all([
    getSettings(),
    listHighlightedItems(8),
    listTestimonials(),
    listGalleryImages(),
    listPosts({ limit: 3 }),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200" />
        <div className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-sun-200/40 blur-3xl" />
        <div className="absolute -left-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-leaf-200/40 blur-3xl" />

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-sun-600">
              Asa Sul · Brasília
            </p>
            <h1 className="font-display text-5xl leading-tight text-ink-900 md:text-6xl">
              {settings.heroTitle}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-700">
              {settings.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cardapio"
                className="rounded-full bg-sun-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sun-500/30 transition hover:bg-sun-600"
              >
                Ver cardápio
              </Link>
              <Link
                href="/visite"
                className="rounded-full border border-leaf-500 bg-transparent px-6 py-3 text-sm font-semibold text-leaf-700 transition hover:bg-leaf-500 hover:text-white"
              >
                Como visitar
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-ink-500">
              <Stat icon="📍" label="Asa Sul, DF" />
              <Stat icon="🌱" label="Vegetariano" />
              <Stat icon="✨" label="Décadas de tradição" />
            </div>
          </div>

          {/* Imagem decorativa do hero */}
          <div className="relative">
            <div className="absolute inset-0 rotate-3 rounded-[2.5rem] bg-leaf-300/30" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-cream-200 shadow-xl ring-1 ring-cream-300/60">
              {settings.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.heroImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-7xl">🌻</div>
              )}
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-cream-200">
              <div className="font-script text-2xl text-sun-500">há décadas</div>
              <div className="text-xs uppercase tracking-widest text-ink-500">
                cultivando saúde
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO da tarde */}
      {settings.promoActive && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="overflow-hidden rounded-3xl bg-leaf-700 p-8 text-cream-50 md:p-12">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex-1 min-w-[260px]">
                <p className="text-xs uppercase tracking-[0.25em] text-sun-300">
                  Verão Saudável
                </p>
                <h2 className="mt-2 font-display text-4xl">{settings.promoTitle}</h2>
                <p className="mt-2 max-w-xl text-cream-200/90">
                  {settings.promoSubtitle}
                </p>
              </div>
              <Link
                href="/cardapio"
                className="rounded-full bg-sun-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sun-500/30 hover:bg-sun-400"
              >
                Ver opções da tarde
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* PILARES */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Pillar
            emoji="🌱"
            title="Alimentação viva"
            text="Pratos preparados com ingredientes frescos, integrais e ricos em nutrientes — seguindo a tradição que herdamos."
          />
          <Pillar
            emoji="🍂"
            title="Tradição que renova"
            text="Décadas servindo Brasília com o mesmo cuidado artesanal, agora também no jeito da sua geração."
          />
          <Pillar
            emoji="🤝"
            title="Comunidade"
            text="Mais que um restaurante: um lugar de encontro de quem busca leveza, sabor e propósito."
          />
        </div>
      </section>

      {/* DESTAQUES DO CARDÁPIO */}
      {highlights.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-sun-600">Cardápio</p>
              <h2 className="mt-1 font-display text-4xl text-ink-900">Destaques</h2>
            </div>
            <Link
              href="/cardapio"
              className="text-sm font-semibold text-leaf-700 hover:underline"
            >
              ver tudo →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {highlights.map((it) => (
              <MenuItemCard key={it.id} item={it} dense />
            ))}
          </div>
        </section>
      )}

      {/* GALERIA */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-sun-600">Galeria</p>
            <h2 className="mt-1 font-display text-4xl text-ink-900">A casa por dentro</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, 8).map((img) => (
              <div
                key={img.id}
                className="aspect-square overflow-hidden rounded-2xl bg-cream-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TESTEMUNHOS */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-sun-600">
              O que dizem
            </p>
            <h2 className="mt-1 font-display text-4xl text-ink-900">
              Quem já viveu o Girassol
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure
                key={t.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-cream-200/60"
              >
                <div className="mb-2 text-sun-500">
                  {"★".repeat(t.rating)}
                  <span className="text-cream-300">{"★".repeat(5 - t.rating)}</span>
                </div>
                <blockquote className="font-display text-lg italic leading-relaxed text-ink-800">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-ink-500">— {t.author}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* COMUNIDADE / POSTS */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-sun-600">Comunidade</p>
              <h2 className="mt-1 font-display text-4xl text-ink-900">No nosso jardim</h2>
            </div>
            <Link
              href="/comunidade"
              className="text-sm font-semibold text-leaf-700 hover:underline"
            >
              todos os posts →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
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
                  <p className="text-[10px] uppercase tracking-widest text-sun-600">
                    {p.category}
                  </p>
                  <h3 className="font-display text-xl text-ink-900">{p.title}</h3>
                  <p className="line-clamp-3 text-sm text-ink-500">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-sun-500 p-10 text-center text-white">
          <h2 className="font-display text-4xl">Vem viver o Girassol</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/90">
            Estamos a um passeio na Asa Sul. Reserve sua mesa, peça pelo WhatsApp ou venha
            sem hora marcada.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink(settings.whatsapp, "Olá! Quero fazer um pedido / reservar.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-sun-700 shadow hover:bg-cream-50"
            >
              💬 Falar no WhatsApp
            </a>
            <Link
              href="/visite"
              className="rounded-full bg-leaf-700 px-6 py-3 text-sm font-semibold text-white hover:bg-leaf-800"
            >
              Ver localização
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Pillar({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-cream-200/60">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-3 font-display text-xl text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Nossa história",
  description:
    "A história do Restaurante Girassol — décadas de tradição em alimentação saudável em Brasília.",
};

export default function HistoriaPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-sun-600">A casa</p>
        <h1 className="mt-2 font-display text-5xl text-ink-900">Nossa história</h1>
        <p className="mt-3 text-ink-700">
          Há décadas cultivando saúde, sabor e propósito em Brasília.
        </p>
      </header>

      <div className="prose-girassol mt-12">
        <p className="font-display text-2xl italic leading-relaxed text-ink-800">
          “Mais que um restaurante, somos um ponto de encontro de quem busca uma vida
          mais leve, natural e consciente.”
        </p>

        <h2>Onde tudo começou</h2>
        <p>
          O Girassol nasceu de uma convicção simples: comida de verdade transforma
          pessoas. Há décadas servimos a Asa Sul com pratos preparados artesanalmente,
          inspirados na filosofia da alimentação viva — leve, integral e respeitosa com
          o ciclo da terra.
        </p>
        <p>
          Inspirados em obras como{" "}
          <em>Alimentação Viva e Ecológica</em>, de Ros&apos;Ellis Moraes, construímos
          uma cozinha que aposta em ingredientes frescos, integrais e selecionados —
          e em uma forma de servir que valoriza tanto o prato quanto a pessoa que o
          recebe.
        </p>

        <h2>Tradição que renova</h2>
        <p>
          Atravessamos gerações. Quem chegou criança hoje volta com filhos. Quem
          conheceu pelos pais agora descobre por conta própria. O cardápio acompanhou
          esse movimento — manteve clássicos amados e ganhou novos sabores: açaí,
          sucos verdes, lanches naturais, bowls e bebidas funcionais que conversam com
          quem busca leveza no dia a dia.
        </p>

        <blockquote>
          Tradição, pra nós, não é repetir o passado — é manter vivo o que importa.
        </blockquote>

        <h2>Nosso compromisso</h2>
        <ul>
          <li>Ingredientes frescos, integrais e de origem consciente.</li>
          <li>Pratos vegetarianos, com opções veganas, sem glúten e sem lactose.</li>
          <li>Atendimento acolhedor — somos uma casa antes de sermos um restaurante.</li>
          <li>
            Sustentabilidade na prática: embalagens reutilizáveis, redução de
            desperdício, parceria com produtores locais.
          </li>
        </ul>

        <h2>O Girassol é seu</h2>
        <p>
          Quem entra no Girassol não vem só pra comer — vem pra desacelerar, encontrar
          gente, conversar com quem está atrás do balcão. Esse ritual é o que nos move
          desde sempre. Te esperamos pra um almoço, um café da tarde, ou só uma
          parada no meio da semana.
        </p>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-3">
        <Link
          href="/cardapio"
          className="rounded-full bg-sun-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-sun-600"
        >
          Ver cardápio
        </Link>
        <Link
          href="/visite"
          className="rounded-full border border-leaf-500 px-6 py-3 text-sm font-semibold text-leaf-700 hover:bg-leaf-500 hover:text-white"
        >
          Como visitar
        </Link>
      </div>
    </article>
  );
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Settings (singleton)
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Restaurante Girassol",
      tagline: "Alimentação saudável há décadas em Brasília",
      whatsapp: "556132421542",
      phone: "(61) 3242-1542",
      instagram: "restaurantegirassolbsb",
      addressLine: "Asa Sul, Brasília — DF",
      hoursWeek: "Segunda a Sexta: 11h–15h e 18h–22h",
      hoursWeekend: "Sábado e Domingo: 11h–16h",
      heroTitle: "Há décadas cultivando saúde em Brasília",
      heroSubtitle:
        "Alimentação viva, natural e vegetariana. A tradição que nasce da terra.",
      aboutShort:
        "Mais que um restaurante, somos um ponto de encontro de quem busca uma vida mais leve, natural e consciente.",
      promoActive: true,
      promoTitle: "Tarde no Girassol",
      promoSubtitle:
        "Açaí, sucos e lanches naturais com 15% off entre 14h e 17h",
      seoDescription:
        "Restaurante vegetariano tradicional em Brasília. Comida natural, sucos, açaí, lanches saudáveis e ambiente acolhedor há décadas na Asa Sul.",
    },
  });

  // Categorias
  const cats = [
    { slug: "almoco", name: "Almoço & Pratos Principais", description: "Self-service e pratos do dia", sortOrder: 1 },
    { slug: "lanches", name: "Lanches Naturais", description: "Sanduíches, wraps e tortas", sortOrder: 2 },
    { slug: "sucos", name: "Sucos & Vitaminas", description: "Frescos, da fruta para o copo", sortOrder: 3 },
    { slug: "acai-bowls", name: "Açaí & Bowls", description: "Energia e leveza para a tarde", sortOrder: 4 },
    { slug: "bebidas-quentes", name: "Bebidas Quentes", description: "Cafés especiais, golden milk e infusões", sortOrder: 5 },
    { slug: "sobremesas", name: "Sobremesas", description: "Doces naturais e em pote", sortOrder: 6 },
  ];
  const catRecords: Record<string, string> = {};
  for (const c of cats) {
    const r = await prisma.menuCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catRecords[c.slug] = r.id;
  }

  // Itens do cardápio (placeholders representativos — admin edita depois)
  const items = [
    // ALMOÇO
    {
      slug: "self-service-vegetariano",
      categoryId: catRecords["almoco"],
      name: "Self-service vegetariano",
      description: "Buffet livre com pratos quentes, saladas frescas, grãos integrais e proteínas vegetais. Cobrança por kg.",
      priceCents: 8990,
      tags: "vegetarian",
      highlight: true,
      sortOrder: 1,
    },
    {
      slug: "feijoada-vegana",
      categoryId: catRecords["almoco"],
      name: "Feijoada vegana",
      description: "Feijão preto, cogumelos, tofu defumado, arroz integral, couve e farofa. Servido aos sábados.",
      priceCents: 4990,
      tags: "vegan,vegetarian",
      highlight: false,
      sortOrder: 2,
    },
    {
      slug: "bowl-buddha",
      categoryId: catRecords["almoco"],
      name: "Buddha bowl",
      description: "Quinoa, grão de bico, abóbora, folhas, beterraba, abacate e molho de tahine.",
      priceCents: 4490,
      tags: "vegan,vegetarian,gluten_free",
      highlight: true,
      sortOrder: 3,
    },

    // LANCHES
    {
      slug: "sanduiche-girassol",
      categoryId: catRecords["lanches"],
      name: "Sanduíche Girassol",
      description: "Pão integral, pasta de grão de bico, hambúrguer de lentilha, tomate, alface e brotos.",
      priceCents: 3290,
      tags: "vegetarian",
      highlight: true,
      sortOrder: 1,
    },
    {
      slug: "wrap-de-cogumelos",
      categoryId: catRecords["lanches"],
      name: "Wrap de cogumelos",
      description: "Tortilla integral, mix de cogumelos salteados, espinafre e maionese de castanha.",
      priceCents: 3490,
      tags: "vegan,vegetarian",
      highlight: false,
      sortOrder: 2,
    },

    // SUCOS
    {
      slug: "suco-verde-energia",
      categoryId: catRecords["sucos"],
      name: "Suco Verde Energia",
      description: "Couve, maçã, gengibre, limão e hortelã. 400ml.",
      priceCents: 1890,
      tags: "vegan,vegetarian,gluten_free,sugar_free,raw",
      highlight: true,
      sortOrder: 1,
    },
    {
      slug: "vitamina-frutas-vermelhas",
      categoryId: catRecords["sucos"],
      name: "Vitamina de frutas vermelhas",
      description: "Morango, mirtilo, framboesa e leite vegetal. Sem açúcar adicionado.",
      priceCents: 2290,
      tags: "vegan,vegetarian,sugar_free",
      highlight: false,
      sortOrder: 2,
    },
    {
      slug: "agua-de-coco-natural",
      categoryId: catRecords["sucos"],
      name: "Água de coco natural",
      description: "Direto do coco, geladinha. 300ml.",
      priceCents: 1290,
      tags: "vegan,vegetarian,gluten_free,sugar_free,raw",
      highlight: false,
      sortOrder: 3,
    },

    // AÇAÍ & BOWLS
    {
      slug: "acai-tradicional",
      categoryId: catRecords["acai-bowls"],
      name: "Açaí tradicional 300ml",
      description: "Polpa pura batida com banana. Acompanha granola e frutas frescas.",
      priceCents: 2490,
      tags: "vegan,vegetarian,gluten_free",
      highlight: true,
      sortOrder: 1,
    },
    {
      slug: "smoothie-bowl-frutas",
      categoryId: catRecords["acai-bowls"],
      name: "Smoothie bowl de frutas",
      description: "Banana, manga, granola, coco, mirtilo e mel. Cremoso e refrescante.",
      priceCents: 2890,
      tags: "vegetarian",
      highlight: false,
      sortOrder: 2,
    },

    // BEBIDAS QUENTES
    {
      slug: "golden-milk",
      categoryId: catRecords["bebidas-quentes"],
      name: "Golden milk",
      description: "Leite vegetal, cúrcuma, gengibre, canela e pimenta. Anti-inflamatório natural.",
      priceCents: 1690,
      tags: "vegan,vegetarian,gluten_free,sugar_free",
      highlight: true,
      sortOrder: 1,
    },
    {
      slug: "cafe-especial-coado",
      categoryId: catRecords["bebidas-quentes"],
      name: "Café especial coado",
      description: "Grão selecionado, torra média. Servido na xícara.",
      priceCents: 990,
      tags: "vegan,vegetarian",
      highlight: false,
      sortOrder: 2,
    },

    // SOBREMESAS
    {
      slug: "parfait-de-iogurte",
      categoryId: catRecords["sobremesas"],
      name: "Parfait de iogurte",
      description: "Iogurte natural, granola caseira e frutas da estação. Em pote reutilizável.",
      priceCents: 1890,
      tags: "vegetarian",
      highlight: true,
      sortOrder: 1,
    },
    {
      slug: "brownie-vegano",
      categoryId: catRecords["sobremesas"],
      name: "Brownie vegano",
      description: "Cacau intenso, sem leite, sem ovos. Adoçado com tâmaras.",
      priceCents: 1290,
      tags: "vegan,vegetarian,sugar_free",
      highlight: false,
      sortOrder: 2,
    },
  ];
  for (const it of items) {
    await prisma.menuItem.upsert({
      where: { slug: it.slug },
      update: {},
      create: it,
    });
  }

  // Posts iniciais
  const posts = [
    {
      slug: "alimentacao-viva-no-dia-a-dia",
      title: "Alimentação viva no dia a dia",
      excerpt: "Como pequenas escolhas no prato transformam o corpo e a energia ao longo da semana.",
      category: "blog",
      content: `A alimentação viva é mais do que uma dieta — é um ritmo. Quando você inclui no prato sementes germinadas, folhas frescas, frutas da estação e alimentos integrais, você está alinhando o corpo com o ciclo natural da terra.

No Girassol, a gente acredita que comer bem não precisa ser complicado. Algumas substituições simples — pão integral no lugar do branco, tahine no lugar da maionese tradicional, suco verde da manhã — já fazem diferença palpável em poucos dias.

Comece pelo café da manhã. É a refeição mais fácil de transformar.`,
      published: true,
    },
    {
      slug: "tarde-no-girassol-acai-suco-lanche",
      title: "Tarde no Girassol: 15% off em açaí, sucos e lanches",
      excerpt: "Das 14h às 17h, a casa abre espaço pra quem precisa de uma pausa leve no meio do dia.",
      category: "evento",
      content: `Lançamos a campanha "Tarde no Girassol" pra você descobrir que o restaurante não é só almoço. Entre 14h e 17h, você encontra:

- Açaí 300ml com 15% off
- Sucos verdes e vitaminas com desconto
- Lanches naturais (sanduíches, wraps)
- Bebidas funcionais (golden milk, chás especiais)

Aproveita pra trabalhar, ler, conversar — ou simplesmente desacelerar. A casa é sua.`,
      published: true,
    },
    {
      slug: "receita-suco-verde-energia",
      title: "Receita: nosso Suco Verde Energia",
      excerpt: "A receita do suco mais pedido da casa, pra você fazer em casa sempre que precisar de um boost natural.",
      category: "receita",
      content: `Ingredientes:
- 2 folhas de couve manteiga
- 1 maçã verde
- 1 cm de gengibre
- Suco de 1/2 limão
- 4 folhas de hortelã
- 200ml de água gelada

Modo de preparo: bate tudo no liquidificador e coa. Beba imediatamente — o frescor é parte do efeito.

Por que funciona: a couve traz ferro e clorofila, o gengibre acelera a digestão, o limão alcaliniza. É energia limpa, não estimulante.`,
      published: true,
    },
  ];
  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // Testemunhos placeholder
  const testimonials = [
    {
      author: "Marina C.",
      text: "Frequento o Girassol há mais de dez anos. É onde levo família, amigos e onde sempre volto sozinha. Comida que faz bem, gente que cuida.",
      rating: 5,
      sortOrder: 1,
    },
    {
      author: "Pedro H.",
      text: "Descobri o Girassol no início da pandemia, querendo comer melhor. Nunca mais saí. O suco verde da casa virou ritual da minha semana.",
      rating: 5,
      sortOrder: 2,
    },
    {
      author: "Aline R.",
      text: "Sou vegana há 5 anos e o cardápio aqui é dos mais completos de Brasília. Atendimento acolhedor e ambiente lindo.",
      rating: 5,
      sortOrder: 3,
    },
  ];
  // Limpa testemunhos antigos pra não duplicar
  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

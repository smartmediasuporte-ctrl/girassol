import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Loja: Girassol Empório
  const girassol = await prisma.store.upsert({
    where: { subdomain: "girassolemporio" },
    update: {},
    create: {
      subdomain: "girassolemporio",
      name: "Girassol Empório",
      slogan: "Hortifruti & mercearia natural — entrega em Brasília",
      logoUrl: "/logo-placeholder.svg",
      bannerUrl: "/banner-placeholder.svg",
      primaryColor: "#ffb300",
      whatsapp: "5561999999999",
      address: "SCLN 404, Bloco B, Asa Norte — Brasília/DF",
      deliveryFeeCents: 990,
      minOrderCents: 5000,
      open: true,
    },
  });

  const girassolProducts = [
    {
      slug: "banana-prata-kg",
      name: "Banana Prata (kg)",
      description: "Banana prata orgânica, fresca, do produtor local.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 799,
      listPriceCents: 999,
      category: "Hortifruti",
      unit: "kg",
      stock: 50,
    },
    {
      slug: "tomate-italiano-kg",
      name: "Tomate Italiano (kg)",
      description: "Tomate italiano selecionado, ideal pra molhos.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 1290,
      listPriceCents: null,
      category: "Hortifruti",
      unit: "kg",
      stock: 30,
    },
    {
      slug: "ovos-caipira-30un",
      name: "Ovos Caipira (30 un)",
      description: "Bandeja com 30 ovos caipira, granja local.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 3490,
      listPriceCents: 3990,
      category: "Mercearia",
      unit: "bandeja",
      stock: 12,
    },
    {
      slug: "arroz-integral-1kg",
      name: "Arroz Integral 1kg",
      description: "Arroz integral selecionado, sem agrotóxicos.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 1890,
      listPriceCents: null,
      category: "Mercearia",
      unit: "pacote",
      stock: 40,
    },
    {
      slug: "leite-integral-1l",
      name: "Leite Integral 1L",
      description: "Leite integral fresco, embalagem retornável.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 690,
      listPriceCents: null,
      category: "Laticínios",
      unit: "litro",
      stock: 60,
    },
    {
      slug: "pao-frances-kg",
      name: "Pão Francês (kg)",
      description: "Pão francês fresco, assado no dia.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 1890,
      listPriceCents: null,
      category: "Padaria",
      unit: "kg",
      stock: 25,
    },
  ];
  for (const p of girassolProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: girassol.id, slug: p.slug } },
      update: {},
      create: { ...p, storeId: girassol.id },
    });
  }

  // Loja Demo
  const demo = await prisma.store.upsert({
    where: { subdomain: "demo" },
    update: {},
    create: {
      subdomain: "demo",
      name: "Loja Demo",
      slogan: "Storefront demo multi-tenant",
      logoUrl: "/logo-placeholder.svg",
      bannerUrl: "/banner-placeholder.svg",
      primaryColor: "#0ea5e9",
      whatsapp: "5561988887777",
      address: "Endereço da loja demo",
      deliveryFeeCents: 500,
      minOrderCents: 2000,
      open: true,
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: demo.id, slug: "produto-demo-1" } },
    update: {},
    create: {
      storeId: demo.id,
      slug: "produto-demo-1",
      name: "Produto Demo 1",
      description: "Descrição do produto demo.",
      imageUrl: "/product-placeholder.svg",
      priceCents: 1000,
      listPriceCents: null,
      category: "Demo",
      unit: "un",
      stock: 100,
    },
  });

  console.log("Seed concluído:", { girassol: girassol.id, demo: demo.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

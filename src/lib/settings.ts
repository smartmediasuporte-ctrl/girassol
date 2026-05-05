import { prisma } from "./db";

const SINGLETON_ID = "singleton";

// Default fallback caso DB não tenha sido seedado ainda.
// Mesma estrutura do default no schema.prisma.
const DEFAULTS = {
  id: SINGLETON_ID,
  siteName: "Restaurante Girassol",
  tagline: "Alimentação saudável há décadas em Brasília",
  primaryColor: "#E87B0F",
  secondaryColor: "#5A7A3F",
  whatsapp: "556132421542",
  phone: "(61) 3242-1542",
  email: null as string | null,
  instagram: "restaurantegirassolbsb",
  facebook: null as string | null,
  addressLine: "Asa Sul, Brasília — DF",
  mapEmbedUrl: null as string | null,
  hoursWeek: "Segunda a Sexta: 11h–15h e 18h–22h",
  hoursWeekend: "Sábado e Domingo: 11h–16h",
  heroTitle: "Há décadas cultivando saúde em Brasília",
  heroSubtitle:
    "Alimentação viva, natural e vegetariana. A tradição que nasce da terra.",
  heroImageUrl: null as string | null,
  aboutShort:
    "Mais que um restaurante, somos um ponto de encontro de quem busca uma vida mais leve, natural e consciente.",
  promoActive: true,
  promoTitle: "Tarde no Girassol",
  promoSubtitle:
    "Açaí, sucos e lanches naturais com 15% off entre 14h e 17h",
  seoDescription:
    "Restaurante vegetariano tradicional em Brasília. Comida natural, sucos, açaí, lanches saudáveis e ambiente acolhedor há décadas na Asa Sul.",
};

export type Settings = typeof DEFAULTS;

export async function getSettings(): Promise<Settings> {
  try {
    const s = await prisma.settings.findUnique({ where: { id: SINGLETON_ID } });
    if (!s) return DEFAULTS;
    return s as unknown as Settings;
  } catch {
    return DEFAULTS;
  }
}

export async function ensureSettings(): Promise<Settings> {
  const existing = await prisma.settings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing as unknown as Settings;
  const created = await prisma.settings.create({
    data: { id: SINGLETON_ID },
  });
  return created as unknown as Settings;
}

export async function updateSettings(
  patch: Partial<Omit<Settings, "id" | "updatedAt">>,
): Promise<Settings> {
  await ensureSettings();
  const updated = await prisma.settings.update({
    where: { id: SINGLETON_ID },
    data: patch as any,
  });
  return updated as unknown as Settings;
}

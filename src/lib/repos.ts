import { prisma } from "./db";

// ───────────────── MENU ─────────────────

export type MenuItemDTO = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  tags: string[];
  highlight: boolean;
  sortOrder: number;
  active: boolean;
};

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  items: MenuItemDTO[];
};

function mapItem(it: any, cat?: { name: string; slug: string }): MenuItemDTO {
  return {
    id: it.id,
    categoryId: it.categoryId,
    categoryName: cat?.name ?? it.category?.name ?? "",
    categorySlug: cat?.slug ?? it.category?.slug ?? "",
    slug: it.slug,
    name: it.name,
    description: it.description,
    imageUrl: it.imageUrl ?? null,
    priceCents: it.priceCents,
    tags: it.tags ? it.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    highlight: it.highlight,
    sortOrder: it.sortOrder,
    active: it.active,
  };
}

export async function listCategoriesWithItems(): Promise<CategoryDTO[]> {
  const cats = await prisma.menuCategory.findMany({
    where: { active: true },
    include: {
      items: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
  return cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sortOrder: c.sortOrder,
    active: c.active,
    items: c.items.map((i) => mapItem(i, { name: c.name, slug: c.slug })),
  }));
}

export async function listAllCategories(includeInactive = false) {
  return prisma.menuCategory.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listHighlightedItems(limit = 8): Promise<MenuItemDTO[]> {
  const items = await prisma.menuItem.findMany({
    where: { active: true, highlight: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
  return items.map((i) => mapItem(i));
}

export async function findItemBySlug(slug: string): Promise<MenuItemDTO | null> {
  const it = await prisma.menuItem.findUnique({
    where: { slug },
    include: { category: true },
  });
  return it ? mapItem(it) : null;
}

export async function listAllItems(includeInactive = false): Promise<MenuItemDTO[]> {
  const items = await prisma.menuItem.findMany({
    where: includeInactive ? {} : { active: true },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  return items.map((i) => mapItem(i));
}

export async function findItemById(id: string): Promise<MenuItemDTO | null> {
  const it = await prisma.menuItem.findUnique({
    where: { id },
    include: { category: true },
  });
  return it ? mapItem(it) : null;
}

// ───────────────── POSTS ─────────────────

export type PostDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  category: string;
  published: boolean;
  publishedAt: string;
};

function mapPost(p: any): PostDTO {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverUrl: p.coverUrl ?? null,
    category: p.category,
    published: p.published,
    publishedAt: p.publishedAt.toISOString?.() ?? p.publishedAt,
  };
}

export async function listPosts(opts: { includeUnpublished?: boolean; limit?: number } = {}): Promise<PostDTO[]> {
  const rows = await prisma.post.findMany({
    where: opts.includeUnpublished ? {} : { published: true },
    orderBy: { publishedAt: "desc" },
    take: opts.limit,
  });
  return rows.map(mapPost);
}

export async function findPostBySlug(slug: string): Promise<PostDTO | null> {
  const p = await prisma.post.findUnique({ where: { slug } });
  return p ? mapPost(p) : null;
}

export async function findPostById(id: string): Promise<PostDTO | null> {
  const p = await prisma.post.findUnique({ where: { id } });
  return p ? mapPost(p) : null;
}

// ───────────────── TESTIMONIALS + GALLERY ─────────────────

export async function listTestimonials() {
  return prisma.testimonial.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listGalleryImages() {
  return prisma.galleryImage.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

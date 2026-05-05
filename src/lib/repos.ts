// Repositórios — encapsulam Prisma e fazem mapping pros tipos do domínio.
// Vantagem: as rotas/UI consomem o mesmo shape que tinham com o mockdb.

import { prisma } from "./db";
import type {
  Order,
  OrderInput,
  PaymentStatus,
  PixCharge,
  Product,
  Store,
} from "./types";

// ───────────────────────── Store ─────────────────────────

function mapStore(s: any): Store {
  return {
    id: s.id,
    subdomain: s.subdomain,
    custom_domain: s.customDomain ?? null,
    name: s.name,
    slogan: s.slogan,
    logo_url: s.logoUrl,
    banner_url: s.bannerUrl,
    primary_color: s.primaryColor,
    whatsapp: s.whatsapp,
    address: s.address,
    delivery_fee_cents: s.deliveryFeeCents,
    min_order_cents: s.minOrderCents,
    open: s.open,
  };
}

export async function findStoreByTenant(input: {
  subdomain?: string | null;
  customDomain?: string | null;
}): Promise<Store | null> {
  if (input.subdomain && input.subdomain !== "NULL") {
    const s = await prisma.store.findUnique({ where: { subdomain: input.subdomain } });
    if (s) return mapStore(s);
  }
  if (input.customDomain && input.customDomain !== "NULL") {
    const s = await prisma.store.findUnique({ where: { customDomain: input.customDomain } });
    if (s) return mapStore(s);
  }
  return null;
}

export async function findStoreById(id: string): Promise<Store | null> {
  const s = await prisma.store.findUnique({ where: { id } });
  return s ? mapStore(s) : null;
}

export async function updateStore(
  id: string,
  patch: Partial<Omit<Store, "id" | "subdomain">> & { adminPasswordHash?: string },
): Promise<Store> {
  const data: any = {};
  if (patch.custom_domain !== undefined) data.customDomain = patch.custom_domain;
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.slogan !== undefined) data.slogan = patch.slogan;
  if (patch.logo_url !== undefined) data.logoUrl = patch.logo_url;
  if (patch.banner_url !== undefined) data.bannerUrl = patch.banner_url;
  if (patch.primary_color !== undefined) data.primaryColor = patch.primary_color;
  if (patch.whatsapp !== undefined) data.whatsapp = patch.whatsapp;
  if (patch.address !== undefined) data.address = patch.address;
  if (patch.delivery_fee_cents !== undefined) data.deliveryFeeCents = patch.delivery_fee_cents;
  if (patch.min_order_cents !== undefined) data.minOrderCents = patch.min_order_cents;
  if (patch.open !== undefined) data.open = patch.open;
  if (patch.adminPasswordHash !== undefined) data.adminPasswordHash = patch.adminPasswordHash;

  const s = await prisma.store.update({ where: { id }, data });
  return mapStore(s);
}

// ───────────────────────── Product ─────────────────────────

function mapProduct(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    image_url: p.imageUrl,
    price_cents: p.priceCents,
    list_price_cents: p.listPriceCents ?? null,
    category: p.category,
    unit: p.unit,
    stock: p.stock,
  };
}

export async function listProducts(
  storeId: string,
  filters: { category?: string; q?: string; includeInactive?: boolean } = {},
): Promise<Product[]> {
  const where: any = { storeId };
  if (!filters.includeInactive) where.active = true;
  if (filters.category && filters.category !== "all") where.category = filters.category;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { description: { contains: filters.q } },
    ];
  }
  const rows = await prisma.product.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return rows.map(mapProduct);
}

export async function findProductBySlug(
  storeId: string,
  slug: string,
): Promise<Product | null> {
  const p = await prisma.product.findUnique({
    where: { storeId_slug: { storeId, slug } },
  });
  return p ? mapProduct(p) : null;
}

export async function findProductById(id: string): Promise<Product | null> {
  const p = await prisma.product.findUnique({ where: { id } });
  return p ? mapProduct(p) : null;
}

// ───────────────────────── Order ─────────────────────────

function mapOrder(o: any): Order {
  return {
    id: o.id,
    store_subdomain: o.store?.subdomain ?? "",
    customer: {
      name: o.customerName,
      phone: o.customerPhone,
      email: o.customerEmail ?? undefined,
    },
    delivery: {
      address: o.deliveryAddress,
      notes: o.deliveryNotes ?? undefined,
    },
    payment_method: o.paymentMethod,
    items: (o.items ?? []).map((it: any) => ({
      product_id: it.productId,
      name: it.productName,
      price_cents: it.priceCents,
      qty: it.qty,
      line_total_cents: it.priceCents * it.qty,
    })),
    subtotal_cents: o.subtotalCents,
    delivery_fee_cents: o.deliveryFeeCents,
    total_cents: o.totalCents,
    status: o.status,
    payment_status: o.paymentStatus as PaymentStatus,
    pix: o.pix ? mapPix(o.pix) : undefined,
    created_at: o.createdAt.toISOString?.() ?? o.createdAt,
    updated_at: o.updatedAt.toISOString?.() ?? o.updatedAt,
  };
}

function mapPix(p: any): PixCharge {
  return {
    provider: p.provider,
    charge_id: p.externalId,
    qr_code: p.qrCode,
    qr_code_base64: p.qrCodeBase64,
    expires_at: p.expiresAt.toISOString?.() ?? p.expiresAt,
    amount_cents: p.amountCents,
    status: p.status as PaymentStatus,
  };
}

export async function createOrderWithItems(input: {
  storeId: string;
  body: OrderInput;
  subtotalCents: number;
  deliveryFeeCents: number;
}): Promise<Order> {
  const totalCents = input.subtotalCents + input.deliveryFeeCents;

  // Snapshot dos preços/nomes no momento da compra
  const productIds = input.body.items.map((i) => i.product_id);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  const order = await prisma.order.create({
    data: {
      storeId: input.storeId,
      customerName: input.body.customer.name,
      customerPhone: input.body.customer.phone,
      customerEmail: input.body.customer.email,
      deliveryAddress: input.body.delivery.address,
      deliveryNotes: input.body.delivery.notes,
      paymentMethod: input.body.payment_method,
      subtotalCents: input.subtotalCents,
      deliveryFeeCents: input.deliveryFeeCents,
      totalCents,
      items: {
        create: input.body.items.map((it) => {
          const p = products.find((x) => x.id === it.product_id)!;
          return {
            productId: p.id,
            productName: p.name,
            priceCents: p.priceCents,
            qty: it.qty,
          };
        }),
      },
    },
    include: { items: true, pix: true, store: true },
  });
  return mapOrder(order);
}

export async function attachPixToOrder(orderId: string, pix: PixCharge): Promise<Order> {
  await prisma.pixCharge.create({
    data: {
      orderId,
      provider: pix.provider,
      externalId: pix.charge_id,
      qrCode: pix.qr_code,
      qrCodeBase64: pix.qr_code_base64,
      expiresAt: new Date(pix.expires_at),
      amountCents: pix.amount_cents,
      status: pix.status,
    },
  });
  const o = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, pix: true, store: true },
  });
  return mapOrder(o);
}

export async function findOrderById(id: string): Promise<Order | null> {
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true, pix: true, store: true },
  });
  return o ? mapOrder(o) : null;
}

export async function listOrders(
  storeId: string,
  filters: { status?: string; paymentStatus?: string; limit?: number } = {},
): Promise<Order[]> {
  const where: any = { storeId };
  if (filters.status) where.status = filters.status;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  const rows = await prisma.order.findMany({
    where,
    include: { items: true, pix: true, store: true },
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 100,
  });
  return rows.map(mapOrder);
}

export async function updateOrderStatus(
  id: string,
  patch: { status?: string; paymentStatus?: PaymentStatus },
): Promise<Order | null> {
  // Tudo numa transação pra garantir atomicidade do decremento de estoque.
  await prisma.$transaction(async (tx) => {
    // Lê estado atual pra detectar transições idempotentemente
    const before = await tx.order.findUnique({
      where: { id },
      include: { items: true, pix: true },
    });
    if (!before) return;

    const updated = await tx.order.update({
      where: { id },
      data: {
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.paymentStatus ? { paymentStatus: patch.paymentStatus } : {}),
      },
    });

    // Sincroniza status no PixCharge
    if (patch.paymentStatus && before.pix) {
      await tx.pixCharge.update({
        where: { id: before.pix.id },
        data: { status: patch.paymentStatus },
      });
    }

    // Decrementa estoque APENAS na transição pending → paid (idempotente)
    const wasPaid = before.paymentStatus === "paid";
    const willBePaid = updated.paymentStatus === "paid";
    if (!wasPaid && willBePaid) {
      for (const it of before.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.qty } },
        });
      }
    }

    // Recoloca estoque se cancelar pedido pago (refund/cancellation)
    const wasOk = before.paymentStatus === "paid";
    const nowRefunded =
      updated.paymentStatus === "refunded" || updated.paymentStatus === "cancelled";
    if (wasOk && nowRefunded) {
      for (const it of before.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { increment: it.qty } },
        });
      }
    }
  });

  return findOrderById(id);
}

export async function findOrderByCharge(
  provider: string,
  externalId: string,
): Promise<Order | null> {
  const c = await prisma.pixCharge.findUnique({
    where: { provider_externalId: { provider, externalId } },
  });
  if (!c) return null;
  return findOrderById(c.orderId);
}

// ───────────────────────── Product CRUD (admin) ─────────────────────────

export async function createProduct(
  storeId: string,
  input: Omit<Product, "id">,
): Promise<Product> {
  const p = await prisma.product.create({
    data: {
      storeId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageUrl: input.image_url,
      priceCents: input.price_cents,
      listPriceCents: input.list_price_cents,
      category: input.category,
      unit: input.unit,
      stock: input.stock,
    },
  });
  return mapProduct(p);
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<Product, "id" | "slug">>,
): Promise<Product> {
  const p = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name != null ? { name: input.name } : {}),
      ...(input.description != null ? { description: input.description } : {}),
      ...(input.image_url != null ? { imageUrl: input.image_url } : {}),
      ...(input.price_cents != null ? { priceCents: input.price_cents } : {}),
      ...(input.list_price_cents !== undefined
        ? { listPriceCents: input.list_price_cents }
        : {}),
      ...(input.category != null ? { category: input.category } : {}),
      ...(input.unit != null ? { unit: input.unit } : {}),
      ...(input.stock != null ? { stock: input.stock } : {}),
    },
  });
  return mapProduct(p);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

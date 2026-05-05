import { type NextRequest } from "next/server";
import {
  attachPixToOrder,
  createOrderWithItems,
  findStoreByTenant,
  listProducts,
} from "@/lib/repos";
import { badRequest, notFound, ok } from "@/lib/envelope";
import type { OrderInput } from "@/lib/types";
import { getProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const store = await findStoreByTenant({
    subdomain: sp.get("subdomain"),
    customDomain: sp.get("custom_domain"),
  });
  if (!store) return notFound();

  let body: OrderInput;
  try {
    body = (await req.json()) as OrderInput;
  } catch {
    return badRequest("JSON inválido");
  }
  if (!body?.items?.length) return badRequest("Carrinho vazio");
  if (!body.customer?.name || !body.customer?.phone)
    return badRequest("Dados do cliente faltando");
  if (!body.delivery?.address) return badRequest("Endereço de entrega faltando");

  const products = await listProducts(store.id);
  let subtotal = 0;
  for (const it of body.items) {
    const p = products.find((x) => x.id === it.product_id);
    if (!p) return badRequest(`Produto ${it.product_id} não encontrado`);
    if (it.qty <= 0) return badRequest("Quantidade inválida");
    if (p.stock < it.qty) {
      return badRequest(
        `Estoque insuficiente de "${p.name}" (disponível: ${p.stock}, pedido: ${it.qty})`,
      );
    }
    subtotal += p.price_cents * it.qty;
  }
  if (subtotal < store.min_order_cents) {
    return badRequest(`Pedido mínimo: R$ ${(store.min_order_cents / 100).toFixed(2)}`);
  }

  let order = await createOrderWithItems({
    storeId: store.id,
    body,
    subtotalCents: subtotal,
    deliveryFeeCents: store.delivery_fee_cents,
  });

  if (body.payment_method === "pix") {
    try {
      const provider = getProvider();
      const charge = await provider.createPix({
        order_id: order.id,
        amount_cents: order.total_cents,
        description: `Pedido ${order.id} — ${store.name}`,
        payer: {
          name: body.customer.name,
          email: body.customer.email,
          phone: body.customer.phone,
        },
        expires_in_minutes: 30,
      });
      order = await attachPixToOrder(order.id, charge);
    } catch (err: any) {
      return badRequest(`Falha ao criar PIX: ${err?.message ?? String(err)}`);
    }
  }

  return ok(order);
}

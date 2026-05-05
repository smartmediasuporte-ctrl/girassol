// Helpers de WhatsApp via link wa.me — zero custo, zero credencial.
// Para envio automático/server-side seria preciso WhatsApp Business API
// (gateway pago como Z-API, ChatPro, ou Cloud API da Meta).

import type { Order, Store } from "./types";
import { formatBRL } from "./format";

function digits(s: string): string {
  return s.replace(/\D/g, "");
}

export function whatsAppLinkForCustomer(order: Order, store: Store): string {
  // Lojista falando com cliente
  const phone = digits(order.customer.phone);
  const msg = [
    `Olá, ${order.customer.name.split(" ")[0]}!`,
    ``,
    `Aqui é da ${store.name}. Sobre o seu pedido ${order.id.slice(0, 8)}…`,
    `Total: ${formatBRL(order.total_cents)}`,
    ``,
    order.payment_status === "paid"
      ? `✅ Pagamento confirmado. Já estamos preparando.`
      : `Aguardando pagamento via PIX.`,
  ].join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export function whatsAppLinkForStore(order: Order, store: Store): string {
  // Cliente falando com loja
  const phone = digits(store.whatsapp);
  const msg = [
    `Olá, ${store.name}!`,
    ``,
    `Acabei de fazer o pedido ${order.id.slice(0, 8)}…`,
    `Total: ${formatBRL(order.total_cents)}`,
    `Endereço: ${order.delivery.address}`,
    order.payment_status === "paid" ? `✅ Pagamento confirmado.` : ``,
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

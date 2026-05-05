import Link from "next/link";
import { findOrderById, findStoreByTenant } from "@/lib/repos";
import { formatBRL } from "@/lib/format";
import { whatsAppLinkForStore } from "@/lib/whatsapp";
import { PixView } from "./PixView";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await findOrderById(params.id);
  const store = order
    ? await findStoreByTenant({ subdomain: order.store_subdomain })
    : null;

  if (!order) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-800">Pedido não encontrado</h1>
        <p className="mt-2 text-sm text-red-700">
          O pedido <code>{params.id}</code> não existe ou expirou.
        </p>
        <Link
          href="/produtos"
          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-black/50">
            Pedido <code>{order.id}</code>
          </div>
          <h1 className="text-2xl font-bold">
            {order.payment_status === "paid"
              ? "Pagamento confirmado!"
              : order.payment_method === "pix"
                ? "Pague com PIX"
                : "Pedido recebido"}
          </h1>
        </div>

        {order.payment_method === "pix" && order.pix ? (
          <PixView orderId={order.id} initialOrder={order} />
        ) : (
          <div className="rounded-xl border border-black/10 bg-white p-4 text-sm">
            Forma de pagamento: <strong>{order.payment_method}</strong>. Entraremos em
            contato pelo WhatsApp.
          </div>
        )}

        {store && order.payment_status === "paid" && (
          <a
            href={whatsAppLinkForStore(order, store)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            💬 Falar com a loja no WhatsApp
          </a>
        )}
      </div>

      <aside className="h-fit space-y-3 rounded-xl border border-black/5 bg-white p-4 text-sm">
        <h2 className="font-semibold">Resumo</h2>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatBRL(order.subtotal_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span>{formatBRL(order.delivery_fee_cents)}</span>
        </div>
        <hr />
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatBRL(order.total_cents)}</span>
        </div>
        <div className="text-xs text-black/50">
          Entrega: {order.delivery.address}
        </div>
      </aside>
    </div>
  );
}

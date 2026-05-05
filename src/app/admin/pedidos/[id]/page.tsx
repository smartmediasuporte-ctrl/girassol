import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { findOrderById, updateOrderStatus } from "@/lib/repos";
import { formatBRL } from "@/lib/format";
import { whatsAppLinkForCustomer } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  let store;
  try {
    store = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  const order = await findOrderById(params.id);
  if (!order || order.store_subdomain !== store.subdomain) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Pedido não encontrado para esta loja.
      </div>
    );
  }

  async function setStatus(formData: FormData) {
    "use server";
    const next = String(formData.get("next") ?? "");
    const id = String(formData.get("id") ?? "");
    if (!["confirmed", "delivered", "cancelled"].includes(next)) return;
    await updateOrderStatus(id, { status: next });
    revalidatePath(`/admin/pedidos/${id}`);
    revalidatePath(`/admin/pedidos`);
    revalidatePath(`/admin`);
  }

  const waLink = whatsAppLinkForCustomer(order, store);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <Link href="/admin/pedidos" className="text-sm text-black/60 hover:underline">
            ← voltar
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            Pedido <span className="font-mono text-base">{order.id}</span>
          </h1>
          <div className="text-sm text-black/60">
            Criado: {new Date(order.created_at).toLocaleString("pt-BR")}
          </div>
        </div>

        <section className="rounded-xl border border-black/5 bg-white p-4">
          <h2 className="text-sm font-semibold">Cliente</h2>
          <div className="mt-2 text-sm">
            <div>{order.customer.name}</div>
            <div className="text-black/60">{order.customer.phone}</div>
            {order.customer.email && (
              <div className="text-black/60">{order.customer.email}</div>
            )}
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
          >
            WhatsApp do cliente
          </a>
        </section>

        <section className="rounded-xl border border-black/5 bg-white p-4">
          <h2 className="text-sm font-semibold">Entrega</h2>
          <div className="mt-2 text-sm">{order.delivery.address}</div>
          {order.delivery.notes && (
            <div className="mt-1 text-xs text-black/60">Obs: {order.delivery.notes}</div>
          )}
        </section>

        <section className="rounded-xl border border-black/5 bg-white p-4">
          <h2 className="text-sm font-semibold">Itens</h2>
          <div className="mt-2 divide-y divide-black/5">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {it.qty}× {it.name}
                  </div>
                  <div className="text-xs text-black/50">
                    {formatBRL(it.price_cents)} cada
                  </div>
                </div>
                <div className="font-semibold">
                  {formatBRL(it.line_total_cents)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-black/5 bg-white p-4">
          <h2 className="text-sm font-semibold">Ações</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {order.status !== "confirmed" && (
              <form action={setStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="next" value="confirmed" />
                <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
                  Marcar confirmado
                </button>
              </form>
            )}
            {order.status !== "delivered" && (
              <form action={setStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="next" value="delivered" />
                <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">
                  Marcar entregue
                </button>
              </form>
            )}
            {order.status !== "cancelled" && (
              <form action={setStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="next" value="cancelled" />
                <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white">
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-3 rounded-xl border border-black/5 bg-white p-4 text-sm">
        <h2 className="font-semibold">Resumo</h2>
        <div className="flex justify-between">
          <span>Pgto</span>
          <span className="font-semibold">{order.payment_status}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span className="font-semibold">{order.status}</span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatBRL(order.subtotal_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span>{formatBRL(order.delivery_fee_cents)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatBRL(order.total_cents)}</span>
        </div>
        {order.pix && (
          <div className="mt-2 rounded-lg bg-neutral-50 p-2 text-xs">
            <div className="text-black/60">PIX provider: {order.pix.provider}</div>
            <div className="text-black/60">Charge: {order.pix.charge_id}</div>
          </div>
        )}
      </aside>
    </div>
  );
}

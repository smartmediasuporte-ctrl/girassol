import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/repos";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  let store;
  try {
    store = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  const all = await listOrders(store.id, { limit: 50 });
  const pendingPayment = all.filter((o) => o.payment_status === "pending");
  const paid = all.filter((o) => o.payment_status === "paid" && o.status !== "delivered");
  const delivered = all.filter((o) => o.status === "delivered");
  const totalToday = all
    .filter((o) => o.payment_status === "paid" && isToday(o.created_at))
    .reduce((s, o) => s + o.total_cents, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Aguardando pgto" value={pendingPayment.length} />
        <Stat label="Pagos a entregar" value={paid.length} />
        <Stat label="Entregues" value={delivered.length} />
        <Stat label="Faturamento hoje" value={formatBRL(totalToday)} />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-black/60 hover:underline">
            ver todos →
          </Link>
        </div>
        <OrdersTable orders={all.slice(0, 10)} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-black/50">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function OrdersTable({ orders }: { orders: Awaited<ReturnType<typeof listOrders>> }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 p-6 text-center text-sm text-black/60">
        Nenhum pedido ainda.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-black/50">
          <tr>
            <th className="px-3 py-2">Pedido</th>
            <th className="px-3 py-2">Cliente</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Pgto</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Quando</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-black/5">
              <td className="px-3 py-2">
                <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-xs underline">
                  {o.id.slice(0, 10)}…
                </Link>
              </td>
              <td className="px-3 py-2">{o.customer.name}</td>
              <td className="px-3 py-2 font-semibold">{formatBRL(o.total_cents)}</td>
              <td className="px-3 py-2">
                <Badge status={o.payment_status} />
              </td>
              <td className="px-3 py-2">
                <Badge status={o.status} />
              </td>
              <td className="px-3 py-2 text-xs text-black/60">
                {new Date(o.created_at).toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-neutral-200 text-neutral-700",
    refunded: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        colors[status] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/repos";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: { payment?: string; status?: string };
}) {
  let store;
  try {
    store = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) redirect("/admin/login");
    throw e;
  }

  const orders = await listOrders(store.id, {
    paymentStatus: searchParams.payment,
    status: searchParams.status,
    limit: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        <Filter href="/admin/pedidos" active={!searchParams.payment && !searchParams.status}>
          Todos
        </Filter>
        <Filter
          href="/admin/pedidos?payment=pending"
          active={searchParams.payment === "pending"}
        >
          Aguardando pgto
        </Filter>
        <Filter
          href="/admin/pedidos?payment=paid&status=confirmed"
          active={searchParams.payment === "paid" && searchParams.status === "confirmed"}
        >
          Pagos a entregar
        </Filter>
        <Filter
          href="/admin/pedidos?status=delivered"
          active={searchParams.status === "delivered"}
        >
          Entregues
        </Filter>
        <Filter
          href="/admin/pedidos?status=cancelled"
          active={searchParams.status === "cancelled"}
        >
          Cancelados
        </Filter>
      </div>

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
              <tr key={o.id} className="border-t border-black/5 hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="font-mono text-xs underline"
                  >
                    {o.id}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.customer.name}</td>
                <td className="px-3 py-2 font-semibold">{formatBRL(o.total_cents)}</td>
                <td className="px-3 py-2">{o.payment_status}</td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2 text-xs text-black/60">
                  {new Date(o.created_at).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-black/50">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filter({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${
        active ? "border-black bg-black text-white" : "border-black/10 hover:bg-black/5"
      }`}
    >
      {children}
    </Link>
  );
}

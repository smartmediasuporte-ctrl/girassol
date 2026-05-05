import { type NextRequest } from "next/server";
import { findOrderById, updateOrderStatus } from "@/lib/repos";
import { notFound, ok } from "@/lib/envelope";
import { getProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  let order = await findOrderById(ctx.params.id);
  if (!order) return notFound();

  if (order.payment_status === "pending" && order.pix) {
    try {
      const provider = getProvider(order.pix.provider);
      const status = await provider.getStatus(order.pix.charge_id);
      if (status !== order.payment_status) {
        order =
          (await updateOrderStatus(order.id, {
            paymentStatus: status,
            status: status === "paid" ? "confirmed" : order.status,
          })) ?? order;
      }
    } catch {
      // mantém último status conhecido
    }
  }
  return ok(order);
}

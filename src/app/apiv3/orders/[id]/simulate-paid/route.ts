import { type NextRequest } from "next/server";
import { findOrderById, updateOrderStatus } from "@/lib/repos";
import { _fakeMarkPaid } from "@/lib/payments/fake";
import { badRequest, notFound, ok } from "@/lib/envelope";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: { id: string } }) {
  const allowed =
    process.env.NODE_ENV !== "production" ||
    (process.env.PAYMENT_PROVIDER ?? "fake") === "fake";
  if (!allowed) return badRequest("simulate-paid bloqueado em produção real");

  const order = await findOrderById(ctx.params.id);
  if (!order) return notFound();
  if (!order.pix) return badRequest("Pedido não tem PIX");

  if (order.pix.provider === "fake") _fakeMarkPaid(order.pix.charge_id);

  const next = await updateOrderStatus(order.id, {
    paymentStatus: "paid",
    status: "confirmed",
  });
  return ok(next);
}

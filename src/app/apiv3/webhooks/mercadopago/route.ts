import { type NextRequest, NextResponse } from "next/server";
import { findOrderByCharge, updateOrderStatus } from "@/lib/repos";
import { mercadoPagoProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  try {
    const evt = await mercadoPagoProvider.parseWebhook(body, req.headers);
    if (!evt) return NextResponse.json({ ok: true, ignored: true });

    const order = await findOrderByCharge("mercadopago", evt.external_charge_id);
    if (!order) return NextResponse.json({ ok: true, unknown_charge: true });
    if (order.payment_status === evt.status) return NextResponse.json({ ok: true });

    await updateOrderStatus(order.id, {
      paymentStatus: evt.status,
      status: evt.status === "paid" ? "confirmed" : order.status,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 401 },
    );
  }
}

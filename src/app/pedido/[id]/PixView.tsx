"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/types";
import { formatBRL } from "@/lib/format";

type Envelope<T> = { data: T; status: "success" | "error"; http_status: number };

export function PixView({
  orderId,
  initialOrder,
}: {
  orderId: string;
  initialOrder: Order;
}) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Polling do status — 3s, para quando paid/expired/cancelled
  useEffect(() => {
    if (!order.pix) return;
    if (["paid", "expired", "cancelled", "refunded"].includes(order.payment_status)) {
      return;
    }
    const tick = async () => {
      try {
        const res = await fetch(`/apiv3/orders/${orderId}`, { cache: "no-store" });
        const json = (await res.json()) as Envelope<Order>;
        if (json.status === "success") setOrder(json.data);
      } catch {}
    };
    const handle = setInterval(tick, 3000);
    return () => clearInterval(handle);
  }, [orderId, order.payment_status, order.pix]);

  // Tick de countdown
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);

  const remaining = useMemo(() => {
    if (!order.pix) return 0;
    return Math.max(0, new Date(order.pix.expires_at).getTime() - now);
  }, [order.pix, now]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  if (order.payment_status === "paid") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800">
        <div className="text-2xl font-bold">✅ Pagamento confirmado</div>
        <p className="mt-1 text-sm">
          Seu pedido foi recebido. Entraremos em contato pelo WhatsApp.
        </p>
      </div>
    );
  }

  if (order.payment_status === "expired" || order.payment_status === "cancelled") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="text-2xl font-bold">⏱ PIX expirado</div>
        <p className="mt-1 text-sm">
          Refaça o pedido pra gerar um novo código.
        </p>
      </div>
    );
  }

  if (!order.pix) return null;

  async function copy() {
    await navigator.clipboard.writeText(order.pix!.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function simulatePaid() {
    await fetch(`/apiv3/orders/${orderId}/simulate-paid`, { method: "POST" });
    const res = await fetch(`/apiv3/orders/${orderId}`, { cache: "no-store" });
    const json = (await res.json()) as Envelope<Order>;
    if (json.status === "success") setOrder(json.data);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-black/50">
            Provider: {order.pix.provider}
          </div>
          <div className="text-2xl font-bold">{formatBRL(order.pix.amount_cents)}</div>
        </div>
        <div className="text-right text-sm">
          <div className="text-black/50">Expira em</div>
          <div className="font-mono text-lg font-semibold">
            {mins}:{secs}
          </div>
        </div>
      </div>

      {order.pix.qr_code_base64 && (
        <div className="flex justify-center rounded-xl bg-neutral-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${order.pix.qr_code_base64}`}
            alt="QR Code PIX"
            className="h-64 w-64 rounded-lg bg-white object-contain p-2"
          />
        </div>
      )}

      <div>
        <div className="mb-1 text-xs font-semibold text-black/60">
          PIX copia e cola
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={order.pix.qr_code}
            className="flex-1 rounded-lg border border-black/10 bg-neutral-50 px-3 py-2 font-mono text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={copy}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-black/50">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        Aguardando pagamento… (verifica a cada 3s)
      </div>

      {order.pix.provider === "fake" && (
        <button
          onClick={simulatePaid}
          className="w-full rounded-lg border border-dashed border-black/20 bg-neutral-50 py-2 text-xs text-black/60 hover:bg-neutral-100"
        >
          [DEV] Simular pagamento confirmado
        </button>
      )}
    </div>
  );
}

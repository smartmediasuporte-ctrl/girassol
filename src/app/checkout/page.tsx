"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 p-10 text-center">
        <h1 className="text-2xl font-bold">Carrinho vazio</h1>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      customer: {
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? "") || undefined,
      },
      delivery: {
        address: String(fd.get("address") ?? ""),
        notes: String(fd.get("notes") ?? "") || undefined,
      },
      payment_method: String(fd.get("payment_method") ?? "pix") as
        | "pix"
        | "card"
        | "cash",
      items: items.map((it) => ({ product_id: it.product_id, qty: it.qty })),
    };

    try {
      // O middleware injeta x-tenant-subdomain no server; aqui no client passamos
      // explicitamente baseado no hostname.
      const sub = window.location.hostname.split(".")[0] || "girassolemporio";
      const res = await fetch(`/apiv3/orders?subdomain=${encodeURIComponent(sub)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status === "error") {
        setError(String(json.data ?? "Erro desconhecido"));
        setSubmitting(false);
        return;
      }
      const orderId = json.data?.id;
      clear();
      router.push(`/pedido/${orderId}`);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Finalizar compra</h1>

        <fieldset className="space-y-3 rounded-xl border border-black/5 bg-white p-4">
          <legend className="px-2 text-sm font-semibold">Seus dados</legend>
          <input
            name="name"
            required
            placeholder="Nome completo"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
          <input
            name="phone"
            required
            placeholder="Telefone / WhatsApp"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="E-mail (opcional)"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-black/5 bg-white p-4">
          <legend className="px-2 text-sm font-semibold">Entrega</legend>
          <input
            name="address"
            required
            placeholder="Endereço completo"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
          <textarea
            name="notes"
            placeholder="Observações (opcional)"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
            rows={3}
          />
        </fieldset>

        <fieldset className="space-y-2 rounded-xl border border-black/5 bg-white p-4">
          <legend className="px-2 text-sm font-semibold">Pagamento</legend>
          {(["pix", "card", "cash"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input type="radio" name="payment_method" value={m} defaultChecked={m === "pix"} />
              {m === "pix" ? "PIX" : m === "card" ? "Cartão na entrega" : "Dinheiro"}
            </label>
          ))}
        </fieldset>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
            <div className="font-semibold text-red-800">Não foi possível concluir o pedido</div>
            <div className="text-red-700">{error}</div>
          </div>
        )}
      </div>

      <aside className="h-fit space-y-3 rounded-xl border border-black/5 bg-white p-4">
        <h2 className="font-semibold">Resumo</h2>
        {items.map((it) => (
          <div key={it.product_id} className="flex justify-between text-sm">
            <span>
              {it.qty}× {it.name}
            </span>
            <span>{formatBRL(it.price_cents * it.qty)}</span>
          </div>
        ))}
        <hr />
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-semibold">{formatBRL(subtotalCents)}</span>
        </div>
        <button
          disabled={submitting}
          className="block w-full rounded-lg bg-brand-500 px-4 py-3 text-center font-semibold text-black hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Enviando…" : "Confirmar pedido"}
        </button>
      </aside>
    </form>
  );
}

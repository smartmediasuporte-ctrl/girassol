// Mercado Pago — PIX
// Doc: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
// Header obrigatório: Authorization: Bearer <ACCESS_TOKEN> + X-Idempotency-Key

import crypto from "node:crypto";
import type { PaymentProvider, CreatePixInput, ProviderEvent } from "./types";
import type { PaymentStatus, PixCharge } from "../types";

const API_BASE = "https://api.mercadopago.com";

function token(): string {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("MP_ACCESS_TOKEN ausente");
  return t;
}

function mapMpStatus(s: string): PaymentStatus {
  switch (s) {
    case "approved":
      return "paid";
    case "pending":
    case "in_process":
    case "authorized":
      return "pending";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "expired";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending";
  }
}

export const mercadoPagoProvider: PaymentProvider = {
  id: "mercadopago",

  async createPix(input: CreatePixInput): Promise<PixCharge> {
    const expirationMin = input.expires_in_minutes ?? 30;
    const expires_at = new Date(Date.now() + expirationMin * 60 * 1000);
    // MP exige formato com offset
    const expirationDateStr = expires_at.toISOString().replace("Z", "-00:00");

    const body: Record<string, unknown> = {
      transaction_amount: Number((input.amount_cents / 100).toFixed(2)),
      description: input.description,
      payment_method_id: "pix",
      external_reference: input.order_id,
      date_of_expiration: expirationDateStr,
      payer: {
        email: input.payer.email ?? `${input.order_id}@girassol.local`,
        first_name: input.payer.name.split(" ")[0],
        last_name: input.payer.name.split(" ").slice(1).join(" ") || "Cliente",
        ...(input.payer.tax_id
          ? {
              identification: {
                type: input.payer.tax_id.length > 11 ? "CNPJ" : "CPF",
                number: input.payer.tax_id.replace(/\D/g, ""),
              },
            }
          : {}),
      },
    };

    const res = await fetch(`${API_BASE}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(`MP createPix falhou: ${res.status} ${JSON.stringify(json)}`);
    }
    const tx = json.point_of_interaction?.transaction_data ?? {};
    return {
      provider: "mercadopago",
      charge_id: String(json.id),
      qr_code: tx.qr_code ?? "",
      qr_code_base64: tx.qr_code_base64 ?? "",
      expires_at: expires_at.toISOString(),
      amount_cents: input.amount_cents,
      status: mapMpStatus(json.status),
    };
  },

  async getStatus(chargeId: string): Promise<PaymentStatus> {
    const res = await fetch(`${API_BASE}/v1/payments/${chargeId}`, {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`MP getStatus falhou: ${res.status} ${text}`);
    }
    const json = (await res.json()) as any;
    return mapMpStatus(json.status);
  },

  async parseWebhook(body: unknown, headers: Headers): Promise<ProviderEvent | null> {
    // MP envia: { action: "payment.updated", data: { id: "..." }, type: "payment", ... }
    // Precisamos buscar o pagamento pra obter o status real.
    const b = body as any;
    const id = b?.data?.id ?? b?.id;
    if (!id) return null;

    // Verificação de assinatura HMAC (x-signature) — opcional via env
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret) {
      const sig = headers.get("x-signature") ?? "";
      const reqId = headers.get("x-request-id") ?? "";
      // formato: ts=...,v1=hex
      const parts = Object.fromEntries(
        sig.split(",").map((p) => p.trim().split("=") as [string, string]),
      );
      const ts = parts["ts"];
      const v1 = parts["v1"];
      if (!ts || !v1) return null;
      const manifest = `id:${id};request-id:${reqId};ts:${ts};`;
      const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
      if (expected !== v1) {
        throw new Error("Assinatura MP inválida");
      }
    }

    const status = await this.getStatus(String(id));
    return { external_charge_id: String(id), status, raw: body };
  },
};

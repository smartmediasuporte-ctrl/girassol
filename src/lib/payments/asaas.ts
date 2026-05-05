// Asaas — PIX
// Doc: https://docs.asaas.com/reference/criar-nova-cobranca
// 2 chamadas: cria payment com billingType=PIX, depois GET /payments/{id}/pixQrCode

import type { PaymentProvider, CreatePixInput, ProviderEvent } from "./types";
import type { PaymentStatus, PixCharge } from "../types";

function apiBase(): string {
  return process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3";
}
function apiKey(): string {
  const k = process.env.ASAAS_API_KEY;
  if (!k) throw new Error("ASAAS_API_KEY ausente");
  return k;
}

function mapAsaasStatus(s: string): PaymentStatus {
  switch (s) {
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return "paid";
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
      return "pending";
    case "REFUNDED":
    case "CHARGEBACK_DISPUTE":
    case "CHARGEBACK_REQUESTED":
      return "refunded";
    case "OVERDUE":
      return "expired";
    case "DELETED":
      return "cancelled";
    default:
      return "pending";
  }
}

async function asaasFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      access_token: apiKey(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Asaas ${path} falhou: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function ensureCustomer(input: CreatePixInput): Promise<string> {
  // Asaas exige customer pré-cadastrado. Cria on-the-fly se cpfCnpj presente.
  if (!input.payer.tax_id) {
    // Sem CPF, criamos um customer "anônimo" só com nome+email
    const c = await asaasFetch("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.payer.name,
        email: input.payer.email ?? `${input.order_id}@girassol.local`,
        mobilePhone: input.payer.phone ?? undefined,
      }),
    });
    return c.id;
  }
  const c = await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.payer.name,
      email: input.payer.email,
      cpfCnpj: input.payer.tax_id.replace(/\D/g, ""),
      mobilePhone: input.payer.phone,
    }),
  });
  return c.id;
}

export const asaasProvider: PaymentProvider = {
  id: "asaas",

  async createPix(input: CreatePixInput): Promise<PixCharge> {
    const customerId = await ensureCustomer(input);
    const expiresMin = input.expires_in_minutes ?? 30;
    const dueDate = new Date(Date.now() + expiresMin * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const payment = await asaasFetch("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: Number((input.amount_cents / 100).toFixed(2)),
        dueDate,
        description: input.description,
        externalReference: input.order_id,
      }),
    });

    const qr = await asaasFetch(`/payments/${payment.id}/pixQrCode`);
    const expires_at = new Date(
      qr.expirationDate ?? Date.now() + expiresMin * 60 * 1000,
    ).toISOString();

    return {
      provider: "asaas",
      charge_id: payment.id,
      qr_code: qr.payload ?? "",
      qr_code_base64: qr.encodedImage ?? "",
      expires_at,
      amount_cents: input.amount_cents,
      status: mapAsaasStatus(payment.status),
    };
  },

  async getStatus(chargeId: string): Promise<PaymentStatus> {
    const json = await asaasFetch(`/payments/${chargeId}`);
    return mapAsaasStatus(json.status);
  },

  async parseWebhook(body: unknown, headers: Headers): Promise<ProviderEvent | null> {
    // Asaas opcionalmente exige header `asaas-access-token` igual ao secret configurado.
    const expected = process.env.ASAAS_WEBHOOK_TOKEN;
    if (expected) {
      const got = headers.get("asaas-access-token");
      if (got !== expected) throw new Error("Token Asaas webhook inválido");
    }
    const b = body as any;
    const id = b?.payment?.id;
    const status = b?.payment?.status;
    if (!id || !status) return null;
    return {
      external_charge_id: String(id),
      status: mapAsaasStatus(status),
      paid_at: b?.payment?.paymentDate ?? undefined,
      raw: body,
    };
  },
};

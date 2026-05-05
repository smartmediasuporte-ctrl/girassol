// Provider "fake" pra dev local sem credenciais reais.
// Gera um PIX copia-e-cola sintético (não funciona em banco real)
// e um QR code PNG base64 mínimo. O webhook é simulado via
// /apiv3/orders/[id]/simulate-paid.

import type { PaymentProvider, CreatePixInput, ProviderEvent } from "./types";
import type { PixCharge, PaymentStatus } from "../types";

// Mapa em memória chargeId -> status (some no restart)
const STATUS_DB = new Map<string, PaymentStatus>();

// 1×1 PNG transparente em base64 (placeholder visual)
const PLACEHOLDER_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function makeFakeBrCode(amountCents: number, orderId: string): string {
  // EMV-ish payload — fake mas com cara de PIX copia-e-cola
  const value = (amountCents / 100).toFixed(2);
  return [
    "00020126",
    `36${"0014BR.GOV.BCB.PIX".padEnd(36, "0")}`,
    "52040000",
    "5303986",
    `54${value.length.toString().padStart(2, "0")}${value}`,
    "5802BR",
    "5909GIRASSOL",
    "6008BRASILIA",
    `62${("05" + orderId.length.toString().padStart(2, "0") + orderId).length
      .toString()
      .padStart(2, "0")}05${orderId.length.toString().padStart(2, "0")}${orderId}`,
    "6304ABCD",
  ].join("");
}

export const fakeProvider: PaymentProvider = {
  id: "fake",

  async createPix(input: CreatePixInput): Promise<PixCharge> {
    const charge_id = "fake_" + Math.random().toString(36).slice(2, 12);
    const expires = new Date(
      Date.now() + (input.expires_in_minutes ?? 30) * 60 * 1000,
    ).toISOString();
    STATUS_DB.set(charge_id, "pending");
    return {
      provider: "fake",
      charge_id,
      qr_code: makeFakeBrCode(input.amount_cents, input.order_id),
      qr_code_base64: PLACEHOLDER_PNG_B64,
      expires_at: expires,
      amount_cents: input.amount_cents,
      status: "pending",
    };
  },

  async getStatus(chargeId: string): Promise<PaymentStatus> {
    return STATUS_DB.get(chargeId) ?? "pending";
  },

  async parseWebhook(): Promise<ProviderEvent | null> {
    // Fake provider não recebe webhook externo — manipulação é via simulate-paid.
    return null;
  },
};

// Helper interno usado pelo endpoint simulate-paid
export function _fakeMarkPaid(chargeId: string) {
  STATUS_DB.set(chargeId, "paid");
}

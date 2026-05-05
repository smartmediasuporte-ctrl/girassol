import type { PaymentStatus, PixCharge } from "../types";

export type CreatePixInput = {
  order_id: string;
  amount_cents: number;
  description: string;
  payer: {
    name: string;
    email?: string;
    phone?: string;
    tax_id?: string; // CPF/CNPJ — alguns providers exigem
  };
  expires_in_minutes?: number; // default 30
};

export type ProviderEvent = {
  external_charge_id: string;
  status: PaymentStatus;
  paid_at?: string;
  raw: unknown;
};

export interface PaymentProvider {
  readonly id: "mercadopago" | "asaas" | "fake";
  createPix(input: CreatePixInput): Promise<PixCharge>;
  getStatus(chargeId: string): Promise<PaymentStatus>;
  parseWebhook(body: unknown, headers: Headers): Promise<ProviderEvent | null>;
}

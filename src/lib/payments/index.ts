import type { PaymentProvider } from "./types";
import { fakeProvider } from "./fake";
import { mercadoPagoProvider } from "./mercadopago";
import { asaasProvider } from "./asaas";

export type ProviderId = "mercadopago" | "asaas" | "fake";

export function getProvider(id?: ProviderId): PaymentProvider {
  const which =
    id ?? (process.env.PAYMENT_PROVIDER as ProviderId | undefined) ?? "fake";
  switch (which) {
    case "mercadopago":
      return mercadoPagoProvider;
    case "asaas":
      return asaasProvider;
    case "fake":
    default:
      return fakeProvider;
  }
}

export { fakeProvider, mercadoPagoProvider, asaasProvider };
export type { PaymentProvider, CreatePixInput, ProviderEvent } from "./types";

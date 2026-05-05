export type Store = {
  id: string;
  subdomain: string;
  custom_domain?: string | null;
  name: string;
  slogan: string;
  logo_url: string;
  banner_url: string;
  primary_color: string;
  whatsapp: string;
  address: string;
  delivery_fee_cents: number;
  min_order_cents: number;
  open: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  price_cents: number;
  list_price_cents: number | null;
  category: string;
  unit: string;
  stock: number;
};

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  image_url: string;
  price_cents: number;
  qty: number;
};

export type OrderInput = {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  delivery: {
    address: string;
    notes?: string;
  };
  payment_method: "pix" | "card" | "cash";
  items: { product_id: string; qty: number }[];
};

export type PaymentStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "refunded";

export type PixCharge = {
  provider: "mercadopago" | "asaas" | "fake";
  charge_id: string;
  qr_code: string; // copia-e-cola (BR Code / EMV)
  qr_code_base64: string; // PNG base64 sem prefixo data:
  expires_at: string; // ISO
  amount_cents: number;
  status: PaymentStatus;
};

// No pedido salvo, items vêm enriquecidos com snapshot do produto
// (nome + preço no momento da compra, mesmo que o produto seja editado/excluído depois).
export type OrderItemSnapshot = {
  product_id: string;
  name: string;
  price_cents: number;
  qty: number;
  line_total_cents: number;
};

export type Order = Omit<OrderInput, "items"> & {
  id: string;
  store_subdomain: string;
  items: OrderItemSnapshot[];
  subtotal_cents: number;
  total_cents: number;
  delivery_fee_cents: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  payment_status: PaymentStatus;
  pix?: PixCharge;
  created_at: string;
  updated_at: string;
};

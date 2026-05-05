import type { Store } from "@/lib/types";

export function Footer({ store }: { store: Store | null }) {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-black/60">
        <div className="font-semibold text-black">{store?.name}</div>
        <div>{store?.address}</div>
        {store?.whatsapp && (
          <div>
            WhatsApp:{" "}
            <a
              href={`https://wa.me/${store.whatsapp}`}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              +{store.whatsapp}
            </a>
          </div>
        )}
        <div className="mt-4 text-xs text-black/40">
          © {new Date().getFullYear()} — Storefront multi-tenant
        </div>
      </div>
    </footer>
  );
}

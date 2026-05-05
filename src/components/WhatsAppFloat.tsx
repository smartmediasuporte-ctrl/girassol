import { whatsappLink } from "@/lib/format";

export function WhatsAppFloat({ phone }: { phone: string }) {
  return (
    <a
      href={whatsappLink(phone, "Olá! Vim pelo site do Girassol.")}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp do Girassol"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-leaf-500 text-white shadow-lg shadow-leaf-500/30 transition hover:scale-105 hover:bg-leaf-600"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
        <path d="M17.6 6.32A7.5 7.5 0 0 0 4.6 14a7.4 7.4 0 0 0 1 3.7L4.5 21.5l3.95-1.04A7.5 7.5 0 1 0 17.6 6.32Zm-5.6 12.4a6.2 6.2 0 0 1-3.16-.86l-.23-.13-2.34.62.62-2.28-.15-.24A6.2 6.2 0 1 1 12 18.72Zm3.4-4.65c-.18-.1-1.1-.55-1.27-.6-.17-.07-.3-.1-.43.1-.13.18-.5.6-.6.74-.12.13-.23.15-.42.05-.18-.1-.78-.3-1.5-.92-.55-.5-.93-1.1-1.04-1.28-.1-.18-.01-.27.08-.36.08-.08.18-.21.27-.32.08-.1.12-.18.18-.3a.34.34 0 0 0-.02-.32c-.05-.1-.43-1.04-.6-1.42-.16-.36-.32-.32-.43-.32-.11 0-.24-.01-.37-.01a.7.7 0 0 0-.51.24c-.18.18-.66.65-.66 1.58 0 .94.68 1.84.78 1.97.1.13 1.34 2.05 3.25 2.87.45.2.8.31 1.07.4.45.14.86.12 1.18.07.36-.05 1.1-.45 1.26-.89.16-.43.16-.8.11-.88-.05-.08-.18-.13-.36-.22Z" />
      </svg>
    </a>
  );
}

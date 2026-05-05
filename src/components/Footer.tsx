import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { Logo } from "./Logo";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-24 bg-leaf-700 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-cream-50">
            <Logo size="md" href={null} />
          </div>
          <p className="mt-4 max-w-md text-sm text-cream-200/80">
            {settings.tagline}
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg text-cream-50">Visite</h3>
          <p className="mt-2 text-sm text-cream-200/80">{settings.addressLine}</p>
          <p className="mt-3 text-xs text-cream-200/70">{settings.hoursWeek}</p>
          <p className="text-xs text-cream-200/70">{settings.hoursWeekend}</p>
        </div>

        <div>
          <h3 className="font-display text-lg text-cream-50">Contato</h3>
          <p className="mt-2 text-sm">{settings.phone}</p>
          {settings.email && (
            <p className="text-sm text-cream-200/80">{settings.email}</p>
          )}
          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-sun-200 hover:text-sun-100"
            >
              @{settings.instagram}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-leaf-600/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-cream-200/60">
          <div>© {new Date().getFullYear()} {settings.siteName}. Todos os direitos reservados.</div>
          <div className="flex gap-4">
            <Link href="/cardapio" className="hover:text-cream-50">Cardápio</Link>
            <Link href="/historia" className="hover:text-cream-50">História</Link>
            <Link href="/visite" className="hover:text-cream-50">Visite</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

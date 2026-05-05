import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/historia", label: "Nossa história" },
  { href: "/comunidade", label: "Comunidade" },
  { href: "/visite", label: "Visite" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Logo size="sm" />
        <nav className="ml-auto hidden items-center gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="font-medium text-ink-700 transition hover:text-sun-600"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/visite"
          className="hidden rounded-full bg-sun-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sun-600 md:inline-block"
        >
          Visite a casa
        </Link>
      </div>
    </header>
  );
}

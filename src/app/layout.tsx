import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.siteName, template: `%s · ${s.siteName}` },
    description: s.seoDescription,
    openGraph: {
      title: s.siteName,
      description: s.seoDescription,
      type: "website",
      locale: "pt_BR",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="pt-BR">
      <body className="bg-cream-50 bg-leafy-pattern text-ink-900">
        <Header />
        <main>{children}</main>
        <Footer settings={settings} />
        <WhatsAppFloat phone={settings.whatsapp} />
      </body>
    </html>
  );
}

import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/format";

export const metadata = {
  title: "Visite",
  description:
    "Onde estamos, horários e contato do Restaurante Girassol em Brasília.",
};

export default async function VisitePage() {
  const s = await getSettings();
  const mapSrc =
    s.mapEmbedUrl ??
    `https://www.google.com/maps?q=${encodeURIComponent(
      "Restaurante Girassol Asa Sul Brasília",
    )}&output=embed`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-sun-600">Visite</p>
        <h1 className="mt-2 font-display text-5xl text-ink-900">Vem dar um pulo</h1>
        <p className="mt-3 text-ink-700">
          Estamos esperando você na Asa Sul. Sem hora marcada — entre, sente, respire.
        </p>
      </header>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Bloco de info */}
        <div className="space-y-6">
          <Block title="Endereço" icon="📍">
            <p>{s.addressLine}</p>
          </Block>

          <Block title="Horários" icon="🕐">
            <p>{s.hoursWeek}</p>
            <p className="mt-1">{s.hoursWeekend}</p>
          </Block>

          <Block title="Contato" icon="📞">
            <p>
              <a
                href={`tel:${s.phone.replace(/\D/g, "")}`}
                className="hover:text-sun-600"
              >
                {s.phone}
              </a>
            </p>
            {s.email && (
              <p className="mt-1">
                <a href={`mailto:${s.email}`} className="hover:text-sun-600">
                  {s.email}
                </a>
              </p>
            )}
            {s.instagram && (
              <p className="mt-1">
                <a
                  href={`https://instagram.com/${s.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-leaf-700 hover:text-leaf-800"
                >
                  @{s.instagram}
                </a>
              </p>
            )}
          </Block>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(s.whatsapp, "Olá! Gostaria de fazer uma reserva.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-sun-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-sun-600"
            >
              💬 Reservar pelo WhatsApp
            </a>
            <a
              href={whatsappLink(s.whatsapp, "Olá! Gostaria de fazer um pedido.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-leaf-500 px-6 py-3 text-sm font-semibold text-leaf-700 hover:bg-leaf-500 hover:text-white"
            >
              Pedir delivery
            </a>
          </div>
        </div>

        {/* Mapa */}
        <div className="overflow-hidden rounded-3xl bg-cream-200 shadow-sm ring-1 ring-cream-300/60">
          <iframe
            src={mapSrc}
            title="Mapa Restaurante Girassol"
            className="h-full min-h-[400px] w-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

function Block({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-cream-200/60">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sun-600">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-ink-700">{children}</div>
    </div>
  );
}

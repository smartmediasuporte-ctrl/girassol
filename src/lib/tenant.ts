// Replica a lógica observada no debug:
// - subdomain extraído do Host
// - custom_domain quando o host não casa com o domínio raiz da plataforma
// - host raw também é enviado pra API (compat com proxy)

export type Tenant = {
  subdomain: string | null;
  custom_domain: string | null;
  host: string;
};

const PLATFORM_ROOT_DOMAINS = [
  "girassol.local",
  "girassol.com.br",
  "localhost",
];

// Domínios "neutros" da plataforma que NÃO carregam tenant via subdomínio.
// Em URLs *.vercel.app o subdomínio é o nome do projeto, não do lojista.
const NEUTRAL_PLATFORM_DOMAINS = ["vercel.app"];

export function deriveTenant(rawHost: string | null | undefined): Tenant {
  const host = (rawHost ?? "").toLowerCase().split(":")[0].trim();
  if (!host) return { subdomain: null, custom_domain: null, host: "" };

  // Hosts neutros: nunca extraem subdomínio (tenant vem por override)
  if (NEUTRAL_PLATFORM_DOMAINS.some((d) => host === d || host.endsWith("." + d))) {
    return { subdomain: null, custom_domain: null, host };
  }

  // Verifica se o host termina em algum dos domínios raiz da plataforma
  const rootHit = PLATFORM_ROOT_DOMAINS.find(
    (root) => host === root || host.endsWith("." + root),
  );

  if (rootHit) {
    if (host === rootHit) {
      return { subdomain: null, custom_domain: null, host };
    }
    const sub = host.slice(0, -1 * (rootHit.length + 1));
    if (sub === "www") return { subdomain: null, custom_domain: null, host };
    return { subdomain: sub, custom_domain: null, host };
  }

  // Host não está sob domínio raiz → custom domain do lojista
  return { subdomain: null, custom_domain: host, host };
}

// NOTA: getTenantFromRequest mora em src/lib/tenant-server.ts
// (este arquivo precisa ser pure pra rodar em Edge runtime do middleware,
// e next/headers só pode ser usado em Server Components/Actions/Route Handlers).

export function tenantQueryParams(t: Tenant): URLSearchParams {
  const qp = new URLSearchParams();
  qp.set("subdomain", t.subdomain ?? "NULL");
  qp.set("custom_domain", t.custom_domain ?? "NULL");
  return qp;
}

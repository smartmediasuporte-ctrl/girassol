import { headers } from "next/headers";
import { deriveTenant, getTenantFromRequest, tenantQueryParams } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const BUILD_MARKER = "v2-vercel-url-fix";

async function probe(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {}
    return { status: res.status, statusText: res.statusText, body: parsed ?? text };
  } catch (err: any) {
    return { status: 0, statusText: err?.message ?? String(err), body: null };
  }
}

export default async function DebugPage() {
  const h = headers();
  const allHeaders: Record<string, string> = {};
  h.forEach((v, k) => (allHeaders[k] = v));

  const rawHost = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const tenantFromHost = deriveTenant(rawHost);
  const tenantResolved = getTenantFromRequest(); // após middleware (query/cookie/env)
  const tenant = tenantResolved; // usar o resolvido pra montar URL real
  const qp = tenantQueryParams(tenant);

  const apiBase = process.env.API_URL_INTERNAL ?? "http://localhost:3000";
  const urlWithout = `${apiBase}/apiv3/store?${qp.toString()}`;
  const urlWithHost = `${urlWithout}&host=${encodeURIComponent(tenant.host)}`;

  const [respA, respB] = await Promise.all([probe(urlWithout), probe(urlWithHost)]);

  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
    API_URL_INTERNAL: process.env.API_URL_INTERNAL ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "",
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <h1 className="font-sans text-2xl font-bold">Informações de Debug</h1>

      <Section title={`Build marker: ${BUILD_MARKER}`}>{new Date().toISOString()}</Section>

      <Section title="Host Header">{rawHost}</Section>

      <Section title="Derived Tenant (from host)">
        <Pre>{JSON.stringify({ subdomain: tenantFromHost.subdomain ?? "NULL", custom_domain: tenantFromHost.custom_domain ?? "NULL" }, null, 2)}</Pre>
      </Section>

      <Section title="Tenant resolved by MIDDLEWARE (query/cookie/env)">
        <Pre>{JSON.stringify({ subdomain: tenantResolved.subdomain ?? "NULL", custom_domain: tenantResolved.custom_domain ?? "NULL", host: tenantResolved.host }, null, 2)}</Pre>
      </Section>

      <Section title="Query Params (sent to API)">
        <Pre>{JSON.stringify(Object.fromEntries(qp), null, 2)}</Pre>
      </Section>

      <Section title="API Base URL">{apiBase}</Section>

      <Section title="URL sem host param (deriveTenant correto)">{urlWithout}</Section>

      <Section title="URL real do http.ts (com host RAW)">{urlWithHost}</Section>

      <Section title="Environment Variables">
        <Pre>{JSON.stringify(env, null, 2)}</Pre>
      </Section>

      <Section title="API Response SEM host param">
        <Pre>{JSON.stringify({ status: respA.status, statusText: respA.statusText }, null, 2)}</Pre>
      </Section>

      <Section title="Response Body (sem host)">
        <Pre>{typeof respA.body === "string" ? respA.body : JSON.stringify(respA.body)}</Pre>
      </Section>

      <Section title="API Response COM host param (o que http.ts envia)">
        <Pre>{JSON.stringify({ status: respB.status, statusText: respB.statusText }, null, 2)}</Pre>
      </Section>

      <Section title="Response Body (com host)">
        <Pre>{typeof respB.body === "string" ? respB.body : JSON.stringify(respB.body)}</Pre>
      </Section>

      <Section title="All Request Headers">
        <Pre>{JSON.stringify(allHeaders, null, 2)}</Pre>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-sans text-sm font-semibold">{title}</div>
      <div className="mt-1 break-all rounded-lg border border-black/10 bg-white p-3">
        {children}
      </div>
    </div>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return <pre className="whitespace-pre-wrap">{children}</pre>;
}

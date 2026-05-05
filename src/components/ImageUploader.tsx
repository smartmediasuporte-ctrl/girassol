"use client";

import { useRef, useState } from "react";

type Props = {
  name: string; // nome do hidden input que vai pro form
  defaultValue?: string; // URL inicial (ex: produto sendo editado)
  label?: string;
  placeholder?: string; // imagem mostrada quando não há valor
  aspect?: "square" | "wide"; // square = 1:1 (produto), wide = 4:1 (banner)
};

export function ImageUploader({
  name,
  defaultValue,
  label,
  placeholder = "/product-placeholder.svg",
  aspect = "square",
}: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/apiv3/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? `Falha (${res.status})`);
      } else {
        setUrl(json.url);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = ""; // permite re-selecionar mesmo arquivo
    }
  }

  const aspectClass = aspect === "wide" ? "aspect-[4/1]" : "aspect-square";

  return (
    <div>
      {label && <div className="mb-1 text-sm font-medium text-black/70">{label}</div>}
      <div
        className={`relative overflow-hidden rounded-lg border border-black/10 bg-neutral-50 ${aspectClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url || placeholder}
          alt=""
          className="h-full w-full object-cover"
        />
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-medium text-white">
            Enviando…
          </div>
        )}
      </div>

      <input type="hidden" name={name} value={url} />

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {url ? "Trocar imagem" : "Enviar imagem"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-xs text-red-600 hover:underline"
          >
            remover
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={onPick}
          className="hidden"
        />
      </div>

      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
      {url && (
        <div className="mt-1 truncate text-xs text-black/40">URL: {url}</div>
      )}
    </div>
  );
}

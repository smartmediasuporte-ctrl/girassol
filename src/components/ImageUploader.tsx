"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  aspect?: "square" | "wide" | "auto";
  folder?: string;
};

export function ImageUploader({
  name,
  defaultValue,
  label,
  placeholder,
  aspect = "square",
  folder,
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
      if (folder) fd.append("folder", folder);
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
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const aspectClass =
    aspect === "wide" ? "aspect-[4/1]" : aspect === "auto" ? "" : "aspect-square";

  return (
    <div>
      {label && <div className="mb-1 text-sm font-medium text-ink-700">{label}</div>}
      <div
        className={`relative overflow-hidden rounded-xl border border-cream-300 bg-cream-100 ${aspectClass}`}
      >
        {url || placeholder ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url || placeholder!}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-500">
            sem imagem
          </div>
        )}
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
          className="rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50"
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
    </div>
  );
}

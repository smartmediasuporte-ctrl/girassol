const LABELS: Record<string, string> = {
  vegan: "Vegano",
  vegetarian: "Vegetariano",
  gluten_free: "Sem glúten",
  lactose_free: "Sem lactose",
  sugar_free: "Sem açúcar",
  raw: "Cru / Raw",
};

const COLORS: Record<string, string> = {
  vegan: "bg-leaf-100 text-leaf-700 ring-leaf-200",
  vegetarian: "bg-leaf-50 text-leaf-700 ring-leaf-200",
  gluten_free: "bg-sun-50 text-sun-700 ring-sun-200",
  lactose_free: "bg-cream-200 text-ink-700 ring-cream-300",
  sugar_free: "bg-cream-100 text-ink-700 ring-cream-300",
  raw: "bg-leaf-50 text-leaf-700 ring-leaf-200",
};

export function TagBadge({ tag }: { tag: string }) {
  const label = LABELS[tag] ?? tag;
  const color = COLORS[tag] ?? "bg-cream-200 text-ink-700 ring-cream-300";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${color}`}
    >
      {label}
    </span>
  );
}

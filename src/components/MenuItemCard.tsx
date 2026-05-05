import type { MenuItemDTO } from "@/lib/repos";
import { formatBRL } from "@/lib/format";
import { TagBadge } from "./TagBadge";

export function MenuItemCard({ item, dense = false }: { item: MenuItemDTO; dense?: boolean }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream-200/60 transition hover:shadow-md">
      {item.imageUrl && (
        <div className={`overflow-hidden ${dense ? "aspect-[4/3]" : "aspect-square"} bg-cream-100`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight text-ink-900">{item.name}</h3>
          <div className="font-display text-lg font-semibold text-sun-600">
            {formatBRL(item.priceCents)}
          </div>
        </div>
        <p className="text-sm text-ink-500">{item.description}</p>
        {item.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

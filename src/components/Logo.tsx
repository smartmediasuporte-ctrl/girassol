import Link from "next/link";

export function Logo({
  size = "md",
  showTagline = true,
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string | null;
}) {
  const sizes = {
    sm: { icon: 28, text: "text-2xl", tag: "text-[10px]" },
    md: { icon: 40, text: "text-3xl", tag: "text-[11px]" },
    lg: { icon: 64, text: "text-5xl", tag: "text-sm" },
  } as const;
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2 text-sun-500">
      <svg viewBox="0 0 200 200" width={s.icon} height={s.icon} aria-hidden>
        <use href="/logo.svg#root" />
        <g transform="translate(100,100)" fill="currentColor">
          <g>
            {Array.from({ length: 16 }).map((_, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-55"
                rx="10"
                ry="28"
                transform={`rotate(${i * 22.5})`}
              />
            ))}
          </g>
          <circle cx="0" cy="0" r="32" />
          <circle cx="0" cy="0" r="26" fill="#fff" opacity="0.18" />
        </g>
      </svg>
      <div className="leading-none">
        <div className={`font-script text-sun-500 ${s.text}`}>Girassol</div>
        {showTagline && (
          <div
            className={`mt-0.5 tracking-[0.25em] uppercase font-medium text-sun-600 ${s.tag}`}
          >
            Alimentação Saudável
          </div>
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

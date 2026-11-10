// Larkspur is a made-up product used only to demonstrate the design system.
// Its mark is a flower spike: sea blooms climbing to one coral bud, on slate.

type MarkProps = { size?: number; className?: string; title?: string };

export function LarkspurMark({ size = 28, className, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="8" fill="var(--slate)" />
      <circle cx="15.5" cy="24" r="5" fill="var(--sea)" />
      <circle cx="12" cy="15.8" r="3.9" fill="var(--sea)" />
      <circle cx="19.2" cy="10.6" r="3" fill="var(--sea)" />
      <circle cx="14.2" cy="5.8" r="2.2" fill="var(--coral)" />
    </svg>
  );
}

export function LarkspurWordmark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, letterSpacing: "-0.01em" }}
    >
      <LarkspurMark size={size} />
      <span>Larkspur</span>
    </span>
  );
}

import type { ReactNode } from "react";

/** A family of components on the specimen page. */
export function SpecimenGroup({ id, title, intro, min = 420, children }: { id: string; title: string; intro: string; min?: number; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id + "-title"} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 id={id + "-title"} className="text-[18px] font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="max-w-[68ch] text-muted-foreground">{intro}</p>
      </header>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}>{children}</div>
    </section>
  );
}

/** One component: its name, a line on when to use it and how it moves, and live examples. */
export function SpecimenItem({ name, note, wide, children }: { name: string; note: string; wide?: boolean; children: ReactNode }) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <article data-specimen={slug} className={"flex flex-col gap-4 rounded-lg border bg-card p-5" + (wide ? " col-span-full" : "")}>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[14px] font-semibold">{name}</h3>
        <p className="text-[13px] text-muted-foreground">{note}</p>
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </article>
  );
}

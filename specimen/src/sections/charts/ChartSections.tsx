import type { ComponentType } from "react";
import { SpecimenGroup } from "../../frame";

export type ChartSection = {
  /** A short name for what the charts in this subsection have in common. */
  title: string;
  /** One sentence on what the subsection shows. */
  intro: string;
  charts: ComponentType[];
};

/** One chart type, split into subsections of related charts. Each subsection is a grid of cards. */
export function ChartSections({ group, sections }: { group: string; sections: ChartSection[] }) {
  return (
    <>
      {sections.map((section) => {
        const id = `charts-${group}-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        return (
          <SpecimenGroup key={id} id={id} title={section.title} intro={section.intro} min={340}>
            {section.charts.map((Chart, index) => (
              <Chart key={index} />
            ))}
          </SpecimenGroup>
        );
      })}
    </>
  );
}

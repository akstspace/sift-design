import { useId, useState } from "react";
import { IconAlertTriangle, IconLayoutColumns, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@sift-design/ui/meter";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "@sift-design/ui/segmented-control";
import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@sift-design/ui/timeline";

// Meter, segmented control and timeline are built on ui-sdk parts. See docs/ui-sdk.md.

const STORAGE = 25;
const SEATS = 10;

export function MeterDemo() {
  const [photos, setPhotos] = useState(18.4);
  const [seats, setSeats] = useState(7);
  const almostFull = photos / STORAGE >= 0.9;
  return (
    <div className="flex w-full flex-col gap-5">
      <Meter value={photos} max={STORAGE} format={(value) => `${value.toFixed(1)} of ${STORAGE} GB`}>
        <MeterLabel>Photo storage</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator className={almostFull ? "bg-warn" : undefined} />
        </MeterTrack>
      </Meter>
      <Meter value={seats} max={SEATS} format={(value) => `${value} of ${SEATS} seats`}>
        <MeterLabel>Team seats</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <p className="flex min-h-5 items-center gap-1.5 text-[12px] text-muted-foreground" aria-live="polite">
        {almostFull && (
          <>
            <IconAlertTriangle aria-hidden size={14} className="shrink-0 text-warn" />
            Storage is almost full. Archive last season’s photos to free space.
          </>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setPhotos((value) => Math.min(STORAGE, value + 2.6))}>
          Upload bench photos
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPhotos((value) => Math.max(4, value - 7.8))}>
          Archive last season
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setSeats((value) => (value >= SEATS ? 5 : value + 1))}>
          {seats >= SEATS ? "Remove 5 seats" : "Invite one person"}
        </Button>
      </div>
    </div>
  );
}

const views = [
  { value: "list", label: "List", Icon: IconLayoutList },
  { value: "grid", label: "Grid", Icon: IconLayoutGrid },
  { value: "board", label: "Board", Icon: IconLayoutColumns },
] as const;

export function SegmentedControlDemo() {
  const labelId = useId();
  const [view, setView] = useState<string | null>("list");
  const [unit, setUnit] = useState<string | null>("c");
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span id={labelId} className="text-[13px] font-medium">
          Show seed trays as
        </span>
        <SegmentedControl aria-labelledby={labelId} value={view} onValueChange={setView}>
          <SegmentedControlIndicator />
          {views.map(({ value, label, Icon }) => (
            <SegmentedControlItem key={value} value={value}>
              <Icon aria-hidden />
              {label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <SegmentedControl aria-label="Temperature unit" value={unit} onValueChange={setUnit}>
        <SegmentedControlIndicator />
        <SegmentedControlItem value="c">°C</SegmentedControlItem>
        <SegmentedControlItem value="f">°F</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-[12px] text-muted-foreground">
        24 trays as a {view ?? "list"}. Propagation house at {unit === "f" ? "84°F" : "29°C"}.
      </p>
    </div>
  );
}

const steps = [
  {
    title: "Ordered",
    dateTime: "2026-11-10T09:20",
    time: "10 Nov 09:20",
    description: "Jane Doe ordered 40 trays of basil plugs.",
  },
  {
    title: "Packed",
    dateTime: "2026-11-11T16:05",
    time: "11 Nov 16:05",
    description: "The nursery packed four crates.",
  },
  {
    title: "On the van",
    dateTime: "2026-11-12T07:40",
    time: "12 Nov 07:40",
    description: "John Smith is driving the morning route.",
  },
  {
    title: "Delivered",
    dateTime: "2026-11-12T11:00",
    time: "12 Nov 11:00",
    description: "Sign for the crates at the propagation house.",
  },
];

export function TimelineDemo() {
  const [done, setDone] = useState(2);
  const [orientation, setOrientation] = useState<string | null>("vertical");
  const status = (index: number) => (index < done ? "complete" : index === done ? "current" : "upcoming");
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={done >= steps.length} onClick={() => setDone((n) => n + 1)}>
          Mark the next step done
        </Button>
        <Button size="sm" variant="ghost" disabled={done === 0} onClick={() => setDone((n) => n - 1)}>
          Undo
        </Button>
        <SegmentedControl aria-label="Layout" value={orientation} onValueChange={setOrientation} className="ml-auto">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="vertical">Vertical</SegmentedControlItem>
          <SegmentedControlItem value="horizontal">Horizontal</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <Timeline
        aria-label="Basil plug delivery"
        orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
        className="max-w-[560px]"
      >
        {steps.map((step, index) => (
          <TimelineItem key={step.title} value={step.title} status={status(index)}>
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle>{step.title}</TimelineTitle>
            <TimelineTime dateTime={step.dateTime}>{step.time}</TimelineTime>
            <TimelineDescription>{step.description}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

export const CATEGORIES = [
  "Growing",
  "Inspection",
  "Meetings and calls",
  "Messages",
  "Admin",
  "Research",
  "Writing",
  "Other",
] as const;
export const TODAY = "2026-11-10";
export const TASKS = [
  { id: "FG-142", title: "Pot on 120 lavender plugs", area: "Propagation house" },
  { id: "FG-138", title: "Aphids on the pepper starts, bench 4", area: "Polytunnel 2" },
  { id: "FG-147", title: "Reply to Hollins Florist about the 40-tray order", area: "Wholesale orders" },
  { id: "FG-133", title: "Order 2,000 9cm pots", area: "Maintenance" },
  { id: "FG-144", title: "Sow the second batch of sweet peas", area: "Propagation house" },
  { id: "FG-140", title: "Restock the herb bench before Saturday", area: "Retail benches" },
  { id: "FG-145", title: "Prepare Saturday market crates", area: "Retail benches" },
];
export type Session = {
  id: string;
  day: string;
  from: number;
  to: number;
  category: number;
  title: string;
  task: string;
  source: string;
};
export const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
export const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export function duration(value: number) {
  const h = Math.floor(value / 60),
    m = Math.round(value % 60);
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}
export const color = (category: number) => `var(--cat-${category + 1})`;
export function addDays(day: string, offset: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
export function weekDays(day: string) {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const start = addDays(day, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
export function dayLabel(
  day: string,
  options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" },
) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "Europe/London" }).format(
    new Date(`${day}T12:00:00Z`),
  );
}
export function elapsed(sessions: Session[]): number {
  const days = [...new Set(sessions.map((s) => s.day))];
  if (days.length > 1) return days.reduce((sum, day) => sum + elapsed(sessions.filter((s) => s.day === day)), 0);
  const spans = sessions.map((s) => [s.from, s.to]).sort((a, b) => a[0] - b[0]);
  let total = 0,
    end = 0;
  for (const [from, to] of spans) {
    total += Math.max(0, to - Math.max(from, end));
    end = Math.max(end, to);
  }
  return total;
}
const today: Omit<Session, "day" | "id">[] = [
  {
    from: 450,
    to: 520,
    category: 0,
    title: "Potted on the first 60 lavender plugs",
    task: "FG-142",
    source: "Activity tracker",
  },
  {
    from: 525,
    to: 550,
    category: 1,
    title: "Checked pepper starts for aphids",
    task: "FG-138",
    source: "Activity tracker",
  },
  { from: 550, to: 570, category: 2, title: "Morning handover with John", task: "", source: "Added by you" },
  {
    from: 575,
    to: 600,
    category: 3,
    title: "Confirmed the florist’s tray quantities",
    task: "FG-147",
    source: "Activity tracker",
  },
  {
    from: 600,
    to: 625,
    category: 4,
    title: "Reconciled the pot supplier invoice",
    task: "FG-133",
    source: "Activity tracker",
  },
  {
    from: 640,
    to: 670,
    category: 5,
    title: "Compared sweet pea germination notes",
    task: "FG-144",
    source: "Activity tracker",
  },
  {
    from: 675,
    to: 705,
    category: 6,
    title: "Wrote herb care cards for the market",
    task: "FG-140",
    source: "Added by you",
  },
  {
    from: 705,
    to: 720,
    category: 7,
    title: "Sorted the empty market crates",
    task: "FG-145",
    source: "Activity tracker",
  },
  {
    from: 765,
    to: 840,
    category: 0,
    title: "Finished potting the lavender plugs",
    task: "FG-142",
    source: "Activity tracker",
  },
  {
    from: 840,
    to: 860,
    category: 1,
    title: "Checked the treated leaves on bench 4",
    task: "FG-138",
    source: "Activity tracker",
  },
];
export const INITIAL_SESSIONS: Session[] = [
  ...today.map((s, i) => ({ ...s, id: `today-${i}`, day: TODAY })),
  ...Array.from({ length: 8 }, (_, d) => {
    const day = addDays(TODAY, -d - 1);
    if (day === "2026-11-08") return [];
    return today
      .filter((_, i) => i < (d === 0 ? 8 : 5 + (d % 4)))
      .map((s, i) => ({
        ...s,
        id: `${day}-${i}`,
        day,
        from: s.from + (d % 3) * 10,
        to: s.to + (d % 3) * 10 + (i === 0 ? (d % 3) * 20 : 0),
      }));
  }).flat(),
];

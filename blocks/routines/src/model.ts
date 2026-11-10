export type ScheduleKind = "daily" | "weekdays" | "interval" | "cron";
export type Schedule = {
  kind: ScheduleKind;
  times: string[];
  days: number[];
  amount: string;
  unit: "minutes" | "hours";
  cron: string;
};
export type HelperState = "running" | "scheduled" | "auto-paused" | "paused" | "failed" | "action";
export type Helper = {
  id: string;
  name: string;
  instructions: string;
  area: string;
  source: string;
  state: HelperState;
  schedule: Schedule;
  reason?: string;
};
export type Run = {
  id: string;
  helperId: string;
  name: string;
  status: "running" | "completed" | "failed" | "cancelled";
  start: string;
  duration: number;
  batches: number;
  tasks: string[];
};
export const TODAY = new Date("2026-11-10T10:00:00Z");
export const ZONE = "Europe/London";
export const AREAS = ["Propagation house", "Polytunnel 2", "Retail benches", "Wholesale orders", "Maintenance"];
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const defaultSchedule: Schedule = {
  kind: "daily",
  times: ["07:00"],
  days: [1, 2, 3, 4, 5],
  amount: "30",
  unit: "minutes",
  cron: "0 7,13 * * 1-5",
};
const schedule = (value: Partial<Schedule>) => ({ ...defaultSchedule, ...value });
export const helpers: Helper[] = [
  {
    id: "order-sweep",
    name: "Order sweep",
    area: "Wholesale orders",
    source: "Orders inbox",
    state: "running",
    schedule: schedule({ kind: "weekdays", times: ["07:00", "13:00"] }),
    instructions:
      "Read new orders in the orders inbox. File a task for each order, and update existing tasks when a florist changes quantities. Keep the original message attached.",
  },
  {
    id: "market-prep",
    name: "Market prep",
    area: "Retail benches",
    source: "Saturday order list",
    state: "scheduled",
    schedule: schedule({ kind: "weekdays", days: [5], times: ["16:00"] }),
    instructions: "Read the Saturday order list and prepare a checklist for crates, price cards, and the card reader.",
  },
  {
    id: "climate-watch",
    name: "Climate watch",
    area: "Propagation house",
    source: "Sensor hub",
    state: "auto-paused",
    schedule: schedule({ kind: "cron", cron: "*/30 6-19 * * *" }),
    instructions:
      "Check the greenhouse sensor hub. File a task when temperature or humidity needs attention. Include the reading, the time, and a practical next step.",
    reason: "The sensor hub didn’t answer three times in a row. Resume when the hub is back.",
  },
  {
    id: "stock-count",
    name: "Stock count",
    area: "Retail benches",
    source: "Bench inventory",
    state: "paused",
    schedule: schedule({ kind: "weekdays", days: [1], times: ["06:30"] }),
    instructions:
      "Read the bench inventory sheet. File a low-stock task for anything with fewer than seven days of supply.",
    reason: "Jane paused this helper on 9 Nov while the bench inventory is being counted.",
  },
  {
    id: "irrigation-check",
    name: "Irrigation check",
    area: "Polytunnel 2",
    source: "Moisture readings",
    state: "failed",
    schedule: schedule({ kind: "interval", amount: "2", unit: "hours" }),
    instructions:
      "Read soil-moisture readings in Polytunnel 2. Flag dry benches and include the latest probe readings.",
    reason: "The 08:00 run couldn’t read probe 3. The schedule is still on; it will try again at 12:00.",
  },
  {
    id: "delivery-notes",
    name: "Delivery notes",
    area: "Wholesale orders",
    source: "Delivery ledger",
    state: "action",
    schedule: schedule({ times: ["15:00"] }),
    instructions:
      "Read the delivery ledger. File a packing task for tomorrow’s deliveries, with addresses and quantities.",
    reason: "Your delivery ledger sign-in expired. Sign in again before this helper can run.",
  },
];
export const initialRuns: Run[] = [
  {
    id: "run-106",
    helperId: "order-sweep",
    name: "Order sweep",
    status: "running",
    start: "10 Nov, 09:59",
    duration: 42,
    batches: 1,
    tasks: [],
  },
  {
    id: "run-105",
    helperId: "irrigation-check",
    name: "Irrigation check",
    status: "failed",
    start: "10 Nov, 08:00",
    duration: 18,
    batches: 1,
    tasks: [],
  },
  {
    id: "run-104",
    helperId: "order-sweep",
    name: "Order sweep",
    status: "completed",
    start: "10 Nov, 07:00",
    duration: 51,
    batches: 4,
    tasks: ["Reply to Hollins Florist about the 40-tray order", "Confirm Wednesday’s herb delivery"],
  },
  {
    id: "run-103",
    helperId: "climate-watch",
    name: "Climate watch",
    status: "failed",
    start: "10 Nov, 06:30",
    duration: 30,
    batches: 1,
    tasks: [],
  },
  {
    id: "run-102",
    helperId: "stock-count",
    name: "Stock count",
    status: "completed",
    start: "9 Nov, 06:30",
    duration: 36,
    batches: 4,
    tasks: ["Order 2,000 9cm pots"],
  },
];
export const elapsed = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export function describeSchedule(s: Schedule) {
  if (s.kind === "interval") return `Every ${s.amount} ${s.unit}`;
  if (s.kind === "cron") return s.cron === "*/30 6-19 * * *" ? "Every 30 min, 06:00–19:30" : `Cron ${s.cron}`;
  const days =
    s.kind === "daily" ? "Daily" : s.days.join() === "1,2,3,4,5" ? "Weekdays" : s.days.map((d) => DAYS[d]).join(", ");
  return `${days} at ${s.times.join(" & ")}`;
}
function cronField(value: string, min: number, max: number): number[] | null {
  const set = new Set<number>();
  for (const part of value.split(",")) {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);
    if (!match) return null;
    const step = Number(match[2] ?? 1);
    if (step < 1 || step > max + 1) return null;
    const range = match[1] === "*" ? [min, max] : match[1].split("-").map(Number);
    const lo = range[0],
      hi = range[1] ?? (match[2] ? max : lo);
    if (lo < min || hi > max || lo > hi) return null;
    for (let n = lo; n <= hi; n += step) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}
export function parseCron(value: string) {
  const fields = value.trim().split(/\s+/);
  if (fields.length !== 5) return null;
  const ranges = [
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, 7],
  ];
  const parsed = fields.map((field, i) => cronField(field, ...(ranges[i] as [number, number])));
  return parsed.every(Boolean) ? (parsed as number[][]) : null;
}
export function scheduleError(s: Schedule): string {
  if (s.kind === "interval")
    return /^\d+$/.test(s.amount) && Number(s.amount) > 0 && Number(s.amount) <= (s.unit === "minutes" ? 1440 : 24)
      ? ""
      : `Choose a whole number from 1 to ${s.unit === "minutes" ? 1440 : 24}.`;
  if (s.kind === "cron")
    return parseCron(s.cron) ? "" : "Enter five valid cron fields: minute, hour, day, month, weekday.";
  if (!s.times.length || s.times.some((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
    return "Choose a valid time for every run.";
  if (new Set(s.times).size !== s.times.length) return "Each run time must be different.";
  return s.kind === "weekdays" && !s.days.length ? "Choose at least one weekday." : "";
}
export function nextRuns(s: Schedule): Date[] {
  if (scheduleError(s)) return [];
  if (s.kind === "interval") {
    const minutes = Number(s.amount) * (s.unit === "hours" ? 60 : 1);
    return [1, 2, 3].map((n) => new Date(TODAY.getTime() + n * minutes * 60000));
  }
  const cron = s.kind === "cron" ? parseCron(s.cron)! : null;
  const found: Date[] = [];
  // Dates are evaluated in the named zone, including daylight-saving changes.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23",
    minute: "numeric",
    weekday: "short",
  });
  for (let d = 0; d < 366 * 5 && found.length < 3; d++) {
    const date = new Date(TODAY.getTime() + d * 86400000);
    const month = date.getUTCMonth() + 1,
      day = date.getUTCDate(),
      weekday = date.getUTCDay();
    if (cron) {
      const dom = cron[2].includes(day),
        dow = cron[4].some((n) => n % 7 === weekday);
      const fields = s.cron.trim().split(/\s+/);
      const matchesDay = fields[2] === "*" ? dow : fields[4] === "*" ? dom : dom || dow;
      if (!cron[3].includes(month) || !matchesDay) continue;
    } else if (s.kind === "weekdays" && !s.days.includes(weekday)) continue;
    const times = cron
      ? cron[1].flatMap((h) => cron[0].map((m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`))
      : [...s.times].sort();
    for (const time of times) {
      const iso = `${date.toISOString().slice(0, 10)}T${time}:00Z`;
      const utc = new Date(iso);
      // London is UTC or UTC+1. Verify both candidates; skip nonexistent local times.
      for (const candidate of [new Date(utc.getTime() - 3600000), utc]) {
        if (candidate <= TODAY) continue;
        const p = Object.fromEntries(parts.formatToParts(candidate).map((p) => [p.type, p.value]));
        if (
          Number(p.day) !== day ||
          Number(p.month) !== month ||
          `${p.hour.padStart(2, "0")}:${p.minute.padStart(2, "0")}` !== time
        )
          continue;
        if (!found.some((f) => +f === +candidate)) found.push(candidate);
      }
    }
  }
  return found.sort((a, b) => +a - +b).slice(0, 3);
}
export function formatRun(date: Date, compact = false) {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return compact && date.toISOString().slice(0, 10) === "2026-11-10" ? `Today, ${time}` : `${day}, ${time}`;
}
export const outputTasks = ["Reply to Hollins Florist about the 40-tray order", "Confirm Wednesday’s herb delivery"];
export const logBatches = [
  [
    "Opened the orders inbox.",
    "Found 3 unread messages since the last run.",
    "Checking existing tasks before filing anything.",
  ],
  [
    "Read the 40-tray order from Hollins Florist.",
    "Matched the order to Wholesale orders.",
    "No existing task found for this message.",
  ],
  [
    "Filed “Reply to Hollins Florist about the 40-tray order”.",
    "Read the change to Wednesday’s herb delivery.",
    "Attached the original messages to both tasks.",
  ],
  [
    "Filed “Confirm Wednesday’s herb delivery”.",
    "The third message was already attached to an open task.",
    "Finished: 2 tasks filed. No duplicate tasks.",
  ],
];
export function tasksFor(helper: Helper): string[] {
  if (helper.id === "order-sweep") return outputTasks;
  if (helper.id === "market-prep") return ["Prepare Saturday market crates"];
  if (helper.id === "climate-watch") return ["Check misting nozzles in the propagation house"];
  if (helper.id === "stock-count") return ["Order 2,000 9cm pots"];
  if (helper.id === "irrigation-check") return ["Calibrate soil-moisture probe 3"];
  return ["Prepare tomorrow’s delivery packing list"];
}
export function logsFor(run: Run): string[][] {
  if (run.status === "failed")
    return [
      [
        `Opened ${run.name.toLowerCase()}.`,
        "The source didn’t answer before the connection timed out.",
        "Run stopped. No tasks were filed.",
      ],
    ];
  if (run.helperId === "order-sweep") return logBatches;
  const tasks = run.tasks.length
    ? run.tasks
    : [
        run.helperId === "market-prep"
          ? "Prepare Saturday market crates"
          : run.helperId === "stock-count"
            ? "Order 2,000 9cm pots"
            : run.helperId === "climate-watch"
              ? "Check misting nozzles in the propagation house"
              : run.helperId === "irrigation-check"
                ? "Calibrate soil-moisture probe 3"
                : "Prepare tomorrow’s delivery packing list",
      ];
  return [
    ["Opened the helper’s source.", "Read the latest entries.", "Checking existing tasks."],
    [
      "Compared the new entries with open work.",
      "Found one item that needs attention.",
      "Preparing a task with the source attached.",
    ],
    [`Filed “${tasks[0]}”.`, "Attached the source and a practical next step.", "Checked for duplicates."],
    [
      "Saved the task in the helper’s area.",
      "No duplicate tasks were created.",
      `Finished: ${tasks.length} task filed.`,
    ],
  ];
}

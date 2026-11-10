export const columns = ["Open", "In progress", "Waiting on supplier", "Done"] as const;
export type Status = (typeof columns)[number];
export type Task = {
  id: string;
  title: string;
  area: string;
  status: Status;
  priority?: "Urgent" | "High" | "Low";
  due: string;
  person: string;
  helper?: string;
  tags: string[];
  description: string;
  today: boolean;
  checklist?: { text: string; done: boolean }[];
  subtasks?: string[];
  reason?: string;
};
export const areas = [
  { name: "Propagation house", detail: "Seedlings, cuttings and the next batch.", icon: "seedling" },
  { name: "Polytunnel 2", detail: "Tender crops and daily growing checks.", icon: "plant" },
  { name: "Retail benches", detail: "Ready for the weekend market.", icon: "flower" },
  { name: "Wholesale orders", detail: "Florist orders, quantities and deliveries.", icon: "package" },
  { name: "Maintenance", detail: "Keep the greenhouse working.", icon: "tool" },
];
export const initialTasks: Task[] = [
  {
    id: "FG-104",
    title: "Pot on 120 lavender plugs",
    area: "Propagation house",
    status: "Open",
    priority: "High",
    due: "Today",
    person: "John Smith",
    tags: ["seedlings"],
    today: true,
    description:
      "Move the lavender plugs into 9cm pots before the roots tighten. Use the peat-free mix beside bench 2, then leave them on the sheltered bench overnight.",
    checklist: [
      { text: "Set out 120 clean 9cm pots", done: true },
      { text: "Mix compost and water lightly", done: false },
      { text: "Label the variety and potting date", done: false },
    ],
    subtasks: ["Move trays to the sheltered bench", "Check the lavender after watering"],
  },
  {
    id: "FG-105",
    title: "Reply to Hollins Florist about the 40-tray order",
    area: "Wholesale orders",
    status: "Open",
    due: "Today",
    person: "Alex Lee",
    helper: "Order sweep",
    tags: ["delivery"],
    today: true,
    description:
      "Hollins Florist asked for 40 trays for Thursday. Confirm the split between lavender and rosemary before reserving the stock.",
  },
  {
    id: "FG-106",
    title: "Prepare Saturday market crates",
    area: "Retail benches",
    status: "Open",
    due: "Today",
    person: "Sam Taylor",
    tags: ["market"],
    today: true,
    description: "Pack the non-perishable market kit now. Fresh plants can go in on Saturday morning.",
    checklist: [
      { text: "6 crates", done: true },
      { text: "Price cards", done: true },
      { text: "Card reader charged", done: false },
      { text: "Float", done: false },
    ],
  },
  {
    id: "FG-107",
    title: "Aphids on the pepper starts, bench 4",
    area: "Polytunnel 2",
    status: "In progress",
    priority: "Urgent",
    due: "Today",
    person: "John Smith",
    tags: ["pests"],
    today: true,
    description:
      "Inspect the underside of the leaves on bench 4. Isolate affected trays and record which plants need another check tomorrow.",
  },
  {
    id: "FG-108",
    title: "Check misting nozzles in the propagation house",
    area: "Propagation house",
    status: "In progress",
    due: "Today",
    person: "Jane Doe",
    helper: "Climate watch",
    tags: ["irrigation"],
    today: true,
    description:
      "Climate watch recorded uneven humidity at 09:30. Check the nozzles above bench 2 for a blocked spray pattern.",
  },
  {
    id: "FG-109",
    title: "Order 2,000 9cm pots",
    area: "Propagation house",
    status: "Waiting on supplier",
    due: "Today",
    person: "Jane Doe",
    helper: "Stock count",
    tags: ["supplier"],
    today: true,
    description:
      "Stock count found 180 pots left, about four days of supply. The order is with the supplier; confirm a delivery date.",
  },
  {
    id: "FG-110",
    title: "Calibrate soil-moisture probe 3",
    area: "Maintenance",
    status: "Done",
    due: "Today",
    person: "Jane Doe",
    tags: ["irrigation"],
    today: true,
    description: "Compare probe 3 against the handheld meter in two beds.",
    reason: "Readings now match the handheld meter within 2%.",
  },
  {
    id: "FG-111",
    title: "Restock the herb bench before Saturday",
    area: "Retail benches",
    status: "Done",
    due: "Today",
    person: "Sam Taylor",
    tags: ["market"],
    today: true,
    description: "Move rosemary, mint and thyme onto the retail bench.",
    reason: "Herbs moved over and price cards checked.",
  },
  {
    id: "FG-112",
    title: "Repair the polytunnel door runner",
    area: "Maintenance",
    status: "Open",
    priority: "Low",
    due: "Thu 12 Nov",
    person: "John Smith",
    tags: [],
    today: false,
    description: "The door catches at the lower runner. Clear the grit, then check the guide wheel.",
  },
  {
    id: "FG-113",
    title: "Sow the second batch of sweet peas",
    area: "Propagation house",
    status: "Done",
    due: "Yesterday",
    person: "John Smith",
    tags: ["seedlings"],
    today: false,
    description: "Sow the second batch in deep cells and label each variety.",
    reason: "All trays sown and watered on 9 November.",
  },
];
export const incomingTask: Task = {
  id: "FG-114",
  title: "Check the propagation house vents",
  area: "Propagation house",
  status: "Open",
  priority: "High",
  due: "Today",
  person: "Jane Doe",
  helper: "Climate watch",
  tags: ["seedlings"],
  today: true,
  description:
    "Climate watch recorded 31°C in the propagation house at 14:10. The vents were closed. Check the vent handles and open them before the next reading.",
};
export const initials = (person: string) =>
  person
    .split(" ")
    .map((part) => part[0])
    .join("");

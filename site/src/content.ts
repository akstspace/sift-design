import { rawUrl } from "./base";
export const GITHUB = "https://github.com/akstspace/sift-design";
// Markdown is bundled from the reference, never maintained as a second copy.
const sources = import.meta.glob<string>(
  [
    "../../*.md",
    "../../docs/*.md",
    "../../packages/ui/docs/*.md",
    "../../packages/ui/README.md",
    "../../blocks/*/README.md",
  ],
  { query: "?raw", import: "default", eager: true },
);
export const markdown = Object.fromEntries(
  Object.entries(sources).map(([path, text]) => [path.replace("../../", ""), text]),
);
/** The chart types, one tab each on the Charts page. `doc` is the heading of its section in charts.md. */
export const chartTypes = [
  { id: "area", tab: "Area", page: "Area charts", doc: "Area charts" },
  { id: "bar", tab: "Bar", page: "Bar charts", doc: "Bar charts" },
  { id: "line", tab: "Line", page: "Line charts", doc: "Line charts" },
  { id: "pie", tab: "Pie and donut", page: "Pie and donut charts", doc: "Pie charts" },
  { id: "radar", tab: "Radar", page: "Radar charts", doc: "Radar charts" },
  { id: "radial", tab: "Radial", page: "Radial charts", doc: "Radial charts" },
  { id: "tooltip", tab: "Tooltips", page: "Chart tooltips", doc: "Tooltip charts" },
];
export type Page = { path: string; title: string; group: string; file?: string; description?: string };
export const pages: Page[] = [
  { path: "/", title: "Sift Design", group: "Start here" },
  { path: "/overview", title: "Overview", group: "Start here" },
  { path: "/use-with-your-agent", title: "Use with your agent", group: "Start here", file: "AGENTS.md" },
  { path: "/foundations", title: "Foundations", group: "The system" },
  ...["principles", "color", "typography", "layout"].map((name) => ({
    path: `/foundations/${name}`,
    title: name[0].toUpperCase() + name.slice(1),
    group: "Foundations",
    file: `docs/${name}.md`,
  })),
  { path: "/foundations/shapes-and-depth", title: "Shapes and depth", group: "Foundations", file: "DESIGN.md" },
  { path: "/motion", title: "Motion", group: "The system", file: "docs/motion.md" },
  { path: "/components", title: "Components", group: "The system" },
  ...["controls", "overlays", "display", "ai"].map((name) => ({
    path: `/components/${name}`,
    title: {
      controls: "Controls",
      overlays: "Overlays and menus",
      display: "Display and navigation",
      ai: "AI elements",
    }[name]!,
    group: "Components",
    file: `packages/ui/docs/${name}.md`,
  })),
  { path: "/charts", title: "Charts", group: "The system", file: "packages/ui/docs/charts.md" },
  ...chartTypes.map((type) => ({
    path: `/charts/${type.id}`,
    title: type.page,
    group: "Charts",
    file: "packages/ui/docs/charts.md",
  })),
  { path: "/patterns", title: "Patterns and writing", group: "The system" },
  ...["components", "writing", "data-visualization", "accessibility"].map((name) => ({
    path: `/patterns/${name}`,
    title: {
      components: "Component patterns",
      writing: "Writing",
      "data-visualization": "Data visualization",
      accessibility: "Accessibility",
    }[name]!,
    group: "Patterns",
    file: `docs/${name}.md`,
  })),
  { path: "/retheming", title: "Change the palette", group: "The system", file: "docs/retheming.md" },
  { path: "/blocks", title: "Example screens", group: "The system" },
  ...["workbench", "routines", "timeline", "assistant", "onboarding"].map((name) => ({
    path: `/blocks/${name}`,
    title: `${name[0].toUpperCase() + name.slice(1)} example`,
    group: "Blocks",
    file: `blocks/${name}/README.md`,
  })),
  { path: "/review", title: "Review", group: "Reference", file: "docs/review.md" },
  { path: "/finding-components", title: "Finding components", group: "Reference", file: "docs/finding-components.md" },
  { path: "/reference", title: "Design reference", group: "Reference", file: "DESIGN.md" },
  { path: "/readme", title: "Repository guide", group: "Reference", file: "README.md" },
  { path: "/kit", title: "Kit setup", group: "Reference", file: "packages/ui/README.md" },
  { path: "/credits", title: "Credits", group: "Reference", file: "CREDITS.md" },
];
export const topPages = pages.filter((p) =>
  [
    "/overview",
    "/use-with-your-agent",
    "/foundations",
    "/motion",
    "/components",
    "/charts",
    "/patterns",
    "/retheming",
    "/blocks",
    "/review",
  ].includes(p.path),
);
export const docText = (file: string) => (markdown[file] ?? "").replace(/^---[\s\S]*?\n---\n/, "");
/** The text under one level-two heading of a doc, without the heading itself. */
export function docSection(file: string, heading: string) {
  const lines = docText(file).split("\n");
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start < 0) return "";
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
}
export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
export function headings(text: string) {
  const counts = new Map<string, number>();
  return text
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return [];
      const title = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "");
      const base = slug(title),
        count = counts.get(base) ?? 0;
      counts.set(base, count + 1);
      return [{ title, level: match[1].length, id: base + (count ? `-${count}` : "") }];
    });
}
export function resolveRepoUrl(url: string, file: string, image = false) {
  if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url)) return url;
  if (url.startsWith("/")) return url;
  const resolved = new URL(url, `https://reference.invalid/${file}`);
  const repoPath = decodeURIComponent(resolved.pathname.slice(1));
  const page = !image && pages.find((p) => p.file === repoPath);
  return `${page ? page.path : `/raw/${repoPath}`}${resolved.search}${resolved.hash}`;
}
export type Block = { name: string; title: string; description: string; image: string; clip: string };
/** Optional fictional app screens built with the kit, not required product features. */
export const blocks: Block[] = [
  {
    name: "workbench",
    title: "Workbench",
    description: "An example task board with a collapsible sidebar, drag and drop, and a panel for task details.",
    image: "01-today-light.png",
    clip: "workbench-motion-area-drill",
  },
  {
    name: "routines",
    title: "Routines",
    description: "An example automation manager with schedules, next-run previews, and sample run history.",
    image: "01-helpers-light.png",
    clip: "routines-motion-status-desktop",
  },
  {
    name: "timeline",
    title: "Timeline",
    description: "An example time log with day and week views, category colors, and labeled sessions and durations.",
    image: "01-day-light.png",
    clip: "timeline-motion-day-navigation",
  },
  {
    name: "assistant",
    title: "Assistant",
    description: "An example chat beside a task or in a full-page view, with simulated replies and tool activity.",
    image: "01-docked-light.png",
    clip: "assistant-motion-morph",
  },
  {
    name: "onboarding",
    title: "Onboarding",
    description: "An example setup flow with simulated connection checks, optional steps, and preference settings.",
    image: "01-welcome-light.png",
    clip: "onboarding-motion-assembly",
  },
];
export const basePrompt = (origin: string, askPalette = true) =>
  `Build this project's UI with Sift Design. Read ${origin}/llms.txt, then AGENTS.md, DESIGN.md, and docs/motion.md.${askPalette ? " Ask whether I want the default colors or a custom palette before you start." : ""} Reuse the tokens, fonts, spacing, animated components, and shared motion settings rather than stock shadcn/ui. Keep this project's features, data model, storage, and navigation. The example screens are optional references, not requirements to add tasks, timelines, helpers, or a sidebar. Find file paths at ${origin}/raw/manifest.json and read individual source files from ${rawUrl("")}. Follow ${rawUrl("docs/review.md")} to check both themes, a 390px screen, reduced motion, and zero axe accessibility violations.`;
export const blockPrompt = (origin: string, block: Block) =>
  `${basePrompt(origin)} Use the ${block.title} example where it fits the requested screen. Read ${rawUrl(`blocks/${block.name}/README.md`)} and use the file list to find its sources under blocks/${block.name}/src/. Reuse the relevant components and interactions, not the fictional product's feature set or sample data. View the example at ${origin}/live/${block.name}/ for visual comparison.`;

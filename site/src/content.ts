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
  ...["controls", "overlays", "display"].map((name) => ({
    path: `/components/${name}`,
    title: { controls: "Controls", overlays: "Overlays and menus", display: "Display and navigation" }[name]!,
    group: "Components",
    file: `packages/ui/docs/${name}.md`,
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
  { path: "/retheming", title: "Retheming", group: "The system", file: "docs/retheming.md" },
  { path: "/blocks", title: "Blocks", group: "The system" },
  ...["workbench", "routines", "timeline", "assistant", "onboarding"].map((name) => ({
    path: `/blocks/${name}`,
    title: name[0].toUpperCase() + name.slice(1),
    group: "Blocks",
    file: `blocks/${name}/README.md`,
  })),
  { path: "/review", title: "Review", group: "Reference", file: "docs/review.md" },
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
    "/patterns",
    "/retheming",
    "/blocks",
    "/review",
  ].includes(p.path),
);
export const docText = (file: string) => (markdown[file] ?? "").replace(/^---[\s\S]*?\n---\n/, "");
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
/** Full-page compositions built with the kit, in the spirit of shadcn/ui blocks. */
export const blocks: Block[] = [
  {
    name: "workbench",
    title: "Workbench",
    description: "A daily task board with a collapsible rail, drag and drop, and a task inspector.",
    image: "01-today-light.png",
    clip: "workbench-motion-area-drill",
  },
  {
    name: "routines",
    title: "Routines",
    description: "Scheduled helpers with clear status, a schedule editor that previews the next runs, and run history.",
    image: "01-helpers-light.png",
    clip: "routines-motion-status-desktop",
  },
  {
    name: "timeline",
    title: "Timeline",
    description: "A day of tracked time with eight category colors, labeled duration bars and a week view.",
    image: "01-day-light.png",
    clip: "timeline-motion-day-navigation",
  },
  {
    name: "assistant",
    title: "Assistant",
    description: "An assistant docked beside the work or open full page, with streamed replies and tool activity.",
    image: "01-docked-light.png",
    clip: "assistant-motion-morph",
  },
  {
    name: "onboarding",
    title: "Onboarding",
    description: "First-run setup with connection checks, optional steps and a settings page.",
    image: "01-welcome-light.png",
    clip: "onboarding-motion-assembly",
  },
];
export const basePrompt = (origin: string, askPalette = true) =>
  `Use Sift Design for this project's UI. Fetch ${origin}/llms.txt and follow it.${askPalette ? " First ask me whether to keep the default Sift Design palette or use a custom one." : ""} Before writing UI, read AGENTS.md, DESIGN.md, and docs/motion.md. Copy the tokens from ${rawUrl("tokens/")} and the kit components from ${rawUrl("packages/ui/src/")} instead of stock shadcn/ui. Match the reference screenshots of the closest block. Sign off with ${rawUrl("docs/review.md")}: both themes, 390px wide, reduced motion, and zero axe violations.`;
export const blockPrompt = (origin: string, block: Block) =>
  `${basePrompt(origin)} Start from the ${block.title} block: read ${rawUrl(`blocks/${block.name}/README.md`)}, copy its source from ${rawUrl(`blocks/${block.name}/src/`)}, and adapt the content to this project. Compare your result with the block running at ${origin}/live/${block.name}/.`;

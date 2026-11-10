import { useState } from "react";
import { Button } from "@sift-design/ui/button";
import { Switch } from "@sift-design/ui/switch";
import { Label } from "@sift-design/ui/label";
import { applyPalette } from "@sift-design/ui/lib/theme";
import { IconArrowUpRight, IconArrowRight, IconChevronDown } from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { basePrompt, pages } from "./content";
import { CopyButton, Markdown } from "./Markdown";
import SiftDesignMark from "./SiftDesignMark";
import { at, rawUrl, siteUrl } from "./base";
import { changeAppearance } from "./landing/changeAppearance";

function Prompt({ title, text, open = false }: { title: string; text: string; open?: boolean }) {
  return (
    <section className="prompt-panel">
      <div className="prompt-heading">
        <h2>{title}</h2>
        <CopyButton text={text} label="Copy prompt" />
      </div>
      {open ? (
        <p className="prompt-text">{text}</p>
      ) : (
        <Collapsible className="prompt-more">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Show the full prompt
              <IconChevronDown aria-hidden />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="prompt-text">{text}</p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  );
}
export function Overview() {
  return (
    <>
      <div className="overview-intro">
        <SiftDesignMark size={64} className="hero-mark" entrance="hero" />
        <h2>What Sift Design is</h2>
        <p className="lead">
          A reusable visual design system: colors, fonts, spacing, components, and motion for your product.
          It includes light and dark themes and five optional example screens, not a prescribed set of features.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={at("/use-with-your-agent")}>
              Use with your agent
              <IconArrowRight aria-hidden />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={at("/blocks")}>Browse the examples</a>
          </Button>
        </div>
      </div>
      <Prompt title="Start with this prompt" text={basePrompt(siteUrl())} open />
      <div className="overview-reference">
        <a href={at("/blocks/workbench")} className="reference-image">
          <img
            src={at("/raw/screenshots/workbench/01-today-light.png")}
            width={1440}
            height={900}
            alt="The Workbench example: today’s tasks in four columns beside a dark sidebar"
          />
        </a>
        <div>
          <h2>One visual language, your product’s features</h2>
          <p>
            Thin borders, clear type, and shared animations carry across products. The task board shown here is one
            example, not the required layout. Use a dashboard, chat, editor, or another structure when it fits the work.
          </p>
          <a href={at("/foundations/principles")}>
            Read the principles <IconArrowRight size={16} aria-hidden />
          </a>
        </div>
      </div>
      <section className="page-section">
        <h2>Sections</h2>
        <div className="link-list">
          {[
            ["/foundations", "Foundations", "Colors, fonts, spacing, borders, and shadows."],
            ["/motion", "Motion", "Animation settings, dragging, and transitions between pages."],
            ["/components", "Components", "Try buttons, forms, menus, and more. Each has a usage guide."],
            ["/patterns", "Patterns and writing", "Combine components, write clear messages, show data, and support accessibility."],
            [
              "/retheming",
              "Change the palette",
              "Use your brand colors without changing how the components work.",
            ],
            ["/blocks", "Example screens", "Five optional fictional app screens with source code you can adapt."],
            ["/review", "Review", "The checks to run before calling UI work done."],
          ].map(([path, title, description]) => (
            <a href={at(path)} key={path}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <IconArrowRight aria-hidden size={18} />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
export function AgentPage() {
  const origin = siteUrl();
  const base = basePrompt(origin);
  return (
    <>
      <p className="lead">
        Paste one of these into your coding agent to reuse the visual design while keeping your product’s own
        features, storage, and navigation. The links already point at this website.
      </p>
      <Prompt
        title="Set up a new project"
        text={`${base} For a new web project, use React 19, Vite, TypeScript, and Tailwind CSS v4 unless the brief specifies another stack. If a project already exists, keep its framework. Include both themes, the font files, the named CSS variables, and support for reduced motion.`}
      />
      <Prompt
        title="Build a screen"
        text={`${base} Build only the requested screen and interactions. Choose the layout from this product's needs, reuse the relevant components, and use shared animations to show changes. Consult an example only where it helps; do not add a sidebar, board, or timeline to match it.`}
      />
      <Prompt
        title="Review existing UI"
        text={`Check this project's UI against Sift Design. Read ${origin}/llms.txt, AGENTS.md, DESIGN.md, docs/motion.md, and ${rawUrl("docs/review.md")}. Review colors, fonts, spacing, components, motion, and accessibility. Compare relevant component reference images without treating the example apps' layouts or features as requirements. Keep this project's behavior and data model. Report and fix specific visual or usability problems. Check both themes, a 390px screen, reduced motion, and zero axe accessibility violations.`}
      />
      <Prompt
        title="Use my brand colors"
        text={`${basePrompt(origin, false)} Ask for my brand colors, then follow ${rawUrl("docs/retheming.md")}. Use ${rawUrl("tokens/themes/harbor.css")} as an example. Update the color variables in both themes. Keep component structure, spacing, animation, and chart category order unchanged. Choose dark colors separately and test contrast; do not invert the light palette.`}
      />
      <section className="page-section">
        <h2>Files for agents</h2>
        <div className="link-list">
          {[
            ["/llms.txt", "llms.txt", "Start here: the reading order and links to source files."],
            [
              "/llms-full.txt",
              "llms-full.txt",
              "Agent instructions, the full design reference, and all guides in one file.",
            ],
            [
              "/raw/manifest.json",
              "Source file list",
              "A JSON list of repository paths and file sizes. Read each file at /raw/ followed by its path.",
            ],
            [
              "/raw/tokens/tokens.css",
              "/raw/<repo path>",
              "Source files at their original repository paths. Use the source file list to find files in a folder.",
            ],
          ].map(([href, title, description]) => (
            <a key={href} href={at(href)}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <IconArrowUpRight size={18} aria-hidden />
            </a>
          ))}
        </div>
        <p className="measure mt-5">
          Each guide has <strong>Open source</strong> and <strong>Copy Markdown</strong> buttons.
          You and your agent read the same text; there is no separate agent-only version to keep in sync.
        </p>
      </section>
      <Markdown file="AGENTS.md" />
    </>
  );
}
export function Patterns() {
  return (
    <>
      <p className="lead">
        Combine components to fit your product, write useful messages, present data clearly,
        and make the interface accessible. Use the patterns you need; they are not a feature checklist.
      </p>
      <div className="link-list">
        {pages
          .filter((page) => page.group === "Patterns")
          .map((page) => (
            <a key={page.path} href={at(page.path)}>
              <strong>{page.title}</strong>
              <span>
                Read the guide <IconArrowRight aria-hidden size={16} />
              </span>
            </a>
          ))}
      </div>
    </>
  );
}
export function Retheming() {
  const [harbor, setHarbor] = useState(document.documentElement.dataset.palette === "harbor");
  return (
    <>
      <p className="lead">
        Use your own colors by changing the shared CSS variables, not each component.
        Try the Harbor palette below to see an example across the whole site.
      </p>
      <section className="palette-toggle">
        <div>
          <h2>Harbor palette</h2>
          <p className="support">
            Navy and sand backgrounds, teal actions, and apricot sidebar selections, in light and dark themes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="harbor"
            checked={harbor}
            onCheckedChange={(on) => {
              changeAppearance(() => {
                setHarbor(on);
                applyPalette(on ? "harbor" : null);
              });
              const url = new URL(location.href);
              if (on) url.searchParams.set("palette", "harbor");
              else url.searchParams.delete("palette");
              history.replaceState(history.state, "", url);
            }}
          />
          <Label htmlFor="harbor">Show this site in Harbor</Label>
        </div>
      </section>
      <Markdown file="docs/retheming.md" />
    </>
  );
}

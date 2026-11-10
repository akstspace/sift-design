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
          The design language first built for Sift, written down for coding agents: tokens, a restyled shadcn/ui kit,
          spring motion presets and five full-page blocks, all available as plain files.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={at("/use-with-your-agent")}>
              Use with your agent
              <IconArrowRight aria-hidden />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={at("/blocks")}>Browse the blocks</a>
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
            alt="The workbench example: a Today board with a slate navigation rail, oatmeal canvas and four task columns"
          />
        </a>
        <div>
          <h2>The look: a studio workbench</h2>
          <p>
            The navigation rail and toolbar stay put while the work area changes. Surfaces are separated by hairlines,
            each view has one accent color, and motion shows where things came from and went.
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
            ["/foundations", "Foundations", "Color roles, typography, layout, shapes, and depth."],
            ["/motion", "Motion", "Spring presets, drag behavior and page transitions."],
            ["/components", "Components", "Controls, overlays and display components, live, with their docs."],
            ["/patterns", "Patterns and writing", "Component patterns, writing, data visualization and accessibility."],
            [
              "/retheming",
              "Retheming",
              "Changing the colors for another brand while structure and motion stay the same.",
            ],
            ["/blocks", "Blocks", "Five full-page compositions, running live, with their source."],
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
      <p className="lead">Paste one of these into your coding agent. The links already point at this website.</p>
      <Prompt
        title="Set up a new project"
        text={`${base} Set up a React 19, Vite, TypeScript, and Tailwind CSS v4 project. Preserve the authored light and dark themes, font files, semantic roles, and reduced-motion behavior.`}
      />
      <Prompt
        title="Build a screen"
        text={`${base} Build the requested screen using the closest worked example as the reference. Keep the shell stable, reuse the kit anatomy, and explain state changes with the shared motion presets.`}
      />
      <Prompt
        title="Review existing UI"
        text={`Review this project's UI against Sift Design. Fetch ${origin}/llms.txt; read AGENTS.md, DESIGN.md, docs/motion.md, and ${rawUrl("docs/review.md")}. Compare the existing screen to the closest reference screenshots. Report specific mismatches, fix them with the tokens and kit, and verify both themes, 390px, reduced motion, and zero axe violations.`}
      />
      <Prompt
        title="Retheme for another brand"
        text={`${basePrompt(origin, false)} Retheme it for my brand: ask me for the brand colors, then follow ${rawUrl("docs/retheming.md")}, using ${rawUrl("tokens/themes/harbor.css")} as a worked example. Map the colors to the semantic roles in both themes. Keep anatomy, spacing, motion and the categorical order; check contrast rather than inverting colors for dark mode.`}
      />
      <section className="page-section">
        <h2>Files for agents</h2>
        <div className="link-list">
          {[
            ["/llms.txt", "llms.txt", "The compact entry point: reading order and links to every source."],
            [
              "/llms-full.txt",
              "llms-full.txt",
              "Agent instructions, the full design reference, and all guides in one file.",
            ],
            [
              "/raw/manifest.json",
              "Raw manifest",
              "A machine-readable list of reference files with their paths and sizes.",
            ],
            [
              "/raw/tokens/tokens.css",
              "/raw/<repo path>",
              "Plain source files at their original repository paths. Use the manifest to find files inside directories.",
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
          Every doc page includes <strong>View raw</strong> and <strong>Copy Markdown</strong>. The browsable guide and
          the agent’s source are the same repository Markdown, bundled at build time.
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
        Guides for the parts that sit around components: how they combine, what the words say, how data is shown, and
        how everything stays accessible.
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
        To use your own brand colors, change the color roles and leave everything else alone. Harbor is a worked
        example: switch it on to see this whole site in it.
      </p>
      <section className="palette-toggle">
        <div>
          <h2>Harbor palette</h2>
          <p className="support">
            Cool neutrals, a blue accent for actions and a warm rail selection, with its own light and dark sets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="harbor"
            checked={harbor}
            onCheckedChange={(on) => {
              setHarbor(on);
              applyPalette(on ? "harbor" : null);
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

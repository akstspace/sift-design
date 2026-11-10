import { useState } from "react";
import { IconArrowRight, IconArrowUpRight, IconBrandGithub, IconCheck, IconPlus } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sift-design/ui/tabs";
import { Switch } from "@sift-design/ui/switch";
import { Label } from "@sift-design/ui/label";
import { Checkbox } from "@sift-design/ui/checkbox";
import { Slider } from "@sift-design/ui/slider";
import { applyPalette } from "@sift-design/ui/lib/theme";
import SiftDesignMark from "./SiftDesignMark";
import { CopyButton } from "./Markdown";
import { basePrompt, blocks, GITHUB } from "./content";
import { BlockViewer } from "./Blocks";
import { Clip } from "./Clip";
import ThemeSelect from "./ThemeSelect";
import CommandMenu from "./CommandMenu";
import "./landing.css";
import { at, siteUrl } from "./base";
const roles = ["ground", "surface", "ink", "accent", "rail-selected"];
const motionClips = [
  { title: "A menu opens from its trigger", src: "specimen/clip-dropdown-menu" },
  { title: "A detail page pushes in, then pops back", src: "specimen/clip-push-pop" },
];
function LandingBlocks() {
  const [current, setCurrent] = useState(blocks[0].name);
  const block = blocks.find((b) => b.name === current)!;
  return (
    <div className="landing-block scroll-entry">
      <Tabs value={current} onValueChange={setCurrent}>
        <TabsList aria-label="Blocks" className="landing-block-tabs">
          {blocks.map((b) => (
            <TabsTrigger key={b.name} value={b.name} id={`landing-block-${b.name}`} aria-controls="landing-block-preview">
              {b.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div id="landing-block-preview" role="tabpanel" aria-labelledby={`landing-block-${current}`} tabIndex={0}>
        <BlockViewer block={block} standalone />
      </div>
    </div>
  );
}
function TouchableKit() {
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState(false);
  const [padding, setPadding] = useState([20]);
  return (
    <div className="touchable-kit">
      <div className="kit-topline">
        <span>Kit components, running here</span>
        <a href={at("/components")}>
          All components
          <IconArrowUpRight aria-hidden size={14} />
        </a>
      </div>
      <Tabs defaultValue="board">
        <TabsList aria-label="Sample view">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <div className="demo-task" style={{ padding: padding[0] }}>
            <div className="flex items-center gap-3">
              <Checkbox id="sample-task" checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
              <Label htmlFor="sample-task" className={checked ? "line-through" : ""}>
                Review the onboarding copy
              </Label>
            </div>
            <p>
              Due Thursday · <span className="font-mono">2</span> comments
            </p>
            <div className="demo-task-footer">
              <span>{checked ? "Done" : "Open"}</span>
              <Button variant="outline" size="sm" onClick={() => setSaved(!saved)}>
                {saved ? <IconCheck aria-hidden /> : <IconPlus aria-hidden />}
                {saved ? "Added to Today" : "Add to Today"}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="demo-alternate">
            <IconCheck aria-hidden />
            <p>
              The same tasks as a list.
              <br />
              <span>The tab highlight moves to the selected tab on a spring.</span>
            </p>
          </div>
        </TabsContent>
        <TabsContent value="focus">
          <div className="demo-alternate">
            <p>
              One task at a time.
              <br />
              <span>Focus hides everything except the open task.</span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
      <div className="demo-slider">
        <div>
          <Label htmlFor="density-demo">Card padding</Label>
          <output className="font-mono">{padding[0]} px</output>
        </div>
        <Slider
          id="density-demo"
          aria-label="Card padding"
          value={padding}
          onValueChange={setPadding}
          min={12}
          max={32}
          step={1}
        />
      </div>
    </div>
  );
}
export default function Landing() {
  const [harbor, setHarbor] = useState(document.documentElement.dataset.palette === "harbor");
  const prompt = basePrompt(siteUrl());
  return (
    <div className="landing">
      <a className="skip-link" href="#landing-heading">
        Skip to content
      </a>
      <header className="landing-header">
        <nav aria-label="Website">
          <a href="#inside">What’s included</a>
          <a href="#blocks">Blocks</a>
          <a href={at("/overview")}>Documentation</a>
        </nav>
        <div className="landing-header-actions">
          <CommandMenu />
          <Button variant="ghost" size="icon" asChild>
            <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="Sift Design on GitHub">
              <IconBrandGithub aria-hidden />
            </a>
          </Button>
          <ThemeSelect />
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-offer">
            <SiftDesignMark size={80} entrance="hero" />
            <h1 id="landing-heading" data-page-heading tabIndex={-1}>
              A design reference
              <br />
              for coding agents
            </h1>
            <p>
              Tokens, 64 restyled shadcn/ui components, spring motion presets and five blocks, published as plain
              files an agent can fetch. It started as the interface of Sift, a local-first task workspace.
            </p>
            <a className="text-link" href="#inside">
              See what’s included
              <IconArrowRight aria-hidden size={17} />
            </a>
          </div>
          <div className="landing-prompt">
            <div className="prompt-topline">
              <span>Agent prompt</span>
            </div>
            <h2>Paste this into your coding agent</h2>
            <p className="landing-prompt-code">{prompt}</p>
            <CopyButton
              text={prompt}
              label="Copy agent prompt"
              variant="default"
              size="lg"
              className="mt-6 h-11 w-full bg-(--rail-selected) font-semibold text-(--rail-selected-foreground) hover:bg-(--rail-selected)/90"
            />
            <p className="prompt-footnote">
              The links point at this site. Before it writes any UI, the agent asks whether to keep the default palette
              or use yours.
            </p>
          </div>
        </section>
        <section id="inside" className="landing-proof">
          <div className="proof-text scroll-entry">
            <h2>Every shadcn/ui component, restyled and animated</h2>
            <p>
              All 61 shadcn/ui components, plus a page transition, a scroll title and a time picker, mapped onto the tokens in light
              and dark. Motion is on by default: menus scale from their trigger, selections slide, and dialogs settle on
              a spring.
            </p>
            <a className="text-link" href={at("/components")}>
              Browse the components
              <IconArrowRight aria-hidden size={17} />
            </a>
          </div>
          <div className="scroll-entry">
            <TouchableKit />
          </div>
        </section>
        <section className="landing-system-band" aria-label="What’s included">
          <a href={at("/foundations")}>Tokens for light and dark</a>
          <span aria-hidden>/</span>
          <a href={at("/overview")}>11 guides</a>
          <span aria-hidden>/</span>
          <a href={at("/motion")}>6 spring presets</a>
          <span aria-hidden>/</span>
          <a href={at("/components")}>64 components</a>
          <span aria-hidden>/</span>
          <a href="#blocks">5 blocks</a>
        </section>
        <section className="landing-motion long-section">
          <div className="section-intro scroll-entry">
            <h2>Motion runs on springs</h2>
            <p>
              Anything that moves or scales uses one of six spring presets, so it can be interrupted or reversed partway
              without a jump. Fades and color changes use short durations. With reduced motion on, the movement goes and
              the fades stay.
            </p>
            <a className="text-link" href={at("/motion")}>
              Open the motion presets
              <IconArrowRight aria-hidden size={17} />
            </a>
          </div>
          <div className="landing-clips">
            <figure className="landing-clip-feature scroll-entry">
              <Clip src="workbench/workbench-motion-rail-collapse" label="The workbench rail collapsing and expanding" />
              <figcaption>The rail collapses on a spring; the work area keeps its place.</figcaption>
            </figure>
            {motionClips.map((clip) => (
              <figure className="scroll-entry" key={clip.src}>
                <Clip src={clip.src} label={clip.title} />
                <figcaption>{clip.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="landing-palette long-section" id="palette">
          <div className="palette-intro scroll-entry">
            <h2>The default palette, and how to change it</h2>
            <p>
              An oatmeal canvas, a slate rail and text, coral for the current selection, and a sea green for actions and
              success. Components use roles such as <code>--surface</code> and <code>--accent</code> instead of raw
              colors, so a new brand changes the roles and nothing else.
            </p>
            <div className="landing-harbor">
              <Switch
                id="landing-harbor"
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
              <Label htmlFor="landing-harbor">Show this page in Harbor, the sample alternate palette</Label>
            </div>
            <a className="text-link" href={at("/retheming")}>
              Read the retheming guide
              <IconArrowRight aria-hidden size={17} />
            </a>
          </div>
          <div className="palette-proof scroll-entry">
            <div className="landing-roles">
              {roles.map((role) => (
                <div key={role}>
                  <span style={{ background: `var(--${role})` }} />
                  <code>--{role}</code>
                </div>
              ))}
            </div>
            <div className="categorical-proof">
              <p>
                Eight categorical colors, always in this order.
                <span>For data series only. A ninth series goes into Other.</span>
              </p>
              <div>
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index}>
                    <span style={{ background: `var(--cat-${index + 1})` }} />
                    <code>{index + 1}</code>
                  </div>
                ))}
              </div>
            </div>
            <p className="palette-caption">
              These swatches read the live tokens. Palette: {harbor ? "Harbor" : "default"}. Switch to dark to see the
              dark set.
            </p>
          </div>
        </section>
        <section id="blocks" className="landing-blocks long-section">
          <div className="section-intro scroll-entry">
            <h2>Blocks you can start from</h2>
            <p>
              Five full-page compositions built with the kit, running right here. Switch between them, resize the
              preview, read the source, or copy a prompt that tells your agent to start from one. The sample content is
              Larkspur, a made-up greenhouse business.
            </p>
            <a className="text-link" href={at("/blocks")}>
              All blocks, with notes
              <IconArrowRight aria-hidden size={17} />
            </a>
          </div>
          <LandingBlocks />
        </section>
        <section className="landing-agent-loop long-section">
          <div className="scroll-entry">
            <h2>How an agent uses it</h2>
            <p>
              The agent reads one entry file, copies the source files it needs, and checks the result against the review
              list.
            </p>
          </div>
          <ol>
            <li className="scroll-entry">
              <a href={at("/llms.txt")}>
                <code>llms.txt</code>
                <IconArrowUpRight aria-hidden size={16} />
              </a>
              <p>The reading order, with a link to every guide, token file and component.</p>
            </li>
            <li className="scroll-entry">
              <a href={at("/raw/manifest.json")}>
                <code>/raw/</code>
                <IconArrowUpRight aria-hidden size={16} />
              </a>
              <p>The repository as plain files. Tokens and components are copied from here.</p>
            </li>
            <li className="scroll-entry">
              <a href={at("/review")}>
                The review loop
                <IconArrowRight aria-hidden size={16} />
              </a>
              <p>Both themes, 390px wide, reduced motion, compared with the screenshots, and axe at zero.</p>
            </li>
          </ol>
        </section>
        <section className="landing-close scroll-entry">
          <SiftDesignMark size={48} />
          <h2>Start a project with it</h2>
          <CopyButton text={prompt} label="Copy agent prompt" variant="default" size="lg" className="h-11 px-6" />
          <a href={at("/use-with-your-agent")}>
            Prompts for specific tasks
            <IconArrowRight aria-hidden size={16} />
          </a>
        </section>
      </main>
      <footer className="landing-footer">
        <span>Sift Design</span>
        <p>Made as the design reference for one person’s coding agents. MIT licensed.</p>
        <a href={at("/overview")}>Documentation</a>
        <a href={at("/llms-full.txt")}>Full agent reference</a>
        <a href={at("/credits")}>Credits</a>
        <a href={GITHUB} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}

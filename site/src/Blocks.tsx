import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import {
  IconArrowUpRight,
  IconBrandGithub,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconFileCode,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@sift-design/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@sift-design/ui/tooltip";
import { Spinner } from "@sift-design/ui/spinner";
import { duration, leave, selectionSpring, spring } from "@sift-design/tokens/motion";
import { blockPrompt, blocks, GITHUB, type Block } from "./content";
import { CopyButton, Markdown } from "./Markdown";
import { highlight } from "./highlight";
import { at, rawUrl, siteUrl } from "./base";

// Block sources, loaded only when the Code tab opens.
const sources = import.meta.glob<string>("../../blocks/*/src/**/*.{ts,tsx,css}", { query: "?raw", import: "default" });
const filesOf = (name: string) =>
  Object.keys(sources)
    .filter((key) => key.startsWith(`../../blocks/${name}/src/`))
    .map((key) => ({ key, path: key.replace(`../../blocks/${name}/`, "") }))
    .sort((a, b) => (a.path === "src/App.tsx" ? -1 : b.path === "src/App.tsx" ? 1 : a.path.localeCompare(b.path)));

const widths = { desktop: "100%", tablet: "768px", phone: "390px" } as const;
type Width = keyof typeof widths;

/** Put a running block on the site's current theme and palette. */
function syncTheme(frame: HTMLIFrameElement | null | undefined) {
  const root = document.documentElement;
  const doc = frame?.contentDocument?.documentElement;
  if (!doc) return;
  doc.classList.toggle("dark", root.classList.contains("dark"));
  if (root.dataset.palette) doc.dataset.palette = root.dataset.palette;
  else delete doc.dataset.palette;
}

function frameSrc(name: string) {
  const url = new URL(at(`/live/${name}/`), location.origin);
  url.searchParams.set("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  const palette = document.documentElement.dataset.palette;
  if (palette) url.searchParams.set("palette", palette);
  return url.pathname + url.search;
}

const order = (name: string) => blocks.findIndex((b) => b.name === name);

type Frame = { key: string; block: Block; src: string; direction: number };
type Layer = "loading" | "shown" | "waiting" | "leaving";

/*
 * Switching blocks keeps the running one on screen, dimmed, until the next one
 * has loaded. The next one then slides in from the side of the tab that was
 * picked while the old one drifts out the other way. Reduced motion cross-fades.
 */
function layerMotion(reduced: boolean): Variants {
  return {
    loading: (direction: number) => ({
      opacity: 0,
      x: reduced ? 0 : direction * 48,
      scale: reduced || direction ? 1 : 0.985,
      zIndex: 2,
      transition: { duration: 0 },
    }),
    shown: {
      opacity: 1,
      x: 0,
      scale: 1,
      zIndex: 2,
      transition: reduced ? { duration: duration.quick } : { ...spring.smooth, opacity: { duration: 0.14, ease: "linear" } },
    },
    waiting: {
      opacity: 0.45,
      x: 0,
      scale: reduced ? 1 : 0.985,
      zIndex: 1,
      transition: reduced ? { duration: duration.quick } : { ...spring.smooth, opacity: { duration: 0.2, ease: "linear" } },
    },
    leaving: (direction: number) => ({
      opacity: 0,
      x: reduced ? 0 : direction * -28,
      scale: reduced ? 1 : 0.97,
      zIndex: 0,
      // The arriving block covers this one first, so the two never show through each other.
      transition: reduced
        ? { duration: duration.instant }
        : { ...spring.exit, opacity: { duration: 0.12, delay: 0.12, ease: leave } },
    }),
  };
}

function Preview({ block, width, reload }: { block: Block; width: Width; reload: number }) {
  const reduced = !!useReducedMotion();
  const wanted = `${block.name}:${reload}`;
  const [frames, setFrames] = useState<Frame[]>(() => [{ key: wanted, block, src: frameSrc(block.name), direction: 0 }]);
  const [shown, setShown] = useState<string | null>(null);
  const nodes = useRef(new Map<string, HTMLIFrameElement>());
  const latest = useRef(wanted);
  const previous = useRef(block.name);
  latest.current = wanted;

  // A new block or a reload adds a frame behind the one on screen.
  useEffect(() => {
    setFrames((list) => {
      if (list.some((f) => f.key === wanted)) return list;
      const direction = Math.sign(order(block.name) - order(previous.current));
      return [...list.filter((f) => f.key === shown), { key: wanted, block, src: frameSrc(block.name), direction }];
    });
    previous.current = block.name;
  }, [wanted]);

  useEffect(() => {
    const observer = new MutationObserver(() => nodes.current.forEach((frame) => syncTheme(frame)));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-palette"] });
    return () => observer.disconnect();
  }, []);

  // Give the block two frames to paint before it replaces the one on screen.
  const reveal = (key: string) => {
    syncTheme(nodes.current.get(key));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setShown((current) => (key === latest.current ? key : current))),
    );
  };

  const pending = shown !== wanted;
  const direction = frames.find((f) => f.key === wanted)?.direction ?? 0;
  const variants = layerMotion(reduced);
  return (
    <div className="block-stage">
      <motion.div
        className="block-frame"
        initial={false}
        animate={{ width: widths[width] }}
        transition={reduced ? { duration: 0 } : spring.travel}
      >
        {frames.map((frame) => {
          const layer: Layer =
            frame.key === shown ? (pending ? "waiting" : "shown") : frame.key === wanted ? "loading" : "leaving";
          return (
            <motion.div
              key={frame.key}
              className="block-layer"
              custom={direction}
              variants={variants}
              initial="loading"
              animate={layer}
              inert={layer !== "shown"}
              data-layer={layer}
              onAnimationComplete={(definition) => {
                if (definition === "leaving") setFrames((list) => list.filter((f) => f.key !== frame.key));
              }}
            >
              <iframe
                ref={(node) => {
                  if (node) nodes.current.set(frame.key, node);
                  else nodes.current.delete(frame.key);
                }}
                src={frame.src}
                title={`${frame.block.title} block, running`}
                loading="lazy"
                onLoad={() => reveal(frame.key)}
              />
            </motion.div>
          );
        })}
        <AnimatePresence>
          {pending && (
            <motion.div
              key={shown ? "switching" : "starting"}
              className={shown ? "block-switching" : "block-loading"}
              role="status"
              initial={{ opacity: 0, y: reduced || !shown ? 0 : -6 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...(reduced ? { duration: duration.quick } : spring.snappy), delay: shown ? 0.12 : 0 },
              }}
              exit={{ opacity: 0, transition: { duration: duration.quick, ease: leave } }}
            >
              <Spinner aria-hidden />
              {shown ? `Loading ${block.title}…` : `Starting ${block.title}…`}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Code({ block }: { block: Block }) {
  const reduced = !!useReducedMotion();
  const files = useMemo(() => filesOf(block.name), [block.name]);
  const [current, setCurrent] = useState(files[0]?.key);
  const [code, setCode] = useState<{ key: string; text: string; html: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const file = files.find((f) => f.key === current);
  useEffect(() => {
    if (!current) return;
    let live = true;
    setFailed(false);
    sources[current]()
      .then(async (text) => ({ key: current, text, html: await highlight(text, current) }))
      .then((result) => live && setCode(result))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [current]);
  return (
    <div className="code-view">
      <nav className="code-files" aria-label={`${block.title} source files`}>
        {files.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-current={f.key === current ? "true" : undefined}
            onClick={() => setCurrent(f.key)}
          >
            {f.key === current && (
              <motion.span
                className="code-file-highlight"
                aria-hidden
                layoutId={reduced ? undefined : `code-file-${block.name}`}
                initial={false}
                transition={selectionSpring}
              />
            )}
            <IconFileCode aria-hidden size={16} />
            <span>{f.path.replace(/^src\//, "")}</span>
          </button>
        ))}
      </nav>
      <div className="code-pane">
        <div className="code-pane-head">
          <code>
            blocks/{block.name}/{file?.path}
          </code>
          {code && <CopyButton text={code.text} label="Copy file" />}
        </div>
        {failed ? (
          <p className="code-state" role="status">
            This file couldn’t be loaded. Open it from <a href={rawUrl(`blocks/${block.name}/${file?.path}`)}>the raw file</a>{" "}
            instead.
          </p>
        ) : code ? (
          // The previous file stays until the next one is highlighted, then fades in.
          <motion.div
            key={code.key}
            className="code-body"
            tabIndex={0}
            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: duration.quick } : { ...spring.smooth, opacity: { duration: 0.16, ease: "linear" } }}
            dangerouslySetInnerHTML={{ __html: code.html }}
          />
        ) : (
          <p className="code-state" role="status">
            <Spinner aria-hidden /> Loading the source…
          </p>
        )}
      </div>
    </div>
  );
}

const widthOptions = [
  { value: "desktop", label: "Desktop width", Icon: IconDeviceDesktop },
  { value: "tablet", label: "Tablet width, 768px", Icon: IconDeviceTablet },
  { value: "phone", label: "Phone width, 390px", Icon: IconDeviceMobile },
] as const;

/** One block: live preview or source, with the controls to resize, open, reload and copy a prompt. */
export function BlockViewer({ block, standalone = false }: { block: Block; standalone?: boolean }) {
  const reduced = !!useReducedMotion();
  const [view, setView] = useState<"preview" | "code">("preview");
  const [width, setWidth] = useState<Width>("desktop");
  const [reload, setReload] = useState(0);
  const swap = reduced ? { duration: duration.quick } : { ...spring.smooth, opacity: { duration: 0.18, ease: "linear" } };
  return (
    <section className="block-viewer" id={standalone ? undefined : block.name} aria-labelledby={`${block.name}-title`}>
      <div className="block-head">
        <div className="block-heading">
          <h2 id={`${block.name}-title`} className={standalone ? "sr-only" : undefined}>
            {standalone ? block.title : <a href={at(`/blocks/${block.name}`)}>{block.title}</a>}
          </h2>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={block.name}
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0, transition: swap }}
              exit={{ opacity: 0, y: reduced ? 0 : -4, transition: { duration: 0.1, ease: leave } }}
            >
              {block.description}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="block-toolbar">
        <Tabs value={view} onValueChange={(value) => setView(value as "preview" | "code")}>
          <TabsList aria-label={`${block.title}: view`}>
            <TabsTrigger value="preview" id={`${block.name}-preview-tab`} aria-controls={`${block.name}-view`}>Preview</TabsTrigger>
            <TabsTrigger value="code" id={`${block.name}-code-tab`} aria-controls={`${block.name}-view`}>Code</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="block-actions">
          {view === "preview" && (
            <>
              <ToggleGroup
                type="single"
                value={width}
                onValueChange={(value) => value && setWidth(value as Width)}
                aria-label="Preview width"
                className="block-widths"
              >
                {widthOptions.map(({ value, label, Icon }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value={value} aria-label={label}>
                        <Icon aria-hidden />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Reload preview" onClick={() => setReload((n) => n + 1)}>
                    <IconRefresh aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reload preview</TooltipContent>
              </Tooltip>
            </>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <a href={at(`/live/${block.name}/`)} target="_blank" rel="noreferrer" aria-label="Open in a new tab">
                  <IconArrowUpRight aria-hidden />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in a new tab</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={`${GITHUB}/tree/main/blocks/${block.name}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Source on GitHub"
                >
                  <IconBrandGithub aria-hidden />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Source on GitHub</TooltipContent>
          </Tooltip>
          <CopyButton text={blockPrompt(siteUrl(), block)} label="Copy prompt" />
        </div>
      </div>
      {/* The preview stays mounted under the source, so the running block keeps its state. */}
      <div className="block-views" id={`${block.name}-view`} role="tabpanel" aria-labelledby={`${block.name}-${view}-tab`} tabIndex={0}>
        <motion.div
          className="block-view"
          initial={false}
          animate={
            view === "preview"
              ? { opacity: 1, scale: 1, visibility: "visible", transition: swap }
              : { opacity: 0, scale: reduced ? 1 : 0.99, transitionEnd: { visibility: "hidden" }, transition: { duration: 0.12, ease: leave } }
          }
          inert={view !== "preview"}
        >
          <Preview block={block} width={width} reload={reload} />
        </motion.div>
        <AnimatePresence initial={false}>
          {view === "code" && (
            <motion.div
              key="code"
              className="block-view"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0, transition: swap }}
              exit={{ opacity: 0, transition: { duration: 0.12, ease: leave } }}
            >
              <Code key={block.name} block={block} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function BlocksPage() {
  return (
    <>
      <p className="lead">
        Full-page compositions built with the kit, in the spirit of{" "}
        <a href="https://ui.shadcn.com/blocks" target="_blank" rel="noreferrer">
          shadcn/ui blocks
        </a>
        . Each one is running below. Read its source, resize it, or copy a prompt that tells your agent to start from it.
        The sample content is Larkspur, a made-up greenhouse business.
      </p>
      <div className="block-list">
        {blocks.map((block) => (
          <BlockViewer key={block.name} block={block} />
        ))}
      </div>
    </>
  );
}

export function BlockPage({ name }: { name: string }) {
  const block = blocks.find((b) => b.name === name);
  if (!block) return <p className="lead">There is no block called {name}.</p>;
  return (
    <>
      <p className="lead">{block.description}</p>
      <BlockViewer block={block} standalone />
      <section className="block-notes" aria-labelledby="notes-title">
        <h2 id="notes-title">Notes</h2>
        <Markdown file={`blocks/${name}/README.md`} />
      </section>
    </>
  );
}

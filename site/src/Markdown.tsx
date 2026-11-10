import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@sift-design/ui/collapsible";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@sift-design/ui/button";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { docText, headings, resolveRepoUrl, slug } from "./content";
import { Clip } from "./Clip";
import { at, rawUrl } from "./base";

/** Copies text, then confirms in place: the icon pops to a check and the label returns after a moment. */
export function CopyButton({
  text,
  label = "Copy",
  variant = "outline",
  size = "sm",
  className,
}: {
  text: string;
  label?: string;
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const reduced = useReducedMotion();
  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), state === "copied" ? 2000 : 4000);
    return () => window.clearTimeout(timer);
  }, [state]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }
  return (
    <Button variant={variant} size={size} className={className} onClick={copy}>
      <span className="copy-icon" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={state === "copied" ? "check" : "copy"}
            initial={reduced ? { opacity: 0 } : { scale: state === "copied" ? 0.8 : 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              opacity: 0,
              scale: reduced ? 1 : 0.94,
              transition: reduced
                ? { duration: duration.instant }
                : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
            }}
            transition={reduced
              ? { duration: duration.quick }
              : { ...(state === "copied" ? spring.lively : spring.snappy), opacity: { duration: duration.quick, ease: "linear" } }}
          >
            {state === "copied" ? <IconCheck /> : <IconCopy />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Couldn’t copy. Try again." : label}</span>
    </Button>
  );
}
type MdNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: MdNode[];
  data?: { hProperties?: Record<string, unknown> };
};
const textOf = (node: MdNode): string => node.value ?? (node.children ?? []).map(textOf).join("");
/** Markdown checklist inputs need the visible item's text as their accessible name. */
function checklistLabels() {
  return (tree: MdNode) => {
    const walk = (node: MdNode, label = "") => {
      const itemLabel = node.tagName === "li" ? textOf(node).trim() : label;
      if (node.tagName === "input" && node.properties?.type === "checkbox") {
        node.properties.ariaLabel = itemLabel;
      }
      node.children?.forEach((child) => walk(child, itemLabel));
    };
    walk(tree);
  };
}
/** Give every heading the same id the outline links to, once per parse. */
function headingIds() {
  return (tree: MdNode) => {
    const counts = new Map<string, number>();
    const walk = (node: MdNode) => {
      if (node.type === "heading") {
        const base = slug(textOf(node)),
          count = counts.get(base) ?? 0;
        counts.set(base, count + 1);
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: base + (count ? `-${count}` : "") } };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
export function Markdown({ file }: { file: string }) {
  const text = docText(file);
  const components: Components = {
    a: ({ href = "", children, ...props }) => (
      <a {...props} href={at(resolveRepoUrl(href, file))}>
        {children}
      </a>
    ),
    img: ({ src = "", alt = "" }) => {
      // Filmstrips are frame-by-frame evidence for agents; people get the real clip.
      if (src.includes("filmstrip")) return null;
      const url = resolveRepoUrl(src, file, true);
      if (url.startsWith("/raw/screenshots/") && url.endsWith(".webp"))
        return <Clip src={url.slice("/raw/screenshots/".length, -".webp".length)} label={alt} />;
      return <img src={at(url)} alt={alt} loading="lazy" />;
    },
    pre: ({ children }) => <pre tabIndex={0}>{children}</pre>,
    table: ({ children }) => (
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Reference table">
        <table>{children}</table>
      </div>
    ),
  };
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    components[`h${level}`] = ({ id = "", children }) => {
      if (level === 1) return <span id={id} className="document-origin" hidden />;
      const Tag = `h${level}` as "h2";
      return (
        <Tag id={id}>
          <a className="heading-anchor" href={`#${id}`}>
            {children}
            <span aria-hidden="true" className="anchor-hash">
              #
            </span>
          </a>
        </Tag>
      );
    };
  }
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm, headingIds]} rehypePlugins={[checklistLabels]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
export function DocActions({ file }: { file: string }) {
  return (
    <div className="doc-actions">
      <Button variant="ghost" size="sm" asChild>
        <a href={rawUrl(file)} target="_blank" rel="noreferrer">
          Open source
        </a>
      </Button>
      <CopyButton text={docText(file)} label="Copy Markdown" />
    </div>
  );
}
export function Outline({ file }: { file: string }) {
  const [active, setActive] = useState("");
  const entries = headings(docText(file)).filter((h) => h.level === 2);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (items) => {
        const visible = items.find((item) => item.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    for (const entry of entries) {
      const node = document.getElementById(entry.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [file]);
  const links = (
    <nav>
      {entries.map((h) => (
        <a key={h.id} aria-current={active === h.id ? "location" : undefined} href={`#${h.id}`}>
          {h.title}
        </a>
      ))}
    </nav>
  );
  return (
    <>
      <Collapsible className="mobile-toc">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            On this page
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>{links}</CollapsibleContent>
      </Collapsible>
      <aside className="toc" aria-label="On this page">
        <p>On this page</p>
        {entries.length > 8 ? (
          <>
            <nav>
              {entries.slice(0, 5).map((h) => (
                <a key={h.id} href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined}>
                  {h.title}
                </a>
              ))}
            </nav>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  More sections
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <nav>
                  {entries.slice(5).map((h) => (
                    <a key={h.id} href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined}>
                      {h.title}
                    </a>
                  ))}
                </nav>
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          links
        )}
      </aside>
    </>
  );
}

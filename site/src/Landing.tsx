import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { spring } from "@sift-design/tokens/motion";
import { IconArrowRight, IconArrowUpRight, IconBrandGithub, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@sift-design/ui/tabs";
import { Toaster } from "@sift-design/ui/sonner";
import SiftDesignMark from "./SiftDesignMark";
import { CopyButton } from "./Markdown";
import { basePrompt, blocks, GITHUB } from "./content";
import { BlockViewer } from "./Blocks";
import ThemeSelect from "./ThemeSelect";
import CommandMenu from "./CommandMenu";
import { ComponentSheet } from "./landing/ComponentSheet";
import { SpringLab } from "./landing/SpringLab";
import { PaletteLab } from "./landing/PaletteLab";
import { Reveal } from "./landing/Reveal";
import "./landing.css";
import { at, siteUrl } from "./base";

/** Rises into place once, on first paint. Reduced motion keeps only the fade. */
function Rise({ order, children, className }: { order: number; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        reduced
          ? { duration: 0.14 }
          : {
              ...spring.smooth,
              delay: 0.08 + order * 0.055,
              filter: { duration: 0.3, delay: 0.08 + order * 0.055 },
            }
      }
    >
      {children}
    </motion.span>
  );
}

/** Which of the four steps each sentence of the prompt asks for. */
function stepOf(sentence: string) {
  if (/^Read /.test(sentence)) return 1;
  if (/^Ask /.test(sentence)) return 2;
  if (/^(Reuse|Keep|The example|Find) /.test(sentence)) return 3;
  if (/^Follow /.test(sentence)) return 4;
  return 0;
}

/** File names and links inside the prompt are set apart, so the reading order is easy to scan. */
function PromptText({ text, step }: { text: string; step: number }) {
  const sentences = text.split(/(?<=\.)\s+(?=[A-Z])/);
  return sentences.map((sentence, at) => {
    const owner = stepOf(sentence);
    return (
      <span key={at}>
        <span className="prompt-sentence" data-match={(step && owner === step) || undefined}>
          {sentence.split(/(\s+)/).map((word, index) => {
            const match = word.match(/^(.*?)([.,]?)$/)!;
            return /^https?:|\.(md|txt|json)$/.test(match[1]) ? (
              <span key={index}>
                <span className="prompt-ref">{match[1]}</span>
                {match[2]}
              </span>
            ) : (
              word
            );
          })}
        </span>
        {at < sentences.length - 1 ? " " : ""}
      </span>
    );
  });
}

const wideQuery = "(min-width: 960px)";
function useWide() {
  const [wide, setWide] = useState(() => matchMedia(wideQuery).matches);
  useEffect(() => {
    const query = matchMedia(wideQuery);
    const update = () => setWide(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

function PromptPreview({ text, step }: { text: string; step: number }) {
  const wide = useWide();
  const [open, setOpen] = useState(false);
  // Wide screens show the whole prompt, so every step can point at its sentence.
  const expanded = open || wide || step > 0;
  const setExpanded = setOpen;
  const [heights, setHeights] = useState<{ full: number; excerpt: number }>();
  const content = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!content.current) return;
    const measure = () => {
      const node = content.current!;
      setHeights({
        full: node.getBoundingClientRect().height,
        excerpt: parseFloat(getComputedStyle(node).lineHeight) * 7,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="landing-prompt-preview" data-expanded={expanded}>
      <motion.div
        className="landing-prompt-excerpt"
        initial={false}
        animate={{
          height: heights ? (expanded ? heights.full : heights.excerpt) : "7lh",
        }}
        transition={reduced ? { duration: 0 } : spring.smooth}
      >
        <p ref={content} id="landing-agent-prompt" className="landing-prompt-code">
          <PromptText text={text} step={step} />
        </p>
      </motion.div>
      <Button
        variant="ghost"
        size="sm"
        className="prompt-toggle"
        hidden={wide}
        aria-expanded={expanded}
        aria-controls="landing-agent-prompt"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Show full prompt"}
        <IconChevronDown aria-hidden />
      </Button>
    </div>
  );
}

function LandingBlocks() {
  const [current, setCurrent] = useState(blocks[0].name);
  const block = blocks.find((b) => b.name === current)!;
  return (
    <div className="landing-block">
      <Tabs value={current} onValueChange={setCurrent}>
        <TabsList aria-label="Example screens" className="landing-block-tabs">
          {blocks.map((b) => (
            <TabsTrigger
              key={b.name}
              value={b.name}
              id={`landing-block-${b.name}`}
              aria-controls="landing-block-preview"
            >
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

const headline = ["A design reference", "for coding agents"];

const steps = [
  {
    title: "Reads the reference",
    body: (
      <>
        Starts at <a href={at("/llms.txt")}>llms.txt</a>, then the agent guide, the design reference and the motion
        guide.
      </>
    ),
  },
  {
    title: "Asks about color",
    body: (
      <>The default palette or yours. Components read named CSS variables, so new colors need no component edits.</>
    ),
  },
  {
    title: "Copies what it needs",
    body: (
      <>
        Tokens, fonts and components from the <a href={at("/raw/manifest.json")}>file list</a>. Your features, data and
        navigation stay as they are.
      </>
    ),
  },
  {
    title: "Checks its work",
    body: (
      <>
        Both themes, a 390px screen, reduced motion and zero axe violations, following the{" "}
        <a href={at("/review")}>review guide</a>.
      </>
    ),
  },
];

function AgentSection({ prompt }: { prompt: string }) {
  const [step, setStep] = useState(0);
  const words = prompt.split(/\s+/).length;
  const reduced = useReducedMotion();
  return (
    <section className="landing-agent" id="agent" aria-labelledby="agent-heading">
      <div className="agent-copy">
        <Reveal as="h2" id="agent-heading">
          One prompt sets your agent up
        </Reveal>
        <Reveal as="p" className="section-lede" delay={0.05}>
          Paste it into any coding agent that can read a web page. It points the agent to the reference and says what to
          do, in order. Point at a step to see the words behind it.
        </Reveal>
        <ol className="agent-steps" onMouseLeave={() => setStep(0)}>
          {steps.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={0.08 + index * 0.06}
              className={step === index + 1 ? "is-active" : undefined}
            >
              <div
                className="agent-step"
                onMouseEnter={() => setStep(index + 1)}
                onFocus={() => setStep(index + 1)}
                onBlur={() => setStep(0)}
              >
                <span className="step-number" aria-hidden>
                  {step === index + 1 && (
                    <motion.span
                      layoutId="agent-step-dot"
                      className="step-dot"
                      transition={reduced ? { duration: 0 } : spring.snappy}
                    />
                  )}
                  <span>{index + 1}</span>
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
      <Reveal className="landing-prompt" delay={0.12}>
        <div data-step={step || undefined} className="prompt-body">
          <div className="prompt-topline">
            <span>Agent prompt</span>
            <span>{words} words</span>
          </div>
          <PromptPreview text={prompt} step={step} />
          <CopyButton
            text={prompt}
            label="Copy agent prompt"
            variant="default"
            size="lg"
            className="prompt-copy mt-6 h-11 w-full font-semibold"
          />
          <p className="prompt-footnote">
            Need something narrower? <a href={at("/use-with-your-agent")}>Prompts for specific tasks</a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/** The mark draws itself the first time the closing band comes into view. */
function CloseMark() {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <span ref={ref} className="close-mark">
      {seen && <SiftDesignMark size={56} entrance="close" />}
    </span>
  );
}

function Stage() {
  const reduced = useReducedMotion();
  return (
    <section className="landing-stage" id="examples" aria-labelledby="examples-heading">
      <h2 id="examples-heading" className="sr-only">
        Example screens
      </h2>
      <motion.div
        className="stage-lift"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 64, rotateX: 14, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={
          reduced
            ? { duration: 0.14 }
            : {
                ...spring.smooth,
                delay: 0.42,
                opacity: { duration: 0.3, delay: 0.42 },
              }
        }
      >
        <LandingBlocks />
      </motion.div>
      <p className="stage-note">
        Larkspur is a made-up greenhouse app. Borrow the parts that fit; your product keeps its own features.
        <a href={at("/blocks")}>
          About the examples
          <IconArrowRight aria-hidden size={15} />
        </a>
      </p>
    </section>
  );
}

export default function Landing() {
  const prompt = basePrompt(siteUrl());
  return (
    <div className="landing">
      <a className="skip-link" href="#landing-heading">
        Skip to content
      </a>
      <header className="landing-header">
        <a className="landing-brand" href={at("/")} aria-label="Sift Design home">
          <SiftDesignMark size={28} entrance="hero" />
          <span>Sift Design</span>
        </a>
        <nav aria-label="Website">
          <a href="#components">Components</a>
          <a href="#motion">Motion</a>
          <a href="#palette">Palette</a>
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
        <section className="landing-hero" aria-labelledby="landing-heading">
          <h1 id="landing-heading" data-page-heading tabIndex={-1}>
            {headline.map((line, row) => (
              <span className="hero-line" key={line}>
                {line.split(" ").map((word, index) => (
                  <Rise key={word} order={row * 3 + index} className="hero-word">
                    {word}
                  </Rise>
                ))}
              </span>
            ))}
          </h1>
          <div className="hero-aside">
            <Rise order={6} className="hero-lede">
              Tokens, guides, 64 animated shadcn/ui components and five example screens. Your agent reads them, then
              builds your product in this style with your own features and data.
            </Rise>
            <Rise order={7} className="hero-actions">
              <CopyButton
                text={prompt}
                label="Copy agent prompt"
                variant="default"
                size="lg"
                className="hero-primary"
              />
              <Button variant="outline" size="lg" asChild>
                <a href="#agent">
                  What the prompt does
                  <IconArrowRight aria-hidden />
                </a>
              </Button>
            </Rise>
          </div>
        </section>
        <Stage />
        <AgentSection prompt={prompt} />
        <ComponentSheet />
        <SpringLab />
        <PaletteLab />
        <section className="landing-close" aria-labelledby="close-heading">
          <CloseMark />
          <Reveal as="h2" id="close-heading" delay={0.1}>
            Give your next screen a head start
          </Reveal>
          <Reveal as="p" delay={0.16}>
            Copy the prompt, paste it into your agent, and keep building your own product.
          </Reveal>
          <Reveal className="close-actions" delay={0.22}>
            <CopyButton text={prompt} label="Copy agent prompt" variant="default" size="lg" className="close-primary" />
            <Button variant="ghost" size="lg" asChild className="close-secondary">
              <a href={GITHUB} target="_blank" rel="noreferrer">
                <IconBrandGithub aria-hidden />
                View on GitHub
                <IconArrowUpRight aria-hidden />
              </a>
            </Button>
          </Reveal>
        </section>
      </main>
      <footer className="landing-footer">
        <span>
          <SiftDesignMark size={20} />
          Sift Design
        </span>
        <p>Reusable visual design for coding agents and the products they build. MIT licensed.</p>
        <a href={at("/overview")}>Documentation</a>
        <a href={at("/llms-full.txt")}>Full agent reference</a>
        <a href={at("/credits")}>Credits</a>
        <a href={GITHUB} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
      <Toaster />
    </div>
  );
}

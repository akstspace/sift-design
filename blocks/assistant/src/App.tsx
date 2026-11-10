import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconArrowUpRight,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClipboardList,
  IconLayoutBoard,
  IconMaximize,
  IconMessageCircle,
  IconMessagePlus,
  IconMinimize,
  IconPaperclip,
  IconPlayerStopFilled,
  IconSearch,
  IconSeedling,
  IconSettings,
  IconSparkles,
  IconTemperature,
  IconX,
  IconAlertTriangle,
  IconHistory,
  IconRotateClockwise,
} from "@tabler/icons-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@sift-design/ui/button";
import { Message, MessageContent, MessageHeader } from "@sift-design/ui/message";
import { Bubble, BubbleContent } from "@sift-design/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  useMessageScroller,
  useMessageScrollerScrollable,
} from "@sift-design/ui/message-scroller";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@sift-design/ui/attachment";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@sift-design/ui/input-group";
import { arrivalMotion, bottomSheetMotion, spring } from "@sift-design/tokens/motion";
import { LarkspurMark, LarkspurWordmark } from "../../_shared/brand";

const params = new URLSearchParams(location.search);
const initialState = params.get("state") ?? "conversation";
const questions = [
  "What needs attention before Saturday’s market?",
  "Why was the propagation house too warm?",
  "Help me plan a pest check for bench 4.",
];
const marketAnswer = `**Saturday’s market is within reach.** The herb bench needs restocking, and the crates still need their final check.

- **Alex** is confirming the stock list on Thursday.
- **Sam** can pack on Friday, once the price cards are ready.
- Keep the pepper starts from bench 4 out of the market stock until John has checked them.

### Saturday market crates

| Crate | Contents | Owner |
| :--- | :--- | :--- |
| 1–2 | Rosemary, thyme & sage | Alex |
| 3–4 | Lavender, 9cm pots | John |
| 5 | Winter bedding | Sam |
| 6 | Spare stock & price cards | Sam |

The packing list is in [Prepare Saturday market crates](#task-market).`;
const climateAnswer = `The propagation house reached **31°C at 14:10**. The vents were still closed; the climate log shows the temperature falling after John opened them at 14:25.

Before the next warm spell:

- [ ] Check the vent opener before 10:00.
- [ ] Check misting nozzles for a blocked spray.
- [ ] Read the temperature again after lunch.

I haven’t changed any tasks. [Check misting nozzles in the propagation house](#task-misting) is already on the board.`;
const benchAnswer = `Keep **bench 4 separate from the market stock** until John has checked the pepper starts. The photo is useful context, but it isn’t enough to confirm the pest.

### Bench 4 inspection

- [ ] Inspect the undersides of leaves and the growing tips.
- [ ] Photograph any insects beside a leaf for scale.
- [ ] Check neighbouring trays before moving plants.
- [ ] Record what you find in [Aphids on the pepper starts, bench 4](#task-bench).

Leave treatment decisions with John after the inspection.`;
const actionAnswer = `I updated the packing task and left a note explaining the handoff. **Sam has the final crate check on Friday.**

### Before the van is loaded

- [ ] Pack all six crates against the stock list.
- [ ] Add price cards and spare labels.
- [ ] Charge the card reader.
- [ ] Count the float.

The changes are linked below, so you can check exactly what I changed.`;
const taskNames: Record<string, string> = {
  market: "Prepare Saturday market crates",
  herb: "Restock the herb bench before Saturday",
  bench: "Aphids on the pepper starts, bench 4",
  misting: "Check misting nozzles in the propagation house",
};
type Turn = {
  id: number;
  who: "user" | "assistant";
  text: string;
  tools?: "market" | "climate";
  changes?: boolean;
  image?: string;
  fresh?: boolean;
  stopped?: boolean;
};
const seed: Turn[] = [
  { id: 1, who: "user", text: questions[0] },
  { id: 2, who: "assistant", text: marketAnswer, tools: "market" },
];

function useMobile() {
  const [mobile, setMobile] = useState(() => matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const q = matchMedia("(max-width: 767px)");
    const change = () => setMobile(q.matches);
    q.addEventListener("change", change);
    return () => q.removeEventListener("change", change);
  }, []);
  return mobile;
}
function ToolRow({ kind }: { kind: "market" | "climate" }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = !!useReducedMotion();
  const title = kind === "market" ? "Read 14 tasks in Retail benches" : "Checked the climate log for Propagation house";
  return (
    <div className="tool-row">
      <Button
        variant="ghost"
        className="tool-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {kind === "market" ? <IconClipboardList /> : <IconTemperature />}
        <span>{title}</span>
        <motion.span
          animate={{ rotate: open && !reduced ? 90 : 0 }}
          transition={reduced ? { duration: 0 } : spring.snappy}
        >
          <IconChevronRight />
        </motion.span>
        <IconCheck className="tool-check" />
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduced
                ? { height: { duration: 0 }, opacity: { duration: 0.12 } }
                : { ...spring.smooth, opacity: { duration: open ? 0.14 : 0.08 } }
            }
            className="tool-details"
          >
            <div>
              {kind === "market" ? (
                <>
                  <p>Read-only · Retail benches</p>
                  <p>Found the herb restock, market crates and price-card tasks. No tasks were changed.</p>
                  <a href="#task-market">
                    Open packing task <IconArrowUpRight />
                  </a>
                </>
              ) : (
                <>
                  <p>Read-only · Tuesday 10 November</p>
                  <dl>
                    <div>
                      <dt>14:10</dt>
                      <dd>31°C · vents closed</dd>
                    </div>
                    <div>
                      <dt>14:25</dt>
                      <dd>Vents opened by John</dd>
                    </div>
                    <div>
                      <dt>14:40</dt>
                      <dd>26°C · temperature falling</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function JumpNewest() {
  const { end } = useMessageScrollerScrollable();
  const { scrollToEnd } = useMessageScroller();
  const reduced = !!useReducedMotion();
  return (
    <AnimatePresence>
      {end && (
        <motion.div className="jump-wrap" {...arrivalMotion(reduced)}>
          <Button
            variant="outline"
            className="jump-pill"
            onClick={() => scrollToEnd({ behavior: "instant" as ScrollBehavior })}
          >
            <IconArrowDown /> Jump to newest
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function ChangeLinks() {
  return (
    <div className="change-list" aria-label="Changes made by Ask Larkspur">
      <div className="change-heading">
        <IconSparkles />
        <span>Changed by Ask Larkspur</span>
        <span className="mono">2 changes</span>
      </div>
      <a href="#task-market">
        <IconCheck />
        <span>
          <strong>Prepare Saturday market crates</strong>
          <small>Assigned to Sam · due Friday 13 Nov</small>
        </span>
        <IconArrowUpRight />
      </a>
      <a href="#task-herb">
        <IconMessageCircle />
        <span>
          <strong>Restock the herb bench before Saturday</strong>
          <small>Added a note: keep bench 4 out of market stock</small>
        </span>
        <IconArrowUpRight />
      </a>
    </div>
  );
}
function TurnView({ turn, streaming }: { turn: Turn; streaming: boolean }) {
  return (
    <Message
      arrival={!!turn.fresh}
      reflow={false}
      align={turn.who === "user" ? "end" : "start"}
      className={`turn turn-${turn.who}`}
    >
      <MessageContent>
        <MessageHeader className="turn-header">
          {turn.who === "assistant" ? (
            <>
              <IconSparkles /> Ask Larkspur <span className="helper-label">Assistant</span>
            </>
          ) : (
            <>
              Jane <span className="mono">10:32</span>
            </>
          )}
        </MessageHeader>
        {turn.tools && <ToolRow kind={turn.tools} />}
        <Bubble variant={turn.who === "user" ? "secondary" : "ghost"} className="answer-bubble">
          <BubbleContent>
            {turn.image && (
              <img className="sent-image" src={turn.image} alt="Young plants on bench 4, attached by Jane" />
            )}
            {turn.who === "user" ? (
              <p>{turn.text}</p>
            ) : (
              <div className="markdown">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{ input: (props) => <input {...props} aria-label="Checklist item (read-only)" /> }}
                >
                  {turn.text || "Reading the workspace…"}
                </Markdown>
              </div>
            )}
          </BubbleContent>
        </Bubble>
        {turn.changes && !streaming && !turn.stopped && <ChangeLinks />}
        {streaming && (
          <span className="reply-state" role="status">
            <span className="progress-dot" /> Writing a reply
          </span>
        )}
        {turn.stopped && <span className="reply-state">Reply stopped. You can ask a follow-up.</span>}
      </MessageContent>
    </Message>
  );
}

export default function App() {
  const reduced = !!useReducedMotion();
  const mobile = useMobile();
  const [open, setOpen] = useState(params.get("panel") !== "closed");
  const [expanded, setExpanded] = useState(params.get("view") === "full");
  const [turns, setTurns] = useState<Turn[]>(
    initialState === "empty" || initialState === "notice"
      ? []
      : initialState === "changes"
        ? [
            ...seed,
            { id: 3, who: "user", text: "Give Sam the crate check for Friday and add the bench 4 note." },
            { id: 4, who: "assistant", text: actionAnswer, changes: true },
          ]
        : initialState === "climate"
          ? [
              { id: 1, who: "user", text: questions[1] },
              { id: 2, who: "assistant", text: climateAnswer, tools: "climate" },
            ]
          : seed,
  );
  const [draft, setDraft] = useState(
    initialState === "attachment" ? "Can you help me check the pepper starts on bench 4?" : "",
  );
  const [attached, setAttached] = useState(initialState === "attachment");
  const [imageUrl, setImageUrl] = useState("/media/bench-4.jpg");
  const [notice, setNotice] = useState(initialState === "notice");
  const [archive, setArchive] = useState(false);
  const [error, setError] = useState(initialState === "error");
  const [stream, setStream] = useState<{ id: number; answer: string; shown: number } | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [taskDone, setTaskDone] = useState(false);
  const [toast, setToast] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const returnLauncherFocus = useRef(false);
  const controls = useDragControls();
  const sequence = useRef(10);
  const taskReturn = useRef<HTMLElement | null>(null);
  const taskDialog = useRef<HTMLElement>(null);
  const [inputHeight, setInputHeight] = useState(54);

  useEffect(() => {
    const handle = () => {
      const match = location.hash.match(/^#task-(.+)$/);
      setTask(match?.[1] ?? null);
      setTaskDone(false);
    };
    handle();
    addEventListener("hashchange", handle);
    return () => removeEventListener("hashchange", handle);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!task) return;
    taskReturn.current = document.activeElement as HTMLElement;
    taskDialog.current?.focus({ preventScroll: true });
    return () => {
      requestAnimationFrame(() =>
        taskReturn.current?.isConnected
          ? taskReturn.current.focus({ preventScroll: true })
          : panel.current?.focus({ preventScroll: true }),
      );
    };
  }, [task]);
  useEffect(() => {
    if (!stream) return;
    const timer = setTimeout(() => {
      const edge = Math.min(stream.shown + 120, stream.answer.length);
      const space = stream.answer.indexOf(" ", edge);
      const next = space === -1 ? stream.answer.length : space;
      setTurns((prev) =>
        prev.map((turn) => (turn.id === stream.id ? { ...turn, text: stream.answer.slice(0, next) } : turn)),
      );
      setStream(next >= stream.answer.length ? null : { ...stream, shown: next });
    }, 520);
    return () => clearTimeout(timer);
  }, [stream]);
  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.max(54, Math.min(el.scrollHeight, 170));
    el.style.height = "100%";
    setInputHeight(next);
  }, [draft, open]);
  useEffect(() => {
    if (mobile && open) panel.current?.focus({ preventScroll: true });
  }, [mobile, open]);
  useLayoutEffect(() => {
    if (!open && !task && returnLauncherFocus.current) {
      launcher.current?.focus({ preventScroll: true });
      returnLauncherFocus.current = false;
    }
  }, [open, task]);
  function close() {
    returnLauncherFocus.current = true;
    setOpen(false);
  }
  function ask(text: string, withImage = attached) {
    if (stream || !text.trim()) return;
    setError(false);
    setArchive(false);
    const climate = /warm|climate|propagation|temperature/i.test(text);
    const changes = /give|assign|update|add.*note/i.test(text);
    const bench = /pest|bench 4|pepper/i.test(text);
    const answer = changes ? actionAnswer : climate ? climateAnswer : bench ? benchAnswer : marketAnswer;
    const id = ++sequence.current;
    setTurns((prev) => [
      ...prev,
      { id, who: "user", text, image: withImage ? imageUrl : undefined, fresh: true },
      {
        id: id + 1000,
        who: "assistant",
        text: "",
        tools: changes || bench ? undefined : climate ? "climate" : "market",
        changes,
        fresh: true,
      },
    ]);
    setStream({ id: id + 1000, answer, shown: 0 });
    setDraft("");
    setAttached(false);
    textarea.current?.focus();
  }
  function retry() {
    const id = ++sequence.current;
    setError(false);
    setTurns((prev) => [...prev, { id, who: "assistant", text: "", tools: "market", fresh: true }]);
    setStream({ id, answer: marketAnswer, shown: 0 });
  }
  function stop() {
    if (stream)
      setTurns((prev) =>
        prev.map((t) =>
          t.id === stream.id
            ? { ...t, text: t.text || "I stopped before writing a reply.", changes: false, stopped: true }
            : t,
        ),
      );
    setStream(null);
  }
  function newChat() {
    stop();
    setTurns([]);
    setError(false);
    setNotice(false);
    setArchive(false);
    setDraft("");
    setAttached(false);
    textarea.current?.focus();
  }
  function keyTrap(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape") {
      if (expanded) setExpanded(false);
      else close();
    }
    if (!mobile || e.key !== "Tab") return;
    const nodes = [
      ...(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea, [tabindex="0"]') ??
        []),
    ].filter((n) => n.offsetParent !== null && !n.closest("[inert]"));
    if (e.shiftKey && (document.activeElement === nodes[0] || document.activeElement === panel.current)) {
      e.preventDefault();
      nodes.at(-1)?.focus();
    } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
      e.preventDefault();
      nodes[0]?.focus();
    }
  }
  return (
    <div
      className="app"
      onClickCapture={(e) => {
        const target = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#task-"]');
        if (target) taskReturn.current = target;
      }}
    >
      <div className="workspace-shell" inert={(mobile && open) || task ? true : undefined}>
        <aside className="rail" aria-label="Workspace navigation">
          <LarkspurWordmark />
          <div className="workspace-name">
            Fernbrook Greenhouse
            <IconChevronDown />
          </div>
          <div className="rail-divider" />
          <nav>
            <a href="#today">
              <IconLayoutBoard /> Today
            </a>
            <a href="#retail" className="selected">
              <IconSeedling /> Retail benches
            </a>
            <a href="#propagation">
              <IconSeedling /> Propagation house
            </a>
            <a href="#wholesale">
              <IconClipboardList /> Wholesale orders
            </a>
          </nav>
          <div className="rail-bottom">
            <span className="person-avatar">JD</span>
            <span>
              Jane Doe<small>Workspace owner</small>
            </span>
            <IconSettings />
          </div>
        </aside>
        <header className="workspace-header">
          <div>
            <span className="mobile-wordmark">
              <LarkspurMark size={24} />
            </span>
            <span>Fernbrook Greenhouse</span>
            <IconChevronRight />
            <strong>Retail benches</strong>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search tasks"
            onClick={() => {
              setToast("Search is scoped to the tasks in this example.");
            }}
          >
            <IconSearch />
          </Button>
        </header>
        <main className={`work-page ${open && !expanded ? "beside-panel" : ""}`} id="retail">
          <div className="page-title">
            <div>
              <h1>Retail benches</h1>
              <p>Ready for the weekend, one tray at a time.</p>
            </div>
            <span className="area-icon">
              <IconSeedling />
            </span>
          </div>
          <div className="page-toolbar">
            <span>
              <IconClipboardList /> Tasks
            </span>
            <span className="mono">Tue 10 Nov</span>
          </div>
          <section className="task-group" aria-label="Market preparation">
            <h2>
              Before Saturday <span className="mono">3</span>
            </h2>
            {[
              ["herb", "Restock the herb bench before Saturday", "Alex", "Thursday"],
              ["market", "Prepare Saturday market crates", "Sam", "Friday"],
              ["bench", "Aphids on the pepper starts, bench 4", "John", "Today"],
            ].map(([key, title, owner, due]) => (
              <a className="task-row" href={`#task-${key}`} key={key}>
                <span className="task-checkbox" />
                <div>
                  <strong>{title}</strong>
                  <small>{key === "bench" ? "Polytunnel 2 · Inspection" : "Retail benches · Market"}</small>
                </div>
                <span className="task-owner">{owner}</span>
                <span className={`task-due ${due === "Today" ? "urgent" : ""}`}>{due}</span>
              </a>
            ))}
          </section>
          <div className="workspace-note">
            <IconMessageCircle />
            <p>
              <strong>A note from Alex</strong>
              <br />
              I’ll confirm the herb stock on Thursday. Leave space in crate 6 for the new price cards.
              <small>
                Yesterday at <span className="mono">16:20</span>
              </small>
            </p>
          </div>
          <footer className="page-foot">All changes stay with the task.</footer>
        </main>
      </div>
      <Button
        inert={open || task ? true : undefined}
        ref={launcher}
        variant="default"
        className="assistant-launcher"
        onClick={() => {
          setOpen(true);
          setTimeout(() => textarea.current?.focus(), 0);
        }}
        aria-label="Open Ask Larkspur"
      >
        <IconSparkles /> Ask Larkspur
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <>
            {mobile && (
              <motion.div
                className="mobile-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
              />
            )}
            <motion.section
              ref={panel}
              inert={task ? true : undefined}
              layout={!reduced}
              tabIndex={-1}
              role={mobile ? "dialog" : "region"}
              aria-modal={mobile || undefined}
              aria-labelledby="assistant-title"
              onKeyDown={keyTrap}
              className={`assistant ${expanded ? "is-expanded" : "is-docked"}`}
              initial={mobile ? bottomSheetMotion(reduced).initial : { opacity: 0, x: reduced ? 0 : 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={
                mobile
                  ? {
                      opacity: reduced ? 0 : 1,
                      y: reduced ? 0 : "100%",
                      transition: reduced ? { duration: 0.08 } : spring.travel,
                    }
                  : { opacity: 0, x: reduced ? 0 : 30 }
              }
              transition={reduced ? { duration: 0.14 } : spring.smooth}
              drag={mobile && !reduced ? "y" : false}
              dragListener={false}
              dragControls={controls}
              dragSnapToOrigin
              dragConstraints={{ top: 0, bottom: mobile ? window.innerHeight : 0 }}
              dragElastic={{ top: 0, bottom: 0.1 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 650) close();
              }}
            >
              <div className="sheet-handle" onPointerDown={(e) => controls.start(e)}>
                <span />
              </div>
              <motion.header layout={!reduced ? "position" : false} className="assistant-header">
                <div className="assistant-mark">
                  <IconSparkles />
                </div>
                <div className="assistant-title">
                  <h2 id="assistant-title">Ask Larkspur</h2>
                  <p>Fernbrook Greenhouse</p>
                </div>
                <div className="header-buttons">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="New conversation"
                    title="New conversation"
                    onClick={newChat}
                  >
                    <IconMessagePlus />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={expanded ? "Dock assistant" : "Expand assistant"}
                    title={expanded ? "Dock assistant" : "Expand assistant"}
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? <IconMinimize /> : <IconMaximize />}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Close assistant" onClick={close}>
                    <IconX />
                  </Button>
                </div>
              </motion.header>
              <MessageScrollerProvider autoScroll defaultScrollPosition="start" scrollEdgeThreshold={40}>
                <MessageScroller className="conversation-scroll">
                  <MessageScrollerViewport aria-label="Conversation" className="conversation-viewport">
                    <MessageScrollerContent
                      className="conversation-content"
                      role="log"
                      aria-live="polite"
                      aria-relevant="additions"
                      aria-atomic="false"
                    >
                      {notice && (
                        <MessageScrollerItem messageId="notice">
                          <div className="recovery-notice" role="status">
                            <IconHistory />
                            <div>
                              <strong>We started a new conversation.</strong>
                              <p>
                                The previous conversation couldn’t be opened. It’s still kept in Conversation history;
                                nothing was deleted.
                              </p>
                              <button onClick={() => setArchive(!archive)} aria-expanded={archive}>
                                View conversation history <IconArrowUpRight />
                              </button>
                              {archive && (
                                <div className="archive-entry">
                                  <strong>Saturday market plan</strong>
                                  <small>Yesterday, 16:20 · saved on this device</small>
                                  <p>
                                    This conversation can’t be opened right now. Your new conversation is ready below.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </MessageScrollerItem>
                      )}
                      {turns.length === 0 ? (
                        <MessageScrollerItem messageId="empty" className="empty-wrapper">
                          <div className="empty-state">
                            <div className="empty-mark">
                              <IconSeedling />
                            </div>
                            <h3>A little help with the growing.</h3>
                            <p>
                              Ask about the work, make a plan, or change a task. You’ll see what I read and everything I
                              change.
                            </p>
                            <div className="suggestions">
                              {questions.map((q) => (
                                <Button key={q} variant="ghost" className="suggestion" onClick={() => ask(q, false)}>
                                  <span>{q}</span>
                                  <IconArrowUpRight />
                                </Button>
                              ))}
                            </div>
                            <small>Working with your Fernbrook workspace.</small>
                          </div>
                        </MessageScrollerItem>
                      ) : (
                        <>
                          <MessageScrollerItem messageId="day">
                            <div className="conversation-date">Today, 10 November</div>
                          </MessageScrollerItem>
                          {turns.map((turn) => (
                            <MessageScrollerItem key={turn.id} messageId={`turn-${turn.id}`}>
                              <TurnView turn={turn} streaming={stream?.id === turn.id} />
                            </MessageScrollerItem>
                          ))}
                        </>
                      )}
                      {error && (
                        <MessageScrollerItem messageId="error">
                          <div className="error-notice" role="alert">
                            <IconAlertTriangle />
                            <div>
                              <strong>The reply couldn’t finish.</strong>
                              <p>The connection was interrupted. Your conversation and draft are still here.</p>
                              <Button variant="outline" size="sm" onClick={retry}>
                                <IconRotateClockwise /> Retry reply
                              </Button>
                            </div>
                          </div>
                        </MessageScrollerItem>
                      )}
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  {turns.length > 0 && <JumpNewest />}
                </MessageScroller>
              </MessageScrollerProvider>
              <motion.div layout={!reduced ? "position" : false} className="composer-wrap">
                <div className="composer-inner">
                  <InputGroup className="composer-group">
                    {attached && (
                      <InputGroupAddon align="block-start" className="attachment-addon">
                        <Attachment size="sm">
                          <AttachmentMedia variant="image">
                            <img src={imageUrl} alt="Young plants on bench 4" />
                          </AttachmentMedia>
                          <AttachmentContent>
                            <AttachmentTitle>bench-4.jpg</AttachmentTitle>
                            <AttachmentDescription>Image · ready to send</AttachmentDescription>
                          </AttachmentContent>
                          <AttachmentActions>
                            <AttachmentAction aria-label="Remove bench 4 image" onClick={() => setAttached(false)}>
                              <IconX />
                            </AttachmentAction>
                          </AttachmentActions>
                        </Attachment>
                      </InputGroupAddon>
                    )}
                    <motion.div
                      className="textarea-size"
                      animate={{ height: inputHeight }}
                      transition={reduced ? { duration: 0 } : spring.smooth}
                    >
                      <InputGroupTextarea
                        ref={textarea}
                        className="composer-textarea"
                        aria-label="Message Ask Larkspur"
                        placeholder="Ask about your greenhouse…"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            ask(draft);
                          }
                        }}
                      />
                    </motion.div>
                    <InputGroupAddon align="block-end" className="composer-actions">
                      <InputGroupButton
                        size="icon-sm"
                        aria-label="Attach bench 4 image"
                        title="Attach bench 4 image"
                        onClick={() => setAttached(true)}
                      >
                        <IconPaperclip />
                      </InputGroupButton>
                      <InputGroupButton className="upload-button" onClick={() => file.current?.click()}>
                        Choose image
                      </InputGroupButton>
                      <span className="composer-scope">
                        <IconSeedling /> Workspace
                      </span>
                      {stream ? (
                        <InputGroupButton className="stop-button" size="sm" variant="outline" onClick={stop}>
                          <IconPlayerStopFilled /> Stop
                        </InputGroupButton>
                      ) : (
                        <InputGroupButton
                          size="icon-sm"
                          variant="default"
                          aria-label="Send message"
                          disabled={!draft.trim()}
                          onClick={() => ask(draft)}
                        >
                          <IconArrowUp />
                        </InputGroupButton>
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                  <input
                    ref={file}
                    aria-label="Choose an image to attach"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => {
                      const image = e.target.files?.[0];
                      if (image) {
                        setImageUrl(URL.createObjectURL(image));
                        setAttached(true);
                      }
                    }}
                  />
                  <div className="composer-hint">
                    <span>Changes are attributed and linked here.</span>
                    <span className="enter-hint">
                      <kbd>↵</kbd> send · <kbd>⇧ ↵</kbd> new line
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {task && (
          <motion.div className="task-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-title"
              className="task-dialog"
              ref={taskDialog}
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  location.hash = "";
                }
                if (e.key === "Tab") {
                  e.preventDefault();
                  const nodes = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
                  const index = [...nodes].indexOf(document.activeElement as HTMLButtonElement);
                  nodes[(index + (e.shiftKey ? nodes.length - 1 : 1)) % nodes.length]?.focus();
                }
              }}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  location.hash = "";
                }}
              >
                <IconArrowLeft /> Back to conversation
              </Button>
              <div className="task-dialog-content">
                <span className="task-location">{task === "bench" ? "Polytunnel 2" : "Retail benches"}</span>
                <h2 id="task-title">{taskNames[task] ?? taskNames.market}</h2>
                <p>
                  {task === "market"
                    ? "Sam Taylor · Due Friday 13 November"
                    : "Keep the team’s observations and next steps together."}
                </p>
                <div className="task-activity">
                  <IconSparkles />
                  <div>
                    <strong>{turns.some((t) => t.changes && !t.stopped) ? "Ask Larkspur" : "Jane Doe"}</strong>
                    <small>
                      Today at <span className="mono">10:32</span>
                    </small>
                    <p>
                      {turns.some((t) => t.changes && !t.stopped)
                        ? task === "market"
                          ? "Assigned the final crate check to Sam for Friday, as Jane asked."
                          : "Keep bench 4 out of market stock until John has checked the pepper starts."
                        : "Keep the observations here so the next person has the full picture."}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setTaskDone(!taskDone)}>
                  <IconCheck /> {taskDone ? "Marked done · Undo" : "Mark done"}
                </Button>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" {...arrivalMotion(reduced)}>
            {toast}
            <Button variant="ghost" size="icon" aria-label="Dismiss notice" onClick={() => setToast("")}>
              <IconX />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

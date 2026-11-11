import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { Button } from "@sift-design/ui/button";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@sift-design/ui/ai/message";
import { Shimmer } from "@sift-design/ui/ai/shimmer";
import { IconCheck, IconCopy, IconPlayerStop, IconRefresh, IconThumbUp } from "@tabler/icons-react";
import { SpecimenItem } from "../../frame";

const answers = [
  `### Start with the misting nozzles

The propagation house reached **31°C at 14:10**. The vents were closed. Check ventilation before the next misting cycle.

1. Ask John Smith to open the roof vents.
2. Check each nozzle for a clear spray pattern.
3. Record the temperature after **15 minutes**.

| Area | Next action | Owner |
| --- | --- | --- |
| Propagation house | Check misting nozzles | John Smith |
| Bench 4 | Inspect pepper starts | Jane Doe |

Use \`probe-3\` for the follow-up reading:

\`\`\`yaml
area: propagation-house
check: misting-nozzles
follow_up_minutes: 15
\`\`\`

See the [misting checklist](https://larkspur.example/guides/misting) before you start.

> These checks use the attached notes. No equipment settings have changed.`,
  `### Check airflow first

Ask **John Smith** to open the roof vents. Wait **15 minutes**, then compare the temperature with the earlier **31°C** reading.

- Check the misting nozzles while the house cools.
- Keep the pepper starts out of direct midday sun.
- Record the result against \`probe-3\`.

If the temperature stays high, ask Jane Doe to inspect the vent controls.

> This answer puts ventilation before irrigation. No equipment settings have changed.`,
  `### Share the checks

**John Smith:** check the roof vents and misting nozzles in the propagation house.

**Jane Doe:** inspect the pepper starts on bench 4 and record any signs of heat stress.

**Alex Lee:** confirm that the next delivery will not block access to the propagation house.

Review the readings together after **15 minutes**. Use the [misting checklist](https://larkspur.example/guides/misting) to record the result.

> This answer divides the work between three people. No tasks have been assigned.`,
];
const wordParts = answers.map((answer) => answer.match(/\S+\s*/g) ?? []);
const file = {
  type: "file" as const,
  mediaType: "text/csv",
  filename: "propagation-notes.csv",
  url: "data:text/csv,area%2Ctemperature%0Apropagation-house%2C31",
};

function CopyResponse({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const reduced = !!useReducedMotion();
  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), state === "copied" ? 2000 : 4000);
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => setState("idle"), [text]);
  return (
    <MessageAction
      size="sm"
      label="Copy response"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("copied");
        } catch {
          setState("failed");
        }
      }}
    >
      <span className="relative inline-flex size-4 items-center justify-center" aria-hidden>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={state === "copied" ? "check" : "copy"}
            className="inline-flex"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: reduced ? 1 : 0.94,
              transition: reduced
                ? { duration: duration.instant }
                : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
            }}
            transition={
              reduced ? { duration: duration.quick } : { ...spring.snappy, opacity: { duration: duration.quick } }
            }
          >
            {state === "copied" ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed. Try again." : "Copy"}
      </span>
    </MessageAction>
  );
}

function ConversationDemo() {
  const [branch, setBranch] = useState(0);
  const [streamIndex, setStreamIndex] = useState(0);
  const [count, setCount] = useState(1);
  const [attached, setAttached] = useState(true);
  const [liked, setLiked] = useState<boolean[]>([false, false, false]);
  const streaming = count < wordParts[streamIndex].length;
  useEffect(() => {
    if (!streaming) return;
    const timer = window.setInterval(() => setCount((value) => Math.min(value + 1, wordParts[streamIndex].length)), 24);
    return () => window.clearInterval(timer);
  }, [streaming, streamIndex]);
  const replay = () => {
    setStreamIndex(branch);
    setCount(1);
  };
  const textAt = (index: number) =>
    index === streamIndex ? wordParts[index].slice(0, count).join("") : answers[index];
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[760px] flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div>
          <p className="text-[13px] font-medium">Fernbrook Greenhouse</p>
          <p className="text-[12px] text-muted-foreground">Propagation house · Tuesday 10 November</p>
        </div>
        <div className="flex gap-1">
          {streaming && (
            <Button size="sm" variant="ghost" onClick={() => setCount(wordParts[streamIndex].length)}>
              <IconPlayerStop aria-hidden className="size-4" />
              Finish response
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={replay}>
            <IconRefresh aria-hidden className="size-4" />
            Replay response
          </Button>
        </div>
      </header>
      <Message from="user">
        <p className="text-[12px] text-muted-foreground">Jane Doe</p>
        <MessageAttachments>
          {attached && <MessageAttachment data={file} onRemove={() => setAttached(false)} />}
        </MessageAttachments>
        <MessageContent>What should we check in the propagation house today?</MessageContent>
        {!attached && (
          <Button size="sm" variant="ghost" onClick={() => setAttached(true)}>
            Restore attachment
          </Button>
        )}
      </Message>
      <Message from="assistant">
        <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <span className="font-medium text-foreground">Greenhouse assistant</span>
          <span role="status">{streaming ? "Writing response…" : "Response ready"}</span>
        </div>
        <MessageBranch onBranchChange={setBranch}>
          <MessageBranchContent>
            {answers.map((_, index) => (
              <MessageContent key={index}>
                <MessageResponse isAnimating={streaming && streamIndex === index}>{textAt(index)}</MessageResponse>
              </MessageContent>
            ))}
          </MessageBranchContent>
          <MessageToolbar>
            <MessageActions>
              <CopyResponse text={textAt(branch)} />
              <MessageAction tooltip="Try another response" label="Retry response" onClick={replay}>
                <IconRefresh aria-hidden className="size-4" />
              </MessageAction>
              <MessageAction
                tooltip={liked[branch] ? "Remove helpful mark" : "Mark response helpful"}
                aria-pressed={liked[branch]}
                className={liked[branch] ? "text-good" : ""}
                onClick={() => setLiked((value) => value.map((like, index) => (index === branch ? !like : like)))}
              >
                <IconThumbUp aria-hidden className="size-4" />
              </MessageAction>
            </MessageActions>
            <MessageBranchSelector>
              <MessageBranchPrevious />
              <MessageBranchPage />
              <MessageBranchNext />
            </MessageBranchSelector>
          </MessageToolbar>
        </MessageBranch>
      </Message>
    </div>
  );
}

function ThinkingDemo() {
  const [thinking, setThinking] = useState(false);
  useEffect(() => {
    if (!thinking) return;
    const timer = window.setTimeout(() => setThinking(false), 4000);
    return () => window.clearTimeout(timer);
  }, [thinking]);
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">Check the propagation notes before you prepare a response.</p>
      <div role="status" className="flex min-h-8 items-center gap-2">
        {thinking ? (
          <Shimmer as="span" duration={2} spread={2}>
            Thinking…
          </Shimmer>
        ) : (
          <>
            <IconCheck aria-hidden className="size-4 text-good" />
            <span className="text-[14px]">Notes checked. Ready to respond.</span>
          </>
        )}
      </div>
      <div>
        <Button size="sm" variant="outline" onClick={() => setThinking((value) => !value)}>
          {thinking ? "Finish thinking" : "Replay thinking"}
        </Button>
      </div>
    </div>
  );
}

export default function MessageExamples() {
  return (
    <>
      <SpecimenItem
        name="Message"
        note="User messages use a bubble. Responses stream as prose, with three answers and a directional cross-fade."
        wide
      >
        <ConversationDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Shimmer"
        note="Use text shimmer only during active work. Reduced motion keeps the status text still."
      >
        <ThinkingDemo />
      </SpecimenItem>
    </>
  );
}

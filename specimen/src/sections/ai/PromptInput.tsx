import { useEffect, useRef, useState } from "react";
import {
  IconAlertCircle,
  IconPhotoPlus,
  IconPlant2,
  IconSearch,
  IconCheck,
  IconFileText,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  usePromptInputController,
  usePromptInputReferencedSources,
  type PromptInputMessage,
} from "@sift-design/ui/ai/prompt-input";
import { SpecimenItem } from "../../frame";

type Status = "submitted" | "streaming" | "ready" | "error";
const initialPrompt = "What should John check on the pepper starts before the market?";
const answer =
  "Ask John to inspect the undersides of the pepper leaves on bench 4. Check for aphids and damaged growth. Keep affected trays separate before preparing the market crates.";

function SamplePhotoButton({ disabled }: { disabled: boolean }) {
  const attachments = usePromptInputAttachments();
  const addPhoto = () => {
    const style = getComputedStyle(document.documentElement);
    const color = (token: string) => style.getPropertyValue(token).trim();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="${color("--subtle")}"/><path d="M24 272h432v24H24z" fill="${color("--muted")}"/><g fill="${color("--accent")}"><path d="M120 242c-65-10-72-66-46-68 33-3 45 40 46 68Zm0-34c-5-61 42-83 53-61 14 30-21 56-53 61Zm120 34c-65-10-72-66-46-68 33-3 45 40 46 68Zm0-34c-5-61 42-83 53-61 14 30-21 56-53 61Zm120 34c-65-10-72-66-46-68 33-3 45 40 46 68Zm0-34c-5-61 42-83 53-61 14 30-21 56-53 61Z"/></g><g fill="${color("--ink")}"><path d="M91 238h58l-8 34h-42Zm120 0h58l-8 34h-42Zm120 0h58l-8 34h-42Z"/></g><text x="24" y="43" font-family="sans-serif" font-size="18" fill="${color("--ink")}">Fernbrook · Pepper starts · Bench 4</text></svg>`;
    attachments.add([
      new File([new Blob([svg], { type: "image/svg+xml" })], "pepper-starts.svg", { type: "image/svg+xml" }),
    ]);
  };
  return (
    <Button variant="outline" size="sm" onClick={addPhoto} disabled={disabled}>
      <IconPhotoPlus aria-hidden className="size-4" /> Add sample photo
    </Button>
  );
}

function ReferencedSourceTools({ disabled }: { disabled: boolean }) {
  const references = usePromptInputReferencedSources();
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
      {references.sources.map((source) => (
        <span
          key={source.id}
          className="flex h-8 min-w-0 max-w-full items-center gap-2 rounded-full border bg-tint pl-2.5 pr-1 text-[12px]"
        >
          <IconFileText aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{source.title}</span>
          <Button
            type="button"
            variant="ghost"
            className="size-6 shrink-0 rounded-full p-0"
            aria-label={`Remove reference ${source.title}`}
            onClick={() => references.remove(source.id)}
          >
            <IconX aria-hidden className="size-3.5" />
          </Button>
        </span>
      ))}
      {references.sources.length === 0 && (
        <PromptInputButton
          tooltip="Add the bench inspection as context"
          disabled={disabled}
          size="xs"
          className="rounded-full text-muted-foreground"
          onClick={() =>
            references.add({
              type: "source-document",
              sourceId: "bench-4",
              mediaType: "text/plain",
              title: "Bench 4 inspection",
              filename: "bench-4-inspection.txt",
            })
          }
        >
          <IconPlus aria-hidden className="size-3" />
          <span>Add task reference</span>
        </PromptInputButton>
      )}
    </div>
  );
}

function ComposerDemo() {
  const controller = usePromptInputController();
  const [status, setStatus] = useState<Status>("ready");
  const [search, setSearch] = useState(false);
  const [model, setModel] = useState("Meadowlark 3");
  const [sent, setSent] = useState<PromptInputMessage | null>(null);
  const [response, setResponse] = useState("");
  const [notice, setNotice] = useState("");
  const [failNext, setFailNext] = useState(false);
  const [stopped, setStopped] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = status === "submitted" || status === "streaming";
  const cancelTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const submit = (message: PromptInputMessage) => {
    if (busy || (!message.text.trim() && !message.files.length)) return;
    cancelTimers();
    setNotice("");
    setStopped(false);
    if (failNext) {
      setFailNext(false);
      setStatus("error");
      setNotice(
        "The assistant could not receive this message. Your draft is still here. Select Retry message to try again.",
      );
      throw new Error("Simulated send failure");
    }
    setSent(message);
    setResponse("");
    setStatus("submitted");
    timers.current.push(
      setTimeout(() => {
        setStatus("streaming");
        for (let i = 1; i <= Math.ceil(answer.length / 5); i += 1) {
          timers.current.push(
            setTimeout(() => {
              setResponse(answer.slice(0, i * 5));
              if (i * 5 >= answer.length) setStatus("ready");
            }, i * 65),
          );
        }
      }, 700),
    );
  };
  const stop = () => {
    cancelTimers();
    setStatus("ready");
    setStopped(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-link">
          <IconPlant2 aria-hidden className="size-5" />
        </div>
        <div>
          <h3 className="text-[14px] font-medium">Larkspur assistant</h3>
          <p className="text-[13px] text-muted-foreground">Fernbrook Greenhouse · Market preparation</p>
        </div>
      </div>
      <PromptInput
        multiple
        maxFiles={4}
        onSubmit={submit}
        onError={(error) => setNotice(error.message)}
        aria-label="Larkspur message composer"
      >
        <ReferencedSourceTools disabled={busy} />
        <PromptInputAttachments>{(file) => <PromptInputAttachment data={file} />}</PromptInputAttachments>
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message to Larkspur"
            aria-describedby={notice ? "larkspur-composer-hint larkspur-composer-error" : "larkspur-composer-hint"}
            aria-invalid={status === "error" || undefined}
            disabled={busy}
            placeholder="Ask about your greenhouse…"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger disabled={busy} />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
                <PromptInputActionAddScreenshot />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputSelect value={model} onValueChange={setModel}>
              <PromptInputSelectTrigger aria-label="Assistant model" className="max-w-44" disabled={busy}>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {["Meadowlark 3", "Meadowlark 3 Mini", "Quarry Large", "Quarry Swift", "Tidewater 2"].map((name) => (
                  <PromptInputSelectItem value={name} key={name}>
                    {name}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
            <PromptInputButton
              aria-label="Search greenhouse records"
              aria-pressed={search}
              tooltip={{ content: "Search greenhouse records", side: "top" }}
              onClick={() => setSearch(!search)}
              size="sm"
              className={search ? "rounded-full bg-accent-soft text-link" : "rounded-full text-muted-foreground"}
              disabled={busy}
            >
              {search ? <IconCheck aria-hidden className="size-4" /> : <IconSearch aria-hidden className="size-4" />}
              <span>Search</span>
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit
            status={status}
            onStop={stop}
            disabled={
              status === "submitted" ||
              (!busy && !controller.textInput.value.trim() && !controller.attachments.files.length)
            }
          />
        </PromptInputFooter>
      </PromptInput>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id="larkspur-composer-hint" className="text-[12px] text-muted-foreground">
          Drop or paste files. Shift + Enter adds a line.
        </p>
        <p className="text-[12px] text-muted-foreground">{search ? "Greenhouse search on" : "Greenhouse search off"}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <SamplePhotoButton disabled={busy} />
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          aria-pressed={failNext}
          onClick={() => {
            setFailNext(!failNext);
            if (!controller.textInput.value.trim()) controller.textInput.setInput(initialPrompt);
          }}
        >
          <IconAlertCircle aria-hidden className="size-4" /> {failNext ? "Next send will fail" : "Test send error"}
        </Button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {status === "submitted"
          ? "Sending message"
          : status === "streaming"
            ? "Generating response"
            : stopped
              ? "Generation stopped"
              : sent && status === "ready"
                ? "Response complete"
                : ""}
      </p>
      {notice && (
        <p id="larkspur-composer-error" role="alert" className="text-[13px] text-destructive">
          {notice}
        </p>
      )}
      {sent ? (
        <div className="space-y-4 border-t pt-5 text-[13px]">
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-medium">
              <IconCheck aria-hidden className="size-3.5 text-link" /> Message sent
            </p>
            <p className="whitespace-pre-wrap text-muted-foreground">{sent.text || "Attached files"}</p>
            {sent.files.length > 0 && (
              <p className="mt-1 font-mono text-[12px] text-muted-foreground">
                {sent.files.length} {sent.files.length === 1 ? "file" : "files"} attached
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 font-medium">
              {status === "submitted" ? "Waiting for the assistant" : "Larkspur assistant"}
            </p>
            <p className="min-h-5 leading-relaxed text-muted-foreground">
              {response || (status === "submitted" ? "Your message is queued." : "")}
            </p>
            {stopped && (
              <p className="mt-2 text-[12px] text-muted-foreground">
                Generation stopped. The response may be incomplete.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="border-t pt-4 text-[12px] text-muted-foreground">
          Local demonstration. No message leaves this page.
        </p>
      )}
    </div>
  );
}

function CompactComposer() {
  const [sent, setSent] = useState("");
  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <PromptInput aria-label="Task note composer" onSubmit={(message) => setSent(message.text)}>
        <PromptInputBody>
          <PromptInputTextarea aria-label="Task note" placeholder="Add a note for John…" className="min-h-12 py-3" />
        </PromptInputBody>
        <PromptInputFooter>
          <span className="text-[12px] text-muted-foreground">Pepper starts · Bench 4</span>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
      <p role="status" className="text-[13px] text-muted-foreground">
        {sent ? `Note added: ${sent}` : "Keep a short composer next to the task."}
      </p>
    </div>
  );
}

export default function PromptInputExamples() {
  return (
    <>
      <SpecimenItem
        name="Prompt input"
        note="Compose a message with files and model controls. New files arrive softly, and the send control changes with the response state."
        wide
      >
        <PromptInputProvider initialInput={initialPrompt}>
          <ComposerDemo />
        </PromptInputProvider>
      </SpecimenItem>
      <SpecimenItem
        name="Prompt input compact"
        note="Add a task note in a smaller space. The full input group shows focus."
        wide
      >
        <CompactComposer />
      </SpecimenItem>
    </>
  );
}

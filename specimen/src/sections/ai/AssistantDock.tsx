import { type RefObject, useRef, useState } from "react";
import { IconDroplet, IconLeaf, IconPlant2, IconSeedling } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import {
  AssistantDock,
  AssistantDockClose,
  AssistantDockHeader,
  AssistantDockPanel,
  AssistantDockTrigger,
  type AssistantDockState,
} from "@sift-design/ui/ai/assistant-dock";
import { Conversation, ConversationContent, ConversationScrollButton } from "@sift-design/ui/ai/conversation";
import { Message, MessageContent } from "@sift-design/ui/ai/message";
import { ConversationNotice, ConversationNoticeDetail } from "@sift-design/ui/ai/notice";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@sift-design/ui/ai/prompt-input";
import { SlashMenu, SlashMenuItem, type SlashCommand, useSlashCommands } from "@sift-design/ui/ai/slash-menu";
import { SpecimenItem } from "../../frame";

const commands: SlashCommand[] = [
  { name: "new", description: "Start a new conversation without earlier messages" },
  { name: "summarize", description: "Summarize this conversation in three lines" },
  { name: "plan", description: "Plan the work before the assistant changes anything" },
  { name: "export", description: "Export the conversation as Markdown" },
];

type Line = { id: number; from: "user" | "assistant"; text: string };

const dockLines: Line[] = [
  { id: 1, from: "user", text: "Which benches need water before the plant sale?" },
  {
    id: 2,
    from: "assistant",
    text: "Benches 4 and 7. The seed trays on bench 4 dried out overnight, and bench 7 holds the lavender for Saturday.",
  },
  { id: 3, from: "user", text: "Add both to Alex's irrigation round." },
  {
    id: 4,
    from: "assistant",
    text: "Done. Alex Lee has benches 4 and 7 on the 10:30 round. I did not change the timer schedule.",
  },
];

/** A composer with slash commands. Picking a command fills the draft; sending shows what was sent. */
function SlashComposer({
  label,
  onSend,
  autoFocusTarget = false,
  draftRef,
}: {
  label: string;
  onSend: (text: string) => void;
  autoFocusTarget?: boolean;
  draftRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const [draft, setDraft] = useState("");
  const slash = useSlashCommands({
    commands,
    value: draft,
    onPick: (command) => setDraft("/" + command.name + (command.name === "new" ? "" : " ")),
  });
  return (
    <div className="relative">
      <SlashMenu {...slash.menuProps}>
        {slash.matches.map((command, index) => (
          <SlashMenuItem key={command.name} {...slash.getItemProps(index)} />
        ))}
      </SlashMenu>
      <PromptInput
        aria-label={label}
        onSubmit={(message) => {
          const text = message.text.trim();
          if (!text) return;
          onSend(text);
          setDraft("");
        }}
      >
        <PromptInputTextarea
          ref={draftRef}
          aria-label={label}
          data-autofocus={autoFocusTarget || undefined}
          placeholder="Ask, or type / for commands"
          className="min-h-12 py-3"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          {...slash.textareaProps}
        />
        <PromptInputFooter className="justify-end pb-2">
          <PromptInputSubmit disabled={!draft.trim()} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

const benches = [
  { name: "Bench 4", crop: "Seed trays, basil and thyme", icon: IconSeedling, note: "Dry" },
  { name: "Bench 7", crop: "Lavender for the plant sale", icon: IconPlant2, note: "Sale" },
  { name: "Bench 9", crop: "Tomato plugs", icon: IconLeaf, note: "OK" },
  { name: "Bench 12", crop: "Saturday market crates", icon: IconDroplet, note: "OK" },
];

const states: { value: AssistantDockState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "working", label: "Working" },
  { value: "unread", label: "Unread" },
  { value: "question", label: "Question" },
];

function DockDemo() {
  const [state, setState] = useState<AssistantDockState>("idle");
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(dockLines);
  const next = useRef(dockLines.length + 1);
  const send = (text: string) => {
    const id = next.current;
    next.current += 2;
    setLines((current) => [
      ...current,
      { id, from: "user", text },
      { id: id + 1, from: "assistant", text: "This demo does not call a model. Your message stays on this page." },
    ]);
  };
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative h-[520px] w-full overflow-hidden rounded-lg border bg-ground">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-muted-foreground">Fernbrook Greenhouse · Larkspur</span>
            <h4 className="text-[18px] font-semibold tracking-[-0.01em]">Propagation house</h4>
          </div>
          <ul className="flex max-w-[560px] flex-col divide-y rounded-lg border bg-card">
            {benches.map((bench) => (
              <li key={bench.name} className="flex items-center gap-3 px-4 py-3 text-[14px]">
                <bench.icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="w-[72px] shrink-0 font-medium">{bench.name}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{bench.crop}</span>
                <span className="text-[12px] text-muted-foreground">{bench.note}</span>
              </li>
            ))}
          </ul>
        </div>
        <AssistantDock position="relative" open={open} onOpenChange={setOpen}>
          <AssistantDockTrigger
            state={state}
            icon={<IconPlant2 className="size-4" />}
            labels={{
              idle: "Ask Larkspur",
              working: "Larkspur is working…",
              unread: "New reply from Larkspur",
              question: "Larkspur has a question",
            }}
          />
          <AssistantDockPanel aria-label="Larkspur assistant">
            <AssistantDockHeader>
              <span
                aria-hidden="true"
                className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-tint-strong text-foreground"
              >
                <IconPlant2 className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col">
                <h4 className="text-[14px] font-semibold tracking-[-0.01em]">Larkspur assistant</h4>
                <span className="font-mono text-[12px] text-muted-foreground">Meadowlark 3</span>
              </div>
              <AssistantDockClose />
            </AssistantDockHeader>
            <Conversation className="flex-1">
              <ConversationContent className="gap-4 px-4 py-4">
                <ConversationNotice>Started a new conversation. Earlier messages are not sent.</ConversationNotice>
                {lines.map((line) => (
                  <Message key={line.id} from={line.from}>
                    <MessageContent>{line.text}</MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <div className="shrink-0 px-3 pb-3">
              <SlashComposer label="Message Larkspur" onSend={send} autoFocusTarget />
            </div>
          </AssistantDockPanel>
        </AssistantDock>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pill state">
        <span className="text-[12px] text-muted-foreground">Pill state</span>
        {states.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={state === item.value ? "secondary" : "ghost"}
            aria-pressed={state === item.value}
            onClick={() => setState(item.value)}
          >
            {item.label}
          </Button>
        ))}
        <span className="ml-auto font-mono text-[12px] text-muted-foreground">⌘J / Ctrl J</span>
        <Button size="sm" variant="outline" aria-pressed={open} onClick={() => setOpen(!open)}>
          Toggle chat
        </Button>
      </div>
    </div>
  );
}

function NoticeDemo() {
  return (
    <div className="flex w-full max-w-[560px] flex-col gap-4 rounded-lg border bg-card p-4">
      <ConversationNotice tone="info">Started a new conversation. Earlier messages are not sent.</ConversationNotice>
      <Message from="user">
        <MessageContent>Draft the crate list for the Saturday market.</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          Twelve crates: six of lavender, four of basil and two of mixed herbs. Sam Taylor packs them on Friday.
        </MessageContent>
      </Message>
      <ConversationNotice tone="warning">
        This conversation is near its length limit. Start a new one to keep replies fast.
      </ConversationNotice>
      <Message from="user">
        <MessageContent>Add the price for each crate.</MessageContent>
      </Message>
      <ConversationNotice tone="error">
        The assistant could not reply. Try again in a minute.
        <ConversationNoticeDetail>
          429 Too Many Requests: rate limit reached for Meadowlark 3. Retry after 60 seconds.
        </ConversationNoticeDetail>
      </ConversationNotice>
    </div>
  );
}

function SlashDemo() {
  const [sent, setSent] = useState<string>();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const showCommands = () => {
    const node = textarea.current;
    if (!node) return;
    // Type a slash the way a person would, so the composer's own state updates.
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(node, "/");
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.focus();
  };
  return (
    <div className="flex w-full max-w-[560px] flex-col gap-3">
      <div className="flex min-h-[300px] flex-col justify-end gap-4 rounded-lg border bg-ground p-3">
        <Message from="assistant" className="px-1">
          <MessageContent>
            Bench 4 is on Alex&apos;s 10:30 round. Type / to run a command on this conversation.
          </MessageContent>
        </Message>
        <SlashComposer label="Message with commands" onSend={setSent} draftRef={textarea} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={showCommands}>
          Show commands
        </Button>
        <p className="text-[12px] text-muted-foreground" aria-live="polite">
          {sent ? (
            <>
              Sent <code className="font-mono text-foreground">{sent}</code>
            </>
          ) : (
            "Arrow keys move, Tab or Enter picks, Escape closes."
          )}
        </p>
      </div>
    </div>
  );
}

export default function AssistantDockSection() {
  return (
    <>
      <SpecimenItem
        name="Assistant dock"
        note="Use it to open an assistant from anywhere in an app. The pill changes shape into the panel on one smooth spring, and its text slides when the assistant state changes."
        wide
      >
        <DockDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Conversation notice"
        note="Use it for lines in a conversation that are not messages: a new conversation, a limit, or a failed reply. Details open on the kit disclosure."
      >
        <NoticeDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Slash menu"
        note="Use it to offer commands in a composer. The menu rises from the composer edge, and the highlight moves between rows on the selection spring."
      >
        <SlashDemo />
      </SpecimenItem>
    </>
  );
}

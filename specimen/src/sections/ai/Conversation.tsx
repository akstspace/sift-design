import { useRef, useState } from "react";
import { IconDownload, IconLeaf, IconMessages } from "@tabler/icons-react";
import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
  type ConversationMessage,
} from "@sift-design/ui/ai/conversation";
import { Suggestion, Suggestions } from "@sift-design/ui/ai/suggestion";
import { Bubble, BubbleContent } from "@sift-design/ui/bubble";
import { Button } from "@sift-design/ui/button";
import { Input } from "@sift-design/ui/input";
import { Message, MessageContent } from "@sift-design/ui/message";
import { SpecimenItem } from "../../frame";

type DemoMessage = ConversationMessage & { id: number; time: string; arrival?: boolean };
const textMessage = (id: number, role: DemoMessage["role"], text: string, time: string): DemoMessage => ({
  id,
  role,
  parts: [{ type: "text", text }],
  time,
});
const initialMessages = [
  textMessage(1, "user", "What needs attention in the propagation house today?", "09:10"),
  textMessage(
    2,
    "assistant",
    "John has 120 lavender plugs to pot on. The misting nozzles also need a check before the afternoon watering.",
    "09:10",
  ),
  textMessage(3, "user", "What did the last inspection find?", "09:11"),
  textMessage(
    4,
    "assistant",
    "The inspection note lists uneven misting on bench 3. Check the nozzle filters before changing the watering schedule.",
    "09:11",
  ),
  textMessage(5, "user", "Prepare a short handover for John.", "09:12"),
  textMessage(
    6,
    "assistant",
    "Start with the nozzle filters on bench 3. Then pot on the lavender plugs. Record any blocked nozzles in the maintenance list.",
    "09:12",
  ),
];
const followUps = [
  "The nozzle filters are clean. The next step is to compare the misting pattern across bench 3.",
  "John can check the misting pattern before potting on the lavender. Keep the watering schedule unchanged until the check is complete.",
  "The handover is ready for review. No tasks or schedules have changed in this local example.",
];
const prompts = [
  "Show the inspection notes",
  "Draft a handover for John",
  "Check the watering schedule",
  "List the market tasks",
];

export default function ConversationExamples() {
  const [messages, setMessages] = useState(initialMessages);
  const [empty, setEmpty] = useState(false);
  const [draft, setDraft] = useState("");
  const [suggestionDraft, setSuggestionDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const nextId = useRef(7);
  const replyIndex = useRef(0);
  const draftRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLInputElement>(null);

  function append(role: DemoMessage["role"], text: string) {
    if (!text.trim()) return;
    const message = { ...textMessage(nextId.current++, role, text.trim(), "09:13"), arrival: true };
    setMessages((current) => (empty ? [message] : [...current, message]));
    setEmpty(false);
    setAnnouncement(
      role === "user" ? "Message added to the conversation." : "Example reply added to the conversation.",
    );
  }

  return (
    <>
      <SpecimenItem
        name="Conversation"
        note="Keep new messages in view until the reader scrolls up. The jump button returns with a short spring."
        wide
      >
        <div className="w-full min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div className="flex items-center gap-2">
              <IconLeaf aria-hidden="true" className="size-5 text-accent" />
              <div>
                <h4 className="text-[14px] font-medium">Fernbrook Greenhouse</h4>
                <p className="text-[12px] text-muted-foreground">Propagation house · Local example</p>
              </div>
            </div>
            <ConversationDownload
              messages={empty ? [] : messages}
              filename="fernbrook-handover.md"
              disabled={empty}
              className="static"
              variant="ghost"
              size="sm"
            >
              <IconDownload aria-hidden="true" className="size-4" />
              <span>Download transcript</span>
            </ConversationDownload>
          </header>
          <Conversation className="h-[360px] flex-none" aria-label="Propagation house conversation">
            <ConversationContent className={empty ? "justify-center" : undefined}>
              {empty ? (
                <ConversationEmptyState
                  icon={<IconMessages className="size-7" />}
                  title="Plan the next greenhouse check"
                  description="Ask about an inspection or prepare a handover for your team."
                />
              ) : (
                messages.map((message) => (
                  <Message
                    key={message.id}
                    align={message.role === "user" ? "end" : "start"}
                    arrival={message.arrival}
                    reflow={false}
                  >
                    <MessageContent className="gap-1.5">
                      <div
                        className={`flex items-center gap-2 text-[12px] text-muted-foreground ${message.role === "user" ? "justify-end" : ""}`}
                      >
                        <span>{message.role === "user" ? "Jane Doe" : "Larkspur"}</span>
                        <time className="font-mono" dateTime={`2026-11-10T${message.time}:00`}>
                          {message.time}
                        </time>
                      </div>
                      <Bubble
                        align={message.role === "user" ? "end" : "start"}
                        variant={message.role === "user" ? "default" : "ghost"}
                        className="max-w-[92%] sm:max-w-[80%]"
                      >
                        <BubbleContent
                          className={message.role === "user" ? "rounded-[20px] px-4 py-2 text-[14px]" : "text-[14px]"}
                        >
                          {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("\n")}
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <form
            className="flex items-end gap-2 border-t pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              append("user", draft);
              setDraft("");
              draftRef.current?.focus();
            }}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="conversation-draft" className="mb-1.5 block text-[12px] font-medium">
                Message
              </label>
              <Input
                id="conversation-draft"
                ref={draftRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about the greenhouse…"
              />
            </div>
            <Button type="submit" disabled={!draft.trim()}>
              Send
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                append("assistant", followUps[replyIndex.current++ % followUps.length]);
              }}
            >
              Add example reply
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={empty}
              onClick={() => setEmpty((value) => !value)}
            >
              {empty ? "Restore conversation" : "Show empty state"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setMessages(initialMessages);
                setEmpty(false);
                setAnnouncement("Example conversation restored.");
              }}
            >
              Reset example
            </Button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-[12px] text-muted-foreground">
            {announcement || "Scroll up to read earlier messages. New messages do not interrupt your reading."}
          </p>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Suggestion"
        note="Offer short starting points without sending a message. Pills scroll horizontally and respond with a press spring."
        wide
      >
        <div className="w-full min-w-0 space-y-3">
          <div className="flex flex-wrap justify-between gap-1 text-[12px] text-muted-foreground">
            <span>Suggested next questions</span>
            <span>Scroll for more</span>
          </div>
          <Suggestions aria-label="Greenhouse questions">
            {prompts.map((prompt) => (
              <Suggestion
                key={prompt}
                suggestion={prompt}
                onClick={(value) => {
                  setSuggestionDraft(value);
                  suggestionRef.current?.focus({ preventScroll: true });
                }}
              />
            ))}
          </Suggestions>
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              append("user", suggestionDraft);
              setSuggestionDraft("");
              suggestionRef.current?.focus();
            }}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="suggestion-draft" className="mb-1.5 block text-[12px] font-medium">
                Question to review
              </label>
              <Input
                id="suggestion-draft"
                ref={suggestionRef}
                value={suggestionDraft}
                onChange={(event) => setSuggestionDraft(event.target.value)}
                placeholder="Choose a suggestion or write a question…"
              />
            </div>
            <Button type="submit" disabled={!suggestionDraft.trim()}>
              Add message
            </Button>
          </form>
          <p className="text-[12px] text-muted-foreground">
            Review the question before adding it to the conversation above.
          </p>
        </div>
      </SpecimenItem>
    </>
  );
}

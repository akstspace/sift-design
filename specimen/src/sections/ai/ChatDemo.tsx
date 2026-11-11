import { useEffect, useRef, useState } from "react";
import { defaultComponents, type Components } from "streamdown";
import type { UIMessage } from "ai";
import { useReducedMotion } from "motion/react";
import { IconLeaf, IconRefresh } from "@tabler/icons-react";
import { CopyStateIcon } from "@sift-design/ui/ai/copy-icon";
import { Button } from "@sift-design/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@sift-design/ui/ai/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
  MessageBranch,
  MessageBranchContent,
  MessageBranchSelector,
  MessageBranchPrevious,
  MessageBranchNext,
  MessageBranchPage,
} from "@sift-design/ui/ai/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputAttachments,
  PromptInputAttachment,
  type PromptInputMessage,
} from "@sift-design/ui/ai/prompt-input";
import { Suggestion } from "@sift-design/ui/ai/suggestion";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@sift-design/ui/ai/reasoning";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@sift-design/ui/ai/tool";
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationActions,
  ConfirmationAction,
  ConfirmationAccepted,
  ConfirmationRejected,
} from "@sift-design/ui/ai/confirmation";
import { Sources, SourcesTrigger, SourcesContent, Source } from "@sift-design/ui/ai/sources";
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
} from "@sift-design/ui/ai/inline-citation";
import { Context, ContextTrigger, ContextContent, ContextContentHeader } from "@sift-design/ui/ai/context";
import { SpecimenItem } from "../../frame";
import { models, prompts, scriptFor, mockReply } from "./chat/mock";

type Answer = { message: UIMessage; reasoningSeconds?: number; stopped?: boolean };
type Turn = { id: string; prompt: string; files: string[]; answers: Answer[] };

// A focusable table lets keyboard users scroll the renderer's narrow overflow region.
const markdownComponents: Components = {
  table: ({ node: _node, ...props }) => (
    <defaultComponents.table {...props} tabIndex={0} aria-label="Sample stock comparison" />
  ),
};

function AnswerBody({
  answer,
  busy,
  onRetry,
  onApprove,
  onNotice,
}: {
  answer: Answer;
  busy: boolean;
  onRetry: () => void;
  onApprove: (approved: boolean) => void;
  onNotice: (notice: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const parts = answer.message.parts;
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
  const source = parts.find((p) => p.type === "source-url");
  return (
    <Message from="assistant">
      <span className="text-[12px] font-medium text-muted-foreground">Larkspur assistant</span>
      <MessageContent className="w-full">
        {parts.map((part, index) => {
          if (part.type === "reasoning")
            return (
              <Reasoning
                key={index}
                isStreaming={part.state === "streaming"}
                duration={part.state === "done" ? answer.reasoningSeconds : undefined}
              >
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            );
          if (part.type === "text")
            return (
              <MessageResponse key={index} components={markdownComponents} isAnimating={part.state === "streaming"}>
                {part.text}
              </MessageResponse>
            );
          if (part.type === "tool-greenhouse")
            return (
              <Tool key={part.toolCallId} defaultOpen={false}>
                <ToolHeader title="Read greenhouse records" type={part.type} state={part.state} />
                <ToolContent>
                  <ToolInput input={part.input} />
                  <ToolOutput output={part.output} errorText={part.errorText} />
                </ToolContent>
              </Tool>
            );
          if (part.type === "tool-sendEmail")
            return (
              <Confirmation key={part.toolCallId} state={part.state} approval={part.approval}>
                <ConfirmationTitle>
                  <ConfirmationRequest>Approve this email to Hollins Florist?</ConfirmationRequest>
                  <ConfirmationAccepted>Email approved in this simulation. No email was sent.</ConfirmationAccepted>
                  <ConfirmationRejected>Email not approved. The draft is unchanged.</ConfirmationRejected>
                </ConfirmationTitle>
                <ConfirmationRequest>
                  <p className="text-[13px] text-muted-foreground">To: orders@hollins.larkspur.example</p>
                  <p className="text-[13px] text-muted-foreground">
                    This demo records approval only. It does not send email.
                  </p>
                </ConfirmationRequest>
                <ConfirmationActions>
                  <ConfirmationAction variant="outline" onClick={() => onApprove(false)}>
                    Keep draft
                  </ConfirmationAction>
                  <ConfirmationAction onClick={() => onApprove(true)}>Approve simulated send</ConfirmationAction>
                </ConfirmationActions>
              </Confirmation>
            );
          return null;
        })}
        {source && (
          <>
            <InlineCitation>
              <InlineCitationText className="text-[12px] text-muted-foreground">
                Based on the sample greenhouse record.
              </InlineCitationText>
              <InlineCitationCard>
                <InlineCitationCardTrigger sources={[source.url]} aria-label={`View citation: ${source.title}`} />
                <InlineCitationCardBody className="p-3 text-[13px]">
                  <p className="font-medium">{source.title}</p>
                  <p className="mt-1 text-muted-foreground">Fictional local record. No live data was requested.</p>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
            <Sources>
              <SourcesTrigger count={1} />
              <SourcesContent>
                <Source
                  href={source.url}
                  title={source.title}
                  onClick={(event) => {
                    event.preventDefault();
                    onNotice(`Sample source: ${source.title}. External navigation is disabled.`);
                  }}
                />
              </SourcesContent>
            </Sources>
          </>
        )}
        {answer.stopped && (
          <p className="text-[12px] text-muted-foreground">Response stopped. Retry to create another answer.</p>
        )}
      </MessageContent>
      {!busy && (
        <MessageActions>
          <MessageAction
            tooltip={copied ? "Copied" : "Copy answer"}
            label={copied ? "Copied" : "Copy answer"}
            disabled={!text}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                onNotice("Answer copied.");
              } catch {
                onNotice("Copy is unavailable. Select the answer text to copy it.");
              }
            }}
          >
            <CopyStateIcon state={copied ? "copied" : "idle"} />
          </MessageAction>
          <MessageAction tooltip="Retry answer" label="Retry answer" onClick={onRetry}>
            <IconRefresh aria-hidden="true" size={16} />
          </MessageAction>
        </MessageActions>
      )}
    </Message>
  );
}

/** A complete local conversation. No provider, request transport, or network is used. */
export default function ChatDemoExamples() {
  const reduced = useReducedMotion();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [model, setModel] = useState(models[0]);
  const [busy, setBusy] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [notice, setNotice] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const approval = useRef<((approved: boolean) => void) | null>(null);
  const sequence = useRef(0);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () => () => {
      controller.current?.abort();
      approval.current?.(false);
    },
    [],
  );

  const stop = () => {
    controller.current?.abort();
    approval.current?.(false);
    approval.current = null;
  };

  const run = async (prompt: string, files: string[] = [], retryTurn?: Turn) => {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    const id = `chat-${++sequence.current}`;
    const turnId = retryTurn?.id ?? `turn-${id}`;
    const initial: Answer = { message: { id, role: "assistant", parts: [] } };
    setTurns((current) =>
      retryTurn
        ? current.map((turn) => (turn.id === turnId ? { ...turn, answers: [...turn.answers, initial] } : turn))
        : [...current, { id: turnId, prompt, files, answers: [initial] }],
    );
    setBusy(true);
    setNotice("Reading greenhouse records…");
    const update = (answer: Answer) =>
      setTurns((current) =>
        current.map((turn) =>
          turn.id === turnId
            ? { ...turn, answers: turn.answers.map((existing) => (existing.message.id === id ? answer : existing)) }
            : turn,
        ),
      );
    let latest = initial.message;
    const startedAt = performance.now();
    let reasoningSeconds: number | undefined;
    try {
      const script = scriptFor(prompt, Boolean(retryTurn && retryTurn.answers.length % 2));
      for await (const message of mockReply(
        id,
        script,
        abort.signal,
        () =>
          new Promise<boolean>((resolve) => {
            approval.current = resolve;
            setAwaitingApproval(true);
            setNotice("Review the email draft. Approval is required.");
          }),
      )) {
        if (abort.signal.aborted) break;
        latest = message;
        if (
          reasoningSeconds === undefined &&
          message.parts.some((part) => part.type === "reasoning" && part.state === "done")
        ) {
          reasoningSeconds = Math.max(1, Math.ceil((performance.now() - startedAt) / 1000));
        }
        update({ message, reasoningSeconds });
        const responseText = message.parts.find((part) => part.type === "text");
        if (responseText?.state === "streaming") setNotice("Writing the response…");
      }
      if (abort.signal.aborted) throw new DOMException("Stopped", "AbortError");
      setNotice(
        script.email
          ? "Email review complete. No email was sent."
          : "Response complete. You can copy or retry this answer.",
      );
    } catch (error) {
      const parts = latest.parts.map((part): UIMessage["parts"][number] => {
        if (part.type === "text" || part.type === "reasoning") return { ...part, state: "done" as const };
        if (part.type === "tool-greenhouse" && part.state !== "output-available")
          return {
            type: part.type,
            toolCallId: part.toolCallId,
            state: "output-error" as const,
            input: part.input,
            errorText: "Record lookup stopped.",
          };
        if (part.type === "tool-sendEmail" && part.state === "approval-requested")
          return {
            type: part.type,
            toolCallId: part.toolCallId,
            state: "output-denied" as const,
            input: part.input,
            approval: { id: part.approval.id, approved: false as const },
          };
        return part;
      });
      update({
        message: { ...latest, parts },
        reasoningSeconds: reasoningSeconds ?? Math.max(1, Math.ceil((performance.now() - startedAt) / 1000)),
        stopped: true,
      });
      setNotice(
        error instanceof DOMException && error.name === "AbortError"
          ? "Response stopped. Nothing was sent."
          : "The local response stopped. Retry to create another answer.",
      );
    } finally {
      controller.current = null;
      approval.current = null;
      setBusy(false);
      setAwaitingApproval(false);
      textarea.current?.focus();
    }
  };

  const submit = ({ text, files }: PromptInputMessage) => {
    if (busy) return;
    const prompt = text.trim() || (files.length ? "Review the greenhouse notes with these attachments." : "");
    if (!prompt) return;
    setAttachmentError("");
    void run(
      prompt,
      files.map((file) => file.filename ?? "Attached file"),
    );
  };
  const approve = (approved: boolean) => {
    approval.current?.(approved);
    approval.current = null;
    setAwaitingApproval(false);
    setNotice(approved ? "Recording simulated approval…" : "Keeping the email draft…");
  };
  const usedTokens =
    1840 +
    turns.reduce(
      (sum, turn) =>
        sum +
        Math.ceil(
          (turn.prompt.length +
            turn.answers
              .map((answer) =>
                answer.message.parts
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join(""),
              )
              .join("").length) /
            4,
        ),
      0,
    );

  return (
    <SpecimenItem
      name="Chat"
      wide
      note="A local greenhouse assistant. Text streams, tools report progress, and email drafts require approval."
    >
      <section
        className="larkspur-chat bg-card border rounded-xl text-foreground"
        aria-label="Larkspur assistant chat"
        data-chat-status={busy ? "streaming" : "ready"}
      >
        <header className="larkspur-chat-header border-b">
          <div className="flex min-w-0 items-center gap-3">
            <IconLeaf aria-hidden="true" size={21} className="shrink-0 text-accent" />
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium">Larkspur assistant</h3>
              <p className="text-[12px] text-muted-foreground">Fernbrook Greenhouse</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Context usedTokens={usedTokens} maxTokens={32000}>
              <ContextTrigger
                aria-label={`${new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(usedTokens / 32000)} context used`}
                className="font-mono text-[12px]"
              />
              <ContextContent>
                <ContextContentHeader />
                <p className="p-3 text-[12px] text-muted-foreground">
                  Estimated sample tokens. The selected model does not run.
                </p>
              </ContextContent>
            </Context>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Reset chat"
              disabled={busy || !turns.length}
              onClick={() => {
                setTurns([]);
                setNotice("Chat cleared. Choose a question to start.");
                textarea.current?.focus();
              }}
            >
              <IconRefresh aria-hidden="true" size={16} />
            </Button>
          </div>
        </header>
        <Conversation
          className="larkspur-chat-conversation"
          initial={reduced ? "instant" : "smooth"}
          resize={reduced ? "instant" : "smooth"}
          aria-label="Chat messages"
          aria-live="off"
        >
          <ConversationContent className="larkspur-chat-messages">
            {!turns.length ? (
              <ConversationEmptyState className="larkspur-chat-empty">
                <div>
                  <h4 className="text-[18px] font-medium">What needs attention today?</h4>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Check growing conditions, prepare orders, or plan Saturday stock.
                  </p>
                </div>
                <div className="larkspur-chat-suggestions" aria-label="Suggested questions">
                  {prompts.map((prompt) => (
                    <Suggestion key={prompt} suggestion={prompt} onClick={(value) => void run(value)} />
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              turns.map((turn) => (
                <div key={turn.id} className="larkspur-chat-turn">
                  <Message from="user">
                    <MessageContent>
                      {turn.prompt}
                      {turn.files.length > 0 && (
                        <span className="text-[12px] text-muted-foreground">
                          Attached locally: {turn.files.join(", ")}. File contents are not analysed.
                        </span>
                      )}
                    </MessageContent>
                  </Message>
                  <MessageBranch key={`${turn.id}-${turn.answers.length}`} defaultBranch={turn.answers.length - 1}>
                    <MessageBranchContent>
                      {turn.answers.map((answer) => (
                        <AnswerBody
                          key={answer.message.id}
                          answer={answer}
                          busy={busy}
                          onRetry={() => void run(turn.prompt, turn.files, turn)}
                          onApprove={approve}
                          onNotice={setNotice}
                        />
                      ))}
                    </MessageBranchContent>
                    <MessageBranchSelector from="assistant">
                      <MessageBranchPrevious disabled={busy} />
                      <MessageBranchPage />
                      <MessageBranchNext disabled={busy} />
                    </MessageBranchSelector>
                  </MessageBranch>
                </div>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton aria-label="Scroll to latest message" />
        </Conversation>
        <footer className="larkspur-chat-composer border-t">
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {notice}
          </div>
          <PromptInput
            onSubmit={submit}
            multiple
            maxFiles={3}
            maxFileSize={5 * 1024 * 1024}
            onError={(error) => setAttachmentError(error.message)}
          >
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea
                ref={textarea}
                aria-label="Message Larkspur assistant"
                placeholder={awaitingApproval ? "Review the email draft above…" : "Ask about your greenhouse…"}
                disabled={busy}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger aria-label="Attachment options" disabled={busy} />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Attach local files" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputSelect value={model} onValueChange={setModel} disabled={busy}>
                  <PromptInputSelectTrigger aria-label="Model">
                    <PromptInputSelectValue />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {models.map((name) => (
                      <PromptInputSelectItem key={name} value={name}>
                        {name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </PromptInputTools>
              <PromptInputSubmit
                status={busy ? "streaming" : "ready"}
                type={busy ? "button" : "submit"}
                aria-label={busy ? "Stop response" : "Send message"}
                onClick={busy ? stop : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
          {attachmentError && (
            <p role="alert" className="mt-2 text-[12px] text-danger">
              {attachmentError}
            </p>
          )}
          <p className="mt-2 text-[12px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
        </footer>
      </section>
    </SpecimenItem>
  );
}

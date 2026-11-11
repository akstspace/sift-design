# AI elements

The AI components cover chat, reasoning, tool calls, code and developer output, workflow canvases, and voice. They are adapted from [AI Elements](https://elements.ai-sdk.dev) 1.9.1 and keep its component names and props, so code written against the upstream documentation keeps working. The styling, motion, demos, and documentation follow Sift Design. Each section ends with its changes from upstream and a link to the upstream reference.

Load them after the kit theme. `ai.css` adds the AI component motion and points Tailwind at the AI sources:

```css
@import "tailwindcss";
@import "@sift-design/ui/theme.css";
@import "@sift-design/ui/ai.css";
```

Import each component from `@sift-design/ui/ai/<component-name>`, for example `@sift-design/ui/ai/message`. The components use types from the `ai` package (`UIMessage`, `ToolUIPart`, `FileUIPart`), but they do not call a model. Connect them to your own transport, such as the AI SDK `useChat` hook. The live examples run on a local mock and never send a request.

Use only the parts your product needs. A support inbox may need messages, attachments, and sources; a coding tool may need tools, terminals, and commits. The fictional Fernbrook Greenhouse content in the examples is not a required feature set.

## Shared conventions

- **Chat pills.** A person's message is an end-aligned pill: fully rounded on one line, a 20px radius when it wraps, and at most 80% of the row. Assistant replies are plain prose with no bubble. Suggestions, attachment references, file chips, and toolbar toggles are pills too.
- **Streaming.** Streamed text appears as it arrives, without a per-word animation. Containers grow with a spring instead of jumping. A shimmer, caret, ring, or moving edge marker shows only while the work is real, and stops on the next frame after it ends. Under reduced motion these signals become static or opacity-only.
- **Disclosure.** Reasoning, tools, tasks, sources, commits, stack traces, and test suites open on `spring.smooth` and close on the shorter `spring.exit`, using the kit `Collapsible`. Status labels cross-fade in **140ms** and leave in **80ms**.
- **Copy.** Every copy action uses `CopyStateIcon` from `@sift-design/ui/ai/copy-icon`. The check pops in on `spring.lively`, the return to the copy icon settles on `spring.snappy`, and the old icon leaves on `spring.exit`. Nothing animates on first render.
- **Status.** Running, done, failed, and denied states use an icon and a word, never color alone. Danger is for failures; a major version or a context limit uses the warning color.
- **Honest numbers.** Durations, token counts, percentages, hashes, and versions use mono type with tabular figures. A counter that changes, such as the context percentage, counts on the same spring as its graphic.
- **No remote assets.** Logos, favicons, avatars, and the assistant persona are drawn locally. Streamdown plugins for math, diagrams, and code highlighting are opt-in through the `plugins` prop; fenced code in messages uses the kit `CodeBlock`.
- **Fictional models.** Examples use the invented providers Meadowlark, Quarry, and Tidewater. Supply your own model list and pricing.

The shared spring values are listed under [Shared animation settings](display.md#shared-animation-settings).

## Composed chat

**When:** Combine conversation parts when an assistant needs text, record lookups, sources, and approval in one view.

**Structure:** Keep the assistant header above `Conversation`. Put each answer inside `Message`. Pin `PromptInput` below the scroll region. Use `MessageBranch` to retain regenerated answers. Render reasoning, tools, citations, and confirmation from message parts.

**Props:** `Message.from` sets the speaker. `MessageResponse.children` receives streamed Markdown. `ToolHeader.state` follows the tool part. `Confirmation` receives `state` and `approval`. `PromptInputSubmit.status` controls its status icon. Set its button type and stop handler explicitly.

**Motion:** The composition adds no decorative motion. Child components use their own tokens. The local script streams reasoning for 1.2 seconds, then changes tool states over 1.1 seconds. Text streams over 4.3 seconds. Email approval pauses the script until a person responds.

**Reduced motion:** Text still streams. The conversation uses instant scroll updates. Child components remove decorative travel under the reduced-motion preference.

**Accessibility:** Name the conversation, textarea, model select, and icon buttons. Announce phase changes in a polite status region. Do not announce every text chunk. Keep the composer outside the scrolling conversation. Label approval with its consequence. Make wide Markdown tables keyboard-focusable through the renderer's `components.table` override.

**Changes from upstream:** This example uses local message snapshots and fictional models. It makes no model requests. Attachments remain local; their contents are not analysed. Email approval records a simulated decision and never sends email. Source links show fictional records; this demo disables external navigation. Context tokens are estimates.

```tsx
import { Conversation, ConversationContent, ConversationScrollButton } from "@sift-design/ui/ai/conversation";
import { Message, MessageContent, MessageResponse } from "@sift-design/ui/ai/message";
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from "@sift-design/ui/ai/prompt-input";

function LocalChat({ messages, streaming, submit, stop }) {
  return (
    <section className="flex h-[640px] flex-col">
      <Conversation aria-label="Chat messages" aria-live="off">
        <ConversationContent>
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts
                  .filter((part) => part.type === "text")
                  .map((part, i) => (
                    <MessageResponse key={i}>{part.text}</MessageResponse>
                  ))}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton aria-label="Scroll to latest message" />
      </Conversation>
      <PromptInput onSubmit={submit}>
        <PromptInputTextarea aria-label="Message the assistant" disabled={streaming} />
        <PromptInputSubmit
          status={streaming ? "streaming" : "ready"}
          type={streaming ? "button" : "submit"}
          aria-label={streaming ? "Stop response" : "Send message"}
          onClick={streaming ? stop : undefined}
        />
      </PromptInput>
    </section>
  );
}
```

Upstream reference: [AI Elements chatbot](https://elements.ai-sdk.dev/examples/chatbot).

## Conversation

**When:** show a message history that follows new messages until the reader scrolls away.

**Structure:** `Conversation` contains `ConversationContent` and `ConversationScrollButton`. Put messages or `ConversationEmptyState` inside the content. `ConversationDownload` defaults to a top-right icon button inside the root. Use `className="static"` to place it in a separate toolbar.

**Props:** `Conversation` retains the `use-stick-to-bottom` props, including `initial`, `resize`, `instance`, and `contextRef`. `ConversationContent` accepts `scrollClassName` for the scrolling viewport. `ConversationEmptyState` accepts `title`, `description`, `icon`, or custom `children`. The scroll button accepts all kit button props. Its `onClick` can cancel scrolling with `event.preventDefault()`.

`ConversationDownload` accepts `messages`, `filename` (default `conversation.md`), and `formatMessage(message, index)`. `messagesToMarkdown(messages, formatMessage?)` returns the same transcript without downloading it. Both APIs infer the message type, including `UIMessage` metadata and IDs. The existing `{ formatMessage }` options form remains supported. Messages with only `role` and `parts` also remain supported.

The default formatter concatenates text parts without a separator. It prefixes each message with `**Role:** ` and separates messages with two newlines. It excludes tool payloads and reasoning. The formatter can include other parts explicitly. Downloads use a local Blob and release the object URL after use.

**Motion:** the jump button uses `spring.snappy` for arrival and `spring.exit` for departure. Their visual durations are **200ms** and **160ms**. CSS curves settle over **358ms** and **335ms**. Opacity uses `duration.quick` (**140ms linear**) on arrival and `duration.instant` (**80ms leave**) on departure. The button stays mounted so interrupted transitions can reverse. The empty state uses a **140ms linear fade**. Scrolling retains the dependency's smooth behavior. Scroll physics are separate from the motion tokens.

**Reduced motion:** initial, resize, and jump scrolling use `instant`. The jump button only fades. The empty state retains its short fade. An externally supplied `instance` controls its own scrolling behavior.

**Accessibility:** the root has `role="log"` and a polite live region. Set `aria-label` to identify the conversation. Content is keyboard focusable and has an inset focus outline. The jump button has an accessible name. Hidden jump controls are inert and cannot receive focus. Download labels describe the file action. Use stable message keys so existing messages do not replay arrival motion.

**Changes from upstream:**

- Uses the kit theme, icon set, focus treatment, and motion tokens.
- Adds a named jump button, cancellable click handling, and a calm empty-state fade.
- Retains the download and formatter exports, callback signature, and default transcript format from the current source.
- Also accepts the earlier options-object formatter API and messages with only `role` and `parts`.
- Supports a cancellable download click and delays object-URL release until the browser can consume it.
- No upstream features were skipped.
- Adds viewport styling through `scrollClassName` without replacing scroll behavior.

```tsx
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  ConversationDownload,
  type ConversationMessage,
} from "@sift-design/ui/ai/conversation";

const messages: ConversationMessage[] = [
  { role: "user", parts: [{ type: "text", text: "What needs attention today?" }] },
  { role: "assistant", parts: [{ type: "text", text: "Check the misting nozzles on bench 3." }] },
];

function GreenhouseConversation() {
  return (
    <div className="w-full min-w-0">
      <ConversationDownload messages={messages} filename="greenhouse-notes.md" className="static" />
      <Conversation className="h-80 flex-none" aria-label="Greenhouse planning">
        <ConversationContent>
          {messages.length ? (
            messages.map((message, index) => (
              <p key={index}>{message.parts.map((part) => (part.type === "text" ? part.text : "")).join("\n")}</p>
            ))
          ) : (
            <ConversationEmptyState
              title="No inspection notes yet"
              description="Ask about the next greenhouse check."
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
```

Upstream reference: [AI Elements Conversation](https://elements.ai-sdk.dev/components/conversation).

## Suggestion

**When:** offer short questions or actions that help a person start a conversation. Let the person review consequential requests before sending them.

**Structure:** `Suggestions` wraps a horizontal scroll area. Place `Suggestion` buttons inside it. Each button displays its `suggestion` text unless `children` supplies a custom label.

**Props:** `Suggestions` retains scroll-area props. Its `className` styles the inner row, as upstream does. Set `aria-label` to describe the set. `Suggestion` requires `suggestion`. Its `onClick(suggestion)` receives that string. Kit button props include `variant`, `size`, `disabled`, and `loading`. Defaults are `variant="outline"`, `size="sm"`, and `type="button"`.

**Motion:** pills use `spring.press` at **120ms visual duration**, with **0 bounce**, scaling to **0.97** while pressed. The CSS curve settles over **263ms**. Colors and focus feedback use `duration.quick` (**140ms**). The row has no entrance animation.

**Reduced motion:** scale is removed. Color and focus feedback remain. Horizontal scrolling follows native input.

**Accessibility:** suggestions are real buttons with visible focus rings. The row reserves space for focus outlines. Keyboard focus brings off-screen buttons into view. The scroll viewport is keyboard focusable and named. Keep labels short and specific. Do not use selection roles for buttons that fill a draft.

**Changes from upstream:**

- Uses semantic colors, pill shapes, and the shared press spring.
- Adds a named scroll region and space around focus rings.
- Retains the callback signature, inner-row `className`, and horizontal scrolling behavior.

```tsx
import { useState } from "react";
import { Suggestion, Suggestions } from "@sift-design/ui/ai/suggestion";
import { Input } from "@sift-design/ui/input";

function GreenhouseSuggestions() {
  const [draft, setDraft] = useState("");
  return (
    <div className="w-full min-w-0 space-y-3">
      <Suggestions aria-label="Greenhouse questions">
        <Suggestion suggestion="Show the inspection notes" onClick={setDraft} />
        <Suggestion suggestion="Draft a handover for John" onClick={setDraft} />
        <Suggestion suggestion="Check the watering schedule" onClick={setDraft} />
      </Suggestions>
      <label htmlFor="question" className="block text-[13px]">
        Question to review
      </label>
      <Input id="question" value={draft} onChange={(event) => setDraft(event.target.value)} />
    </div>
  );
}
```

Upstream reference: [AI Elements Suggestion](https://elements.ai-sdk.dev/components/suggestion).

## Message

**When:** show a conversation with user messages and assistant responses. User messages use a bubble. Assistant responses use plain prose.

**Structure:** `Message from` contains `MessageContent`, optional `MessageAttachments` with `MessageAttachment`, and `MessageToolbar` with `MessageActions` and `MessageAction`. Use `MessageResponse` inside the content for streamed Markdown. For answer versions, wrap `MessageBranchContent` and `MessageBranchSelector` in `MessageBranch`. Put one answer inside each branch child. The selector contains `MessageBranchPrevious`, `MessageBranchPage`, and `MessageBranchNext`.

**Props:** `Message.from` accepts the message role. `MessageAction` accepts button props plus `tooltip` and `label`. `MessageBranch` accepts `defaultBranch=0` and `onBranchChange(index)`. Navigation wraps between the first and last answers. `MessageBranchSelector` accepts all `ButtonGroup` props, including `orientation`. Its optional `from` prop remains available for older consumers. `MessageAttachment.data` accepts a file message part with `url`, `mediaType`, and optional `filename`. `onRemove` adds a named remove button. `MessageResponse` accepts all `Streamdown` props, including `children`, `isAnimating`, `components`, `plugins`, and `mode`. Streamdown is the Markdown renderer. Set `isAnimating` only while text arrives. The application owns streaming, copy feedback, retry, and helpful state.

**Motion:** branch navigation cross-fades with a **14px** directional entrance and **10px** opposite exit. Entrance uses `spring.smooth` (**280ms** visual duration, no bounce), with a `duration.quick` (**140ms**) fade. Exit uses `spring.exit` (**160ms** visual duration, no bounce), with `duration.instant` (**80ms**) and `leave` for opacity. All answers stay mounted. Inactive answers do not affect layout or receive input. Actions change opacity on hover or focus over **140ms**. Streamed words do not replay an entrance. The specimen confirms copy in place with `spring.snappy`, a **140ms** fade, and an **80ms** exit fade.

**Reduced motion:** branches use **140ms** entrance and **80ms** exit fades without travel or springs. The specimen removes copy-icon scale. Optional renderer text animations are disabled by the reduced-motion stylesheet.

**Accessibility:** name icon actions with `label`, `tooltip`, or `aria-label`. Branch navigation uses real buttons. The page count announces changes politely. Inactive answers are inert and hidden from assistive technology. Attachment removal remains visible and keyboard reachable. Use a separate status for response completion, rather than announcing each streamed word. The specimen reports copy failures without claiming success.

**Changes from upstream:**

- User messages align to the end at **80%** maximum width, with **16px** horizontal and **8px** vertical padding.
- User bubbles use a **20px** radius. One-line messages appear fully rounded; wrapped text keeps comfortable corners.
- Place file attachments above the user bubble. They use compact pill chips.
- Assistant responses use the kit prose type, spacing, lists, links, tables, and code treatment.
- Icons use the kit icon set. File attachments show their names without a hover requirement.
- Branches preserve mounted state and use directional motion. Selection stays valid when answers are removed.
- `MessageResponse` compares all props, not only text, so renderer options can change independently.
- Renderer controls and per-word animations default to `false`. Both remain available as explicit props.
- Upstream enables `cjk`, `code`, `math`, and `mermaid` plugins by default. This version keeps all four opt-in to avoid extra dependencies and remote assets.
- Fenced code uses the kit `CodeBlock` through the renderer's `components` override. It highlights with local lazy grammars and theme variables.
- `lineNumbers`, the `noLineNumbers` fence flag, and `codeBlockMaxHeight` apply to the kit code renderer.
- Explicit code, diagram, or custom-renderer plugins use the native renderer instead. Enabled `controls` and `startLine` fence metadata also use the native renderer.
- Consumer `components` overrides take priority.
- Branch callbacks, context, and child normalization are memoized. Attachment exports remain available for compatibility, although current upstream removed them.
- `streamdown/styles.css` loads through the message stylesheet. Load `@sift-design/ui/ai.css` after the kit theme.
- Use local, inline, or generated image URLs. The component does not fetch attachment metadata.

```tsx
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageBranch,
  MessageBranchContent,
  MessageBranchSelector,
  MessageBranchPrevious,
  MessageBranchPage,
  MessageBranchNext,
} from "@sift-design/ui/ai/message";

<Message from="assistant">
  <MessageBranch>
    <MessageBranchContent>
      <MessageContent key="vents">
        <MessageResponse>{"### Check the roof vents\n\nAsk John Smith to inspect the vents."}</MessageResponse>
      </MessageContent>
      <MessageContent key="misting">
        <MessageResponse>
          {"### Check the misting nozzles\n\nRecord the temperature after **15 minutes**."}
        </MessageResponse>
      </MessageContent>
    </MessageBranchContent>
    <MessageBranchSelector>
      <MessageBranchPrevious />
      <MessageBranchPage />
      <MessageBranchNext />
    </MessageBranchSelector>
  </MessageBranch>
</Message>;
```

For optional extended Markdown, install and bundle the plugins in the consuming application. CJK means Chinese, Japanese, and Korean text processing. Keep diagram assets, math fonts, and grammars local. The `plugins` prop accepts any subset:

```tsx
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { MessageResponse } from "@sift-design/ui/ai/message";

<MessageResponse plugins={{ cjk, code, math, mermaid }} isAnimating={streaming}>
  {markdown}
</MessageResponse>;
```

Upstream reference: [AI Elements Message](https://elements.ai-sdk.dev/components/message).

## Shimmer

**When:** indicate active thinking or preparation with a short text label. Remove the shimmer when work finishes. Do not use it on idle text.

**Structure:** `Shimmer` renders its text as a paragraph by default. Wrap it in a status region when the activity needs an announcement.

**Props:** `children` is a string. `as` selects an element or component; the default is `"p"`. Custom components must forward `className` and `style`. `duration=2` sets the cycle length in seconds. `spread=2` sets the highlight width in pixels per character. `className` adds styling. Duration has a **0.1s** minimum; negative spread becomes zero.

**Motion:** a text-only highlight moves through the ink and muted-ink tokens. The default cycle lasts **2 seconds**, with linear timing. It repeats only while the component is mounted for active work. There is no entrance or exit motion. Text changes preserve the element instead of creating a new animated component.

**Reduced motion:** the highlight stops. Text uses the static muted-ink token. Forced-color mode also uses static text.

**Accessibility:** keep a meaningful text label. Put the status role on a parent when an announcement is useful. Avoid announcing each intermediate update. The highlight does not encode information that is absent from the label.

**Changes from upstream:**

- Uses ink tokens instead of fixed colors and background-colored highlights.
- Current upstream caches animated element types to prevent remounts. This version achieves the same behavior with a stable element and stylesheet.
- Reduced motion and forced colors show readable, static text.
- Load `@sift-design/ui/ai.css` after the kit theme for the activity stylesheet.

```tsx
import { Shimmer } from "@sift-design/ui/ai/shimmer";

<div role="status">
  {thinking ? (
    <Shimmer as="span" duration={2} spread={2}>
      Thinking…
    </Shimmer>
  ) : (
    <span>Notes checked. Ready to respond.</span>
  )}
</div>;
```

Upstream reference: [AI Elements Shimmer](https://elements.ai-sdk.dev/components/shimmer).

## Prompt input

**When:** Compose a message with optional files, model selection, and other tools. Use a compact layout beside a task.

**Structure:** `PromptInput` is a form built on `InputGroup`. Place `PromptInputTextarea` inside `PromptInputBody`. Use `PromptInputHeader` for extra controls. Place `PromptInputTools` and `PromptInputSubmit` inside `PromptInputFooter`. Render `PromptInputAttachments` with a function that returns `PromptInputAttachment`.

`PromptInputProvider` optionally shares text and files outside the form. `usePromptInputController` exposes `textInput` and `attachments`. `useProviderAttachments` requires that provider. `usePromptInputAttachments` works inside either the form or provider.

The action menu exports its root, trigger, content, item, `PromptInputActionAddAttachments`, and `PromptInputActionAddScreenshot`.

`PromptInputActionAddScreenshot` captures one frame through browser screen sharing. It stops all capture tracks after conversion to a PNG file. Its `label` changes the menu text. `onSelect` can prevent capture. Canceling screen sharing or denying permission does not add a file. Unsupported browsers do not add a file. Other capture errors propagate. This action requires a secure browser context and screen-sharing permission. Select and hover-card parts wrap the corresponding kit controls. Tab exports provide layout sections, not interactive tabs. Command exports wrap searchable command parts. `PromptInputSpeechButton` uses browser speech recognition when available.

**Props:** `PromptInput` requires `onSubmit(message, event)`. `PromptInputMessage` contains `text: string` and `files: FileUIPart[]`. `accept`, `multiple`, `maxFiles`, and `maxFileSize` configure local file input. `maxFileSize` uses bytes. `onError` receives `accept`, `max_files`, or `max_file_size` errors. File constraints apply inside the form, including provider-backed forms. Direct provider attachment methods outside the form do not apply those constraints.

`globalDrop` accepts files across the document. Its default is `false`. `syncHiddenInput` retains upstream behavior: it resets an empty file input but does not synchronize native form files. Blob URLs become data URLs before submission. Successful submissions clear files and provider text. An async rejection keeps files and provider text. Uncontrolled text resets before submission, as upstream.

`PromptInputTextarea` accepts native textarea props. It grows with its content up to `max-h-48`. Enter submits. Shift + Enter inserts a line. Backspace removes the last file when the field is empty. Pasting files attaches them. An external `onKeyDown` runs first. Call `preventDefault()` to suppress the internal keyboard behavior.

`usePromptInputReferencedSources` exposes form-local `sources`, `add`, `remove`, and `clear`. `ReferencedSourcesContext` describes that API. `LocalReferencedSourcesContext` is also exported. Sources use `SourceDocumentUIPart` with generated IDs. Add one source or an array. Successful submission clears the sources. Rejected submission retains them. Sources do not become part of `PromptInputMessage`; read them in a child when preparing a request.

`PromptInputButton.tooltip` accepts text or `{ content, shortcut?, side? }`. `PromptInputButtonTooltip` exports that type. Shortcut text uses monospace type. Provide the kit `TooltipProvider` around tooltip-enabled controls.

`PromptInputSubmit.status` accepts `ready`, `submitted`, `streaming`, and `error`. These states show send, pending, stop, and error icons. Supply `onStop` to stop a pending or streaming request. With `onStop`, generating states automatically use a non-submit button and call that handler instead of `onClick`. The consuming application cancels the operation. Existing `type` and `onClick` usage remains supported. Supply `disabled` during submission when duplicate requests are not allowed. `children` replaces the icon.

**Motion:** Attachment insertion uses `arrivalMotion`: `spring.smooth`, visual duration **280ms**, bounce **0**. Attachment removal uses `spring.exit`, visual duration **160ms**, with a **120ms** fade. Stable file IDs prevent repeated entrances. The attachment row measures its content and springs its own height open on `spring.smooth` and closed on `spring.exit`, so the composer grows instead of jumping. Sibling positions use `reflowTransition` and `spring.smooth`. Submit icons enter on `spring.snappy`, visual duration **200ms**, bounce **0.12**. They exit on `spring.exit`, with an **80ms** fade. Focus and drop feedback use `duration.quick`, **140ms**. The pending indicator rotates only while status is `submitted`.

**Reduced motion:** Attachments use a **140ms** arrival fade and a **60ms** exit fade. The attachment row height changes at once. Reflow becomes immediate. Submit icons use **80ms** fades without travel or scale. The pending indicator is static.

**Accessibility:** Icon buttons have action labels. Submit labels include “Send message”, “Sending message”, “Stop generating”, and “Retry message”. Callers can override these labels. The whole composer shows a focus ring. Attachment removal stays visible and keyboard reachable. The file picker is a non-drag alternative. A file drop target announces its purpose. Give textareas descriptive labels and link errors with `aria-describedby`. Announce meaningful request states in the consuming application.

**Changes from upstream:**

- Uses kit surfaces, spacing, type, icons, and motion tokens.
- Adds whole-group focus feedback and a visible file drop target.
- Adds attachment arrival, removal, and position motion.
- Uses compact attachment pills with visible file removal.
- Uses pill-shaped tool toggles with a pressed outline. The specimen Search toggle also changes its icon.
- Adds status-specific submit labels and interruptible icon swaps.
- Retains every current upstream export and adds the older attachment and speech exports for compatibility. No upstream behavior was skipped.
- The model selector uses a tinted pill with the same height as footer tools.
- The specimen uses fictional models and local generated image files. It makes no network requests.

```tsx
import { useState } from "react";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@sift-design/ui/ai/prompt-input";

export function TaskComposer() {
  const [sent, setSent] = useState("");

  return (
    <>
      <PromptInput multiple onSubmit={(message) => setSent(message.text)}>
        <PromptInputAttachments>{(file) => <PromptInputAttachment data={file} />}</PromptInputAttachments>
        <PromptInputBody>
          <PromptInputTextarea aria-label="Message to Larkspur" />
        </PromptInputBody>
        <PromptInputFooter>
          <span>Fernbrook Greenhouse</span>
          <PromptInputSubmit status="ready" />
        </PromptInputFooter>
      </PromptInput>
      <p role="status">{sent ? `Message sent: ${sent}` : "No message sent."}</p>
    </>
  );
}
```

Upstream reference: [AI Elements Prompt input](https://elements.ai-sdk.dev/components/prompt-input).

## Context

**When:** Show how much of a model's context window a conversation uses. A token is a unit of text processed by the model.

**Structure:** `Context` wraps `ContextTrigger` and `ContextContent`. Content contains `ContextContentHeader`, `ContextContentBody`, and `ContextContentFooter`. Place `ContextInputUsage`, `ContextOutputUsage`, `ContextReasoningUsage`, and `ContextCacheUsage` inside the body.

**Props:** `usedTokens` and `maxTokens` set the meter. `usage` accepts current usage details and earlier `reasoningTokens` and `cachedInputTokens` fields. `modelId` accepts any string but does not load pricing. `pricing={{ input, output, cachedInput?, reasoning? }}` supplies US dollars per million tokens. Cached input defaults to the input rate. Reasoning defaults to the output rate. Cached and reasoning counts are subsets of input and output totals. The estimated total does not count them twice. Missing token counts hide their rows. Zero counts remain visible. Without pricing, costs are hidden. Root `open`, `defaultOpen`, and `onOpenChange` control the detail card. All content parts accept custom children.

**Motion:** Ring changes use `spring.smooth`: a 280ms visual duration with no bounce. The ring does not replay an entrance. The detail card uses the kit overlay motion: `spring.snappy` on entry and `spring.exit` on exit. Opacity uses 140ms entry and 80ms exit fades. The default hover delays are 150ms open and 100ms close.

**Reduced motion:** Ring changes are instant. The detail card uses 140ms entry and 80ms exit fades without scale or travel.

**Accessibility:** The default trigger is a named button with expanded state. Hover, focus, and click show details. Escape closes details. Percentages and counts use tabular mono type. The trigger percentage counts in whole percents on the same `spring.smooth` as the ring; under reduced motion it updates at once. At 90% usage, a warning icon and label accompany the warning color. Meter geometry clamps between zero and the maximum. The details retain exact token counts.

**Changes from upstream:**

- Explicit pricing replaces model lookup. Unknown model IDs never produce a misleading zero cost.
- No `tokenlens` dependency is used by this component.
- Current nested usage fields and earlier flat fields are supported.
- The default trigger supports click, touch, and Escape.
- The header uses exact counts and a status label instead of a second progress bar.
- Provider values use upstream memoization, extended to include pricing and detail-card state.

```tsx
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextInputUsage,
  ContextOutputUsage,
  ContextContentFooter,
} from "@sift-design/ui/ai/context";

<Context
  usedTokens={15360}
  maxTokens={128000}
  modelId="meadowlark-3"
  usage={{ inputTokens: 12288, outputTokens: 3072 }}
  pricing={{ input: 2, output: 8 }}
>
  <ContextTrigger />
  <ContextContent>
    <ContextContentHeader />
    <ContextContentBody>
      <ContextInputUsage />
      <ContextOutputUsage />
    </ContextContentBody>
    <ContextContentFooter />
  </ContextContent>
</Context>;
```

Upstream reference: [AI Elements Context](https://elements.ai-sdk.dev/components/context).

## Model selector

**When:** Let people search and select a model without leaving a conversation.

**Structure:** `ModelSelector` wraps `ModelSelectorTrigger` and `ModelSelectorContent`. Content contains `ModelSelectorInput`, `ModelSelectorList`, and `ModelSelectorEmpty`. Group `ModelSelectorItem` elements with `ModelSelectorGroup`. Use `ModelSelectorName`, `ModelSelectorLogo`, and `ModelSelectorShortcut` within items. `ModelSelectorSeparator` divides groups. `ModelSelectorLogoGroup` combines local marks. `ModelSelectorDialog` provides the alternative command-dialog root.

**Props:** Root `open` and `onOpenChange` control the dialog. Content `title` defaults to “Choose a model”. Items use `value`, `keywords`, `disabled`, and `onSelect`. Logo `provider` accepts any string. Its first letter creates a local monogram. Logo props now describe a span, not an image. `ModelSelectorShortcut` displays a shortcut; the caller registers its keyboard handler.

**Motion:** The dialog inherits `spring.smooth`: 280ms visual duration with no bounce. Exit uses `spring.exit`: 160ms visual duration with no bounce. The overlay fades in over 140ms and out over 80ms. Item background feedback uses `duration.instant` at 80ms. Search results update without entrance animations.

**Reduced motion:** The dialog uses brief fades without travel or scale. Selection feedback updates instantly.

**Accessibility:** The dialog supplies a title and description. Give the input a meaningful accessible name. Arrow keys navigate results. Enter selects a result. Escape closes the dialog and restores trigger focus. Keep the selected model on the trigger. Pair provider marks with provider names. Marks are decorative.

**Changes from upstream:**

- Local generated monograms replace remotely loaded provider images.
- `ModelSelectorLogo` retains its export and `provider` prop. Image-only props are no longer supported.
- The content supplies a default accessible description instead of suppressing `aria-describedby`. Callers can still override `aria-describedby`.
- The content keeps the kit's semantic border instead of the upstream outline-only treatment.
- Examples use fictional models and providers.

```tsx
import { useState } from "react";
import { Button } from "@sift-design/ui/button";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@sift-design/ui/ai/model-selector";

function ModelChoice() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("Meadowlark 3");
  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button variant="outline">{model}</Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput aria-label="Search models" placeholder="Search models…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models match. Try another name.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Meadowlark">
            {["Meadowlark 3", "Meadowlark 3 Mini"].map((name) => (
              <ModelSelectorItem
                key={name}
                value={name}
                onSelect={() => {
                  setModel(name);
                  setOpen(false);
                }}
              >
                <ModelSelectorLogo provider="Meadowlark" />
                <ModelSelectorName>{name}</ModelSelectorName>
              </ModelSelectorItem>
            ))}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
```

Upstream reference: [AI Elements Model selector](https://elements.ai-sdk.dev/components/model-selector).

## Open in chat

**When:** Send a question to a destination selected by the person. No request occurs before a destination link opens.

**Structure:** `OpenIn` provides the query. `OpenInTrigger` opens `OpenInContent`. Use `OpenInLabel` and `OpenInSeparator` to organize `OpenInDestination` links. `OpenInItem` remains available for custom actions.

**Props:** Root `query` is the text passed to every destination. `OpenInDestination` requires `title` and `href(query)`. It accepts `icon`, `disabled`, `onSelect`, and `target`. The default target is `_blank`. Links include `noopener noreferrer`. Encode query parameters with `URLSearchParams`. Use `OpenInTrigger` children for a custom button. Content supports alignment and placement props.

**Motion:** The menu inherits `spring.snappy`: 200ms visual duration with 0.12 bounce. Exit uses `spring.exit`: 160ms visual duration with no bounce. Opacity uses 140ms entry and 80ms exit fades. The menu grows from its trigger. It does not animate individual items.

**Reduced motion:** Entry and exit use brief fades without travel or scale.

**Accessibility:** The trigger is a real button with menu state. Arrow keys navigate items. Enter activates the selected link. Escape dismisses the menu and restores focus. New-tab links announce that behavior. Destination icons are decorative. Disabled destinations have no URL.

**Changes from upstream:**

- Provider-specific destination exports are removed.
- `OpenInDestination` replaces those exports with a caller-defined title, URL builder, and optional icon.
- The shared root, trigger, content, label, separator, and item exports remain available.
- No remote logos, predefined services, or network requests are included. Hard-coded destination URLs and vendor marks remain excluded after the upstream refresh.
- Query provider values retain upstream memoization.

```tsx
import { IconBook2, IconFileText } from "@tabler/icons-react";
import {
  OpenIn,
  OpenInTrigger,
  OpenInContent,
  OpenInLabel,
  OpenInSeparator,
  OpenInDestination,
} from "@sift-design/ui/ai/open-in-chat";

<OpenIn query="Which seedlings need less water?">
  <OpenInTrigger />
  <OpenInContent>
    <OpenInLabel>Continue with this question</OpenInLabel>
    <OpenInSeparator />
    <OpenInDestination
      title="Larkspur Notes"
      href={(query) => `https://larkspur.example/notes?${new URLSearchParams({ q: query })}`}
      icon={<IconFileText />}
    />
    <OpenInDestination
      title="Fernbrook Wiki"
      href={(query) => `https://larkspur.example/wiki?${new URLSearchParams({ q: query })}`}
      icon={<IconBook2 />}
    />
  </OpenInContent>
</OpenIn>;
```

Upstream reference: [AI Elements Open in chat](https://elements.ai-sdk.dev/components/open-in-chat).

## Attachments

**When:** Show files and source documents with image previews, compact references or detailed rows.

**Structure:** `Attachments` supplies the variant and presence boundary. Each keyed `Attachment` contains `AttachmentPreview`, `AttachmentInfo` and optional `AttachmentRemove`. Wrap a preview trigger with `AttachmentHoverCard` to show supporting details. `AttachmentEmpty` supplies an empty state.

**Props:** `Attachments.variant`: `grid` (default), `inline` or `list`. `Attachment.data`: a file or source-document part with a stable `id`. `Attachment.onRemove`: remove callback. `AttachmentInfo.showMediaType`: show the media type. `AttachmentPreview.fallbackIcon`: custom fallback. `AttachmentRemove.label`: accessible action name. Hover-card parts retain the base component props. `getMediaCategory` and `getAttachmentLabel` support custom layouts.

**Motion:** New keyed items use `arrivalMotion`: `spring.smooth`, 280ms visual duration, no bounce, with a 6px rise and 0.98 scale. Removal uses `spring.exit`, 160ms visual duration, with an 80ms fade. Siblings use position layout and `reflowTransition`, which selects `spring.smooth`. Existing items do not replay arrival. Surface feedback uses `--dur-quick`, 140ms. The base hover card supplies popup motion.

**Reduced motion:** Arrivals fade for 140ms. Removal fades for 80ms. Scale and layout travel are removed.

**Accessibility:** Use stable keys. Give each remove button a file-specific label. Put hover-card triggers on real buttons or links. Keep essential file details outside the hover card. Images use the filename as alternate text. Remove controls remain visible on touch screens and keyboard focus.

**Changes from upstream:**

- Uses the kit icon set, semantic surfaces and attachment-family radii. Inline references are pills with round remove buttons; grid remove buttons are round 28px targets.
- Adds arrival, exit and position-reflow motion inside the container.
- Grid items can show file information below the preview.
- Remove controls remain visible instead of requiring hover.

```tsx
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from "@sift-design/ui/ai/attachments";

<Attachments variant="list">
  {files.map((file) => (
    <Attachment key={file.id} data={file} onRemove={() => removeFile(file.id)}>
      <AttachmentPreview />
      <AttachmentInfo showMediaType />
      <AttachmentRemove label={`Remove ${file.filename}`} />
    </Attachment>
  ))}
</Attachments>;
```

Upstream reference: [AI Elements Attachments](https://elements.ai-sdk.dev/components/attachments).

## Artifact

**When:** Present generated work with separate review, copy, download and close actions.

**Structure:** `Artifact` contains `ArtifactHeader` and `ArtifactContent`. The header groups `ArtifactTitle`, `ArtifactDescription` and `ArtifactActions`. Use `ArtifactAction` for named actions and `ArtifactClose` for dismissal.

**Props:** All parts retain native element or button props. `Artifact.open`: optional visibility state, default `true`. Keep the root mounted when using this prop. `ArtifactAction.icon`: an icon component. `ArtifactAction.label`: accessible name. `ArtifactAction.tooltip`: optional tooltip. Action callbacks remain application-owned.

**Motion:** `sheetMotion` moves the panel from its trailing edge on `spring.smooth`, 280ms visual duration, with a 140ms fade. Closing uses `spring.exit`, 160ms visual duration, with a 160ms fade. Initial static content does not animate. Closing content becomes inert immediately. The presence boundary supports interrupted open and close actions.

**Reduced motion:** The panel uses a 120ms entrance fade and an 80ms exit fade. Translation and scale are removed.

**Accessibility:** Label the panel with `aria-label` or `aria-labelledby`. Give each icon action a label or tooltip. The close button includes a name and tooltip. This is a nonmodal panel. The application must return focus to its opener after dismissal. Use a dialog when focus trapping is required.

**Changes from upstream:**

- Uses the kit icon set and panel surfaces.
- Adds optional `open` state with retained exit motion.
- Adds a close tooltip and inert exit state.
- Copy and download remain explicit callbacks, not hidden side effects.

```tsx
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose,
  ArtifactContent,
} from "@sift-design/ui/ai/artifact";
import { IconCopy } from "@tabler/icons-react";

<Artifact open={open} aria-label="Crate checklist">
  <ArtifactHeader>
    <ArtifactTitle>Crate checklist</ArtifactTitle>
    <ArtifactActions>
      <ArtifactAction icon={IconCopy} label="Copy checklist" tooltip="Copy checklist" onClick={copy} />
      <ArtifactClose onClick={closeAndRestoreFocus} />
    </ArtifactActions>
  </ArtifactHeader>
  <ArtifactContent>{checklist}</ArtifactContent>
</Artifact>;
```

Upstream reference: [AI Elements Artifact](https://elements.ai-sdk.dev/components/artifact).

## Web preview

**When:** Review a generated page without leaving the surrounding workspace.

**Structure:** `WebPreview` owns the address and console state. Its context and address callback are memoized. `WebPreviewNavigation` groups navigation buttons and `WebPreviewUrl`. The address field synchronizes external navigation before the next render commits. `WebPreviewBody` renders an iframe. `WebPreviewConsole` provides a disclosure with timestamped entries.

**Props:** `WebPreview.defaultUrl`: initial address. `WebPreview.url`: optional controlled address. `WebPreview.onUrlChange`: submitted-address callback. `WebPreviewNavigationButton.tooltip`: tooltip and default accessible name. `WebPreviewUrl` retains input props and commits on Enter. `WebPreviewBody` retains iframe props, including `srcDoc`, `src`, `title`, `sandbox` and `ref`; `loading` supplies optional status content. `WebPreviewConsole.logs`: entries with `level`, `message` and a `Date` timestamp. An optional `id` preserves identity when trimming old entries. Without an `id`, timestamp, level and message form the key. Supply unique IDs for otherwise identical entries. Levels are `log`, `warn` and `error`.

**Motion:** The console uses the kit measured disclosure: `spring.smooth`, 280ms visual duration, on opening; `spring.exit`, 160ms, on closing. Content fades for 140ms in and 80ms out. Its chevron uses `--spring-snappy`. New console entries use `arrivalMotion` and position layout with `reflowTransition`. Existing entries retain their identity during appends. The browser frame is static.

**Reduced motion:** Console height changes instantly. Chevron rotation has no transition. New entries fade for 140ms without translation or scale.

**Accessibility:** Address input and navigation buttons have accessible names. Give the iframe a specific title. The console uses a polite log region. Severity appears as text, not only color. The disclosure exposes expanded state and makes closed content inert.

**Changes from upstream:**

- Uses semantic colors, the kit icon set and disclosure motion.
- Adds optional controlled `url` for application-owned history.
- `srcDoc` takes priority over the context address.
- Input changes update internal text and call the supplied handler.
- Adds named navigation buttons and a live console with arrival motion.
- The specimen uses three local HTML pages, not external pages. It validates message sources before accepting preview events.

```tsx
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from "@sift-design/ui/ai/web-preview";

<WebPreview defaultUrl="https://larkspur.example/market" onUrlChange={selectLocalPage}>
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody srcDoc={localHtml} sandbox="allow-scripts" title="Market page preview" />
  <WebPreviewConsole logs={logs} />
</WebPreview>;
```

Use `srcDoc` for self-contained previews. Restrict the sandbox to required capabilities. Validate `postMessage` sources and payloads before adding console entries. History, message collection and reload actions remain application-owned.

Upstream reference: [AI Elements Web preview](https://elements.ai-sdk.dev/components/web-preview).

## Reasoning

**When:** show supporting notes while an answer develops. Keep the final answer outside this disclosure.

**Structure:** `Reasoning` → `ReasoningTrigger` + `ReasoningContent`. Content accepts a Markdown string and renders it with Streamdown. `useReasoning()` exposes `isStreaming`, `isOpen`, `setIsOpen`, and `duration` to custom parts.

**Props:** `isStreaming` starts duration measurement and opens the disclosure unless `defaultOpen={false}` prevents automatic opening. `open` and `onOpenChange` support controlled state. Omitted `defaultOpen` uses the initial `isStreaming` value. Nonstreaming content stays closed by default. An explicitly open, nonstreaming block stays open until someone closes it. Automatic closing occurs only after streaming has occurred. `duration` supplies an external duration in seconds. `ReasoningContent` accepts optional Streamdown `plugins`; none are enabled by default. `getThinkingMessage(isStreaming, duration)` replaces the default trigger label. Trigger children replace the complete default trigger content.

**Motion:** the kit Collapsible measures content height. It opens with `spring.smooth` (0.28s visual duration, no bounce). It closes with `spring.exit` (0.16s visual duration, no bounce). Content fades in over `duration.quick` (140ms) and out over `duration.instant` (80ms). The trigger cross-fades between thinking and completed labels over 140ms in and 80ms out. The chevron uses `--spring-smooth` and `--spring-smooth-duration`. Completion starts a 1000ms delay before automatic closing. A new streaming cycle resets that delay. It opens the disclosure again unless `defaultOpen={false}` prevents automatic opening.

**Reduced motion:** height and chevron changes are immediate. Short fades remain. Shimmer supplies its own reduced-motion behavior.

**Accessibility:** the trigger is a keyboard-operated button with expanded state and a linked content region. The changing label uses a polite live region. Collapsed content becomes inert and hidden from assistive technology immediately. Decorative icons are hidden. Durations use monospace type.

**Changes from upstream:**

- Uses kit colors, icons, focus styles, and measured disclosure motion.
- Opens on each streaming cycle and supports automatic closing on repeated cycles.
- Cross-fades the trigger label and uses singular wording for one second.
- Passes streaming state to Streamdown through `isAnimating`.
- Makes upstream's CJK, code, math, and Mermaid plugins opt-in through `ReasoningContent.plugins` instead of importing them by default.
- CJK means Chinese, Japanese, and Korean text support. Mermaid renders text-based diagrams.
- No plugin dependencies, extra highlighters, remote assets, or font requests are added automatically. Consumers supply locally configured plugins.

```tsx
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@sift-design/ui/ai/reasoning";

<Reasoning isStreaming={isStreaming}>
  <ReasoningTrigger />
  <ReasoningContent>{supportingNotes}</ReasoningContent>
</Reasoning>;
```

Upstream reference: [AI Elements Reasoning](https://elements.ai-sdk.dev/components/reasoning).

## Chain of thought

**When:** show a readable sequence of work, source results, and supporting images. Use Reasoning for one continuous block of supporting notes.

**Structure:** `ChainOfThought` → `ChainOfThoughtHeader` + `ChainOfThoughtContent` → `ChainOfThoughtStep`. Steps can contain `ChainOfThoughtSearchResults` with `ChainOfThoughtSearchResult` badges, or `ChainOfThoughtImage` with an optional caption. Keep stable keys on steps that arrive during work. The root fills the available width without an intrinsic maximum width.

**Props:** root `open`, `defaultOpen` (default `false`), and `onOpenChange` control disclosure state. Step `label` is required. Step `description`, `icon`, and `status` are optional. Status accepts `complete` (default), `active`, or `pending`. `icon` accepts an icon component. Image `caption` adds text below its children. Search-result badges retain the kit Badge props, including `asChild` for links.

**Motion:** the shared disclosure opens with `spring.smooth` (0.28s visual duration) and closes with `spring.exit` (0.16s visual duration). Both springs have no bounce. Disclosure opacity uses `duration.quick` (140ms) in and `duration.instant` (80ms) out. New active steps use `arrivalMotion`: opacity 0, y −6px, scale 0.98 → visible with `spring.smooth`. Layout changes use `reflowTransition`. Existing steps do not repeat their entrance when status changes. The active indicator changes opacity over a 1.8s cycle only while its step is active. The chevron uses `--spring-smooth` and `--spring-smooth-duration`.

**Reduced motion:** disclosure height and chevron state change immediately. New steps fade in over 140ms without travel or scale. Layout springs stop. The active indicator remains static.

**Accessibility:** one shared Collapsible connects the header button and content region. Collapsed content becomes inert and hidden from assistive technology immediately. Each step includes a visible status label. The connector line and icons are decorative. Supply descriptive alternative text for images. Use an actual link inside `asChild` for navigable source badges.

**Changes from upstream:**

- Uses one shared disclosure instead of separate header and content roots.
- Uses kit colors, icons, badges, focus styles, and measured disclosure motion.
- Adds readable status labels and a full-height connector between steps.
- Limits arrival motion to new active steps and respects reduced motion.
- Accepts generic icon components without requiring a separate icon library.

```tsx
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@sift-design/ui/ai/chain-of-thought";

<ChainOfThought defaultOpen>
  <ChainOfThoughtHeader>Prepare the crate plan</ChainOfThoughtHeader>
  <ChainOfThoughtContent>
    <ChainOfThoughtStep label="Check available stock" status="active">
      <ChainOfThoughtSearchResults>
        <ChainOfThoughtSearchResult>Bench inventory</ChainOfThoughtSearchResult>
      </ChainOfThoughtSearchResults>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep label="Prepare the checklist" status="pending" />
  </ChainOfThoughtContent>
</ChainOfThought>;
```

Upstream reference: [AI Elements Chain of thought](https://elements.ai-sdk.dev/components/chain-of-thought).

## Tool

**When:** Show a tool call with its parameters, approval state, and result. Keep details collapsed when the status is sufficient.

**Structure:** `Tool` → `ToolHeader` + `ToolContent` → `ToolInput` and `ToolOutput`. The header uses the kit disclosure trigger. Parameters and structured results use `CodeBlock`. `getStatusBadge(state)` is also exported for standalone status displays.

**Props:** `Tool` accepts the kit `Collapsible` props, including `open`, `defaultOpen`, and `onOpenChange`. `ToolHeader` requires `type` and `state`; `title` overrides the derived tool name. For `type="dynamic-tool"`, pass the required `toolName`. Static tool types derive the name from `type`. `ToolPart` exports the union of static and dynamic tool parts. Supported states are `input-streaming`, `input-available`, `approval-requested`, `approval-responded`, `output-available`, `output-error`, and `output-denied`. `ToolInput` takes `input`. `ToolOutput` takes `output` and `errorText`. All content parts accept their original element props.

**Motion:** Disclosure height uses `spring.smooth` (0.28s visual duration) to open and `spring.exit` (0.16s) to close. This measured-height animation is the kit disclosure exception to transform-only motion. Disclosure opacity enters in `duration.quick` (140ms) and exits in `duration.instant` (80ms). Status labels cross-fade in 140ms and exit in 80ms. The chevron uses `--spring-smooth-duration` and `--spring-smooth`. Only the running state has a 1.8s opacity activity signal.

**Reduced motion:** Disclosure height and chevron state change immediately. Short fades remain. The running indicator becomes static.

**Accessibility:** The trigger is a keyboard-operable button with expanded state and panel relationships. Closing details become inert immediately. Status changes use a polite live region. Errors use `role="alert"`. Keep approval buttons outside the trigger.

**Changes from upstream:**

- Uses kit semantic colors, local icons, and the kit disclosure animation.
- Adds a status cross-fade and named live status.
- Keeps zero, false, and null results visible instead of treating them as absent.
- Replaces nested code cards with flat sections inside the tool boundary. Parameters and results sit in a tinted well instead of a second bordered card.
- Preserves `ToolPart`, dynamic tool names, and the reusable `getStatusBadge` export.
- Keeps section padding on input and output parts to preserve the flat card layout.

```tsx
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@sift-design/ui/ai/tool";

<Tool defaultOpen>
  <ToolHeader type="dynamic-tool" toolName="check_sensor_hub" state="output-available" />
  <ToolContent>
    <ToolInput input={{ area: "propagation-house", bench: 4 }} />
    <ToolOutput output={{ temperature_c: 24.6, humidity_percent: 72 }} errorText={undefined} />
  </ToolContent>
</Tool>;
```

Upstream reference: [AI Elements Tool](https://elements.ai-sdk.dev/components/tool).

## Code block

**When:** Display source code, structured data, or command output with optional line numbers. Use Snippet for a single copyable command.

**Structure:** `CodeBlock` provides source context and renders its children before `CodeBlockContent`. Compose `CodeBlockHeader` with `CodeBlockTitle` and `CodeBlockActions`. The title contains `CodeBlockFilename`. Actions can contain `CodeBlockLanguageSelector` and `CodeBlockCopyButton`. The selector contains Trigger, Value, Content, and Item parts with the `CodeBlockLanguageSelector` prefix.

For independent composition, use `CodeBlockContainer` and `CodeBlockContent`. A container does not provide copy context. Keep copy actions inside `CodeBlock`. `CodeBlockLanguage` remains available as a static language label.

**Props:** `CodeBlock` requires `code` and `language`. `showLineNumbers` defaults to `false`. It also accepts division element props. `CodeBlockContent` accepts the same three source props. `CodeBlockContainer` requires `language` and accepts element props, including style overrides for content visibility.

`CodeBlockCopyButton` accepts button props, `onCopy`, `onError`, and `timeout` (2000ms). It ignores repeated copies of unchanged source during success feedback. Changed source can be copied immediately. Selector parts accept their corresponding kit Select props. Selector Content defaults to `align="end"`. Control the selector value and update the code and language together.

`highlightCode(code, language, callback?)` returns cached `TokenizedCode` or `null` immediately. The callback receives an asynchronous result when needed. Tokenized results contain `tokens`, `fg`, and `bg`. An explicit boolean third argument preserves the earlier asynchronous two-string HTML result.

**Motion:** Code appears immediately as escaped text while highlighting loads. Syntax highlighting does not animate or delay content. The copy icon swaps in place through the shared `CopyStateIcon`: the check pops in on `spring.lively`, the return to the copy icon settles on `spring.snappy`, and the old icon leaves on `spring.exit` with an 80ms fade. Nothing animates on first render. Feedback resets after `timeout`. The copy button keeps a stable minimum width. The language selector uses kit Select behavior without additional motion.

**Reduced motion:** Only short opacity feedback remains. No text travels, scales, or blurs.

**Accessibility:** The scrollable source region has a language label, visible focus, and keyboard access. Line numbers are hidden from assistive technology and excluded from copied source. The copy action announces success or failure. The language trigger defaults to the accessible name Code language. Keyboard users can choose options and close the selector with Escape.

**Changes from upstream:**

- Replaces bundled vendor themes with a CSS-variable theme and a fine-grained highlighter using the JavaScript regular-expression engine.
- Token roles match the site: accent for keywords, danger for strings, muted for comments, and ink for functions.
- Lazily loads TSX, TypeScript, JavaScript, JSON, Bash, CSS, HTML, Python, YAML, diff, and Markdown grammars.
- Other supported language grammars load on demand. Failed loads keep readable plain text.
- Uses one token tree for both themes and cancels stale display updates.
- Bounds the token cache to 100 entries and uses complete source keys to avoid cache collisions.
- Keeps the earlier boolean `highlightCode` overload and static `CodeBlockLanguage` export.
- Adds accessible copy failure feedback and timer cleanup. Vendor themes are intentionally not retained.

```tsx
import { useState } from "react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockLanguageSelector,
  CodeBlockLanguageSelectorContent,
  CodeBlockLanguageSelectorItem,
  CodeBlockLanguageSelectorTrigger,
  CodeBlockLanguageSelectorValue,
} from "@sift-design/ui/ai/code-block";

function SensorSource() {
  const [language, setLanguage] = useState<"json" | "tsx">("json");
  const code = language === "json" ? '{"bench": 4}' : "const bench = <p>Bench 4</p>;";
  return (
    <CodeBlock code={code} language={language} showLineNumbers>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>sensor-reading.{language}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockLanguageSelector value={language} onValueChange={(value) => setLanguage(value as "json" | "tsx")}>
            <CodeBlockLanguageSelectorTrigger>
              <CodeBlockLanguageSelectorValue />
            </CodeBlockLanguageSelectorTrigger>
            <CodeBlockLanguageSelectorContent>
              <CodeBlockLanguageSelectorItem value="json">JSON</CodeBlockLanguageSelectorItem>
              <CodeBlockLanguageSelectorItem value="tsx">TSX</CodeBlockLanguageSelectorItem>
            </CodeBlockLanguageSelectorContent>
          </CodeBlockLanguageSelector>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
}
```

Upstream reference: [AI Elements Code Block](https://elements.ai-sdk.dev/components/code-block).

## Snippet

**When:** Provide a short command that people can select or copy without running it. Use Code block for multiline source.

**Structure:** `Snippet` → optional `SnippetAddon` with `SnippetText`, `SnippetInput`, and an end addon containing `SnippetCopyButton`. Use `$` as a decorative shell prefix. The prefix is not part of copied text.

**Props:** `Snippet` requires `code` and accepts the kit `InputGroup` props. `SnippetInput` is read-only and uses the context code. It accepts input props except `value` and `readOnly`. `SnippetAddon` supports `align`. `SnippetCopyButton` accepts input-group button props, `onCopy`, `onError`, and `timeout` (2000ms).

**Motion:** The copy icon swaps in place through the shared `CopyStateIcon`: the check pops in on `spring.lively`, the return to the copy icon settles on `spring.snappy`, and the old icon leaves on `spring.exit` with an 80ms fade. Nothing animates on first render. The input and prefix do not move. Success or failure feedback resets after `timeout`. Repeated copies of unchanged source do not repeat the clipboard write during success feedback.

**Reduced motion:** Short opacity feedback remains. There is no travel, scale, or activity loop.

**Accessibility:** The input has a default accessible name of Command. Set a specific `aria-label` when several snippets appear together. The command stays selectable with the keyboard. The copy button announces success or failure. Mark decorative prefixes with `aria-hidden="true"`.

**Changes from upstream:**

- Uses the kit input group, semantic colors, and local icons.
- Adds a default input name and explicit clipboard failure feedback.
- Shares copy behavior with Code block, including timer cleanup.

```tsx
import { Snippet, SnippetAddon, SnippetCopyButton, SnippetInput, SnippetText } from "@sift-design/ui/ai/snippet";

<Snippet code="npx larkspur sync --bench 4">
  <SnippetAddon>
    <SnippetText aria-hidden="true">$</SnippetText>
  </SnippetAddon>
  <SnippetInput aria-label="Sync bench 4 command" />
  <SnippetAddon align="inline-end">
    <SnippetCopyButton />
  </SnippetAddon>
</Snippet>;
```

Upstream reference: [AI Elements Snippet](https://elements.ai-sdk.dev/components/snippet).

## Sources

**When:** show the links used to prepare an answer. Keep the list collapsed until the reader needs it.

**Structure:** `Sources` contains `SourcesTrigger` and `SourcesContent`. Put one `Source` link inside the content for each reference.

**Props:** `SourcesTrigger.count` is required. `Source` accepts native anchor props, including `href`, `title`, and custom `children`. The root retains upstream div props. Supply custom trigger children to change the summary.

**Motion:** the kit disclosure measures its content height. Opening uses `spring.smooth` (280ms visual duration) with a `duration.quick` (140ms) fade. Closing uses `spring.exit` (160ms visual duration) with `duration.instant` (80ms) opacity. The chevron uses the matching CSS smooth spring.

**Reduced motion:** disclosure height changes immediately. Short opacity feedback remains. The chevron changes direction without a transition.

**Accessibility:** the native trigger exposes expanded state. Collapsed links are inert. Each source needs a meaningful link title. Default links open a new tab. Override `target` if the current tab is more suitable.

**Changes from upstream:**

- Uses the kit disclosure instead of separate entrance classes.
- Generates a local letter placeholder from the title. No favicon request is made.
- Uses semantic colors, visible focus, and monospaced counts.

```tsx
import { Sources, SourcesTrigger, SourcesContent, Source } from "@sift-design/ui/ai/sources";

<Sources>
  <SourcesTrigger count={1} />
  <SourcesContent>
    <Source href="https://larkspur.example/guides/lavender-winter" title="Lavender winter care" />
  </SourcesContent>
</Sources>;
```

Upstream reference: [AI Elements Sources](https://elements.ai-sdk.dev/components/sources).

## Inline citation

**When:** connect a short statement to its supporting sources. Let the reader inspect references beside the answer.

**Structure:** `InlineCitation` wraps `InlineCitationText` and `InlineCitationCard`. The card contains a trigger and body. The body contains `InlineCitationCarousel`, its header, and its content. Place source and quote parts inside carousel items. The header can contain the index and previous/next buttons.

**Props:** `InlineCitationCard` retains the kit hover-card props, including `open`, `defaultOpen`, and `onOpenChange`. `InlineCitationCardTrigger.sources` supplies source URLs. Optional `number` displays a numbered badge. Without it, the badge shows the first hostname and additional source count. Custom `children` replace this label. `InlineCitationSource` accepts `title`, `url`, and `description`. Native attributes remain available on the other parts. Carousel options, plugins, orientation, and `setApi` remain available.

**Motion:** cards fade in with `duration.quick` (140ms) and out with `duration.instant` (80ms). Source selection cross-fades at the same durations. The kit carousel retains slide measurement, arrow-key navigation, and pointer interaction. The citation track overrides spatial translation, so cards do not slide.

**Reduced motion:** there is no card travel or scale. Source opacity changes use `duration.instant` (80ms). Card opening retains a short fade.

**Accessibility:** the trigger is a real button. Hover, keyboard focus, and tap can open the card. Tab reaches its source link and enabled controls. Arrow keys change sources. Escape closes the card and returns focus to the trigger. Outside pointer interaction and focus close it. The index announces selection changes. Inactive slides are hidden from assistive technology and are inert. The source title links to its URL. Use concise, distinct titles.

**Changes from upstream:**

- Adds optional numbered badges while keeping the hostname fallback. The badge is a compact 18px pill that does not change the line height; an invisible margin keeps the touch target large enough.
- The cited text keeps its tint while its card is open, and the tint fades in 140ms.
- Adds focus and click opening because hover alone does not support touch.
- Adds explicit dismissal, disabled boundary controls, and a labelled dialog surface.
- Links source titles and cross-fades carousel items.
- Keeps the updated upstream selection-listener cleanup. Also synchronizes the index when the carousel reinitializes.
- Replaces decorative icons with the kit icon set. No remote asset requests are made.

```tsx
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
} from "@sift-design/ui/ai/inline-citation";

const url = "https://larkspur.example/guides/lavender-winter";

<p>
  <InlineCitation>
    <InlineCitationText>Keep lavender roots clear of standing water.</InlineCitationText>
    <InlineCitationCard>
      <InlineCitationCardTrigger number={1} sources={[url]} />
      <InlineCitationCardBody>
        <InlineCitationCarousel>
          <InlineCitationCarouselHeader>
            <InlineCitationCarouselIndex />
            <InlineCitationCarouselPrev />
            <InlineCitationCarouselNext />
          </InlineCitationCarouselHeader>
          <InlineCitationCarouselContent>
            <InlineCitationCarouselItem>
              <InlineCitationSource
                title="Lavender winter care"
                url={url}
                description="Winter care notes for potted lavender."
              />
            </InlineCitationCarouselItem>
          </InlineCitationCarouselContent>
        </InlineCitationCarousel>
      </InlineCitationCardBody>
    </InlineCitationCard>
  </InlineCitation>
</p>;
```

Upstream reference: [AI Elements Inline citation](https://elements.ai-sdk.dev/components/inline-citation).

## Image

**When:** display a generated image already held in memory. Use a loading state while the generation request is active.

**Structure:** `Image` renders a native image with a data URL. With `loading`, it renders a stable, text-labelled placeholder instead.

**Props:** accepts `Experimental_GeneratedImage`: `base64`, `uint8Array`, and `mediaType`. The rendered data URL uses `base64` and `mediaType`. Supply `className` for sizing. Added `loading` defaults to `false`. Always supply `alt` for meaningful images. The type keeps upstream's optional `alt` for compatibility. Use `alt=""` only when the image is decorative.

**Motion:** the image fades in with `duration.quick` (140ms linear). There is no blur, scale, or travel. Existing mounted images do not replay the fade on ordinary re-renders. Keep image dimensions stable when switching between loading and completed states.

**Reduced motion:** retains the short opacity-only reveal. The loading placeholder is static.

**Accessibility:** describe the information in the image, not the generation process. The placeholder uses a polite status announcement. Keep a visible explanation when an illustration is not a construction plan. Do not put essential instructions only inside an image.

**Changes from upstream:**

- Adds a static loading placeholder and a short opacity reveal.
- Uses semantic placeholder colors and a responsive image layout.
- Keeps the generated-image input type and data URL behavior. No remote image request is made.

```tsx
import { Image } from "@sift-design/ui/ai/image";
import type { Experimental_GeneratedImage } from "ai";

function BenchImage({ image, pending }: { image: Experimental_GeneratedImage; pending: boolean }) {
  return (
    <Image
      {...image}
      loading={pending}
      alt="Raised herb bench with a slatted top and three lavender pots."
      className="w-full max-w-[560px]"
    />
  );
}
```

Upstream reference: [AI Elements Image](https://elements.ai-sdk.dev/components/image).

## Task

**When:** Show the work items and files used during an operation.

**Structure:** `Task` → `TaskTrigger` + `TaskContent` → `TaskItem` → `TaskItemFile`.

**Props:** `Task` accepts the kit Collapsible props and defaults `defaultOpen` to `true`. `TaskTrigger` requires `title`. Custom children replace its default label and icons. `asChild` supports a custom trigger. Items and file chips accept standard div props. File chips are 24px tinted pills with mono names.

**Motion:** Kit Collapsible measures content height. Opening uses `spring.smooth` (280ms visual duration); closing uses `spring.exit` (160ms visual duration). Content fades in for `duration.quick` (140ms) and out for `duration.instant` (80ms). The chevron uses `--spring-snappy-duration` (358ms) and `--spring-snappy`.

**Reduced motion:** Height and chevron change immediately. Short content fades remain.

**Accessibility:** The default trigger is a real button. It exposes expanded state and a visible focus outline. Closed content becomes inert. File icons are decorative. Add operation status outside the trigger when needed.

**Changes from upstream:**

- Uses semantic surfaces, compact text, and monospaced file names.
- Replaces the default div trigger with a button.
- Uses the kit disclosure motion instead of entrance utility animations.
- Replaces icons with the kit icon set.

```tsx
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from "@sift-design/ui/ai/task";

<Task>
  <TaskTrigger title="Reading the stock sheet" />
  <TaskContent>
    <TaskItem>
      <TaskItemFile>herb-stock.csv</TaskItemFile>
      Checked basil and mint quantities
    </TaskItem>
  </TaskContent>
</Task>;
```

Upstream reference: [AI Elements Task](https://elements.ai-sdk.dev/components/task).

## Plan

**When:** Present proposed steps for review before work starts.

**Structure:** `Plan` → `PlanHeader` with `PlanTitle`, `PlanDescription`, and optional `PlanAction`. Put `PlanTrigger` inside the action. `PlanContent` holds collapsible steps. `PlanFooter` holds the review status and actions.

**Props:** `Plan` accepts the kit Collapsible props, including `open`, `defaultOpen`, and `onOpenChange`. `isStreaming` defaults to `false`. It applies Shimmer to the title and description. Both accept string children. Other parts accept their matching kit Card props. The trigger accepts custom children and CollapsibleTrigger props. Editing and saving belong to the consumer.

**Motion:** The card stays still. Content opens on `spring.smooth` (280ms visual duration) and closes on `spring.exit` (160ms visual duration). Content fades in for `duration.quick` (140ms) and out for `duration.instant` (80ms). The chevron uses `--spring-snappy-duration` (358ms). Shimmer owns the streaming text effect and stops when `isStreaming` becomes false.

**Reduced motion:** Content height and chevron update immediately. Short content fades remain. Shimmer uses its own reduced-motion treatment.

**Accessibility:** `aria-busy` reflects streaming state. The default trigger has the accessible name “Toggle plan”. Closed content becomes inert. Add a separate status message for draft completion. Name every editing field.

**Changes from upstream:**

- Uses the kit card spacing, type, icons, and semantic colors.
- Adds a streaming state attribute and busy semantics.
- Uses measured kit disclosure motion and a rotating chevron.
- Preserves custom trigger children.

```tsx
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanAction,
  PlanTrigger,
  PlanContent,
  PlanFooter,
} from "@sift-design/ui/ai/plan";
import { Button } from "@sift-design/ui/button";

<Plan defaultOpen isStreaming={false}>
  <PlanHeader>
    <PlanTitle>Restock the herb bench before Saturday</PlanTitle>
    <PlanDescription>Review the stock count and prepare the price cards.</PlanDescription>
    <PlanAction>
      <PlanTrigger />
    </PlanAction>
  </PlanHeader>
  <PlanContent>
    <ol>
      <li>Move 24 basil pots to the retail bench.</li>
    </ol>
  </PlanContent>
  <PlanFooter>
    <Button onClick={editPlan}>Edit plan</Button>
  </PlanFooter>
</Plan>;
```

Upstream reference: [AI Elements Plan](https://elements.ai-sdk.dev/components/plan).

## Queue

**When:** Keep queued follow-up messages and todos visible while other work continues.

**Structure:** `Queue` → `QueueSection` → `QueueSectionTrigger` with `QueueSectionLabel` + `QueueSectionContent`. Content contains `QueueList` with keyed `QueueItem` children. Items support `QueueItemIndicator`, `QueueItemContent`, `QueueItemDescription`, and `QueueItemActions` with `QueueItemAction`. Use `QueueItemAttachment` with `QueueItemFile` or `QueueItemImage` for attachments.

**Props:** `QueueSection` accepts Collapsible props and defaults `defaultOpen` to `true`. `QueueSectionLabel` takes `label`, optional `count`, and optional `icon`. `completed` changes indicator, content, and description styles. It does not manage todo state. `QueueItemAction` accepts Button props except `variant` and `size`. `QueueList` accepts ScrollArea props and limits height to 192px by default. `QueueMessagePart`, `QueueMessage`, and `QueueTodo` are exported interfaces. They support declaration merging, matching the current upstream source.

**Motion:** `QueueList` owns `AnimatePresence` with initial arrivals disabled. Give every direct `QueueItem` a stable key. New items use `arrivalMotion` and `spring.smooth` (280ms visual duration). Exits use `spring.exit` (160ms visual duration), with an 80ms `duration.instant` fade. Rows use `reflowTransition` to close gaps. Completion changes text and strike-through color over `duration.quick` (140ms). Actions fade over 140ms. Sections use kit Collapsible motion: `spring.smooth` to open, `spring.exit` to close, and 140ms/80ms fades.

**Reduced motion:** Items use a 140ms arrival fade and an 80ms exit fade. Travel, scale, and row reflow stop. Section height and chevrons change immediately. Completion feedback remains.

**Accessibility:** Actions appear on hover and keyboard focus. Touch devices show actions without hover. Give each icon action an accessible name. Use a real checkbox or a button with checkbox semantics to change completion. Give meaningful images an `alt` value. Scroll regions have keyboard access; set a specific `aria-label`. Move focus to a surviving control after removing a focused item. Announce user actions in a separate status region.

**Changes from upstream:**

- Adds item arrival, exit, and reflow motion inside QueueList.
- Keeps completed text readable and fades its strike-through color. Only the item text is struck through; its description fades back instead. File chips are pills.
- Adds focus and touch access to item actions.
- Uses monospaced counts and file names, semantic surfaces, and kit icons.
- Fixes the scroll viewport height limit.

```tsx
import {
  Queue,
  QueueSection,
  QueueSectionTrigger,
  QueueSectionLabel,
  QueueSectionContent,
  QueueList,
  QueueItem,
  QueueItemIndicator,
  QueueItemContent,
} from "@sift-design/ui/ai/queue";

<Queue>
  <QueueSection>
    <QueueSectionTrigger>
      <QueueSectionLabel label="Todos" count={todos.length} />
    </QueueSectionTrigger>
    <QueueSectionContent>
      <QueueList aria-label="Herb bench todos">
        {todos.map((todo) => (
          <QueueItem key={todo.id}>
            <div className="flex gap-2">
              <QueueItemIndicator completed={todo.status === "completed"} />
              <QueueItemContent completed={todo.status === "completed"}>{todo.title}</QueueItemContent>
            </div>
          </QueueItem>
        ))}
      </QueueList>
    </QueueSectionContent>
  </QueueSection>
</Queue>;
```

Upstream reference: [AI Elements Queue](https://elements.ai-sdk.dev/components/queue).

## Confirmation

**When:** request permission before a tool performs a consequential action. Show the decision in the same location.

**Structure:** `Confirmation` → `ConfirmationTitle` + `ConfirmationActions` → `ConfirmationAction`. Put `ConfirmationRequest`, `ConfirmationAccepted`, and `ConfirmationRejected` inside the title. These parts render only for their matching state.

**Props:** `state` uses `ToolUIPart["state"]` from the installed `ai` package. `approval` contains `id`, optional `approved`, and optional `reason`. No approval, `input-streaming`, and `input-available` render nothing. Actions accept the kit Button props. Use an outline button for Deny.

**Motion:** decision content cross-fades in place with `duration.quick` (140ms) for entry and `duration.instant` (80ms, `leave`) for exit. A measured wrapper adjusts height with `spring.smooth` (280ms, no bounce). A resize observer tracks text wrapping without scaling the text. Existing content does not replay its entrance.

**Reduced motion:** height updates immediately. Only the short opacity transitions remain.

**Accessibility:** the root is a polite live status. Actions are real buttons with visible focus. Give actions specific labels. The application owns approval and must handle the tool response. Approval alone does not prove that the tool completed its action.

**Changes from upstream:**

- Uses semantic surfaces and kit buttons.
- Removes obsolete type-error directives for the installed `ai` version.
- Adds measured height motion and decision cross-fades.
- Uses a polite status instead of an interrupting alert.

```tsx
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@sift-design/ui/ai/confirmation";

<Confirmation
  state={approved === undefined ? "approval-requested" : "approval-responded"}
  approval={{ id: "order-1048", approved }}
>
  <ConfirmationTitle>
    <ConfirmationRequest>Send the 40-tray order confirmation to Hollins Florist?</ConfirmationRequest>
    <ConfirmationAccepted>Sending approved.</ConfirmationAccepted>
    <ConfirmationRejected>No email was sent.</ConfirmationRejected>
  </ConfirmationTitle>
  <ConfirmationActions>
    <ConfirmationAction variant="outline" onClick={() => setApproved(false)}>
      Deny
    </ConfirmationAction>
    <ConfirmationAction onClick={() => setApproved(true)}>Approve</ConfirmationAction>
  </ConfirmationActions>
</Confirmation>;
```

Upstream reference: [AI Elements Confirmation](https://elements.ai-sdk.dev/components/confirmation).

## Question

**When:** the assistant needs a choice, several choices, a written answer, or a combination before continuing.

**Structure:** `Question` → `QuestionPrompt`, `QuestionDescription`, `QuestionOptions` → `QuestionOption`, optional `QuestionInput`, and `QuestionActions` → `QuestionSubmit`. Options are pill buttons. The selected pill's highlight travels between options on `selectionSpring` and passes under the labels. Place a visible label above the input. The form replaces its contents with an answer summary after successful submission.

**Props:** `selectionMode` is `single` by default or `multiple`. `value` and `defaultValue` contain `selectedValues: readonly string[]` and `text: string`. `onValueChange` receives the full value. `onSubmit(response, event)` receives selected values and trimmed optional text. It can return a promise. `disabled` disables input. Added `submitted` and `onSubmittedChange` control the summary. Added `summary` accepts content or a response-rendering function. The default summary displays option values and text. Use readable values, or supply a custom summary.

**Motion:** single selection shares a highlight on `selectionSpring` (stiffness 700, damping 48, mass 0.6). Multiple selection fades each highlight for 140ms in and 80ms out. Submission cross-fades for 140ms in and 80ms out on `leave`. Measured height closes on `spring.exit` (160ms, no bounce) and opens on `spring.smooth` (280ms, no bounce).

**Reduced motion:** selection and height change immediately. Short state fades remain. No selection travel occurs.

**Accessibility:** the prompt labels the options. Single selection supports arrow keys, Home, End, Space, and one tab stop. Multiple selection uses checkbox roles. Give `QuestionInput` a visible label through `htmlFor` and `id`. Empty answers cannot submit. Pending submission disables controls. Failed submission preserves the answer and announces an error. The summary announces success. Change answer restores the form and focuses the first option.

**Changes from upstream:**

- Adds selection motion, keyboard navigation, and prompt relationships.
- Adds an answer summary and Change answer action after successful submission.
- Adds pending feedback and recoverable submission errors.
- Preserves single-select deselection, multiple selection, controlled values, and free text.

```tsx
import {
  Question,
  QuestionPrompt,
  QuestionDescription,
  QuestionOptions,
  QuestionOption,
  QuestionInput,
  QuestionActions,
  QuestionSubmit,
} from "@sift-design/ui/ai/question";

<Question onSubmit={(response) => saveBenchAnswer(response)}>
  <QuestionPrompt>Which bench should the lavender go on?</QuestionPrompt>
  <QuestionDescription>Choose a bench, or enter another location.</QuestionDescription>
  <QuestionOptions>
    <QuestionOption value="Bench 2">Bench 2</QuestionOption>
    <QuestionOption value="Bench 4">Bench 4</QuestionOption>
  </QuestionOptions>
  <label htmlFor="other-bench">Other location or note</label>
  <QuestionInput id="other-bench" />
  <QuestionActions>
    <QuestionSubmit>Submit answer</QuestionSubmit>
  </QuestionActions>
</Question>;
```

Upstream reference: [AI Elements Question](https://elements.ai-sdk.dev/components/question).

## Checkpoint

**When:** a conversation can return to an earlier state. Place the checkpoint between messages, where that state was saved.

**Structure:** `Checkpoint` → `CheckpointTrigger` → optional `CheckpointIcon` + label. The root adds a trailing separator. The application owns restoration and removes or restores later messages.

**Props:** the root accepts div attributes. `CheckpointTrigger` accepts Button props and optional `tooltip` text. It defaults to `variant="ghost"` and `size="sm"`. `CheckpointIcon` accepts icon props or custom `children`. A tooltip requires the kit `TooltipProvider` above the component.

**Motion:** pointer hover and keyboard focus reveal the action surface and icon through 140ms transitions (`--dur-quick`). The label remains visible at full contrast. Touch screens keep the action visible. In the specimen, later messages fade out over 80ms (`duration.instant`, `leave`). Their measured height closes on `spring.exit` (160ms, no bounce). Replaying messages uses `spring.smooth` (280ms) and a 140ms fade.

**Reduced motion:** action feedback uses `--dur-instant` (80ms). The specimen removes message height motion and keeps an 80ms exit fade.

**Accessibility:** use a real button with a visible label. Explain restoration consequences in the tooltip and nearby text. The tooltip appears on hover or focus. Keep the button visible and preserve focus after restoration. Announce the result with a status message. Use an application-level confirmation if restoration permanently discards work.

**Changes from upstream:**

- Replaces the decorative bookmark with a local icon.
- Preserves the current upstream trigger's `className` forwarding in both tooltip modes.
- Adds hover and focus feedback without hiding the label.
- Keeps separator width flexible on narrow screens.

```tsx
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@sift-design/ui/ai/checkpoint";
import { TooltipProvider } from "@sift-design/ui/tooltip";

<TooltipProvider>
  <Checkpoint>
    <CheckpointTrigger tooltip="Return to bench 4 and remove the two later messages." onClick={restoreCheckpoint}>
      <CheckpointIcon /> Restore checkpoint
    </CheckpointTrigger>
  </Checkpoint>
</TooltipProvider>;
```

Upstream reference: [AI Elements Checkpoint](https://elements.ai-sdk.dev/components/checkpoint).

## Agent

**When:** Show a helper definition before a run. Let people inspect its instructions, tools, and output schema.

**Structure:** `Agent` → `AgentHeader` + `AgentContent`. Content contains `AgentInstructions`, `AgentTools` with `AgentTool` children, and `AgentOutput`.

**Props:** `AgentHeader` requires `name` and accepts `model`. `AgentInstructions` takes a string child. `AgentTools` accepts accordion props, including `type`, `value`, and `defaultValue`. Each `AgentTool` requires `value` and an `ai` `Tool`. It displays the tool description and serializes its input schema. `AgentOutput` requires a TypeScript `schema` string. Parts retain their upstream element props.

**Motion:** Tool disclosure uses the kit accordion. Height opens with `spring.smooth` (0.28 seconds) and closes with `spring.exit` (0.16 seconds). Opacity uses `duration.quick` (140ms) in and `duration.instant` (80ms) out. Chevrons use the matching CSS spring curves and durations.

**Reduced motion:** Disclosure changes height immediately and retains short fades. Chevrons do not rotate.

**Accessibility:** Accordion triggers support keyboard activation and expose expanded state. Closed content is inert and hidden from assistive technology. Decorative icons are hidden. Use clear tool descriptions so each trigger has a useful name.

**Changes from upstream:**

- Uses semantic surfaces, compact type, and the kit icon set.
- Removes nested decorative cards. Tool schemas use the shared `CodeBlock`.
- Uses the kit disclosure motion and adds stable styling slots.

```tsx
import {
  Agent,
  AgentHeader,
  AgentContent,
  AgentInstructions,
  AgentTools,
  AgentTool,
  AgentOutput,
} from "@sift-design/ui/ai/agent";
import { jsonSchema } from "ai";

const inventory = {
  description: "read_inventory",
  inputSchema: jsonSchema({
    type: "object",
    properties: { area: { type: "string" } },
    required: ["area"],
  }),
};

<Agent>
  <AgentHeader name="Stock count helper" model="Quarry Swift" />
  <AgentContent>
    <AgentInstructions>Read inventory. Ask for approval before filing tasks.</AgentInstructions>
    <AgentTools type="single" collapsible>
      <AgentTool value="read_inventory" tool={inventory} />
    </AgentTools>
    <AgentOutput schema="type Report = { lowStock: string[] };" />
  </AgentContent>
</Agent>;
```

Upstream reference: [AI Elements Agent](https://elements.ai-sdk.dev/components/agent).

## Sandbox

**When:** Show code, output, and files for a tool run. The component displays state; it does not execute code.

**Structure:** `Sandbox` → `SandboxHeader` + `SandboxContent` → `SandboxTabs`. Place `SandboxTabsList` inside `SandboxTabsBar`. Pair each `SandboxTabsTrigger` with a `SandboxTabContent` using the same `value`.

**Props:** `Sandbox` accepts collapsible props and opens by default. `SandboxHeader` takes `title`, required `state: ToolUIPart["state"]`, and `className`. `SandboxTabs` accepts controlled `value` and `onValueChange`, or `defaultValue`. Tab parts retain kit props. Status labels come from the shared tool status badge.

**Motion:** Disclosure uses `spring.smooth` (0.28 seconds) in and `spring.exit` (0.16 seconds) out. Opacity uses `duration.quick` (140ms) in and `duration.instant` (80ms) out. The tab indicator uses `selectionSpring` (stiffness 700, damping 48, mass 0.6). Panels enter by 6px with `spring.smooth` and leave by 4px with `spring.exit`. The chevron uses matching CSS spring curves.

**Reduced motion:** Disclosure height changes immediately. The indicator does not travel. Panels retain short fades without horizontal movement. The chevron stays still.

**Accessibility:** The header is a button with expanded state and a visible focus ring. Tool status changes use a polite live region. Tabs retain arrow-key navigation and panel relationships. Give the tab list a descriptive accessible name.

**Changes from upstream:**

- Uses the kit line tabs with their shared selection motion.
- Removes duplicate entrance animations from the disclosure content.
- Uses semantic colors, local icons, and a fallback title.

```tsx
import {
  Sandbox,
  SandboxHeader,
  SandboxContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
  SandboxTabContent,
} from "@sift-design/ui/ai/sandbox";

<Sandbox>
  <SandboxHeader title="bench-report.ts" state="output-available" />
  <SandboxContent>
    <SandboxTabs defaultValue="output">
      <SandboxTabsBar>
        <SandboxTabsList aria-label="Bench report views">
          <SandboxTabsTrigger value="output">Output</SandboxTabsTrigger>
          <SandboxTabsTrigger value="files">Files</SandboxTabsTrigger>
        </SandboxTabsList>
      </SandboxTabsBar>
      <SandboxTabContent value="output">180 pots remain.</SandboxTabContent>
      <SandboxTabContent value="files">bench-report.ts</SandboxTabContent>
    </SandboxTabs>
  </SandboxContent>
</Sandbox>;
```

Upstream reference: [AI Elements Sandbox](https://elements.ai-sdk.dev/components/sandbox).

## JSX preview

**When:** Preview trusted JSX text during streaming. JSX is a syntax for describing interface elements. Use an explicit component list for generated content.

**Structure:** `JSXPreview` → `JSXPreviewContent` + `JSXPreviewError`. `useJSXPreview` exposes source, processed source, streaming state, error state, components, bindings, and state setters.

**Props:** `JSXPreview` requires `jsx`. It accepts `isStreaming`, `components`, `bindings`, and `onError`. Added `componentsOnly` defaults to `false`; `allowUnknownElements` defaults to `true`. Set them to `true` and `false`, respectively, to restrict rendered elements. `JSXPreviewContent` accepts div props without children. `JSXPreviewError` accepts normal children or an error render function.

**Motion:** Stream updates do not animate individual text fragments or replay existing content. Error feedback fades in with `duration.quick` (140ms). The demo output feedback uses the same token.

**Reduced motion:** Error feedback uses `duration.instant` (80ms). No travel, scale, or looping effects are added.

**Accessibility:** Errors use `role="alert"`. Keep streaming announcements in a separate, concise status region. Supplied components must provide their own accessible structure and controls.

**Changes from upstream:**

- Replaces the error icon and uses semantic error colors.
- Defers parser error state updates until commit to avoid updates during child rendering.
- Adds parser element restrictions without changing upstream defaults.
- Handles quoted attributes, dotted tag names, and void tags when completing streamed markup.
- Clears errors when streaming ends, even if the source string is unchanged.

Streaming closes complete opening tags and omits a trailing incomplete tag. Invalid partial expressions fall back to the last valid preview. Completion is best effort, not a full JSX repair system. Invalid final source reports an error.

This parser is not a security sandbox. Use trusted source and trusted components. Bindings can expose capabilities. Restrict elements, omit unnecessary bindings, and make wrapper components discard untrusted attributes. Do not use this component to isolate hostile code.

```tsx
import { JSXPreview, JSXPreviewContent, JSXPreviewError } from "@sift-design/ui/ai/jsx-preview";
import type { ReactNode } from "react";

const components = {
  BenchText: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
};

<JSXPreview
  jsx="<BenchText>24 herb trays remain."
  isStreaming
  components={components}
  componentsOnly
  allowUnknownElements={false}
>
  <JSXPreviewContent />
  <JSXPreviewError>Preview could not render. Check the closing tags, then try again.</JSXPreviewError>
</JSXPreview>;
```

Upstream reference: [AI Elements JSX Preview](https://elements.ai-sdk.dev/components/jsx-preview).

## Terminal

**When:** show command output during a run or after it ends.

**Structure:** `Terminal` provides output and streaming state. Place `TerminalTitle`, `TerminalStatus`, and `TerminalActions` inside `TerminalHeader`. Actions contain `TerminalCopyButton` and `TerminalClearButton`. `TerminalContent` renders output unless you supply children. The default root composition includes these parts.

**Props:** `output: string` is required. `isStreaming` defaults to `false`. `autoScroll` defaults to `true`. `onClear` enables the clear action. Copy accepts `onCopy`, `onError`, and `timeout` (default `2000` milliseconds). Each part accepts its underlying element props.

**Motion:** new output scrolls directly to the bottom when `autoScroll` is enabled. Existing lines do not animate. The cursor uses a one-second stepped opacity cycle only while `isStreaming` is true. Buttons use the shared control motion. The copy icon swaps in place through the shared `CopyStateIcon`: the check pops in on `spring.lively`, the return settles on `spring.snappy`, and the old icon leaves on `spring.exit`.

**Reduced motion:** the cursor stays static. Output and scroll updates remain immediate.

**Accessibility:** copy and clear have accessible names. The output region has a name, keyboard focus, and a visible focus outline. Streaming status uses `role="status"`. Add a separate completion status for the command result. Output is not a live region because frequent lines can interrupt reading.

**Changes from upstream:**

- A local ANSI (American National Standards Institute) Select Graphic Rendition parser replaces the external renderer.
- Supported instructions: foreground colors `30–37`, `90–97`, bold, dim, italic, underline, reset, and individual style resets.
- Semantic ink tokens replace literal terminal hues in both themes. Some color instructions share the same token.
- Unsupported escape sequences do not execute. Extended colors are ignored. Text renders through spans, never injected markup.
- Copy removes escape sequences and control characters from output.
- The default streaming status reads “Running”.

```tsx
import { Terminal } from "@sift-design/ui/ai/terminal";

<Terminal
  output={"$ npm test\n\u001b[32mPASS\u001b[0m tests/seedlings.test.ts\n"}
  isStreaming={false}
  onClear={() => setOutput("")}
/>;
```

Upstream reference: [AI Elements Terminal](https://elements.ai-sdk.dev/components/terminal).

## Stack trace

**When:** explain a runtime error and let readers inspect its source locations.

**Structure:** `StackTrace` parses the supplied trace and provides one disclosure root. `StackTraceHeader` contains `StackTraceError`, `StackTraceActions`, and `StackTraceExpandButton`. The error contains `StackTraceErrorType` and `StackTraceErrorMessage`. Actions contain `StackTraceCopyButton`. Place `StackTraceFrames` inside `StackTraceContent`.

**Props:** `trace: string` is required. Control expansion with `open` and `onOpenChange`, or use `defaultOpen` (default `false`). `onFilePathClick(path, line?, column?)` enables source location buttons. `StackTraceContent.maxHeight` defaults to `400` pixels. `StackTraceFrames.showInternalFrames` defaults to `true`. Copy accepts `onCopy`, `onError`, and `timeout` (default `2000` milliseconds).

**Motion:** the shared kit disclosure opens measured height with `spring.smooth` (280 milliseconds visual duration). It closes with `spring.exit` (160 milliseconds, no bounce). Content fades in over `duration.quick` (140 milliseconds) and out over `duration.instant` (80 milliseconds). The chevron uses `--spring-snappy-duration` and `--spring-snappy` (358 milliseconds to rest). The copy icon swaps in place through the shared `CopyStateIcon`: the check pops in on `spring.lively`, the return settles on `spring.snappy`, and the old icon leaves on `spring.exit`.

**Reduced motion:** disclosure height and chevron rotation change immediately. Short content fades remain.

**Accessibility:** one real header button controls the frame region. The copy button remains separate from this trigger. Closed frames become inert immediately. File paths become buttons only when a click handler exists. Provide user feedback in `onCopy` and `onError`.

**Changes from upstream:**

- One shared disclosure connects the header and content, including their expanded-state attributes.
- A separate full-header trigger avoids nested controls. The error text and chevron are noninteractive header content.
- Error messages wrap instead of truncating. Internal and `node_modules` frames use readable muted ink.
- Parsed forms remain `at function (file:line:column)` and `at file:line:column`. Other frame text stays readable.

```tsx
import {
  StackTrace,
  StackTraceHeader,
  StackTraceError,
  StackTraceErrorType,
  StackTraceErrorMessage,
  StackTraceActions,
  StackTraceCopyButton,
  StackTraceExpandButton,
  StackTraceContent,
  StackTraceFrames,
} from "@sift-design/ui/ai/stack-trace";

<StackTrace
  trace={"TypeError: Missing moisture reading\n    at needsWater (src/irrigation.ts:18:24)"}
  onFilePathClick={(path, line, column) => selectSource(path, line, column)}
>
  <StackTraceHeader>
    <StackTraceError>
      <StackTraceErrorType />
      <StackTraceErrorMessage />
    </StackTraceError>
    <StackTraceActions>
      <StackTraceCopyButton />
    </StackTraceActions>
    <StackTraceExpandButton />
  </StackTraceHeader>
  <StackTraceContent>
    <StackTraceFrames />
  </StackTraceContent>
</StackTrace>;
```

Upstream reference: [AI Elements Stack Trace](https://elements.ai-sdk.dev/components/stack-trace).

## Test results

**When:** review a test run, identify failed tests, and inspect error details.

**Structure:** `TestResults` provides a summary. Its header contains `TestResultsSummary` and `TestResultsDuration`. `TestResultsContent` contains `TestResultsProgress` and suites. Each `TestSuite` contains `TestSuiteName`, optional `TestSuiteStats`, and `TestSuiteContent`. Each `Test` provides `TestStatus`, `TestName`, and `TestDuration` by default. Custom children can include `TestError`, `TestErrorMessage`, and `TestErrorStack`. Wrap error details with the kit `Collapsible` when needed.

**Props:** `TestResults.summary` accepts `passed`, `failed`, `skipped`, `total`, and optional `duration` in milliseconds. `TestSuite` requires `name` and `status`. It accepts the shared disclosure props, including `defaultOpen`, `open`, and `onOpenChange`. `Test` requires `name` and `status`, with optional `duration` in milliseconds. Status values are `passed`, `failed`, `skipped`, and `running`. `TestSuiteStats` accepts optional counts for passed, failed, and skipped tests.

**Motion:** the summary bar has one segment per outcome (passed, failed, skipped, not run), separated by a 2px gap. Segment widths follow changes on `--spring-smooth`. Suite height uses the same opening and closing springs. Content fades in over `duration.quick` (140 milliseconds) and out over `duration.instant` (80 milliseconds). Chevrons use `--spring-snappy-duration` and `--spring-snappy` (358 milliseconds to rest). Existing test rows do not replay an entrance.

**Reduced motion:** bar segments, disclosure height, and chevrons update immediately. Short disclosure fades remain.

**Accessibility:** status includes an icon and a readable label. Suite triggers are named buttons with expanded state. The bar is an image with a text alternative that lists every outcome count. Counts and durations use monospace type. Zero totals remain valid and produce zero progress. Closed suite content is inert.

**Changes from upstream:**

- Summary shows all three counts, including zeros, without nested badges or cards.
- The bar keeps the upstream passed and failed segments, adds skipped and not-run segments, and never hides a failure inside a full bar. The text reports completed tests and the pass percentage.
- Status colors use semantic tokens. Running status does not use an endless decorative pulse.
- Error details use a flat diagnostic region. Error message and stack text wrap.
- A recorded zero duration remains visible.

```tsx
import {
  TestResults,
  TestResultsHeader,
  TestResultsSummary,
  TestResultsDuration,
  TestResultsContent,
  TestResultsProgress,
  TestSuite,
  TestSuiteName,
  TestSuiteContent,
  Test,
} from "@sift-design/ui/ai/test-results";

<TestResults summary={{ passed: 1, failed: 1, skipped: 0, total: 2, duration: 155 }}>
  <TestResultsHeader>
    <TestResultsSummary />
    <TestResultsDuration />
  </TestResultsHeader>
  <TestResultsContent>
    <TestResultsProgress />
    <TestSuite name="tests/irrigation.test.ts" status="failed" defaultOpen>
      <TestSuiteName />
      <TestSuiteContent>
        <Test name="waters dry trays" status="passed" duration={42} />
        <Test name="handles a missing sensor" status="failed" duration={113} />
      </TestSuiteContent>
    </TestSuite>
  </TestResultsContent>
</TestResults>;
```

Upstream reference: [AI Elements Test Results](https://elements.ai-sdk.dev/components/test-results).

## File tree

**When:** Let a person inspect project files and select a file or folder.

**Structure:** `FileTree` contains `FileTreeFolder` and `FileTreeFile`. Folders contain more folders or files. `FileTreeIcon`, `FileTreeName`, and `FileTreeActions` compose custom file rows.

**Props:** `expanded` and `defaultExpanded` accept sets of folder paths. `onExpandedChange` receives a new set. `selectedPath` and `onSelect` control selection. Each folder and file needs a unique `path` and a readable `name`. Files accept `icon` or custom children. Give the root an `aria-label` for its contents.

**Motion:** The kit `Collapsible` measures folder content. Opening height uses `spring.smooth` (280ms visual duration, no bounce). Closing uses `spring.exit` (160ms visual duration, no bounce). Opacity uses `duration.quick` (140ms) on opening and `duration.instant` (80ms) on closing. Chevrons rotate with the CSS `--spring-snappy` curve and its duration. One shared `layoutId` moves the selection highlight with `selectionSpring` (stiffness 700, damping 48, mass 0.6). A separate `LayoutGroup` scopes each tree.

**Reduced motion:** Folder height and selection update immediately. Chevrons do not animate. Disclosure content keeps short opacity feedback.

**Accessibility:** The root uses `tree`; rows use `treeitem`; folder contents use `group`. Rows expose level, selection, and expanded state. One visible row is in the Tab sequence. Up and Down move focus. Right expands a folder or enters its first child. Left collapses a folder or focuses its parent. Home and End focus the first and last visible rows. Enter and Space select without scrolling. Folder chevrons are pointer controls; arrow keys provide the same expansion action. Custom action controls remain keyboard reachable.

**Changes from upstream:**

- Replaced icons and fixed colors with kit icons and semantic colors.
- Added measured disclosure motion and a scoped selection highlight.
- Added arrow keys, Home, End, roving focus, levels, and selected state.
- Preserved controlled expansion, custom children, row props, and all exports.

```tsx
import { useState } from "react";
import { FileTree, FileTreeFolder, FileTreeFile } from "@sift-design/ui/ai/file-tree";

function ProjectFiles() {
  const [selected, setSelected] = useState("larkspur-app/tasks.ts");
  return (
    <FileTree
      aria-label="Project files"
      defaultExpanded={new Set(["larkspur-app"])}
      selectedPath={selected}
      onSelect={setSelected}
    >
      <FileTreeFolder path="larkspur-app" name="larkspur-app">
        <FileTreeFile path="larkspur-app/tasks.ts" name="tasks.ts" />
      </FileTreeFolder>
    </FileTree>
  );
}
```

Upstream reference: [AI Elements File Tree](https://elements.ai-sdk.dev/components/file-tree).

## Schema display

**When:** Explain an application programming interface (API) endpoint before a person creates a request.

**Structure:** `SchemaDisplay` supplies context and a default endpoint view. It contains `SchemaDisplayHeader`, `SchemaDisplayMethod`, `SchemaDisplayPath`, `SchemaDisplayDescription`, and `SchemaDisplayContent`. `SchemaDisplayParameters`, `SchemaDisplayRequest`, and `SchemaDisplayResponse` are collapsible sections. `SchemaDisplayParameter` and recursive `SchemaDisplayProperty` render fields. `SchemaDisplayBody` groups custom content. `SchemaDisplayExample` contains preformatted examples.

**Props:** `method` accepts GET, POST, PUT, PATCH, or DELETE. `path` highlights brace-delimited parameters. Optional `description`, `parameters`, `requestBody`, and `responseBody` populate the default view. Parameters support `name`, `type`, `required`, `description`, and `location`. Properties also support nested `properties` and array `items`. Custom children replace default sections. Section props include `open`, `defaultOpen`, and `onOpenChange` from the kit `Collapsible`.

**Motion:** Sections use measured height with `spring.smooth` (280ms visual duration) on opening and `spring.exit` (160ms) on closing. Opening opacity uses `duration.quick` (140ms); closing opacity uses `duration.instant` (80ms). Chevrons use `--spring-snappy` and its duration. Nested properties start expanded at depths zero and one. Static endpoint content has no entrance animation.

**Reduced motion:** Height updates immediately. Chevrons update without rotation animation. Short disclosure fades remain.

**Accessibility:** Section triggers are real buttons with expanded state and visible focus. Closed content is inert. Method labels identify each operation without color alone. Required fields have text labels. Paths render as text, not HTML. Long paths and field descriptions wrap on narrow screens.

**Changes from upstream:**

- Replaced method colors with status and accent tokens.
- Replaced icons and added kit disclosure motion.
- Removed HTML injection from path rendering; custom children remain valid elements.
- Added wrapping and bounded indentation for nested fields.

```tsx
import { SchemaDisplay } from "@sift-design/ui/ai/schema-display";

<SchemaDisplay
  method="POST"
  path="/api/tasks"
  description="Create a task for a greenhouse grower."
  requestBody={[
    { name: "title", type: "string", required: true },
    {
      name: "assignment",
      type: "object",
      properties: [{ name: "benchId", type: "string", required: true }],
    },
  ]}
  responseBody={[{ name: "id", type: "string" }]}
/>;
```

Upstream reference: [AI Elements Schema Display](https://elements.ai-sdk.dev/components/schema-display).

## Environment variables

**When:** Show connection settings while keeping values visually hidden by default.

**Structure:** `EnvironmentVariables` owns visibility. `EnvironmentVariablesHeader` contains `EnvironmentVariablesTitle` and `EnvironmentVariablesToggle`. `EnvironmentVariablesContent` contains `EnvironmentVariable` rows. Compose rows with `EnvironmentVariableGroup`, `EnvironmentVariableName`, `EnvironmentVariableValue`, `EnvironmentVariableRequired`, and `EnvironmentVariableCopyButton`.

**Props:** The root accepts controlled `showValues`, initial `defaultShowValues`, and `onShowValuesChange`. A row requires `name` and `value`. Its default children display both. Add a copy button and required badge through custom children. Copy accepts `copyFormat="name" | "value" | "export"`, `timeout` (2000ms default), `onCopy`, and `onError`. Copy always uses the actual value, even when hidden. Hidden values use at most 20 masking characters.

**Motion:** The copy icon swaps in place through the shared `CopyStateIcon`: the check pops in on `spring.lively`, the return to the copy icon settles on `spring.snappy`, and the old icon leaves on `spring.exit` with an 80ms fade. Nothing animates on first render. Eye icons swap with `spring.snappy` (200ms visual duration, 0.12 bounce). Opacity uses `duration.instant` (80ms). Exiting icons use `spring.exit` (160ms visual duration, no bounce). The kit switch supplies its own state motion. Value text updates immediately without a reveal animation.

**Reduced motion:** Icons only fade for 80ms. They do not rotate or scale. Values remain available without waiting for motion.

**Accessibility:** The visibility switch has an accessible name. Copy buttons include the variable name. A status region announces copy success or failure. Hidden values have the accessible label “Value hidden”. Required badges use text. Focus remains on the active control during icon changes.

**Changes from upstream:**

- Replaced icons and fixed styling with kit components and semantic colors.
- Added spring icon swaps, copy names, and live status feedback.
- Cleared previous confirmation timers on repeat copies and cleaned them up on unmount.
- Shell export formatting now quotes apostrophes and preserves literal value characters.

Masking is a display feature, not a security boundary. Values remain in application memory. Do not send private credentials to an untrusted client.

```tsx
import {
  EnvironmentVariables,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
  EnvironmentVariablesContent,
  EnvironmentVariable,
  EnvironmentVariableGroup,
  EnvironmentVariableName,
  EnvironmentVariableValue,
  EnvironmentVariableRequired,
  EnvironmentVariableCopyButton,
} from "@sift-design/ui/ai/environment-variables";

<EnvironmentVariables>
  <EnvironmentVariablesHeader>
    <EnvironmentVariablesTitle>Greenhouse connection</EnvironmentVariablesTitle>
    <EnvironmentVariablesToggle />
  </EnvironmentVariablesHeader>
  <EnvironmentVariablesContent>
    <EnvironmentVariable name="LARKSPUR_API_KEY" value="fictional-demo-key">
      <div className="min-w-0 flex-1">
        <EnvironmentVariableGroup>
          <EnvironmentVariableName />
          <EnvironmentVariableRequired />
        </EnvironmentVariableGroup>
        <EnvironmentVariableValue />
      </div>
      <EnvironmentVariableCopyButton />
    </EnvironmentVariable>
  </EnvironmentVariablesContent>
</EnvironmentVariables>;
```

Upstream reference: [AI Elements Environment Variables](https://elements.ai-sdk.dev/components/environment-variables).

## Commit

**When:** Show a saved code change with its author, timestamp, and changed files.

**Structure:** `Commit` wraps `CommitHeader` and `CommitContent`. Use `CommitAuthorAvatar`, `CommitInfo`, and `CommitActions` inside the header. Put `CommitMessage`, `CommitHash`, and `CommitMetadata` inside the information group. Metadata can include `CommitAuthor`, `CommitSeparator`, and `CommitTimestamp`. Content contains `CommitFiles` with `CommitFile` rows. Each row contains `CommitFileInfo` and `CommitFileChanges`. File information includes `CommitFilePath`, `CommitFileStatus`, and optional `CommitFileIcon`. Changes contain `CommitFileAdditions` and `CommitFileDeletions`.

**Props:** `Commit` accepts Collapsible props, including `open`, `defaultOpen`, and `onOpenChange`. `CommitHeader` keeps CollapsibleTrigger props. Set `aria-label` to a short commit description. `CommitAuthorAvatar` requires `initials`. `CommitTimestamp` requires a `Date` in `date`; optional `now` sets the reference date. `CommitCopyButton` requires `hash` and accepts `onCopy`, `onError`, and `timeout` (default `2000` milliseconds). `CommitFileStatus.status` accepts `added`, `modified`, `deleted`, or `renamed`. Additions and deletions require `count`; nonpositive counts render nothing. All parts accept `className` and their upstream element props.

**Motion:** The kit Collapsible measures content height. Opening uses `spring.smooth` (280ms visual duration, no bounce), with a `duration.quick` (140ms) fade. Closing uses `spring.exit` (160ms visual duration, no bounce), with a `duration.instant` (80ms) fade and `leave` easing. The chevron uses the matching CSS spring tokens. The copy icon swaps in place through the shared `CopyStateIcon`: the check pops in on `spring.lively`, the return to the copy icon settles on `spring.snappy`, and the old icon leaves on `spring.exit` with an 80ms fade. Nothing animates on first render. Static content has no entrance animation.

**Reduced motion:** Disclosure height changes immediately. Content keeps short fades. The chevron changes state without travel.

**Accessibility:** The header uses a real disclosure button with expanded state and a focus ring. The copy action is a sibling, not a nested button. `CommitActions` keeps pointer access and stops event propagation. The copy control has an accessible name and announces confirmation. Closed content is inert and hidden from assistive technology. File statuses use an icon and a full label. Addition and deletion counts have accessible labels. Handle `onError` to provide clipboard failure feedback.

**Changes from upstream:**

- Icons use the kit icon set. Colors use semantic theme tokens.
- The header has a separate button beneath its visual content. This avoids nested interactive controls.
- File statuses show full words instead of single letters.
- Relative dates render immediately. Optional `now` supports deterministic examples; the default uses the current date.
- Copy confirmation has a name, status announcement, and success color. Initials need no remote image.

```tsx
import {
  Commit,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitHash,
  CommitAuthorAvatar,
  CommitMetadata,
  CommitTimestamp,
  CommitActions,
  CommitCopyButton,
  CommitContent,
  CommitFiles,
  CommitFile,
  CommitFileInfo,
  CommitFilePath,
  CommitFileStatus,
  CommitFileChanges,
  CommitFileAdditions,
  CommitFileDeletions,
} from "@sift-design/ui/ai/commit";

const hash = "e4b7a92cd13f6058a947bd21c8d6e0a2f5b31970";

<Commit defaultOpen>
  <CommitHeader aria-label="Raise the misting threshold on bench 4">
    <CommitAuthorAvatar initials="JS" aria-label="John Smith" />
    <CommitInfo>
      <CommitMessage>Raise the misting threshold on bench 4</CommitMessage>
      <CommitHash>{hash.slice(0, 7)}</CommitHash>
      <CommitMetadata>
        John Smith
        <CommitTimestamp date={new Date("2026-11-10T09:42:00Z")} now={new Date("2026-11-10T12:00:00Z")} />
      </CommitMetadata>
    </CommitInfo>
    <CommitActions aria-label="Commit actions">
      <CommitCopyButton hash={hash} />
    </CommitActions>
  </CommitHeader>
  <CommitContent>
    <CommitFiles>
      <CommitFile>
        <CommitFileInfo>
          <CommitFilePath>src/climate/misting.ts</CommitFilePath>
          <CommitFileStatus status="modified" />
        </CommitFileInfo>
        <CommitFileChanges>
          <CommitFileAdditions count={18} />
          <CommitFileDeletions count={6} />
        </CommitFileChanges>
      </CommitFile>
    </CommitFiles>
  </CommitContent>
</Commit>;
```

Upstream reference: [AI Elements Commit](https://elements.ai-sdk.dev/components/commit).

## Package info

**When:** Review a dependency change before applying it. Show the version change, release type, description, and required packages.

**Structure:** `PackageInfo` provides shared package data. Without children, it renders `PackageInfoHeader`, `PackageInfoName`, `PackageInfoChangeType`, and `PackageInfoVersion`. Custom children can add `PackageInfoDescription` and `PackageInfoContent`. Use `PackageInfoDependencies` with `PackageInfoDependency` rows inside content. Compose application-specific controls beside these parts.

**Props:** `PackageInfo` requires `name`. Optional props are `currentVersion`, `newVersion`, and `changeType`. Change types are `major`, `minor`, `patch`, `added`, and `removed`. Only `major` takes the warning color, because it can break callers; `minor` and `patch` stay neutral, and danger stays reserved for failures. `PackageInfoDependency` requires `name` and accepts `version`. Context supplies the name, versions, and change type to child parts. Child content can replace their default text. All parts accept `className` and their upstream element props.

**Motion:** Package information is static, with no mount animation. In the specimen, selection borders use `--dur-quick` (140ms). The selection mark enters with `--spring-smooth` (280ms visual duration, no bounce) and a 140ms fade. It exits with `--spring-exit` (160ms visual duration, no bounce) and an 80ms fade using `--ease-leave`. The Apply control uses the kit Switch motion. Selection never installs a package.

**Reduced motion:** The card remains static. The selection mark uses an 80ms opacity change without scaling. The kit Switch follows the shared reduced-motion rules.

**Accessibility:** Change badges include both an icon and a visible label. Versions use monospaced text. The version arrow has a text equivalent for assistive technology. Added or removed packages can show one version. Label each application-specific control with the package name. Announce selection changes without claiming an installation occurred.

**Changes from upstream:**

- Icons use the kit icon set. Badges use semantic theme colors.
- Package names and dependency rows wrap on narrow screens.
- Versions include accessible current and new labels.
- `data-slot="package-info"` and `data-change-type` support integration styling.
- The optional Apply switches belong to the specimen, not the reusable package component.

```tsx
import {
  PackageInfo,
  PackageInfoHeader,
  PackageInfoName,
  PackageInfoChangeType,
  PackageInfoVersion,
  PackageInfoDescription,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
} from "@sift-design/ui/ai/package-info";

<PackageInfo name="@larkspur/sensors" currentVersion="2.8.1" newVersion="3.0.0" changeType="major">
  <PackageInfoHeader>
    <PackageInfoName />
    <PackageInfoChangeType />
  </PackageInfoHeader>
  <PackageInfoVersion />
  <PackageInfoDescription>
    Read soil moisture for each bench. The new version requires a probe identifier.
  </PackageInfoDescription>
  <PackageInfoContent>
    <PackageInfoDependencies>
      <PackageInfoDependency name="@larkspur/probe-types" version="^2.0.0" />
    </PackageInfoDependencies>
  </PackageInfoContent>
</PackageInfo>;
```

Upstream reference: [AI Elements Package Info](https://elements.ai-sdk.dev/components/package-info).

## Canvas

**When:** show an editable workflow with connected steps. Set an explicit height on the containing element.

**Structure:** `Canvas` contains the dotted background, custom nodes, edges, `Controls`, and fixed `Panel` elements. `Node` contains header, title, description, action, content, footer, and optional connection handles. A selected node can show `Toolbar`. Register `Edge.Animated` and `Edge.Temporary` in `edgeTypes`. Pass `Connection` as `connectionLineComponent`.

**Props:** all `ReactFlowProps` pass through. This includes controlled `nodes`, `edges`, change handlers, `nodeTypes`, `edgeTypes`, and `onConnect`. Generic node and edge types are supported. Defaults enable `fitView`, scroll panning, and drag selection. Double-click zoom and drag panning are disabled. Delete and Backspace remove selected elements unless `deleteKeyCode` overrides them.

**Motion:** the canvas has no entrance animation. Selection feedback uses `--dur-quick` (**140ms**, linear). Toolbar arrival uses `--spring-snappy` (**358ms** CSS duration; **200ms** visual duration, **0.12** bounce). An active edge marker follows its path in **2s** cycles. Set `data.running` or `animated` only while work runs. Remove that state when work stops. Dragging follows the pointer without an added spring.

**Reduced motion:** active edges show a static midpoint marker. Toolbar arrival becomes a **140ms** linear fade. Programmatic view changes should use `duration: 0`. The specimen uses instant responsive fitting.

**Accessibility:** preserve the flow library's keyboard support. Tab reaches nodes and controls. Enter selects a focused node. Arrow keys move the selected node. Give the canvas an accessible name. Name custom actions and announce meaningful run states outside the graph. Add button alternatives for connecting and moving steps. Supply a text description of the workflow. Do not communicate completion through color alone.

**Changes from upstream:**

- Canvas, handles, selection, controls, panels, and minimap use semantic theme tokens in both themes.
- Node parts use compact typography and semantic surfaces.
- Animated edges require an explicit running state. They no longer animate while idle.
- Edge paths use supplied handle coordinates, including custom handle positions.
- Temporary edges preserve marker, style, and interaction width props.
- Connection previews use theme tokens instead of a fixed endpoint fill.
- Canvas supports typed node and edge generics. Public upstream names and props remain available.

```tsx
import { useState } from "react";
import { addEdge, type Connection as FlowConnection, type Edge as FlowEdge } from "@xyflow/react";
import { Canvas } from "@sift-design/ui/ai/canvas";
import { Node, NodeHeader, NodeTitle, NodeContent } from "@sift-design/ui/ai/node";
import { Edge } from "@sift-design/ui/ai/edge";
import { Connection } from "@sift-design/ui/ai/connection";
import { Controls } from "@sift-design/ui/ai/controls";
import { Panel } from "@sift-design/ui/ai/panel";
import { Toolbar } from "@sift-design/ui/ai/toolbar";

const nodeTypes = {
  step: ({ data }) => (
    <Node handles={{ target: true, source: true }}>
      <NodeHeader>
        <NodeTitle>{data.title}</NodeTitle>
      </NodeHeader>
      <NodeContent>{data.detail}</NodeContent>
      <Toolbar>
        <button type="button">Inspect step</button>
      </Toolbar>
    </Node>
  ),
};
const edgeTypes = { activity: Edge.Animated, temporary: Edge.Temporary };

function Workflow() {
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const onConnect = (connection: FlowConnection) =>
    setEdges((current) => addEdge({ ...connection, type: "temporary" }, current));
  return (
    <div style={{ height: 480 }}>
      <Canvas
        aria-label="Climate watch workflow"
        defaultNodes={[
          {
            id: "sensor",
            type: "step",
            position: { x: 0, y: 0 },
            data: { title: "Sensor hub", detail: "Read the greenhouse temperature." },
          },
          {
            id: "check",
            type: "step",
            position: { x: 440, y: 0 },
            data: { title: "Check temperature", detail: "Continue above 30°C." },
          },
        ]}
        edges={edges}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={Connection}
      >
        <Controls />
        <Panel position="top-right">Climate watch</Panel>
      </Canvas>
    </div>
  );
}
```

Upstream reference: [AI Elements Canvas](https://elements.ai-sdk.dev/components/canvas).

## Node

**When:** represent one workflow step. See Canvas for the combined workflow example.

**Structure:** `Node` → `NodeHeader` with `NodeTitle`, `NodeDescription`, and `NodeAction`; then `NodeContent` and `NodeFooter`. Handles sit on the left and right.

**Props:** `handles={{ target, source }}` controls the two handles. All card props pass through. Optional `data-state="running"` adds a ring. `data-state="done"` changes the border. Pair each state with visible text.

**Motion:** border and ring feedback use `--dur-quick`, **140ms** linear. There is no entrance animation.

**Reduced motion:** state feedback stays. No travel occurs.

**Accessibility:** the flow node wrapper owns keyboard focus. Name the step in its title. Give controls inside the node the `nodrag` class.

**Changes from upstream:** compact type, semantic surfaces, titled handles, and optional state styling. All node part exports remain available.

```tsx
import { Node, NodeHeader, NodeTitle, NodeDescription, NodeContent, NodeFooter } from "@sift-design/ui/ai/node";

<Node handles={{ target: true, source: true }} data-state="done">
  <NodeHeader>
    <NodeTitle>Check temperature</NodeTitle>
    <NodeDescription>Propagation house</NodeDescription>
  </NodeHeader>
  <NodeContent>
    Continue above <span className="font-mono">30°C</span>.
  </NodeContent>
  <NodeFooter>Done</NodeFooter>
</Node>;
```

Upstream reference: [AI Elements Node](https://elements.ai-sdk.dev/components/node).

## Edge

**When:** show a connection between workflow steps. See Canvas for registration and the combined example.

**Structure:** `Edge.Temporary` draws a dashed path. `Edge.Animated` draws a path with an optional activity marker.

**Props:** both accept `EdgeProps`, including path coordinates, markers, style, and interaction width. `Edge.Animated` also accepts `running`. Otherwise it reads `data.running`, then `animated`. The default is inactive.

**Motion:** the marker follows the path in **2s** cycles only while running. This activity timing is separate from interface transition tokens. Native marching dashes are disabled to avoid duplicate activity signals.

**Reduced motion:** the active marker stays at the path midpoint. The path remains visible.

**Accessibility:** explain active and complete states in visible text and a suitable status region. The marker is decorative. Selected edges retain focus feedback.

**Changes from upstream:** idle edges no longer loop. Handle coordinates come from the flow library. Temporary paths preserve style, marker, and interaction props. Theme tokens replace fixed styling.

```tsx
import { Edge } from "@sift-design/ui/ai/edge";

const edgeTypes = { activity: Edge.Animated, temporary: Edge.Temporary };
const edges = [{ id: "sensor-check", source: "sensor", target: "check", type: "activity", data: { running: true } }];
// Set data.running to false when work stops.
```

Upstream reference: [AI Elements Edge](https://elements.ai-sdk.dev/components/edge).

## Connection

**When:** preview a new connection while a person drags from a handle. See Canvas for the complete setup.

**Structure:** a dashed path and endpoint marker inside an SVG group.

**Props:** accepts the library's `ConnectionLineComponent` props. Handle coordinates and positions determine the curve. Connection validity is available through `data-state`.

**Motion:** the endpoint follows pointer coordinates directly. There is no looping animation or delayed entrance.

**Reduced motion:** the preview still follows deliberate pointer movement. No additional motion occurs.

**Accessibility:** the preview is decorative. Provide a button or form alternative for connecting steps without dragging.

**Changes from upstream:** semantic endpoint fill, a thicker path, and support for all supplied handle positions. Removed automatic dash animation.

```tsx
import { Canvas } from "@sift-design/ui/ai/canvas";
import { Connection } from "@sift-design/ui/ai/connection";

<div style={{ height: 480 }}>
  <Canvas connectionLineComponent={Connection} />
</div>;
```

Upstream reference: [AI Elements Connection](https://elements.ai-sdk.dev/components/connection).

## Controls

**When:** provide zoom, fit, and interaction controls for a canvas.

**Structure:** place `Controls` inside `Canvas`. The flow library supplies the control buttons.

**Props:** all library control props pass through. Use `orientation`, `position`, `showZoom`, `showFitView`, `showInteractive`, and `fitViewOptions` as needed.

**Motion:** background feedback uses `--dur-quick`, **140ms** linear. The controls stay fixed during viewport movement.

**Reduced motion:** use `fitViewOptions={{ duration: 0 }}` for instant programmatic fitting.

**Accessibility:** buttons retain their accessible names and keyboard operation. Focus uses the semantic focus ring. Buttons measure **32 × 32px**.

**Changes from upstream:** controls use theme surfaces, button sizing, focus rings, and hover feedback. No framework directive is required.

```tsx
import { Canvas } from "@sift-design/ui/ai/canvas";
import { Controls } from "@sift-design/ui/ai/controls";

<div style={{ height: 480 }}>
  <Canvas>
    <Controls orientation="horizontal" showInteractive={false} />
  </Canvas>
</div>;
```

Upstream reference: [AI Elements Controls](https://elements.ai-sdk.dev/components/controls).

## Panel

**When:** keep workflow actions or status fixed above the canvas.

**Structure:** place `Panel` inside `Canvas`. Put real buttons or readable status text inside the panel.

**Props:** accepts the library panel props. `position` selects a corner or centered edge. `className` adjusts layout and spacing.

**Motion:** **0ms**. The panel stays fixed while the canvas pans and zooms.

**Reduced motion:** unchanged. The panel has no spatial animation.

**Accessibility:** this is a nonmodal container, not a dialog. It does not trap focus. Name controls and announce changing status when useful.

**Changes from upstream:** semantic surface, compact text, and consistent spacing. The prop type is exported.

```tsx
import { Canvas } from "@sift-design/ui/ai/canvas";
import { Panel } from "@sift-design/ui/ai/panel";
import { Button } from "@sift-design/ui/button";

<div style={{ height: 480 }}>
  <Canvas>
    <Panel position="top-right">
      <Button>Run</Button>
    </Panel>
  </Canvas>
</div>;
```

Upstream reference: [AI Elements Panel](https://elements.ai-sdk.dev/components/panel).

## Toolbar

**When:** show actions for a selected workflow step.

**Structure:** place `Toolbar` inside a custom node. It stays outside the node card through the library's portal.

**Props:** accepts all `NodeToolbar` props. The default position is bottom. `isVisible` overrides selection-based visibility. `offset` adjusts spacing.

**Motion:** arrival uses `--spring-snappy`, **358ms** CSS duration, with a **4px** translation and opacity change. The visual spring duration is **200ms**, with **0.12** bounce. Removal is immediate, with no delayed focus removal.

**Reduced motion:** arrival becomes a **140ms** linear fade using `--dur-quick`. Translation is removed.

**Accessibility:** the container uses `role="group"`. Give the group a name and use real buttons inside it. The default library selection behavior controls visibility.

**Changes from upstream:** semantic card surface, named group support, token-based arrival motion, and exported prop type.

```tsx
import { Toolbar } from "@sift-design/ui/ai/toolbar";
import { Button } from "@sift-design/ui/button";

<Toolbar aria-label="Sensor hub actions">
  <Button variant="ghost" size="sm">
    Inspect step
  </Button>
</Toolbar>;
```

Upstream reference: [AI Elements Toolbar](https://elements.ai-sdk.dev/components/toolbar).

## Audio player

**When:** Let people play a generated response or review a voice note. Provide a transcript when speech carries information.

**Structure:** `AudioPlayer` wraps `AudioPlayerElement` and `AudioPlayerControlBar`. The bar contains play, seek, time, range, mute, and volume controls.

**Props:** `AudioPlayer` accepts the media controller props, except `audio`, which is always enabled. `AudioPlayerElement` accepts `src` or generated speech `data`, plus native audio props and `ref`. Seek buttons accept `seekOffset`, which defaults to `10` seconds. All controls retain their underlying media control props, including custom children and styles.

**Motion:** Hover colors use `duration.quick` (**140ms**, linear). The round play button presses to 0.94 scale on `--spring-press`; reduced motion removes the scale. Playback follows the native media clock. Seeking and volume updates have no delayed animation.

**Reduced motion:** Playback controls retain brief color feedback. There is no spatial animation.

**Accessibility:** Controls retain keyboard support and accessible names from the media controller. Focus uses a **2px** token-colored outline. Time displays use the mono typeface. Provide a text transcript alongside speech.

**Changes from upstream:**

- Controls use semantic theme tokens in light and dark themes.
- Buttons measure **28px**. Range tracks measure **6px**, with **16px** circular thumbs.
- Time and duration use mono type. Controls use kit icons.
- The control bar uses flexible spacing instead of grouped borders.
- Generated speech data does not leak onto the audio element as a DOM attribute.
- The specimen generates a local WAV blob. It makes no audio requests.

```tsx
import {
  AudioPlayer,
  AudioPlayerElement,
  AudioPlayerControlBar,
  AudioPlayerPlayButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerDurationDisplay,
  AudioPlayerMuteButton,
} from "@sift-design/ui/ai/audio-player";

// audioUrl is a local blob URL. Revoke it when the owner unmounts.
<AudioPlayer>
  <AudioPlayerElement src={audioUrl} onTimeUpdate={handleTimeUpdate} />
  <AudioPlayerControlBar>
    <AudioPlayerPlayButton />
    <AudioPlayerTimeDisplay />
    <AudioPlayerTimeRange />
    <AudioPlayerDurationDisplay />
    <AudioPlayerMuteButton />
  </AudioPlayerControlBar>
</AudioPlayer>;
```

Upstream reference: [AI Elements Audio player](https://elements.ai-sdk.dev/components/audio-player).

## Transcription

**When:** Show text that follows audio playback. Let people select a segment to seek to its start.

**Structure:** `Transcription` receives segments and a render function. Render one `TranscriptionSegment` for each segment. Each segment includes text, `startSecond`, and `endSecond`.

**Props:** `segments` is required. `currentTime` controls the playback position. `onSeek(time)` receives segment selections. The child function receives `(segment, index)`. `TranscriptionSegment` requires `segment` and `index`. Set `showTimestamp` to display a mono start time. Custom children replace the segment text. Native button props remain available.

**Motion:** Background and text colors transition with `duration.quick` (**140ms**, linear). Playback retargets the existing color transition. Segments do not replay an entrance.

**Reduced motion:** Colors transition with `duration.instant` (**80ms**). No segment moves or scales.

**Accessibility:** Segments are keyboard-operable buttons. The current segment exposes `aria-current`. An inset line reinforces its color change. Focus uses a **2px** token-colored outline. Playback changes do not flood a live region.

**Changes from upstream:**

- Optional mono timestamps support a full-width transcript list.
- Active segments use a calm highlight instead of low-contrast inactive text.
- Uncontrolled selections update the internal playback position.
- A prevented click does not seek. Custom children render inside the segment.

```tsx
import { Transcription, TranscriptionSegment } from "@sift-design/ui/ai/transcription";

<Transcription
  segments={segments}
  currentTime={currentTime}
  onSeek={(time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }}
  className="flex-col"
>
  {(segment, index) => <TranscriptionSegment key={segment.startSecond} segment={segment} index={index} showTimestamp />}
</Transcription>;
```

Upstream reference: [AI Elements Transcription](https://elements.ai-sdk.dev/components/transcription).

## Speech input

**When:** Let people dictate text after an explicit button press. Use simulation for demonstrations that must not request microphone access.

**Structure:** `SpeechInput` contains a kit button and a hidden status message. Its wrapper exposes `data-state`: `idle`, `starting`, `listening`, or `processing`.

**Props:** `onTranscriptionChange(text)` receives recognized text. Native speech recognition emits finalized text. `onAudioRecorded(blob)` supplies the recording fallback and returns a transcript promise. `lang` defaults to `en-US`. `simulate` bypasses microphone access. `simulatedTranscript` supplies the sample text. Simulation emits the growing full text every **240ms**. `onListeningChange` reports recording state. `onSpeechError` receives a recovery message. Button props, children, and a cancelable `onClick` remain available.

**Motion:** Button color feedback uses kit defaults. A recording ring scales and fades over **1.2s** while listening. It stops when recording stops. Processing uses the kit spinner. No entrance or exit delays block input.

**Reduced motion:** The recording ring stays still. The kit spinner honors its reduced-motion rules.

**Accessibility:** The default button name switches between Start recording and Stop recording. It exposes `aria-pressed` and `aria-busy`. A polite status announces capture, processing, unsupported input, or errors. Supply `onSpeechError` to display recovery text visibly in the surrounding form. Keep a labeled text field available for typing.

**Changes from upstream:**

- Kit icons, semantic colors, and a single bounded activity ring replace the original styling.
- Simulation never requests permission and stops automatically after the sample.
- Microphone access starts only after activation. Pending access prevents repeated requests.
- Recorder blobs use the recorder's actual media type.
- Capture resources stop on unmount. Late callbacks cannot update an unmounted component.
- An unsupported fallback remains disabled without `onAudioRecorded`.

```tsx
import { SpeechInput } from "@sift-design/ui/ai/speech-input";

// Keep a labeled, editable text field connected to note.
<SpeechInput
  simulate
  simulatedTranscript="Check the greenhouse vents before watering."
  onTranscriptionChange={setNote}
  onListeningChange={setListening}
/>;

// For real capture, omit simulate. Supply the fallback when needed.
<SpeechInput
  onTranscriptionChange={appendRecognizedText}
  onAudioRecorded={transcribeRecordedAudio}
  onSpeechError={setError}
/>;
```

Upstream reference: [AI Elements Speech input](https://elements.ai-sdk.dev/components/speech-input).

## Mic selector

**When:** choose an audio input before a voice conversation. Use supplied devices for examples that must not access microphone hardware.

**Structure:** `MicSelector` → `MicSelectorTrigger` with `MicSelectorValue`, then `MicSelectorContent`. Content contains `MicSelectorInput`, `MicSelectorList`, and `MicSelectorEmpty`. The list render function receives devices. Render each device with `MicSelectorItem` and `MicSelectorLabel`.

**Props:** root supports `value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`, and `onOpenChange`. Optional `devices: MediaDeviceInfo[]` bypasses all media APIs. An empty array represents no connected devices. `MicSelectorContent.popoverOptions` forwards overlay options. Each item needs an explicit device ID as `value`. Add the device label to `keywords` for search.

`useAudioDevices({ devices? })` returns `devices`, `loading`, `error`, `hasPermission`, and `loadDevices`. Without fixtures, enumeration runs on mount without requesting permission. Opening the selector requests permission once per opening when needed. Call `loadDevices()` for an explicit permission request or retry. Every temporary media track stops immediately after permission is granted. Device changes refresh enumeration without another permission request. Permission errors appear with a retry action.

**Motion:** the shared popover uses `--spring-snappy-duration` / `--spring-snappy` for entrance: **358ms**, corresponding to `spring.snappy` (**0.2s** visual duration, **0.12** bounce). Exit uses `--spring-exit-duration` / `--spring-exit`: **335ms**, corresponding to `spring.exit` (**0.16s**, no bounce). Opacity enters over `duration.quick` (**140ms linear**) and exits over `duration.instant` (**80ms leave**). Selection checks crossfade over **140ms linear**. Keyboard focus does not change the saved device until selection.

**Reduced motion:** the overlay uses a **140ms** entrance fade and **80ms** exit fade without travel or scale. Selection checks fade over **80ms**.

**Accessibility:** the trigger is a named button. The popover and search field have default accessible names. Arrow keys navigate results. Enter chooses a device. Escape closes the popover and restores focus. A visible check and hidden selected text identify the saved choice. Loading and permission errors use status messages. Override the trigger name when its visible contents do not identify the setting.

**Changes from upstream:**

- Adds optional supplied devices to the root and hook.
- Replaces icons with the kit icon set and styles with semantic tokens.
- Adds selected checks, loading feedback, permission errors, and retry.
- Prevents repeated permission prompts after denial during one opening.
- Uses device enumeration, not permission requests, for device-change events.
- Search navigation no longer changes the saved selection. Item callbacks run after the default selection behavior.
- Empty device labels use “Microphone”. Hardware IDs use monospaced type.

```tsx
import {
  MicSelector,
  MicSelectorTrigger,
  MicSelectorValue,
  MicSelectorContent,
  MicSelectorInput,
  MicSelectorList,
  MicSelectorItem,
  MicSelectorLabel,
  MicSelectorEmpty,
} from "@sift-design/ui/ai/mic-selector";

// Pass application-managed MediaDeviceInfo objects to bypass microphone access.
function AudioInput({ devices }: { devices: MediaDeviceInfo[] }) {
  return (
    <MicSelector devices={devices}>
      <MicSelectorTrigger aria-label="Choose microphone">
        <MicSelectorValue />
      </MicSelectorTrigger>
      <MicSelectorContent>
        <MicSelectorInput />
        <MicSelectorList>
          {(items) =>
            items.map((device) => (
              <MicSelectorItem key={device.deviceId} value={device.deviceId} keywords={[device.label]}>
                <MicSelectorLabel device={device} />
              </MicSelectorItem>
            ))
          }
        </MicSelectorList>
        <MicSelectorEmpty>No microphones connected.</MicSelectorEmpty>
      </MicSelectorContent>
    </MicSelector>
  );
}
```

Upstream reference: [AI Elements Mic selector](https://elements.ai-sdk.dev/components/mic-selector).

## Voice selector

**When:** compare voice names, attributes, and previews before choosing an assistant voice.

**Structure:** `VoiceSelector` → `VoiceSelectorTrigger` and `VoiceSelectorContent`. Content wraps a command interface with `VoiceSelectorInput`, `VoiceSelectorList`, `VoiceSelectorEmpty`, `VoiceSelectorGroup`, and `VoiceSelectorItem`. `VoiceSelectorDialog` remains available as the standalone command-dialog form. `VoiceSelectorSeparator` divides groups. `VoiceSelectorShortcut` shows keyboard hints.

Use `VoiceSelectorName`, `VoiceSelectorDescription`, and `VoiceSelectorAttributes` for each voice. Attributes contain `VoiceSelectorGender`, `VoiceSelectorAccent`, `VoiceSelectorAge`, and optional `VoiceSelectorBullet` separators. `VoiceSelectorPreview` exposes play, pause, and loading states without choosing an audio implementation.

**Props:** root supports `value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`, and `onOpenChange`. `useVoiceSelector()` exposes `value`, `setValue`, `open`, and `setOpen` within the root. Set item `value`, `keywords`, and `onSelect` explicitly. Selection and dismissal remain application-controlled. Content accepts a `title` for its accessible name. Gender accepts all upstream gender values. Accent accepts any string. Both parts accept custom children. Preview accepts `playing`, `loading`, `onPlay`, native button props, and `disabled`. Its `onPlay` callback also handles pause requests when `playing` is true.

**Motion:** the shared dialog enters with `--spring-smooth-duration` / `--spring-smooth`: **538ms**, corresponding to `spring.smooth` (**0.28s** visual duration, no bounce). It exits with `--spring-exit-duration` / `--spring-exit`: **335ms**, corresponding to `spring.exit` (**0.16s**, no bounce). Opacity enters over `duration.quick` (**140ms linear**) and exits over `duration.instant` (**80ms leave**). Row focus uses **140ms linear** background feedback. Preview buttons inherit the **263ms** press spring. No decorative motion repeats.

**Reduced motion:** the dialog uses a **140ms** entrance fade and **80ms** exit fade without travel or scale. Press scale is removed. Loading indicators remain static.

**Accessibility:** content supplies a dialog title. The search field has a default accessible name. Arrow keys navigate the command list. Escape closes the dialog and restores trigger focus. Preview uses a real button with play/pause names, pressed state, and busy state. Preview keyboard events do not select a containing command item. Prefer a separate preview area outside the list to keep each option focused on selection. Provide a voice-specific preview name when multiple buttons appear. Attribute values use visible text, not icon or flag recognition.

**Changes from upstream:**

- Preserves every exported component, hook, prop, and gender value.
- Replaces gender symbols and accent flags with readable text. Custom children remain supported.
- Replaces preview icons with the kit icon set.
- Adds preview pressed and busy states. A prevented click does not invoke `onPlay`.
- Adds default search and list names, semantic styling, and shared overlay motion.
- The example uses fictional voices and a generated **1.35s** tone, not recorded speech. Audio starts only on a preview press.
- The example stops audio on pause, selection, dismissal, or unmount. An unavailable audio API produces a readable fallback message.

```tsx
import { useState } from "react";
import { Button } from "@sift-design/ui/button";
import {
  VoiceSelector,
  VoiceSelectorTrigger,
  VoiceSelectorContent,
  VoiceSelectorInput,
  VoiceSelectorList,
  VoiceSelectorEmpty,
  VoiceSelectorGroup,
  VoiceSelectorItem,
  VoiceSelectorName,
  VoiceSelectorAttributes,
  VoiceSelectorAccent,
  VoiceSelectorGender,
} from "@sift-design/ui/ai/voice-selector";

function AssistantVoice() {
  const [voice, setVoice] = useState("rowan");
  const [open, setOpen] = useState(false);
  return (
    <VoiceSelector value={voice} onValueChange={(next) => setVoice(next ?? "rowan")} open={open} onOpenChange={setOpen}>
      <VoiceSelectorTrigger asChild>
        <Button variant="outline">Choose assistant voice</Button>
      </VoiceSelectorTrigger>
      <VoiceSelectorContent title="Choose assistant voice">
        <VoiceSelectorInput />
        <VoiceSelectorList>
          <VoiceSelectorEmpty>No matching voices.</VoiceSelectorEmpty>
          <VoiceSelectorGroup heading="Suggested voices">
            <VoiceSelectorItem
              value="rowan"
              keywords={["british"]}
              onSelect={() => {
                setVoice("rowan");
                setOpen(false);
              }}
            >
              <VoiceSelectorName>Rowan</VoiceSelectorName>
              <VoiceSelectorAttributes>
                <VoiceSelectorGender value="non-binary" />
                <VoiceSelectorAccent value="british" />
              </VoiceSelectorAttributes>
            </VoiceSelectorItem>
          </VoiceSelectorGroup>
        </VoiceSelectorList>
      </VoiceSelectorContent>
    </VoiceSelector>
  );
}
```

Upstream reference: [AI Elements Voice selector](https://elements.ai-sdk.dev/components/voice-selector).

## Persona

**When:** show whether an assistant is ready, listening, thinking, speaking, or asleep. Pair the mark with a readable status in larger interfaces.

**Structure:** one `Persona` root contains a local SVG mark. Layered shapes surround a state symbol. The default size is 64px. Use `className` to change the size.

**Props:** `state` accepts `idle`, `listening`, `thinking`, `speaking`, and `asleep`. `variant` defaults to `obsidian`. `level` accepts an optional amplitude from 0 to 1. Values outside that range are clamped. Listening and speaking respond to this value. Omit `level` to use a speaking pulse. `aria-label` replaces the default accessible name.

The original variant identifiers remain available. Their local shapes are:

| Variant    | Shape            |
| ---------- | ---------------- |
| `command`  | Rounded square   |
| `glint`    | Soft diamond     |
| `halo`     | Concentric rings |
| `mana`     | Nested shapes    |
| `obsidian` | Offset squares   |
| `opal`     | Wide rings       |

`onLoad` and `onReady` run after mount. `onPlay` reports an active listening, thinking, or speaking state. `onPause` reports sleep or reduced-motion activity. `onStop` reports idle. These callbacks receive a local `{ type, data? }` event, except `onReady`, which has no arguments. `onLoadError` remains accepted. Local rendering does not load an external resource, so it does not emit loading errors.

**Motion:** state and amplitude transforms use `spring.smooth`: 280ms visual duration, zero bounce. Opacity uses `duration.quick`: 140ms linear. Thinking orbits once every eight seconds. Speaking pulses every 1.4 seconds when `level` is absent. These loops run only in their matching active state. State changes retarget the current springs. Idle and asleep have no loops.

**Reduced motion:** all geometry updates immediately. The thinking orbit and speaking pulse stop. Speaking bars remain static, even when amplitude changes. Short opacity feedback remains.

**Accessibility:** the root has `role="img"` and the name `Assistant: <state>`. Idle uses a square, listening a ring, thinking three dots, speaking bars, and asleep a line. These symbols retain meaning without animation. The SVG is decorative within the named root. Add a separate polite status region when the surrounding interface needs state announcements. Do not announce every amplitude update.

**Changes from upstream:**

- Replaces the remote animation player with original local SVG shapes.
- Retains all six variant identifiers, but uses neutral visual designs.
- Uses theme tokens in light and dark themes without theme observers.
- Replaces player-specific callback payloads with documented local lifecycle events.
- Adds `level`, `aria-label`, and exported prop, variant, and event types.
- Does not provide a player instance or external loading events.

```tsx
import { Persona } from "@sift-design/ui/ai/persona";

<div className="flex items-center gap-3">
  <Persona state="listening" variant="halo" level={0.4} className="size-12" />
  <p role="status">Listening to your greenhouse question.</p>
</div>;
```

Upstream reference: [AI Elements Persona](https://elements.ai-sdk.dev/components/persona).

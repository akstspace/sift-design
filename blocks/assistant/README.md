# Ask Larkspur

Try an assistant beside fictional greenhouse tasks or in a full-page conversation. Replies use sample data; no model or external service is contacted. The example is set on Tuesday 10 November 2026 in Europe/London. Replies start only after you send a question.

This optional example demonstrates conversation layout, streaming feedback, attachments, and recovery messages. Reuse the patterns that fit the product; a task board, tool activity, or assistant is not required by the design system.

## Run and verify

From the repository root:

```sh
npm run dev -w @larkspur/assistant
npx tsc --noEmit -p blocks/assistant
node blocks/assistant/qa.mjs
node scripts/capture.mjs assistant --axe
```

The development server uses port **5305**. The QA script expects it to be running. Capture builds and serves its own copy.

## Patterns and components

- One persistent assistant surface morphs between a dock beside the task page and a bounded full-page conversation. Its header and composer retain identity, focus and draft throughout.
- At 390px the assistant is a modal bottom sheet with a directly draggable handle, Escape, a focus boundary and focus return. Expand fills the viewport.
- Kit components: `message`, `bubble`, `message-scroller`, `attachment`, `input-group` and `button`. Markdown uses `react-markdown` and GFM for lists, tables and read-only checklists. Task changes have explicit assistant attribution and links to task detail.
- The scroller owns bottom following. User wheel, keyboard and touch intent release the bottom; calm text batches never override a reader who scrolled away. The jump pill restores following immediately without a competing scroll animation.
- Image attachment includes a local illustrative plant photo, named bench-4.jpg. The paperclip adds that fixture; Choose image opens the file picker. Remove and send work. Photo source: https://unsplash.com/photos/3373a0480b5b (image asset https://images.unsplash.com/photo-1416879595882-3373a0480b5b).
- Previous-conversation recovery explains that the original stays in Conversation history. The history disclosure exposes the retained record. Errors retain conversation and draft; Retry adds only a new assistant reply.

## Motion recipes

| Interaction | Recipe |
| --- | --- |
| Dock ↔ full page | Motion `layout`, `spring.smooth`; header and composer use position layout continuity |
| Mobile sheet | `bottomSheetMotion`, `spring.travel`, direct drag with release velocity |
| New messages | Kit `Message arrival`, using `arrivalMotion` |
| Tool disclosure | Height reveal with `spring.smooth`, rotating chevron with `spring.snappy` |
| Composer growth | Measured content, bounded height with `spring.smooth`; longer drafts scroll |
| Jump to newest | `AnimatePresence` and `arrivalMotion`; instant bottom positioning |
| Buttons | Kit press feedback |
| Stream | Whole, readable batches about every 520ms; no per-token animation |
| Reduced motion | Cross-fades, immediate geometry/disclosure changes; no springs, scale, travel or looping progress |

## Reachable states

`?view=full` expands the assistant. `?panel=closed` shows the launcher. Use `?theme=dark` for dark mode.

`?state=empty`, `notice`, `conversation` (default), `climate`, `attachment`, `error`, or `changes` select authored states. `#task-market`, `#task-herb`, `#task-bench` and `#task-misting` open task details. Streaming and stopped states are prepared by sending and stopping in `shots.mjs`.

Suggested questions intentionally produce distinct answers: market planning and crate table; climate log and checklist; bench 4 inspection checklist. To demonstrate attributed changes, ask “Give Sam the crate check for Friday and add the bench 4 note.”

## Screenshot index

All evidence is in `screenshots/assistant/`. Light and dark main views exist at desktop and 390px. The full manifest, including preparation steps, is `shots.mjs`.

| Names | Demonstrates |
| --- | --- |
| `01-docked-{light,dark}.png` | Assistant beside the simple task page |
| `02-full-page-{light,dark}.png` | Expanded conversation |
| `03-docked-{light,dark}-mobile.png` | Bottom-sheet conversation |
| `04-full-page-{light,dark}-mobile.png` | Expanded mobile conversation |
| `05-empty-{light,dark}.png`, `06-empty-{light,dark}-mobile.png` | Three specific suggestions |
| `07-tools-open-light.png` | Expanded read-only task activity |
| `08-climate-checklist-dark.png` | Expanded climate log and code-free checklist |
| `09-attachment-light.png`, `10-attachment-dark-mobile.png` | Bench 4 image in composer |
| `11-recovery-notice-light.png`, `12-recovery-notice-dark-mobile.png` | Plain-language conversation recovery |
| `13-error-light.png`, `14-error-dark-mobile.png` | Connection failure and retry |
| `15-attributed-changes-light.png`, `16-attributed-changes-dark-mobile.png` | Linkable assistant-attributed task changes |
| `17-task-change-light.png` | Linked task and attribution history |
| `18-streaming-light.png`, `19-reader-unpinned-dark-mobile.png` | Live reply, Stop and reader-owned scrolling |
| `19-stopped-light.png`, `19-history-dark-mobile.png` | Interrupted reply and retained history |
| `20-reduced-motion-light.png` | Reduced-motion expanded empty state |
| `21-morph-filmstrip-light{,-mobile}.png` | Spring reshaping over time |
| `22-tools-filmstrip-light{,-mobile}.png` | Disclosure spring frames |
| `23-composer-filmstrip-light{,-mobile}.png` | Composer growth frames |
| `assistant-motion-morph{,-mobile}.webp` | Real-time dock/full-page round trip |
| `assistant-motion-tools{,-mobile}.webp` | Real-time tool expand/collapse |
| `assistant-motion-composer{,-mobile}.webp` | Real-time draft growth/shrink |
| `assistant-motion-arrival-stream-stop{,-mobile}.webp` | New messages, calm batches, Stop |
| `assistant-motion-jump-newest{,-mobile}.webp` | Reader unpins and returns to newest |

## Review

The first Sift detector found supporting type/radius/color drift; these were normalized to the documented scale and token-derived colors. The next detector run returned no findings. The first axe pass found the image picker label; the label and read-only checklist labels were fixed. Subsequent captures have zero axe violations. Interaction QA covers both viewport sizes, runtime errors, draft preservation, attachment removal, interrupted replies, retry, task focus return, tool disclosure, pinned/unpinned streaming and newest navigation. Regression checks verify button/Escape launcher focus return after inertness clears in both themes, additions-only conversation announcements, and immediate reduced-motion disclosure geometry on opening and closing.

Kit candidate: an integrated auto-growing chat composer and tool-activity disclosure would avoid local measurement and disclosure plumbing. No shared kit or token files were changed.

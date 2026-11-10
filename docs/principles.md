Build a studio workbench for operating on real work.
Keep navigation stable, helper actions legible, and the local workspace truthful.

# Principles

## Apply Sift hierarchy

Treat `../tokens/tokens.css` and `../tokens/motion.ts` as normative. The guides describe the interface Sift ships; where a guide and the tokens disagree, the tokens win. Earlier Sift direction notes used a different typeface and a plum dark theme; Albert Sans and the charcoal dark tokens replace them.

## Work in Operate mode

Prioritize finding work, changing it, and inspecting evidence. Keep frequent destinations in the rail, work in the center, and context attached at the right. Make hierarchy through alignment, typography, and bounded surfaces rather than a grid of metrics.

Do: expose real tasks, filters, schedules, run state, and the next useful action. Don’t: add decorative KPI tiles, demo accounts, artificial activity, or a chat-first landing surface. A contextual chat dock may assist the workspace; it does not replace it.

## Preserve product truths

- Show real state only. Connection probes, billable tests, progress, task completion, and success states require actual results. A disabled button is not evidence of success. State what was not verified.
- Attribute person and helper changes consistently. Show actor, action, time, and reason; provide links to evidence and current undo when supported. Do not imply the app independently proved a helper’s completion claim.
- Keep helpers operational rather than magical. Distinguish running, failed run, paused by a person, paused by the app with a reason, and needs action. A failed run does not necessarily stop its schedule. Stopping a process and pausing a schedule are different events.
- Keep the shell still on navigation. Only the work surface changes. Explicit rail collapse may reflow its own width; it must not replay on route changes.
- Preserve drafts, reading position, selection, and drag ownership during live updates. Batch a burst rather than replaying each event.
- Respect local-first operation. Keep private workspace claims precise: local storage does not mean agent-connected external tools never exchange data. Do not fabricate cloud accounts, sync, permission boundaries, or a sandbox. Ask before an action that actually starts a paid test; never simulate that test.
- Keep UI and CLI semantics aligned in products derived from this reference. A helper should discover stable identifiers and current revisions, not positional column numbers. Do not design a UI-only state the underlying operation cannot express.
- Keep parent tasks and real subtasks distinct from checklist items. Sift supports one subtask level and exactly one completion column. Completing all children does not silently complete the parent; reopening a child may reopen a completed parent, with attribution.

## Reject these anti-references

Reject stock shadcn demo composition, metrics dashboards, AI-chat-as-product, ornamental gradients, glassmorphism, artificial counters, emoji decoration, ornamental registration marks, and unnecessary interface framing. Retain the kit’s interaction primitives, not its demo content or default visual identity.

Do: use density and deliberate motion to explain handoffs. Don’t: add confetti, perpetual background motion, a hero number without data, or theatrical page-load reveals.

## Checklist

- The main surface operates on real work, not placeholder metrics.
- Helper changes expose actor, reason, and available recovery.
- Navigation leaves the shell stable and preserves local context.
- Local/privacy claims match actual storage and tool boundaries.
- No rejected visual pattern or invented state remains.

Write plain, specific, calm operating copy that names the thing, its state, and the next useful action.
Use Larkspur examples only; never disguise a missing result with cheerful or vague language.

# Writing

## Use the actual UX voice

Derive voice from Sift’s real action labels, empty states, inline errors and service messages, not from its old introductory prose. The ones worth studying cover clipboard failure with recovery; saved, backup and restore outcomes; review with eligible undo; empty work with an add action; read failure with retry and honest absent data; reconnection versus interruption; and service state, stale revisions, stream interruption, restore effects, schedule pause reasons and validation.

The useful pattern is factual state plus consequence plus recovery, where known. A short success label is enough when the result is unambiguous; a failure often needs a sentence and action. Do not turn every successful save into a celebratory paragraph.

Read `blocks/_shared/LARKSPUR.md` before writing example content. Use Fernbrook Greenhouse, its areas and tasks, and its fictional helpers. All examples below are Larkspur copy, not quotes of Sift-branded strings. Do not put the real product, agent runtime, company, or person into example UI or screenshots.

## Name the action and object

- Use sentence case for headings, controls, placeholders, and notices. Keep proper names as proper names. Small Sift’s structural eyebrows sometimes use uppercase through CSS; do not write all-caps button labels.
- Use a direct verb for an action: Create task, Save changes, Add time, Pause helper, Resume helper, Run test, Restore backup. Use a noun phrase for a destination: Today, Areas, Helpers, Run history.
- Distinguish action from current state: Pause helper is an action; Paused is a state. Do not label a state pill as if it were a command unless it is actually interactive.
- Name the affected object in destructive confirmations and ambiguous outcomes. Prefer the task title or helper name over a generic item.
- Keep button labels specific enough to predict the result. Use a short visible label plus an accessible name when an icon control needs more context.

Do: “Remove this schedule” when removing a schedule. Don’t: “Delete” on a control that only pauses a helper or archives a task.

## Explain errors without blame

State what could not happen, what remains true, and what the person can do. Preserve useful error detail, but do not expose raw implementation noise as the only explanation. Keep long diagnostics in a disclosure/copy path below the actionable summary.

Do not say the operation failed if only following its progress disconnected. Do not tell the person to retry a possibly completed destructive action without first checking the result. Keep “could not read,” “could not save,” “stopped following,” “cancelled,” and “paused” distinct.

Do: retain the draft and offer retry after a recoverable save failure. Don’t: clear the form, display “Something went wrong,” and leave no recovery path.

## Attribute helpers without anthropomorphism

Name the helper, what it read or changed, the reason, and the outcome. Distinguish a person’s pause from an automatic safety pause. Say whether the schedule continues after a failed run. A helper’s assertion is attributed evidence, not independently verified truth.

Use “Climate watch filed this task” rather than a magical or collective “we noticed.” Do not say a helper is thinking, alive, excited, or working hard when the actual state is a queued request. When there is a real running request, label that state plainly and allow the supported stop action.

## Keep absence and uncertainty truthful

- Distinguish no tasks from no matches. Offer create in an empty workspace and clear filters in a no-match state.
- Distinguish no time recorded from no work done. A gap in observation is not proof of inactivity.
- Do not invent a count, deadline, progress percentage, connection result, or evidence link. Use exact values from the record; use source-defined date/time formatting and the workspace timezone.
- Keep pending, connecting, reconnecting, needs action, failed, and paused states separate. Do not call a normal connection grace period an outage.
- Explain irreversible effects before confirmation. Show reversible recovery in context when supported; do not advertise stale undo.

## Before / after examples for Larkspur

| Before — do not ship | After — apply the rule |
|---|---|
| “Oops! Something went wrong.” | “The task couldn’t be saved. Your changes are still here. Try again.” |
| “Successfully configured your automation!” | “Climate watch is ready.” |
| “Your AI has been hard at work.” | “Order sweep added a task from the orders inbox.” |
| “Automation disabled.” | “Climate watch is paused. Resume it when the sensor hub is back.” |
| “All systems go.” | “The sensor hub is connected.” — only after a real connection result |
| “No activity.” | “Nothing recorded yet. Add time or turn on activity tracking.” |
| “No results.” | “No tasks match these filters. Clear filters to see the rest.” |
| “Are you sure?” | “Remove Climate watch? It will stop checking the sensor hub.” |
| “Delete item” | “Move task to trash” — only when trash recovery exists |
| “The run was cancelled.” | “Stopped following the run. Climate watch is still running.” — only when the run continues |
| “Error: conflict” | “This task changed while you were editing. Reload it before saving again.” |
| “Backup error” | “The safety backup couldn’t be created. Nothing was restored.” — only when the workspace is unchanged |
| “Retry now” after an uncertain result | “Check the task before trying again. The connection ended before the result arrived.” |
| “We completed your task.” | “Market prep marked the task done and added a reason. Review the change.” |

These examples are models for structure, not fixed messages to use regardless of state. Do not claim a draft, schedule, backup, or run remains intact unless the implementation guarantees it.

## Reject filler

Remove exclamation marks, emoji, “Oops,” “Great job,” “seamlessly,” “effortlessly,” “supercharge,” and “unlock.” Do not greet the person inside every empty state. Do not add “please” to a plain required field instruction or “successfully” to an already clear success. Keep contractions natural; keep technical terms only where they help the intended operator act.

Do: “Save changes.” Don’t: “Seamlessly optimize your greenhouse workflow.”

## Checklist

- Copy names the affected thing and uses sentence case.
- Every claimed state/result is backed by real implementation state.
- Failures explain recovery and preserve uncertainty when the result is unknown.
- Helper changes are attributed; paused/failed/stopped-following states are distinct.
- Example strings use only the fictional Larkspur world and contain no filler.

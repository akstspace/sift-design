Use words people can understand on the first read. Say what happened, what it means, and what they can do next.

# Writing

## Start with what the person needs to know

Lead with the result or problem. Add a consequence or next step only when it helps. “Changes saved” is enough for a routine save. A failed save needs more: “The address couldn’t be saved. Your changes are still here. Try again.” Only promise that the draft is safe if the app really keeps it.

Use familiar words without discarding precise terms the audience needs. In general guidance, prefer “sidebar” to “navigation rail” and “component structure” to “anatomy.” Keep exact CSS variables, API props, and accessibility attributes in technical instructions. Explain unfamiliar terms the first time they matter; for example, a timezone determines which local date and time an instant appears under.

Describe behavior directly rather than inventing an internal vocabulary: “Keep navigation in place as pages change,” not “preserve the workbench shell.” The visual system supplies a voice, not a task-app dictionary. Use the product’s actual nouns and keep them consistent.

## Name the action and object

- Use sentence case for headings, controls, placeholders, and notices. Keep proper names as proper names. Do not write all-caps button labels.
- Use a direct verb for an action: Add to cart, Save article, Export report, Reschedule appointment, Send message. Use a noun phrase for a destination: Catalog, Library, Reports, Appointments, Messages.
- Distinguish action from state: Pause notifications is an action; Notifications paused is a state. A status label should not sound like a command unless it is interactive.
- Name the affected object in destructive confirmations and ambiguous results. “Delete the draft reply?” is clearer than “Delete item?”
- Keep visible labels specific enough to predict the result. An icon-only control needs an accessible name; a visible label’s text should be included in that accessible name.

Use verbs that match the consequence. Remove from cart, Cancel order, Archive conversation, and Delete account are not interchangeable. Do not label an action Delete if it merely hides a record or disables future notifications.

## Explain errors without blame

Say what failed, whether anything changed, and how to recover. Include a cause when it is known and useful. Keep long diagnostics and internal codes below the actionable explanation, with an expandable detail or copy action if needed.

An error should support the next decision, not just announce failure. “Choose a delivery date on or after 12 November” explains how to correct a field. “Date invalid” does not. Preserve input and connect errors to the relevant fields.

Losing a connection does not prove an operation failed. If the result is unknown, explain the uncertainty before inviting a potentially duplicate purchase, deletion, or submission. Offer a way to check the result, or a retry that the implementation guarantees will not repeat the operation. Keep could not read, could not save, still sending, cancelled, and paused distinct when those states exist.

Do: offer a supported retry after a recoverable save failure. Don’t: clear the form, display “Something went wrong,” and leave no recovery path.

## Write useful loading and empty states

Name the actual operation when waiting matters: Loading reports, Uploading photo, or Sending message. Use percentages only when the fraction is measurable and meaningful. Do not add artificial waits to make an operation appear more substantial.

Explain why a view is empty and offer the next valid action. A new reading list can invite browsing; a catalog with no matches can offer Clear filters; a restricted report can explain how to request access. Do not offer creation when people cannot create the missing content. A failed request is not an empty collection.

Missing data is not zero. No readings received does not mean a sensor measured zero, and no recorded activity does not prove inactivity. Counts, deadlines, connection results, and source links must come from actual state. Use the product’s locale, timezone, and date-format rules rather than assuming one audience’s format.

## Explain consequential changes and automation

When a change’s source matters, identify who or what made it, what changed, and the result. This applies to collaborators, payment providers, imports, recommendation systems, and automated jobs—not only agents. Include a reason or source when known. Do not invent a reason to make a message sound complete.

For example, “The import service added 18 products” is more useful than “We worked our magic.” If only a service reported success, do not present that as independently verified. Say that a request is queued rather than claiming it is already running. Explain cancellation, stopping, or future recurrence only when the product supports those concepts.

Do not require an automation identity, task attribution line, or run history in products without those features. Routine local actions do not all need a paragraph of attribution. Explain the source where it affects trust, review, or recovery.

## Be clear about consequences and recovery

Explain irreversible effects before confirmation. Name the action on the confirmation button rather than using Yes or OK. Offer undo only when it is safe and genuinely available; do not promise that a stale action can overwrite newer work.

Keep recovery discoverable near the affected content or in an appropriate persistent view. A short-lived toast should not be the only route to a critical next step. If someone must decide within a real deadline, state the deadline and result; do not manufacture urgency.

## Before / after examples

These examples span product types. They model message structure, not features every product must implement.

| Context | Avoid | Write instead, when true |
|---|---|---|
| Store | “Oops! Payment error.” | “The payment was declined. Choose another payment method.” |
| Store, unknown result | “Purchase failed. Retry now.” | “We couldn’t confirm the payment. Check your orders before paying again.” |
| Reader | “Successfully processed your request!” | “Article saved to your reading list.” |
| Reader, empty list | “Nothing here.” | “No saved articles yet. Browse articles to find something to read.” |
| Analytics, filtered results | “No data.” | “No orders match these filters. Clear filters to see the rest.” |
| Analytics, missing source | “Revenue: 0” | “Revenue data is unavailable. Try loading the report again.” |
| Scheduling | “Invalid input.” | “Choose an end time after the start time.” |
| Scheduling, deletion | “Are you sure?” | “Cancel this appointment? The time will become available to others.” |
| Conversation | “Message error.” | “The message wasn’t sent. Your draft is still here. Try again.” |
| Collaborative editor | “Error: conflict.” | “This document changed while you were editing. Review the newer version before saving.” |
| Import | “Your AI has been hard at work.” | “The import service added 18 products. Two rows need review.” |

Do not copy a claim about payment, drafts, availability, or imports unless the implementation can establish it. A scheduling confirmation, for example, must use that product’s actual cancellation and availability rules.

## Keep copy accessible and translatable

Use persistent labels, meaningful link text, and nearby instructions. Do not put required information only in placeholders, tooltips, icons, color, or punctuation. Keep screen-reader names aligned with visible labels and do not announce every small background update.

Write complete messages rather than concatenating fragments. Allow translators to reorder variables, handle plural forms, and format dates and numbers for the locale. Leave room for longer labels; do not abbreviate important actions merely to match a narrow reference screenshot. Keep a small terminology glossary when several views share the same concepts.

## Keep examples separate from product requirements

Use fictional, nonprivate content in public documentation and reference captures. For the repository’s existing Larkspur block examples, read [`blocks/_shared/LARKSPUR.md`](../blocks/_shared/LARKSPUR.md) and keep their fictional names consistent. In those examples, a helper is a scheduled automation. That term and fictional world are not required vocabulary for another product.

Guidance can use varied generic examples like the table above without recreating a greenhouse task app. Never expose private customers, conversations, credentials, or personal information in sample content or screenshots.

## Reject filler

Remove exclamation marks, emoji, Oops, Great job, seamlessly, effortlessly, supercharge, and unlock from interface copy. Skip repeated greetings and unnecessary please or successfully. Use natural contractions and adapt the tone to the consequence; payment, privacy, deletion, and lost work need particular care.

Do: “Save changes.” Don’t: “Seamlessly supercharge your workflow.”

## Checklist

- Copy uses the product’s actual nouns, specific action labels, and sentence case.
- Status, counts, timing, and outcomes match what the app knows.
- Empty and error states explain the next valid action without inventing a feature.
- Consequences and recovery are explicit, including uncertainty about a result.
- Sources are attributed when useful; automation-specific language appears only where relevant.
- Labels, live announcements, and translated messages preserve meaning without filler or private example data.

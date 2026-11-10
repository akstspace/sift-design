Combine components around the information people need and the actions they can take. Choose patterns for the product, not features to fill a reference layout.

# Components

Use the components in `packages/ui`, which include interaction, focus styling, and animation behavior. Read their guides: [overlays](../packages/ui/docs/overlays.md), [controls](../packages/ui/docs/controls.md), and [display](../packages/ui/docs/display.md). Keep the kit versions rather than replacing them with unmodified upstream components. Accessible labels, application state, validation, persistence, and routing remain the consuming app’s responsibility.

The blocks demonstrate combinations of these components. Their record types, statuses, schedules, and storage choices are example application behavior, not part of the design-system contract.

## Choose a pattern for the job

| Need | Useful starting point | Decision to make |
|---|---|---|
| Compare records by the same properties | Table | Which columns help people compare or act? |
| Scan a collection with titles and supporting details | List with Item | Which details distinguish one result from another? |
| Browse records whose images or descriptions matter | Cards | Does a separate boundary help, or would a list be clearer? |
| Read an article or document | Heading, prose, optional contents navigation | What reading width and navigation support this content? |
| Inspect something without losing a collection | Detail panel or split view | Must the collection remain usable, or should focus be modal? |
| Complete a focused decision or short edit | Dialog or alert dialog | What makes interruption necessary, and how can it be cancelled? |
| Understand a comparison or trend | Chart plus readable data | What question does the chart answer? |
| Read and contribute to an exchange | Message list and composer | How will new messages arrive without displacing earlier reading? |

These are alternatives, not a required screen inventory. A store can center a catalog, a reader can center prose, and an analytics product can center charts without adopting a task board or permanent sidebar.

## Actions and choices

Use a button for an operation and a link for a destination. Give the primary action more emphasis than secondary actions; do not make every control primary. Icon-only actions need accessible names. Preserve hover, focus-visible, invalid, busy, and disabled states.

Choose controls by their meaning: a checkbox for an independent choice, a radio group for one choice from a visible set, a switch for an immediate on/off setting, and a toggle for a reversible pressed state. Tabs switch related panels; filters change the contents of the same result set. Use a native select or Select for a short set and a Combobox when typing helps find an option in a longer set.

The kit supplies press and selection feedback. Do not add a second press transform or animation wrapper to the same control. A loading Button retains its label in the accessibility tree, sets `aria-busy`, and prevents repeated submission; only set `loading` while the operation actually runs, and do not combine it with `asChild`. See [controls](../packages/ui/docs/controls.md) for supported props and sizes.

## Lists, tables, and cards

Start with a clear title or identifier, then the details needed for the next decision. A product card might need an image and price; a document row might need author and last-edited time; a booking row might need a date and location. Completion controls, priorities, subtasks, and time totals belong only to products whose records have those concepts.

Keep list semantics, table headers, and meaningful headings. Use aligned numeric columns when comparison matters. Let long titles wrap or provide another readable path rather than hiding identity to enforce uniform row height. Keep selection distinct from hover and keyboard focus.

The kit’s Card is a static surface with an 8px radius and no implicit button or heading role. It does not lift on hover or animate on mount. Custom cards in blocks can have different composition and spacing; those example dimensions do not redefine Card. Put real links or buttons inside a card. If a title link’s hit area extends across the card, keep sibling actions separately reachable and show focus on the relevant boundary; never nest interactive controls inside another button or link.

For hierarchical data, make the relationship and expansion state clear. Whether children also appear in search results or other collections is a product decision, not a universal rule about duplication.

## Grouped collections and drag and drop

Use sections or board columns when grouping helps people understand a real relationship, such as order fulfillment stages or a publishing workflow. Derive names, counts, allowed transitions, and terminal states from that product’s model. There is no required number of columns or universal completion status.

Give each group a heading, and show a count only if it is useful and accurately defined. Offer an add action only where creation is allowed. An empty group can explain the next step without containing filler records.

When dragging is useful, show a clear source, destination, and accepted or rejected drop state. Keep opening a record separate from dragging it. Provide keyboard operation and a single-pointer alternative that does not require dragging, such as a Move menu. Use the selected drag library’s actual keyboard contract and announcements; do not assume every collection moves left or right. See [motion](motion.md) and [accessibility](accessibility.md).

## Toolbars and filters

Keep search, filters, sorting, and view choices close to the content they affect. Show the current scope and selected values. Search terms should remain visible and easy to clear without displacing the primary action. Show an active-filter count only when it adds useful information.

Opening filter options must not reset values or lose the reader’s place. Distinguish a genuinely empty collection from no matches, missing permission, and a read failure. Offer an appropriate action: clear filters for hidden results, retry for a recoverable failure, or create only when creating is possible and useful.

## Details, dialogs, and panels

Choose a full page for substantial reading or editing, a split view for repeated comparison, or a panel for short contextual inspection. Use a dialog when the decision genuinely requires protected focus. Do not require every record to open in a right-edge inspector.

The kit’s Sheet is a modal primitive: by default it opens from the right on desktop and becomes a draggable bottom sheet below 640px. It traps focus while open. A nonmodal inspector that keeps the underlying page interactive needs a deliberately different focus and interaction contract; do not describe a modal Sheet as a nonmodal split view. The lower-level `sheetMotion` helper provides animation only, not Sheet’s responsive or accessibility behavior.

Include only fields and actions supported by the record. Keep errors beside the operation they affect. For long content, make scrolling and any pinned actions work without covering content or focus. When opening details, preserve the collection’s scroll position; on close, restore focus to the opener or a logical surviving control. If a panel can expand to a page, retain the reading position and draft, and do not stretch text during the size change.

## History and attribution, when needed

Show who or what changed a consequential record when that information helps people trust, review, or recover the change. Include what changed and when; add a reason or source link when one is available. For example, an order history can distinguish a customer’s cancellation from a payment service’s refund, and an editor can identify a collaborator’s revision.

Do not add automation badges or activity logs to products that do not need them. When automation does change data, name the responsible service or automation rather than implying a person did it. Use plain words instead of raw JSON differences. A review acknowledgment means someone saw a change; it is not an undo. Offer undo only when the current data can be safely restored without silently overwriting newer work.

## Notices and inline errors

Explain the condition and the next useful action in words, with an icon when it helps. Use `role="status"` for nonurgent updates and `role="alert"` for urgent errors that need immediate attention. Not every persistent notice needs a live announcement. The kit’s Alert defaults to `role="alert"`; override the role for nonurgent or explanatory content.

Keep field errors connected to their inputs and preserve a draft after a failed save. Put long diagnostics behind an expandable detail and copy action without hiding the recovery instruction. Distinguish connecting, retrying, unknown outcome, and confirmed failure when the product has a network connection; a transport interruption alone does not prove the underlying operation failed.

## Empty, loading, and unavailable states

Say why the content is absent. First use, no matches, unavailable data, restricted access, and a failed request need different explanations. A reader with no saved articles might offer Browse articles; a store with no matching products might offer Clear filters. Do not promise a creation or recovery action the person cannot use.

Use a skeleton when the approximate shape of pending content is known, a spinner for actual activity with unknown extent, and determinate progress only when a meaningful fraction is known. A missing value is not automatically zero. Do not fill empty space with invented statistics, sample records presented as real, or artificial waits. Optional sections can be omitted when they have no purpose in the product.

## Confirmation and recovery

Ask for confirmation before an irreversible or high-impact operation when the consequence is not already clear and deliberate. Name the affected object and the consequence, keep Cancel available, and choose safe initial focus. Closing the dialog must never confirm the action. Keep recoverable failures visible rather than dismissing the form as if the operation succeeded.

Prefer undo for changes that can safely be reversed. Reversal rules depend on the operation: removing something from a reading list is not the same as issuing a refund or deleting an account. If newer changes prevent undo, explain the available review or recovery path. A toast can confirm an outcome, but essential recovery must not exist only in an expiring message.

## Forms and settings

Use persistent field labels, nearby hints, related groups, and connected validation messages. Keep required and optional treatment consistent. Arrange descriptions and controls for the available width; stack them before labels or actions become cramped. Do not import a block’s breakpoints or field inventory as requirements for every form.

Show saved, unsaved, busy, and error states accurately. Preserve typed input after validation or network failure, and do not quietly replace it with an external refresh. Explain an unsaved-change guard only where leaving would actually lose changes. Storage location and synchronization strategy belong to the application, not the component styling.

Use date and time controls only when the product needs them. For a booking, distinguish a date from an instant in time, explain relevant timezone rules, preserve typed input, and give plain guidance for invalid values. Kit controls do not supply the product’s business rules.

## Scheduling interfaces, when needed

Start with the person’s scheduling goal: a one-time appointment, a recurring reminder, or an automated job may need different fields. Show only supported recurrence options; advanced cron expressions are not a default requirement. Group related inputs with a fieldset and legend, and show the timezone when it affects interpretation.

Describe the resulting recurrence and next occurrence only when they can be computed from actual state. Derive schedule limits, required rows, conflict handling, and pause behavior from the product. Keep the distinction between stopping an active operation and pausing future occurrences. Adding or removing a repeated row should leave focus on the new input or a nearby surviving action.

## Conversations and live updates

Chat can be the main product view or contextual support beside other content. Attribute messages, keep their text selectable, and distinguish sent, pending, failed, and delivered states only when the product knows them. Assistant processing details, tool calls, attachments, and result cards are optional capabilities, not required transcript content. When a tool changes something, expose a useful summary, result, and affected record where relevant.

Use a polite log for meaningful new messages rather than announcing every streamed word. Follow new messages only while the reader is near the latest message; otherwise preserve their place and offer Jump to latest. Keep the composer draft and give attachment failures or interrupted sends a recovery path. Timers and activity indicators must correspond to real deadlines or work.

For any live collection, keep stable record keys so refreshes do not replay entrances for existing content. Coalesce bursts when useful without imposing a universal delay or postponing a person’s action. Preserve editing, reading, selection, and active gestures. Explain conflicts rather than silently replacing local input. Announce a useful summary instead of every low-level event.

## Checklist

- The chosen pattern fits the product’s content and decisions, not an example app’s feature set.
- Controls keep their actual kit behavior, labels, and keyboard semantics.
- Loading, empty, no-match, unavailable, and failed states are distinguishable where relevant.
- Forms retain drafts; overlays manage focus; changes leave a useful recovery path.
- Attribution is accurate where it matters, and undo is offered only when safe.
- Live updates do not interrupt reading, editing, selection, or dragging.

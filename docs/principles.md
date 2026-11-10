Make interfaces clear and predictable. Help people find what they need, understand what changed, and keep their work as they move around.

# Principles

## Use the shared styles

Use the colors, fonts, sizes, and animation settings in `tokens/tokens.css` and `tokens/motion.ts`. These shared settings are called **design tokens**. If a guide gives a different value, use the token file.

The components and examples show how to put those settings together. They are references for visual hierarchy, interaction, and accessibility, not specifications for another product’s features or data model.

## Make the main task obvious

Start with what someone came to do. Put frequent destinations in easy reach, keep related controls together, and make the next action clear. Use headings, alignment, and spacing to show which information belongs together.

Choose the structure that serves that goal. A storefront may lead with products and filters; a finance app with balances and transactions; a publication with articles; analytics with comparisons; messaging with conversations. Dashboards, chat, boards, timelines, sidebars, and multi-column screens are useful when the content calls for them, never prerequisites of the style. Do not add a feature or statistic just to fill space.

## Keep people’s place

Keep shared navigation and toolbars stable while their content changes. This does not require a sidebar or permanently pinned controls. A deliberate layout change can resize the content; ordinary navigation should not replay the shell’s entrance.

Preserve unsaved text, scroll position, and selection when opening details or receiving updates. If someone is editing or dragging an item, do not replace it underneath them. Group rapid updates so the interface does not jump with every event.

## Show what actually happened

Say “Connected” only after a connection succeeds. Show progress only when it comes from real work. If a result is unknown or a check was not run, say so. Never invent activity, counts, success messages, or waiting time.

When a product includes agents or automation, explain their changes: who or which automation made the change, what changed, when, and why if known. Link to supporting details and offer undo when it is safe. An assistant saying it finished is not the same as the app verifying the result. This is not a requirement to add automation.

Keep states and consequences distinct. A payment being submitted is not a settled payment, a saved article is not necessarily published, and sending a message is not proof that it was read. Each label and action should match what the product actually knows and does.

## Explain consequences before people act

Name what will be removed, overwritten, published, sent, or charged for. Obtain clear authorization for consequential actions using the product’s real confirmation flow; do not add a confirmation to every routine edit. Offer a way to recover when one exists, and do not promise undo when an action is irreversible or newer changes make recovery unsafe.

Describe privacy accurately. Identify where data goes and who can access it when that affects the decision. Only describe storage, accounts, sync, permissions, or isolation that the product actually provides; the design system prescribes none of them.

## Use animation to explain changes

Show where a panel opens, which item was selected, or where a new row was added. Let people interrupt or reverse an animation without waiting. Respect reduced-motion preferences.

Keep idle screens still. Avoid decorative loops, confetti, page-load cascades, gradients, blurred glass, and extra framing that do not help someone understand or use the screen.

## Preserve the product’s own rules

Use the product’s vocabulary, relationships, permissions, and sources of truth. Decide required fields, lifecycle states, nesting, and available actions from the domain, not from a reference screenshot. A cart, ledger entry, article, and message do not need the same anatomy or lifecycle.

When a product exposes the same operation through multiple interfaces, keep its semantics consistent. Do not invent accounts, automations, a command line, or a local-only storage model to match an example. Reuse components and design decisions without importing unrelated product behavior.

## Checklist

- The main task and next action are easy to find.
- Status messages and numbers match actual results.
- Automated changes name their source and explain what happened.
- Navigation and updates preserve drafts, scroll position, and selection.
- Privacy, cost, and recovery claims match the product’s behavior.
- Information architecture, domain rules, and storage choices come from the project, not the examples.

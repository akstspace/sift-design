---
name: Sift design
description: Shared styles, components, and animation guidance for coding agents.
colors:
  slate: "#2b2539"
  oatmeal: "#ebe9e4"
  coral: "#efc8c8"
  sea: "#bed3cc"
  umber: "#7b6767"
  chartreuse: "#eeefc8"
  ground: "#ebe9e4"
  surface: "#f8f7f4"
  rail: "#2b2539"
  subtle: "#e4e1dc"
  hover: "#ded9d7"
  tint: "#2b25390b"
  tint-strong: "#2b253915"
  ink: "#2b2539"
  muted: "#6b5b5b"
  line: "#cfc8c3"
  control-line: "#918183"
  primary: "#2b2539"
  primary-foreground: "#ebe9e4"
  accent: "#386254"
  accent-soft: "#d7e4de"
  good: "#386254"
  warn: "#756019"
  danger: "#973e4f"
  danger-foreground: "#ffffff"
  focus-ring: "#386254"
  rail-foreground: "#ebe9e4"
  rail-muted: "#c7c3ce"
  rail-selected: "#efc8c8"
  rail-selected-foreground: "#2b2539"
  rail-hover: "#40364b"
  rail-line: "#4e4256"
  rail-ring: "#bed3cc"
  cat-1: "#017c5d"
  cat-2: "#aa84d4"
  cat-3: "#976b03"
  cat-4: "#6da9e7"
  cat-5: "#a1592e"
  cat-6: "#8aab5f"
  cat-7: "#b85862"
  cat-8: "#868bd1"
  dark-ground: "#18191b"
  dark-surface: "#242628"
  dark-rail: "#121315"
  dark-subtle: "#2c2e31"
  dark-hover: "#36393c"
  dark-tint: "#ebe9e40e"
  dark-tint-strong: "#ebe9e41a"
  dark-ink: "#ebe9e4"
  dark-muted: "#b5b7b9"
  dark-line: "#3b3e41"
  dark-control-line: "#777b7e"
  dark-primary: "#bed3cc"
  dark-primary-foreground: "#2b2539"
  dark-accent: "#bed3cc"
  dark-accent-soft: "#2b3e37"
  dark-good: "#bed3cc"
  dark-warn: "#eeefc8"
  dark-danger: "#f4a4b0"
  dark-danger-foreground: "#2b2539"
  dark-focus-ring: "#bed3cc"
  dark-rail-muted: "#b5b7b9"
  dark-rail-hover: "#292c2e"
  dark-rail-line: "#333638"
  dark-cat-2: "#9d78c6"
  dark-cat-3: "#946800"
  dark-cat-4: "#5b97d3"
  dark-cat-5: "#9d562b"
  dark-cat-6: "#7c9c50"
  dark-cat-7: "#b5555f"
  dark-cat-8: "#7a7ec4"
typography:
  headline:
    fontFamily: '"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: '"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.5
    letterSpacing: "0"
  code:
    fontFamily: '"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  help:
    fontFamily: '"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif'
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  space-2: "2px"
  space-4: "4px"
  space-6: "6px"
  space-8: "8px"
  space-10: "10px"
  space-12: "12px"
  space-14: "14px"
  space-16: "16px"
  space-18: "18px"
  space-20: "20px"
  space-24: "24px"
  space-28: "28px"
  space-32: "32px"
  space-40: "40px"
  space-48: "48px"
  space-56: "56px"
  space-64: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
  chip:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "28px"
  navigation:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-foreground}"
    width: "256px"
  navigation-selected:
    backgroundColor: "{colors.rail-selected}"
    textColor: "{colors.rail-selected-foreground}"
    rounded: "{rounded.md}"
  task-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 14px 14px"
---

# Design system: Sift design

## Overview

Build clear interfaces around what people came to do: browse a catalog, understand a balance, read an article, compare results, or hold a conversation. Keep navigation predictable, group related controls, and give the primary content enough room.

The visual style uses warm neutral backgrounds, thin borders, flat surfaces, and one accent color. A navigation rail, when useful, uses a dark background. Albert Sans is the main typeface; IBM Plex Mono is used for code and compact numbers. Dark mode uses its own charcoal palette rather than an inverted light theme.

Keep shared navigation stable as its content changes; do not add a sidebar or pinned header to satisfy the style. Use shared spring settings for movement and scaling, and short fades for opacity and color. People can interrupt an animation without waiting. Preserve relevant drafts and scroll position, show accurate status, and explain changes made by an automation.

The system defines appearance and interaction quality, not a product model. Choose navigation, information architecture, data, storage, and workflows for the project. A storefront may use a product grid, a finance app a ledger, a publication a reading column, analytics a dashboard, and messaging a conversation list. None requires a board, timeline, automation, or particular number of columns.

If a written value conflicts with `tokens/tokens.css`, use the token file. Read [principles](docs/principles.md) for the general guidance and [review](docs/review.md) for checks before shipping.

## Colors

Use oatmeal backgrounds, slate text, and a deep green accent. Components reference named CSS variables such as `--surface`, not individual hex values. Keep this palette as the default. To use another brand, follow [the palette guide](docs/retheming.md). The optional Harbor theme changes the colors without changing component structure, spacing, or animation.

### Primary

- Use `--primary` / `--primary-foreground` for the main action; use `--accent`, `--accent-soft`, and `--focus-ring` for links, selection, and focus. Their dark values are independently authored, not inverted.
- Use `--rail-selected` with `--rail-selected-foreground` for the coral navigation selection, not as a second action accent.

### Neutral

- Use `--ground` for the page background, `--surface` for cards and floating panels, `--subtle` for inset backgrounds, `--hover` for hover backgrounds, and `--tint` / `--tint-strong` for translucent highlights.
- Use `--ink` for primary text, `--muted` for supporting text, `--line` for dividers, and `--control-line` for control boundaries. Never substitute the decorative hairline for a required control boundary.
- The six named brand colors (`--slate`, `--oatmeal`, `--coral`, `--sea`, `--umber`, `--chartreuse`) define the palette. Use the purpose-based variables above in components.

Use `--accent` for links, selections, and focus. Other colors should communicate a status or identify a chart category, not compete for attention.

Use `--good`, `--warn`, and `--danger` with words and icons. Use `--cat-1` through `--cat-8` for chart categories, keeping each category’s color when filtering. For larger sets, use filters, direct labels, small multiples, or a table; group categories under Other only when that summary is meaningful. See [color](docs/color.md) for the light and dark values and contrast results, including combinations that need care.

## Typography

**Display Font:** Albert Sans, using `--font-heading` (the body stack).
**Body Font:** Albert Sans, using `--font-body` and its token-defined system fallbacks.
**Labels:** Albert Sans, using `--font-body`.
**Code/Numeric Font:** IBM Plex Mono, using `--font-code`.

- Use the 14px / 1.5 / 400 body baseline. Use 1.65 for longer card descriptions and 1.6 for compact text rows when those reading presets fit the content; let text wrap and containers grow.
- Use the 30px / 600 / 1.2 / -0.035em page headline; use 18px / 600 / -0.02em section headings, 13px / 600 subheadings, 13px labels/compact support, and 12.5px help text. Keep 12px for compact metadata.
- Use tabular numbers for comparable numeric columns. Use mono for code, counts, times, durations, IDs, and keyboard keys; do not turn prose into mono.
- Bound full-page prose at 72ch. Do not impose that measure on images, code, or tables.
- Use the documented sizes rather than inventing a fixed ratio between them. [Typography](docs/typography.md) separates the shared type hierarchy from optional composition presets.

## Layout

- Choose a reading column, grid, table, split view, or other structure from the content and primary action. A sidebar, dashboard, board, and detail panel are options, not required anatomy.
- For the optional sidebar shell, use a 256px rail that can collapse to 72px, with a 66px desktop header. Its compact preset uses a 58px header and modal navigation below 768px. Use these together when that shell fits; other layouts should adapt where their own content stops fitting.
- For optional edge-attached details, the desktop panel preset is `min(520px, calc(100vw - 24px))` with a 12px outer inset. Use a full page when the content needs more space or a shareable destination. Preserve the source view and return focus on dismissal.
- Use the 2px spacing grid and frontmatter steps. Document optical exceptions rather than turning each one into a new global value.
- Keep headings, content, and controls aligned within the chosen structure. See [layout](docs/layout.md) for responsive and scrolling guidance.

## Elevation and depth

Separate sections with background colors, thin borders, and spacing. Keep cards flat; floating menus, panels, dialogs, and tooltips may cast a shadow.

Use `--shadow-float` for floating surfaces and `--shadow-raise` only when an elevated control actually needs separation. Exact light/dark shadow values live in `tokens/tokens.css`.

Use `--shadow-float` only on elements above the page. Do not lift cards on hover just for decoration.

## Shapes

Use `--radius-sm` (6px) for small controls, `--radius-md` (8px) for controls/navigation, `--radius-lg` (12px) for cards/containers, and `--radius-pill` (999px) for pills. Optional shell geometry uses `--radius-shell` (14px) and `--radius-rail` (20px). Do not apply shell radii to unrelated components. Use `--line` for decorative hairlines and `--control-line` where a visible control boundary is needed.

## Components

### Buttons

Use `packages/ui` for interaction behavior. Primary actions use `--primary` and `--primary-foreground`; quiet actions use ink on a transparent or subtle surface. Preserve hover, focus-visible, invalid, busy, and disabled states. Do not replace labels with unlabeled icons.

### Chips

Use a pill with a quiet tint, a readable label, and a meaningful selected state. Keep status pills distinct from filters. Never use color as the only signifier.

### Cards and containers

Use `--surface`, a 12px radius, and a hairline for bounded cards. The compact text-card padding preset is `16px 14px 14px`; media, prices, summaries, or actions determine what belongs inside. Use simple divided rows when repeated cards add framing without useful grouping. Show hierarchy only when the product actually has nested content. The frontmatter’s legacy `task-card` key records this visual preset, not a required task schema.

### Inputs and fields

Use `--surface`, `--ink`, `--control-line`, persistent labels, and hints below the field. The field padding preset is `8px 10px`, with the kit’s canonical small radius. Keep errors adjacent and announced; retain entered values on failure.

### Navigation

For a rail, use slate background, oatmeal foreground, coral selection, and sea focus. Other navigation structures use the appropriate surface, text, and selection roles. Let a shared selected backing travel using `selectionSpring`; remove shared-layout travel in reduced motion. If navigation opens as an overlay on small screens, manage its focus and dismissal as a modal.

### Details and contextual content

Choose inline expansion for nearby supporting information, a panel for quick inspection, or a full page for substantial detail. Keep the originating list, catalog filters, reading position, or conversation draft when people return. Show change history and undo only where the product supports them. See [component patterns](docs/components.md) for reusable structures and their example uses.

Use the shared [animation settings](docs/motion.md): `spring.smooth` for pages and expanding content, `spring.snappy` for small popups, `spring.press` for press feedback, `spring.travel` for full-width panels, and `spring.exit` for closing movement. Fades have their own short durations. When views overlap, the departing view must stop accepting input. Return focus to the opener when a panel closes. Component guides cover [overlays](packages/ui/docs/overlays.md), [controls](packages/ui/docs/controls.md), and [display](packages/ui/docs/display.md).

## Do and don’t

### Do:
- **Do** use token roles and test both themes.
- **Do** choose a structure that fits the product and keep shared navigation stable as content changes.
- **Do** name the responsible agent or automation when the product includes one, explain its change, and offer undo when safe.
- **Do** use Albert Sans at the 14px body baseline and IBM Plex Mono for dense counts, times, durations, IDs, and keys.
- **Do** use 6px, 8px, and 12px core radii and reserve shadows for floating layers.

### Don't:
- **Don’t** replace the canonical fonts or palettes with framework defaults.
- **Don’t** copy an example’s data model, storage choice, navigation, or workflows into an unrelated product.
- **Don’t** invent counters, progress, completion evidence, or artificial waits.
- **Don’t** add decorative gradients, blurred glass, emoji, statistics without a purpose, or low-contrast controls.
- **Don’t** animate shared navigation on routine page changes, replay entrances for existing items, or animate each word of a streamed reply.
- **Don’t** convey status or chart identity with color alone.

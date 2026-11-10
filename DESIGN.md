---
name: Sift design
description: Precise, local-first studio workbench guidance for coding agents.
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

# Design System: Sift design

## Overview

**Creative North Star: "The studio workbench"**

Build a precise studio workbench: navigational rails, orderly work surfaces, pinned context, and visible handoffs. Use Operate mode: help a person find, inspect, and change real work; do not turn the workspace into a presentation.

Keep the shell stable while the work changes. Use springs for spatial travel and scale, short durations for fades, direct manipulation, velocity-preserving interruption, and continuity of shared elements. Show actual local state, attribute helper actions, and preserve the person’s reading position and drafts. Use restrained density, deliberate typography, and interruptible motion rather than dashboard tiles or chat-first composition.

**Key Characteristics:**
- Operate mode; task-first, not metrics-first.
- Both themes are authored; dark is layered charcoal.
- One accent, legible hairlines, flat work surfaces.
- Motion explains state and preserves orientation.

Extracted from Sift’s design direction notes, product brief and shipped frontend, and from this repo’s normative tokens. Where prose and implementation disagree, prefer `tokens/tokens.css` and the shipped interface over older direction notes. This document builds no UI. Use [principles](docs/principles.md) for product constraints and [review](docs/review.md) for sign-off.

## Colors

Use warm oatmeal and slate neutrals with a deep-sea action accent. Reference roles, not brand swatches, in components. Keep this palette as the default. For another brand, follow [retheming](docs/retheming.md); the opt-in Harbor theme demonstrates a different palette without changing component anatomy, spacing, or motion.

### Primary

- Use `--primary` / `--primary-foreground` for the main action; use `--accent`, `--accent-soft`, and `--focus-ring` for links, selection, and focus. Their dark values are independently authored, not inverted.
- Use `--rail-selected` with `--rail-selected-foreground` for the coral navigation selection, not as a second action accent.

### Neutral

- Use `--ground` behind work, `--surface` for work surfaces and floats, `--subtle` for quiet wells, `--hover` for opaque hover, and `--tint` / `--tint-strong` for transparent washes.
- Use `--ink` for primary text, `--muted` for supporting text, `--line` for dividers, and `--control-line` for control boundaries. Never substitute the decorative hairline for a required control boundary.
- Treat `--slate`, `--oatmeal`, `--coral`, `--sea`, `--umber`, and `--chartreuse` as palette primitives, not additional semantic roles.

**The One Accent Rule.** Use --accent for links, selection, and focus. Reserve status and categorical colors for meaning; do not add a competing interface accent.

Use `--good`, `--warn`, and `--danger` with words and icons. Use `--cat-1` through `--cat-8` only for data identity, in fixed order; fold additional categories into Other. See [color](docs/color.md) for every resolved light/dark value and computed contrast, including pairs that do not pass a control-boundary target.

## Typography

**Display Font:** Albert Sans, using `--font-heading` (the body stack).
**Body Font:** Albert Sans, using `--font-body` and its token-defined system fallbacks.
**Label/Mono Font:** IBM Plex Mono, using `--font-code`.

- Use the 14px / 1.5 / 400 body baseline. Keep task titles 14px; task-card text uses 1.65 and compact rows use 1.6.
- Use the 30px / 600 / 1.2 / -0.035em page headline; use 18px / 600 / -0.02em section headings, 13px / 600 subheadings, 13px labels/compact support, and 12.5px help text. Keep 12px for compact metadata.
- Use tabular numbers for comparable numeric columns. Use mono for code, counts, times, durations, IDs, and keyboard keys; do not turn prose into mono.
- Bound full-page task prose at 72ch. Do not impose that measure on images, code, or tables.
- Do not assume a mathematical type ratio. Sift has contextual and fractional sizes; [typography](docs/typography.md) records the complete observed scale and exceptions.

## Layout

- Build a 256px navigation rail that can collapse to 72px. Keep its toggle in the header. Navigation does not translate the shell; explicit rail collapse is the confined reflow exception.
- Use the 66px desktop header, an inset workspace, semantic breadcrumb, bounded search, and a task-oriented toolbar. At widths below 768px, use a modal rail and the 58px header; remove the workspace inset.
- Keep detail context at the right edge. Sift sheet is `min(520px, calc(100vw - 24px))` with a 12px outer inset; preserve independent scroll and focus return.
- Consolidate new spacing on the observed 2px grid using the frontmatter steps. Sift’s optical offsets and odd spacings are exceptions, not a new scale.
- Use Sift’s content-driven breakpoints rather than replacing them with framework defaults. See [layout](docs/layout.md).

## Elevation & Depth

Use tonal layering, hairlines, and whitespace for depth. Work stays flat; floating menus, sheets, dialogs, and tooltips may cast a shadow.

- Use `--shadow-float` for floating surfaces and `--shadow-raise` only when an elevated control actually needs separation. Exact light/dark shadow values live in `tokens/tokens.css` and the sidecar.
- Sift uses custom detail-sheet shadows and several smaller overlay shadows. These are recorded exceptions, not permission to invent a shadow per component.

**The Flat Work Rule.** Keep cards and work surfaces flat. Apply --shadow-float only to layers above the work; do not use a hover lift as routine decoration.

## Shapes

Use `--radius-sm` (6px) for small controls, `--radius-md` (8px) for controls/navigation, `--radius-lg` (12px) for cards/containers, and `--radius-pill` (999px) for pills. Use hairline borders. Sift’s inputs use 7px, menus 10px, workspace 14px, and detail sheet 20px; use the canonical core scale for new kit primitives and keep those differences explicit, not silently redefined as tokens.

## Components

### Buttons

Use `packages/ui` for interaction behavior. Primary actions use `--primary` and `--primary-foreground`; quiet actions use ink on a transparent or subtle surface. Preserve hover, focus-visible, invalid, busy, and disabled states. Do not replace labels with unlabeled icons.

### Chips

Use a pill with a quiet tint, a readable label, and a meaningful selected state. Keep status pills distinct from filters. Never use color as the only signifier.

### Cards / Containers

Use 12px task cards, `--surface`, a hairline, and `16px 14px 14px` internal padding. Compact list rows flatten to a bottom divider and retain task anatomy. Keep parent/child structure without duplicating every child at top level.

### Inputs / Fields

Use `--surface`, `--ink`, `--control-line`, persistent labels, and hints below the field. Sift’s field padding is `8px 10px`. Use the kit’s canonical small radius for new primitives; Sift’s 7px radius is a noted exception. Keep errors adjacent and announced; retain the draft on failure.

### Navigation

Use slate rail, oatmeal foreground, coral selection, and sea focus. Let the selected backing travel using `selectionSpring`; remove shared-layout travel in reduced motion. Make the mobile rail a focus-managed modal, not a squeezed desktop rail.

### Attached task context

Open details from the right without resetting the board; preserve scroll, drafts, attribution, and undo. Follow [components](docs/components.md) for task, schedule, activity, form, and transcript patterns. Follow [motion](docs/motion.md) for spring-based travel, hierarchy push/pop, direct manipulation, resistance, press feedback, shared reflow, and reduced-motion equivalents. Use `spring.smooth` for work travel, `spring.snappy` for anchored small surfaces, `spring.press` for press feedback, and `spring.travel` for full-width sheets, and `spring.exit` for quicker departure travel/scale. Durations control fades, not the spatial spring. Preserve outgoing-view inertness and focus return. Kit families are documented in [overlays](packages/ui/docs/overlays.md), [controls](packages/ui/docs/controls.md), and [display](packages/ui/docs/display.md).

## Do's and Don'ts

### Do:
- **Do** use token roles and test both themes.
- **Do** keep the shell fixed during route changes and use direction-aware work-surface motion.
- **Do** attribute helper changes and expose the reason and available undo.
- **Do** use Albert Sans at 14px for task text and IBM Plex Mono for dense counts, times, durations, IDs, and keys.
- **Do** use 6px, 8px, and 12px core radii and reserve shadows for floating layers.

### Don't:
- **Don’t** copy stale Geist, blue-accent, or plum-dark guidance from earlier revisions.
- **Don’t** invent counters, progress, completion evidence, or artificial waits.
- **Don’t** use decoration gradients, glassmorphism, emoji, stock metric tiles, or pale-on-pale controls.
- **Don’t** animate the shell on navigation, replay arrivals for existing items, or animate streamed tokens.
- **Don’t** convey status or chart identity with color alone.

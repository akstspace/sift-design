# PRODUCT.md

# Sift design

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui components on Radix (`radix-ui`), Motion (`motion`), Tabler icons.
- Tokens in `tokens/` are the source of truth. The kit in `packages/ui` contains complete shadcn/ui components, restyled to the tokens, with motion on by default.
- Blocks in `blocks/*` are standalone Vite apps that use the kit; `specimen/` shows every component. Reference images live in `screenshots/`, captured with `scripts/capture.mjs`.

## Users

- People and coding agents building interfaces for their own products. They use the guides, tokens, and components without adopting another app's features.
- Designers and developers reviewing visual consistency, interaction, and accessibility.

## Product Purpose

Reusable visual design first developed for Sift. The repository supplies colors, fonts, spacing, components, and animation—not a task-app template. Each consuming product keeps its purpose, features, navigation, data model, framework, and storage requirements.

The existing blocks use Larkspur, a fictional greenhouse workspace (see `blocks/_shared/LARKSPUR.md`). They demonstrate working combinations of components. Their boards, helpers, time logs, and browser storage are optional example behavior, not requirements for other products. Reusable guidance also uses stores, finance, publishing, analytics, booking, and messaging examples.

## Operating Context

- The website helps visitors understand and adopt the system; guides support reading; component specimens and app examples demonstrate interaction. A consuming product chooses its own surface and layout.
- Light and dark themes are both first-class; dark is its own set of steps, not an inversion.
- Support desktop and small screens, including 390px reference captures and 360px overflow checks. Choose responsive behavior from the content, not a mandatory sidebar breakpoint.
- Reduced motion keeps cross-fades and state feedback and removes travel, scale and blur.

## Brand Commitments

- Palette pinned by the owner: Slate #2B2539, Oatmeal #EBE9E4, Coral #EFC8C8, Sea #BED3CC, Umber #7B6767, Chartreuse #EEEFC8.
- Type: Albert Sans for interface text, IBM Plex Mono for code, counts, times and durations.
- Visual style: warm neutrals, thin dividers, flat surfaces, clear typography, one action accent, and purposeful motion. Dashboards, chat, catalogs, editors, and reading layouts are welcome when they fit the product. A dark navigation rail is an available pattern, not required anatomy.
- Motion is a core requirement, not decoration: short, interruptible, spatially consistent, never blocking.

## Product Principles

- Show real state. No fake progress, invented statistics or artificial waits.
- If the product includes agents or automations, attribute consequential changes and explain them in plain words.
- Keep shared navigation stable during content transitions when it exists; do not add an app shell just to match an example.
- Accessibility to WCAG 2.2 AA, keyboard-complete, visible focus.

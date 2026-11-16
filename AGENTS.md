# Instructions for coding agents

This repo is a reusable visual design system. Use its colors, fonts, spacing,
components, and motion when building or changing a product's UI. Treat the
shared tokens as the source of truth, while keeping the product's own purpose,
features, data model, and storage requirements.

The system began with the Sift task app, but it is not an app template. The
fictional Larkspur screens in `blocks/` are optional examples, not a feature
checklist. Do not add tasks, helpers, a day timeline, local-first storage, or a
sidebar just to match an example. Dashboards, chat, top navigation, and other
layouts are welcome when they serve the product.

## Before you build

1. Ask the user one question before you write any UI: keep the default Sift Design palette (slate, oatmeal, coral and sea), or use a custom palette? Skip the question if they have already answered it. If you cannot ask, as in a non-interactive run, use the default palette and say so in your summary.
   - Default: use `tokens/tokens.css` unchanged.
   - Custom: ask for their brand colors, or offer to propose some, then follow [docs/retheming.md](docs/retheming.md). Only the color roles change; type, spacing, components and motion stay the same.
2. Read [DESIGN.md](DESIGN.md) and [docs/motion.md](docs/motion.md). If a guide and a token file disagree, use the token file. Include the shared animations from the start.
3. Read the doc for what you are building: [layout](docs/layout.md), [components](docs/components.md), [writing](docs/writing.md), [data visualization](docs/data-visualization.md), [accessibility](docs/accessibility.md).
4. Find components with the index in `/raw/manifest.json`; [docs/finding-components.md](docs/finding-components.md) explains its fields and searches. Look at the relevant components in [specimen/](specimen/) and, if useful, an example in [blocks/](blocks/) with its [screenshots](screenshots/). Reuse visual and interaction patterns that fit the request; do not copy an example's features, navigation, or data model unless the product needs them.

## Setting up a project

- The reference stack is React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui on Radix, Motion, and Tabler icons. Use it for a new project unless the brief specifies another stack; do not replace an existing project's framework just to use the design system.
- Copy `tokens/` (tokens.css, fonts.css, fonts/, motion.ts) into the project.
- Copy `packages/ui/src/theme.css`, `motion.css`, `motion/` and the components you need from `packages/ui/src/components/`. They are complete shadcn/ui components, already restyled and animated. Copy them over the stock shadcn versions; do not re-add stock ones. For chat, tool, code, canvas, or voice UI, also copy `ai.css` and the parts you need from `packages/ui/src/ai/`.
- Import order in the app stylesheet: `@layer ui-sdk;` first if the project uses ui-sdk, then `@import "tailwindcss";`, then the theme.
- Keep light and dark. Dark is its own palette (`.dark` on `<html>`), never an inversion.
- For a different brand, follow [docs/retheming.md](docs/retheming.md). Change the shared color variables, not component structure, spacing, or animation.

## ui-sdk

Three kit components are built on [ui-sdk](https://ui-sdk.dev) parts: `meter`, `segmented-control` and `timeline`. ui-sdk is a library of unstyled React components with keyboard, focus and screen reader support. It needs React 19 or newer.

- Before using ui-sdk, follow the ui-sdk skill if it's installed (this repo ships it in `.claude/skills/ui-sdk/`), and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it.
- Then read [docs/ui-sdk.md](docs/ui-sdk.md). It says when to use ui-sdk, and how to give its parts the Sift look and motion. Where the skill and the Sift guides differ, the Sift guides win for look, motion, writing and review.
- Always use the newest ui-sdk release. Before you install ui-sdk or change code that uses it, run `npm view @ui-sdk/react dist-tags`. While ui-sdk is in beta, use the higher of the `latest` and `beta` versions. After a stable release, use `latest`. Install `@ui-sdk/react` and `@ui-sdk/core` at that same exact version with the project's package manager. If the project has an older version, upgrade it first. If a release-age policy blocks the install, stop and ask the user instead of changing it.
- Learn the version you install. Its docs ship in `node_modules/@ui-sdk/react/docs/` and match that version. Read `llms.txt` again, and the page of each ui-sdk component you use. Check its Styling, Data Attributes and API Reference sections against the code. Then update the skill with `npx skills update ui-sdk`.
- Use the kit version when the kit has the component. The kit styles parts by `data-slot` across the page, and many ui-sdk slot names are the same as the kit's. Run `node scripts/check-ui-sdk-slots.mjs <component>` before using a ui-sdk component.
- Do not import `@ui-sdk/core/web.css`, and do not load ui-sdk files from its website.

## Rules that are easy to miss

- Albert Sans for text; IBM Plex Mono for counts, times, durations, IDs and keys, with tabular figures.
- One accent color per view. Reserve shadows for menus, dialogs, and other floating panels. Thin dividers use `--line`.
- Anything that travels moves on a spring from `tokens/motion.ts`; fades use short durations. Everything is interruptible; nothing blocks input; reduced motion keeps fades only.
- Show real state. No fake progress, no placeholder statistics, no artificial waits.
- If a product includes agents or automations, name the one behind a change and explain what it did in plain words. This is not a requirement to add automation.
- Use plain language and sentence case. Labels should name the action. No exclamation marks or emoji in UI copy. Explain unfamiliar terms; do not use internal design shorthand in headings or instructions.

## Before you call it done

Follow [docs/review.md](docs/review.md): capture both themes and a 390px
width, record relevant motion using the project's capture tools (this repo uses
`scripts/capture.mjs`), get axe to zero violations in captured states, and run
the Impeccable checks. For prose-only work, use the guide's documentation
checks rather than unrelated UI captures. Review once, fix issues together,
and confirm with at most one more review. Report any issues that remain.

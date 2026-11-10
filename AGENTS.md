# Instructions for coding agents

This repo is the design reference for the owner's personal projects. When you
build or change UI in one of those projects, this is how it should look, read
and move. Treat it as the source of truth over your own defaults.

## Before you build

1. Ask the user one question before you write any UI: keep the default Sift Design palette (slate, oatmeal, coral and sea), or use a custom palette? Skip the question if they have already answered it. If you cannot ask, as in a non-interactive run, use the default palette and say so in your summary.
   - Default: use `tokens/tokens.css` unchanged.
   - Custom: ask for their brand colors, or offer to propose some, then follow [docs/retheming.md](docs/retheming.md). Only the color roles change; type, spacing, components and motion stay the same.
2. Read [DESIGN.md](DESIGN.md) (tokens are normative) and [docs/motion.md](docs/motion.md). Motion is not optional polish here.
3. Read the doc for what you are building: [layout](docs/layout.md), [components](docs/components.md), [writing](docs/writing.md), [data visualization](docs/data-visualization.md), [accessibility](docs/accessibility.md).
4. Look at the closest block in [blocks/](blocks/) and its screenshots in [screenshots/](screenshots/). Match them.

## Setting up a project

- Stack: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui on Radix, Motion, Tabler icons.
- Copy `tokens/` (tokens.css, fonts.css, fonts/, motion.ts) into the project.
- Copy `packages/ui/src/theme.css`, `motion.css`, `motion/` and the components you need from `packages/ui/src/components/`. They are complete shadcn/ui components, already restyled and animated. Copy them over the stock shadcn versions; do not re-add stock ones.
- Import order in the app stylesheet: `@import "tailwindcss";` then the theme.
- Keep light and dark. Dark is its own palette (`.dark` on `<html>`), never an inversion.
- For a different brand, follow [docs/retheming.md](docs/retheming.md). Change roles, never the structure, spacing grammar or motion.

## Rules that are easy to miss

- Albert Sans for text; IBM Plex Mono for counts, times, durations, IDs and keys, with tabular figures.
- One accent per view. Shadows only on things that float. Hairlines are `--line`.
- Anything that travels moves on a spring from `tokens/motion.ts`; fades use short durations. Everything is interruptible; nothing blocks input; reduced motion keeps fades only.
- Show real state. No fake progress, no placeholder statistics, no artificial waits.
- Every action by an agent or automation is attributed and explained in plain words.
- Sentence case, specific labels, no exclamation marks or emoji in UI copy.

## Before you call it done

Follow [docs/review.md](docs/review.md): capture both themes and a 390px
width, record motion with `scripts/capture.mjs`, get axe to zero violations,
and run the Impeccable detect and critique loop until nothing actionable is left.

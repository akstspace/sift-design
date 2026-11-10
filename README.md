<img src="brand/sift-design-mark-animated.svg" width="72" alt="Sift Design mark">

# Sift Design

**A design reference for my agents to use on my personal projects.**

This repo captures the design language first built for [Sift](https://github.com/akstspace/sift), a local-first task workspace where people and scheduled agents share one board. It turns that language into four things an agent can use directly:

- normative tokens;
- written guidelines, with a full motion system;
- a complete shadcn/ui kit, restyled and animated;
- full-page React blocks with reference screenshots and motion recordings.

Browse it at **[akstspace.github.io/sift-design](https://akstspace.github.io/sift-design/)**. If you are an agent, start with **[AGENTS.md](AGENTS.md)** or the site's [llms.txt](https://akstspace.github.io/sift-design/llms.txt).

![The workbench block: a Today board with a slate navigation rail, oatmeal canvas and four task columns](screenshots/workbench/01-today-light.png)

> The blocks use **Larkspur**, a made-up product for a small greenhouse, so no reference image shows Sift itself. Everything about the system (tokens, kit, docs) is Sift Design; only the sample content is Larkspur. See [blocks/_shared/LARKSPUR.md](blocks/_shared/LARKSPUR.md).

## What is here

| Path | What it is |
|---|---|
| [DESIGN.md](DESIGN.md) | The whole system in one file: tokens in the frontmatter, then overview, colors, typography, layout, elevation, shapes, components, do's and don'ts. |
| [AGENTS.md](AGENTS.md) | How an agent should use this repo when building UI. |
| [docs/](docs) | Topic guides: [principles](docs/principles.md), [color](docs/color.md), [typography](docs/typography.md), [layout](docs/layout.md), [components](docs/components.md), [motion](docs/motion.md), [data visualization](docs/data-visualization.md), [writing](docs/writing.md), [accessibility](docs/accessibility.md), [retheming](docs/retheming.md), [review](docs/review.md). |
| [tokens/](tokens) | `tokens.css` (light and dark), `tokens.json` (W3C design tokens), `motion.ts` (springs and motion presets), `fonts.css` and fonts, `themes/` (alternate palettes). |
| [packages/ui/](packages/ui) | Every shadcn/ui component, restyled to the tokens with motion on by default, plus page transitions, a scroll-linked title and a time picker. Copy from here. |
| [blocks/](blocks) | Five full-page compositions built with the kit, each a standalone Vite app, like [shadcn/ui blocks](https://ui.shadcn.com/blocks). |
| [specimen/](specimen) | Every kit component, live and operable. |
| [screenshots/](screenshots) | Reference stills (light, dark, 390px), motion clips, and axe reports. |
| [brand/](brand) | The Sift Design mark: static, animated, on-dark and one-color versions, with geometry and entrance spec. |
| [site/](site) | The website, built with the kit. |
| [scripts/](scripts) | `capture.mjs` (build, serve and capture a block or the specimen), `spring-easing.mjs` (turn a spring into a CSS easing) and `build-site.mjs` (build the website). |
| [CREDITS.md](CREDITS.md) | The libraries, fonts, tools and skills this is built on. |

## The look in brief

A precise studio workbench: a slate navigation rail, an oatmeal canvas, calm surfaces with hairlines, and one accent per view. It is not a metrics dashboard and not stock shadcn.

| Role | Light | Dark |
|---|---|---|
| Canvas | Oatmeal `#ebe9e4` | `#18191b` |
| Surface | `#f8f7f4` | `#242628` |
| Text | Slate `#2b2539` | Oatmeal `#ebe9e4` |
| Rail | Slate `#2b2539` | `#121315` |
| Selection | Coral `#efc8c8` | Coral `#efc8c8` |
| Primary | Slate | Sea `#bed3cc` |
| Accent and success | `#386254` | Sea `#bed3cc` |

Type is Albert Sans at a 14px base, with IBM Plex Mono for counts, times, durations, IDs and keys. Radii are 6, 8 and 12px. Shadows appear only on things that float. Full detail is in [docs/color.md](docs/color.md) and [docs/typography.md](docs/typography.md).

## Motion

Motion is a core part of this language, not a final polish pass. Anything that travels or scales moves on a spring, so it can be interrupted, reversed or grabbed mid-flight without a jump. Fades and color changes use short durations.

- Menus grow out of the control that opened them.
- Panels slide in from the edge they belong to.
- Moving deeper into a page pushes in from the trailing edge, and going back reverses it.
- Selection highlights travel between items.
- Lists close their gaps on a spring.
- Drags follow the pointer and resist past their limits.
- Reduced motion keeps cross-fades and drops all travel.

The presets live in [tokens/motion.ts](tokens/motion.ts), with CSS twins as `--spring-*` easings in [tokens/tokens.css](tokens/tokens.css). The full guide is [docs/motion.md](docs/motion.md).

| Menu from its trigger | Segmented control | Push and pop |
|---|---|---|
| ![Dropdown menu growing from its trigger](screenshots/specimen/clip-dropdown-menu.webp) | ![Segmented control selection travelling between options](screenshots/specimen/clip-segmented.webp) | ![A detail page pushing in and popping back](screenshots/specimen/clip-push-pop.webp) |

The [motion page](https://akstspace.github.io/sift-design/motion) plays these as video, with a playground for every preset.

## Retheming

The palette above is the default and stays the default. For a project with its own brand, change the colors through the roles and leave the structure alone. [docs/retheming.md](docs/retheming.md) walks through it:

1. Choose the brand colors and map each one to a role in light mode.
2. Build dark mode as its own set of steps.
3. Check contrast for every text and control pair.
4. Re-check the categorical data colors.
5. Swap fonts if needed.
6. Capture and review the result.

Role names, spacing, component anatomy and motion do not change. The worked example is [tokens/themes/harbor.css](tokens/themes/harbor.css), switched on with `?palette=harbor`:

| Default | Harbor |
|---|---|
| ![Specimen in the default palette](screenshots/specimen/controls-section-light.png) | ![Specimen in the Harbor palette](screenshots/specimen/retheme-harbor-light.png) |

## Blocks

Each block is a standalone app with its own README, a list of its screenshots, and the motion recipes it uses. All of them run live on the [blocks page](https://akstspace.github.io/sift-design/blocks), where you can resize them and read their source.

### [Component specimen](specimen)
All kit components, live and operable, in three families: [controls](packages/ui/docs/controls.md), [overlays and menus](packages/ui/docs/overlays.md), and [display, layout and navigation](packages/ui/docs/display.md).

| Light | Dark |
|---|---|
| ![Controls section, light](screenshots/specimen/controls-section-light.png) | ![Overlays section, dark](screenshots/specimen/overlays-section-dark.png) |

### [Workbench](blocks/workbench)
The daily board:
- a 256px rail that collapses to 72px;
- board and list views, with drag and drop;
- live tasks arriving from helpers;
- a task inspector that opens to a full page;
- completion with undo;
- moving into an area and back.

| Dark | 390px | Area drill-in |
|---|---|---|
| ![Workbench, dark](screenshots/workbench/02-today-dark.png) | ![Workbench at 390px](screenshots/workbench/03-today-light-mobile.png) | ![Area drill-in motion](screenshots/workbench/workbench-motion-area-drill.webp) |

### [Routines](blocks/routines)
Scheduled helpers, with honest status:
- running, paused with a reason, failed, or needing action;
- a schedule editor that previews the next runs;
- run history, and a live log that arrives in batches.

| Light | Dark | Status change |
|---|---|---|
| ![Routines, light](screenshots/routines/01-helpers-light.png) | ![Routines, dark](screenshots/routines/02-helpers-dark.png) | ![Status change motion](screenshots/routines/routines-motion-status-desktop.webp) |

### [Timeline](blocks/timeline)
Time spent:
- a ribbon of the day, with eight category colors in a fixed order;
- labeled duration bars;
- a session rail and a week view;
- editing with protection for unsaved changes.

| Light | Dark | Day navigation |
|---|---|---|
| ![Timeline, light](screenshots/timeline/01-day-light.png) | ![Timeline, dark](screenshots/timeline/02-day-dark.png) | ![Day navigation motion](screenshots/timeline/timeline-motion-day-navigation.webp) |

### [Assistant](blocks/assistant)
An assistant:
- docked beside the work, or expanded to a full page;
- streaming replies that arrive in calm batches;
- tool activity, attachments, and plain-language recovery notices.

| Docked | Full page | Dock to full page |
|---|---|---|
| ![Assistant docked, light](screenshots/assistant/01-docked-light.png) | ![Assistant full page, dark](screenshots/assistant/02-full-page-dark.png) | ![Dock to full page motion](screenshots/assistant/assistant-motion-morph.webp) |

### [Onboarding](blocks/onboarding)
First run:
- the mark assembles, then anchors each setup step;
- connection checks show honest results;
- optional steps can be skipped or revisited;
- a handoff into the workspace;
- settings with a smooth theme change.

| Welcome | Connection checks | Mark assembly |
|---|---|---|
| ![Onboarding welcome, light](screenshots/onboarding/01-welcome-light.png) | ![Connection checks, failed state](screenshots/onboarding/02-connections-failed-light.png) | ![Mark assembly motion](screenshots/onboarding/onboarding-motion-assembly.webp) |

## Run it

Requires Node 24 or newer, Chrome, `ffmpeg` and `gif2webp` (from libwebp) for motion clips.

```sh
npm install
npm run site:dev                           # the website, with every block live, at http://localhost:5300
npm run dev -w @larkspur/workbench         # one block on its own: routines, timeline, assistant, onboarding
npm run dev -w @sift-design/specimen       # every kit component
npm run typecheck                          # typechecks every block, the specimen and the whole kit
node scripts/capture.mjs workbench --axe   # rebuild the reference images and the accessibility report
```

## Host the website

`site/` is the browsable Sift Design website. It is built with the kit itself and includes:

- the guides, live components and the motion playground;
- the blocks, which run live;
- a page of prompts to give a coding agent.

It is published to GitHub Pages by [.github/workflows/pages.yml](.github/workflows/pages.yml) on every push to `main`. To host it yourself, the root `Dockerfile` builds everything into one static nginx image:

```sh
docker build -t sift-design .
docker run --rm -p 8080:8080 sift-design   # http://localhost:8080
```

What the server exposes:

| Path | Contents |
|---|---|
| `/` | The website |
| `/live/<name>/` | Each block and the specimen, live |
| `/raw/<repo path>` | The reference as plain files: docs, tokens, kit sources and docs, screenshots |
| `/llms.txt`, `/llms-full.txt` | Entry points for agents |

Locally, `npm run site:dev` serves the site with `/raw` and `npm run site:build` writes the same output to `site/dist`. To serve it from a sub-path, as a GitHub Pages project site does, set `SITE_BASE`; [build-site.mjs](scripts/build-site.mjs) lists the options.

Give an agent this prompt, or use your own host's address:

```text
Use Sift Design for this project's UI. Fetch https://akstspace.github.io/sift-design/llms.txt
and follow it. First ask me whether to keep the default Sift Design palette or use a custom one.
Read AGENTS.md, DESIGN.md and docs/motion.md before writing UI, copy the tokens and the kit
components instead of stock shadcn/ui, match the reference screenshots of the closest block,
and sign off with docs/review.md: both themes, 390px wide, reduced motion, axe at zero.
```

The website's "Use with your agent" page shows this and task-specific prompts with your real address already filled in.

## How this was reviewed

Every block was signed off the same way, described in [docs/review.md](docs/review.md):

- captures in both themes and at 390px;
- motion filmstrips judged frame by frame;
- axe-core at zero violations;
- [Impeccable](https://impeccable.style/) detect and critique rounds until nothing actionable was left.

The axe reports sit next to the screenshots (`screenshots/*/*axe.json`). The few deliberate detector exceptions are recorded with their reasons in `.impeccable/config.json`. These are the spring easings and a square status marker.

### Known limitations

- **Reduced motion:** kit components follow the system's reduced-motion setting. An in-app motion preference has to be bridged locally; the onboarding block shows how.
- **Filmstrips:** these freeze time to show frames. One case renders too early: a JS spring with a start delay, such as the sidebar width, can show its end state before it really gets there. Judge those from the real-time clip.
- **Testing:** everything was captured in desktop Chrome, with touch and 390px emulated. Nothing has been checked on a physical phone.

## Licenses

- Code: [MIT](LICENSE).
- The components in `packages/ui` are adapted from [shadcn/ui](https://ui.shadcn.com) (MIT).
- Albert Sans, IBM Plex Sans and IBM Plex Mono are licensed under the SIL Open Font License 1.1 (see `tokens/fonts/`).
- Everything else this is built on, with licenses, is in [CREDITS.md](CREDITS.md).

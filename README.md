<img src="brand/sift-design-mark-animated.svg" width="72" alt="Sift Design mark">

# Sift Design

**Reusable visual design for coding agents and the products they build.**

This repo collects the visual design first built for [Sift](https://github.com/akstspace/sift). It gives coding agents four things they can reuse without copying that app's features:

- shared settings for colors, fonts, sizes, and animation, called design tokens;
- guides for building clear, consistent interfaces;
- shadcn/ui components with the styles and animations built in;
- five optional example screens, with source code, screenshots, and recordings.

Keep your product's own purpose, data model, storage, and navigation. You do not
need a task board, a day timeline, scheduled helpers, or a sidebar to use this
system. Dashboards, chat, editors, and other interfaces are welcome when they
fit the product.

Browse it at **[chaioverflow.com/sift-design](https://chaioverflow.com/sift-design/)**. If you are an agent, start with **[AGENTS.md](AGENTS.md)** or the site's [llms.txt](https://chaioverflow.com/sift-design/llms.txt).

![The Workbench example: today’s tasks in four columns beside a dark sidebar](screenshots/workbench/01-today-light.png)

> The optional blocks use **Larkspur**, a made-up greenhouse app. Their tasks, automations, time tracking, and setup choices belong to that fictional product; they are not design-system requirements. The source code and screenshots show how the shared components work together. See [blocks/_shared/LARKSPUR.md](blocks/_shared/LARKSPUR.md).

## What is here

| Path | What it is |
|---|---|
| [DESIGN.md](DESIGN.md) | An overview of colors, fonts, layout, borders, shadows, components, and animation, with settings in the file header. |
| [AGENTS.md](AGENTS.md) | How an agent should use this repo when building UI. |
| [docs/](docs) | Topic guides: [principles](docs/principles.md), [color](docs/color.md), [typography](docs/typography.md), [layout](docs/layout.md), [components](docs/components.md), [motion](docs/motion.md), [data visualization](docs/data-visualization.md), [writing](docs/writing.md), [accessibility](docs/accessibility.md), [retheming](docs/retheming.md), [review](docs/review.md). |
| [tokens/](tokens) | `tokens.css` (light and dark), `tokens.json` (W3C design tokens), `motion.ts` (springs and motion presets), `fonts.css` and fonts, `themes/` (alternate palettes). |
| [packages/ui/](packages/ui) | Every shadcn/ui component, restyled to the tokens with motion on by default, plus page transitions, a scroll-linked title and a time picker. Copy from here. |
| [blocks/](blocks) | Five optional fictional app screens, each a standalone Vite app, like [shadcn/ui blocks](https://ui.shadcn.com/blocks). |
| [specimen/](specimen) | Try every component in one app. |
| [screenshots/](screenshots) | Reference stills (light, dark, 390px), motion clips, and axe reports. |
| [brand/](brand) | The Sift Design mark: static, animated, on-dark and one-color versions, with geometry and entrance spec. |
| [site/](site) | The website, built with the kit. |
| [scripts/](scripts) | `capture.mjs` (build, serve and capture a block or the specimen), `spring-easing.mjs` (turn a spring into a CSS easing) and `build-site.mjs` (build the website). |
| [CREDITS.md](CREDITS.md) | The libraries, fonts, tools and skills this is built on. |

## The look in brief

Warm backgrounds, slate text, thin borders, and one accent color per view. When a sidebar fits the product, it uses the dark slate navigation colors. The fonts, spacing, components, and motion work with other layouts too.

| Role | Light | Dark |
|---|---|---|
| Canvas | Oatmeal `#ebe9e4` | `#18191b` |
| Surface | `#f8f7f4` | `#242628` |
| Text | Slate `#2b2539` | Oatmeal `#ebe9e4` |
| Rail | Slate `#2b2539` | `#121315` |
| Selection | Coral `#efc8c8` | Coral `#efc8c8` |
| Primary | Slate | Sea `#bed3cc` |
| Accent and success | `#386254` | Sea `#bed3cc` |

Text uses Albert Sans at a 14px base, with IBM Plex Mono for counts, times, durations, IDs, and keys. Most corners use 6, 8, or 12px rounding. Shadows are reserved for floating panels such as menus and dialogs. See [color](docs/color.md) and [typography](docs/typography.md) for details.

## Motion

Animations are built in from the start. Movement and scaling use shared spring settings, which let a transition reverse from its current position without a jump. Fades and color changes have their own short durations.

- Menus grow out of the control that opened them.
- Panels slide in from the edge they belong to.
- Opening details slides them in from the right in left-to-right layouts; going back reverses the movement.
- Selection highlights travel between items.
- Lists close their gaps on a spring.
- Drags follow the pointer and resist past their limits.
- Reduced motion keeps cross-fades and drops all travel.

The presets are in [tokens/motion.ts](tokens/motion.ts). Matching CSS curves use `--spring-*` variables in [tokens/tokens.css](tokens/tokens.css). See [the motion guide](docs/motion.md) for usage and code examples.

| Menu from its trigger | Segmented control | Push and pop |
|---|---|---|
| ![Dropdown menu growing from its trigger](screenshots/specimen/clip-dropdown-menu.webp) | ![Segmented control selection travelling between options](screenshots/specimen/clip-segmented.webp) | ![A detail page pushing in and popping back](screenshots/specimen/clip-push-pop.webp) |

The [motion page](https://chaioverflow.com/sift-design/motion) plays these as video, with a playground for every preset.

## Use your own colors

Keep the palette above as the default. For another brand, change the shared color variables rather than rewriting each component. [The palette guide](docs/retheming.md) walks through it:

1. Choose colors for each purpose, such as text, backgrounds, and actions, in light mode.
2. Choose dark-mode colors separately.
3. Check contrast for every text and control pair.
4. Test chart category colors and labels.
5. Keep Albert Sans and IBM Plex Mono, along with the shared type sizes, spacing, and animation. A palette change changes colors, not the rest of the system.
6. Capture and review the result.

Variable names, spacing, component structure, and animation stay the same. Try the included [Harbor palette](tokens/themes/harbor.css) with `?palette=harbor`:

| Default | Harbor |
|---|---|
| ![Specimen in the default palette](screenshots/specimen/controls-section-light.png) | ![Specimen in the Harbor palette](screenshots/specimen/retheme-harbor-light.png) |

## Optional example screens

Blocks are complete screens showing one fictional product, not a starter app or feature checklist. Reuse the components and interactions that fit your request; do not add a board or timeline just because an example has one. Each is a standalone app with a README, screenshots, and animation examples. Try them on the [examples page](https://chaioverflow.com/sift-design/blocks), where you can resize the preview and read the code. Their data and service activity are simulated.

### [Component examples](specimen)
Try the components in five groups: [controls](packages/ui/docs/controls.md), [overlays and menus](packages/ui/docs/overlays.md), [display, layout and navigation](packages/ui/docs/display.md), [charts](packages/ui/docs/charts.md), and [AI elements](packages/ui/docs/ai.md).

| Light | Dark |
|---|---|
| ![Controls section, light](screenshots/specimen/controls-section-light.png) | ![Overlays section, dark](screenshots/specimen/overlays-section-dark.png) |

### [Workbench](blocks/workbench)
A fictional daily task board:
- a 256px sidebar that collapses to 72px;
- board and list views, with drag and drop;
- simulated tasks arriving from an automation;
- a task detail panel that can expand to a full page;
- completion with undo;
- moving into an area and back.

| Dark | 390px | Area drill-in |
|---|---|---|
| ![Workbench, dark](screenshots/workbench/02-today-dark.png) | ![Workbench at 390px](screenshots/workbench/03-today-light-mobile.png) | ![Area drill-in motion](screenshots/workbench/workbench-motion-area-drill.webp) |

### [Routines](blocks/routines)
An example automation manager, called helpers in Larkspur:
- running, paused with a reason, failed, or needing action;
- a schedule editor that previews the next runs;
- sample run history, and a simulated live log that arrives in batches.

| Light | Dark | Status change |
|---|---|---|
| ![Routines, light](screenshots/routines/01-helpers-light.png) | ![Routines, dark](screenshots/routines/02-helpers-dark.png) | ![Status change motion](screenshots/routines/routines-motion-status-desktop.webp) |

### [Timeline](blocks/timeline)
An example time log, for products that need to show recorded time:
- a day timeline with eight consistent category colors;
- labeled duration bars;
- a session list and a week view;
- editing with protection for unsaved changes.

| Light | Dark | Day navigation |
|---|---|---|
| ![Timeline, light](screenshots/timeline/01-day-light.png) | ![Timeline, dark](screenshots/timeline/02-day-dark.png) | ![Day navigation motion](screenshots/timeline/timeline-motion-day-navigation.webp) |

### [Assistant](blocks/assistant)
An example chat interface with simulated replies:
- docked beside the work, or expanded to a full page;
- streaming replies that arrive in calm batches;
- tool activity, attachments, and plain-language recovery notices.

| Docked | Full page | Dock to full page |
|---|---|---|
| ![Assistant docked, light](screenshots/assistant/01-docked-light.png) | ![Assistant full page, dark](screenshots/assistant/02-full-page-dark.png) | ![Dock to full page motion](screenshots/assistant/assistant-motion-morph.webp) |

### [Onboarding](blocks/onboarding)
An example setup flow, with browser-saved preferences rather than real desktop integrations:
- the mark assembles, then anchors each setup step;
- connection checks fetch local fixtures and show the actual request result;
- optional steps can be skipped or revisited;
- a transition from setup to the workspace;
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
Build this project's UI with Sift Design. Read https://chaioverflow.com/sift-design/llms.txt,
then AGENTS.md, DESIGN.md, and docs/motion.md. Ask whether I want the default colors or a
custom palette before you start. Reuse the tokens, fonts, spacing, animated components,
and shared motion settings rather than stock shadcn/ui. Keep this project's features,
data model, storage, and navigation. The example screens are optional references, not
requirements to add tasks, timelines, helpers, or a sidebar. Follow docs/review.md to
check both themes, a 390px screen, reduced motion, and zero axe accessibility violations.
```

The website's "Use with your agent" page shows this and task-specific prompts with your real address already filled in.

## How this was reviewed

Each block was checked using [the review guide](docs/review.md):

- captures in both themes and at 390px;
- motion filmstrips judged frame by frame;
- axe-core at zero violations;
- [Impeccable](https://impeccable.style/) code checks and visual reviews, with issues fixed together.

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

Keep a stable navigation shell around an inset, task-oriented workspace.
Use source-derived density and responsive changes; preserve focus and independent scrolling.

# Layout

## Compose the shell

- Use a 256px rail, collapsing to 72px. Keep the collapse/menu toggle in the header, not hidden in the rail. Preserve icon tooltips in collapsed mode.
- Keep the workspace flexible with `min-width: 0`, `margin: 8px 8px 8px 0`, and Sift’s workspace radius of 14px. The canonical reusable container radius is 12px; the shell’s 14px is a product-specific exception.
- Use a 66px desktop header, `padding: 0 26px`, 14px gap, `--surface`, and a bottom `--line`. Include semantic breadcrumb and bounded search; do not let search consume the task title’s layout.
- Default page padding is `39px 38px 24px`; board pages override top padding to 24px. Keep headings and toolbars aligned with the work below, not with unrelated viewport edges.
- Keep the right-edge detail sheet at `inset: 12px 12px 12px auto`, width `min(520px, calc(100vw - 24px))`, and height `calc(100dvh - 24px)`. Use separate pinned header/footer and a scrolling middle. Sift’s sheet radius is 20px, an explicit exception to the core scale.
- Expanded task view uses a 1088px reading layout, a 288px property sidebar, and 64px gap. At 1100px, reduce the sidebar to 264px and gap to 40px; at 919px and below, stack properties above the body with a 736px reading layout. Preserve a reading anchor when changing between panel and full task view.

Do: keep task details spatially attached to the board. Don’t: reset the route or scroll position just to inspect a task.

## Consolidate spacing on the observed grid

Use a 2px grid for new layout. The consolidated source-derived steps are 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, and 64px. These are written tokens in `tokens.json`, not CSS variables currently provided by `tokens.css`.

Use 2–6px for tightly related inline marks, 8–12px for control/card groups, 14–20px for internal surfaces, and 24–40px for section separation. Sift’s includes optical exceptions such as 3px, 5px, 7px, 9px, 13px gaps and 39px page top padding. Preserve an exception when reproducing that exact composition; do not promote every odd measurement into the canonical spacing scale.

## Preserve operating density

| Pattern | Sift’s size | Rule |
|---|---|---|
| Desktop rail item | 40px high; 10px 12px padding | Keep labels and icons aligned |
| Mobile rail item | At least 44px high | Keep touch interaction usable |
| Header | 66px desktop; 58px mobile | Keep pinned, not part of page travel |
| Toolbar | 42px minimum; controls 34px high | Keep filters near the work they affect |
| Input/select | 8px 10px input padding; select min-height 36px | Grow with content/errors |
| Board column heading | 48px high | Show status, name, count, add action |
| Board card | 16px 14px 14px padding; 8px stack gap | Do not impose a fixed card height |
| Compact task row | Minimum 70px; 15px 10px padding | Retain metadata and nesting |
| Task list virtualization | 84px estimate, overscan 8 | Measure real rows; estimate is not a fixed height |
| Activity legend chip | 28px high | Expand hit area as needed on touch |
| Activity part header | 44px high | Align time rail and section label |
| Task check | 24px square | Keep keyboard focus visible |

Sift’s density is not proof of target-size conformance. Compact icons must retain adequate non-overlapping hit areas; see [accessibility](accessibility.md).

## Use the observed responsive thresholds

These are CSS media-query values, not invented framework breakpoints. The mobile rail hook uses below 768px, aligned to the CSS maximum of 767px.

| Query | Sift’s adaptation |
|---|---|
| max-width 640px | Compact update notice |
| min-width 640px | Wider run/report composition |
| max-width 720px | Activity heading stacks, smaller overview, 46px time column / 32px rail, task-time feed tightens |
| max-width 767px | Modal rail, edge-to-edge workspace, 58px header, mobile detail and board |
| max-width 919px | Full-task properties stack above reading body |
| max-width 950px | Page padding `30px 24px 20px`, header padding `0 24px`, narrower search, responsive settings/run layout |
| max-width 960px | Tracker setup stacks and hides preview |
| max-width 1100px | Full-task property column and gap tighten |
| max-width 1250px | Settings/run columns tighten, job controls stack |
| min-width 1500px | Workspace side padding grows to 46px |
| hover: hover | Reveal supplementary hover actions without hiding keyboard access |
| hover: none | Keep row actions visible |
| pointer: coarse | Expand specified session/day/link targets to at least 44px |
| prefers-reduced-motion: reduce | Remove spatial animation; preserve state feedback |

At the mobile threshold, set workspace margin/radius to 0; hide the breadcrumb and its separator, give search flexible width, use a 16px search input, and set page padding to `27px 18px 20px` (board top 20px). Let task properties and description editors use 16px input text.

Use the rail as a modal Sheet with overlay, focus trap, accessible title, Escape dismissal, and trigger focus return. Do not squeeze the desktop rail into a permanent strip.

## Lay out boards and scrolling regions

Use horizontal board overflow with 18px column gaps. Columns are `flex: 1 0 245px`, maximum 480px; column task lists scroll independently with `overscroll-behavior: contain`. Keep Sift’s focus-ring-safe inset (`4px 4px 12px`) inside column lists.

On mobile, use 13px gaps and columns `0 0 min(285px, 82vw)` with proximity scroll snapping. Preserve an indication that more columns exist; do not shrink every column to fit.

Use `min-height: 0` through flex scroll parents; otherwise the scrolling child expands the page. Keep the detail sheet edge-to-edge at mobile sizes, with 100dvh height, no outer shadow/border/radius, and an independent scroll body. Do not stack competing page and panel scroll areas that trap keyboard users.

## Apply radius and elevation roles

Use core radii 6/8/12px and pill 999px for new reusable primitives. Sift’s exceptions include 7px fields, 10px columns/menus, 14px workspace, 16px activity overview, and 20px detail sheet. Keep these explicit rather than inventing extra global tokens.

Use `--line` for decorative separation and `--control-line` for controls. Keep cards flat. Use `--shadow-float` only for floating layers and `--shadow-raise` only for a justified elevated control. Sift’s task sheet uses a custom shadow; do not multiply bespoke shadows across the kit.

## Checklist

- Rail widths, header heights, and mobile threshold match Sift.
- Board columns and the detail body scroll without moving the shell.
- Spacing uses consolidated steps or an identified Sift’s exception.
- Cards grow with content; virtualized rows are measured.
- Mobile rail/dialog focus and touch targets remain usable.

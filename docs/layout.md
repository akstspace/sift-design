Keep navigation in a predictable place and leave enough room for the main content. Let layouts adapt to smaller screens without losing controls, focus, or scroll position.

# Layout

## Choose the structure from the content

Start with the primary activity and the relationships among the information. The design language does not require a sidebar, a board, a timeline, a detail panel, or a fixed number of columns.

| Content and activity | Useful structure | Keep clear |
|---|---|---|
| Browsing products or media | Responsive grid with relevant filters | Item identity, availability, and the next action |
| Comparing transactions or records | Table or aligned list | Column labels, units, sorting, and row actions |
| Reading an article or editing content | Bounded reading column with nearby tools | Reading order, document hierarchy, and save state |
| Exploring analytical results | Charts and summaries arranged around a question | Data scope, comparisons, filters, and a non-visual alternative |
| Holding conversations | Conversation list and message view, or a single view on small screens | Current conversation, message order, and composer draft |
| Inspecting an item without leaving a collection | Inline expansion, split view, or temporary panel | Source selection, return path, and independent focus |

Use the simplest structure that exposes the necessary relationships. A dashboard is appropriate for meaningful comparisons; a board is appropriate for items grouped by an actual workflow. Neither is a default page template.

## Align navigation, content, and actions

- Choose top navigation, tabs, a rail, or another navigation pattern from the number and depth of destinations. Do not add empty navigation sections to match an example.
- Keep shared navigation stable during content transitions. Use the same alignment for page headings, filters, content, and related actions.
- Include breadcrumbs for meaningful hierarchy and search when there is something useful to search. They are not mandatory header decoration.
- Use `min-width: 0` on flexible content so long text, tables, and charts do not force the entire page wider.
- Keep primary actions near the content they affect. Pin controls only when persistent access outweighs the space they consume.
- Choose a full detail page when content needs substantial room or a shareable destination. For quick inspection, preserve the source selection, filters, draft, and scroll position.

## Use consistent spacing

Use multiples of 2px for new layout spacing: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, and 64px. These values are listed in `tokens/tokens.json`; `tokens/tokens.css` does not currently provide them as variables.

Use 2–6px between closely related icons and text, 8–12px between controls or cards, 14–20px inside panels, and 24–40px between sections. Align repeated groups and document optical adjustments rather than treating every measurement in a screenshot as another spacing token.

## Fit the content without crowding controls

The following compact presets are available when they fit the content. They do not require every screen to have these components, and they are not fixed heights for text that must wrap.

| Pattern | Reference size | Rule |
|---|---|---|
| Desktop navigation item | 40px high; 10px 12px padding | Keep labels and icons aligned |
| Touch navigation item | At least 44px high | Keep touch interaction usable |
| Optional shell header | 66px desktop; 58px compact | Keep shared header out of content travel |
| Toolbar | 42px minimum; controls 34px high | Keep filters near the work they affect |
| Input/select | 8px 10px input padding; select min-height 36px | Grow with content/errors |
| Compact text card | 16px 14px 14px padding; 8px stack gap | Grow with descriptions and actions |
| Multi-line record row | Minimum 70px; 15px 10px padding | Use only when primary text and supporting metadata need this space |
| Filter or legend chip | 28px high | Expand hit area as needed on touch |
| Small state control | 24px square | Keep focus visible and provide an adequate target area |

Density is not proof of target-size conformance. Compact icons must retain adequate non-overlapping hit areas; see [accessibility](accessibility.md). Measure actual rows if virtualizing a long catalog, ledger, or message list; an estimate is not a fixed row height.

## Adapt to screen width

Change a layout when its content or controls stop fitting, not because an unrelated example has a breakpoint. Start by allowing wrapping and flexible widths, then change structure when necessary.

- Let a product grid use fewer columns without hiding prices or actions. Let an article keep a readable measure rather than filling a wide display.
- Let related metadata stack when a split view becomes too narrow. Preserve its reading order and access to the main action.
- Give tables, code, and charts local horizontal overflow when their structure matters. Do not turn every screen into a horizontally scrolling page.
- Keep essential controls available without hover. `hover: hover` may reveal supplementary actions, but keyboard focus must reveal them too; `hover: none` needs a visible path.
- Use `pointer: coarse` to check and, where needed, expand touch targets to at least 44px. Keep target areas non-overlapping.
- Under `prefers-reduced-motion: reduce`, remove spatial animation and preserve useful state feedback.
- Test at 390px as well as desktop widths, with long content and zoom. The review width is a test case, not a universal layout breakpoint.

If a rail becomes a mobile overlay, use a modal Sheet with a title, contained keyboard focus, Escape dismissal, and trigger focus return. Top navigation or a conversation list may need a different adaptation. Do not squeeze a desktop structure into an unusable permanent strip.

## Define scrolling deliberately

Use ordinary document scrolling unless a split view or persistent context needs independent regions. Keep the active scroll owner clear and reachable by keyboard. Sticky controls must not cover focused content or the last row.

Use `min-height: 0` through flex scroll parents; otherwise the scrolling child expands the page. Add enough inset that focus rings are not clipped. Use `overscroll-behavior: contain` only for a region that intentionally owns scrolling, not every nested container.

Opening and closing a panel should not reset the source view. Follow new chat messages only when the reader is already near the latest content; do not pull someone away from an older message. Live updates should preserve the item being read or edited.

## Optional layout presets

These measurements are reusable compositions, not a required app shell. Adopt only the presets that support the product; keep the shared tokens unchanged.

### Sidebar shell

- Use a 256px rail that can collapse to 72px. Keep its toggle discoverable outside collapsed content, such as in the header; collapsed icons still need names and tooltips.
- An inset content area can use `margin: 8px 8px 8px 0` and `--radius-shell` (14px). The header preset is 66px high with `padding: 0 26px`, a 14px gap, `--surface`, and a bottom `--line`.
- The compact version switches below 768px (CSS maximum 767px): use modal navigation, a 58px header, and no outer content margin or radius. Search, if present, takes available width and uses 16px input text; keep breadcrumbs only if they remain useful and fit.
- Use shared spacing for new page padding. Exact source-screen padding, such as `39px 38px 24px`, is a reproduction detail, not a new universal spacing step.

### Edge-attached inspection

- The desktop panel preset uses `inset: 12px 12px 12px auto`, width `min(520px, calc(100vw - 24px))`, and height `calc(100dvh - 24px)`. Use a scrolling body; pin its header or footer only when useful. A 20px outer radius belongs to this composition, not every dialog.
- A full-screen compact panel uses 100dvh height, no outer shadow, border, or radius, and its own scroll body. Retain a visible close or back action and restore focus on dismissal.
- A wider reading-and-properties composition can use a 1088px container, a 288px secondary column, and 64px gap. Its reference adjustment at 1100px uses a 264px secondary column and 40px gap; at 919px and below it stacks into a 736px maximum-width layout. Use these thresholds only if the project’s content fits them, and preserve the reading anchor across changes.

### Horizontally grouped content

When a real workflow or comparison benefits from separate columns, the reference preset uses 18px gaps and columns `flex: 1 0 245px`, maximum 480px. A column list may scroll independently with `4px 4px 12px` focus-ring-safe inset. Neither the number of columns nor their labels are prescribed.

The compact preset uses 13px gaps, columns `0 0 min(285px, 82vw)`, and proximity scroll snapping. Keep an indication that more content exists; do not shrink all columns until their contents become unreadable. Use a grid, table, or list instead when horizontal grouping adds no value.

## Use the shared corners, borders, and shadows

Use core radii 6/8/12px and pill 999px for reusable primitives. The optional shell has dedicated 14px and 20px roles. Keep composition-specific shapes explicit rather than inventing extra global tokens or applying a shell radius everywhere.

Use `--line` for decorative separation and `--control-line` for controls. Keep cards flat. Use `--shadow-float` only for floating layers and `--shadow-raise` only for a justified elevated control. Do not multiply bespoke shadows across the kit.

## Checklist

- The structure fits the primary activity without importing unrelated features.
- Navigation, content, and actions remain aligned and accessible as the layout changes.
- Scroll ownership is clear; opening details preserves the source context.
- Spacing uses the shared steps or a documented exception.
- Cards grow with content; virtualized rows are measured.
- Mobile navigation, dialog focus, and touch targets remain usable.

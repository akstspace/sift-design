Use semantic roles from the normative token file in both themes.
Test actual foreground/background pairs; neither a pale wash nor a data hue is a text token.

# Color

## Use roles, not isolated swatches

Use the six brand primitives through semantic roles. The one-accent rule applies to interface emphasis, not to categorical data. Keep `--good`, `--warn`, and `--danger` reserved for state; pair each with a readable word and an icon. Do not use pale brand primitives as text on a pale surface.

The names below are the actual CSS custom-property names, without the leading dashes. Values resolve aliases in each theme. Sift’s old `--blue`, `--blue-soft`, `--green`, `--amber`, sidebar roles, and descriptive category names map to this repo’s `--accent`, `--accent-soft`, `--good`, `--warn`, rail roles, and numbered category slots.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--slate` | `#2b2539` | `#2b2539` | Brand primitive; light ink/rail/primary. |
| `--oatmeal` | `#ebe9e4` | `#ebe9e4` | Brand primitive; light ground, dark ink. |
| `--coral` | `#efc8c8` | `#efc8c8` | Selected navigation backing. |
| `--sea` | `#bed3cc` | `#bed3cc` | Dark accent/primary/good; rail focus. |
| `--umber` | `#7b6767` | `#7b6767` | Brand primitive; do not substitute for muted text. |
| `--chartreuse` | `#eeefc8` | `#eeefc8` | Dark attention primitive. |
| `--ground` | `#ebe9e4` | `#18191b` | Canvas behind work. |
| `--surface` | `#f8f7f4` | `#242628` | Cards, panels, sheets, menus. |
| `--rail` | `#2b2539` | `#121315` | Navigation background. |
| `--subtle` | `#e4e1dc` | `#2c2e31` | Quiet wells and tracks. |
| `--hover` | `#ded9d7` | `#36393c` | Opaque hover on surface. |
| `--tint` | `#2b25390b` | `#ebe9e40e` | Transparent hover wash; composite on actual background. |
| `--tint-strong` | `#2b253915` | `#ebe9e41a` | Pressed/selected transparent wash. |
| `--ink` | `#2b2539` | `#ebe9e4` | Primary text and icons. |
| `--muted` | `#6b5b5b` | `#b5b7b9` | Supporting text and metadata. |
| `--line` | `#cfc8c3` | `#3b3e41` | Dividers and decorative hairlines. |
| `--control-line` | `#918183` | `#777b7e` | Required input/control boundary. |
| `--primary` | `#2b2539` | `#bed3cc` | Primary action fill. |
| `--primary-foreground` | `#ebe9e4` | `#2b2539` | Text on primary action. |
| `--accent` | `#386254` | `#bed3cc` | Links, active state, selection, focus. |
| `--accent-soft` | `#d7e4de` | `#2b3e37` | Selection/drop-target wash. |
| `--good` | `#386254` | `#bed3cc` | Done/healthy with word and icon. |
| `--warn` | `#756019` | `#eeefc8` | Attention with word and icon. |
| `--danger` | `#973e4f` | `#f4a4b0` | Failure/destructive state with word and icon. |
| `--danger-foreground` | `#ffffff` | `#2b2539` | Text on destructive fill. |
| `--focus-ring` | `#386254` | `#bed3cc` | Keyboard focus outside rail. |
| `--rail-foreground` | `#ebe9e4` | `#ebe9e4` | Rail text. |
| `--rail-muted` | `#c7c3ce` | `#b5b7b9` | Rail supporting text. |
| `--rail-selected` | `#efc8c8` | `#efc8c8` | Selected rail item backing. |
| `--rail-selected-foreground` | `#2b2539` | `#2b2539` | Text on selected rail item. |
| `--rail-hover` | `#40364b` | `#292c2e` | Rail hover background. |
| `--rail-line` | `#4e4256` | `#333638` | Rail divider. |
| `--rail-ring` | `#bed3cc` | `#bed3cc` | Rail keyboard focus. |
| `--cat-1` | `#017c5d` | `#017c5d` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-2` | `#aa84d4` | `#9d78c6` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-3` | `#976b03` | `#946800` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-4` | `#6da9e7` | `#5b97d3` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-5` | `#a1592e` | `#9d562b` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-6` | `#8aab5f` | `#7c9c50` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-7` | `#b85862` | `#b5555f` | Categorical data identity only; fixed slot, never status or text. |
| `--cat-8` | `#868bd1` | `#7a7ec4` | Categorical data identity only; fixed slot, never status or text. |

## Verify contrast by pair

Ratios below are computed from the exact resolved sRGB hex values using WCAG relative luminance: linearize each channel, weight by 0.2126 / 0.7152 / 0.0722, then divide the lighter luminance plus 0.05 by the darker plus 0.05. Composite alpha washes over the stated background before comparing. Round only the displayed result; do not round to claim a pass.

Require 4.5:1 for normal text and 3:1 for large text and essential control boundaries. These are accessibility targets, not new palette values. Decorative dividers need not meet the control-boundary threshold. A pale wash is not a control boundary or an adequate selection indicator by itself.

| Foreground / background | Light ratio | Dark ratio | Intended test |
|---|---:|---:|---|
| `--ink` / `--surface` | 13.74:1 | 12.52:1 | Text |
| `--ink` / `--ground` | 12.13:1 | 14.50:1 | Text |
| `--ink` / `--subtle` | 11.29:1 | 11.22:1 | Text |
| `--ink` / `--hover` | 10.52:1 | 9.58:1 | Text |
| `--muted` / `--surface` | 5.99:1 | 7.55:1 | Text |
| `--muted` / `--ground` | 5.29:1 | 8.74:1 | Text |
| `--muted` / `--subtle` | 4.92:1 | 6.77:1 | Text |
| `--muted` / `--hover` | 4.59:1 | 5.78:1 | Text |
| `--accent` / `--surface` | 6.44:1 | 9.67:1 | Text |
| `--accent` / `--ground` | 5.69:1 | 11.21:1 | Text |
| `--accent` / `--subtle` | 5.29:1 | 8.68:1 | Text |
| `--accent` / `--hover` | 4.93:1 | 7.40:1 | Text |
| `--good` / `--surface` | 6.44:1 | 9.67:1 | Text |
| `--good` / `--ground` | 5.69:1 | 11.21:1 | Text |
| `--good` / `--subtle` | 5.29:1 | 8.68:1 | Text |
| `--good` / `--hover` | 4.93:1 | 7.40:1 | Text |
| `--warn` / `--surface` | 5.69:1 | 12.88:1 | Text |
| `--warn` / `--ground` | 5.03:1 | 14.92:1 | Text |
| `--warn` / `--subtle` | 4.68:1 | 11.55:1 | Text |
| `--warn` / `--hover` | 4.36:1 | 9.86:1 | Text |
| `--danger` / `--surface` | 6.29:1 | 7.80:1 | Text |
| `--danger` / `--ground` | 5.55:1 | 9.03:1 | Text |
| `--danger` / `--subtle` | 5.16:1 | 6.99:1 | Text |
| `--danger` / `--hover` | 4.82:1 | 5.97:1 | Text |
| `--control-line` / `--surface` | 3.46:1 | 3.56:1 | Boundary/focus |
| `--control-line` / `--ground` | 3.05:1 | 4.12:1 | Boundary/focus |
| `--control-line` / `--subtle` | 2.84:1 | 3.19:1 | Boundary/focus |
| `--control-line` / `--hover` | 2.65:1 | 2.72:1 | Boundary/focus |
| `--line` / `--surface` | 1.54:1 | 1.41:1 | Decorative divider only |
| `--line` / `--ground` | 1.36:1 | 1.63:1 | Decorative divider only |
| `--line` / `--subtle` | 1.27:1 | 1.27:1 | Decorative divider only |
| `--line` / `--hover` | 1.18:1 | 1.08:1 | Decorative divider only |
| `--focus-ring` / `--surface` | 6.44:1 | 9.67:1 | Boundary/focus |
| `--focus-ring` / `--ground` | 5.69:1 | 11.21:1 | Boundary/focus |
| `--focus-ring` / `--subtle` | 5.29:1 | 8.68:1 | Boundary/focus |
| `--focus-ring` / `--hover` | 4.93:1 | 7.40:1 | Boundary/focus |
| `--primary-foreground` / `--primary` | 12.13:1 | 9.38:1 | Button text |
| `--danger-foreground` / `--danger` | 6.74:1 | 7.56:1 | Destructive button text |
| `--rail-foreground` / `--rail` | 12.13:1 | 15.32:1 | Rail text |
| `--rail-muted` / `--rail` | 8.50:1 | 9.24:1 | Rail metadata |
| `--rail-foreground` / `--rail-hover` | 9.37:1 | 11.59:1 | Rail hover text |
| `--rail-selected-foreground` / `--rail-selected` | 9.65:1 | 9.65:1 | Selected rail text |
| `--rail-ring` / `--rail` | 9.38:1 | 11.84:1 | Rail focus |
| `--rail-line` / `--rail` | 1.57:1 | 1.53:1 | Decorative rail divider |
| `--ink` / `--accent-soft` | 11.25:1 | 9.37:1 | Selected/drop-target text |
| `--accent` / `--accent-soft` | 5.27:1 | 7.24:1 | Accent on wash |
| `--ink` / `--surface` | 13.74:1 | 12.52:1 | Inverted tooltip surface/ink has the same ratio |

Do: use `--control-line` on fields and check its actual adjacent surface. Don’t: assume it passes on every hover/subtle fill. In particular, Sift’s control-line values are not universally sufficient on tinted/hovered backgrounds; retain the canonical values, change the component/background pairing or use an approved higher-contrast role, and re-test.

Do: indicate selection with the traveling shape, text, and/or border in addition to the wash. Don’t: claim the tint itself meets non-text contrast.

## Keep the categorical palette stable

Use exactly eight slots in fixed order. Sift’s Sift’s order is Coding, Reviewing, Meetings, Messages, Admin, Research, Writing, Other. Larkspur’s matching slots are Growing, Inspection, Meetings and calls, Messages, Admin, Research, Writing, Other. Filtering never renumbers surviving categories. Fold additional categories into Other rather than cycling or generating colors. See [data visualization](data-visualization.md).

## Author dark mode as its own steps

- Apply `.dark` to the root and `color-scheme: dark`; honor system preference until the person chooses an override.
- Replace ground, surface, rail, text, borders, action, status, wash, category, and shadow roles with their dark values together. Do not invert rendered pixels or lighten only the canvas.
- Retain coral selected navigation with slate foreground; retain the independently darkened rail hover and dividers.
- Recheck each actual text and control pair. Keep charts’ labels in ink/muted even when a categorical fill is low contrast.

For another brand, preserve these role names and follow the complete role-mapping and pair-matrix process in [retheming](retheming.md). The default values above remain normative when no alternate palette is selected.

## Checklist

- Every role resolves to the table in the selected theme.
- Normal text and essential controls pass their actual adjacent-background tests.
- Status has an icon and a word; selection is not color-only.
- Categories retain fixed slots and overflow folds into Other.
- Both themes use their authored values, not an inversion.

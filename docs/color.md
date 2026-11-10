Use named CSS variables for color in both themes. Check text and controls against the backgrounds where they actually appear.

# Color

## Choose a color by its purpose

The palette starts with six brand colors. Components use purpose-based variables such as `--surface` for backgrounds and `--ink` for text. These are often called **color roles**. Using them keeps both themes consistent and lets you change the palette in one place.

Use one accent color to emphasize actions; charts can have several category colors. Reserve `--good`, `--warn`, and `--danger` for status, alongside a word and icon. Pale brand colors are not suitable for text on a pale background.

The table lists the CSS variable names and their final light and dark values. Variables beginning with `--rail-` style a dark navigation rail when one is present; they do not require a sidebar. `--cat-` variables identify data categories chosen by the product.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--slate` | `#2b2539` | `#2b2539` | Base brand color; light-theme text, sidebar, and primary actions. |
| `--oatmeal` | `#ebe9e4` | `#ebe9e4` | Base brand color; light background and dark-theme text. |
| `--coral` | `#efc8c8` | `#efc8c8` | Selected navigation backing. |
| `--sea` | `#bed3cc` | `#bed3cc` | Dark accent/primary/good; rail focus. |
| `--umber` | `#7b6767` | `#7b6767` | Base brand color; not a replacement for muted text. |
| `--chartreuse` | `#eeefc8` | `#eeefc8` | Base color for dark-theme warnings. |
| `--ground` | `#ebe9e4` | `#18191b` | Canvas behind work. |
| `--surface` | `#f8f7f4` | `#242628` | Cards, panels, sheets, menus. |
| `--rail` | `#2b2539` | `#121315` | Navigation background. |
| `--subtle` | `#e4e1dc` | `#2c2e31` | Inset backgrounds and control tracks. |
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
| `--good` | `#386254` | `#bed3cc` | Confirmed success/healthy state with word and icon. |
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

## Check text and control contrast

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

Use `--control-line` for field borders, then test it against the field’s actual background. It does not have enough contrast on every hover or tinted background. Keep the shared values; change the background or use a suitable higher-contrast variable and test again. Propose any shared palette change separately.

Indicate selection with text, an icon, a visible outline, or a selected shape in addition to the wash. A shared backing may travel between options, but it must remain clear without animation. Do not claim the tint itself meets non-text contrast.

## Keep chart colors consistent

Use `--cat-1` through `--cat-8`, mapped consistently to the product’s categories or series. They might identify merchandise departments, expense types, acquisition channels, or publication sections. No category names or activity model are prescribed. Keep each identity’s assigned slot when filtering, sorting, or changing views. If eight colors cannot distinguish the data clearly, use filters, direct labels, small multiples, or a table rather than cycling colors. Group categories under a clearly labeled Other only when that summary answers the question, and preserve access to the underlying detail. See [data visualization](data-visualization.md).

## Choose dark-mode colors separately

- Apply `.dark` to the root and `color-scheme: dark`; honor system preference until the person chooses an override.
- Replace ground, surface, rail, text, borders, action, status, wash, category, and shadow roles with their dark values together. Do not invert rendered pixels or lighten only the canvas.
- When using the default rail, retain coral selected navigation with slate foreground and the independently darkened rail hover and dividers. Other layouts still use the shared color roles rather than requiring a dark rail.
- Recheck each actual text and control pair. Keep charts’ labels in ink/muted even when a categorical fill is low contrast.

For another brand, keep the variable names and follow [the palette guide](retheming.md). Use the default values above when no alternate palette is selected.

## Checklist

- Every role resolves to the table in the selected theme.
- Normal text and essential controls pass their actual adjacent-background tests.
- Status has an icon and a word; selection is not color-only.
- Categories retain their assigned colors; larger sets stay distinguishable without relying on extra colors alone.
- Both themes use their own values, not an inversion.

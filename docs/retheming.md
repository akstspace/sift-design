Use your own brand colors by changing the shared CSS color variables. Keep typography, spacing, component structure, and animation behavior consistent; choose the product’s layout independently.

# Change the palette

## What changes and what stays the same

Change colors in one place rather than adding overrides to each component. Keep the default palette available, and apply an alternate palette only when it is selected. Harbor is the example included in this repository, with separate light and dark values.

| You can change | Keep consistent |
|---|---|
| Brand colors and their purpose-based variables | Variable names; separate action, status, and chart colors |
| Background, text, action, sidebar, status, and shadow colors | Contrast of at least 4.5:1 for ordinary text; 3:1 for large text and essential controls |
| Dark-mode colors chosen separately | Dark is not an inverted image of light mode |
| Chart colors, after testing | Eight category color roles, unchanged by filtering; use labels, filters, small multiples, or tables for larger sets |

Keep Albert Sans, IBM Plex Mono, the type hierarchy, radius roles, spacing, and control measurements unchanged when changing the palette. Preserve component structure, keyboard access, focus, screen-reader announcements, and shared animations. Panels should still open from the expected edge, drags should follow the pointer, and reduced motion should still work.

These invariants describe reusable components and interaction quality, not a fixed page template. A store can retain its catalog, a finance app its ledger, and a messaging product its conversations under either palette. Retheming does not add or remove product features, navigation, accounts, or storage requirements.

Use `--primary` and `--accent` for action colors. Do not hardcode a new color in one component or replace its spring animation to suit a brand mood.

## Change the palette step by step

- Choose the brand colors for backgrounds, text, selections, actions, supporting details, and warnings. These are starting colors, not six competing accents. Keep existing variable names so components do not need to know the brand’s color names.
- Set every light-mode variable: page and panel backgrounds, sidebar, hover and selection backgrounds, text, borders, actions, statuses, focus, chart categories, and shadows. Derive darker or lighter shades when needed for contrast. Harbor uses navy, sand, teal, and apricot.
- Choose dark-mode values separately. Check how the sidebar, page, cards, and hover backgrounds look together. Update each background and its text color together.
- Measure text and control contrast in normal, hovered, and selected states, including transparent colors over their actual backgrounds. Record the ratios. Ordinary text needs 4.5:1; essential control outlines need 3:1. If a combination fails, change it and test again. A decorative divider is not an input outline.
- Test chart colors against the chart background and against neighboring categories, including with color-vision simulations. Keep labels, gaps, and an equivalent list or table. Distinguishable colors can still have poor background contrast. Filtering must not change a category’s color.
- Keep the existing font files, 13px labels, 12.5px help text, radius roles, spacing, and control sizes. Do not shrink text to hide overflow or use a palette change to introduce a new component shape or density.
- Capture the component examples in both themes, on desktop and at 390px wide. Include focus, hover, invalid, selected, and disabled states. Review the images, run axe and Impeccable, fix issues together, and confirm the result. Check animation and reduced motion without changing their settings.

## Try the Harbor example

Import `@sift-design/tokens/themes/harbor.css` after the default theme. It contains only role-variable overrides under `[data-palette="harbor"]` and `[data-palette="harbor"].dark`; no component selectors, font/radius overrides, or animation rules. Without the attribute, the default remains untouched.

The specimen initializer reads `?palette=harbor` and applies the root attribute. Select dark through `?theme=dark` or the existing `.dark` mechanism. Example: `?palette=harbor&theme=dark&section=controls`. No component fork is necessary. `tokens/tokens.json` also exports the complete resolved Harbor light/dark sets under `themes.harbor`; the root `light`/`dark` groups remain the default.

| Role | Harbor light | Harbor dark |
|---|---|---|
| `--ground` | `#eee7da` | `#121a21` |
| `--surface` | `#fffaf1` | `#1b252e` |
| `--rail` | `#142d45` | `#0b1015` |
| `--subtle` | `#e3dacb` | `#24303a` |
| `--hover` | `#ddd2c1` | `#2d3a45` |
| `--tint` | `#142d450b` | `#fffaf10e` |
| `--tint-strong` | `#142d4515` | `#fffaf11a` |
| `--ink` | `#142d45` | `#f1e8d7` |
| `--muted` | `#505b60` | `#b4c0c6` |
| `--line` | `#c5b9a6` | `#34424d` |
| `--control-line` | `#6d6a60` | `#8a9aa3` |
| `--primary` | `#006563` | `#88d4c8` |
| `--primary-foreground` | `#fffaf1` | `#102c30` |
| `--accent` | `#006563` | `#88d4c8` |
| `--accent-soft` | `#c8dfd7` | `#1f3b38` |
| `--good` | `#28633e` | `#a4d4aa` |
| `--warn` | `#725411` | `#f3d58b` |
| `--danger` | `#993c42` | `#f2a6a8` |
| `--danger-foreground` | `#fffaf1` | `#102c30` |
| `--focus-ring` | `#006563` | `#88d4c8` |
| `--rail-foreground` | `#fffaf1` | `#f1e8d7` |
| `--rail-muted` | `#c1cfda` | `#b4c0c6` |
| `--rail-selected` | `#f5bc89` | `#f5bc89` |
| `--rail-selected-foreground` | `#142d45` | `#142d45` |
| `--rail-hover` | `#27465e` | `#19222b` |
| `--rail-line` | `#416075` | `#26313b` |
| `--rail-ring` | `#88d4c8` | `#88d4c8` |
| `--cat-1` | `#017c5d` | `#017c5d` |
| `--cat-2` | `#aa84d4` | `#9d78c6` |
| `--cat-3` | `#976b03` | `#946800` |
| `--cat-4` | `#6da9e7` | `#5b97d3` |
| `--cat-5` | `#a1592e` | `#9d562b` |
| `--cat-6` | `#8aab5f` | `#7c9c50` |
| `--cat-7` | `#b85862` | `#b5555f` |
| `--cat-8` | `#868bd1` | `#7a7ec4` |
| `--shadow-float` | `0 16px 50px -14px #142d4533` | `0 16px 50px -14px #0009` |
| `--shadow-raise` | `0 1px 2px #142d450f, 0 2px 8px -2px #142d451a` | `0 1px 2px #0006, 0 2px 8px -2px #0008` |

## Check Harbor’s contrast results

The ratios below are calculated from the exact sRGB values in `tokens/themes/harbor.css` using WCAG relative luminance; display rounding does not decide a pass. Text is tested against every permitted work fill, including hover and accent-soft. Control/focus boundaries are tested against the same fills. The role is not approved on any omitted arbitrary custom background.

| Foreground / background | Light | Dark | Required use |
|---|---:|---:|---|
| `--ink` / `--surface` | 13.55:1 | 12.78:1 | 4.5:1 text |
| `--ink` / `--ground` | 11.45:1 | 14.44:1 | 4.5:1 text |
| `--ink` / `--subtle` | 10.17:1 | 11.07:1 | 4.5:1 text |
| `--ink` / `--hover` | 9.43:1 | 9.58:1 | 4.5:1 text |
| `--ink` / `--accent-soft` | 10.05:1 | 9.92:1 | 4.5:1 text |
| `--muted` / `--surface` | 6.72:1 | 8.36:1 | 4.5:1 text |
| `--muted` / `--ground` | 5.68:1 | 9.45:1 | 4.5:1 text |
| `--muted` / `--subtle` | 5.04:1 | 7.25:1 | 4.5:1 text |
| `--muted` / `--hover` | 4.68:1 | 6.27:1 | 4.5:1 text |
| `--muted` / `--accent-soft` | 4.99:1 | 6.49:1 | 4.5:1 text |
| `--accent` / `--surface` | 6.64:1 | 9.11:1 | 4.5:1 text |
| `--accent` / `--ground` | 5.61:1 | 10.29:1 | 4.5:1 text |
| `--accent` / `--subtle` | 4.98:1 | 7.89:1 | 4.5:1 text |
| `--accent` / `--hover` | 4.62:1 | 6.82:1 | 4.5:1 text |
| `--accent` / `--accent-soft` | 4.93:1 | 7.06:1 | 4.5:1 text |
| `--good` / `--surface` | 6.86:1 | 9.31:1 | 4.5:1 text |
| `--good` / `--ground` | 5.80:1 | 10.52:1 | 4.5:1 text |
| `--good` / `--subtle` | 5.15:1 | 8.07:1 | 4.5:1 text |
| `--good` / `--hover` | 4.78:1 | 6.98:1 | 4.5:1 text |
| `--good` / `--accent-soft` | 5.09:1 | 7.22:1 | 4.5:1 text |
| `--warn` / `--surface` | 6.75:1 | 10.88:1 | 4.5:1 text |
| `--warn` / `--ground` | 5.71:1 | 12.30:1 | 4.5:1 text |
| `--warn` / `--subtle` | 5.07:1 | 9.43:1 | 4.5:1 text |
| `--warn` / `--hover` | 4.70:1 | 8.16:1 | 4.5:1 text |
| `--warn` / `--accent-soft` | 5.01:1 | 8.44:1 | 4.5:1 text |
| `--danger` / `--surface` | 6.56:1 | 7.99:1 | 4.5:1 text |
| `--danger` / `--ground` | 5.55:1 | 9.03:1 | 4.5:1 text |
| `--danger` / `--subtle` | 4.92:1 | 6.93:1 | 4.5:1 text |
| `--danger` / `--hover` | 4.57:1 | 5.99:1 | 4.5:1 text |
| `--danger` / `--accent-soft` | 4.87:1 | 6.20:1 | 4.5:1 text |
| `--control-line` / `--surface` | 5.20:1 | 5.35:1 | 3:1 boundary/focus |
| `--control-line` / `--ground` | 4.40:1 | 6.05:1 | 3:1 boundary/focus |
| `--control-line` / `--subtle` | 3.91:1 | 4.64:1 | 3:1 boundary/focus |
| `--control-line` / `--hover` | 3.62:1 | 4.01:1 | 3:1 boundary/focus |
| `--control-line` / `--accent-soft` | 3.86:1 | 4.15:1 | 3:1 boundary/focus |
| `--focus-ring` / `--surface` | 6.64:1 | 9.11:1 | 3:1 boundary/focus |
| `--focus-ring` / `--ground` | 5.61:1 | 10.29:1 | 3:1 boundary/focus |
| `--focus-ring` / `--subtle` | 4.98:1 | 7.89:1 | 3:1 boundary/focus |
| `--focus-ring` / `--hover` | 4.62:1 | 6.82:1 | 3:1 boundary/focus |
| `--focus-ring` / `--accent-soft` | 4.93:1 | 7.06:1 | 3:1 boundary/focus |
| `--primary-foreground` / `--primary` | 6.64:1 | 8.63:1 | 4.5:1 action text |
| `--danger-foreground` / `--danger` | 6.56:1 | 7.58:1 | 4.5:1 destructive action text |
| `--rail-foreground` / `--rail` | 13.55:1 | 15.71:1 | 4.5:1 rail text |
| `--rail-muted` / `--rail` | 8.86:1 | 10.28:1 | 4.5:1 rail support |
| `--rail-foreground` / `--rail-hover` | 9.51:1 | 13.23:1 | 4.5:1 rail hover text |
| `--rail-muted` / `--rail-hover` | 6.22:1 | 8.66:1 | 4.5:1 rail hover support |
| `--rail-selected-foreground` / `--rail-selected` | 8.34:1 | 8.34:1 | 4.5:1 selected rail text |
| `--rail-ring` / `--rail` | 8.25:1 | 11.19:1 | 3:1 rail focus |
| `--rail-ring` / `--rail-hover` | 5.79:1 | 9.42:1 | 3:1 rail hover focus |

Decorative `--line` and `--rail-line` are intentionally not approved as essential control outlines. Washes are not standalone selection indicators. Disabled states may be exempt from a contrast criterion, but must still read as disabled rather than disappear.

Harbor retains the fixed categorical palette to show that brand retargeting does not require recoloring data. Validation against the actual Harbor surfaces passes adjacent color-vision and normal-vision separation in both themes. Mark-contrast warnings remain for light slots 2/4/6 and dark slots 1/3/5: retain visible labels and an equivalent list or table, and add a contrasting boundary/secondary encoding where a mark boundary itself is essential. Do not claim a color-vision separation pass is a universal contrast pass.

## Capture and review the result

Run from the repo root:

```sh
node scripts/capture.mjs specimen --shots shots/retheme.mjs --axe
```

The shots file captures the complete specimen and controls section in both themes, focused inputs and button close-ups, and 390px mobile controls. The report is `screenshots/specimen/retheme-axe.json`.

- [Light specimen](../screenshots/specimen/retheme-harbor-light.png)
- [Dark specimen](../screenshots/specimen/retheme-harbor-dark.png)
- [Light controls](../screenshots/specimen/retheme-harbor-controls-light.png)
- [Dark controls](../screenshots/specimen/retheme-harbor-controls-dark.png)
- [Light buttons](../screenshots/specimen/retheme-harbor-buttons-light.png) / [dark buttons](../screenshots/specimen/retheme-harbor-buttons-dark.png)
- [Light focused field](../screenshots/specimen/retheme-harbor-field-light.png) / [dark focused field](../screenshots/specimen/retheme-harbor-field-dark.png)
- [Light mobile](../screenshots/specimen/retheme-harbor-mobile-light.png) / [dark mobile](../screenshots/specimen/retheme-harbor-mobile-dark.png)

The initial automated capture had zero axe violation groups across all ten shots. Manual pair computation found the light hover fill narrowly missed ordinary-text contrast for several roles, so that fill was lightened and the same shots were recaptured. This demonstrates why axe and a static render do not replace explicit state-pair computation. The final recapture also has zero axe violation groups across all ten shots; both-theme focused-field/button close-ups and desktop/mobile compositions were inspected. Read the final capture report and images before claiming a broader sign-off; a build-size warning is not an accessibility failure but remains a separate implementation concern.

## Checklist

- Default palette is unchanged unless an alternate root attribute is selected.
- Every color variable has a light value and a separately chosen dark value.
- Text and control contrast results are recorded for the backgrounds where they are used.
- Chart categories keep their colors; labels and other cues cover contrast limitations.
- Fonts, sizes, spacing, shapes, component behavior, and shared animation remain unchanged.
- Both themes are reviewed on desktop and mobile; untested cases and remaining issues are listed.

Retarget brand expression through tokens while preserving the language’s operating structure and spring-based behavior.
Keep the default unchanged; Harbor demonstrates a complete opt-in role mapping with independently authored light and dark values.

# Retheming

## Preserve the contract

Retheming is a token substitution, not an excuse to redesign component behavior. Keep the current palette as the default. Apply an alternate root attribute only when the project explicitly chooses it.

| Swappable | Invariant |
|---|---|
| Six brand primitives and their semantic mapping | Existing role names and the separation of palette, interface, status, and data identity |
| Every surface/text/action/rail/status/shadow color role | AA floors: 4.5:1 ordinary text; 3:1 essential non-text controls and large text |
| Families through `--font-body`, `--font-heading`, `--font-code` | Type hierarchy, readable leading, numerical comparison, and field-label associations |
| Core radius values through the existing radius roles | Consistent shape hierarchy; do not introduce a new radius per component |
| Deliberately chosen density through control/row measurements | Spacing grammar, aligned groups, usable hit areas, and content-driven growth |
| Independently chosen dark values | Dark is authored separately, not an image inversion |
| Categorical values after re-validation | Eight fixed slots, stable identity through filters, no cycling, overflow into Other |

Do not change component anatomy, focus/keyboard/announcement behavior, the spacing grammar, shared motion presets, origin/direction, spring-based travel, direct manipulation, reduced-motion alternatives, or real-state/attribution rules. A different brand still uses the studio-workbench operating model.

Do: map an action color through `--primary` and `--accent` roles. Don’t: add a private component color or replace a spring with a timed slide to match a brand mood.

## Retarget in this order

- Choose six brand colors as input, not as six interface accents. Identify an anchor, ground, selection, supportive hue, supporting neutral, and attention hue. Keep the existing primitive variable names when replacing a default; do not require each component to know the new brand’s descriptive color names.
- Map every semantic role in light mode: canvas, surface, rail, wells, hover/washes, ink, muted, decorative line, control boundary, primary pair, accent/wash, statuses/foregrounds, focus, rail states, categories, and shadows. Choose accessible derivatives rather than forcing a pale primitive into a text role. Harbor overrides roles only; its design intent is deep navy, warm sand, teal action, and apricot rail selection.
- Build dark mode as its own steps. Re-evaluate the hierarchy among rail, ground, surface, subtle, and hover; choose text/control/status values against those actual surfaces. Preserve role names and update semantic pairs together.
- Compute every actual text/background and control/background pair, including hovered/selected states and alpha compositing. List the results, not just “accessible.” Require 4.5:1 ordinary text and 3:1 essential non-text. Decorative dividers are not control boundaries. If an essential pair fails, change its role value or component pairing and re-test; do not dismiss the failure because another pair passes.
- Re-validate all categorical slots against each exact chart surface for adjacent color-vision separation and normal-vision separation. Retain labels, gaps, and a readable feed/table alternative; a separation pass does not erase mark-contrast warnings. Never recolor surviving series after filtering.
- Swap fonts only through `--font-*`. Load actual font files/weights; check fallback coverage, long names, italics, tabular figures, and every dense control. Keep labels at 13px and help at 12.5px unless the chosen face’s measured fit requires an explicit coordinated revision. Do not shrink text to hide overflow.
- If adjusting radii or density, keep the existing roles, relative hierarchy, spacing grammar, target sizes, and responsive anatomy. Make the change as a coherent token/size contract, not scattered per-component overrides. Harbor deliberately leaves these unchanged to isolate palette retargeting.
- Capture the real specimen in both themes, desktop and 390px mobile, plus focused/hovered/invalid/selected/disabled states. Look at the images, run axe and Impeccable review, fix in a batch, and recapture. Keep motion and reduced-motion evidence from the same shared behavior; palette changes do not authorize different physics.

## Apply the worked Harbor theme

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

## Verify the Harbor pair matrix

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

Harbor retains the fixed categorical palette to show that brand retargeting does not require recoloring data. Validation against the actual Harbor surfaces passes adjacent color-vision and normal-vision separation in both themes. Mark-contrast warnings remain for light slots 2/4/6 and dark slots 1/3/5: retain visible labels and the equivalent feed/table, and add a contrasting boundary/secondary encoding where a mark boundary itself is essential. Do not claim a color-vision separation pass is a universal contrast pass.

## Capture evidence and review

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
- Every role is mapped in light and independently authored in dark.
- All permitted text/control/background pairs are listed and meet their floors.
- Categories retain stable slots and pass separation validation; mark warnings have non-color reading/encoding.
- Font/radius/density changes preserve hierarchy, grammar, anatomy, target sizes, and motion.
- Both-theme desktop/mobile captures and actual-state accessibility checks are reviewed; remaining limits are explicit.

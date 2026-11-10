Use Albert Sans for interface text and IBM Plex Mono for compact numeric and code information.
Consolidate observed sizes into named roles; do not impose a ratio that Sift does not use.

# Typography

## Load the canonical families

Use `--font-body` and `--font-heading` for Albert Sans; the heading token aliases body. Use `--font-code` for IBM Plex Mono. Load `../tokens/fonts.css`: Albert Sans is self-hosted, normal and italic, variable weights 100–900; IBM Plex Mono supplies 400 and 500.

The exact body stack is `"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif`; the exact code stack is `"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`. Keep the complete fallback sequences in `tokens.css`; do not copy a second stack into a component. Use the primary family through its `--font-*` role and inherit the centrally maintained fallbacks. The heading token aliases the body token. Earlier revision prose names a different workhorse face; current stylesheet, direction, and tokens are canonical. The secondary script fallback is now loaded by `fonts.css` using unicode-range subsets, so Greek and Cyrillic characters can use the actual fallback face rather than an unfulfilled declaration.

## Apply the consolidated scale

These names consolidate the actual font sizes in Sift’s stylesheet; they are documentation roles, not additional CSS variables. Do not use the entire observed inventory as a menu for arbitrary new sizes.

| Named step | Size | Apply to |
|---|---|---|
| micro | 10px | Keyboard keys, narrow metadata; never primary task text |
| caption | 11px | Auxiliary timestamps, tiny labels |
| metadata | 12px | Compact metadata and `small` baseline |
| label | 13px | Labels and compact support text |
| help | 12.5px | Field help text |
| dense | 12.5px | Activity metadata, legend chips, compact conversation controls |
| control | 13px | Buttons, sidebar labels, board column headings, subheadings |
| body | 14px | Root text, task titles, task row titles |
| reading | 15px | Tracker introduction and contextual reading text |
| mobile-input | 16px | Mobile search, task properties, description editor |
| section | 18px | Section headings |
| figure | 21px | Real activity totals, not invented hero statistics |
| task-heading | 23px | Detail sheet task title |
| board-heading | 26px | Board title; responsive 25px |
| page-heading | 30px | General page heading; responsive 27px |
| setup-heading | 35px | Onboarding; responsive 31px and 30px |
| tracker-heading | 34px | Tracker setup; responsive 28px |
| full-task-heading | 28px | Expanded task reading surface |

Complete observed CSS size inventory, including contextual exceptions: 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 34, and 35px. Fractional steps are intentional Sift’s facts, not an implied fractional scale. Examples: 17px week-day number, 14.5px mobile activity title, 10.5px mobile week-day label, 22px Markdown heading, and 24px rail wordmark. Kit utility classes also carry contextual type; do not replace the product’s explicit 14px task text with a generic `text-sm` assumption.

Do: choose body/control/label for a new operating surface. Don’t: use setup-heading inside a routine settings form or shrink body text to fit a fixed-height card.

## Keep weights and rhythm deliberate

- Use 400 for body, 500 for medium controls, 550 for field labels, 600 for headings, and 650 only for Sift’s emphasized wordmarks, activity values, and small headings. Use variable weights rather than synthetic bold. The actual declared interface weights are 400, 500, 550, 600, and 650; the font-face range is not a request to use every weight.
- Use the root 1.5 line height. Use 1.65 for task-card reading text and 1.6 for compact task rows; allow wrapping and height growth.
- Keep the page headline at 1.2 / -0.035em; section headings at -0.02em; board heading at 1.25; full task heading at 1.3 / -0.025em. Setup heading uses 1.18 / -0.035em; tracker heading uses 1.12 / -0.02em.
- Sift’s line-height inventory is 1, 1.12, 1.18, 1.2, 1.22, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, and 1.9. Retain contextual reading density; do not normalize all prose to a headline’s tight leading.
- Default letter-spacing is normal/0; do not track all labels. Sift’s tracking also includes -0.04, -0.035, -0.025, -0.02, -0.01, 0.02, 0.04, 0.05, 0.06, 0.07, and 0.08em. Use positive tracking only for existing small structural eyebrows, not ordinary buttons. Activity part headings use 0.07em and uppercase; sentence case remains the general rule.

## Use numbers as information

Use IBM Plex Mono for code, counts, times, durations, IDs, keyboard keys, and dense numeric columns. Apply `font-variant-numeric: tabular-nums` wherever numbers compare or update. Do not render descriptions, task names, or paragraphs in mono merely because a helper wrote them.

Sift’s inconsistency: counts, keyboard keys, code, and tool durations explicitly use mono, but many activity times and totals use Albert Sans with tabular numerals. The brief’s canonical dense-number treatment is mono; retain the observed sans activity numerals when reproducing that exact Sift’s surface and document the choice.

## Bound prose, not work

Use Sift’s 72ch maximum for full-page task prose; let code, images, and tables use the full column. Tracker lede is 58ch. Onboarding headline is 16ch, expands to 18ch in its narrow layout; its lede uses 49ch and 48ch contextually. Mobile page support copy uses 37ch. Do not invent a universal line measure or truncate a task’s only readable title; clamp only where a full-detail path exists.

## Checklist

- Albert Sans loads in normal and italic; no synthetic font styles appear.
- Task text remains 14px and wraps without clipping.
- Numeric comparisons use tabular figures; dense numeric labels use the intended mono treatment.
- Headline tracking/leading follows its role rather than a generic utility default.
- Full-page prose respects 72ch without constraining code, tables, or images.

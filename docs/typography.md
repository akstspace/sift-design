Use Albert Sans for interface text and IBM Plex Mono for code and compact numbers. Choose from the sizes below and leave enough room for text to wrap.

# Typography

## Load the fonts

Use `--font-body` and `--font-heading` for Albert Sans; the heading token aliases body. Use `--font-code` for IBM Plex Mono. Load `../tokens/fonts.css`: Albert Sans is self-hosted, normal and italic, variable weights 100–900; IBM Plex Mono supplies 400 and 500.

The body font stack is `"Albert Sans", "IBM Plex Sans Variable", system-ui, sans-serif`; the code stack is `"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`. Keep fallback fonts in `tokens.css`, not in individual components. Use the `--font-*` variables so all components inherit the same fonts. Headings use the body font. `fonts.css` also loads IBM Plex Sans subsets for Greek and Cyrillic characters.

## Choose a text size

Use the shared hierarchy below across products. These names are documentation roles, not extra CSS variables. Choose by information hierarchy rather than by a feature’s name, and do not assume a framework utility matches the intended size.

| Named step | Size | Apply to |
|---|---|---|
| micro | 10px | Short keyboard hints or narrow auxiliary metadata; never essential instructions or primary content |
| caption | 11px | Auxiliary timestamps, tiny labels |
| metadata | 12px | Compact metadata and `small` baseline |
| label | 13px | Labels and compact support text |
| help | 12.5px | Field help text |
| dense | 12.5px | Compact metadata, legend chips, secondary conversation controls |
| control | 13px | Buttons, navigation labels, group headings, subheadings |
| body | 14px | Root text, item names, descriptions, record titles |
| reading | 15px | Optional introductory or contextual reading text |
| mobile-input | 16px | Mobile search, form inputs, text editors |
| section | 18px | Section headings |
| figure | 21px | Meaningful totals or values, such as a balance or result count |
| page-heading | 30px | General page heading |

Use the body, control, label, and heading roles first. A content-heavy article or an unusual display may need a deliberate reading treatment, but a larger headline should not appear in every routine form. Never shrink text to fit a fixed-height card or make a number prominent simply because the screen has space.

## Set weight, line spacing, and letter spacing

- Use 400 for body, 500 for medium controls, 550 for field labels, and 600 for headings. Reserve 650 for selective emphasis such as a wordmark or a key value, not every label. Use variable weights rather than synthetic bold; the font-face range is not a request to use every weight.
- Use the root 1.5 line height. The longer card-text preset uses 1.65 and compact multi-line rows use 1.6; allow wrapping and height growth. Do not give prose a headline’s tight leading.
- Keep the page headline at 30px / 600 / 1.2 / -0.035em and section headings at 18px / 600 / 1.5 / -0.02em. Use 13px / 600 for subheadings and 13px / 550 for field labels.
- Default letter-spacing is normal/0. Do not track ordinary buttons or labels. Sentence case is the general rule; a small structural eyebrow may use uppercase with 0.07em tracking when that distinction is useful, not as a universal heading treatment.

## Make numbers easy to compare

Use IBM Plex Mono for code, counts, times, durations, IDs, keyboard keys, and dense numeric columns. Apply `font-variant-numeric: tabular-nums` wherever numbers compare or update: prices in a comparison, balances in a ledger, chart values, or message times. Keep units, currencies, and decimal precision clear and aligned. Do not render product names, article text, messages, or descriptions in mono because they sit beside a number or were generated automatically.

Use locale-aware formatting for dates, currency, and quantities. Equal-width digits help comparison; they do not justify changing the meaning or precision of a value.

## Keep paragraphs at a readable width

Use a 72ch maximum for full-page prose; let code, images, and tables use the full available column. A chat bubble, product summary, or form hint should fit its own context rather than being stretched to that measure. Do not truncate the only readable item name or instruction; clamp a summary only when the complete content is accessible elsewhere.

## Optional composition presets

These larger treatments are available for a distinct detail, collection, or introductory surface. They are not extra levels that every product must use, and responsive sizes are presets to test rather than mandatory breakpoints.

| Role | Size | Line height / tracking | Compact variant |
|---|---|---|---|
| Detail-panel title | 23px | Inherit readable heading rhythm | Wrap rather than shrink to one line |
| Collection heading | 26px | 1.25 | 25px |
| Expanded detail heading | 28px | 1.3 / -0.025em | Wrap as needed |
| Page heading | 30px | 1.2 / -0.035em | 27px |
| Introductory heading | 35px | 1.18 / -0.035em | 31px or 30px |
| Compact introduction heading | 34px | 1.12 / -0.02em | 28px |

For short introductory copy, reference measures include a 58ch lead, a 16ch heading widening to 18ch in a stacked layout, a 49ch or 48ch lead, and 37ch narrow-screen support copy. Use only the measure that helps the actual text; these are not universal widths for headings, checkout instructions, or messages.

## Checklist

- Albert Sans loads in normal and italic; no synthetic font styles appear.
- The 14px body baseline and intended text roles are preserved; content wraps without clipping.
- Numeric comparisons use tabular figures; dense numeric labels use the intended mono treatment.
- Headline tracking/leading follows its role rather than a generic utility default.
- Full-page prose respects 72ch without constraining code, tables, or images.

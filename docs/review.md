Check the finished interface, not just the code. Review screenshots, keyboard behavior, animations, and accessibility results, then report what you tested and what remains uncertain.

# Review

Use this process for UI built with Sift Design. Review against the product’s purpose and supported features; a reference screen is not a checklist of tasks, timelines, automations, or navigation to add.

Keep the review bounded: one main review, one batch of fixes, and at most one confirmation round. Report remaining issues rather than repeating open-ended polish passes.

## Tools

- [Impeccable](https://impeccable.style/) by Paul Bakaus ([source](https://github.com/pbakaus/impeccable)) supplies the design context, the anti-pattern detector, and the critique and audit references used below. Install it into the project you are reviewing with one of:

  ```sh
  npx impeccable install              # project CLI
  npx skills add pbakaus/impeccable   # as an agent skill
  ```

  Installation paths depend on the agent and installation method. Use the base directory reported by the loaded skill and follow its current instructions rather than assuming a launcher exists at one fixed path. See [impeccable.style](https://impeccable.style/) for current setup guidance.
- [`scripts/capture.mjs`](../scripts/capture.mjs) in this repo builds an app, serves it, and captures stills, timestamped filmstrips and real-time clips, with optional axe-core checks. It uses the installed Google Chrome through Playwright.

## Read the project guidance first

Read the consuming project’s brief, its `PRODUCT.md` and `DESIGN.md` when present, and the relevant system guides. Preserve the agreed palette, typography, spacing, and motion. Evaluate features, data, storage, and layout against that product’s requirements—not against the fictional block app.

For reference captures of this repository’s existing Larkspur blocks, also read [`blocks/_shared/LARKSPUR.md`](../blocks/_shared/LARKSPUR.md). Other products keep their own names and content; public examples must not expose private information.

Run Impeccable’s context command once at the start, from the project root, with the screen or component you are reviewing as the target. With `<skill-dir>` replaced by the installed skill base directory:

```sh
node <skill-dir>/scripts/context.mjs --target src/App.tsx
```

Read Impeccable's `reference/craft-floor.md` before UI edits and `reference/animate.md` before motion work. Use `reference/critique.md` to assess the design and rank issues, and `reference/audit.md` for technical checks. The shared design tokens take priority over framework defaults.

Keep the change scoped. Do not edit shared tokens or kit components as a side effect of reviewing one screen; report a missing or wrong token instead.

## Run the build and code checks

Use the consuming project’s typecheck, build, and tests for the changed UI. Do not replace its stack to match this reference repo. For a block in this repository, the equivalent commands are:

```sh
npx tsc --noEmit -p blocks/<block>
npx vite build blocks/<block>
```

Run the detector once the UI is ready for review, scoped to the files you changed:

```sh
node <skill-dir>/scripts/detect.mjs --json blocks/<block>/src
```

Replace that target with the actual changed files or directories; include kit sources only if the kit was changed. The detector can flag issues, but it cannot approve a finished interface. Review its findings alongside the screenshots and accessibility results, then fix issues together. Explain false positives; deliberate exceptions in this repo are recorded in `.impeccable/config.json`.

For guidance-only changes, review the written targets for clear terminology, accurate APIs, working references, and consistency. Run `git diff --check -- <changed-files>`. If token values, JSON, schema, or exports are affected, validate those artifacts and their agreement with the source tokens. The Impeccable detector is a UI-code check, not proof of documentation quality. Do not run unrelated app builds or claim screenshot or axe results for a prose-only change. If a change also alters the documentation renderer or its layout, review that UI separately.

## Capture the interface

Use the consuming project’s capture setup. For this repository’s runnable examples, the header of `scripts/capture.mjs` documents the shot format. From the repo root:

```sh
node scripts/capture.mjs <example> --shots shots.mjs --axe
```

The script builds and serves the app; `--no-build` reuses the last private capture build if it exists, and `--only name-a,name-b` limits the shots. Output goes to `screenshots/<example>/`, and axe results go to `axe.json`, or `<shots-name>-axe.json` for a named shots file. A clean exit does not prove the render looks right or that every state was tested. Inspect the report itself as well as the images.

Capture light and dark stills at desktop size and at 390px wide. Check 360px wherever the layout could overflow, plus any other widths and devices required by the product. Test reflow and enlarged text separately; a mobile screenshot alone does not prove WCAG conformance. In this repo, set the theme with `?theme=dark` or the `.dark` class, not only the system color scheme; another app may use a different theme control.

Choose representative states from features the product actually has. Include applicable cases such as:

- empty, no matches, unavailable data, or restricted access;
- loading, saving, or reconnecting;
- errors and recovery;
- selection, changed data, or consequential attribution;
- long labels, translated text, and realistic content extremes;
- an open overlay, if one exists;
- keyboard focus;
- reduced motion.

Do not add a board, connection test, agent history, schedule, or other feature solely to create a review state. Use fictional or approved nonprivate data in public evidence, and avoid credentials or private records. Keep the existing fictional Larkspur content when capturing those repository blocks; other products do not need to adopt that world.

## Capture motion separately

Use `filmstrip` for deterministic, timestamped PNG strips and `video` for real-time clips:

```js
// Separate shot entries: the capture script chooses one motion mode per shot.
export default [
  {
    name: "panel-filmstrip",
    filmstrip: {
      trigger: async (page) => { /* activate the real control */ },
      frames: [0, 60, 120, 200, 360],
    },
  },
  {
    name: "panel-motion",
    video: {
      trigger: async (page) => { /* activate the real control */ },
      duration: 1200,
    },
  },
];
```

Set `reduced: true` for reduced-motion shots, and include the exact boundary frames of a recipe when they matter (see [motion](motion.md)).

A strip should show:

- continuity, with no blank frame;
- sheets that are opaque before their travel ends;
- entry and exit behavior matching the chosen component or helper;
- persistent navigation that stays still during content transitions, if the layout has it.

A clip should reveal interruption, repeated navigation, spring settling, and any unwanted scroll or layout jump. A still cannot show any of these.

Open every screenshot and strip you report as reviewed. Use timestamped strips to examine each stage and real-time clips to judge continuity and perceived timing. If playback is unavailable, say so rather than claiming to have watched a clip.

## Critique, audit and fix in batches

- **Review clarity:** can someone find the information or action they came for? Check hierarchy, labels, grouping, readable spacing, and useful next steps. A reader should support reading, a store should support product decisions, and analytics should support accurate comparison. Judge the layout against the brief, not a preference for a workbench, dashboard, or chat layout.
- **Audit** these in their actual states:
  - semantics and keyboard paths;
  - contrast;
  - focus visibility and focus return;
  - reduced motion;
  - touch target size;
  - responsive overflow;
  - zoom, text enlargement, reflow, and forced colors;
  - live regions;
  - errors and draft preservation;
  - honest data and attribution.

  Axe supplements this review; it does not replace it.
- **Review motion** against the token recipes and actual component contract, not against a still. Where the feature exists, try:
  - rapid reversal;
  - navigating during an exit;
  - interrupting an open or close;
  - scrolling while updates arrive;
  - an edit, selection, or drag in progress when live data updates.
- **Rank** findings with Impeccable's severity guidance. Record the location, what you observed, the consequence and a concrete fix. Do not present a preference as blocking without evidence from the reference.
- **Fix** issues together, then capture and check again. Use one main review and at most one confirmation round. Stop and report any remaining issue rather than repeating small polish passes.

Get axe to zero violations in the captured shots. Do not call a surface clean while a known actionable finding remains, and name any browser, device, interaction or dependency you did not test.

## Before calling it done

A UI change is done when the surface:

- uses the shared design tokens;
- follows the product’s actual rules;
- passes typecheck and build;
- has evidence in both themes and on mobile;
- has reviewed motion and reduced-motion evidence where motion is involved;
- has zero axe violations in its captured states;
- has no known actionable finding within the agreed scope.

Keep the evidence and report what you actually exercised; do not claim universal perfection.

A guidance-only change is done when:

- language distinguishes shared design rules from optional example behavior;
- APIs, technical explanations, and relative links are accurate;
- any documented values match the source tokens;
- guidance agrees across files;
- scoped whitespace checks pass and any remaining inconsistency is reported.

A token-export change additionally needs parsing, schema, and source-value checks for its affected artifacts. Document discrepancies with the shared source or shipped implementation instead of silently changing values.

Screenshot and axe claims do not apply to a change that renders no UI.

Report the files changed, screenshot names where relevant, review rounds and findings, the final state, the axe result, remaining limits, and any token or kit changes you recommend but did not make.

## Checklist

- [ ] Context and the relevant Impeccable references were loaded before work started.
- [ ] Product requirements, not an example app’s feature set, define the review scope.
- [ ] Changed targets pass typecheck and build, or the applicable documentation and schema checks.
- [ ] UI detector findings were resolved or explained, or the check is marked inapplicable for prose-only work.
- [ ] For UI changes, evidence covers both themes, 390px mobile, important supported states, and motion and reduced motion where relevant.
- [ ] For UI changes, axe is at zero for captured states and manual checks cover what axe cannot.
- [ ] The review rounds ended cleanly, or stopped with the blocker stated.
- [ ] The final report separates verified evidence from untested claims.

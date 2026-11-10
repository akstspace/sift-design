Sign off UI with a bounded loop: load context, detect, critique, audit, fix, re-capture.
Judge real screenshots, filmstrips, keyboard checks and axe results, and report the scope and remaining limits honestly.

# Review

Every example in this repo was signed off with this process. Use it for UI built with Sift Design.

## Tools

- [Impeccable](https://impeccable.style/) by Paul Bakaus ([source](https://github.com/pbakaus/impeccable)) supplies the design context, the anti-pattern detector, and the critique and audit references used below. Install it into the project you are reviewing with one of:

  ```sh
  npx impeccable install              # project CLI
  npx skills add pbakaus/impeccable   # as an agent skill
  ```

  In Claude Code you can also run `/plugin marketplace add pbakaus/impeccable` and install it from the plugin menu. Once installed, its launcher is at `.agents/skills/impeccable/scripts/impeccable` inside the project. See [impeccable.style](https://impeccable.style/) for current instructions.
- [`scripts/capture.mjs`](../scripts/capture.mjs) in this repo builds an app, serves it, and captures stills, timestamped filmstrips and real-time clips, with optional axe-core checks. It uses the installed Google Chrome through Playwright.

## Load the fixed context first

Read `PRODUCT.md`, `DESIGN.md`, the topic docs for what you built, and, for example content, [`blocks/_shared/LARKSPUR.md`](../blocks/_shared/LARKSPUR.md). The visual direction is already decided by the tokens, so use Impeccable's scan/context mode rather than a new art-direction interview.

Run the context command once at the start, from the project root, with the screen or component you are reviewing as the target:

```sh
.agents/skills/impeccable/scripts/impeccable context --target src/App.tsx
```

Read Impeccable's `reference/craft-floor.md` before UI edits and `reference/animate.md` before motion work. Use `reference/critique.md` for judgment and severity and `reference/audit.md` for systematic checks. Do not let a framework default override the normative tokens.

Keep the change scoped. Do not edit shared tokens or kit components as a side effect of reviewing one screen; report a missing or wrong token instead.

## Build and check mechanically

Typecheck and build what you changed:

```sh
npx tsc --noEmit -p blocks/<block>
npx vite build blocks/<block>
```

Run the detector once the UI is ready for review, scoped to the files you changed:

```sh
.agents/skills/impeccable/scripts/impeccable detect --json blocks/<block>/src packages/ui/src
```

Detector output is evidence, not sign-off. Fix actionable findings together with the visual and audit batch. If a finding is a false positive, say why; deliberate exceptions in this repo are recorded with their reasons in `.impeccable/config.json`.

For documentation-only changes, run the detector over the written targets and check that token files, JSON and schema agree. Do not claim screenshot or axe results for a change that renders no UI.

## Capture the real surface

The header of `scripts/capture.mjs` documents the shot format. From the repo root:

```sh
node scripts/capture.mjs <example> --shots shots.mjs --axe
```

The script builds and serves the app; `--no-build` reuses the last build, and `--only name-a,name-b` limits the shots. Output goes to `screenshots/<example>/`, and axe results go to `axe.json`, or `<shots-name>-axe.json` for a named shots file. A clean exit does not prove the render looks right or that every state was tested.

Capture light and dark stills at desktop size and at 390px wide. Layouts must also hold at 360px, so check that width wherever the surface could overflow. Set the theme with `?theme=dark` or the `.dark` class, not only the system color scheme.

Capture representative real states:

- empty, and empty because of a filter;
- loading and connection grace periods;
- errors and recovery;
- helper attribution, and running, paused and needs-action states;
- long labels;
- an open overlay;
- keyboard focus;
- reduced motion.

Use the fictional Larkspur content. Never show a real product, company or person in an example.

## Capture motion separately

Use `filmstrip` for deterministic, timestamped PNG strips and `video` for real-time clips:

```js
filmstrip: {
  trigger: async (page) => { /* activate the real control */ },
  frames: [0, 60, 120, 200, 360],
}
video: {
  trigger: async (page) => { /* activate the real control */ },
  duration: 1200,
}
```

Set `reduced: true` for reduced-motion shots, and include the exact boundary frames of a recipe when they matter (see [motion](motion.md)).

A strip should show:

- continuity, with no blank frame;
- sheets that are opaque before their travel ends;
- an exit faster than the entry;
- a shell that stays still.

A clip should reveal interruption, repeated navigation, spring settling, and any unwanted scroll or layout jump. A still cannot show any of these.

Open and look at every screenshot and strip you report as reviewed. Judge timing from strips; clips are for people.

## Critique, audit and fix in batches

- **Critique** the rendered surface against the studio-workbench direction: task hierarchy, useful density, bounded search, attached context, restrained color and real state. Reject stock demo or dashboard composition and unnecessary framing.
- **Audit** these in their actual states:
  - semantics and keyboard paths;
  - contrast;
  - focus visibility and focus return;
  - reduced motion;
  - touch target size;
  - responsive overflow;
  - live regions;
  - errors and draft preservation;
  - honest data and attribution.

  Axe supplements this review; it does not replace it.
- **Review motion** against the token recipes, not against a still. Try these:
  - rapid reversal;
  - navigating during an exit;
  - interrupting an open or close;
  - scrolling while updates arrive;
  - an edit or drag in progress when a batch lands.
- **Rank** findings with Impeccable's severity guidance. Record the location, what you observed, the consequence and a concrete fix. Do not present a preference as blocking without evidence from the reference.
- **Fix** actionable findings in one batch, then re-capture and review again. Stop when a round has no actionable finding, or after five rounds. If a round makes no progress, stop and report the blocker.

Get axe to zero violations in the captured shots. Do not call a surface clean while a known actionable finding remains, and name any browser, device, interaction or dependency you did not test.

## Definition of done

A UI change is done when the surface:

- uses the normative tokens;
- matches the product semantics;
- passes typecheck and build;
- has evidence in both themes and on mobile;
- has reviewed motion and reduced-motion evidence where motion is involved;
- has zero axe violations in its captured states;
- has no known actionable finding within the agreed scope.

Keep the evidence and report what you actually exercised; do not claim universal perfection.

A documentation or token-export change is done when:

- the sections, schema and JSON parse correctly;
- values match `tokens/tokens.css` exactly;
- guidance agrees across files;
- every discrepancy with the shipped product is noted.

Screenshot and axe claims do not apply to a change that renders no UI.

Report the files changed, screenshot names where relevant, review rounds and findings, the final state, the axe result, remaining limits, and any token or kit changes you recommend but did not make.

## Checklist

- [ ] Context and the relevant Impeccable references were loaded before work started.
- [ ] Changed targets pass typecheck and build, or the documentation and schema checks.
- [ ] Detector findings were resolved or explained.
- [ ] UI evidence covers both themes, 390px mobile, the important states, and motion and reduced motion.
- [ ] Axe is at zero for the captured states, and manual checks cover what axe cannot.
- [ ] The review rounds ended cleanly, or stopped with the blocker stated.
- [ ] The final report separates verified evidence from untested claims.

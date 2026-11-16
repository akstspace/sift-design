# Building on ui-sdk

ui-sdk is a library of unstyled React components. Each component handles keyboard input, focus and the ARIA attributes for screen readers. It renders no styles, so Sift Design can give its parts the Sift look and motion.

Most kit components are shadcn/ui components on Radix primitives. Three kit components are built on ui-sdk parts: [Meter](../packages/ui/docs/display.md#meter), [Segmented control](../packages/ui/docs/controls.md#segmented-control) and [Timeline](../packages/ui/docs/display.md#timeline). This guide explains when to use ui-sdk and how to style a ui-sdk part so that it matches the kit.

ui-sdk is in beta, and its API can change between releases. Always use the newest release (see [Use the newest version](#use-the-newest-version)). The kit uses `0.1.0-beta.5`, pinned at that exact version.

## Choose the source of a component

Use the first option that fits.

1. **The kit has the component.** Copy the kit version, for example `@sift-design/ui/select`. Do not use the ui-sdk version of a component that the kit has. The names of their parts clash (see below).
2. **The kit has a ui-sdk version.** Copy `meter`, `segmented-control` or `timeline` from `packages/ui/src/components/`. Install ui-sdk first.
3. **Only ui-sdk has the component.** Use the ui-sdk component and style it with this guide. These ui-sdk components have no kit version: Autocomplete, Color Picker, Date Input, Date Picker, File Input, Image Cropper, Listbox, Number Input, Password Input, Rating, Time Input, Token Input, Toolbar, Tree, Trigger Menu and Waterfall.
4. **Neither has the component.** Build it from `@ui-sdk/core` behaviors. Search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` in the same folder.

The kit already has its own Label, dropdown menu, one-time code input and toasts. Use those instead of the ui-sdk Label, Menu, OTP Input and Toast.

## Set up a project

Find the newest release first. While ui-sdk is in beta, use the higher of the `latest` and `beta` versions:

```bash
npm view @ui-sdk/react dist-tags
```

Install both packages at that same exact version with the project's package manager. For example, for `0.1.0-beta.5`:

```bash
npm install --save-exact @ui-sdk/react@0.1.0-beta.5 @ui-sdk/core@0.1.0-beta.5
```

If a release-age policy blocks the install, stop and ask the user. Do not change the policy.

ui-sdk adds a little CSS for behavior, for example to keep a closed popup hidden. It adds this CSS in a cascade layer named `ui-sdk`. Declare that layer on the first line of the app stylesheet, above Tailwind, so the kit and the app always win over it:

```css
@layer ui-sdk;

@import "tailwindcss";
@import "./theme.css";
```

Do not import `@ui-sdk/core/web.css`. It is ui-sdk's default look, with its own colors, sizes and icons. Sift styles every part itself. Do not load `web.js` or `web.css` from the ui-sdk website either. Sift Design loads no remote assets at runtime.

## Check for shared part names

ui-sdk marks each part with a `data-slot` attribute, such as `meter-indicator`. The kit styles its own parts by `data-slot` across the whole page. When a ui-sdk part has the same slot name as a kit part, the kit styles also apply to the ui-sdk part. Props cannot rename a slot, and `createParts` keeps the slot names too.

Before you use a ui-sdk component, run the check:

```bash
node scripts/check-ui-sdk-slots.mjs rating tree
```

It lists each slot name that a component shares with the kit, and the kit files that style it. It exits with 1 when a component shares a name. For components that the kit wraps, it gives the kit import instead. `--all` checks every ui-sdk component. Every ui-sdk component that shares a name has a kit version, so step 1 above prevents the clash.

## Style a part the Sift way

Wrap each part in a small kit component, as `packages/ui/src/components/meter.tsx` does. Keep the ui-sdk export names, props and behavior, so that the ui-sdk docs still apply. Then follow these rules:

- **Use the kit's semantic classes.** For example, use `bg-muted`, `bg-background`, `text-muted-foreground`, `border-input` and `ring-ring`, the kit radii, and the 13px and 12px type sizes. Use `font-mono` with `tabular-nums` for values, counts and times. Do not use raw hex colors.
- **Merge class names.** A ui-sdk `className` can be a string, or a function of the part's state. Keep both forms working. The kit components use a small `withBase` helper for this.
- **Style the state attributes.** ui-sdk uses attributes that are present or absent, such as `data-checked`, `data-open`, `data-pressed` and `data-disabled`. Radix uses values such as `data-state="checked"`. Do not reuse a kit selector that tests `data-state`. Write the ui-sdk attribute instead. Tailwind variants work: `data-checked:text-foreground`.
- **Read the measured CSS variables in CSS.** ui-sdk writes measurements such as `--segmented-control-indicator-left` and `--transform-origin` on the element after it measures. They are not React props. Read them in a stylesheet.

Each component page in `node_modules/@ui-sdk/react/docs/components/` lists its parts, its state attributes and its CSS variables under **Styling** and **Data Attributes**.

## Give it Sift motion

Use the motion tokens in `tokens/motion.ts` and their CSS twins: `--spring-*`, `--spring-*-duration`, `--dur-quick` and `--dur-instant`. Animate transform and opacity. Exits are shorter than entrances and do not overshoot. Every motion can be interrupted. Under reduced motion, remove travel and scale, and keep short fades. The three kit components show the main patterns:

- **A box that ui-sdk measures.** The segmented control indicator reads ui-sdk's variables in CSS: `translate`, `width` and `height`. It moves on `--spring-smooth`. The transition starts after the first frame, so the page loads without a slide.
- **A size that ui-sdk sets inline.** The meter indicator gets an inline `width`. The kit indicator uses `render` to keep the full width and scale with Motion instead. It rises on `spring.smooth` and falls on `spring.exit`.
- **A state change.** Timeline markers and connectors use CSS transitions on ui-sdk's `data-complete`, `data-current` and `data-upcoming` attributes. A CSS transition does not run on the first render, and it reverses from where it is.
- **A new item in a list.** `TimelineItem` uses `render` with a Motion element and `arrivalMotion`. Only items that were just added get `arrival`.
- **A popup.** ui-sdk popups get `data-starting-style` before they enter and `data-ending-style` while they leave. They stay mounted until the exit ends. Enter on `--spring-smooth` from `scale: 0.94` and `opacity: 0`. Leave on `--spring-exit`. Set `transform-origin: var(--transform-origin)`.

A `render` function receives the part's props and state. Forward every prop to the element you return. Keep the attributes that the part manages, such as its role, `tabindex`, `data-slot` and state attributes.

## Agents that use the page

ui-sdk can let an agent read and operate the components on a page, through `createAgent` and WebMCP tools. The guide is `node_modules/@ui-sdk/react/docs/agents.md`. When a product uses this, follow the Sift rules for agents: name the agent behind each change, and say what it did in plain words. Ask before an agent makes a change that the user cannot undo. ui-sdk has permissions and an undo history for this.

## The ui-sdk skill

The ui-sdk skill for coding agents is in `.claude/skills/ui-sdk/`. `skills-lock.json` records its source and version. To restore or update it, run `npx skills experimental_install` or `npx skills update ui-sdk`.

The skill is written for any project. In this repo, the Sift rules win where the two differ:

- Sift styles every part. Do not use `web.css`, its `--ui-*` tokens or the remote `web.js`.
- Exported kit components keep a one-line JSDoc summary, because the component index reads it. The skill's advice against JSDoc applies to app code only.
- Review with [docs/review.md](review.md): captures in both themes and at 390px, recorded motion and zero axe violations. The keyboard and ARIA tests that the skill describes are welcome in addition.

## Use the newest version

Always build on the newest ui-sdk release. Check for one before you install ui-sdk, before you change code that uses it, and before you add a ui-sdk component.

1. Run `npm view @ui-sdk/react dist-tags`. While ui-sdk is in beta, the newest release is the higher of `latest` and `beta`. After a stable release, use `latest`.
2. If it is newer than the installed version, install `@ui-sdk/react` and `@ui-sdk/core` at that same exact version. If a release-age policy blocks the install, stop and ask the user. Do not change the policy.
3. Learn what changed. ui-sdk publishes no separate changelog. Its docs ship in each package and match that version. Read `node_modules/@ui-sdk/react/docs/llms.txt` again. Then read the page of each ui-sdk component the project uses, and check its Styling, Data Attributes and API Reference sections against the code.
4. Update the skill with `npx skills update ui-sdk`.
5. Run `node scripts/check-ui-sdk-slots.mjs --all`. A new version can add parts with new slot names.
6. Typecheck. Capture the demos of every ui-sdk component with their motion, in both themes and at 390px, and check them with axe.
7. Update the version in this guide.

# Larkspur first run & settings

A local-first workspace for Fernbrook Greenhouse. This example follows the welcome → connections → defaults → optional setup → first helper → workspace handoff. Settings cover theme, motion, notifications, startup, timezone, backups, retention, and an update notice.

## Run

```sh
npm run dev -w @larkspur/onboarding
```

Open http://localhost:5306. Capture everything with `node scripts/capture.mjs onboarding --axe` from the repository root. Typecheck with `npx tsc --noEmit -p blocks/onboarding`.

## Behavior

- `?step=welcome|connections|defaults|optional|helper` opens a setup step.
- `?view=settings` and `?view=workspace` open the app shell. Add `&helper=Climate%20watch` to show a scheduled helper.
- `?theme=light|dark` selects the initial theme. Changing theme removes that override and persists the new choice.
- Preferences persist in browser storage. No desktop integration, real connection, backup restore, update installation, or scheduled helper execution is claimed.
- Health checks fetch deterministic JSON fixtures. The sensor fixture returns a specific failure; Retry fetches its ready response. Checking is the actual fetch lifetime, with no minimum wait, countdown, fake progress, or automatic retry. The capture harness can hold the request to inspect checking.
- Notification and startup choices are independently optional, can be left off, and are revisitable in Settings. Skipping optional setup resets both to off.
- Helper cards support pointer, Tab/Space, and directional keys. Back/forward and browser history retain local choices. Steps move focus to their heading; restore uses the kit's focus-managed confirmation.

## Components & motion

Kit: Button, Switch, Select, ToggleGroup, AlertDialog, SiblingTransition. Brand: the shared LarkspurMark, not a redrawn approximation.

The shared mark opens in three beats: the tile settles on `--spring-smooth`, the three sea blooms open from their base, bottom to top, 70ms apart, and the coral bud lands last, on the CSS `--spring-lively` tokens. The mark sits in the page, so it scrolls with the content. When setup finishes it travels into the shell rail as a shared layout (`layoutId`) on `spring.smooth`. The opening never gates input. Replay opening is available without resetting choices.

Setup steps are siblings in a sequence, so SiblingTransition (`pageMotion`) cross-fades them with a direction-aware drift; settings and the workspace use it too. The step caption beside the mark cross-fades with the step. The step highlight and helper selection use `selectionSpring`. Health labels share one grid cell and cross-fade in place on `spring.snappy`; the Retry row opens on `spring.smooth`. Theme colors themselves transition for 180ms; there is no frozen screenshot overlay or flash. The setup surface exits while the shell is revealed, without moving the settled app shell on normal navigation.

System reduced motion and the in-app Reduce preference remove assembly, travel, springs, press scaling, and spinner rotation; short state fades remain. A local PageFrame fallback handles the in-app preference because the kit's transitions currently only read the system media query. Local CSS also applies the preference to kit overlays and controls.

## Evidence

All files below live in `screenshots/onboarding/`. Desktop stills use a 1440×900 viewport and mobile stills use 390×844. Mobile stills (except viewport-bound confirmations) and settings use full-height captures so navigation, skip actions, backup, retention, and update details remain visible. `{theme}` means `light` and `dark`; `{mobile}` means both no suffix and `-mobile`.

| File | State or interaction |
|---|---|
| `01-welcome-{theme}{mobile}.png` | Opening settled, both themes and sizes |
| `02-connections-failed-{theme}{mobile}.png` | Specific sensor failure with Retry; inbox ready |
| `02-connections-checking-{theme}{mobile}.png` | Actual pending fixture requests held by the capture harness |
| `03-connections-ready-{theme}{mobile}.png` | Retry resolved ready |
| `04-defaults-{theme}{mobile}.png` | Timezone and local storage |
| `05-optional-{theme}{mobile}.png` | Independently optional preferences |
| `06-helper-{theme}{mobile}.png` | First scheduled helper selection |
| `07-settings-{theme}{mobile}.png` | Complete settings page, both themes and sizes |
| `08-restore-confirmation-{theme}{mobile}.png` | Restore confirmation |
| `09-workspace-{theme}{mobile}.png` | Honest empty workspace and scheduled helper |
| `10-reduced-opening-light{mobile}.png` | Reduced-motion mark simply present |
| `11-filmstrip-assembly.png` | Mark at 0, 70, 150, 280, 520ms |
| `11-filmstrip-push.png` | Forward step transition at those same offsets |
| `11-filmstrip-handoff.png` | Setup surface yielding to shell with continuous mark |
| `onboarding-motion-assembly{mobile}.webp` | Real-time opening assembly |
| `onboarding-motion-forward{mobile}.webp` | Forward step and traveling step indicator |
| `onboarding-motion-back{mobile}.webp` | Back a step |
| `onboarding-motion-retry{mobile}.webp` | Failed check becoming ready after Retry |
| `onboarding-motion-handoff{mobile}.webp` | Mark traveling into the workspace rail |
| `onboarding-motion-theme{mobile}.webp` | Light-to-dark palette transition |
| `axe.json` | Accessibility results for every still |

## Review

The Impeccable review corrected small labels, step naming, a mobile rail overflow, a hover contrast mismatch, and a persistent setup notice covering mobile navigation. Type sizes now use the documented ramp. The sole detector advisory is its generic bounce warning on `--spring-lively`; retained intentionally because the brief explicitly requires a spring-assembled mark and reserves lively for this first-run success moment. There are no decorative idle loops.

Final independent review: round 1 corrected focus lost on the setup/shell handoff, made the outgoing shell/setup inert, gave helper radios one Tab stop, completed in-app reduced-motion exit/press overrides, removed redundant eyebrow copy, and named settings/update actions explicitly. Round 2 expanded every setup and workspace state to both palettes and made mobile stills full-height so skip actions are documented. Round 3 found no further actionable example issue; confirmation shots remain viewport captures because their fixed overlays belong to the viewport, not the whole document.

Validation: TypeScript and production build pass. Final evidence comprises 42 stills, 3 filmstrips, and 12 animated WebPs; `axe.json` reports zero violations across all 42 stills. Pointer-driven setup, retry, rapid back/forward, optional skip, arrow-key helper selection, workspace handoff, timezone change, restore cancel/focus return, theme change, and reduced-motion dismissal were exercised at desktop and 390px widths without horizontal overflow. Review was single-context; no independent delegated assessments were run.

Kit limitation, not changed here: `packages/ui/src/components/toggle-group.tsx:45–58` reads only the system reduced-motion query for its shared selection layoutId; `packages/ui/src/components/page-transition.tsx:28` has the same system-only preference. The example supplies its own page fallback and CSS overrides, but a kit-level app preference would avoid these local accommodations. A continuous shared-brand anchor and an asynchronous connection row remain possible reuse candidates.

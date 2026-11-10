# @sift-design/ui

Every [shadcn/ui](https://ui.shadcn.com) component (new-york style, CLI 4.23.0, Radix via `radix-ui`, Tabler icons), restyled to the Sift Design tokens, with motion on by default. There are three additions: `page-transition` (sibling and push/pop page changes), `scroll-title` (a title that shrinks into the header on scroll) and `time-picker` (a time field with snapping hour and minute columns, in place of the browser's time input).

## Use it in another project

1. Copy `tokens/` from this repo (tokens.css, fonts.css, fonts/, motion.ts).
2. Copy `src/theme.css`, `src/motion.css`, `src/motion/` and `src/lib/theme.ts`.
3. Copy the components you need from `src/components/`, along with any components they import. Use these files over stock shadcn ones; do not run `shadcn add` for components that exist here.
4. In the app stylesheet:

   ```css
   @import "tailwindcss";
   @import "./theme.css";   /* loads fonts, tokens and default motion */
   ```

5. Call `initTheme()` from `lib/theme.ts` before the first render.

Inside this repo, import components as `@sift-design/ui/<name>`, for example `@sift-design/ui/button`.

## Documentation

Each family has its own guide covering when to use each component, its anatomy and variants, and the exact motion: springs, durations and origins. Every guide also covers reduced-motion behavior, accessibility notes and a copy-ready snippet.

- [Controls and forms](docs/controls.md): button, button group, input, input group, OTP, textarea, native select, time picker, checkbox, radio group, switch, slider, toggle, toggle group, tabs, label, field, form, calendar, kbd.
- [Overlays and menus](docs/overlays.md): dialog, alert dialog, sheet, drawer, popover, hover card, tooltip, dropdown menu, context menu, menubar, navigation menu, select, combobox, command, toasts.
- [Display, layout and navigation](docs/display.md): sidebar, accordion, collapsible, card, item, table, badge, avatar, alert, empty, skeleton, spinner, progress, separator, scroll area, resizable, aspect ratio, breadcrumb, pagination, carousel, chart, attachment, bubble, marker, message, message scroller, page transition, scroll title.

All of them are shown live in the [specimen](../../specimen), with screenshots in [screenshots/specimen](../../screenshots/specimen).

## Upstream

`upstream/shadcn-4.23.0-new-york/` keeps the untouched shadcn sources these were adapted from. It is there for diffing when shadcn updates. Never import from it or copy from it.

# @sift-design/ui

Every [shadcn/ui](https://ui.shadcn.com) component (new-york style, CLI 4.23.0, Radix via `radix-ui`, Tabler icons), restyled to the Sift Design tokens, with motion on by default. There are three additions: `page-transition` (sibling and push/pop page changes), `scroll-title` (a title that shrinks into the header on scroll) and `time-picker` (a time field with snapping hour and minute columns, in place of the browser's time input).

The kit supplies appearance and interaction behavior, not an application template. Choose components for the product's content and actions; navigation, fields, data, routing, and storage remain the application's responsibility. A sidebar, task list, schedule, or conversation is optional.

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

Each group has a guide explaining when to use each component, its parts and options, and how it animates. The guides include reduced-motion behavior, accessibility requirements, and code examples you can copy.

- [Controls and forms](docs/controls.md): button, button group, input, input group, OTP, textarea, native select, time picker, checkbox, radio group, switch, slider, toggle, toggle group, tabs, label, field, form, calendar, kbd.
- [Overlays and menus](docs/overlays.md): dialog, alert dialog, sheet, drawer, popover, hover card, tooltip, dropdown menu, context menu, menubar, navigation menu, select, combobox, command, toasts.
- [Display, layout and navigation](docs/display.md): sidebar, accordion, collapsible, card, item, table, badge, avatar, alert, empty, skeleton, spinner, progress, separator, scroll area, resizable, aspect ratio, breadcrumb, pagination, carousel, attachment, bubble, marker, message, message scroller, page transition, scroll title.
- [Charts](docs/charts.md): the chart component, its motion and data table, and a Sift version of every shadcn/ui chart block (area, bar, line, pie, radar, radial, tooltip).

Try every component in the [examples app](../../specimen). Its fictional greenhouse tasks, helpers, and browser-saved drafts demonstrate the components; they are not requirements for another product. Reference screenshots are in [screenshots/specimen](../../screenshots/specimen).

## Upstream

`upstream/shadcn-4.23.0-new-york/` keeps the untouched shadcn sources these were adapted from. Its `charts/` folder keeps the chart blocks that the chart examples port. It is there for diffing when shadcn updates. Never import from it or copy from it.

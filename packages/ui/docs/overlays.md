# Overlays and menus

Use these components with the kit theme imported once in your app:

```css
@import "tailwindcss";
@import "@sift-design/ui/theme.css";
```

All motion is on by default; no provider or animation wrapper is needed. Components retain the shadcn composition API and their primitive's focus, dismissal, collision detection and keyboard behavior. Import components from `@sift-design/ui/<component>`, not the pristine upstream folder.

## Shared surfaces and motion

Floating surfaces use `--surface`, `--ink`, a `--line` hairline and `--shadow-float`. The hairline is intentional: it separates dark floating surfaces from the dark work surface. Menu rows are at least 32px high, with 8px highlight radii. Highlights are immediate; no transition trails keyboard navigation. Destructive actions use `--danger`. Shortcut legends use the 12px IBM Plex Mono code step, a quiet fill and a hairline, not decorative letter spacing. Focus uses `--focus-ring` in both themes.

Exact easing names throughout this document:

- **settle** = `cubic-bezier(0.16, 1, 0.3, 1)`.
- **leave** = `cubic-bezier(0.4, 0, 1, 1)`.
- **linear** = `linear`.

Spring curves are normative tokens, not independently tuned approximations:

| Role | CSS curve | Physical preset | Complete sampled duration |
|---|---|---|---|
| Anchored surfaces, alerts, toast stack | `--spring-snappy` | `spring.snappy`, visualDuration .2s, bounce .12 | `--spring-snappy-duration` = 358ms |
| Dialogs, desktop sheets | `--spring-smooth` | `spring.smooth`, visualDuration .28s, bounce 0 | `--spring-smooth-duration` = 538ms |
| Sheet/Drawer full-edge travel | `--spring-travel` | `spring.travel`, visualDuration .3s, bounce 0 | `--spring-travel-duration` = 572ms |
| Sheet/Drawer spatial exits | `--spring-exit` | `spring.exit`, visualDuration .16s, bounce 0 | `--spring-exit-duration` = 335ms |

The complete sampled durations include the almost-still spring tail; they are not the perceived response time. Input and focus never wait for that tail.

The **anchored preset** grows from **scale .94 to 1** with `--spring-snappy`, 4px side-aware travel, and **100ms linear opacity**. `@starting-style` supplies the initial transform; CSS transitions reverse from the current transform mid-flight. Closing targets scale .97 on the same spring while **100ms leave** fades remove it quickly. Radix Presence is retained by a distinct fade-out animation, not by waiting for a transform transition. Origins use the primitive variable listed below. Reduced motion is **120ms linear fade in / 80ms linear fade out**, with no spatial transition. Submenus translate 12px out of their parent rather than scaling; each is portalled so the parent scroll container cannot clip it.

Dialogs and alerts use spring-shaped transform keyframes with independent fades because Radix owns their unmount lifetime. Reopening is immediate, with no input wait; keyframe reopening is not velocity-preserving like a direct manipulation release. Vaul owns drawer/mobile-sheet direct manipulation: pointer tracking is 1:1 toward dismissal, resisted beyond open, and release velocity/distance decide dismissal. Its inline `transition:none` during dragging is never overridden. At rest, the release uses the token spring-shaped CSS transition. Sonner retains depth stacking, hover expansion and swipe geometry with a token spring transition. Command filtering has no animation.

Closing surfaces are visual-only (`pointer-events: none`); Select's primitive inline pointer style is explicitly overridden. Closing-only modal layers release body pointer locking, without unlocking another still-open modal. The shared `useOverlayIsolation` hook mirrors primitive `aria-hidden` background isolation with native `inert` for tabbable background regions, restores previous inert values, and releases this extra isolation when the overlay closes. Radix still owns focus trapping, Escape, dismissal and eventual focus return. Its empty navigation focus proxy remains tabbable and forwards focus into content; it is not incorrectly hidden from the accessibility tree. Always regression-test your nesting arrangement and provide an opener when controlling a dialog programmatically.

## Dialog

**When:** a small, focused edit that genuinely needs protected focus. For contextual task inspection, prefer Sheet. **Anatomy:** Root → Trigger; Content includes Portal + Overlay and a close control; Header → Title + Description; body; Footer → actions/Close.

**Motion:** center origin. Dialog rises from y=8px, scale .97 on `--spring-smooth` / 538ms; opacity is a separate 140ms linear fade. Closing is a 120ms leave fade without travel. Backdrop fades 200ms in / 100ms out, linear. Reduced motion: content 120/80ms linear fades only.

**Accessibility:** provide Title and Description. Focus is trapped while open, Escape closes, and focus returns to Trigger. The 36px close button has an accessible name. Long content scrolls within `100dvh - 32px`. Do not force-mount an always-focusable hidden dialog.

```tsx
import { Button } from "@sift-design/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose } from "@sift-design/ui/dialog";

export function TaskNote() {
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline">View growing note</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>Lavender plugs</DialogTitle>
        <DialogDescription>Leave on the sheltered bench overnight.</DialogDescription></DialogHeader>
      <DialogFooter><DialogClose asChild><Button>Done</Button></DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>;
}
```

## Alert dialog

**When:** an irreversible operation requires an explicit choice. **Anatomy:** Root → Trigger; Content → Header/Title/Description + Footer/Cancel/Action. Optional Media and `size="sm"` remain supported.

**Motion:** center origin. Alert settles from scale **1.06** on `--spring-snappy` / 358ms; opacity 140ms linear. Exit 120ms leave fade. Backdrop 200/100ms linear. Reduced motion: 120/80ms linear content fades, no scaling.

**Accessibility:** Cancel receives safe initial focus. Outside click does not confirm or dismiss. Use explicit action names, identify the affected object, and style irreversible actions as destructive. Keep Cancel visible and operable.

```tsx
import { Button } from "@sift-design/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction } from "@sift-design/ui/alert-dialog";

export function DeleteTask({ onDelete }: { onDelete: () => void }) {
  return <AlertDialog>
    <AlertDialogTrigger asChild><Button variant="outline">Delete task</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Delete this task?</AlertDialogTitle>
        <AlertDialogDescription>Repair the polytunnel door runner will be removed. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Keep task</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onDelete}>Delete task</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
```

## Sheet

**When:** inspect or edit a task while preserving the board behind it. **Anatomy:** Root/Trigger → Content (Portal + Overlay + named close), Header/Title/Description, body, Footer/Close. Default side is right. `side` also accepts left, top and bottom. Sift's `overlayClassName`, custom `overlay`, `forceMount` and `asChild` escape hatches are retained; an `asChild` consumer supplies its own close control.

**Motion:** desktop edge origin (right/left/top/bottom). Arrives from 64px, scale .985 using `--spring-smooth` / 538ms; opacity reaches 1 after 140ms linear. Desktop exit is a 160ms linear fade. Below 640px, Sheet becomes a full-width bottom sheet with full-height travel from y=100%, `--spring-travel` / 572ms (visual response near 420ms); full-edge exit uses `--spring-exit` / 335ms (visual response near 200ms). It can be grabbed and dragged down, resisted above its open limit, and dismissed by distance or velocity. Reduced motion: 120/80ms linear fades, no automatic travel, scale or momentum flourish. Backdrop 200/100ms linear.

**Accessibility:** named dialog with trapped open focus, Escape and focus return; 36px dismissal target. Content scrolls within the viewport. Custom force-mounted Motion content must provide its own presence/inert handling; don't leave a hidden modal layer interactive.

```tsx
import { Button } from "@sift-design/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose } from "@sift-design/ui/sheet";

export function TaskDetails() {
  return <Sheet>
    <SheetTrigger asChild><Button variant="outline">Open task details</Button></SheetTrigger>
    <SheetContent><SheetHeader className="pr-12">
      <SheetTitle>Pot on 120 lavender plugs</SheetTitle>
      <SheetDescription>Propagation house · Due today</SheetDescription>
    </SheetHeader><p className="px-4">Move the lavender into 9cm pots.</p>
      <SheetFooter><SheetClose asChild><Button>Back to board</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>;
}
```

## Drawer

**When:** thumb-reachable mobile actions or a draggable checklist. Use Sheet for a full contextual editor. **Anatomy:** Vaul Root/Trigger → Content (Portal, Overlay, handle), Header/Title/Description, scrollable body, Footer/Close.

**Motion:** Vaul retains direction-specific full-edge translation, snap-point geometry, 1:1 pointer tracking, resistance beyond open, and velocity-based dismissal. Entry/release use `--spring-travel` / 572ms; closed spatial exits use `--spring-exit` / 335ms. Opacity keeps its separate short fade. No transform origin is needed. Background scale uses Vaul’s `[data-vaul-drawer-wrapper]` support, enabled by default unless reduced motion is requested. Wrap the application work surface in that attribute; do not include the portalled drawer itself. Reduced motion: 120/80ms fades; automatic spatial motion and background scale are removed, but deliberate dragging remains available.

**Accessibility:** supply Title, Description and a visible Close; dragging cannot be the only way out. Focus trapping/dismissal come from Vaul/Radix. Vertical drawers cap at 80vh and scroll, including on short landscape screens. Use real labeled kit controls in checklists.

```tsx
import { Button } from "@sift-design/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerDescription, DrawerFooter, DrawerClose } from "@sift-design/ui/drawer";

export function MarketActions() {
  return <Drawer><DrawerTrigger asChild><Button>Plan market crates</Button></DrawerTrigger>
    <DrawerContent><DrawerHeader><DrawerTitle>Prepare Saturday market crates</DrawerTitle>
      <DrawerDescription>Check the price cards before loading.</DrawerDescription></DrawerHeader>
      <DrawerFooter><DrawerClose asChild><Button>Done</Button></DrawerClose></DrawerFooter>
    </DrawerContent>
  </Drawer>;
}
```

## Popover

**When:** a short setting change close to its trigger. Not a replacement for a large dialog. **Anatomy:** Root/Trigger (or Anchor) → portalled Content → Header/Title/Description + controls.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform and 100ms linear opacity, 100ms leave exit fade. Origin `--radix-popover-content-transform-origin`; default offset 4px. Collision-resolved side determines entry travel. Reduced motion: 120/80ms linear fades.

**Accessibility:** Title/Description automatically share IDs with Content through context; include both, or supply explicit `aria-label`/`aria-describedby` for custom compositions. Escape/outside click close and restore trigger focus. Interactive content belongs in a Popover, never a Tooltip.

```tsx
import { Button } from "@sift-design/ui/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverTitle, PopoverDescription } from "@sift-design/ui/popover";

export function Reminder() {
  return <Popover><PopoverTrigger asChild><Button>Reminder details</Button></PopoverTrigger>
    <PopoverContent><PopoverHeader><PopoverTitle>Before closing</PopoverTitle>
      <PopoverDescription>Check the misting nozzles at 16:30.</PopoverDescription>
    </PopoverHeader></PopoverContent>
  </Popover>;
}
```

## Hover card

**When:** supplementary previews for a person or destination. Essential information must also exist on the destination. **Anatomy:** Root → focusable Trigger link → portalled Content.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform and 100ms linear opacity, 100ms leave fade out. Origin `--radix-hover-card-content-transform-origin`; offset 4px. `openDelay={200}` is a discovery threshold, not animation duration. Reduced motion: 120/80ms linear fades.

**Accessibility:** pointer hover and trigger focus both reveal it. Do not put required actions or essential form fields in the preview; use Popover for those. Preserve a real link destination.

```tsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@sift-design/ui/hover-card";

export function GrowerPreview() {
  return <HoverCard openDelay={200}><HoverCardTrigger asChild>
    <a href="/people/tomas">John Smith</a></HoverCardTrigger>
    <HoverCardContent><p className="font-semibold">John Smith</p>
      <p className="text-muted-foreground">Grower · Propagation house</p></HoverCardContent>
  </HoverCard>;
}
```

## Tooltip

**When:** optional clarification or a shortcut. Never the sole accessible name or the only place for critical instructions. **Anatomy:** Provider → Root → Trigger + portalled Content. Quiet surface and hairline replace stock inverted styling; no decorative arrow.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform and 100ms linear opacity, 100ms leave exit fade. Both instant-open and delayed-open work. Origin `--radix-tooltip-content-transform-origin`; offset 6px. Reduced motion: 120/80ms linear fades.

**Accessibility:** accessible trigger, focus/hover discovery, Escape dismissal. No interactive controls inside tooltip content. Tooltip shortcuts supplement, not replace, button labels.

```tsx
import { Button } from "@sift-design/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@sift-design/ui/tooltip";

export function SearchHint() {
  return <TooltipProvider delayDuration={300}><Tooltip>
    <TooltipTrigger asChild><Button>Search tasks</Button></TooltipTrigger>
    <TooltipContent>Find a task <kbd className="font-mono">⌘ K</kbd></TooltipContent>
  </Tooltip></TooltipProvider>;
}
```

## Dropdown menu

**When:** secondary actions behind an explicit button. **Anatomy:** Root/Trigger → Content → optional Label/Group, Item, CheckboxItem/RadioGroup, Separator, Shortcut; Sub → SubTrigger + SubContent.

**Motion:** root uses the anchored spring preset, `--spring-snappy` / 358ms transform, 100ms linear opacity and 100ms leave exit fade. Origin `--radix-dropdown-menu-content-transform-origin`. Submenus spring **12px away from their parent item**, portalled outside parent scrolling; no animated dimensions. Highlights remain instant. Reduced motion: 120/80ms linear fades at every level.

**Accessibility:** Arrow keys, Home/End, typeahead, Enter, Escape and submenu arrow navigation remain primitive-owned. Disabled actions are visibly disabled. Use `inset` for a consistent text column when mixing checkable rows with ordinary actions. Use a confirmation dialog rather than immediate deletion for irreversible actions.

```tsx
import { Button } from "@sift-design/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator } from "@sift-design/ui/dropdown-menu";

export function TaskActions({ onOpen, onArchive }: { onOpen: () => void; onArchive: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button>Task actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent><DropdownMenuItem onSelect={onOpen}>Open task</DropdownMenuItem>
      <DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={onArchive}>Archive task</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
```

## Context menu

**When:** a secondary shortcut on an existing object, with an equivalent visible action elsewhere. **Anatomy:** Root → focusable Trigger → portalled Content → items/groups/checkable items, separators, shortcuts and optional submenus.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform with 100ms linear opacity and 100ms leave exit fade. Origin `--radix-context-menu-content-transform-origin`; the pointer or focused trigger anchors it. Submenus spring 12px away from the parent in a portal. Reduced motion: 120/80ms linear fades.

**Accessibility:** use `tabIndex={0}` on a non-native trigger so Shift+F10 / the context-menu key can reach it. Keep equivalent actions available without right-click. Primitive keyboard navigation, submenu handling and Escape are unchanged.

```tsx
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@sift-design/ui/context-menu";

export function TaskContext({ onOpen }: { onOpen: () => void }) {
  return <ContextMenu><ContextMenuTrigger tabIndex={0} className="rounded-md border p-4">
    Restock the herb bench before Saturday</ContextMenuTrigger>
    <ContextMenuContent><ContextMenuItem onSelect={onOpen}>Open task</ContextMenuItem></ContextMenuContent>
  </ContextMenu>;
}
```

## Menubar

**When:** repeated application commands grouped in a stable, compact toolbar. Not general website navigation. **Anatomy:** Menubar → Menu → Trigger/Content → items, shortcuts, checkable groups or submenus.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform with 100ms linear opacity and 100ms leave exit fade. Origin `--radix-menubar-content-transform-origin`; submenus spring 12px away from their parent item. Highlights remain instant. Reduced motion: 120/80ms linear fades.

**Accessibility:** horizontal arrows switch menus; vertical arrows enter the active menu. Preserve menu semantics and use `onSelect`, not click-only handlers. Keyboard legends only advertise shortcuts that the host application implements.

```tsx
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@sift-design/ui/menubar";

export function WorkspaceMenu({ onNew }: { onNew: () => void }) {
  return <Menubar><MenubarMenu><MenubarTrigger>Work</MenubarTrigger>
    <MenubarContent><MenubarItem onSelect={onNew}>New task</MenubarItem></MenubarContent>
  </MenubarMenu></Menubar>;
}
```

## Navigation menu

**When:** related destination links, not task commands. **Anatomy:** Root → List → Item → Trigger/Content/Link; default floating Viewport is included. Optional Indicator and `viewport={false}` remain supported.

**Motion:** viewport grows from scale .94 and y=-4px with `--spring-snappy` / 358ms plus a 100ms linear fade. It leaves with a 100ms fade. Origin top left; no anchor-origin variable exists for this primitive. Contents cross-fade 140ms in / 100ms out, without animated dimensions. A shared grid cell preserves the correct paint layer inside the clipped viewport. Chevron state uses the snappy spring. Reduced motion: 120/80ms linear fades, no chevron travel.

**Accessibility:** semantic navigation landmark, real links, ArrowDown entry and native Tab sequence through the focus proxy. Visible focus rings are not removed from nested links. Give separate nav landmarks distinct labels.

```tsx
import { NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@sift-design/ui/navigation-menu";

export function AreaNavigation() {
  return <NavigationMenu aria-label="Growing areas"><NavigationMenuList><NavigationMenuItem>
    <NavigationMenuTrigger>Growing areas</NavigationMenuTrigger>
    <NavigationMenuContent><NavigationMenuLink href="/areas/propagation">Propagation house</NavigationMenuLink></NavigationMenuContent>
  </NavigationMenuItem></NavigationMenuList></NavigationMenu>;
}
```

## Select

**When:** one value from a short known set. **Anatomy:** Root → Trigger/Value → portalled Content → Group/Label/Item, optional Separator, scroll buttons. Popper positioning is the default so every selection emerges from its trigger rather than jumping to the selected row.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform with 100ms linear opacity and 100ms leave exit fade. Origin `--radix-select-content-transform-origin`, default popper offset 4px. Highlights remain instant. Reduced motion: 120/80ms linear fades. Explicit item-aligned positioning retains the primitive’s selected-row geometry instead of trigger-origin popper geometry.

**Accessibility:** label the trigger via `Label htmlFor` or `aria-label`. Arrow keys and typeahead select; disabled options remain unavailable. No shadow on the trigger; floating content uses `--shadow-float`. Large sets should use Combobox.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@sift-design/ui/select";

export function TaskPriority() {
  return <Select defaultValue="normal"><SelectTrigger aria-label="Task priority"><SelectValue /></SelectTrigger>
    <SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="normal">Normal</SelectItem>
      <SelectItem value="low">Low</SelectItem></SelectContent>
  </Select>;
}
```

## Combobox

**When:** filter a longer set by typing; supports Base UI controlled selection, multiple values and chips. **Anatomy:** Root(items) → Input (input-group + trigger/optional clear) → Content (Portal/Positioner/Popup) → List(render function)/Item + Empty. Chips/Chip/ChipsInput and `useComboboxAnchor` support multiple selection.

**Motion:** anchored spring preset, `--spring-snappy` / 358ms transform with 100ms linear opacity and 100ms leave exit fade. Base UI origin `--transform-origin`; offset 6px. Uses data-open/data-closed for exit presence. Filtering/list height never animate. Reduced motion: 120/80ms linear fades.

**Accessibility:** label the editable input; clear and chip-remove buttons have default accessible names (override with more specific names where needed). Keyboard active descendant and filtering are primitive-owned. Root preserves generic item/multiple-value types. Keep the empty result useful.

```tsx
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList,
  ComboboxItem, ComboboxEmpty } from "@sift-design/ui/combobox";

export function Assignee() {
  return <Combobox items={["Jane Doe", "John Smith", "Alex Lee", "Sam Taylor"]}>
    <ComboboxInput aria-label="Assign task" placeholder="Find a person…" showClear />
    <ComboboxContent><ComboboxEmpty>No people found.</ComboboxEmpty>
      <ComboboxList>{(person: string) => <ComboboxItem key={person} value={person}>{person}</ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
```

## Command

**When:** keyboard-first action search or quick destination switching. **Anatomy:** inline Command → Input/List → Empty/Group/Item/Shortcut, or CommandDialog with the same children. Title and Description live inside dialog content, not beside a portal where their context is disconnected.

**Motion:** inline Command does not animate. CommandDialog uses the Dialog center-origin smooth spring rise (y=8px, scale .97, `--spring-smooth` / 538ms), 140ms opacity in, 120ms leave fade out, backdrop 200/100ms linear. Filtering and active-row selection are instant, with no list-sizer height transition. Reduced motion: 120/80ms linear fades.

**Accessibility:** cmdk manages combobox/listbox roles and active descendants. Name the search, supply Empty, and use `onSelect` for mouse and keyboard parity. Programmatically opened CommandDialog accepts `onCloseAutoFocus` to restore a known opener; do not leave focus on BODY. Shortcut badges are descriptive, not global event registrations.

```tsx
import { Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem } from "@sift-design/ui/command";

export function AreaSearch({ onOpen }: { onOpen: (area: string) => void }) {
  return <Command><CommandInput aria-label="Find an area" placeholder="Find an area…" />
    <CommandList><CommandEmpty>No matching areas.</CommandEmpty><CommandGroup heading="Areas">
      {["Propagation house", "Retail benches"].map(area => <CommandItem key={area} onSelect={() => onOpen(area)}>{area}</CommandItem>)}
    </CommandGroup></CommandList>
  </Command>;
}
```

## Sonner

**When:** confirm a completed action or surface a recoverable nonblocking error. Do not hide required recovery steps in an expiring toast. **Anatomy:** one Toaster at the app root; call `toast`, `toast.success`, `toast.error`, etc. from `sonner`. Actions and descriptions are optional.

**Motion:** Sonner owns edge-relative translation, depth scale stacking, hover expansion and swipe dismissal. Transform arrival/reflow uses `--spring-snappy` / 358ms, opacity 140ms linear; removal uses `--spring-smooth` / 538ms transform and 100ms opacity. Removed layers are noninteractive immediately. Pointer swipes remain direct; Sonner decides release dismissal. Default edge is bottom-right, configurable with position. Reduced motion: 120ms opacity in / 80ms out only; stack offsets are static without transform transitions.

**Theme:** observes the live `<html class="dark">` value using MutationObserver; no next-themes provider or dependency is required. Cleanup disconnects the observer. Explicit `theme` still overrides this when embedding. Surface/text/border/shadow and icon/action roles use kit tokens, including descriptions and rich-color calls.

**Accessibility:** Sonner's live announcements and keyboard focus affordances remain intact. Toast actions have visible focus; removed toasts do not receive pointer events. Avoid duplicate announcements for one event and give people time to act; use a persistent inline error for blocked work.

```tsx
import { toast } from "sonner";
import { Toaster } from "@sift-design/ui/sonner";
import { Button } from "@sift-design/ui/button";

export function MarketSave({ onSave }: { onSave: () => void }) {
  return <><Button onClick={() => { onSave(); toast.success("Market checklist saved", {
    description: "Ready for Saturday’s load-out.",
  }); }}>Save market checklist</Button><Toaster /></>;
}
```

## Verification reference

The live family is `specimen/?section=overlays`; every component has an operable Larkspur example and a one-line usage/motion note. Run:

```sh
npx tsc --noEmit -p specimen
npx vite build specimen
node scripts/capture.mjs specimen --shots shots/overlays.mjs --axe
```

Shots include every open component in both themes, full sections, 390px Sheet/Drawer captures, a reduced-motion Dialog and filmstrips for Dialog, Sheet, Dropdown and Sonner, plus real-time `overlays-motion-*.webp` recordings for menus, dialogs, alerts, desktop sheets, mobile Sheet/Drawer drag-dismiss, and toast stacking/swiping. The capture harness writes the family-specific `screenshots/specimen/overlays-axe.json` report and uses a private build folder to avoid cross-family capture collisions.

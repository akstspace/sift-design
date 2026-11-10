# Overlays and menus

Use these components with the kit theme imported once in your app:

```css
@import "tailwindcss";
@import "@sift-design/ui/theme.css";
```

Animation is built in; no extra provider or wrapper is needed. Components use the shadcn API and keep the underlying focus, keyboard, closing, and popup-positioning behavior. Import from `@sift-design/ui/<component>`, not unmodified upstream files. In the examples below, a **trigger** is the button or link that opens a menu or panel. A **surface** is the visible panel itself.

Choose an overlay only when it serves the interaction; a full page or inline content may be clearer. The snippets illustrate document, account, catalog, and booking interactions. Their fields and actions are examples, separate from the optional greenhouse demos.

## Shared surfaces and motion

Floating panels use `--surface`, `--ink`, a thin `--line` border and `--shadow-float`. The border separates dark floating panels from the page beneath them. Menu rows are at least 32px high, with 8px highlight radii. Highlights are immediate, so keyboard navigation never waits for animation. Destructive actions use `--danger`. Shortcut labels use 12px IBM Plex Mono, a subtle fill and a thin border, not decorative letter spacing. Focus uses `--focus-ring` in both themes.

Exact easing names throughout this document:

- **settle** = `cubic-bezier(0.16, 1, 0.3, 1)`.
- **leave** = `cubic-bezier(0.4, 0, 1, 1)`.
- **linear** = `linear`.

Use the shared spring tokens rather than tuning separate curves:

| Role | CSS curve | Physical preset | Complete sampled duration |
|---|---|---|---|
| Anchored surfaces, alerts, toast stack | `--spring-snappy` | `spring.snappy`, visualDuration .2s, bounce .12 | `--spring-snappy-duration` = 358ms |
| Dialogs, desktop sheets | `--spring-smooth` | `spring.smooth`, visualDuration .28s, bounce 0 | `--spring-smooth-duration` = 538ms |
| Sheet/Drawer full-edge travel | `--spring-travel` | `spring.travel`, visualDuration .3s, bounce 0 | `--spring-travel-duration` = 572ms |
| Surface and toast spatial exits | `--spring-exit` | `spring.exit`, visualDuration .16s, bounce 0 | `--spring-exit-duration` = 335ms |

The complete sampled durations include the almost-still spring tail; they are not the perceived response time. Input and focus never wait for that tail.

The **anchored preset** grows from **scale .94 to 1** with `--spring-snappy`, 4px side-aware travel, and a separate `--dur-quick` (140ms) linear opacity transition. `@starting-style` supplies the initial transform and opacity; CSS transitions reverse from the currently displayed values mid-flight. Closing targets scale .97 on `--spring-exit` while `--dur-instant` (80ms) leave opacity makes dismissal immediate. A nonvisual exit animation keeps primitive Presence mounted for the 80ms fade without resetting the transition or delaying focus return through an invisible spring tail. Origins use the primitive variable listed below. Reduced motion is **140ms linear fade in / 80ms leave fade out**, with no spatial transition. Submenus translate 12px out of their parent rather than scaling; each is portalled so the parent scroll container cannot clip it.

Dialogs, alerts, desktop sheets and navigation viewports use the same reversible lifecycle, with role-specific entry springs and overshoot-free exit springs. Backdrops independently transition opacity over 180ms in / 80ms leave out, so interrupting an entrance does not flash a fully dimmed backdrop. Input never waits for a spring tail. Vaul owns drawer/mobile-sheet direct manipulation: pointer tracking is 1:1 toward dismissal, resisted beyond open, and release velocity/distance decide dismissal. Its inline `transition:none` during dragging is never overridden. At rest, the release uses the token spring-shaped CSS transition. Sonner retains depth stacking, hover expansion and swipe geometry with token spring timing. Command and Combobox filtering and keyboard selection stay synchronous; only an empty-result message fades in over 140ms.
Closing surfaces are visual-only (`pointer-events: none`); Select's primitive inline pointer style is explicitly overridden. Closing-only modal layers release body pointer locking, without unlocking another still-open modal. The shared `useOverlayIsolation` hook mirrors primitive `aria-hidden` background isolation with native `inert` for tabbable background regions, restores previous inert values, and releases this extra isolation when the overlay closes. Radix still owns focus trapping, Escape, dismissal and eventual focus return. Its empty navigation focus proxy remains tabbable and forwards focus into content; it is not incorrectly hidden from the accessibility tree. Always regression-test your nesting arrangement and provide an opener when controlling a dialog programmatically.

## Dialog

**When:** a short edit or decision genuinely needs modal focus. For contextual details that benefit from an edge panel, consider Sheet; use inline content or a full page when interruption is unnecessary. **Structure:** Root → Trigger; Content includes Portal + Overlay and a close control; Header → Title + Description; body; Footer → actions/Close.

**Motion:** center origin. Rises from y=8px, scale .97 on the smooth spring; exits toward scale .98 on the exit spring. Transform and opacity retarget from the current frame if dismissed or reopened midway. Content fades 140ms in / 80ms leave out; backdrop 180/80ms. Reduced motion: 140/80ms fades only.

**Accessibility:** provide Title and Description. Focus is trapped while open, Escape closes, and focus returns to Trigger. The 36px close button has an accessible name. Long content scrolls within `100dvh - 32px`. Do not force-mount an always-focusable hidden dialog.

```tsx
import { useState } from "react";
import { Button } from "@sift-design/ui/button";
import { Input } from "@sift-design/ui/input";
import { Label } from "@sift-design/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose } from "@sift-design/ui/dialog";

export function RenameDocument({ name, onRename }: { name: string; onRename: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(name);
  return <Dialog open={open} onOpenChange={next => { if (next) setTitle(name); setOpen(next); }}>
    <DialogTrigger asChild><Button variant="outline">Rename document</Button></DialogTrigger>
    <DialogContent><form onSubmit={event => {
      event.preventDefault();
      if (!title.trim()) return;
      onRename(title.trim());
      setOpen(false);
    }}>
      <DialogHeader><DialogTitle>Rename document</DialogTitle>
        <DialogDescription>Choose a title readers can recognize in search results.</DialogDescription></DialogHeader>
      <Label htmlFor="rename-document-title">Document title</Label>
      <Input id="rename-document-title" value={title} onChange={event => setTitle(event.target.value)} required />
      <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={!title.trim()}>Save name</Button></DialogFooter>
    </form>
    </DialogContent>
  </Dialog>;
}
```

This example calls a synchronous rename handler. For a server request, keep the dialog open while saving and show any error beside the field before closing on success.

## Alert dialog

**When:** an irreversible or high-impact operation requires an explicit choice. **Structure:** Root → Trigger; Content → Header/Title/Description + Footer/Cancel/Action. Optional Media and `size="sm"` remain supported.

**Motion:** center origin. Settles from scale 1.06 on the snappy spring; exits toward scale .98 on the overshoot-free exit spring. Both directions reverse from the current frame. Content fades 140ms in / 80ms leave out; backdrop 180/80ms. Reduced motion: fades only.

**Accessibility:** Cancel receives safe initial focus. Outside click does not confirm or dismiss. Use explicit action names, identify the affected object, and style irreversible actions as destructive. Keep Cancel visible and operable.

```tsx
import { Button } from "@sift-design/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction } from "@sift-design/ui/alert-dialog";

export function DeleteDocument({ onDelete }: { onDelete: () => void }) {
  return <AlertDialog>
    <AlertDialogTrigger asChild><Button variant="outline">Delete document</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Delete this document?</AlertDialogTitle>
        <AlertDialogDescription>Autumn collection brief will be permanently removed. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Keep document</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onDelete}>Delete document</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
```

## Sheet

**When:** inspect or edit details while keeping the source page visible behind the panel. Sheet is modal: the page behind it is not interactive while it is open. **Structure:** Root/Trigger → Content (Portal + Overlay + named close), Header/Title/Description, body, Footer/Close. Default side is right. `side` also accepts left, top and bottom. Root accepts `responsive={false}` to keep an edge-attached surface out of the mobile bottom-sheet lifecycle; Sidebar uses this for side navigation. Additional Content props include `overlayClassName`, custom `overlay`, `forceMount` and `asChild`; an `asChild` consumer supplies its own close control.

**Motion:** desktop edge origin (right/left/top/bottom). Arrives from 64px, scale .985 on the smooth spring; exits toward 40px, scale .99 on the exit spring. Both directions retarget from the current frame, with independent 140/80ms content fades and 180/80ms backdrop fades. Below 640px, the existing draggable bottom sheet keeps full-height travel on the travel spring and dismissal on the exit spring. Reduced motion: 140/80ms fades, no automatic travel or scale.

**Accessibility:** named dialog with trapped open focus, Escape and focus return; 36px dismissal target. Content scrolls within the viewport. Custom force-mounted Motion content must provide its own presence/inert handling; don't leave a hidden modal layer interactive.

```tsx
import { Button } from "@sift-design/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose } from "@sift-design/ui/sheet";

export function ProductDetails() {
  return <Sheet>
    <SheetTrigger asChild><Button variant="outline">View product details</Button></SheetTrigger>
    <SheetContent><SheetHeader className="pr-12">
      <SheetTitle>Linen tablecloth</SheetTitle>
      <SheetDescription>Natural linen · 140 × 200 cm</SheetDescription>
    </SheetHeader><p className="px-4">Machine washable at 30°C.</p>
      <SheetFooter><SheetClose asChild><Button>Back to catalog</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>;
}
```

## Drawer

**When:** mobile actions or a short form benefit from a panel that can be dragged closed. Use Sheet for a larger contextual editor. **Structure:** Vaul Root/Trigger → Content (Portal, Overlay, handle), Header/Title/Description, scrollable body, Footer/Close.

**Motion:** Vaul retains direction-specific full-edge translation, snap-point geometry, direct pointer tracking, resistance beyond open and velocity-based dismissal: already correct. Entry/release use the travel spring; departure uses the exit spring. Backdrop opacity now reverses continuously over 180ms in / 80ms leave out. Reduced motion: 140/80ms fades, no automatic travel or background scale; deliberate dragging remains available.

**Accessibility:** supply Title, Description and a visible Close; dragging cannot be the only way out. Focus trapping/dismissal come from Vaul/Radix. Vertical drawers cap at 80vh and scroll, including on short landscape screens. Label any controls inside the drawer.

```tsx
import { Button } from "@sift-design/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerDescription, DrawerFooter, DrawerClose } from "@sift-design/ui/drawer";

export function BookingSummary() {
  return <Drawer><DrawerTrigger asChild><Button>View booking summary</Button></DrawerTrigger>
    <DrawerContent><DrawerHeader><DrawerTitle>Your booking</DrawerTitle>
      <DrawerDescription>Two guests · 12 November 2026 · 18:30</DrawerDescription></DrawerHeader>
      <DrawerFooter><DrawerClose asChild><Button>Done</Button></DrawerClose></DrawerFooter>
    </DrawerContent>
  </Drawer>;
}
```

## Popover

**When:** a short setting change close to its trigger. Not a replacement for a large dialog. **Structure:** Root/Trigger (or Anchor) → portalled Content → Header/Title/Description + controls.

**Motion:** anchored preset with reversible snappy entry and overshoot-free exit, 140ms linear opacity in / 80ms leave out. Origin `--radix-popover-content-transform-origin`; collision-resolved side determines the 4px entry offset. Reduced motion: 140/80ms fades only.

**Accessibility:** Title/Description automatically share IDs with Content through context; include both, or supply explicit `aria-label`/`aria-describedby` for custom compositions. Escape/outside click close and restore trigger focus. Interactive content belongs in a Popover, never a Tooltip.

```tsx
import { Button } from "@sift-design/ui/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverTitle, PopoverDescription } from "@sift-design/ui/popover";
import { Checkbox } from "@sift-design/ui/checkbox";
import { Label } from "@sift-design/ui/label";

export function ProductFilters({ inStockOnly, onInStockChange }: {
  inStockOnly: boolean; onInStockChange: (value: boolean) => void;
}) {
  return <Popover><PopoverTrigger asChild><Button>Product filters</Button></PopoverTrigger>
    <PopoverContent><PopoverHeader><PopoverTitle>Availability</PopoverTitle>
      <PopoverDescription>Choose which products appear in the catalog.</PopoverDescription>
    </PopoverHeader><Label><Checkbox checked={inStockOnly} onCheckedChange={value => onInStockChange(value === true)} />In-stock products only</Label></PopoverContent>
  </Popover>;
}
```

## Hover card

**When:** supplementary previews for a person or destination. Essential information must also exist on the destination. **Structure:** Root → focusable Trigger link → portalled Content.

**Motion:** anchored preset with reversible snappy entry and exit-spring departure, 140ms linear opacity in / 80ms leave out. Origin `--radix-hover-card-content-transform-origin`; offset 4px. `openDelay={200}` remains a discovery threshold, not animation duration. Reduced motion: 140/80ms fades only.

**Accessibility:** pointer hover and trigger focus both reveal it. Do not put required actions or essential form fields in the preview; use Popover for those. Preserve a real link destination.

```tsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@sift-design/ui/hover-card";

export function AuthorPreview() {
  return <HoverCard openDelay={200}><HoverCardTrigger asChild>
    <a href="/authors/alex-lee">Alex Lee</a></HoverCardTrigger>
    <HoverCardContent><p className="font-semibold">Alex Lee</p>
      <p className="text-muted-foreground">Editor of the monthly reading guide.</p></HoverCardContent>
  </HoverCard>;
}
```

## Tooltip

**When:** optional clarification or a shortcut. Never the sole accessible name or the only place for critical instructions. **Structure:** Provider → Root → Trigger + portalled Content. Uses the panel background and a thin border rather than an inverted color scheme; no decorative arrow.

**Motion:** delayed discovery uses the reversible anchored preset, with snappy entry, exit-spring departure and 140/80ms opacity. Instant-open hints, including discovery within the provider’s skip-delay window, reveal immediately without replaying scale, travel or fade. Origin `--radix-tooltip-content-transform-origin`; offset 6px. Reduced delayed discovery: 140/80ms fades only; instant-open remains instant.

**Accessibility:** accessible trigger, focus/hover discovery, Escape dismissal. No interactive controls inside tooltip content. Tooltip shortcuts supplement, not replace, button labels.

```tsx
import { Button } from "@sift-design/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@sift-design/ui/tooltip";

export function PrintHint({ onPrint }: { onPrint: () => void }) {
  return <TooltipProvider delayDuration={300}><Tooltip>
    <TooltipTrigger asChild><Button onClick={onPrint}>Print document</Button></TooltipTrigger>
    <TooltipContent>Opens your browser's print options.</TooltipContent>
  </Tooltip></TooltipProvider>;
}
```

## Dropdown menu

**When:** secondary actions behind an explicit button. **Structure:** Root/Trigger → Content → optional Label/Group, Item, CheckboxItem/RadioGroup, Separator, Shortcut; Sub → SubTrigger + SubContent.

**Motion:** root uses the reversible anchored preset: snappy entry, exit-spring departure and 140/80ms opacity. Origin `--radix-dropdown-menu-content-transform-origin`. Portalled submenus enter 12px away from their parent and exit toward a smaller 4px offset on the exit spring; interruption retargets the current frame. Highlights remain instant for keyboard speed. Reduced motion: 140/80ms fades at every level.

**Accessibility:** Arrow keys, Home/End, typeahead, Enter, Escape and submenu arrow navigation remain primitive-owned. Disabled actions are visibly disabled. Use `inset` for a consistent text column when mixing checkable rows with ordinary actions. Use a confirmation dialog rather than immediate deletion for irreversible actions.

```tsx
import { Button } from "@sift-design/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator } from "@sift-design/ui/dropdown-menu";

export function DocumentActions({ onOpen, onDownload }: { onOpen: () => void; onDownload: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button>Document actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent><DropdownMenuItem onSelect={onOpen}>Open document</DropdownMenuItem>
      <DropdownMenuSeparator /><DropdownMenuItem onSelect={onDownload}>Download PDF</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
```

## Context menu

**When:** a secondary shortcut on an existing object, with an equivalent visible action elsewhere. **Structure:** Root → focusable Trigger → portalled Content → items/groups/checkable items, separators, shortcuts and optional submenus.

**Motion:** reversible anchored preset with snappy entry, exit-spring departure and 140/80ms opacity. Origin `--radix-context-menu-content-transform-origin`; pointer or focused trigger anchors it. Portalled submenus enter from 12px and leave toward 4px, side-aware. Highlights stay instant. Reduced motion: 140/80ms fades only.

**Accessibility:** use `tabIndex={0}` on a non-native trigger so Shift+F10 / the context-menu key can reach it. Keep equivalent actions available without right-click. Primitive keyboard navigation, submenu handling and Escape are unchanged.

```tsx
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@sift-design/ui/context-menu";

export function ImageContext({ onOpen }: { onOpen: () => void }) {
  return <ContextMenu><ContextMenuTrigger tabIndex={0} className="rounded-md border p-4">
    Collection cover.jpg</ContextMenuTrigger>
    <ContextMenuContent><ContextMenuItem onSelect={onOpen}>Open image</ContextMenuItem></ContextMenuContent>
  </ContextMenu>;
}
```

## Menubar

**When:** repeated application commands grouped in a stable, compact toolbar. Not general website navigation. **Structure:** Menubar → Menu → Trigger/Content → items, shortcuts, checkable groups or submenus.

**Motion:** reversible anchored preset with snappy entry, exit-spring departure and 140/80ms opacity. Origin `--radix-menubar-content-transform-origin`. Submenus enter from a side-aware 12px offset and leave toward 4px. Highlights remain instant. Reduced motion: 140/80ms fades only.

**Accessibility:** horizontal arrows switch menus; vertical arrows enter the active menu. Preserve menu semantics and use `onSelect`, not click-only handlers. Keyboard legends only advertise shortcuts that the host application implements.

```tsx
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@sift-design/ui/menubar";

export function EditorMenu({ onNew }: { onNew: () => void }) {
  return <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger>
    <MenubarContent><MenubarItem onSelect={onNew}>New document</MenubarItem></MenubarContent>
  </MenubarMenu></Menubar>;
}
```

## Navigation menu

**When:** related destination links, not commands that change data. **Structure:** Root → List → Item → Trigger/Content/Link; default floating Viewport is included. Optional Indicator and `viewport={false}` remain supported.

**Motion:** viewport reversibly grows from scale .94 and y=-4px on the snappy spring, then leaves toward scale .97 on the exit spring, with separate 140/80ms opacity. Origin top left; this primitive has no anchor-origin variable. Content handoff remains a short cross-fade, without animated dimensions. The shared grid paint layer and snappy chevron remain unchanged. Reduced motion: 140/80ms fades, no chevron travel.

**Accessibility:** semantic navigation landmark, real links, ArrowDown entry and native Tab sequence through the focus proxy. Visible focus rings are not removed from nested links. Give separate nav landmarks distinct labels.

```tsx
import { NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@sift-design/ui/navigation-menu";

export function CatalogNavigation() {
  return <NavigationMenu aria-label="Shop"><NavigationMenuList><NavigationMenuItem>
    <NavigationMenuTrigger>Homeware</NavigationMenuTrigger>
    <NavigationMenuContent><NavigationMenuLink href="/shop/table-linen">Table linen</NavigationMenuLink></NavigationMenuContent>
  </NavigationMenuItem></NavigationMenuList></NavigationMenu>;
}
```

## Select

**When:** one value from a short known set. **Structure:** Root → Trigger/Value → portalled Content → Group/Label/Item, optional Separator, scroll buttons. Popper positioning is the default so every selection emerges from its trigger rather than jumping to the selected row.

**Motion:** reversible anchored preset with snappy entry, exit-spring departure and 140/80ms opacity. Origin `--radix-select-content-transform-origin`; default popper offset 4px. Highlights remain instant. Reduced motion: 140/80ms fades only. Explicit item-aligned positioning retains the primitive’s selected-row geometry.

**Accessibility:** label the trigger via `Label htmlFor` or `aria-label`. Arrow keys and typeahead select; disabled options remain unavailable. No shadow on the trigger; floating content uses `--shadow-float`. Large sets should use Combobox.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@sift-design/ui/select";

export function DigestFrequency() {
  return <Select defaultValue="weekly"><SelectTrigger aria-label="Email digest frequency"><SelectValue /></SelectTrigger>
    <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem>
      <SelectItem value="off">Off</SelectItem></SelectContent>
  </Select>;
}
```

## Combobox

**When:** filter a longer set by typing; supports Base UI controlled selection, multiple values and removable selected-value labels (chips). **Structure:** Root(items) → Input (input-group + trigger/optional clear) → Content (Portal/Positioner/Popup) → List(render function)/Item + Empty. Chips/Chip/ChipsInput and `useComboboxAnchor` support multiple selection.

**Motion:** reversible anchored preset with snappy entry, exit-spring departure and 140/80ms opacity. Base UI origin `--transform-origin`; offset 6px. Filtering, active descendant and list height remain immediate; the empty-result message alone fades in over 140ms. Uses data-open/data-closed for exit presence. Reduced motion: fades only, no list reflow travel.

**Accessibility:** label the editable input; clear and chip-remove buttons have default accessible names (override with more specific names where needed). Keyboard active descendant and filtering are primitive-owned. Root preserves generic item/multiple-value types. Keep the empty result useful.

```tsx
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList,
  ComboboxItem, ComboboxEmpty } from "@sift-design/ui/combobox";

export function Destination() {
  return <Combobox items={["Bristol", "Edinburgh", "Leeds", "Manchester"]}>
    <ComboboxInput aria-label="Destination city" placeholder="Find a city…" showClear />
    <ComboboxContent><ComboboxEmpty>No cities found.</ComboboxEmpty>
      <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
```

## Command

**When:** search actions with the keyboard or switch destinations quickly. **Structure:** inline Command → Input/List → Empty/Group/Item/Shortcut, or CommandDialog with the same children. Title and Description live inside dialog content, not beside a portal where their context is disconnected.

**Motion:** inline results and active-row selection stay instant; only a newly shown empty-result message fades in over 140ms. No list-sizer height transition. CommandDialog inherits the reversible Dialog rise on the smooth spring and exit-spring scale departure, with 140/80ms content and 180/80ms backdrop fades. Reduced motion: fades only.

**Accessibility:** cmdk manages combobox/listbox roles and active descendants. Name the search, supply Empty, and use `onSelect` for mouse and keyboard parity. Programmatically opened CommandDialog accepts `onCloseAutoFocus` to restore a known opener; do not leave focus on BODY. Shortcut badges are descriptive, not global event registrations.

```tsx
import { Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem } from "@sift-design/ui/command";

export function SettingsSearch({ onOpen }: { onOpen: (setting: string) => void }) {
  return <Command><CommandInput aria-label="Find a setting" placeholder="Find a setting…" />
    <CommandList><CommandEmpty>No matching settings.</CommandEmpty><CommandGroup heading="Account">
      {["Profile", "Notifications"].map(setting => <CommandItem key={setting} onSelect={() => onOpen(setting)}>{setting}</CommandItem>)}
    </CommandGroup></CommandList>
  </Command>;
}
```

## Sonner

**When:** confirm a completed action or show a recoverable error without interrupting input. A toast is a brief notification; do not hide required recovery steps in one that expires. **Structure:** one Toaster at the app root; call `toast`, `toast.success`, `toast.error`, etc. from `sonner`. Actions and descriptions are optional.

**Motion:** Sonner retains edge-relative translation, depth stacking, hover expansion and direct swipe geometry. Arrival/reflow use the snappy spring and 140ms linear opacity; removal now uses the quicker overshoot-free exit spring and 80ms leave opacity. Swipe-out uses the same exit spring timing instead of a separate timed curve. Stack contents fade over 140ms. Removed layers are immediately noninteractive. Reduced motion: 140/80ms opacity only, instant static stack offsets, and no swipe-out travel.

**Theme:** observes the live `<html class="dark">` value using MutationObserver; no next-themes provider or dependency is required. Cleanup disconnects the observer. Explicit `theme` still overrides this when embedding. Surface/text/border/shadow and icon/action roles use kit tokens, including descriptions and rich-color calls.

**Accessibility:** Sonner's live announcements and keyboard focus affordances remain intact. Toast actions have visible focus; removed toasts do not receive pointer events. Avoid duplicate announcements for one event and give people time to act; use a persistent inline error for blocked work.

```tsx
import { toast } from "sonner";
import { Toaster } from "@sift-design/ui/sonner";
import { Button } from "@sift-design/ui/button";

export function SavePreferences({ saving, onSave }: { saving: boolean; onSave: () => Promise<void> }) {
  return <><Button loading={saving} onClick={async () => {
    try { await onSave(); toast.success("Preferences saved"); }
    catch { toast.error("Preferences could not be saved", { description: "Your changes are still here. Try again." }); }
  }}>Save preferences</Button><Toaster /></>;
}
```

Keep `saving` tied to the real request, retain edits on failure, and mount just one Toaster in the app; it is shown beside the button here only to make the setup visible.

## Live examples and verification

The live group is `specimen/?section=overlays`; every component has an interactive Larkspur greenhouse example and a one-line behavior note. Those task actions, fields, and notifications are isolated demonstrations, not a required product workflow or a live service. Run:

```sh
npx tsc --noEmit -p specimen
npx vite build specimen
node scripts/capture.mjs specimen --shots shots/overlays.mjs --axe
```

Shots include every open component in both themes, full sections, 390px Sheet/Drawer captures, a reduced-motion Dialog and filmstrips for Dialog, Sheet, Dropdown and Sonner, plus real-time `overlays-motion-*.webp` recordings for menus, dialogs, alerts, desktop sheets, mobile Sheet/Drawer drag-dismiss, and toast stacking/swiping. The capture harness writes the family-specific `screenshots/specimen/overlays-axe.json` report and uses a private build folder to avoid cross-family capture collisions.

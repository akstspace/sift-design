# Display, layout and navigation

Use the kit theme once, immediately after Tailwind. It supplies fonts, colors and default motion: `@import "@sift-design/ui/theme.css";`. Albert Sans is interface text; IBM Plex Mono is for counts, IDs, times and durations. Every example below assumes the named exports are imported from `@sift-design/ui/<component-name>`.

Choose the layout and components for the product: a catalog, publication, dashboard, or conversation can use different structures. The snippets illustrate several uses. The separate greenhouse demos are optional examples, not a required navigation, record type, or workflow.

## Shared animation settings

- `settle`: `cubic-bezier(0.16, 1, 0.3, 1)`. `leave`: `cubic-bezier(0.4, 0, 1, 1)`.
- `shellSpring`: stiffness **560**, damping **48**, mass **0.8**. `selectionSpring`: stiffness **700**, damping **48**, mass **0.6**. Springs have no fixed duration; they are interruptible, not a timed wait.
- `spring.smooth`: visual duration **280ms**, bounce **0**; `spring.snappy`: **200ms**, bounce **0.12**; `spring.press`: **120ms**, bounce **0**; `spring.travel`: **300ms**, bounce **0**; `spring.exit`: **160ms**, bounce **0**. Visual duration estimates when most movement finishes, not a fixed blocking wait. The matching CSS curves run to rest: smooth **538ms**, snappy **358ms**, press **263ms** with the shared `linear()` easing tokens.
- Arrival uses **spring.smooth**, from `opacity: 0; translateY(-6px); scale(.98)` to the resting state. Reduced motion replaces it with a **140ms linear fade**. Set `arrival` only on newly inserted, stably keyed records. Do not key a row by its contents, token count or update time. Existing items never replay an entrance merely because props changed.
- Static structural components have **0ms** motion. A card, separator or layout wrapper should not reveal itself just because the page mounted.
- Reduced motion removes spatial travel and springs, retaining brief fades and state feedback. Never hide content until an animation ends. Controls stay usable throughout.

## Sidebar

**When:** frequently used destinations benefit from persistent side navigation. A sidebar is optional; top navigation, a reading column, or other structures may suit the content better. Use the normal fixed positioning for a page sidebar; use `position="relative"` inside a bounded frame.

**Structure:** `SidebarProvider` owns desktop open state, mobile sheet state, shortcut and a per-provider `LayoutGroup`; `Sidebar` contains header, content/groups, menus and footer; `SidebarMenuButton isActive` owns the shared selection highlight; `SidebarTrigger` toggles the sidebar. Expanded width is **256px**, icon width **72px**. Override the provider's `--sidebar-width` / `--sidebar-width-icon` when a different width fits the content better. `collapsible="offcanvas"` closes to zero; `icon` preserves an icon-only sidebar; `none` is static.

**Motion:** width uses `shellSpring`, with **80ms delay on collapse** so labels fade before reflow. Labels fade out **80ms linear**, fade in **100ms linear after 180ms** on expansion. Text retains natural width, never scales. The highlight lives outside the clipping button and uses `selectionSpring`, scoped to its provider. Mobile is a modal sheet from its edge on **spring.smooth**, exiting on **spring.exit**. Its backdrop fades in **140ms linear** and out **120ms linear**. Motion owns both surfaces without a second CSS or bottom-sheet transition; closing surfaces become inert and stop intercepting pointers immediately. Drag follows the pointer, resists the opposite edge with `rubberBand`, and dismisses beyond **80px** or **550px/s** toward its edge. A canceled dismissal returns with release velocity on the same spring. This shell width is the explicit, bounded reflow exception to the transform-only rule.

**Reduced motion:** width and selection update instantly; labels retain a short fade with no delay; the sheet fades instead of sliding.

**Accessibility:** give every icon-only destination an `aria-label` and `tooltip`; `isActive` supplies `aria-current="page"`. The trigger exposes expanded state. Cmd/Ctrl+B toggles navigation. The modal sheet traps focus, closes with Escape, and has a visible close action. Mark custom brand labels with `data-sidebar-label` so they fade rather than compress during collapse. Use one active menu item per provider.

```tsx
import { IconBook } from "@tabler/icons-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@sift-design/ui/sidebar";

<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader><span data-sidebar-label>Reference library</span></SidebarHeader>
    <SidebarContent><nav aria-label="Library"><SidebarMenu>
      <SidebarMenuItem><SidebarMenuButton isActive tooltip="Saved articles" aria-label="Saved articles">
        <IconBook aria-hidden /><span>Saved articles</span>
      </SidebarMenuButton></SidebarMenuItem>
    </SidebarMenu></nav></SidebarContent>
  </Sidebar>
  <SidebarInset><SidebarTrigger />{/* Page content */}</SidebarInset>
</SidebarProvider>
```

## Accordion

**When:** a related set of optional explanations, with one or several open panels.

**Structure:** root → item → trigger (inside its heading) + content. The trigger supplies its chevron.

**Motion:** measured height opens on **spring.smooth** and closes on the quicker, overshoot-free **spring.exit**, continuing from its current height when reversed. Content fades **140ms linear** in and **80ms leave** out; the chevron uses **358ms `--spring-snappy`**. ResizeObserver follows content changes without scaling text. Clipping is removed after expansion settles so focus outlines remain visible; closing content becomes inert immediately.

**Reduced motion:** height changes instantly; content fades **140ms** in / **80ms** out and the chevron changes immediately.

**Accessibility:** Radix owns expanded state, panel relationships and keyboard navigation. Keep trigger labels specific; don't place a button inside the trigger.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@sift-design/ui/accordion";
<Accordion type="single" collapsible>
  <AccordionItem value="collection"><AccordionTrigger>How does store collection work?</AccordionTrigger>
    <AccordionContent>Bring your order confirmation to the collection desk.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Collapsible

**When:** show or hide one section of supporting content. Use Accordion for a related set of expandable sections.

**Structure:** root → trigger + content. Include an immediate-child chevron when useful.

**Motion:** measured height opens on **spring.smooth**, closes on **spring.exit**, and follows dynamic content size: it grows on **spring.smooth** and shrinks on **spring.exit**. Content that enters or leaves inside an open disclosure should fade only, because the disclosure already moves the space. `useInsideDisclosure()` returns `true` there. Content fades **140ms linear** in / **80ms leave** out. An immediate-child SVG rotates on **358ms `--spring-snappy`**. Reversal continues from the current height; clipping is removed once expansion settles so focus outlines stay visible. Closing content becomes inert immediately.

**Reduced motion:** **140ms** fade in / **80ms** out; height and chevron are immediate.

**Accessibility:** the Radix trigger supplies expanded state. Keep focus on the trigger while details open; don't force-mount hidden focusable content without also managing visibility.

```tsx
import { IconChevronDown } from "@tabler/icons-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@sift-design/ui/collapsible";
<Collapsible><CollapsibleTrigger>Report methodology <IconChevronDown aria-hidden /></CollapsibleTrigger>
  <CollapsibleContent>Totals include completed orders and exclude cancelled orders.</CollapsibleContent>
</Collapsible>
```

## Card

**When:** a boundary helps people recognize related information, such as a product, article summary, or account setting. Do not use nested cards merely to divide a page.

**Structure:** card → header (title, description, optional action) + content + footer. `--surface` background, `--line` border, **8px** radius, no shadow.

**Motion:** **0ms**; static surfaces do not enter, hover-lift or pulse.

**Reduced motion:** identical.

**Accessibility:** a card has no implicit heading or button role. Supply a real heading in `CardTitle` when it belongs in the document outline and put actual actions in buttons or links.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@sift-design/ui/card";
<Card><CardHeader><CardTitle><h3>Linen tablecloth</h3></CardTitle>
  <CardDescription>Natural linen · 140 × 200 cm</CardDescription></CardHeader>
  <CardContent>Machine washable at 30°C.</CardContent>
</Card>
```

## Item

**When:** scan a collection of related records with media, a title, a description, and an optional action.

**Structure:** `ItemGroup` (list) → `Item` (list item) → optional media + content + actions; `ItemSeparator` divides siblings.

**Motion:** color feedback **100ms**; opt-in `arrival` uses **spring.smooth**. The outer `item-motion` list item has default `layout="position"` and `reflowTransition`; stable keyed items never replay on updates. Use `AnimatePresence initial={false} mode="popLayout"` around items to close removal gaps. Set `reflow={false}` only when another container owns reflow.

**Reduced motion:** arrival becomes a **140ms linear fade**.

**Accessibility:** preserve list semantics; real actions must be links/buttons. With `asChild`, forward semantics onto an appropriate element. Don't turn a list item into a button unless the whole row performs one action.

```tsx
import { ItemGroup, Item, ItemContent, ItemTitle, ItemDescription } from "@sift-design/ui/item";
<ItemGroup>{documents.map(document => <Item key={document.id} arrival={document.justAdded} size="sm">
  <ItemContent><ItemTitle>{document.title}</ItemTitle><ItemDescription>{document.author}</ItemDescription></ItemContent>
</Item>)}</ItemGroup>
```

## Table

**When:** records need comparison across the same columns. Choose row spacing for the amount of text and the actions people need.

**Structure:** table with overflow container → caption, header, body, optional footer → rows → heads/cells. Default rows are **36px** tall. `TableCell numeric` aligns right in IBM Plex Mono with tabular numerals.

**Motion:** row color feedback **140ms**; optional new-row `arrival` is **spring.smooth**. Stable keys preserve existing rows. Rows default to position layout with `reflowTransition`; wrap dynamic siblings in `AnimatePresence initial={false}` for removal feedback.

**Reduced motion:** arrival is a **140ms linear fade**; no row travel.

**Accessibility:** use real headers with `scope`, a useful caption, and text for statuses. The overflow region remains keyboard reachable on narrow screens. Don't truncate record names merely to avoid horizontal scrolling.

```tsx
import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@sift-design/ui/table";
<Table><TableCaption>Invoices for November · USD</TableCaption><TableHeader><TableRow>
  <TableHead scope="col">Invoice</TableHead><TableHead scope="col" className="text-right">Amount</TableHead>
</TableRow></TableHeader><TableBody><TableRow>
  <TableCell>INV-2048</TableCell><TableCell numeric>$120.00</TableCell>
</TableRow></TableBody></Table>
```

## Badge

**When:** a short label helps identify a category, source, or status. Avoid repeating an ordinary value as a badge when plain text is clearer.

**Structure:** a **12px** label with subtle fill; optional leading icon. Variants include `secondary`, `outline`, `good`, `warning`, `destructive`, `ghost` and `link`.

**Motion:** interactive color feedback **140ms settle**; no mount animation.

**Reduced motion:** color feedback remains, no spatial effects.

**Accessibility:** words/icons identify status, never color alone. A badge is not a button unless `asChild` wraps an actual interactive element.

```tsx
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@sift-design/ui/badge";
<Badge variant="good"><IconCheck aria-hidden />Paid</Badge>
```

## Avatar

**When:** a person or organization needs a recognizable image in a list, account menu, or conversation.

**Structure:** root → image + fallback; optional badge, group and group count. Default **32px**, small **24px**, large **40px**.

**Motion:** image enters with a **140ms linear fade**; fallback is immediate.

**Reduced motion:** the same fade, no scale.

**Accessibility:** use meaningful image alt text or an accessible root label; initials alone are not an accessible full name. Any presence badge needs a textual label. Group counts should say what they count.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@sift-design/ui/avatar";
<Avatar aria-label="Jane Doe"><AvatarImage src="/mara.webp" alt="Jane Doe" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

## Alert

**When:** a state that needs explanation or recovery, not ordinary metadata.

**Structure:** alert → icon + title + description; `good`, `warning`, `destructive` use the corresponding status colors. Default is a neutral notice.

**Motion:** **0ms** static notice. Insert notices directly rather than stacking unrelated arrival effects.

**Reduced motion:** identical.

**Accessibility:** the default role is `alert`; use `role="status"` for nonurgent success or `role="note"` for persistent explanatory content. Pair status color with an icon and words. The title names the condition or outcome; the description gives a next step when needed.

```tsx
import { IconAlertTriangle } from "@tabler/icons-react";
import { Alert, AlertTitle, AlertDescription } from "@sift-design/ui/alert";
<Alert variant="warning" role="note"><IconAlertTriangle aria-hidden /><AlertTitle>Payment method expires this month</AlertTitle>
  <AlertDescription>Update your card before the next renewal.</AlertDescription>
</Alert>
```

## Empty

**When:** a collection has no content, a filter has no matches, or first use needs an explanation.

**Structure:** empty → header (optional media, title, description) + content for a useful next action, if one is available.

**Motion:** **0ms**; an empty region is not a celebratory reveal.

**Reduced motion:** identical.

**Accessibility:** explain why the region is empty and offer a real, labeled action when the person can resolve it. A decorative icon is hidden from assistive technology. Announce relevant state changes without putting every persistent empty block in a live region.

```tsx
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@sift-design/ui/empty";
import { Button } from "@sift-design/ui/button";
<Empty><EmptyHeader><EmptyTitle>No products match these filters</EmptyTitle>
  <EmptyDescription>Clear the filters to see the full collection.</EmptyDescription></EmptyHeader>
  <EmptyContent><Button onClick={clearFilters}>Clear filters</Button></EmptyContent>
</Empty>
```

## Skeleton

**When:** actual content is loading and its approximate shape is known.

**Structure:** muted placeholder blocks shaped like the pending content; decorative and `aria-hidden` by default.

**Motion:** **1800ms `--spring-smooth`** shimmer, **two passes only**. It does not become an endless decorative loop.

**Reduced motion:** static placeholder, shimmer removed.

**Accessibility:** one enclosing `role="status"` or an `aria-busy` region communicates loading; don't announce each skeleton. Avoid implying an exact number of records if it isn't known.

```tsx
import { Skeleton } from "@sift-design/ui/skeleton";
<div role="status" aria-label="Loading article"><Skeleton className="h-3 w-48" />
  <span className="sr-only">Loading article</span>
</div>
```

## Spinner

**When:** a real operation is running without a meaningful percentage.

**Structure:** a small Tabler loading icon with `role="status"` and default label `Loading`.

**Motion:** **900ms linear**, infinite only while the operation is mounted.

**Reduced motion:** static loading icon with the same accessible label.

**Accessibility:** replace the generic label with the actual operation. Don't leave an active spinner after work completes; do not combine several duplicate loading announcements.

```tsx
import { Spinner } from "@sift-design/ui/spinner";
<Spinner aria-label="Uploading attachment" />
```

## Progress

**When:** the completed fraction is actually known, not for fabricated activity.

**Structure:** Radix root with value/max → indicator; a thin **4px** track and `--good` fill. Caller provides a label and optional visible numerator/denominator.

**Motion:** fill uses `scaleX`, **spring.smooth**. Decreases, such as an unticked item or a reset, ease back on the shorter **spring.exit** with no overshoot, so the bar visibly follows the change without a slow sweep. Value is clamped to its visual range; custom `max` is honored. With unknown value the control is indeterminate, not a fake percentage; use a Spinner alongside explanatory text if work has no measurable extent.

**Reduced motion:** fill updates instantly.

**Accessibility:** `value` and `max` reach the Radix root. Always supply `aria-label` or `aria-labelledby`; show meaningful units when possible.

```tsx
import { Progress } from "@sift-design/ui/progress";
<Progress value={3} max={6} aria-label="Files uploaded" aria-valuetext="3 of 6 files" />
```

## Separator

**When:** a thin line clarifies a boundary between different information groups.

**Structure:** one horizontal or vertical Radix separator.

**Motion:** **0ms**, no entrance or shimmer.

**Reduced motion:** identical.

**Accessibility:** decorative by default; use `decorative={false}` when the distinction has structural meaning. Give vertical separators an explicit container height.

```tsx
import { Separator } from "@sift-design/ui/separator";
<Separator decorative={false} />
```

## Scroll area

**When:** a related set of content must remain within a bounded region. Prefer normal page scrolling when no boundary is needed.

**Structure:** root → viewport → content, scrollbar and corner. A vertical scrollbar is included; add `ScrollBar orientation="horizontal"` when needed.

**Motion:** direct scrolling with **140ms settle** scrollbar color feedback, no automatic smooth scroll.

**Reduced motion:** direct scrolling remains; no animated travel is added.

**Accessibility:** label the region and keep the scrollable viewport keyboard-focusable. Ensure the content can also be read in DOM order; don't create an unlabeled nested scroll trap.

```tsx
import { ScrollArea } from "@sift-design/ui/scroll-area";
<ScrollArea className="h-48" aria-label="Release notes">
  {releases.map(release => <p key={release.id}>{release.summary}</p>)}
</ScrollArea>
```

## Resizable

**When:** two adjacent content panels benefit from user-controlled proportions, such as an editor and preview.

**Structure:** panel group → panel + handle + panel. `orientation` selects the layout. `withHandle` makes the grip visible.

**Motion:** direct pointer/keyboard manipulation, **0ms** layout tween; handle color feedback **140ms settle**.

**Reduced motion:** identical direct manipulation.

**Accessibility:** give the separator a label. The underlying library supplies separator values and arrow-key resizing. Set sensible minimum sizes; never animate size after every pointer movement.

```tsx
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@sift-design/ui/resizable";
<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel defaultSize="40%" minSize="25%">Document editor</ResizablePanel>
  <ResizableHandle withHandle aria-label="Resize editor and preview panels" />
  <ResizablePanel defaultSize="60%" minSize="30%">Document preview</ResizablePanel>
</ResizablePanelGroup>
```

## Aspect ratio

**When:** reserve a media region's proportions before an image or video loads.

**Structure:** a Radix ratio wrapper in a width-constrained parent.

**Motion:** **0ms**. Reserving space prevents layout shift; the wrapper does not add an entrance animation.

**Reduced motion:** identical.

**Accessibility:** provide meaningful alt text on media; the layout wrapper is not itself an image.

```tsx
import { AspectRatio } from "@sift-design/ui/aspect-ratio";
<AspectRatio ratio={16 / 9}><img src="/library.webp" alt="Reading room with oak tables beside tall windows" className="size-full object-cover" /></AspectRatio>
```

## Breadcrumb

**When:** show location within a hierarchy, not a record's sequential progress.

**Structure:** nav → list → linked ancestor items + decorative separators + current page.

**Motion:** link feedback **140ms settle**, no path travel or mount entrance.

**Reduced motion:** color feedback remains.

**Accessibility:** the nav has an accessible label; the current page exposes `aria-current`. Separators are hidden from assistive technology. Keep meaningful link text and real URLs.

```tsx
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@sift-design/ui/breadcrumb";
<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/library">Library</BreadcrumbLink></BreadcrumbItem>
  <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Field guides</BreadcrumbPage></BreadcrumbItem>
</BreadcrumbList></Breadcrumb>
```

## Pagination

**When:** deliberate pages of comparable records, with stable locations.

**Structure:** navigation → content list → items containing previous, numbered links and next. Active link exposes `aria-current="page"`.

**Motion:** state/color feedback **140ms settle**; pagination does not animate the whole record set by itself.

**Reduced motion:** identical feedback, no travel.

**Accessibility:** use real URLs, descriptive page labels and disabled-state handling. Disabled links must not navigate through mouse **or keyboard**. Preserve focus after a client-side update and announce the resulting page when appropriate.

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext } from "@sift-design/ui/pagination";
<Pagination><PaginationContent>
  <PaginationItem><PaginationLink href="?page=1" isActive aria-label="Page 1">1</PaginationLink></PaginationItem>
  <PaginationItem><PaginationLink href="?page=2" aria-label="Page 2">2</PaginationLink></PaginationItem>
  <PaginationItem><PaginationNext href="?page=2" /></PaginationItem>
</PaginationContent></Pagination>
```

## Carousel

**When:** browse a small, finite collection of related items, such as product images. Keep movement user-controlled so people can read and interact at their own pace.

**Structure:** region → content viewport → items; previous/next controls use the same context. The caller labels the region.

**Motion:** arrow/button navigation uses **spring.smooth** with release velocity. Pointer-down stops the current spring at its current value; dragging is 1:1 within the snaps and uses `rubberBand(overshoot, viewportDimension)` outside them. Release projects **180ms** of velocity to select the nearest destination, then continues with that velocity on the spring. Embla supplies geometry and snap identity; the Motion value owns transform. Button input retargets the same value.

**Reduced motion:** button/arrow movement is immediate; direct dragging remains.

**Accessibility:** previous/next labels are supplied. Left/right arrows work while focus is inside; keep controls reachable and avoid clipping them at narrow widths. Slide content remains ordinary DOM content.

```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@sift-design/ui/carousel";
<Carousel aria-label="Product views" className="mx-12">
  <CarouselContent>{images.map(image => <CarouselItem key={image.id}><img src={image.src} alt={image.alt} /></CarouselItem>)}</CarouselContent>
  <CarouselPrevious /><CarouselNext />
</Carousel>
```

## Chart

**When:** a chart makes a pattern or comparison clearer than prose. Keep a data table available; don't use a chart as decoration.

**Structure:** `ChartContainer config` supplies named series and CSS variables; Recharts draws the chart and axes; `ChartTooltip` + content shows details on hover; `ChartLegend` + content names series. Use thin bars or lines, a low-contrast grid, **2px surface-colored strokes between stacked segments**, and **4px end radii**.

**Category colors:** assign `--cat-1` through `--cat-8` to the categories in your data and keep each category's color when filtering. Those tokens are a palette, not a required set of categories or a limit on the dataset. For larger sets, use filtering, direct labels, small multiples (separate charts with shared scales), or a table rather than relying on more colors. Group categories under Other only when the grouping is meaningful. Series config keys and React keys must be stable. Text uses `--ink` / `--muted`, not series colors. Both palettes pass the repository's color-vision checks; some fills are below 3:1 against the surface, so provide labels, details, and a data table rather than relying on color alone. Forced colors outlines the chart shapes; the table remains the complete non-color equivalent.

**Motion:** kit disables Recharts' repeated data-update animations. Bar rectangles grow from the baseline **538ms `--spring-smooth` once on mount**, vertical bars from bottom, horizontal bars from left (`data-layout="vertical"` on the container). Existing keyed bars do not replay on data updates. Tooltip follows the pointer immediately (**0ms** position animation). For custom chart shapes, use equivalent baseline growth and avoid perpetual animation.

**Reduced motion:** bar mount is a **140ms linear fade**, with no scale. Tooltip remains immediate.

**Accessibility:** use Recharts `accessibilityLayer`, label the chart and units, preserve the keyboard path, include a legend for multiple series and provide an accessible table. The table is also the print/forced-color fallback. Never use dual axes. The specimen's values are explicitly illustrative, not fabricated product metrics.

```tsx
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@sift-design/ui/chart";
const config = { delivery: { label: "Delivery", color: "var(--cat-1)" }, collection: { label: "Store collection", color: "var(--cat-2)" } };
<ChartContainer config={config} className="h-56 w-full" aria-label="Illustrative orders by fulfillment method and month, order count">
  <BarChart data={months} accessibilityLayer barSize={16}>
    <XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="delivery" fill="var(--color-delivery)" radius={[4, 4, 0, 0]} />
    <Bar dataKey="collection" fill="var(--color-collection)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ChartContainer>
// Place the equivalent semantic table beside or beneath the chart.
```

## Attachment

**When:** show a file in a message, upload form, document list, or record detail.

**Structure:** root with `state` → media + content (title and description) + optional actions. States are `idle`, `uploading`, `processing`, `error`, `done`; size and orientation variants remain available.

**Motion:** state/interactive color feedback **140ms settle**. No decorative loop; real progress can use `Progress`, active work can use `Spinner`.

**Reduced motion:** color feedback remains; embedded progress/spinners follow their own reduced-motion behavior.

**Accessibility:** name the file, format and state in text. If it opens/downloads, provide a real link or button with that action. An icon or thumbnail alone is insufficient. Error copy names recovery.

```tsx
import { IconFileText } from "@tabler/icons-react";
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription } from "@sift-design/ui/attachment";
<Attachment state="done"><AttachmentMedia><IconFileText aria-hidden /></AttachmentMedia>
  <AttachmentContent><AttachmentTitle>November invoice.pdf</AttachmentTitle>
    <AttachmentDescription>PDF · 84 KB · ready</AttachmentDescription></AttachmentContent>
</Attachment>
```

## Bubble

**When:** visually group a short message within a conversation. A conversation can be a full product view or supporting content beside another view.

**Structure:** bubble → content; optional group and reactions. Default has a muted fill; `outline` adds a border for distinction where useful. Maximum width keeps lines readable. Corners are **8px**.

**Motion:** **0ms** of its own; inherit the containing message's one-time arrival, never animate each token.

**Reduced motion:** identical static content; parent arrival becomes a fade.

**Accessibility:** put speaker attribution outside the bubble in the message header. Reactions must be named controls, not color/emoji-only state. Keep text selectable.

```tsx
import { Bubble, BubbleContent } from "@sift-design/ui/bubble";
<Bubble variant="outline"><BubbleContent>Could you confirm the delivery address?</BubbleContent></Bubble>
```

## Marker

**When:** a date boundary, system event or quiet chronology inside a feed.

**Structure:** marker → optional decorative icon + content. `separator` adds two thin lines; `border` adds a bottom rule. Time elements use mono.

**Motion:** **0ms**; date and event labels remain still as the feed updates.

**Reduced motion:** identical.

**Accessibility:** use a real `time` with `dateTime`; meaningful event text remains available without the icon. Decorative icons are hidden.

```tsx
import { Marker, MarkerContent } from "@sift-design/ui/marker";
<Marker variant="separator"><MarkerContent>Today · <time dateTime="2026-11-10T09:20">09:20</time></MarkerContent></Marker>
```

## Message

**When:** display who sent a message in a customer conversation, team discussion, or assistant exchange. It can be the primary content of the page.

**Structure:** message/group → optional avatar + content → header, bubble/body, footer. `align="end"` identifies the person's outgoing message without relying on color.

**Motion:** optional newly inserted `arrival` uses **spring.smooth**; exits scale on **spring.exit** with a **120ms leave** fade; position layout uses `reflowTransition`. Existing text and streaming tokens never re-animate. In a scroller, put `layout` on a stable wrapper around the entire scroller item so insert/remove/reorder reflows the utterance and its attribution together.

**Reduced motion:** new messages fade **140ms linear**.

**Accessibility:** name the speaker; identify automated messages when present. Add a source or action summary when useful, not as a requirement for every message. Let the enclosing scroller log announce additions; avoid duplicate live regions on every message. Use stable message IDs.

```tsx
import { Message, MessageContent, MessageHeader, MessageFooter } from "@sift-design/ui/message";
import { Bubble, BubbleContent } from "@sift-design/ui/bubble";
<Message arrival><MessageContent><MessageHeader>Alex Lee · Customer support</MessageHeader>
  <Bubble variant="outline"><BubbleContent>Your updated delivery address is now on the order.</BubbleContent></Bubble>
  <MessageFooter><time dateTime="2026-11-10T09:20">09:20</time></MessageFooter>
</MessageContent></Message>
```

## Message scroller

**When:** a bounded exchange should follow new messages while preserving the reader's position when they scroll back.

**Structure:** provider → root → viewport → content → keyed items, plus a jump-to-end button. The provider defaults to `autoScroll`, bottom start and a **40px** bottom threshold. The primitive observes content/viewport size; prepending older messages preserves the reader's current position.

**Motion:** following uses direct **0ms** scroll changes, not restarted smooth-scroll animations on each token. User scrolling releases the bottom pin; the end button explicitly resumes it. The jump button enters on **spring.snappy** with a **140ms linear** fade and leaves on **spring.exit** with an **80ms leave** fade. Translate and scale transitions reverse from their current values; there is no second transform animation. Keep `scrollAnchor` off ordinary messages to avoid unwanted jumps to message starts.

**Reduced motion:** no scroll tween; button feedback is a **140ms** fade in / **80ms** fade out, with vertical travel and scale removed.

**Accessibility:** viewport is a labeled keyboard-focusable region; content has `role="log"` with `aria-relevant="additions"`, so token edits do not repeatedly announce the entire message. Every item needs a stable `messageId` for anchoring. Don't mark token updates as new messages.

```tsx
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport,
  MessageScrollerContent, MessageScrollerItem, MessageScrollerButton } from "@sift-design/ui/message-scroller";
<MessageScrollerProvider><MessageScroller className="h-80">
  <MessageScrollerViewport aria-label="Customer support conversation">
    <MessageScrollerContent>{messages.map(message => <MessageScrollerItem key={message.id} messageId={message.id}>
      {message.content}
    </MessageScrollerItem>)}</MessageScrollerContent>
  </MessageScrollerViewport><MessageScrollerButton />
</MessageScroller></MessageScrollerProvider>
```

## Direction

**When:** Radix components need a shared left-to-right or right-to-left interaction context.

**Structure:** `DirectionProvider dir` around a subtree; `useDirection` reads the context. It does not replace the HTML `dir` attribute.

**Motion:** **0ms**; the provider sets reading direction and does not animate content.

**Reduced motion:** identical.

**Accessibility:** match provider direction to the document/subtree's actual language and `dir` attribute. Prefer logical properties (`start`, `end`) in child layouts. Do not reverse meaningful content order with CSS merely to mirror a layout.

```tsx
import { DirectionProvider } from "@sift-design/ui/direction";
<DirectionProvider dir="ltr"><section dir="ltr" aria-label="Account settings">{/* Settings */}</section></DirectionProvider>
```

## Page transition: SiblingTransition

**When:** switch between peer destinations without implying that one is deeper than another.

**Structure:** keyed `SiblingTransition` frame → one page containing a real heading. `pageKey` identifies the destination; `direction` is `1` forward / `-1` back in reading order. `dir` can override the inherited reading direction; `pageClassName` styles the page independently of its clipped frame. The frame clips with `overflow: clip`, not `overflow: hidden`, so it does not become a scroll container. Sticky content inside a page, such as an outline, stays in place while the page scrolls.

**Motion:** `pageMotion` uses **spring.smooth** for the 14px arrival drift, with a **200ms linear** cross-fade. Exit drifts 10px in the opposite direction on **spring.exit**, with **140ms leave** opacity. Both pages occupy one grid cell; input is never delayed. A leaving page becomes inert and hidden from assistive technology immediately, while the new page heading receives focus without scrolling. Initial render does not steal focus. Set `focusHeading={false}` only if the caller already manages focus.

**Reduced motion:** **140ms** entrance / **80ms** exit cross-fade only. No travel.

**Accessibility:** headings name each page, departed content cannot be tabbed into, and direction follows the actual reading direction. Tabs must retain the tab/list/panel relationships and arrow-key navigation. For a tabbed view, set `focusHeading={false}` and move focus to the selected tab on arrow input; keep heading focus enabled for route-style destinations.

```tsx
import { SiblingTransition } from "@sift-design/ui/page-transition";
<SiblingTransition pageKey={destination.id} direction={direction} className="min-h-80">
  <section><h2 data-page-heading>{destination.title}</h2>{destination.content}</section>
</SiblingTransition>
```

## Page transition: PushStack

**When:** drill from a collection into a detail and return without losing the spatial relationship.

**Structure:** `PushStack` accepts the same props as `SiblingTransition`; the caller owns route/history state. Set `direction={1}` to open details, `-1` to return. Its clipped grid holds entering and departing pages at the same time, with the closing detail above the restored list.

**Motion:** `pushMotion` uses **spring.smooth** on wide frames: new content enters 56px from the trailing edge while the old page retreats 28px and dims to **brightness(.94)**. Below 768px it uses **spring.travel**, with a full-width entry and **28%** retreat for the previous page. Back reverses this relationship; right-to-left reading mirrors physical travel without swapping push and pop semantics. Opacity is **200ms** in / **160ms** out on wide screens; narrow pages stay opaque and overlap spatially. Repeated navigation retargets without an input lock.

**Reduced motion:** **140ms** entrance / **80ms** exit cross-fade, no travel or dimming filter.

**Accessibility:** the new heading is focused immediately; exiting pages are inert, not duplicate interactive pages. Give the detail an explicit back action. History integration and scroll restoration remain caller responsibilities.

```tsx
import { PushStack } from "@sift-design/ui/page-transition";
<PushStack pageKey={product ? product.id : "catalog"} direction={product ? 1 : -1} className="min-h-80">
  {product ? <section><button onClick={back}>Back to catalog</button><h2 data-page-heading>{product.name}</h2></section>
    : <section><h2 data-page-heading>Catalog</h2>{productList}</section>}
</PushStack>
```

## Scroll title

**When:** a page or scrollable panel benefits from keeping its title visible as the reader scrolls.

**Structure:** sticky fixed-height header → real heading; pass the scroll container ref or omit it for the page viewport. The header reserves **80px** throughout; the heading uses the documented **30px** title step. Only the heading's transform changes.

**Motion:** `useScroll` and `useTransform` map the first **96px** of scrolling to scale **1 → .72** and opacity **1 → .86**. It is scroll-linked 1:1, not an independently running tween; no React state updates per scroll frame and no relayout. `distance` changes the mapping range. Transform origin follows reading direction.

**Reduced motion:** title remains at full size and full opacity, sticky geometry unchanged.

**Accessibility:** one heading remains in the document outline. Give the scroll region an accessible name and keyboard access; the heading is a valid focus destination for page changes.

```tsx
import { useRef } from "react";
import { ScrollTitle } from "@sift-design/ui/scroll-title";
const scroll = useRef<HTMLDivElement>(null);
<div ref={scroll} role="region" tabIndex={0} aria-label="Release notes" className="h-80 overflow-y-auto">
  <ScrollTitle container={scroll}>Release notes</ScrollTitle>{releaseNotes}
</div>
```

## Live examples and verification

The live section is `specimen/?section=display`, with `?theme=dark` supported. Its greenhouse navigation, task records, time chart, and helper conversation are optional demonstrations; choose your product's own content and structure. Capture `node scripts/capture.mjs specimen --shots shots/display.mjs --axe`. The shot set includes both full-page themes, expanded/collapsed sidebars, 390px mobile sheets, chart/table/empty/alert close-ups, tooltip inspection and collapse/disclosure/selection filmstrips. Screenshot names begin `display-` under `screenshots/specimen/`.

Real-time recordings are `display-motion-*.webp`: sidebar collapse, navigation selection, page switching, opening details and returning, expandable content, list reflow, carousel drag, message arrival, and mobile sheet dismissal. Mobile variants use a 390px viewport. Filmstrips show the animation frame by frame.

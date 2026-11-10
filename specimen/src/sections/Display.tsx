import { useRef, useState } from "react";
import { IconSun, IconListCheck, IconPlant2, IconClock, IconRobot, IconSettings, IconChevronDown, IconCheck, IconAlertTriangle, IconCircleX, IconFileText, IconPlus, IconInbox, IconArrowRight, IconDroplet } from "@tabler/icons-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { arrivalMotion, reflowTransition, selectionSpring } from "@sift-design/tokens/motion";
import { SiblingTransition, PushStack } from "@sift-design/ui/page-transition";
import { ScrollTitle } from "@sift-design/ui/scroll-title";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { SpecimenGroup, SpecimenItem } from "../frame";
import { LarkspurMark } from "../../../blocks/_shared/brand";
import { Button } from "@sift-design/ui/button";
import { Sidebar, SidebarProvider, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarTrigger, SidebarInset, useSidebar } from "@sift-design/ui/sidebar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@sift-design/ui/accordion";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@sift-design/ui/collapsible";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@sift-design/ui/card";
import { ItemGroup, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@sift-design/ui/item";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@sift-design/ui/table";
import { Badge } from "@sift-design/ui/badge";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@sift-design/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@sift-design/ui/alert";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@sift-design/ui/empty";
import { Skeleton } from "@sift-design/ui/skeleton";
import { Spinner } from "@sift-design/ui/spinner";
import { Progress } from "@sift-design/ui/progress";
import { Separator } from "@sift-design/ui/separator";
import { ScrollArea, ScrollBar } from "@sift-design/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@sift-design/ui/resizable";
import { AspectRatio } from "@sift-design/ui/aspect-ratio";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@sift-design/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@sift-design/ui/pagination";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@sift-design/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@sift-design/ui/chart";
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription } from "@sift-design/ui/attachment";
import { Bubble, BubbleContent } from "@sift-design/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@sift-design/ui/marker";
import { Message, MessageContent, MessageHeader, MessageFooter, MessageAvatar } from "@sift-design/ui/message";
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton } from "@sift-design/ui/message-scroller";
import { DirectionProvider } from "@sift-design/ui/direction";

const tasks = ["Pot on 120 lavender plugs", "Aphids on the pepper starts, bench 4", "Check misting nozzles in the propagation house", "Reply to Hollins Florist about the 40-tray order", "Restock the herb bench before Saturday", "Calibrate soil-moisture probe 3"];
const destinations = [
  { label: "Today", icon: IconSun, count: 4 },
  { label: "All tasks", icon: IconListCheck, count: 18 },
  { label: "Growing areas", icon: IconPlant2 },
  { label: "Activity", icon: IconClock },
  { label: "Helpers", icon: IconRobot, count: 4 },
];

function NavigationDemo() {
  const [selected, select] = useState("Today");
  const { setOpenMobile } = useSidebar();
  return <>
    <Sidebar position="relative" collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center gap-3 overflow-hidden px-2">
          <LarkspurMark size={32} className="shrink-0" />
          <span data-sidebar-label className="text-lg font-semibold">Larkspur</span>
        </div>
        <span data-sidebar-label className="px-3 text-xs text-[var(--rail-muted)]">Fernbrook Greenhouse</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <nav aria-label="Greenhouse navigation"><SidebarMenu>
            {destinations.map(({ label, icon: Icon, count }) => <SidebarMenuItem key={label}>
              <SidebarMenuButton aria-label={label} tooltip={label} isActive={selected === label} onClick={() => { select(label); setOpenMobile(false); }}><Icon aria-hidden /><span>{label}</span></SidebarMenuButton>
              {count !== undefined && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
            </SidebarMenuItem>)}
          </SidebarMenu></nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter><SidebarMenu><SidebarMenuItem><SidebarMenuButton aria-label="Settings" tooltip="Settings" isActive={selected === "Settings"} onClick={() => select("Settings")}><IconSettings aria-hidden /><span>Settings</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarFooter>
    </Sidebar>
    <SidebarInset className="min-w-0 gap-5 p-6">
      <header className="flex items-center gap-3"><SidebarTrigger /><Separator orientation="vertical" className="h-5" /><span className="font-medium">{selected}</span><span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:inline">Tue 10 Nov</span></header>
      <div><h4 className="text-xl font-semibold">A little room to grow</h4><p className="mt-1 max-w-[48ch] text-sm text-muted-foreground">The morning work at Fernbrook, with each handoff in view.</p></div>
      <div className="divide-y rounded-md border">
        {tasks.slice(0, 3).map((task, i) => <div key={task} className="flex items-start gap-3 px-3 py-3 text-sm"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-muted-foreground"><IconPlant2 size={13} /></span><span className="min-w-0 flex-1">{task}</span>{i === 0 && <Badge variant="warning">High</Badge>}</div>)}
      </div>
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground"><IconCheck size={14} aria-hidden /><span>All changes saved on this device</span></div>
    </SidebarInset>
  </>;
}

const categories = ["Growing", "Inspection", "Meetings and calls", "Messages", "Admin", "Research", "Writing", "Other"];
const activity = [
  { day: "Mon 9", c1: 125, c2: 35, c3: 25, c4: 30, c5: 20, c6: 35, c7: 15, c8: 15 },
  { day: "Tue 10", c1: 95, c2: 45, c3: 15, c4: 25, c5: 15, c6: 20, c7: 30, c8: 10 },
  { day: "Wed 11", c1: 110, c2: 30, c3: 40, c4: 20, c5: 25, c6: 15, c7: 20, c8: 10 },
];
const chartConfig = Object.fromEntries(categories.map((label, i) => [`c${i + 1}`, { label, color: `var(--cat-${i + 1})` }])) satisfies ChartConfig;
function ActivityChart() {
  return <div className="w-full min-w-0">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><h4 className="font-medium">Time by category</h4><span className="text-xs text-muted-foreground">Illustrative week · minutes</span></div>
    <ChartContainer config={chartConfig} data-layout="vertical" className="h-[260px] w-full aspect-auto" aria-label="Illustrative time by category from Monday to Wednesday">
      <BarChart data={activity} layout="vertical" barSize={18} margin={{ left: 0, right: 12, top: 4, bottom: 0 }} accessibilityLayer>
        <CartesianGrid horizontal={false} stroke="var(--line)" strokeDasharray="2 5" />
        <XAxis type="number" domain={[0, 360]} ticks={[0, 120, 240, 360]} axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: "var(--muted)", fontFamily: "var(--font-code)", fontSize: 11 }} />
        <YAxis type="category" dataKey="day" tick={{ fill: "var(--muted)" }} axisLine={false} tickLine={false} width={60} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${label} · minutes`} />} />
        <ChartLegend content={<ChartLegendContent className="flex-wrap justify-start gap-x-5 gap-y-2 pt-5" />} />
        {categories.map((_, i) => <Bar key={i} dataKey={`c${i + 1}`} stackId="time" fill={`var(--color-c${i + 1})`} stroke="var(--surface)" strokeWidth={2} radius={i === 7 ? [0, 4, 4, 0] : 0} />)}
      </BarChart>
    </ChartContainer>
    <details className="mt-4 text-xs"><summary className="w-fit cursor-pointer rounded text-muted-foreground underline underline-offset-4 focus-visible:outline-2">View chart data</summary><div className="mt-3"><Table><TableHeader><TableRow><TableHead>Category</TableHead>{activity.map(d => <TableHead key={d.day} className="text-right">{d.day}</TableHead>)}</TableRow></TableHeader><TableBody>{categories.map((label, i) => <TableRow key={label}><TableCell>{label}</TableCell>{activity.map(d => <TableCell key={d.day} numeric>{d[`c${i + 1}` as keyof typeof d]}</TableCell>)}</TableRow>)}</TableBody></Table></div></details>
  </div>;
}

function PageMotionDemo() {
  const [tab, setTab] = useState(0);
  const [siblingDirection, setSiblingDirection] = useState<1 | -1>(1);
  const [detail, setDetail] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduced = !!useReducedMotion();
  const labels = ["Today’s work", "Helpers"];
  return <div className="grid w-full min-w-0 gap-4 md:grid-cols-2">
    <div data-page-demo="siblings" className="min-w-0 overflow-hidden rounded-md border">
      <LayoutGroup id="specimen-siblings"><div role="tablist" aria-label="Workbench destinations" className="flex gap-1 border-b p-2">{labels.map((label, index) => <button key={label} role="tab" id={`work-tab-${index}`} aria-selected={tab === index} aria-controls="work-sibling-panel" tabIndex={tab === index ? 0 : -1} onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setSiblingDirection(tab === 0 ? 1 : -1); setTab(tab === 0 ? 1 : 0); document.getElementById(`work-tab-${tab === 0 ? 1 : 0}`)?.focus(); } }} onClick={() => { setSiblingDirection(index > tab ? 1 : -1); setTab(index); }} className="relative rounded-md px-3 py-2 text-sm">{tab === index && <motion.span layoutId="work-tab-selection" transition={reduced ? { duration: 0 } : selectionSpring} className="absolute inset-0 rounded-md bg-muted" />}<span className="relative">{label}</span></button>)}</div></LayoutGroup>
      <SiblingTransition focusHeading={false} pageKey={String(tab)} direction={siblingDirection} className="min-h-[270px]" pageClassName="p-5">
        <section role="tabpanel" id="work-sibling-panel" aria-labelledby={`work-tab-${tab}`}><h4 data-page-heading className="text-lg font-semibold">{labels[tab]}</h4><p className="mt-2 text-sm text-muted-foreground">{tab === 0 ? "Three tasks ready for the morning at Fernbrook." : "Small helpers, with every action attributed."}</p><div className="mt-5 divide-y text-sm">{(tab === 0 ? tasks.slice(0, 3) : ["Climate watch · next check 10:30", "Order sweep · next check 13:00", "Stock count · Mondays 06:30"]).map(text => <p key={text} className="py-3">{text}</p>)}</div></section>
      </SiblingTransition>
    </div>
    <div data-page-demo="push" className="min-w-0 overflow-hidden rounded-md border"><div className="flex h-[53px] items-center gap-2 border-b px-4"><LarkspurMark size={22} /><span className="text-sm font-medium">Fernbrook work</span></div>
      <PushStack pageKey={detail ? "lavender" : "list"} direction={direction} className="min-h-[270px]" pageClassName="p-5">
        {detail ? <section><Button variant="ghost" size="sm" className="-ml-2 mb-3" onClick={() => { setDirection(-1); setDetail(false); }}>Back to task list</Button><h4 data-page-heading className="text-lg font-semibold">Pot on 120 lavender plugs</h4><p className="mt-2 text-sm text-muted-foreground">Propagation house · John Smith</p><p className="mt-5 text-sm">Move the rooted plugs into 9cm pots. Keep one bench clear for watering.</p><Badge variant="warning" className="mt-4">High priority</Badge></section> : <section><h4 data-page-heading className="text-lg font-semibold">Task list</h4><p className="mt-2 text-sm text-muted-foreground">Open a task to keep its context in view.</p><button className="mt-5 flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left text-sm hover:bg-muted" onClick={() => { setDirection(1); setDetail(true); }}>Pot on 120 lavender plugs<IconArrowRight className="size-4 shrink-0" aria-hidden /></button><p className="mt-4 text-xs text-muted-foreground">Propagation house · due today</p></section>}
      </PushStack>
    </div>
  </div>;
}

function ReflowDemo() {
  const [rows, setRows] = useState([0, 1, 2]);
  return <div className="w-full"><div className="mb-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setRows(r => r.includes(5) ? r : [5, ...r])}>Insert maintenance task</Button><Button variant="ghost" size="sm" onClick={() => setRows(r => [...r].reverse())}>Reverse task order</Button><Button variant="ghost" size="sm" onClick={() => setRows(r => r.slice(1))} disabled={!rows.length}>Remove first task</Button></div><ItemGroup className="relative min-h-[180px]"><AnimatePresence initial={false} mode="popLayout">{rows.map(index => <Item key={index} arrival size="sm" className="border-b px-0"><ItemMedia variant="icon">{index === 5 ? <IconPlant2 /> : <IconDroplet />}</ItemMedia><ItemContent><ItemTitle>{tasks[index]}</ItemTitle><ItemDescription>{index === 5 ? "Maintenance" : "Propagation house"}</ItemDescription></ItemContent><ItemActions><Badge>Open</Badge></ItemActions></Item>)}</AnimatePresence></ItemGroup></div>;
}

function ScrollTitleDemo() {
  const container = useRef<HTMLDivElement>(null);
  return <div ref={container} tabIndex={0} role="region" aria-label="Scroll the growing areas" className="h-[250px] w-full overflow-y-auto rounded-md border"><ScrollTitle container={container}>Growing areas</ScrollTitle><div className="p-5"><p className="mb-5 text-sm text-muted-foreground">Scroll to keep the title close while the work moves below it.</p>{tasks.map(task => <p key={task} className="border-b py-4 text-sm">{task}</p>)}</div></div>;
}

function Conversation() {
  const [sent, setSent] = useState(false);
  const [reversed, reverse] = useState(false);
  const reduced = !!useReducedMotion();
  return <div className="w-full">
    <MessageScrollerProvider><MessageScroller className="h-[300px] rounded-md border bg-background"><MessageScrollerViewport className="p-4" aria-label="Larkspur assistant conversation"><MessageScrollerContent>
      <MessageScrollerItem messageId="day"><Marker variant="separator"><MarkerContent><time dateTime="2026-11-10T09:20">Today · 09:20</time></MarkerContent></Marker></MessageScrollerItem>
      <MessageScrollerItem messageId="question"><Message align="end"><MessageContent><MessageHeader>Jane Doe</MessageHeader><Bubble><BubbleContent>What needs attention in the propagation house?</BubbleContent></Bubble></MessageContent></Message></MessageScrollerItem>
      <MessageScrollerItem messageId="answer"><Message><MessageAvatar><LarkspurMark size={28} /></MessageAvatar><MessageContent><MessageHeader>Larkspur assistant <Badge variant="secondary" className="ml-2"><IconRobot aria-hidden />Helper</Badge></MessageHeader><Bubble variant="outline"><BubbleContent>Climate watch filed a misting check. The house hit 31°C at 14:10 yesterday, while the vents were closed.</BubbleContent></Bubble><MessageFooter>From the greenhouse sensor hub</MessageFooter></MessageContent></Message></MessageScrollerItem>
      <AnimatePresence initial={false}>{(sent ? (reversed ? ["handoff", "source"] : ["source", "handoff"]) : []).map(id => <motion.div key={id} layout={!reduced} transition={{ layout: reflowTransition(reduced) }} {...arrivalMotion(reduced)}><MessageScrollerItem messageId={id}><Message><MessageContent><MessageHeader>Larkspur assistant</MessageHeader><Bubble variant="outline"><BubbleContent>{id === "handoff" ? "The misting check is ready for John. Open the task to add a due time." : "Climate watch attached the sensor reading so the next check has context."}</BubbleContent></Bubble></MessageContent></Message></MessageScrollerItem></motion.div>)}</AnimatePresence>
    </MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton /></MessageScroller></MessageScrollerProvider>
    <Button variant="outline" size="sm" className="mt-3" disabled={sent} onClick={() => setSent(true)}>{sent ? "Handoff recorded" : "Hand the misting check to John"}<IconArrowRight /></Button>{sent && <><Button variant="ghost" size="sm" className="ml-2 mt-3" onClick={() => reverse(v => !v)}>Reverse follow-ups</Button><Button variant="ghost" size="sm" className="mt-3" onClick={() => setSent(false)}>Remove follow-ups</Button></>}
  </div>;
}

export default function Display() {
  const [progress, setProgress] = useState(50);
  const [page, setPage] = useState(1);
  const [tableRows, setTableRows] = useState([0, 1, 2, 3]);
  const [emptyStarted, start] = useState(false);
  return <SpecimenGroup id="display" title="Display and layout" intro="Anchored navigation, quiet work surfaces, and clear handoffs. Motion follows a change in the work, never the decoration around it.">
    <SpecimenItem name="Sidebar" wide note="A 256px workbench rail becomes a 72px icon rail. Labels fade before reflow; the coral selection travels between destinations.">
      <div data-display-demo className="h-[440px] w-full overflow-hidden rounded-lg border"><SidebarProvider className="h-full min-h-0"><NavigationDemo /></SidebarProvider></div>
    </SpecimenItem>
    <SpecimenItem name="Page transitions" wide note="Sibling destinations drift and cross-fade. A deeper task pushes from the trailing edge while the previous page recedes; back reverses the journey."><PageMotionDemo /></SpecimenItem>
    <SpecimenItem name="Scroll title" note="A continuous scroll-linked title shrinks into its sticky header without relaying out the work."><ScrollTitleDemo /></SpecimenItem>
    <SpecimenItem name="Breadcrumb" note="Keep location legible without competing with the page title. Links respond in 140ms."><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#display">Fernbrook</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#display">Growing areas</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Propagation house</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></SpecimenItem>
    <SpecimenItem name="Pagination" note="Use for deliberate pages of records, not an endless feed. The current page is explicit."><div className="w-full"><Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#display" aria-disabled={page === 1} onClick={e => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} className={page === 1 ? "pointer-events-none opacity-40" : ""} /></PaginationItem>{[1, 2, 3].map(n => <PaginationItem key={n}><PaginationLink href="#display" aria-label={`Page ${n}`} isActive={page === n} onClick={e => { e.preventDefault(); setPage(n); }}>{n}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#display" aria-disabled={page === 3} onClick={e => { e.preventDefault(); setPage(Math.min(3, page + 1)); }} className={page === 3 ? "pointer-events-none opacity-40" : ""} /></PaginationItem></PaginationContent></Pagination><p className="mt-2 text-center text-xs text-muted-foreground">Task records · page <span className="font-mono">{page}</span> of <span className="font-mono">3</span></p></div></SpecimenItem>
    <SpecimenItem name="Accordion" note="Related explanations, one open at a time. Measured content and its chevron settle on interruptible springs."><Accordion type="single" collapsible className="w-full"><AccordionItem value="sensors"><AccordionTrigger>Why did Climate watch file this task?</AccordionTrigger><AccordionContent>The propagation house hit 31°C at 14:10. The vents were closed. Check the misting nozzles before the next warm afternoon.</AccordionContent></AccordionItem><AccordionItem value="schedule"><AccordionTrigger>When does it check again?</AccordionTrigger><AccordionContent>Every 30 minutes between 06:00 and 20:00. A failed check does not stop the schedule.</AccordionContent></AccordionItem></Accordion></SpecimenItem>
    <SpecimenItem name="Collapsible" note="One optional detail inside the work. The trigger chevron and measured content move together."><Collapsible className="w-full"><CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm font-medium hover:bg-muted focus-visible:outline-2">Market crate checklist <IconChevronDown size={16} aria-hidden /></CollapsibleTrigger><CollapsibleContent><ul className="space-y-2 px-2 pb-3 pt-2 text-sm text-muted-foreground">{["6 crates", "Price cards", "Card reader charged", "Float"].map(t => <li key={t} className="flex gap-2"><IconCheck size={16} aria-hidden />{t}</li>)}</ul></CollapsibleContent></Collapsible></SpecimenItem>
    <SpecimenItem name="Card" note="A persistent work surface: a hairline, 8px corners, no elevation and no entrance animation."><Card className="w-full gap-4 py-5"><CardHeader className="px-5"><CardTitle>Pot on 120 lavender plugs</CardTitle><CardDescription>Propagation house · due today</CardDescription></CardHeader><CardContent className="px-5 text-sm">Move the rooted plugs into 9cm pots. Keep one bench clear for watering.</CardContent><CardFooter className="gap-2 px-5"><Avatar size="sm"><AvatarFallback>JS</AvatarFallback></Avatar><span className="text-xs text-muted-foreground">John Smith</span><Badge variant="warning" className="ml-auto">High priority</Badge></CardFooter></Card></SpecimenItem>
    <SpecimenItem name="Item" note="Insert, remove, or reorder real keyed rows. Their neighbors reflow on the same spring, without replaying existing arrivals."><ReflowDemo /></SpecimenItem>
    <SpecimenItem name="Table" wide note="36px rows; newly inserted, removed and reordered rows preserve their identity while the table reflows."><div className="w-full"><div className="mb-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setTableRows(r => r.includes(4) ? r : [4, ...r])}>Insert table task</Button><Button size="sm" variant="ghost" onClick={() => setTableRows(r => [...r].reverse())}>Reverse table order</Button><Button size="sm" variant="ghost" disabled={!tableRows.length} onClick={() => setTableRows(r => r.slice(1))}>Remove table task</Button></div><Table><TableCaption>Fernbrook work due this week · illustrative records</TableCaption><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Area</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Estimate</TableHead></TableRow></TableHeader><TableBody><AnimatePresence initial={false}>{tableRows.map(index => { const [task, area, owner, status, estimate] = [[tasks[0], "Propagation house", "John", "In progress", "45 min"], [tasks[3], "Wholesale orders", "Alex", "Open", "15 min"], ["Order 2,000 9cm pots", "Retail benches", "Jane", "Waiting on supplier", "10 min"], ["Sow the second batch of sweet peas", "Propagation house", "John", "Done", "35 min"], [tasks[5], "Maintenance", "Jane", "Open", "20 min"]][index]; return <TableRow key={index} arrival><TableCell className="font-medium">{task}</TableCell><TableCell>{area}</TableCell><TableCell>{owner}</TableCell><TableCell><Badge variant={status === "Done" ? "good" : "secondary"}>{status === "Done" && <IconCheck aria-hidden />}{status}</Badge></TableCell><TableCell numeric>{estimate}</TableCell></TableRow>; })}</AnimatePresence></TableBody></Table></div></SpecimenItem>
    <SpecimenItem name="Badge" note="Quiet 12px labels. Status is always a word or icon, never a colored dot alone."><Badge>seedlings</Badge><Badge variant="secondary"><IconRobot aria-hidden />Climate watch</Badge><Badge variant="good"><IconCheck aria-hidden />Done</Badge><Badge variant="warning"><IconClock aria-hidden />Waiting on supplier</Badge><Badge variant="destructive"><IconCircleX aria-hidden />Failed</Badge></SpecimenItem>
    <SpecimenItem name="Avatar" note="People remain identifiable when an image is missing. Images fade in once; initials are immediate."><div className="flex items-center gap-4"><AvatarGroup><Avatar aria-label="Jane Doe"><AvatarFallback>JD</AvatarFallback></Avatar><Avatar aria-label="John Smith"><AvatarFallback>JS</AvatarFallback></Avatar><Avatar aria-label="Alex Lee"><AvatarFallback>AL</AvatarFallback></Avatar><AvatarGroupCount aria-label="One more person">+1</AvatarGroupCount></AvatarGroup><span className="text-sm text-muted-foreground">Fernbrook team</span></div></SpecimenItem>
    <SpecimenItem name="Alert" wide note="Semantic notices name the state and the recovery. Icons and plain words carry meaning with or without color."><div className="grid w-full gap-3 md:grid-cols-3"><Alert variant="warning"><IconAlertTriangle aria-hidden /><AlertTitle>Climate watch is paused</AlertTitle><AlertDescription>The sensor hub stopped answering at 14:20. Resume the helper when the hub is back.</AlertDescription></Alert><Alert variant="good"><IconCheck aria-hidden /><AlertTitle>Order sweep finished</AlertTitle><AlertDescription>The Hollins Florist order is ready for Alex to review.</AlertDescription></Alert><Alert variant="destructive"><IconCircleX aria-hidden /><AlertTitle>Stock count needs access</AlertTitle><AlertDescription>The inventory sign-in expired. Reconnect the bench inventory sheet to continue.</AlertDescription></Alert></div></SpecimenItem>
    <SpecimenItem name="Empty" note="Teach exactly one next action. Calm, specific copy replaces decorative illustration."><Empty className="w-full gap-4 px-3 py-5 md:p-5"><EmptyHeader><EmptyMedia variant="icon"><IconInbox aria-hidden /></EmptyMedia><EmptyTitle>{emptyStarted ? "Your first market task is ready" : "No market preparation yet"}</EmptyTitle><EmptyDescription>{emptyStarted ? "Prepare Saturday market crates has been added to Retail benches." : "Start with the crate checklist so Sam knows what to pack for Saturday."}</EmptyDescription></EmptyHeader><EmptyContent><Button size="sm" disabled={emptyStarted} onClick={() => start(true)}><IconPlus />{emptyStarted ? "Checklist added" : "Add the market checklist"}</Button></EmptyContent></Empty></SpecimenItem>
    <SpecimenItem name="Progress" note="Real completion follows a smooth spring; resets are immediate rather than a dramatic reverse sweep."><div className="w-full space-y-4"><div className="flex justify-between text-sm"><span>Market crates packed</span><span className="font-mono text-xs">{Math.round(progress / 100 * 6)} / 6</span></div><Progress value={progress} aria-label="Market crates packed" /><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 100 / 6))} disabled={progress >= 100}>Pack one crate</Button><Button size="sm" variant="ghost" onClick={() => setProgress(0)}>Reset</Button></div></div></SpecimenItem>
    <SpecimenItem name="Skeleton" note="A calm 1.8s shimmer, limited to two passes. Reduced motion is a static placeholder."><div aria-label="Loading task details" role="status" className="flex w-full items-center gap-3"><Skeleton className="size-9 shrink-0 rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><span className="sr-only">Loading task details</span></div></SpecimenItem>
    <SpecimenItem name="Spinner" note="Only active work loops. A 900ms rotation becomes a static loading symbol under reduced motion."><div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /><span>Reading the orders inbox</span></div></SpecimenItem>
    <SpecimenItem name="Chart" wide note="Eight fixed categorical slots, thin stacked marks and 2px surface gaps. Marks grow once; hover tooltips never lag."><ActivityChart /></SpecimenItem>
    <SpecimenItem name="Message, bubble and message-scroller" wide note="Attributed assistant work, not a chat-first shell. New messages arrive once; the viewport follows the bottom only while you are already there."><Conversation /></SpecimenItem>
    <SpecimenItem name="Attachment" note="A compact file reference. Processing states use words and genuine progress, not decorative loops."><Attachment><AttachmentMedia><IconFileText aria-hidden /></AttachmentMedia><AttachmentContent><AttachmentTitle>Saturday market checklist.pdf</AttachmentTitle><AttachmentDescription>PDF · 84 KB · ready</AttachmentDescription></AttachmentContent></Attachment></SpecimenItem>
    <SpecimenItem name="Marker" note="Quiet chronology inside a thread. Time uses mono; the separator remains still."><Marker variant="separator"><MarkerIcon><IconClock /></MarkerIcon><MarkerContent>Order sweep finished · <time dateTime="2026-11-10T07:00">07:00</time></MarkerContent></Marker></SpecimenItem>
    <SpecimenItem name="Carousel" note="A small, finite set of related work. Dragging follows your hand, resists at either end, then settles with your release velocity."><Carousel aria-label="Growing areas" className="mx-10 w-[calc(100%-80px)]" opts={{ align: "start" }}><CarouselContent>{["Propagation house", "Polytunnel 2", "Retail benches"].map((area, i) => <CarouselItem key={area}><div className="flex min-h-28 flex-col justify-center rounded-md bg-muted p-4"><IconPlant2 className="mb-2 size-5 text-muted-foreground" aria-hidden /><p className="font-medium">{area}</p><p className="mt-1 text-xs text-muted-foreground">{["Lavender plugs and sweet peas", "Pepper starts · bench 4", "Herbs for Saturday market"][i]}</p></div></CarouselItem>)}</CarouselContent><CarouselPrevious className="-left-10" /><CarouselNext className="-right-10" /></Carousel></SpecimenItem>
    <SpecimenItem name="Scroll area" note="Keep long related lists within their own region. Scrollbars reveal position without repainting the shell."><ScrollArea className="h-36 w-full rounded-md border" aria-label="Fernbrook tasks"><div className="divide-y">{tasks.map(t => <p key={t} className="px-3 py-2.5 text-sm">{t}</p>)}</div><ScrollBar /></ScrollArea></SpecimenItem>
    <SpecimenItem name="Resizable" note="A direct-manipulation divider, not an animated layout. Drag or use the focused separator’s arrow keys."><ResizablePanelGroup orientation="horizontal" className="min-h-36 rounded-md border"><ResizablePanel defaultSize="40%" minSize="25%"><div className="p-3 text-sm"><span className="font-medium">Growing areas</span><p className="mt-2 text-muted-foreground">Propagation house</p></div></ResizablePanel><ResizableHandle withHandle aria-label="Resize area and task panels" /><ResizablePanel defaultSize="60%" minSize="30%"><div className="p-3 text-sm"><span className="font-medium">Task details</span><p className="mt-2 text-muted-foreground">Pot on 120 lavender plugs</p></div></ResizablePanel></ResizablePanelGroup></SpecimenItem>
    <SpecimenItem name="Aspect ratio" note="Reserve the space before media arrives. The frame is geometry, not an entrance effect."><div className="w-full overflow-hidden rounded-md"><AspectRatio ratio={16 / 9} className="flex items-center justify-center bg-muted"><div className="flex flex-col items-center gap-3"><LarkspurMark size={40} /><span className="text-sm text-muted-foreground">Fernbrook Greenhouse</span></div></AspectRatio></div></SpecimenItem>
    <SpecimenItem name="Separator" note="One hairline between different kinds of information. Decorative by default, semantic when requested."><div className="w-full space-y-3 text-sm"><p className="font-medium">Climate watch</p><p className="text-muted-foreground">Greenhouse sensor hub</p><Separator /><div className="flex h-5 items-center gap-3 text-xs text-muted-foreground"><span>Every 30 min</span><Separator orientation="vertical" /><span>06:00–20:00</span></div></div></SpecimenItem>
    <SpecimenItem name="Direction" note="A Radix direction context for multilingual workspaces. Logical placement follows the document, without motion."><DirectionProvider dir="ltr"><div dir="ltr" className="flex w-full items-center gap-3 rounded-md bg-muted p-3 text-sm"><LarkspurMark size={24} /><span>Fernbrook Greenhouse</span><IconArrowRight className="ml-auto size-4" aria-hidden /></div></DirectionProvider></SpecimenItem>
  </SpecimenGroup>;
}

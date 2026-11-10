import { useState } from "react";
import { toast } from "sonner";
import { SpecimenGroup, SpecimenItem } from "../frame";
import { Button } from "@sift-design/ui/button";
import { Checkbox } from "@sift-design/ui/checkbox";
import { Input } from "@sift-design/ui/input";
import { Label } from "@sift-design/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@sift-design/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@sift-design/ui/alert-dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@sift-design/ui/sheet";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@sift-design/ui/drawer";
import { TimeWheel, formatTime } from "@sift-design/ui/time-picker";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "@sift-design/ui/popover";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@sift-design/ui/hover-card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@sift-design/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuCheckboxItem } from "@sift-design/ui/dropdown-menu";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuSeparator } from "@sift-design/ui/context-menu";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarShortcut } from "@sift-design/ui/menubar";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@sift-design/ui/navigation-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@sift-design/ui/select";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@sift-design/ui/combobox";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandDialog } from "@sift-design/ui/command";

const areas = ["Propagation house", "Polytunnel 2", "Retail benches", "Wholesale orders", "Maintenance"];
const notify = (message: string) => toast.success(message);

export default function Overlays() {
  const [checked, setChecked] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [priority, setPriority] = useState("high");
  const [reminder, setReminder] = useState("16:30");
  const [owner, setOwner] = useState<string | null>("John Smith");
  const [taskName, setTaskName] = useState("Pot on 120 lavender plugs");
  const commandItems = <><CommandInput aria-label="Find an area" placeholder="Find an area or action…" /><CommandList><CommandEmpty>No matching areas. Try “Retail”.</CommandEmpty><CommandGroup heading="Areas">{areas.map((area, index) => <CommandItem key={area} onSelect={() => { notify(`Opened ${area}`); setCommandOpen(false); }}>{area}<CommandShortcut>G {index + 1}</CommandShortcut></CommandItem>)}</CommandGroup></CommandList></>;
  return <div data-vaul-drawer-wrapper className="bg-ground"><SpecimenGroup id="overlays" title="Overlays and menus" intro="Open dialogs, panels, menus, and tooltips, then check where focus returns on close. The fictional greenhouse actions are isolated examples, not a live service or a required workflow.">
    <SpecimenItem name="Dialog" note="Ask for a decision or edit a detail without leaving the page. The dialog opens above a dimmed background.">
      <Dialog><DialogTrigger asChild><Button variant="outline">Rename task</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Rename task</DialogTitle><DialogDescription>Keep the work specific so the next person knows what to do.</DialogDescription></DialogHeader><div className="grid gap-2"><Label htmlFor="overlay-task-name">Task name</Label><Input id="overlay-task-name" value={taskName} onChange={e => setTaskName(e.target.value)} /></div><DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><DialogClose asChild><Button onClick={() => notify("Task renamed")}>Save name</Button></DialogClose></DialogFooter></DialogContent></Dialog>
    </SpecimenItem>
    <SpecimenItem name="Alert dialog" note="Confirm an action that cannot be undone. Explain what will happen and keep the cancel action easy to find.">
      <AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Delete task</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this task?</AlertDialogTitle><AlertDialogDescription>“Repair the polytunnel door runner” will be removed from Maintenance. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep task</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => notify("Task deleted")}>Delete task</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </SpecimenItem>
    <SpecimenItem name="Sheet" note="Open details in a side panel with the source page visible behind it. Focus stays in the panel; on phones, drag the bottom panel down to close.">
      <Sheet><SheetTrigger asChild><Button variant="outline">Open task details</Button></SheetTrigger><SheetContent><SheetHeader className="border-b p-6 pr-12"><SheetTitle>Pot on 120 lavender plugs</SheetTitle><SheetDescription>Propagation house · Due today</SheetDescription></SheetHeader><div className="grid gap-6 px-6"><div className="grid gap-2"><Label htmlFor="sheet-priority">Priority</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger id="sheet-priority" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></div><div><p className="font-medium">John Smith</p><p className="mt-1 text-muted-foreground">Move the lavender into 9cm pots. Water in and leave on the sheltered bench overnight.</p></div><div className="border-t pt-4 text-muted-foreground">Jane added this task <time className="font-mono text-xs">09:15</time></div></div><SheetFooter className="border-t p-6"><SheetClose asChild><Button onClick={() => notify("Task marked done")}>Mark done</Button></SheetClose></SheetFooter></SheetContent></Sheet>
    </SpecimenItem>
    <SpecimenItem name="Drawer" note="Open actions or a short form from the bottom of the screen. Drag down or use the close button to dismiss it.">
      <Drawer><DrawerTrigger asChild><Button variant="outline">Plan market crates</Button></DrawerTrigger><DrawerContent className="mx-auto max-w-[640px]"><DrawerHeader><DrawerTitle>Prepare Saturday market crates</DrawerTitle><DrawerDescription>Check these before loading the van.</DrawerDescription></DrawerHeader><div className="grid gap-3 px-6 py-3">{["6 crates", "Price cards", "Card reader charged", "Float"].map(item => <label key={item} className="flex min-h-8 items-center gap-3"><Checkbox />{item}</label>)}</div><DrawerFooter><DrawerClose asChild><Button onClick={() => notify("Market checklist saved")}>Save checklist</Button></DrawerClose><DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>
    </SpecimenItem>
    <SpecimenItem name="Popover" note="Change a small setting in a popup beside the button that opened it.">
      <Popover><PopoverTrigger asChild><Button variant="outline">Set reminder</Button></PopoverTrigger><PopoverContent align="start"><PopoverHeader><PopoverTitle>Remind me today</PopoverTitle><PopoverDescription>Check the misting nozzles before closing.</PopoverDescription></PopoverHeader><div className="mt-4 grid gap-3"><TimeWheel aria-label="Reminder time" value={reminder} onValueChange={setReminder} className="justify-center" /><Button onClick={() => notify(`Reminder set for ${formatTime(reminder)}`)}>Set reminder for {formatTime(reminder)}</Button></div></PopoverContent></Popover>
    </SpecimenItem>
    <SpecimenItem name="Hover card" note="Show extra information when someone hovers over or focuses a link. Keep essential details on the page.">
      <HoverCard openDelay={200}><HoverCardTrigger asChild><a href="#overlays" className="rounded-md px-2 py-1.5 font-medium text-link underline underline-offset-4">John Smith</a></HoverCardTrigger><HoverCardContent align="start"><p className="font-semibold">John Smith</p><p className="mt-1 text-muted-foreground">Grower at Fernbrook Greenhouse. Looking after Propagation house and Polytunnel 2.</p><p className="mt-3 text-xs text-muted-foreground">Usually here <span className="font-mono">07:00–15:00</span></p></HoverCardContent></HoverCard>
    </SpecimenItem>
    <SpecimenItem name="Tooltip" note="Add a short explanation or keyboard shortcut on hover and focus. Moving to a nearby button shows its hint at once, without replaying the entrance. Do not hide essential instructions here.">
      <Tooltip><TooltipTrigger asChild><Button variant="outline" onClick={() => notify("Opened task search")}>Search tasks</Button></TooltipTrigger><TooltipContent>Find a task <kbd className="ml-2 font-mono">⌘ K</kbd></TooltipContent></Tooltip><Tooltip><TooltipTrigger asChild><Button variant="outline" onClick={() => notify("Opened area search")}>Search areas</Button></TooltipTrigger><TooltipContent>Find a growing area</TooltipContent></Tooltip>
    </SpecimenItem>
    <SpecimenItem name="Dropdown menu" note="Put related actions under one button. The menu opens beside it, with immediate keyboard selection.">
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Task actions</Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-56"><DropdownMenuLabel inset>Lavender plugs</DropdownMenuLabel><DropdownMenuItem inset onSelect={() => notify("Task opened")}>Open task<DropdownMenuShortcut>↵</DropdownMenuShortcut></DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger inset>Move to area</DropdownMenuSubTrigger><DropdownMenuSubContent>{areas.map(area => <DropdownMenuItem key={area} onSelect={() => notify(`Moved to ${area}`)}>{area}</DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub><DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>Show completed</DropdownMenuCheckboxItem><DropdownMenuItem inset disabled>Copy public link</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem inset variant="destructive" onSelect={() => notify("Task archived")}>Archive task</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </SpecimenItem>
    <SpecimenItem name="Context menu" note="Open actions for an item by right-clicking or pressing Shift+F10 while it has focus.">
      <ContextMenu><ContextMenuTrigger className="block w-full rounded-md border border-dashed p-4 outline-offset-4" tabIndex={0}>Restock the herb bench before Saturday<span className="mt-1 block text-xs text-muted-foreground">Right-click or press Shift+F10</span></ContextMenuTrigger><ContextMenuContent className="w-56"><ContextMenuItem onSelect={() => notify("Task opened")}>Open task<ContextMenuShortcut>↵</ContextMenuShortcut></ContextMenuItem><ContextMenuItem onSelect={() => notify("Assigned to Jane")}>Assign to me</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem onSelect={() => notify("Task marked done")}>Mark done</ContextMenuItem></ContextMenuContent></ContextMenu>
    </SpecimenItem>
    <SpecimenItem name="Menubar" note="Keep frequently used commands in a row of menus, with keyboard navigation between them.">
      <Menubar><MenubarMenu><MenubarTrigger>Work</MenubarTrigger><MenubarContent><MenubarItem onSelect={() => notify("New task started")}>New task<MenubarShortcut>⌘ N</MenubarShortcut></MenubarItem><MenubarItem onSelect={() => notify("New area started")}>New area</MenubarItem><MenubarSeparator /><MenubarItem onSelect={() => notify("Opened completed tasks")}>Completed tasks</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent><MenubarItem onSelect={() => notify("Board view selected")}>Board</MenubarItem><MenubarItem onSelect={() => notify("List view selected")}>List</MenubarItem></MenubarContent></MenubarMenu></Menubar>
    </SpecimenItem>
    <SpecimenItem name="Navigation menu" note="Group links to pages or sections. Use an action menu instead for commands such as Save or Delete.">
      <NavigationMenu aria-label="Greenhouse areas"><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Growing areas</NavigationMenuTrigger><NavigationMenuContent><ul className="grid w-[280px] gap-1">{areas.slice(0, 3).map(area => <li key={area}><NavigationMenuLink href="#overlays" onClick={() => notify(`Opened ${area}`)}>{area}</NavigationMenuLink></li>)}</ul></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>
    </SpecimenItem>
    <SpecimenItem name="Select" note="Choose one value from a short list. Use the arrow keys to move between options.">
      <Select value={priority} onValueChange={setPriority}><SelectTrigger aria-label="Task priority" className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="retired" disabled>Retired priority</SelectItem></SelectContent></Select>
    </SpecimenItem>
    <SpecimenItem name="Combobox" note="Search a longer list by typing, then choose an option without leaving the field.">
      <Combobox items={["Jane Doe", "John Smith", "Alex Lee", "Sam Taylor"]} value={owner} onValueChange={setOwner}><ComboboxInput aria-label="Assign task" placeholder="Find a person…" showClear /><ComboboxContent><ComboboxEmpty>No people found.</ComboboxEmpty><ComboboxList>{(person: string) => <ComboboxItem key={person} value={person}>{person}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
    </SpecimenItem>
    <SpecimenItem name="Command" note="Search pages or actions with the keyboard. Results update as you type, without replaying an animation.">
      <div className="w-full rounded-md border"><Command defaultValue="__no_initial_selection__">{commandItems}</Command></div><Button id="command-palette-trigger" variant="outline" onClick={() => setCommandOpen(true)}>Open command palette</Button><CommandDialog open={commandOpen} onOpenChange={setCommandOpen} onCloseAutoFocus={() => document.getElementById("command-palette-trigger")?.focus()} title="Jump to an area" description="Search Fernbrook Greenhouse areas.">{commandItems}</CommandDialog>
    </SpecimenItem>
    <SpecimenItem name="Sonner" note="Show a brief notification, often called a toast, without interrupting input. Offer Undo only when the change can safely be reversed.">
      <Button variant="outline" onClick={() => toast.success("Market checklist saved", { description: "Ready for Saturday’s load-out.", action: { label: "Undo", onClick: () => notify("Checklist change undone") } })}>Save market checklist</Button><Button variant="outline" onClick={() => toast.error("Sensor hub is unreachable", { description: "Check its connection, then try again." })}>Show connection error</Button>
    </SpecimenItem>
  </SpecimenGroup></div>;
}

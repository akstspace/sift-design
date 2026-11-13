import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { leave, spring } from "@sift-design/tokens/motion";
import { toast } from "sonner";
import {
  IconArchive,
  IconArrowRight,
  IconArrowsMove,
  IconChevronDown,
  IconDroplet,
  IconLayoutColumns,
  IconLayoutList,
  IconCalendar,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sift-design/ui/tabs";
import { Switch } from "@sift-design/ui/switch";
import { Label } from "@sift-design/ui/label";
import { Checkbox } from "@sift-design/ui/checkbox";
import { Slider } from "@sift-design/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { TimePicker } from "@sift-design/ui/time-picker";
import { Progress } from "@sift-design/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sift-design/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sift-design/ui/dialog";
import { at } from "../base";
import { Reveal } from "./Reveal";

function Cell({ name, note, index, children }: { name: string; note: string; index: number; children: ReactNode }) {
  return (
    <div className="sheet-cell">
      <Reveal delay={(index % 4) * 0.06 + Math.floor(index / 4) * 0.05} y={16}>
        <div className="sheet-label">
          <code>{name}</code>
          <span>{note}</span>
        </div>
        <div className="sheet-demo">{children}</div>
      </Reveal>
    </div>
  );
}

const views = [
  { value: "board", label: "Board", Icon: IconLayoutColumns },
  { value: "list", label: "List", Icon: IconLayoutList },
  { value: "calendar", label: "Calendar", Icon: IconCalendar },
];

const chores = ["Water the seedling trays", "Check the vent sensors", "Restock potting mix"];

function Checklist() {
  const [done, setDone] = useState<string[]>([chores[1]]);
  const reduced = useReducedMotion();
  return (
    <div className="sheet-checklist">
      {chores.map((chore) => {
        const checked = done.includes(chore);
        const id = `chore-${chores.indexOf(chore)}`;
        return (
          <div key={chore} data-done={checked || undefined}>
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(on) => setDone(on === true ? [...done, chore] : done.filter((c) => c !== chore))}
            />
            <Label htmlFor={id}>
              <span data-slot="strike" data-struck={checked || undefined}>
                {chore}
              </span>
            </Label>
          </div>
        );
      })}
      <div className="sheet-progress">
        <Progress value={(done.length / chores.length) * 100} aria-label="Chores done" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.output
            key={done.length}
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: reduced ? { duration: 0.14 } : spring.snappy,
            }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : -6,
              transition: { duration: 0.1, ease: leave },
            }}
          >
            {done.length} of {chores.length}
          </motion.output>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ComponentSheet() {
  const [view, setView] = useState("board");
  const [mist, setMist] = useState([12]);
  const [frost, setFrost] = useState(true);
  const [summary, setSummary] = useState(false);
  return (
    <section className="landing-components" id="components" aria-labelledby="components-heading">
      <div className="section-head">
        <Reveal as="h2" id="components-heading">
          64 components, restyled and moving
        </Reveal>
        <Reveal delay={0.06}>
          <p className="section-lede">
            All 61 shadcn/ui components, plus page transitions, a scrolling title and a time picker. Menus open from
            their buttons, highlights travel between choices, and every one works in light and dark. These are live; try
            them.
          </p>
          <a className="landing-link" href={at("/components")}>
            Browse all components
            <IconArrowRight aria-hidden size={17} />
          </a>
        </Reveal>
      </div>
      <div className="sheet">
        <Cell index={0} name="toggle-group" note="The highlight travels">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="Bench view">
            {views.map(({ value, label, Icon }) => (
              <ToggleGroupItem key={value} value={value} aria-label={label}>
                <Icon aria-hidden />
                <span className="sheet-toggle-label">{label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Cell>
        <Cell index={1} name="dropdown-menu" note="Opens from its button">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Bench actions
                <IconChevronDown aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <IconDroplet aria-hidden />
                Water now
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconArrowsMove aria-hidden />
                Move to the propagation house
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconArchive aria-hidden />
                Archive bench
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Cell>
        <Cell index={2} name="time-picker" note="A wheel, added to the kit">
          <TimePicker defaultValue="07:30" aria-label="Vents open at" />
        </Cell>
        <Cell index={3} name="checkbox · progress" note="State you can see">
          <Checklist />
        </Cell>
        <Cell index={4} name="tabs" note="Panels swap in place">
          <Tabs defaultValue="today" className="sheet-tabs">
            <TabsList aria-label="Watering schedule">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent value="today">
              <p>
                <strong>3 benches</strong> due before noon.
              </p>
            </TabsContent>
            <TabsContent value="week">
              <p>
                <strong>14 benches</strong> across two houses.
              </p>
            </TabsContent>
            <TabsContent value="month">
              <p>
                <strong>52 waterings</strong>, one every 14 hours.
              </p>
            </TabsContent>
          </Tabs>
        </Cell>
        <Cell index={5} name="switch · slider" note="Springy, never bouncy">
          <div className="sheet-settings">
            <div>
              <Label htmlFor="sheet-frost">Frost alerts</Label>
              <Switch id="sheet-frost" checked={frost} onCheckedChange={setFrost} />
            </div>
            <div>
              <Label htmlFor="sheet-summary">Morning summary</Label>
              <Switch id="sheet-summary" checked={summary} onCheckedChange={setSummary} />
            </div>
            <div className="sheet-slider">
              <div>
                <Label htmlFor="sheet-mist">Mist every</Label>
                <output htmlFor="sheet-mist">{mist[0]} min</output>
              </div>
              <Slider id="sheet-mist" aria-label="Mist every" value={mist} onValueChange={setMist} min={5} max={30} />
            </div>
          </div>
        </Cell>
        <Cell index={6} name="sonner" note="Brief, with an undo">
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Schedule saved", {
                description: "Vents open at 7:30 AM.",
                action: {
                  label: "Undo",
                  onClick: () => toast("Schedule change undone"),
                },
              })
            }
          >
            Save schedule
          </Button>
        </Cell>
        <Cell index={7} name="dialog" note="Eases in, never blocks for long">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Archive bench…</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive Bench 4?</DialogTitle>
                <DialogDescription>
                  Its plants and history stay available under Archived. You can restore it at any time.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={() => toast.success("Bench 4 archived")}>Archive</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Cell>
      </div>
    </section>
  );
}

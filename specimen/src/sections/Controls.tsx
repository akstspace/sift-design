import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconPlus, IconSearch, IconStar, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { ButtonGroup, ButtonGroupText } from "@sift-design/ui/button-group";
import { Input } from "@sift-design/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@sift-design/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@sift-design/ui/input-otp";
import { Textarea } from "@sift-design/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@sift-design/ui/native-select";
import { TimePicker } from "@sift-design/ui/time-picker";
import { Checkbox } from "@sift-design/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@sift-design/ui/radio-group";
import { Switch } from "@sift-design/ui/switch";
import { Slider } from "@sift-design/ui/slider";
import { Toggle } from "@sift-design/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@sift-design/ui/tabs";
import { Label } from "@sift-design/ui/label";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@sift-design/ui/field";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@sift-design/ui/form";
import { Calendar } from "@sift-design/ui/calendar";
import { Kbd, KbdGroup } from "@sift-design/ui/kbd";
import { SpecimenGroup, SpecimenItem } from "../frame";

const taskSchema = z.object({
  title: z.string().trim().min(4, "Give the task a specific title, at least 4 characters.").max(100, "Keep the title under 100 characters."),
  area: z.string().min(1, "Choose the area where this work belongs."),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]),
  due: z.string().refine(value => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= "2026-11-10", "Choose 10 November 2026 or a later date."),
});
type Task = z.infer<typeof taskSchema>;
const areas = ["Propagation house", "Polytunnel 2", "Retail benches", "Wholesale orders", "Maintenance"];

function NewTask() {
  const form = useForm<Task>({ resolver: zodResolver(taskSchema), defaultValues: { title: "", area: "", priority: "Normal", due: "2026-11-10" } });
  const [saved, setSaved] = useState("");
  function save(task: Task) {
    // A real local draft, not simulated network latency or invented progress.
    try { localStorage.setItem("larkspur-task-draft", JSON.stringify(task)); setSaved(`Saved locally: ${task.title}.`); }
    catch { form.setError("root", { message: "This browser could not save the draft. Check storage permissions and try again." }); }
  }
  return <Form {...form}>
    <form aria-label="New task" noValidate onSubmit={form.handleSubmit(save)} className="w-full max-w-[620px]">
      <FieldSet>
        <FieldLegend>New task</FieldLegend>
        <FieldDescription>Make the next piece of work clear for the greenhouse team. Title and area are required.</FieldDescription>
        <FieldGroup>
          <FormField control={form.control} name="title" render={({ field }) => <FormItem><Field>
            <FormLabel>Task title</FormLabel><FormControl><Input placeholder="Pot on 120 lavender plugs" autoComplete="off" required aria-required="true" {...field} /></FormControl>
            <FormDescription>Name the work and the plant, bench or order involved.</FormDescription><FormMessage />
          </Field></FormItem>} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField control={form.control} name="area" render={({ field }) => <FormItem><Field>
              <FormLabel>Area</FormLabel><FormControl><NativeSelect {...field} required aria-required="true" className="w-full"><NativeSelectOption value="">Choose an area</NativeSelectOption>{areas.map(area => <NativeSelectOption key={area}>{area}</NativeSelectOption>)}</NativeSelect></FormControl>
              <FormDescription>Where this work belongs.</FormDescription><FormMessage />
            </Field></FormItem>} />
            <FormField control={form.control} name="priority" render={({ field }) => <FormItem><Field>
              <FormLabel>Priority</FormLabel><FormControl><NativeSelect {...field}>{["Low", "Normal", "High", "Urgent"].map(priority => <NativeSelectOption key={priority}>{priority}</NativeSelectOption>)}</NativeSelect></FormControl>
              <FormDescription>Normal unless it needs attention sooner.</FormDescription><FormMessage />
            </Field></FormItem>} />
          </div>
          <FormField control={form.control} name="due" render={({ field }) => <FormItem><Field>
            <FormLabel>Due date</FormLabel><FormControl><Input type="date" min="2026-11-10" {...field} /></FormControl>
            <FormDescription>Optional. The greenhouse plans from 10 November 2026.</FormDescription><FormMessage />
          </Field></FormItem>} />
          <FieldError errors={[form.formState.errors.root]} />
          <div className="flex flex-wrap items-center gap-3"><Button type="submit" loading={form.formState.isSubmitting}><IconPlus aria-hidden="true" />Save task</Button><Button type="button" variant="plain" onClick={() => { form.reset(); setSaved(""); }}>Clear draft</Button></div>
          <p role="status" className="min-h-5 text-[12.5px] text-muted-foreground">{saved || "Drafts stay in this browser."}</p>
        </FieldGroup>
      </FieldSet>
    </form>
  </Form>;
}

function TimeDemo() {
  const [time, setTime] = useState("16:30");
  return <div className="grid gap-2"><Label id="watering-label">Evening watering</Label><TimePicker aria-labelledby="watering-label" value={time} onValueChange={setTime} /><p className="text-muted-foreground text-[12.5px]">Starts at <span className="font-mono">{time}</span>, greenhouse time.</p></div>;
}

export default function Controls() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 10, 10));
  const [humidity, setHumidity] = useState([65]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState(1);
  const [action, setAction] = useState("No draft action yet.");
  // input-otp renders a controlled input, so its demos pass value rather than defaultValue.
  const [wrongCode, setWrongCode] = useState("111111");
  return <SpecimenGroup id="controls" title="Controls and forms" intro="Small, clear decisions for a working greenhouse. Try every control: state changes are immediate, selection stays in view, and keyboard focus is never hidden.">
    <SpecimenItem name="Button" note="A soft spring press and release. Progress preserves the label’s width.">
      <Button data-demo="press" onClick={() => setBatch(n => n + 1)}><IconPlus aria-hidden="true" />New task</Button>
      <Button variant="secondary" onClick={() => { localStorage.setItem("larkspur-demo-draft", String(batch)); setAction(`Draft ${batch} saved locally.`); }}>Save draft</Button><Button variant="outline" onClick={() => setAction("Draft assigned to John Smith.")}>Assign grower</Button><Button variant="ghost" onClick={() => setAction("Propagation house · Pot on 120 lavender plugs · Due today.")}>More details</Button><Button variant="plain" onClick={() => { setDate(undefined); setAction("Due date cleared."); }}>Clear date</Button><Button variant="destructive" onClick={() => { localStorage.removeItem("larkspur-demo-draft"); setAction("Local example draft deleted."); }}>Delete draft</Button><Button variant="link" asChild><a href="#new-task">Open form</a></Button>
      <div className="flex w-full flex-wrap items-center gap-3"><Button size="xs" onClick={() => setAction("Extra-small action selected.")}>Extra small</Button><Button size="sm" onClick={() => setAction("Small action selected.")}>Small</Button><Button onClick={() => setAction("Default action selected.")}>Default</Button><Button size="lg" onClick={() => setAction("Large action selected.")}>Large</Button><Button size="icon" aria-label="Add task" onClick={() => setBatch(n => n + 1)}><IconPlus /></Button><Button disabled>Save changes</Button><Button loading>Saving task</Button></div>
      <span role="status" className="text-[12.5px] text-muted-foreground">Next draft <span className="font-mono">{batch}</span> · {action}</span>
    </SpecimenItem>
    <SpecimenItem name="Button group" note="Related actions share a border; each remains keyboard accessible.">
      <ButtonGroup aria-label="Market crate quantity"><Button variant="outline" onClick={() => setBatch(n => Math.max(1, n - 1))} aria-label="One fewer crate">−</Button><ButtonGroupText className="font-mono">{batch} crates</ButtonGroupText><Button variant="outline" onClick={() => setBatch(n => n + 1)} aria-label="One more crate">+</Button></ButtonGroup>
      <ButtonGroup><Button variant="outline" onClick={() => setBatch(6)}>Use market batch</Button><Button variant="outline" disabled>Print labels</Button></ButtonGroup>
    </SpecimenItem>
    <SpecimenItem name="Input" note="32px by default. Focus fades in; invalid input changes color, never shakes.">
      <div className="grid w-full gap-3"><Label htmlFor="task-search">Find greenhouse work</Label><Input id="task-search" placeholder="Search tasks" /><Input controlSize="sm" aria-label="Small input" placeholder="Small · 28px" /><Input controlSize="lg" aria-label="Large input" placeholder="Large · 36px" /><Input disabled aria-label="Read-only workspace" value="Fernbrook Greenhouse" /><Input aria-label="Invalid task title" aria-invalid="true" aria-describedby="invalid-title" defaultValue="Pot" /><FieldError id="invalid-title">Give the task a specific title, at least 4 characters.</FieldError></div>
    </SpecimenItem>
    <SpecimenItem name="Input group" note="Search, context and an action in one focus boundary.">
      <form className="w-full space-y-3" onSubmit={event => { event.preventDefault(); setQuery(search); }}><InputGroup><InputGroupAddon><IconSearch aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label="Search greenhouse tasks" value={search} onChange={event => setSearch(event.target.value)} placeholder="Try lavender" /><InputGroupAddon align="inline-end"><InputGroupButton type="submit" size="icon-xs" aria-label="Search tasks"><IconArrowRight /></InputGroupButton></InputGroupAddon></InputGroup><p role="status" className="text-[12.5px] text-muted-foreground">{query ? `Searching local tasks for “${query}”.` : "Search by plant, area or order."}</p></form>
    </SpecimenItem>
    <SpecimenItem name="Textarea" note="A calm focus ring with room for the details that matter."><div className="grid w-full gap-3"><Label htmlFor="task-notes">Growing notes</Label><Textarea id="task-notes" defaultValue="Use the peat-free mix. Keep the lavender plugs on bench 3 after potting." /><Textarea disabled aria-label="Archived notes" defaultValue="This task has been archived." /><Textarea aria-label="Invalid growing notes" aria-invalid="true" aria-describedby="notes-error" defaultValue="Bench" /><FieldError id="notes-error">Include the bench number so the grower can find it.</FieldError></div></SpecimenItem>
    <SpecimenItem name="Time picker" note="A field that opens hour, minute and AM or PM columns. They snap under one band, follow the keyboard, and the digits roll to the new time on a snappy spring."><TimeDemo /></SpecimenItem>
    <SpecimenItem name="Native select" note="The platform's own picker: use it for plain forms and long lists on phones. Use Select or Combobox when options need styling or search."><div className="flex flex-wrap items-center gap-3">{(["sm", "default", "lg"] as const).map(size => <NativeSelect key={size} size={size} aria-label={`${size} priority`} defaultValue="Normal">{["Low", "Normal", "High", "Urgent"].map(p => <NativeSelectOption key={p}>{p}</NativeSelectOption>)}</NativeSelect>)}<NativeSelect disabled aria-label="Unavailable area"><NativeSelectOption>Maintenance</NativeSelectOption></NativeSelect></div></SpecimenItem>
    <SpecimenItem name="Input OTP" note="Monospaced verification digits. Digits settle with a small spring pop. The caret only blinks while focused."><div className="space-y-3"><Label htmlFor="verification">Greenhouse device code</Label><InputOTP id="verification" maxLength={6} pattern="^[0-9]*$" inputMode="numeric" autoComplete="one-time-code"><InputOTPGroup>{[0, 1, 2].map(i => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP><FieldDescription>Enter the six digits shown on the sensor hub.</FieldDescription><InputOTP aria-label="Expired device code" maxLength={6} value="123456" disabled><InputOTPGroup>{[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP><InputOTP aria-label="Invalid device code" aria-invalid="true" aria-describedby="code-error" maxLength={6} value={wrongCode} onChange={setWrongCode}><InputOTPGroup>{[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} aria-invalid="true" />)}</InputOTPGroup></InputOTP><FieldError id="code-error">This code has expired. Enter the current code on the hub.</FieldError></div></SpecimenItem>
    <SpecimenItem name="Checkbox" note="Checks draw and settle on the snappy spring. Mixed and disabled states stay clear."><div className="grid gap-4"><Label><Checkbox data-demo="check" />Price cards packed</Label><Label><Checkbox defaultChecked />Card reader charged</Label><Label><Checkbox checked="indeterminate" aria-label="Some market crates ready" />Some crates ready</Label><Label><Checkbox disabled />Supplier confirmation</Label><Label><Checkbox aria-invalid="true" />Confirm the delivery address</Label></div></SpecimenItem>
    <SpecimenItem name="Radio group" note="One choice, with a spring-driven dot and arrow-key navigation."><RadioGroup defaultValue="normal" aria-label="Task urgency"><Label><RadioGroupItem value="normal" />Normal</Label><Label><RadioGroupItem value="high" />High — before the market</Label><Label><RadioGroupItem value="urgent" />Urgent — plants at risk</Label><Label><RadioGroupItem value="unavailable" disabled />Unavailable priority</Label></RadioGroup></SpecimenItem>
    <SpecimenItem name="Switch" note="A spring-driven thumb stretches while held and reverses without resetting."><div className="grid gap-5"><Label><Switch data-demo="switch" />Climate watch notifications</Label><Label><Switch defaultChecked />Market prep reminders</Label><Label><Switch size="sm" />Compact reminders</Label><Label><Switch disabled />Supplier connection unavailable</Label></div></SpecimenItem>
    <SpecimenItem name="Slider" note="The thumb follows the pointer directly and springs larger while held."><div className="w-full space-y-4"><Label htmlFor="humidity">Misting threshold <span className="ml-auto font-mono">{humidity[0]}%</span></Label><Slider id="humidity" aria-label="Misting threshold" value={humidity} onValueChange={setHumidity} min={20} max={90} step={5} /><FieldDescription>Notify the grower when humidity falls below this level.</FieldDescription><Slider aria-label="Unavailable threshold" disabled defaultValue={[45]} /></div></SpecimenItem>
    <SpecimenItem name="Toggle" note="A reversible preference, not a one-off action."><Toggle><IconStar aria-hidden="true" />Pin area</Toggle><Toggle variant="outline" defaultPressed>Show done</Toggle><Toggle size="sm" disabled>Unavailable</Toggle><Toggle size="lg">Include notes</Toggle></SpecimenItem>
    <SpecimenItem name="Toggle group" note="The selected surface travels with the shared selection spring. Instances never share a highlight."><div className="space-y-4"><ToggleGroup type="single" defaultValue="open" aria-label="Task status" data-demo="segments"><ToggleGroupItem value="open">Open</ToggleGroupItem><ToggleGroupItem value="progress">In progress</ToggleGroupItem><ToggleGroupItem value="done">Done</ToggleGroupItem></ToggleGroup><ToggleGroup type="single" defaultValue="today" size="sm" aria-label="Planning horizon"><ToggleGroupItem value="today">Today</ToggleGroupItem><ToggleGroupItem value="week">This week</ToggleGroupItem><ToggleGroupItem value="later" disabled>Later</ToggleGroupItem></ToggleGroup><ToggleGroup type="multiple" defaultValue={["market"]} aria-label="Task tags" variant="outline"><ToggleGroupItem value="market">Market</ToggleGroupItem><ToggleGroupItem value="irrigation">Irrigation</ToggleGroupItem></ToggleGroup></div></SpecimenItem>
    <SpecimenItem name="Tabs" note="The indicator travels; panels cross-fade with 6px of directional drift."><div className="w-full space-y-5"><Tabs defaultValue="growing" data-demo="tabs"><TabsList aria-label="Greenhouse work"><TabsTrigger value="growing">Growing</TabsTrigger><TabsTrigger value="orders">Orders</TabsTrigger><TabsTrigger value="archived" disabled>Archived</TabsTrigger></TabsList><TabsContent value="growing"><p className="text-[13px]">Pot on 120 lavender plugs.<br /><span className="text-muted-foreground">Propagation house · Due today</span></p></TabsContent><TabsContent value="orders"><p className="text-[13px]">Reply to Hollins Florist about the 40-tray order.<br /><span className="text-muted-foreground">Wholesale orders · Alex Lee</span></p></TabsContent></Tabs><Tabs defaultValue="notes"><TabsList variant="line" aria-label="Task details"><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="history">Activity</TabsTrigger></TabsList><TabsContent value="notes"><p className="text-[13px] text-muted-foreground">Keep the new plugs on bench 3.</p></TabsContent><TabsContent value="history"><p className="text-[13px] text-muted-foreground">John Smith added the growing notes.</p></TabsContent></Tabs></div></SpecimenItem>
    <SpecimenItem name="Calendar" note="Month changes settle on a smooth spring in the direction of travel. Dates use the greenhouse’s planning week."><Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026, 10, 1)} today={new Date(2026, 10, 10)} disabled={{ before: new Date(2026, 10, 9) }} aria-label="Task due date calendar" /><p role="status" className="text-[12.5px] text-muted-foreground">{date ? `Due ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.` : "No due date selected."}</p></SpecimenItem>
    <SpecimenItem name="Label and field" note="13px medium labels and 12.5px help text, associated with the control."><Field orientation="horizontal"><Switch id="daily-summary" /><FieldContent><FieldLabel htmlFor="daily-summary">Daily greenhouse summary</FieldLabel><FieldDescription>One email after the last inspection.</FieldDescription></FieldContent></Field></SpecimenItem>
    <SpecimenItem name="Kbd" note="IBM Plex Mono, a quiet border and no unnecessary motion."><span className="flex flex-wrap items-center gap-2 text-[13px]">Move between controls <Kbd>Tab</Kbd></span><span className="flex items-center gap-2 text-[13px]">Go back <KbdGroup><Kbd>Shift</Kbd><Kbd>Tab</Kbd></KbdGroup></span><span className="text-[12.5px] text-muted-foreground">Use Space to toggle a checkbox or switch.</span></SpecimenItem>
    <SpecimenItem name="Form" wide note="Field + Form + React Hook Form + Zod. Submit an empty title to see real validation; valid drafts save locally."><div id="new-task" className="w-full"><NewTask /></div></SpecimenItem>
  </SpecimenGroup>;
}

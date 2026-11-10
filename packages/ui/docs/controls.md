# Controls and forms

Use the kit theme once, after Tailwind. It includes motion by default; do not import a second animation stylesheet or wrap individual controls in animation providers.

```tsx
// styles.css
// @import "tailwindcss";
// @import "@sift-design/ui/theme.css";
import { Button } from "@sift-design/ui/button";
```

## Shared contract

Default height is **32px**, small **28px**, large **36px**; extra-small buttons remain 24px. Control radius is 8px, inner segmented surfaces 6px. Labels are Albert Sans 13px medium; help and validation text 12.5px. Counts and keys use IBM Plex Mono. Control borders use `--control-line`, focus uses a 2px `--focus-ring` with a 2px surface offset. Primary actions are slate/oatmeal in light and sea/slate in dark. Destructive buttons use `--danger-foreground`, not hardcoded white.

Anything that travels or scales uses a shared spring. Color, border and focus-shadow feedback takes **140ms**. No invalid control shakes; no gesture waits for an animation. Reduced motion removes travel, scale and springs, retaining short fades and instant state feedback. Built-in option popups keep their own interaction behavior.

### Exact spring contract

CSS curves are the generated `linear()` values in `tokens/tokens.css`, referenced directly rather than copied:

| Role | Token | Full settling duration | Corresponding motion preset |
| --- | --- | --- | --- |
| Press/release and held affordance | `--spring-press` | `--spring-press-duration`: **263ms** | `spring.press`: visualDuration **0.12**, bounce **0** |
| Small marks, switch travel, code fill, error reveal | `--spring-snappy` | `--spring-snappy-duration`: **358ms** | `spring.snappy`: visualDuration **0.2**, bounce **0.12** |
| Calendar arrival | `--spring-smooth` | `--spring-smooth-duration`: **538ms** | `spring.smooth`: visualDuration **0.28**, bounce **0** |

These durations include a low-amplitude settling tail; the main response is visually established in roughly 150–350ms. CSS transitions retarget from their current value, so repeated input never resets a switch or check to an animation’s first frame. Shared selection travel uses the physical `selectionSpring` (stiffness **700**, damping **48**, mass **0.6**) and preserves continuity when retargeted. Every press has an immediate **7% currentColor** wash, fading on release over **140ms linear**.

## Button

Use for an action; use `asChild` with an anchor for navigation. Variants: `default`, `secondary`, `outline`, `ghost`, `plain` (the minimal Sift action), `destructive`, `link`. Sizes: `xs` 24, `sm` 28, `default` 32, `lg` 36; `icon-xs`, `icon-sm`, `icon`, `icon-lg` match those dimensions.

The additive `data-ui-button` marker preserves button styling and press feedback when an `asChild` trigger or close action supplies its own `data-slot`. Keep both attributes when copying composed controls.

Press/release: scale **1 ↔ 0.97**, **263ms `var(--spring-press)`** transition; color and pressed-wash release **140ms linear**. `loading` makes the label transparent but retains it in layout and the accessibility tree, displays a centered spinner, sets `aria-busy`, and disables repeated submission. Spinner: **700ms linear** per revolution. Reduced motion removes scale; progress becomes a static named busy mark. Do not combine `loading` with `asChild`; provide progress semantics on the linked element instead. Icon-only buttons need a name. Native disabled actions retain legibility and leave tab order.

```tsx
import { Button } from "@sift-design/ui/button";
<Button loading={saving} onClick={save}>Save task</Button>
<Button variant="plain" onClick={clear}>Clear date</Button>
<Button variant="destructive" onClick={remove}>Delete draft</Button>
```

## Button group

Use for related actions or a stepper. `orientation="horizontal"` (default) or `vertical`; compose with any button variant/size. Borders join without double seams. No independent motion: children inherit button **263ms press spring / 140ms color**; reduced motion removes their scale. Name the group when the relationship is not obvious.

```tsx
import { ButtonGroup, ButtonGroupText } from "@sift-design/ui/button-group";
import { Button } from "@sift-design/ui/button";
<ButtonGroup aria-label="Market crate quantity">
  <Button variant="outline" aria-label="One fewer crate" onClick={decrement}>−</Button>
  <ButtonGroupText className="font-mono">{crates} crates</ButtonGroupText>
  <Button variant="outline" aria-label="One more crate" onClick={increment}>+</Button>
</ButtonGroup>
```

## Input

Use for one line of text, numbers or native dates. `controlSize="sm" | "default" | "lg"` avoids conflicting with the native input `size` attribute. No stylistic variants. Focus, border, invalid color and shadow: **140ms settle**, also in reduced motion; no travel. Pair with a label, a stable description ID, and `aria-invalid` when invalid. Avoid placeholder-only labels.

```tsx
import { Input } from "@sift-design/ui/input";
import { Label } from "@sift-design/ui/label";
<Label htmlFor="task-title">Task title</Label>
<Input id="task-title" placeholder="Pot on 120 lavender plugs" aria-describedby="title-help" />
<p id="title-help">Name the work and the plant involved.</p>
```

## Input group

Use to keep a prefix, suffix or inline action in one focus boundary. `InputGroupAddon` aligns `inline-start`, `inline-end`, `block-start` or `block-end`. `InputGroupButton` sizes: `xs`, `sm`, `icon-xs`, `icon-sm`. Base height 32px; textarea/block additions grow naturally. No separate variant. Focus: **140ms settle** on the outer group; embedded actions inherit button motion. Reduced motion retains shadow/color feedback. Name the actual input; decorative icons are hidden from assistive technology.

```tsx
import { InputGroup, InputGroupAddon, InputGroupInput } from "@sift-design/ui/input-group";
import { IconSearch } from "@tabler/icons-react";
<InputGroup>
  <InputGroupAddon><IconSearch aria-hidden="true" /></InputGroupAddon>
  <InputGroupInput aria-label="Search greenhouse tasks" placeholder="Search tasks" />
</InputGroup>
```

## Input OTP

Use only for short verification codes, not ordinary text entry. Compose groups, slots and optional separators. Slots are 32px square, monospaced; no variants. A filled character pops **0.8 → 1** on **358ms `--spring-snappy`**, with a separate **100ms linear** fade. Reduced motion keeps only the fade. Focus shadow/color: **140ms settle**. Fake caret: **1000ms steps(2,jump-none)**, mounted only while the real input is focused; reduced motion keeps a steady caret. Native disabled and `aria-invalid` are supported. Label the single input and set `autoComplete="one-time-code"`, `inputMode` and `maxLength` appropriately.

```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@sift-design/ui/input-otp";
<InputOTP aria-label="Greenhouse device code" maxLength={6} inputMode="numeric" autoComplete="one-time-code">
  <InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
</InputOTP>
```

## Textarea

Use for growing notes and other multiline content. Default minimum height 64px, content-sized; change rows/min-height for context, not fake single-line sizes. No variants. Focus and invalid color: **140ms settle**, unchanged with reduced motion. Native resizing and selection work. Associate label, descriptions and errors as for Input.

```tsx
import { Textarea } from "@sift-design/ui/textarea";
import { Label } from "@sift-design/ui/label";
<Label htmlFor="notes">Growing notes</Label>
<Textarea id="notes" defaultValue="Keep the new plugs on bench 3." />
```

## Native select

Use for short, familiar option lists when built-in picker behavior is desirable. Sizes: `sm` 28px, `default` 32px, `lg` 36px. Use `NativeSelectOption` and `NativeSelectOptGroup`; no visual variants. Focus/border: **140ms settle**; the built-in picker owns popup behavior, including reduced motion. Provide a label; native keyboard, validation and touch behavior are preserved.

```tsx
import { NativeSelect, NativeSelectOption } from "@sift-design/ui/native-select";
<NativeSelect aria-label="Priority" defaultValue="Normal">
  {["Low", "Normal", "High", "Urgent"].map(value => <NativeSelectOption key={value}>{value}</NativeSelectOption>)}
</NativeSelect>
```

## Time picker

Use for a time of day, such as a schedule or a reminder, instead of the browser's time input. `TimePicker` is a field that opens a `TimeWheel` in a popover; `TimeWheel` also works inline, for example inside a popover of your own. Values are 24-hour `"HH:mm"` strings, like `<input type="time">`. Props: `value` / `defaultValue` / `onValueChange`, `minuteStep` (default 5; values between steps round to the nearest), `hourCycle` 12 (default) or 24, `name` (submits the value with a form) and `disabled`.

Each column is a listbox that scroll-snaps under one shared band, so a wheel, a trackpad flick, touch, a click or the keyboard all work. Keys: Up and Down move by one, Page Up and Page Down by five, Home and End jump to the ends, Left and Right move between columns, and typing digits or "a" / "p" jumps to a match. **Now** picks the current time rounded to the step; **Done** closes the popover.

**Motion:** the popover uses the anchored spring preset (`--spring-snappy`). Rows scale and fade toward the edges with a scroll-driven animation, so depth follows the finger exactly. Columns set by the keyboard or a click scroll smoothly into place. The field's characters roll to the new time on `spring.snappy`. Reduced motion: columns jump instead of scrolling smoothly, and the digits cross-fade instead of rolling.

**Accessibility:** give the field a visible label and pass its id as `aria-labelledby`, so the trigger reads as the label plus the time, for example "Evening watering, 4:30 PM". Columns are named Hour, Minute and AM or PM, and announce the selected option through `aria-activedescendant`.

```tsx
import { TimePicker } from "@sift-design/ui/time-picker";
import { Label } from "@sift-design/ui/label";
const [time, setTime] = useState("16:30");
<Label id="watering-label">Evening watering</Label>
<TimePicker aria-labelledby="watering-label" value={time} onValueChange={setTime} />
```

## Checkbox

Use for independent choices and checklist completion. One 16px visual size with a transparent 24px pointer hit area; wrapping labels are at least 24px tall. Supports `checked`, `defaultChecked`, `onCheckedChange`, `"indeterminate"`, disabled and invalid states. Persistent marks draw with stroke-dashoffset **22 ↔ 0** and scale **0.55 ↔ 1** on **358ms `--spring-snappy`** transitions; opacity uses **100ms linear** and color follows in **140ms**. Rapid checks reverse those transitions in place. Reduced motion is **100ms linear fade**, no animated draw or scale. Radix preserves mixed-state semantics and Space activation. Never communicate required confirmation only through color.

```tsx
import { Checkbox } from "@sift-design/ui/checkbox";
import { Label } from "@sift-design/ui/label";
<Label><Checkbox checked={packed} onCheckedChange={value => setPacked(value === true)} />Price cards packed</Label>
```

## Radio group

Use for exactly one choice from a short visible set. One 16px size, no variants. Persistent dot: scale **0.55 ↔ 1** on **358ms `--spring-snappy`**, opacity **100ms linear**. Focus/border **140ms**. Reduced motion replaces dot scale with **100ms linear fade**. Radix handles roving focus and arrows. Name the group and each option.

```tsx
import { RadioGroup, RadioGroupItem } from "@sift-design/ui/radio-group";
import { Label } from "@sift-design/ui/label";
<RadioGroup aria-label="Task urgency" defaultValue="normal">
  <Label><RadioGroupItem value="normal" />Normal</Label>
  <Label><RadioGroupItem value="high" />High — before the market</Label>
</RadioGroup>
```

## Switch

Use for an immediate on/off setting, not a submit action. Default track 32×20px, thumb 16px, travel 12px; `sm` 26×16px, thumb 12px, travel 10px. No variants. Thumb travel and held stretch use a single **358ms `--spring-snappy` transform transition** (no restarting keyframes). While held, the thumb stretches horizontally to **1.12** and compresses vertically to **0.94**, anchored to its resting edge. Rapid toggles retarget from the currently rendered position. Track/focus **140ms**. Reduced motion makes thumb travel instant and retains track feedback. Label names the setting, not the present state; Radix exposes `aria-checked`.

```tsx
import { Switch } from "@sift-design/ui/switch";
import { Label } from "@sift-design/ui/label";
<Label><Switch checked={notifications} onCheckedChange={setNotifications} />Climate watch notifications</Label>
```

## Slider

Use for approximate numeric settings; show its current value alongside it. Horizontal/vertical and one or multiple thumbs; no size variants. Visual thumb 16px, minimum interaction height 28px. Held thumb grows to **1.15** on **263ms `--spring-press`** and springs back on release or cancellation. Reduced motion removes scale. Dragging follows the pointer without a tween. Label each thumb (multi-value sliders should use `aria-label`/`aria-labelledby` per thumb with the `thumbLabels` string array), provide useful min/max/step, and allow arrow-key adjustment.

```tsx
import { Slider } from "@sift-design/ui/slider";
<Slider aria-label="Misting threshold" min={20} max={90} step={5} value={threshold} onValueChange={setThreshold} />
<output>{threshold[0]}%</output>
```

## Toggle

Use for a reversible preference such as pinning or showing completed tasks. Variants `default`, `outline`; sizes `sm` 28, `default` 32, `lg` 36px. Press/release scale **1 ↔ 0.97** on **263ms `--spring-press`**; color **140ms**. Reduced motion removes press scale. Radix exposes pressed state; icon-only toggles need names that do not change with state.

```tsx
import { Toggle } from "@sift-design/ui/toggle";
<Toggle variant="outline" pressed={showDone} onPressedChange={setShowDone}>Show done</Toggle>
```

## Toggle group

Use for a compact segmented choice or independent tag filters. `type="single"` / `"multiple"`; variants `default`, `outline`; sizes inherit Toggle; `spacing` controls the gaps. Single selection travels with **`selectionSpring = { type: "spring", stiffness: 520, damping: 42, mass: 0.6 }`**, scoped to a `useId`-based `LayoutGroup`. A physical spring has no fixed duration; it is interruptible and resolves according to distance/velocity. The pressed segment itself gives to **0.97** on **263ms `--spring-press`**, while selection travel retains its own spring. Multiple selection does not share a travelling highlight. Reduced motion disables shared layout travel and changes selection instantly; color feedback remains **140ms**. Radix handles roving focus; name the group and preserve its single/multiple value shape.

```tsx
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
<ToggleGroup type="single" defaultValue="open" aria-label="Task status">
  <ToggleGroupItem value="open">Open</ToggleGroupItem>
  <ToggleGroupItem value="progress">In progress</ToggleGroupItem>
  <ToggleGroupItem value="done">Done</ToggleGroupItem>
</ToggleGroup>
```

## Tabs

Use when switching between related content panels, not filtering the same list. `TabsList` variants `default` (filled travelling surface), `line` (travelling underline). 32px list height; horizontal/vertical orientations. Indicator uses the exact **520 / 42 / 0.6 selectionSpring** above, independently scoped per Tabs instance. Panels enter with **spring.smooth** (visualDuration **0.28**, bounce **0**) over **±6px → 0**, with a separate **140ms linear** opacity fade; exit drifts **0 → ∓4px** with **spring.snappy** (visualDuration **0.2**, bounce **0.12**) and **80ms linear** fade. Pressed triggers give to **0.97** on **263ms `--spring-press`**. Direction follows trigger order; panels overlap during their brief cross-fade, with no wait. Reduced motion removes shared-layout travel and panel drift, keeping the **140/80ms** panel fades. Radix retains tab/panel relationships, activation mode, disabled tabs and keyboard navigation. Avoid nesting a tab panel in a second tab panel without a clear name.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@sift-design/ui/tabs";
<Tabs defaultValue="notes">
  <TabsList aria-label="Task details"><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>
  <TabsContent value="notes">Keep the new plugs on bench 3.</TabsContent>
  <TabsContent value="activity">John Smith added growing notes.</TabsContent>
</Tabs>
```

## Label

Use with any input that does not already receive a label through Form or Field. 13px medium; no variants or size options. No independent animation; disabled text stays legible. `htmlFor` must match the actual control ID, or wrap a single labelable control.

```tsx
import { Label } from "@sift-design/ui/label";
import { Input } from "@sift-design/ui/input";
<Label htmlFor="area-name">Area name</Label><Input id="area-name" />
```

## Field

Use to structure a control, label, help and error; `FieldSet` / `FieldLegend` group related inputs. Orientations `vertical`, `horizontal`, `responsive`; legend variants `legend`, `label`. Labels 13px, descriptions/errors 12.5px. Errors reveal with a clip and **−4px → 0** drift on **358ms `--spring-snappy`**, with a separate **140ms linear** opacity fade. This suggests a short reveal without animating layout height; content reflows immediately, per the kit’s layout-animation budget. Reduced motion: **140ms linear fade**. `FieldError` has alert semantics; connect its ID using `aria-describedby` on the input and set `aria-invalid`. Do not nest multiple controls under one label.

```tsx
import { Field, FieldLabel, FieldDescription, FieldError } from "@sift-design/ui/field";
import { Input } from "@sift-design/ui/input";
<Field data-invalid={!!error}>
  <FieldLabel htmlFor="title">Task title</FieldLabel>
  <Input id="title" aria-invalid={!!error} aria-describedby="title-help title-error" />
  <FieldDescription id="title-help">Name the plant and the work involved.</FieldDescription>
  {error && <FieldError id="title-error">{error}</FieldError>}
</Field>
```

## Form

Use for React Hook Form context and automatically connected control/description/message IDs. `Form` is a provider, not an HTML form: supply a real `<form>` and a submit handler. No visual variants/sizes; compose Field/Input/Button. Messages use the same **358ms `--spring-snappy` clip/−4px drift plus 140ms linear fade**, reduced to **140ms linear fade**. `FormControl` sets invalid semantics and description IDs; `FormMessage` renders validation, not fabricated example errors. Use Zod through `zodResolver`, and provide descriptions when using `FormDescription` IDs.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@sift-design/ui/form";
import { Field } from "@sift-design/ui/field";
import { Input } from "@sift-design/ui/input";
import { Button } from "@sift-design/ui/button";
const schema = z.object({ title: z.string().trim().min(4, "Give the task a specific title, at least 4 characters.") });
function NewTask() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { title: "" } });
  return <Form {...form}><form noValidate onSubmit={form.handleSubmit(task => localStorage.setItem("greenhouse-draft", JSON.stringify(task)))}>
    <FormField control={form.control} name="title" render={({ field }) => <FormItem><Field>
      <FormLabel>Task title</FormLabel><FormControl><Input {...field} /></FormControl>
      <FormDescription>Name the plant and the work involved.</FormDescription><FormMessage />
    </Field></FormItem>} />
    <Button type="submit" loading={form.formState.isSubmitting}>Save task</Button>
  </form></Form>;
}
```

## Calendar

Use for date and date-range selection. Retains DayPicker’s single/multiple/range modes, controlled month/selection, dropdown captions, disabled dates, locale and custom components. Navigation `buttonVariant` defaults `ghost`; cells 32px. Month animation is on by default (`animate={false}` opts out): incoming month **538ms `--spring-smooth`**, **±14px → 0** and separate **140ms linear** fade; outgoing month **358ms `--spring-snappy`**, **0 → ∓14px** and separate **100ms linear** fade. Both reading directions mirror travel. Caption enters **140ms linear** and exits **80ms linear**. Reduced motion uses only **140ms in / 80ms out linear fades**. DayPicker manages keyboard navigation and focus across months. Use local civil dates, not UTC parsing that shifts a day; label the calendar and surface its chosen date in nearby text.

```tsx
import { useState } from "react";
import { Calendar } from "@sift-design/ui/calendar";
function DueDate() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 10, 10));
  return <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026, 10, 1)} aria-label="Task due date" />;
}
```

## Kbd

Use to describe real keyboard interactions. `Kbd` for a key, `KbdGroup` for a chord; 20px tall, IBM Plex Mono, no variants. Static by design, including reduced motion. A keycap is not an interactive button and must not imply a shortcut the application has not implemented.

```tsx
import { Kbd, KbdGroup } from "@sift-design/ui/kbd";
<span>Go back <KbdGroup><Kbd>Shift</Kbd><Kbd>Tab</Kbd></KbdGroup></span>
```

## Verification surface

`specimen/src/sections/Controls.tsx` is the live reference, at `?section=controls`. Its real task form includes title, area, priority and due date; empty submission renders schema messages, and valid submission writes an actual local draft. Run `node scripts/capture.mjs specimen --shots shots/controls.mjs --axe` from the repo root for whole-section light/dark stills, group close-ups, a 390px invalid form, focus/hover captures, saved-form confirmation, and selection/switch/check/press/calendar filmstrips in both themes plus reduced-motion tabs.

Real-time motion recordings are `controls-motion-{button,switch,segmented,tabs,slider,checkbox}.webp`, plus matching `-mobile.webp` versions at 390px. The switch, segmented control, tabs and checks include rapid reversal, not only settled endpoints. The slider recording demonstrates direct pointer tracking, a held spring affordance, reversal and release. Filmstrips sample **0, 60, 140, 280, 480ms**; reduced-motion tabs retain their fade-only strip.

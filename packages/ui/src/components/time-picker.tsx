import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { IconClock } from "@tabler/icons-react"
import { duration, leave, spring } from "@sift-design/tokens/motion"
import { cn } from "cn"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

/*
 * Time picking without the browser's native control.
 *
 * TimeWheel  Inline columns for hour, minute and (12-hour) period. Each column
 *            is a listbox that scroll-snaps under one shared band, so it works
 *            with a wheel, a trackpad flick, touch, a click, or the keyboard.
 * TimePicker A field that opens a TimeWheel in a popover. Its digits roll to
 *            the new value on a spring.
 *
 * Values are 24-hour "HH:mm" strings, like <input type="time">.
 */

const ROW = 36
const VISIBLE = 5

type Parts = { hour: number; minute: number }
const pad = (n: number) => String(n).padStart(2, "0")

function parseTime(value: string | undefined): Parts {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? "")
  return match
    ? { hour: Math.min(23, Number(match[1])), minute: Math.min(59, Number(match[2])) }
    : { hour: 9, minute: 0 }
}

/** Format a "HH:mm" value for display: "4:30 PM", or "16:30" on a 24-hour clock. */
function formatTime(value: string, hourCycle: 12 | 24 = 12) {
  const { hour, minute } = parseTime(value)
  if (hourCycle === 24) return `${pad(hour)}:${pad(minute)}`
  return `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}`
}

function useControllable(value: string | undefined, defaultValue: string, onChange?: (value: string) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const set = React.useCallback(
    (next: string) => {
      if (value === undefined) setInner(next)
      onChange?.(next)
    },
    [value, onChange]
  )
  return [current, set] as const
}

function WheelColumn({
  label,
  options,
  index,
  onIndex,
  onSide,
  columnRef,
}: {
  label: string
  options: string[]
  index: number
  onIndex: (index: number) => void
  onSide: (direction: -1 | 1) => void
  columnRef: (node: HTMLDivElement | null) => void
}) {
  const reduced = useReducedMotion()
  const node = React.useRef<HTMLDivElement | null>(null)
  const settle = React.useRef(0)
  const typed = React.useRef({ text: "", at: 0 })
  const id = React.useId()
  const behavior = (smooth: boolean): ScrollBehavior => (smooth && !reduced ? "smooth" : "instant")
  // Braces matter: scrollTo can return a promise, and an effect must not return one.
  const scrollToIndex = React.useCallback(
    (i: number, smooth: boolean) => {
      node.current?.scrollTo({ top: i * ROW, behavior: behavior(smooth) })
    },
    [reduced]
  )

  // Start centred on the value without animating.
  React.useLayoutEffect(() => {
    scrollToIndex(index, false)
  }, [])

  // A value set by the keyboard, a click or the parent travels into place.
  React.useEffect(() => {
    const el = node.current
    if (el && Math.round(el.scrollTop / ROW) !== index) scrollToIndex(index, true)
  }, [index, scrollToIndex])

  React.useEffect(() => () => window.clearTimeout(settle.current), [])

  const choose = (i: number) => onIndex(Math.max(0, Math.min(options.length - 1, i)))

  return (
    <div
      ref={(el) => {
        node.current = el
        columnRef(el)
      }}
      data-slot="time-wheel-column"
      role="listbox"
      aria-label={label}
      aria-activedescendant={`${id}-${index}`}
      tabIndex={0}
      onScroll={() => {
        window.clearTimeout(settle.current)
        settle.current = window.setTimeout(() => {
          const el = node.current
          if (!el) return
          const i = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / ROW)))
          if (i !== index) onIndex(i)
        }, 90)
      }}
      onKeyDown={(event) => {
        const keys: Record<string, () => void> = {
          ArrowDown: () => choose(index + 1),
          ArrowUp: () => choose(index - 1),
          PageDown: () => choose(index + VISIBLE),
          PageUp: () => choose(index - VISIBLE),
          Home: () => choose(0),
          End: () => choose(options.length - 1),
          ArrowLeft: () => onSide(-1),
          ArrowRight: () => onSide(1),
        }
        if (keys[event.key]) {
          event.preventDefault()
          keys[event.key]()
          return
        }
        // Type-ahead: "4", "45", "p".
        if (event.key.length === 1 && /[\da-z]/i.test(event.key)) {
          const now = Date.now()
          const text = (now - typed.current.at < 800 ? typed.current.text : "") + event.key.toLowerCase()
          typed.current = { text, at: now }
          const match = options.findIndex((option) => option.toLowerCase().replace(/^0/, "").startsWith(text.replace(/^0/, "")))
          if (match >= 0) choose(match)
        }
      }}
    >
      {options.map((option, i) => (
        <div
          key={option}
          id={`${id}-${i}`}
          role="option"
          aria-selected={i === index}
          data-slot="time-wheel-option"
          onClick={() => choose(i)}
        >
          {option}
        </div>
      ))}
    </div>
  )
}

function TimeWheel({
  value,
  defaultValue = "09:00",
  onValueChange,
  minuteStep = 5,
  hourCycle = 12,
  className,
  "aria-label": ariaLabel = "Time",
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Minutes between options. Values between steps round to the nearest one. */
  minuteStep?: number
  hourCycle?: 12 | 24
  className?: string
  "aria-label"?: string
}) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const { hour, minute } = parseTime(current)
  const columns = React.useRef<(HTMLDivElement | null)[]>([])
  const set = (h: number, m: number) => setCurrent(`${pad(h)}:${pad(m)}`)

  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)
  const minuteIndex = Math.min(minutes.length - 1, Math.round(minute / minuteStep))
  const hours = hourCycle === 12 ? [12, ...Array.from({ length: 11 }, (_, i) => i + 1)] : Array.from({ length: 24 }, (_, i) => i)
  const pm = hour >= 12
  const side = (from: number) => (direction: -1 | 1) => columns.current[from + direction]?.focus()

  return (
    <div data-slot="time-wheel" role="group" aria-label={ariaLabel} className={className}>
      <div data-slot="time-wheel-band" aria-hidden="true" />
      <WheelColumn
        label="Hour"
        options={hours.map((h) => (hourCycle === 12 ? String(h) : pad(h)))}
        index={hourCycle === 12 ? hour % 12 : hour}
        onIndex={(i) => set(hourCycle === 12 ? i + (pm ? 12 : 0) : i, minutes[minuteIndex])}
        onSide={side(0)}
        columnRef={(el) => (columns.current[0] = el)}
      />
      <span data-slot="time-wheel-separator" aria-hidden="true">
        :
      </span>
      <WheelColumn
        label="Minute"
        options={minutes.map(pad)}
        index={minuteIndex}
        onIndex={(i) => set(hour, minutes[i])}
        onSide={side(1)}
        columnRef={(el) => (columns.current[1] = el)}
      />
      {hourCycle === 12 && (
        <WheelColumn
          label="AM or PM"
          options={["AM", "PM"]}
          index={pm ? 1 : 0}
          onIndex={(i) => set((hour % 12) + (i ? 12 : 0), minutes[minuteIndex])}
          onSide={side(2)}
          columnRef={(el) => (columns.current[2] = el)}
        />
      )}
    </div>
  )
}

/** Each character slides up out of its slot as the next one slides in. */
function RollingText({ text }: { text: string }) {
  const reduced = useReducedMotion()
  return (
    <span data-slot="time-roll" aria-hidden="true">
      {[...text].map((char, i) => (
        <span key={i} data-slot="time-roll-slot">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={char}
              initial={reduced ? { opacity: 0 } : { y: "70%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: reduced ? 0 : "-70%",
                opacity: 0,
                transition: {
                  ...(reduced ? { duration: 0 } : spring.exit),
                  opacity: { duration: duration.instant, ease: leave },
                },
              }}
              transition={{
                ...(reduced ? { duration: 0 } : spring.snappy),
                opacity: { duration: duration.quick, ease: "linear" },
              }}
            >
              {char === " " ? " " : char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function TimePicker({
  value,
  defaultValue = "09:00",
  onValueChange,
  minuteStep = 5,
  hourCycle = 12,
  id,
  name,
  disabled,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  minuteStep?: number
  hourCycle?: 12 | 24
  id?: string
  /** Submits the "HH:mm" value with a surrounding form. */
  name?: string
  disabled?: boolean
  className?: string
  "aria-label"?: string
  /** The id of a visible label. The trigger's name becomes that label plus the time. */
  "aria-labelledby"?: string
}) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const [open, setOpen] = React.useState(false)
  const own = React.useId()
  const text = formatTime(current, hourCycle)
  const now = () => {
    const date = new Date()
    const minute = Math.round(date.getMinutes() / minuteStep) * minuteStep
    const hour = (date.getHours() + (minute === 60 ? 1 : 0)) % 24
    setCurrent(`${pad(hour)}:${pad(minute % 60)}`)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-slot="time-picker-trigger"
          aria-labelledby={`${ariaLabelledby ?? (ariaLabel ? `${own}-label` : "")} ${own}-value`.trim()}
          className={cn("justify-start gap-2 font-normal", className)}
        >
          <IconClock aria-hidden="true" />
          {ariaLabel && !ariaLabelledby && (
            <span id={`${own}-label`} className="sr-only">
              {ariaLabel}
            </span>
          )}
          <span id={`${own}-value`} className="sr-only">
            {text}
          </span>
          <RollingText text={text} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" data-slot="time-picker-content" className="w-auto p-3">
        <TimeWheel
          value={current}
          onValueChange={setCurrent}
          minuteStep={minuteStep}
          hourCycle={hourCycle}
          aria-label={ariaLabel ?? "Time"}
        />
        <div data-slot="time-picker-footer">
          <Button type="button" variant="ghost" size="sm" onClick={now}>
            Now
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
      {name && <input type="hidden" name={name} value={current} />}
    </Popover>
  )
}

export { TimePicker, TimeWheel, formatTime }

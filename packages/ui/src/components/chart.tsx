"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { cn } from "cn"
import { useReducedMotion } from "motion/react"
import * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"
import { IconTable } from "@tabler/icons-react"
import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

const INITIAL_DIMENSION = { width: 320, height: 200 } as const
type TooltipNameType = number | string

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// One spring for every chart. Recharts animates marks with a JavaScript easing
// function, so the kit samples the same curve as `--spring-smooth` (spring.smooth
// in tokens/motion.ts): marks arrive and morph on the motion the rest of the kit uses.
const SMOOTH = [0, 0.024, 0.069, 0.138, 0.215, 0.296, 0.364, 0.44, 0.51, 0.574, 0.624, 0.676, 0.722, 0.757, 0.793, 0.824, 0.85, 0.87, 0.89, 0.907, 0.922, 0.933, 0.943, 0.952, 0.959, 0.966, 0.971, 0.976, 0.979, 0.983, 0.985, 0.988, 0.99, 0.991, 0.993, 0.994, 0.995, 0.996, 0.996, 0.997, 0.997, 0.998, 0.998, 0.998, 0.999, 0.999, 0.999, 0.999, 1]
/** The full settle time of spring.smooth, in milliseconds. Matches `--spring-smooth-duration`. */
const CHART_MOTION_MS = 538
const chartEase = Object.assign(
  (t: number) => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    const x = t * (SMOOTH.length - 1)
    const i = Math.floor(x)
    return SMOOTH[i] + (SMOOTH[i + 1] - SMOOTH[i]) * (x - i)
  },
  { isStepper: false as const }
)

/**
 * Animation props for a Recharts mark (Bar, Area, Line, Pie, Radar, RadialBar,
 * Scatter, Funnel). ChartContainer applies them to its direct marks; spread them
 * on a mark that sits inside your own wrapper component.
 */
function chartMotion(reduced: boolean) {
  return {
    isAnimationActive: !reduced,
    animationBegin: 0,
    animationDuration: CHART_MOTION_MS,
    // Recharts accepts an easing function at runtime; its type names only the CSS keywords.
    animationEasing: chartEase as unknown as "ease",
  }
}
function useChartMotion() {
  return chartMotion(!!useReducedMotion())
}

const MARKS: unknown[] = [
  RechartsPrimitive.Bar,
  RechartsPrimitive.Area,
  RechartsPrimitive.Line,
  RechartsPrimitive.Pie,
  RechartsPrimitive.Radar,
  RechartsPrimitive.RadialBar,
  RechartsPrimitive.Scatter,
  RechartsPrimitive.Funnel,
]

// Marks arrive once on the shared spring, and morph on the same spring when the
// data changes. Props set on a mark win, so a chart can still opt out.
function withChartMotion(node: React.ReactNode, motion: ReturnType<typeof chartMotion>): React.ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement<Record<string, unknown>>(child)) return child
    const props = child.props
    const mark = MARKS.includes(child.type)
    const defaults = mark
      ? Object.fromEntries(Object.entries(motion).filter(([key]) => props[key] === undefined))
      : {}
    return React.cloneElement(child, {
      ...defaults,
      ...(props.children && typeof props.children !== "function"
        ? { children: withChartMotion(props.children as React.ReactNode, motion) }
        : {}),
    })
  })
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ref: forwardedRef,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
  initialDimension?: {
    width: number
    height: number
  }
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef]
  )
  const { shown, printing } = useShownNearViewport(ref)
  const reduced = useReducedMotion() ?? false
  const motion = chartMotion(reduced || printing)
  // Marks for the first second: reduced motion fades the new chart in, then never again.
  const [entering, setEntering] = React.useState(true)
  React.useEffect(() => {
    if (!shown) return
    const timer = window.setTimeout(() => setEntering(false), CHART_MOTION_MS + 200)
    return () => window.clearTimeout(timer)
  }, [shown])
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={setRef}
        // A named chart is a figure. The name stays valid while the chart waits to
        // render, and the keyboard layer inside stays reachable (role="img" would hide it).
        role={props["aria-label"] || props["aria-labelledby"] ? "figure" : undefined}
        data-slot="chart"
        data-chart={chartId}
        data-chart-entering={(shown && entering) || undefined}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {shown && (
          <RechartsPrimitive.ResponsiveContainer
            initialDimension={initialDimension}
          >
            {withChartMotion(children, motion) as typeof children}
          </RechartsPrimitive.ResponsiveContainer>
        )}
      </div>
    </ChartContext.Provider>
  )
}

/** A chart renders when its box comes within 200px of the viewport, and then stays.
 * A page with many charts renders only the ones near the reader, so it does not
 * stall, and each chart's marks arrive close to when it is seen. The box keeps its
 * size, and the card, its title and its data table render at once. Before printing,
 * every chart renders without animation, so the page prints whole. */
function useShownNearViewport(ref: React.RefObject<HTMLElement | null>) {
  const [state, setState] = React.useState(() => ({
    shown: typeof IntersectionObserver === "undefined",
    printing: false,
  }))
  React.useEffect(() => {
    const element = ref.current
    if (state.shown || !element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        React.startTransition(() => setState({ shown: true, printing: false }))
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(element)
    const print = () => flushSync(() => setState({ shown: true, printing: true }))
    window.addEventListener("beforeprint", print)
    return () => {
      observer.disconnect()
      window.removeEventListener("beforeprint", print)
    }
  }, [ref, state.shown])
  return state
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme ?? config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

// The tooltip glides between data points on the settle curve, so the eye can follow it.
// Reduced motion moves it at once.
function ChartTooltip(props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  const reduced = !!useReducedMotion()
  return (
    <RechartsPrimitive.Tooltip
      isAnimationActive={!reduced}
      animationDuration={200}
      animationEasing={"cubic-bezier(0.16, 1, 0.3, 1)" as "ease"}
      cursor={{ fill: "var(--subtle)" }}
      {...props}
    />
  )
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-float",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? item.payload?.fill ?? item.color

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex min-w-0 flex-1 justify-between gap-4 leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      data-slot="chart-legend"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-muted-foreground",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        // Series keep the config order, so the legend reads the same as the
        // palette (chart-1 first) even when a stack draws them in another order.
        .map((item, drawn) => ({ item, drawn, rank: Object.keys(config).indexOf(`${nameKey ? (item.payload as Record<string, unknown> | undefined)?.[nameKey] ?? item.dataKey : item.dataKey ?? item.value}`) }))
        .sort((a, b) => (a.rank < 0 || b.rank < 0 ? a.drawn - b.drawn : a.rank - b.rank))
        .map(({ item }, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
              data-slot="chart-legend-item"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

type ChartTableProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The rows the chart plots. */
  data: Record<string, unknown>[]
  /** The same config the chart uses. It names the columns and the rows. */
  config: ChartConfig
  /** The field that names each row, such as `month` or `bench`. */
  labelKey: string
  /** The header of the first column. */
  labelHeader?: React.ReactNode
  /** The value columns, in order. Defaults to the config keys found in the data. */
  keys?: string[]
  /** The table caption: name the measure, the unit and the period. */
  caption?: React.ReactNode
  formatLabel?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
  formatValue?: (value: unknown, key: string, row: Record<string, unknown>) => React.ReactNode
  /** Put the table behind a quiet "Show data" button. Default true. */
  toggle?: boolean
  defaultOpen?: boolean
}

/**
 * The values of a chart as a semantic table. It is the non-visual equivalent of
 * the chart: screen readers, keyboard users, print and forced colors read it.
 */
function ChartTable({
  data,
  config,
  labelKey,
  labelHeader,
  keys,
  caption,
  formatLabel,
  formatValue,
  toggle = true,
  defaultOpen = false,
  className,
  ...props
}: ChartTableProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const columns =
    keys ?? Object.keys(config).filter((key) => data.some((row) => typeof row[key] === "number"))
  const label = (value: unknown, row: Record<string, unknown>) =>
    formatLabel
      ? formatLabel(value, row)
      : typeof value === "string" && config[value]?.label
        ? config[value].label
        : String(value)
  const table = (
    <div className="overflow-x-auto">
      <Table className="text-[12.5px]">
        {caption ? <TableCaption className="mt-2 text-left text-[12px]">{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow reflow={false}>
            <TableHead className="text-muted-foreground">{labelHeader ?? ""}</TableHead>
            {columns.map((key) => (
              <TableHead key={key} className="text-right text-muted-foreground">
                {config[key]?.label ?? key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={String(row[labelKey] ?? index)} reflow={false}>
              <TableCell>{label(row[labelKey], row)}</TableCell>
              {columns.map((key) => (
                <TableCell key={key} numeric className="text-right font-mono tabular-nums">
                  {formatValue
                    ? formatValue(row[key], key, row)
                    : typeof row[key] === "number"
                      ? (row[key] as number).toLocaleString()
                      : String(row[key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
  if (!toggle) {
    return (
      <div data-slot="chart-table" className={cn("w-full", className)} {...props}>
        {table}
      </div>
    )
  }
  return (
    <Collapsible
      data-slot="chart-table"
      open={open}
      onOpenChange={setOpen}
      className={cn("w-full", className)}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="xs" className="-ml-2 text-muted-foreground">
          <IconTable aria-hidden />
          {open ? "Hide data" : "Show data"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2">{table}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export type { ChartTableProps }
export {
  CHART_MOTION_MS,
  chartEase,
  chartMotion,
  useChartMotion,
  ChartTable,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

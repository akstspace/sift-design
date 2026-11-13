import { Collapsible, CollapsibleContent, CollapsibleTrigger, DisclosureBody } from "@sift-design/ui/collapsible";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { IconAlertTriangle, IconCheck, IconChevronRight, IconLoader2 } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Children,
  type ComponentProps,
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
  useId,
} from "react";
import { Shimmer } from "./shimmer";

export type ActionCardStatus = "running" | "done" | "error";
export type ActionCardEmphasis = "change" | "read";

type ActionCardContextValue = { status: ActionCardStatus; emphasis: ActionCardEmphasis; labelId: string };
const ActionCardContext = createContext<ActionCardContextValue>({
  status: "done",
  emphasis: "change",
  labelId: "",
});
const InDetailsContext = createContext(false);
export const useActionCard = () => useContext(ActionCardContext);

const statusLabels: Record<ActionCardStatus, string> = { running: "Running", done: "Done", error: "Failed" };

/** An icon that swaps in place: the new icon pops in on spring.snappy, the old one leaves on spring.exit. */
function SwapIcon({ swapKey, children, className }: { swapKey: string; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span aria-hidden="true" className={cn("ai-action-swap", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={swapKey}
          className="flex"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: reduced ? 1 : 0.94,
            transition: reduced
              ? { duration: duration.instant }
              : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
          }}
          transition={
            reduced ? { duration: duration.quick } : { ...spring.snappy, opacity: { duration: duration.quick } }
          }
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export type ActionCardProps = Omit<ComponentProps<typeof Collapsible>, "asChild"> & {
  /** "running" shimmers the verb and holds back records and changes. "error" turns the icon into a warning. */
  status?: ActionCardStatus;
  /** "change" is a card for a write. "read" is one quiet row whose records sit inside the disclosure. */
  emphasis?: ActionCardEmphasis;
};

/** What an assistant did to records in an app: create, update, move, comment, merge or delete. */
export const ActionCard = ({
  status = "done",
  emphasis = "change",
  className,
  children,
  ...props
}: ActionCardProps) => {
  const labelId = useId();
  return (
    <ActionCardContext.Provider value={{ status, emphasis, labelId }}>
      <Collapsible asChild {...props}>
        <section
          data-slot="action-card"
          data-status={status}
          data-emphasis={emphasis}
          aria-labelledby={labelId}
          className={cn("ai-action-card not-prose flex w-full min-w-0 flex-col text-[13px]", className)}
        >
          {children}
        </section>
      </Collapsible>
    </ActionCardContext.Provider>
  );
};

/** The mark after the verb: a spinner while running, then a check. It swaps in place. */
export const ActionCardStatusMark = ({ className }: { className?: string }) => {
  const { status } = useActionCard();
  return (
    <span
      data-slot="action-card-status"
      data-status={status}
      className={cn("ai-action-status inline-grid size-4 shrink-0 place-items-center", className)}
    >
      {status !== "error" && (
        <SwapIcon swapKey={status}>
          {status === "running" ? (
            <IconLoader2 size={14} className="ai-action-spin" />
          ) : (
            <IconCheck size={14} className="text-good" />
          )}
        </SwapIcon>
      )}
      <span role="status" className="sr-only">
        {statusLabels[status]}
      </span>
    </span>
  );
};

export type ActionCardHeaderProps = Omit<ComponentProps<"div">, "children"> & {
  /** A 14px icon for the kind of action. A failed action shows a warning icon instead. */
  icon?: ReactNode;
  /** What happened, in a short past-tense phrase: "Moved 3 seed trays to Germinating". */
  verb: ReactNode;
  /** Muted words after a "·": "14 results". */
  detail?: ReactNode;
  /** Shows the details toggle. Set it to false when the card has no ActionCardDetails. */
  detailsToggle?: boolean;
  /** The accessible name of the details toggle. */
  detailsLabel?: string;
};

export const ActionCardHeader = ({
  icon,
  verb,
  detail,
  detailsToggle = true,
  detailsLabel = "Call and output",
  className,
  ...props
}: ActionCardHeaderProps) => {
  const { status, emphasis, labelId } = useActionCard();
  const running = status === "running";
  const quiet = emphasis === "read";
  const glyph = (
    <SwapIcon
      swapKey={status === "error" ? "error" : "icon"}
      className={cn(
        "ai-action-glyph size-3.5 shrink-0 [&_svg]:size-3.5",
        status === "error" ? "text-danger" : quiet ? "text-muted-foreground" : "text-link",
      )}
    >
      {status === "error" ? <IconAlertTriangle size={14} /> : icon}
    </SwapIcon>
  );
  const label = (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-baseline whitespace-nowrap",
        quiet ? "font-normal" : running ? "font-medium" : "font-[550]",
      )}
    >
      <span id={labelId} className="ai-action-verb min-w-0 overflow-hidden text-ellipsis">
        {running && typeof verb === "string" ? (
          <Shimmer as="span" className="text-[13px]">
            {verb}
          </Shimmer>
        ) : (
          verb
        )}
      </span>
      {detail != null && (
        <span className="shrink-0 font-normal text-muted-foreground">
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {detail}
        </span>
      )}
    </span>
  );
  const chevron = <IconChevronRight aria-hidden="true" size={14} className="ai-action-chevron shrink-0" />;

  if (quiet) {
    return (
      <div data-slot="action-card-header" className={cn("min-w-0", className)} {...props}>
        <CollapsibleTrigger className="ai-action-row -mx-2 flex min-h-[30px] w-[calc(100%+16px)] min-w-0 items-center gap-2 rounded-md px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {glyph}
          {label}
          <span className="ml-auto flex shrink-0 items-center gap-2 pl-1.5 text-muted-foreground">
            <ActionCardStatusMark />
            {chevron}
          </span>
        </CollapsibleTrigger>
      </div>
    );
  }
  return (
    <div
      data-slot="action-card-header"
      className={cn("flex min-h-[30px] min-w-0 items-center gap-2", className)}
      {...props}
    >
      {glyph}
      {label}
      <ActionCardStatusMark />
      {detailsToggle && <ActionCardDetailsToggle label={detailsLabel}>{chevron}</ActionCardDetailsToggle>}
    </div>
  );
};

function ActionCardDetailsToggle({ label, children }: { label: string; children: ReactNode }) {
  return (
    <CollapsibleTrigger
      data-slot="action-card-toggle"
      className="ai-action-toggle -my-1 -mr-1.5 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={label}
      title={label}
    >
      {children}
    </CollapsibleTrigger>
  );
}

/**
 * Body parts of a change card sit under the verb. They wait while the action runs,
 * then settle in: the height springs open and the content lifts 4px into place.
 */
function Settle({ slot, className, children }: { slot: string; className?: string; children: ReactNode }) {
  const { status } = useActionCard();
  const inDetails = useContext(InDetailsContext);
  const reduced = useReducedMotion();
  if (inDetails) return <div className={className}>{children}</div>;
  const ready = status !== "running";
  return (
    <div data-slot={slot} className="ai-action-part">
      <DisclosureBody open={ready}>
        <motion.div
          initial={false}
          animate={reduced ? { opacity: ready ? 1 : 0 } : { opacity: ready ? 1 : 0, y: ready ? 0 : 4 }}
          transition={reduced ? { duration: duration.quick } : spring.smooth}
          className={cn("pt-1.5 pl-[22px]", className)}
        >
          {children}
        </motion.div>
      </DisclosureBody>
    </div>
  );
}

export type ActionCardRecordsProps = ComponentProps<"ul"> & {
  /** How many records to list before "and N more". Defaults to 12 in a read row and no limit in a change card. */
  limit?: number;
};

export const ActionCardRecords = ({ limit, className, children, ...props }: ActionCardRecordsProps) => {
  const { emphasis } = useActionCard();
  const all = Children.toArray(children);
  const max = limit ?? (emphasis === "read" ? 12 : Infinity);
  const shown = all.slice(0, max);
  return (
    <Settle slot="action-card-records">
      <ul
        aria-label="Records"
        className={cn("m-0 flex list-none flex-col p-0", emphasis === "read" ? "gap-1" : "gap-1.5", className)}
        {...props}
      >
        {shown.map((child, i) => (
          <li key={i} className="min-w-0">
            {child}
          </li>
        ))}
      </ul>
      {all.length > shown.length && (
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">and {all.length - shown.length} more</p>
      )}
    </Settle>
  );
};

export type ActionCardRecordProps = Omit<ComponentProps<"button">, "title" | "children"> & {
  /** A 16px icon for the record. */
  icon?: ReactNode;
  title: ReactNode;
  /** The record is finished: the title is struck through. */
  done?: boolean;
  /** The record's status name, such as "Germinating". */
  status?: ReactNode;
  /** Any CSS color for the status dot, for example "var(--cat-4)". */
  statusColor?: string;
  /** A state that replaces the status, such as "Archived" or "Deleted". The title fades. */
  state?: ReactNode;
  /** Makes the chip a button that opens the record. */
  onOpen?: () => void;
  /** The accessible name of the button. By default it is "Open", then the visible text. */
  openLabel?: string;
};

export const ActionCardRecord = ({
  icon,
  title,
  done,
  status,
  statusColor,
  state,
  onOpen,
  openLabel,
  className,
  ...props
}: ActionCardRecordProps) => {
  const content = (
    <>
      {icon && (
        <span aria-hidden="true" className="grid shrink-0 place-items-center text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium",
          done && "text-muted-foreground",
          state != null && "text-muted-foreground",
        )}
      >
        <span data-slot="strike" data-struck={done || undefined} className="[--strike-color:var(--color-input)]">
          {title}
        </span>
      </span>
      {state != null ? (
        <span className="shrink-0 text-[12px] whitespace-nowrap text-muted-foreground">{state}</span>
      ) : (
        status != null && (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] whitespace-nowrap text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-[7px] rounded-full bg-muted-foreground"
              style={statusColor ? ({ background: statusColor } as CSSProperties) : undefined}
            />
            {status}
          </span>
        )
      )}
    </>
  );
  const base =
    "ai-action-record flex w-full min-w-0 items-center gap-2 rounded-md bg-tint py-[7px] pr-2.5 pl-2 text-left text-[13px] text-foreground";
  if (!onOpen)
    return (
      <span data-slot="action-card-record" className={cn(base, className)}>
        {content}
      </span>
    );
  return (
    <button
      type="button"
      data-slot="action-card-record"
      onClick={onOpen}
      aria-label={openLabel}
      className={cn(
        base,
        "cursor-pointer outline-none hover:bg-tint-strong focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <span className="sr-only">Open </span>
      {content}
    </button>
  );
};

export type ActionCardChangesProps = Omit<ComponentProps<"ul">, "children"> & {
  /** Short phrases: "Moved to Germinating", "Heat mat on". */
  changes: ReactNode[];
};

export const ActionCardChanges = ({ changes, className, ...props }: ActionCardChangesProps) => {
  if (!changes.length) return null;
  return (
    <Settle slot="action-card-changes">
      <ul aria-label="Changes" className={cn("m-0 flex list-none flex-wrap gap-1.5 p-0", className)} {...props}>
        {changes.map((change, i) => (
          <li key={i} className="rounded-full bg-subtle px-2.5 py-0.5 text-[12px] text-foreground">
            {change}
          </li>
        ))}
      </ul>
    </Settle>
  );
};

export type ActionCardQuoteProps = ComponentProps<"blockquote">;
export const ActionCardQuote = ({ className, ...props }: ActionCardQuoteProps) => (
  <Settle slot="action-card-quote">
    <blockquote
      className={cn(
        "m-0 border-l-2 py-px pl-3 text-[13px] whitespace-pre-wrap text-muted-foreground [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
  </Settle>
);

export type ActionCardErrorProps = ComponentProps<"p">;
export const ActionCardError = ({ className, ...props }: ActionCardErrorProps) => (
  <Settle slot="action-card-error">
    <p role="alert" className={cn("m-0 text-[12.5px] text-danger [overflow-wrap:anywhere]", className)} {...props} />
  </Settle>
);

export type ActionCardLinkProps = ComponentProps<"button">;
export const ActionCardLink = ({ className, children = "Open in history", ...props }: ActionCardLinkProps) => (
  <Settle slot="action-card-link">
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-sm text-[12.5px] font-medium text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
      <IconChevronRight aria-hidden="true" size={12} />
    </button>
  </Settle>
);

export type ActionCardDetailsProps = ComponentProps<typeof CollapsibleContent> & {
  /** The raw call, shown as code. */
  call?: string;
  /** The raw output, shown as code. It turns red when the action failed. */
  output?: string;
};

/** The collapsible area under the header. Its height springs open on spring.smooth and closes on spring.exit. */
export const ActionCardDetails = ({ call, output, className, children, ...props }: ActionCardDetailsProps) => {
  const { status, emphasis } = useActionCard();
  return (
    <CollapsibleContent data-slot="action-card-details" {...props}>
      <InDetailsContext.Provider value={true}>
        <div
          className={cn(
            "flex min-w-0 flex-col gap-1.5 pt-1.5 pb-1 text-[13px]",
            emphasis === "change" && "pl-[22px]",
            className,
          )}
        >
          {children}
          {call && <ActionCardCode label="Call">{call}</ActionCardCode>}
          {output && (
            <ActionCardCode label="Output" error={status === "error"}>
              {output}
            </ActionCardCode>
          )}
        </div>
      </InDetailsContext.Provider>
    </CollapsibleContent>
  );
};

function ActionCardCode({ label, error, children }: { label: string; error?: boolean; children: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[12px] font-medium text-muted-foreground">{label}</p>
      <pre
        className={cn(
          "m-0 max-h-56 overflow-auto rounded-md bg-tint px-3 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]",
          error ? "text-danger" : "text-foreground",
        )}
      >
        {children}
      </pre>
    </div>
  );
}

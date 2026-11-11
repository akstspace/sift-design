import { Button } from "@sift-design/ui/button";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { IconMessageCircle, IconX } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type AssistantDockState = "idle" | "working" | "unread" | "question";

/** Dialogs and alerts own the keyboard while they are open, so the shortcut waits. */
const KEYBOARD_OWNERS = '[role="dialog"], [role="alertdialog"]';

/**
 * Radii of the shared surface. The pill uses half its 42px height, not 999px:
 * it looks the same, and the morph stays a rounded rectangle. A 999px radius
 * turns the growing surface into an ellipse for the first frames.
 */
const PILL_RADIUS = 21;
const PANEL_RADIUS = 20;

type Shortcut = { key: string; mod: boolean; ctrl: boolean; meta: boolean; alt: boolean; shift: boolean };

const parseShortcut = (value: string): Shortcut => {
  const parts = value.toLowerCase().split("+");
  const has = (name: string) => parts.slice(0, -1).includes(name);
  return {
    key: parts.at(-1) ?? "",
    mod: has("mod"),
    ctrl: has("ctrl"),
    meta: has("meta"),
    alt: has("alt"),
    shift: has("shift"),
  };
};

const matchesShortcut = (event: KeyboardEvent, s: Shortcut) => {
  if (event.key.toLowerCase() !== s.key || event.altKey !== s.alt || event.shiftKey !== s.shift) return false;
  if (s.mod) return event.metaKey || event.ctrlKey;
  return event.metaKey === s.meta && event.ctrlKey === s.ctrl;
};

/** "mod+j" → "Meta+J Control+J", the value for aria-keyshortcuts. */
const ariaShortcut = (s: Shortcut) => {
  const key = s.key.length === 1 ? s.key.toUpperCase() : s.key;
  const extra = [s.alt && "Alt", s.shift && "Shift"].filter(Boolean).join("+");
  const join = (mod: string) => [mod, extra, key].filter(Boolean).join("+");
  if (s.mod) return `${join("Meta")} ${join("Control")}`;
  return join([s.meta && "Meta", s.ctrl && "Control"].filter(Boolean).join("+"));
};

/** "mod+j" → "⌘J". Pass `shortcutLabel` where the Control key applies ("Ctrl J"). */
const defaultLabel = (s: Shortcut) =>
  [s.mod || s.meta ? "⌘" : "", s.ctrl ? "Ctrl " : "", s.alt ? "⌥" : "", s.shift ? "⇧" : "", s.key.toUpperCase()].join(
    "",
  );

type DockContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  reduced: boolean;
  surfaceId: string;
  pillRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  shortcutLabel: string;
  shortcutAria: string;
};

const DockContext = createContext<DockContextValue | null>(null);

const useDock = () => {
  const context = useContext(DockContext);
  if (!context) throw new Error("AssistantDock parts must be used within AssistantDock");
  return context;
};

export const useAssistantDock = () => {
  const { open, setOpen } = useDock();
  return { open, setOpen };
};

export type AssistantDockProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Toggles the dock. "mod" is Command or Control. Pass an empty string to turn it off. */
  shortcut?: string;
  /** The key hint on the pill. Defaults to a short form of `shortcut`, such as "⌘J". */
  shortcutLabel?: string;
  /** "fixed" pins the dock to the window. "relative" fills the nearest positioned parent, for a bounded frame. */
  position?: "fixed" | "relative";
};

/**
 * A launcher pill in the corner that changes shape into a chat panel. The pill
 * and the panel share one surface through a layoutId: the pill's radius of
 * 999px becomes the panel's 20px while their contents cross-fade.
 */
export const AssistantDock = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  shortcut = "mod+j",
  shortcutLabel,
  position = "fixed",
  className,
  children,
  ...props
}: AssistantDockProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const reduced = !!useReducedMotion();
  const surfaceId = useId();
  const pillRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const parsed = useMemo(() => parseShortcut(shortcut), [shortcut]);

  const setOpen = useCallback(
    (value: boolean) => {
      setInternalOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (shortcut && parsed.key && matchesShortcut(event, parsed)) {
        if (document.querySelector(KEYBOARD_OWNERS)) return;
        event.preventDefault();
        setOpen(!open);
        return;
      }
      // Escape closes the panel from inside it, or when nothing has focus
      // (for example, right after the focused card in the panel was removed).
      if (event.key !== "Escape" || event.defaultPrevented || !open) return;
      const active = document.activeElement;
      const inside = !!active && !!panelRef.current?.contains(active);
      if (!inside && active !== document.body) return;
      if (document.querySelector(KEYBOARD_OWNERS + ', [role="menu"]')) return;
      event.preventDefault();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, parsed, setOpen, shortcut]);

  // Opening moves the keyboard into the panel. A panel that is open on the
  // first render (restored with the page) leaves focus where it is. Closing
  // returns focus to the pill when focus was in the panel or nowhere.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const panel = panelRef.current;
      if (open) {
        if (!panel || panel.contains(active) || matchMedia("(pointer: coarse)").matches) return;
        const target =
          panel.querySelector<HTMLElement>("[data-autofocus]") ??
          panel.querySelector<HTMLElement>("textarea:not([disabled]), input:not([type=hidden]):not([disabled])") ??
          panel;
        target.focus();
      } else if (!active || active === document.body || panel?.contains(active)) {
        pillRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const value = useMemo<DockContextValue>(
    () => ({
      open,
      setOpen,
      reduced,
      surfaceId,
      pillRef,
      panelRef,
      shortcutLabel: shortcut ? (shortcutLabel ?? defaultLabel(parsed)) : "",
      shortcutAria: shortcut ? ariaShortcut(parsed) : "",
    }),
    [open, setOpen, reduced, surfaceId, shortcut, shortcutLabel, parsed],
  );

  return (
    <DockContext.Provider value={value}>
      <div
        data-slot="assistant-dock"
        data-state={open ? "open" : "closed"}
        data-position={position}
        className={cn(
          "ai-dock pointer-events-none inset-0 flex flex-col items-end justify-end p-3 sm:p-4",
          position === "fixed" ? "fixed z-40" : "absolute z-10",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
};

/**
 * A leaving pill or panel stays in the DOM until the shared morph settles.
 * It is inert from the moment it leaves, so Tab cannot reach it.
 */
const PresentButton = (props: ComponentProps<typeof motion.button>) => {
  const present = useIsPresent();
  return <motion.button {...props} inert={!present || undefined} />;
};
const PresentSection = (props: ComponentProps<typeof motion.section>) => {
  const present = useIsPresent();
  return <motion.section {...props} inert={!present || undefined} />;
};

const stateLabels: Record<AssistantDockState, string> = {
  idle: "Ask the assistant",
  working: "Assistant is working…",
  unread: "New reply from the assistant",
  question: "The assistant has a question",
};

export type AssistantDockTriggerProps = Omit<ComponentProps<typeof motion.button>, "children"> & {
  /** What the assistant is doing. The text and the signal dot follow it. */
  state?: AssistantDockState;
  /** The text for each state. */
  labels?: Partial<Record<AssistantDockState, string>>;
  /** The mark at the start of the pill. */
  icon?: ReactNode;
};

/** The pill. It shows only while the dock is closed. */
export const AssistantDockTrigger = ({
  state = "idle",
  labels,
  icon,
  className,
  onClick,
  ...props
}: AssistantDockTriggerProps) => {
  const { open, setOpen, reduced, surfaceId, pillRef, shortcutLabel, shortcutAria } = useDock();
  const text = { ...stateLabels, ...labels }[state];
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {!open && (
        <PresentButton
          key="pill"
          ref={pillRef}
          type="button"
          data-slot="assistant-dock-trigger"
          data-state={state}
          layoutId={reduced ? undefined : surfaceId}
          className={cn(
            "ai-dock-pill pointer-events-auto relative flex h-[42px] max-w-full cursor-pointer items-center overflow-hidden border pr-2 pl-2.5 outline-none",
            className,
          )}
          style={{ borderRadius: PILL_RADIUS }}
          initial={reduced ? { opacity: 0 } : undefined}
          animate={reduced ? { opacity: 1 } : undefined}
          exit={reduced ? { opacity: 0, transition: { duration: duration.instant } } : undefined}
          transition={reduced ? { duration: duration.quick } : spring.smooth}
          aria-label={shortcutLabel ? `${text}. Open chat (${shortcutLabel})` : `${text}. Open chat`}
          aria-keyshortcuts={shortcutAria || undefined}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) setOpen(true);
          }}
          {...props}
        >
          {/* Arriving from the panel, the pill starts in the panel's color and fades to its own. */}
          {!reduced && (
            <motion.span
              aria-hidden="true"
              className="ai-dock-tint ai-dock-tint-panel"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, transition: { duration: duration.instant, ease: "linear" } }}
            />
          )}
          <motion.span
            layout={!reduced}
            className="relative flex min-w-0 items-center gap-2.5 text-[13px] font-medium whitespace-nowrap"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18, delay: reduced ? 0 : 0.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
          >
            <span aria-hidden="true" className="ml-0.5 grid size-[22px] shrink-0 place-items-center">
              {icon ?? <IconMessageCircle className="size-4" />}
            </span>
            <span className="relative flex min-w-0 items-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={state}
                  className="flex min-w-0 items-center gap-2"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: reduced
                      ? { duration: duration.quick }
                      : { ...spring.smooth, opacity: { duration: duration.quick, ease: "linear" } },
                  }}
                  exit={{
                    opacity: 0,
                    y: reduced ? 0 : -8,
                    transition: reduced
                      ? { duration: duration.instant }
                      : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
                  }}
                >
                  {state !== "idle" && (
                    <span
                      aria-hidden="true"
                      data-state={state}
                      className="ai-dock-signal size-[7px] shrink-0 rounded-full"
                    />
                  )}
                  <span className="truncate">{text}</span>
                </motion.span>
              </AnimatePresence>
            </span>
            {shortcutLabel && (
              // The hint is drawn from data-label, so the pill's visible text stays its accessible name.
              <kbd aria-hidden="true" data-label={shortcutLabel} className="ai-dock-kbd max-sm:hidden" />
            )}
          </motion.span>
        </PresentButton>
      )}
    </AnimatePresence>
  );
};

export type AssistantDockPanelProps = Omit<ComponentProps<typeof motion.section>, "children"> & {
  children?: ReactNode;
};

/** The panel. It shows only while the dock is open. Name it with aria-label. */
export const AssistantDockPanel = ({
  className,
  children,
  "aria-label": ariaLabel = "Assistant",
  ...props
}: AssistantDockPanelProps) => {
  const { open, reduced, surfaceId, panelRef } = useDock();
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {open && (
        <PresentSection
          key="panel"
          ref={panelRef}
          tabIndex={-1}
          data-slot="assistant-dock-panel"
          aria-label={ariaLabel}
          layoutId={reduced ? undefined : surfaceId}
          className={cn(
            "ai-dock-panel pointer-events-auto relative flex h-[min(640px,100%)] min-h-0 w-[min(420px,100%)] flex-col overflow-hidden border bg-card text-card-foreground shadow-float outline-none",
            className,
          )}
          style={{ borderRadius: PANEL_RADIUS }}
          initial={reduced ? { opacity: 0 } : undefined}
          animate={reduced ? { opacity: 1 } : undefined}
          exit={reduced ? { opacity: 0, transition: { duration: duration.instant } } : undefined}
          transition={reduced ? { duration: duration.quick } : spring.smooth}
          {...props}
        >
          {/* Arriving from the pill, the panel starts in the pill's color and fades to its own. */}
          {!reduced && (
            <motion.span
              aria-hidden="true"
              className="ai-dock-tint ai-dock-tint-pill"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, transition: { duration: duration.instant, ease: "linear" } }}
            />
          )}
          <motion.div
            className="relative flex min-h-0 flex-1 flex-col"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, delay: reduced ? 0 : 0.08 } }}
            exit={{ opacity: 0, transition: { duration: duration.instant } }}
          >
            {children}
          </motion.div>
        </PresentSection>
      )}
    </AnimatePresence>
  );
};

export type AssistantDockHeaderProps = ComponentProps<"header">;

export const AssistantDockHeader = ({ className, ...props }: AssistantDockHeaderProps) => (
  <header
    data-slot="assistant-dock-header"
    className={cn("flex shrink-0 items-center gap-2.5 border-b py-2.5 pr-2.5 pl-4", className)}
    {...props}
  />
);

export type AssistantDockCloseProps = ComponentProps<typeof Button>;

export const AssistantDockClose = ({ className, onClick, children, ...props }: AssistantDockCloseProps) => {
  const { setOpen } = useDock();
  return (
    <Button
      data-slot="assistant-dock-close"
      type="button"
      variant="ghost"
      size="icon"
      className={cn("ml-auto text-muted-foreground hover:text-foreground", className)}
      aria-label="Close chat"
      aria-keyshortcuts="Escape"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      {...props}
    >
      {children ?? <IconX aria-hidden="true" className="size-4" />}
    </Button>
  );
};

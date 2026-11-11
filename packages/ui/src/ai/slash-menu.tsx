import { duration, leave, selectionSpring, spring } from "@sift-design/tokens/motion";
import { cn } from "cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type SlashCommand = {
  /** The command without its slash: "summarize". */
  name: string;
  /** One short line on what the command does. */
  description?: string;
};

export type UseSlashCommandsOptions<Command extends SlashCommand = SlashCommand> = {
  commands: readonly Command[];
  /** The current draft in the composer. */
  value: string;
  /** Called when a person picks a command. Set the draft here, for example to "/summarize ". */
  onPick: (command: Command) => void;
  /** The most rows to show. */
  limit?: number;
  /** The accessible name of the list. */
  label?: string;
};

/** The draft is one "/word" with no space: the only time the menu shows. */
const SLASH_DRAFT = /^\/\S*$/;

/**
 * Connects a composer textarea to a list of slash commands. Spread
 * `textareaProps` on the textarea (for example PromptInputTextarea), and
 * `menuProps` on SlashMenu. Map `matches` to SlashMenuItem with
 * `getItemProps(index)`.
 */
export function useSlashCommands<Command extends SlashCommand>({
  commands,
  value,
  onPick,
  limit = 8,
  label = "Commands",
}: UseSlashCommandsOptions<Command>) {
  const id = useId();
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const query = value.split(/\s/)[0];
  const matches =
    SLASH_DRAFT.test(value) && !dismissed
      ? commands.filter((c) => ("/" + c.name).startsWith(query) || c.name.includes(query.slice(1))).slice(0, limit)
      : [];
  const open = matches.length > 0;
  const index = Math.min(active, Math.max(matches.length - 1, 0));
  const optionId = (i: number) => `${id}-option-${i}`;

  // A new first word starts a new search: the first row is active and Escape is forgotten.
  useEffect(() => {
    setActive(0);
    setDismissed(false);
  }, [query]);

  const pick = useCallback((command: Command) => onPick(command), [onPick]);
  const close = useCallback(() => setDismissed(true), []);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index - 1 + matches.length) % matches.length);
    } else if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      pick(matches[index]);
    } else if (event.key === "Enter" && !event.shiftKey && "/" + matches[index].name !== value.trim()) {
      // A draft that already is the whole command sends on Enter instead.
      event.preventDefault();
      pick(matches[index]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return {
    open,
    matches,
    activeIndex: index,
    setActiveIndex: setActive,
    pick,
    close,
    textareaProps: {
      onKeyDown,
      "aria-autocomplete": "list" as const,
      "aria-controls": open ? id : undefined,
      "aria-activedescendant": open ? optionId(index) : undefined,
    },
    menuProps: { id, open, "aria-label": label },
    getItemProps: (i: number) => ({
      id: optionId(i),
      name: matches[i].name,
      description: matches[i].description,
      active: i === index,
      onSelect: () => pick(matches[i]),
      onActivate: () => setActive(i),
    }),
  };
}

const SlashMenuContext = createContext<{ highlightId: string; reduced: boolean }>({
  highlightId: "slash-menu-highlight",
  reduced: false,
});

export type SlashMenuProps = Omit<ComponentProps<"ul">, "children"> & {
  /** Shows the menu. It rises from the composer edge and leaves on a shorter exit. */
  open: boolean;
  children?: ReactNode;
};

/**
 * A listbox above the composer. Put it and the composer in one element with
 * `position: relative`; the menu sits on the composer's top edge.
 */
export const SlashMenu = ({ open, ...props }: SlashMenuProps) => (
  <AnimatePresence>{open && <SlashMenuSurface key="slash-menu" {...props} />}</AnimatePresence>
);

const SlashMenuSurface = ({ className, children, ...props }: Omit<SlashMenuProps, "open">) => {
  const reduced = !!useReducedMotion();
  const highlightId = useId();
  const list = useRef<HTMLUListElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  // The list keeps its height in a measured wrapper, so a shorter result list closes smoothly.
  useLayoutEffect(() => {
    const node = list.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      data-slot="slash-menu"
      className={cn(
        "ai-slash-menu absolute inset-x-3 bottom-[calc(100%-2px)] z-20 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-float",
        className,
      )}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        height,
        transition: reduced
          ? { duration: duration.quick, height: { duration: 0 } }
          : { ...spring.smooth, opacity: { duration: duration.quick, ease: "linear" } },
      }}
      exit={{
        opacity: 0,
        y: reduced ? 0 : 4,
        transition: reduced
          ? { duration: duration.instant }
          : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
      }}
    >
      <SlashMenuContext.Provider value={{ highlightId, reduced }}>
        <ul
          ref={list}
          role="listbox"
          className="isolate m-0 flex max-h-[264px] list-none flex-col overflow-y-auto overscroll-contain p-1"
          {...props}
        >
          {children}
        </ul>
      </SlashMenuContext.Provider>
    </motion.div>
  );
};

export type SlashMenuItemProps = Omit<ComponentProps<"li">, "onSelect"> & {
  /** The command name, without the slash. */
  name: string;
  description?: ReactNode;
  /** The keyboard row. The textarea keeps focus and points here with aria-activedescendant. */
  active?: boolean;
  /** Pick the command, on click or tap. */
  onSelect?: () => void;
  /** Make this row active, on hover. */
  onActivate?: () => void;
};

export const SlashMenuItem = ({
  name,
  description,
  active = false,
  onSelect,
  onActivate,
  className,
  ...props
}: SlashMenuItemProps) => {
  const { highlightId, reduced } = useContext(SlashMenuContext);
  const row = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (active) row.current?.scrollIntoView({ block: "nearest" });
  }, [active]);
  return (
    <li
      ref={row}
      data-slot="slash-menu-item"
      role="option"
      aria-selected={active}
      data-active={active || undefined}
      className={cn("relative flex min-w-0 cursor-pointer items-baseline gap-2.5 px-2.5 py-1.5", className)}
      // The textarea keeps focus: the row never takes it.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      onMouseEnter={onActivate}
      {...props}
    >
      {active && (
        <motion.span
          aria-hidden="true"
          layoutId={highlightId}
          className="absolute inset-0 -z-10 bg-hover"
          style={{ borderRadius: 8 }}
          transition={reduced ? { duration: 0 } : selectionSpring}
        />
      )}
      <code className="shrink-0 font-mono text-[12.5px] text-foreground">/{name}</code>
      {description && <span className="min-w-0 truncate text-[12px] text-muted-foreground">{description}</span>}
    </li>
  );
};

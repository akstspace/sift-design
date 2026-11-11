import { Badge } from "@sift-design/ui/badge";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@sift-design/ui/carousel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@sift-design/ui/hover-card";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { cn } from "cn";
import {
  type ComponentProps,
  type RefObject,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export type InlineCitationProps = ComponentProps<"span">;
export const InlineCitation = ({ className, ...props }: InlineCitationProps) => (
  <span data-slot="inline-citation" className={cn("group inline", className)} {...props} />
);
export type InlineCitationTextProps = ComponentProps<"span">;
export const InlineCitationText = ({ className, ...props }: InlineCitationTextProps) => (
  <span
    className={cn(
      "ai-citation-text rounded-[3px] group-focus-within:bg-tint group-hover:bg-tint group-has-[[aria-expanded=true]]:bg-tint",
      className,
    )}
    {...props}
  />
);

type CitationContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: RefObject<HTMLButtonElement | null>;
  body: RefObject<HTMLDivElement | null>;
  id: string;
};
const CitationContext = createContext<CitationContextValue | null>(null);
export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;
export const InlineCitationCard = ({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: InlineCitationCardProps) => {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlled ?? internal;
  const trigger = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  const setOpen = (value: boolean) => {
    setInternal(value);
    onOpenChange?.(value);
  };
  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node && (trigger.current?.contains(target) || body.current?.contains(target));
    const dismiss = (event: PointerEvent | FocusEvent) => {
      if (!inside(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      trigger.current?.focus();
      setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onOpenChange]);
  return (
    <CitationContext.Provider value={{ open, setOpen, trigger, body, id }}>
      <HoverCard
        openDelay={0}
        closeDelay={120}
        {...props}
        open={open}
        onOpenChange={(value) => {
          if (
            !value &&
            (trigger.current?.contains(document.activeElement) || body.current?.contains(document.activeElement))
          )
            return;
          setOpen(value);
        }}
      >
        {children}
      </HoverCard>
    </CitationContext.Provider>
  );
};

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & { sources: string[]; number?: number };
export const InlineCitationCardTrigger = ({
  sources,
  number,
  children,
  className,
  asChild: _asChild,
  variant = "secondary",
  onClick,
  onFocus,
  onPointerDown,
  onKeyDown,
  ...props
}: InlineCitationCardTriggerProps) => {
  const context = useContext(CitationContext);
  const wasOpen = useRef(false);
  let label = "Source";
  try {
    if (sources[0]) label = new URL(sources[0]).hostname;
  } catch {
    /* Invalid URLs keep a readable fallback. */
  }
  return (
    <HoverCardTrigger asChild>
      <Badge
        asChild
        variant={variant}
        className={cn(
          "ai-citation-trigger relative ml-0.5 inline-flex h-[18px] min-w-[18px] cursor-pointer items-center justify-center rounded-full px-1.5 align-[1px] font-mono text-xs leading-none tabular-nums after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-['']",
          className,
        )}
        {...props}
      >
        <button
          ref={context?.trigger}
          type="button"
          aria-label={number ? `Citation ${number}, ${sources.length} sources` : `${label}, ${sources.length} sources`}
          aria-expanded={context?.open}
          aria-controls={context?.open ? context.id : undefined}
          aria-haspopup="dialog"
          onPointerDown={(event) => {
            wasOpen.current = context?.open ?? false;
            onPointerDown?.(event);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            if (!event.defaultPrevented) context?.setOpen(true);
          }}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) context?.setOpen(event.detail === 0 ? true : !wasOpen.current);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== "Tab" || event.shiftKey || !context?.open) return;
            const first = context.body.current?.querySelector<HTMLElement>("button:not(:disabled), a[href]");
            if (first) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          {children ??
            (number ? (
              `[${number}]`
            ) : (
              <>
                {label}
                {sources.length > 1 ? ` +${sources.length - 1}` : ""}
              </>
            ))}
        </button>
      </Badge>
    </HoverCardTrigger>
  );
};

export type InlineCitationCardBodyProps = ComponentProps<"div">;
export const InlineCitationCardBody = ({ className, onKeyDown, ...props }: InlineCitationCardBodyProps) => {
  const context = useContext(CitationContext);
  useEffect(() => {
    // Portalled content mounts after the wrapper effect. Wait for its DOM node.
    let observer: MutationObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const body = context?.body.current;
      if (!body) return;
      // The hover-card primitive removes tab stops. Interactive citations restore them.
      const restore = () =>
        body.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]").forEach((node) => {
          if (node.getAttribute("tabindex") === "-1") node.setAttribute("tabindex", "0");
        });
      restore();
      observer = new MutationObserver(restore);
      observer.observe(body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["tabindex", "disabled"],
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [context?.open]);
  return (
    <HoverCardContent
      ref={context?.body}
      id={context?.id}
      role="dialog"
      aria-label="Citation sources"
      collisionPadding={16}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== "Tab") return;
        const items = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]")].filter(
          (node) => !node.closest("[inert]"),
        );
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next = items[index + (event.shiftKey ? -1 : 1)];
        if (next) {
          event.preventDefault();
          next.focus();
        } else if (event.shiftKey) {
          event.preventDefault();
          context?.trigger.current?.focus();
        } else {
          event.preventDefault();
          const trigger = context?.trigger.current;
          const following = [
            ...document.querySelectorAll<HTMLElement>(
              "button:not(:disabled), a[href], input, select, textarea, [tabindex='0']",
            ),
          ].find(
            (node) =>
              trigger &&
              !event.currentTarget.contains(node) &&
              !node.closest("[inert]") &&
              node.getClientRects().length > 0 &&
              trigger.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
          );
          following?.focus();
          context?.setOpen(false);
        }
      }}
      data-slot="inline-citation-card"
      className={cn("ai-citation-card relative w-80 max-w-[calc(100vw-2rem)] overflow-hidden p-0", className)}
      {...props}
    />
  );
};

type CitationCarouselContext = { api: CarouselApi; current: number; count: number };
const CarouselApiContext = createContext<CitationCarouselContext>({ api: undefined, current: 0, count: 0 });
export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;
export const InlineCitationCarousel = ({
  className,
  children,
  setApi: onApi,
  ...props
}: InlineCitationCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selection, setSelection] = useState({ current: 0, count: 0 });
  useEffect(() => {
    if (!api) return;
    const update = () => {
      const root = api.rootNode().closest('[data-slot="carousel"]') ?? api.rootNode();
      const focused = document.activeElement;
      const previous = root.querySelector<HTMLButtonElement>('[aria-label="Previous source"]');
      const next = root.querySelector<HTMLButtonElement>('[aria-label="Next source"]');
      const current = api.selectedScrollSnap();
      const count = api.scrollSnapList().length;
      setSelection({ current, count });
      // A boundary button becomes disabled. Keep focus inside the active card.
      requestAnimationFrame(() => {
        if (focused === next && current === count - 1) previous?.focus();
        else if (focused === previous && current === 0) next?.focus();
        else if (focused instanceof HTMLElement && focused.closest('[data-citation-active="false"]')) {
          root.querySelector<HTMLElement>('[data-citation-active="true"] a[href]')?.focus();
        }
      });
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);
  return (
    <CarouselApiContext.Provider value={{ api, ...selection }}>
      <Carousel
        aria-label="Citation sources"
        className={cn("ai-citation-carousel w-full", className)}
        setApi={(value) => {
          setApi(value);
          onApi?.(value);
        }}
        {...props}
      >
        {children}
      </Carousel>
    </CarouselApiContext.Provider>
  );
};
export type InlineCitationCarouselContentProps = ComponentProps<"div">;
export const InlineCitationCarouselContent = ({ className, ...props }: InlineCitationCarouselContentProps) => (
  <CarouselContent className={cn("ai-citation-track ml-0", className)} {...props} />
);
export type InlineCitationCarouselItemProps = ComponentProps<"div">;
export const InlineCitationCarouselItem = ({ className, style, ...props }: InlineCitationCarouselItemProps) => {
  const { api, current } = useContext(CarouselApiContext);
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (api && ref.current) setIndex(api.slideNodes().indexOf(ref.current));
  }, [api]);
  const active = current === index;
  return (
    <CarouselItem
      ref={ref}
      data-citation-active={active}
      aria-hidden={!active}
      inert={!active}
      className={cn("ai-citation-slide space-y-3 p-4", className)}
      style={{ ...style, transform: `translateX(-${index * 100}%)` }}
      {...props}
    />
  );
};
export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;
export const InlineCitationCarouselHeader = ({ className, ...props }: InlineCitationCarouselHeaderProps) => (
  <div className={cn("flex items-center gap-1 border-b bg-tint px-2 py-1.5", className)} {...props} />
);
export type InlineCitationCarouselIndexProps = ComponentProps<"div">;
export const InlineCitationCarouselIndex = ({ children, className, ...props }: InlineCitationCarouselIndexProps) => {
  const { current, count } = useContext(CarouselApiContext);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn("flex-1 px-2 text-right font-mono text-[12px] tabular-nums text-muted-foreground", className)}
      {...props}
    >
      {children ?? `${count ? current + 1 : 0}/${count}`}
    </div>
  );
};
export type InlineCitationCarouselPrevProps = ComponentProps<"button">;
export const InlineCitationCarouselPrev = ({
  className,
  onClick,
  disabled,
  ...props
}: InlineCitationCarouselPrevProps) => {
  const { api, current } = useContext(CarouselApiContext);
  return (
    <button
      type="button"
      aria-label="Previous source"
      disabled={disabled ?? current === 0}
      className={cn(
        "ai-citation-nav inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-tint disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) api?.scrollPrev(true);
      }}
    >
      <IconArrowLeft aria-hidden className="size-4" />
    </button>
  );
};
export type InlineCitationCarouselNextProps = ComponentProps<"button">;
export const InlineCitationCarouselNext = ({
  className,
  onClick,
  disabled,
  ...props
}: InlineCitationCarouselNextProps) => {
  const { api, current, count } = useContext(CarouselApiContext);
  return (
    <button
      type="button"
      aria-label="Next source"
      disabled={disabled ?? current >= count - 1}
      className={cn(
        "ai-citation-nav inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-tint disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) api?.scrollNext(true);
      }}
    >
      <IconArrowRight aria-hidden className="size-4" />
    </button>
  );
};
export type InlineCitationSourceProps = ComponentProps<"div"> & { title?: string; url?: string; description?: string };
export const InlineCitationSource = ({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn("space-y-2", className)} {...props}>
    {title && (
      <h4 className="text-[13px] font-medium leading-snug">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm underline decoration-border underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-ring"
          >
            {title}
          </a>
        ) : (
          title
        )}
      </h4>
    )}
    {url && <p className="break-all text-[12px] text-muted-foreground">{url}</p>}
    {description && <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
    {children}
  </div>
);
export type InlineCitationQuoteProps = ComponentProps<"blockquote">;
export const InlineCitationQuote = ({ className, ...props }: InlineCitationQuoteProps) => (
  <blockquote
    className={cn("border-l-2 border-border pl-3 text-[12px] leading-relaxed text-muted-foreground", className)}
    {...props}
  />
);

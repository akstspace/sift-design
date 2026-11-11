import { Alert, AlertDescription } from "@sift-design/ui/alert";
import { Button } from "@sift-design/ui/button";
import { cn } from "cn";
import type { ToolUIPart } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, leave, spring } from "../../../../tokens/motion";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToolUIPartApproval = { id: string; approved?: boolean; reason?: string } | undefined;
type ConfirmationContextValue = { approval: ToolUIPartApproval; state: ToolUIPart["state"] };
const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);
const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("Confirmation components must be used within Confirmation");
  return context;
};

export type ConfirmationProps = ComponentProps<typeof Alert> & {
  approval?: ToolUIPartApproval;
  state: ToolUIPart["state"];
};

export const Confirmation = ({ className, approval, state, children, ...props }: ConfirmationProps) => {
  const contextValue = useMemo(() => ({ approval, state }), [approval, state]);
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const visible = !!approval && state !== "input-streaming" && state !== "input-available";
  const phase = state === "approval-requested" ? "request" : approval?.approved ? "accepted" : "rejected";
  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [phase, visible]);
  if (!visible) return null;
  return (
    <Alert
      data-slot="confirmation"
      data-state={phase}
      role="status"
      aria-live="polite"
      className={cn("block rounded-lg border bg-card p-4 text-[13px] text-foreground", className)}
      {...props}
    >
      <motion.div
        className="relative"
        animate={{ height: height ?? "auto" }}
        transition={reduced ? { duration: 0 } : spring.smooth}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={phase}
            ref={content}
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none", transition: { duration: duration.instant, ease: leave } }}
            transition={{ duration: duration.quick, ease: "linear" }}
          >
            <ConfirmationContext.Provider value={contextValue}>{children}</ConfirmationContext.Provider>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Alert>
  );
};

export type ConfirmationTitleProps = ComponentProps<typeof AlertDescription>;
export const ConfirmationTitle = ({ className, ...props }: ConfirmationTitleProps) => (
  <AlertDescription
    data-slot="confirmation-title"
    className={cn("block text-[13px] leading-relaxed text-foreground", className)}
    {...props}
  />
);

export type ConfirmationRequestProps = { children?: ReactNode };
export const ConfirmationRequest = ({ children }: ConfirmationRequestProps) => {
  const { state } = useConfirmation();
  return state === "approval-requested" ? children : null;
};

const isResponse = (state: ToolUIPart["state"]) =>
  state === "approval-responded" || state === "output-denied" || state === "output-available";

export type ConfirmationAcceptedProps = { children?: ReactNode };
export const ConfirmationAccepted = ({ children }: ConfirmationAcceptedProps) => {
  const { approval, state } = useConfirmation();
  return approval?.approved && isResponse(state) ? children : null;
};

export type ConfirmationRejectedProps = { children?: ReactNode };
export const ConfirmationRejected = ({ children }: ConfirmationRejectedProps) => {
  const { approval, state } = useConfirmation();
  return approval?.approved === false && isResponse(state) ? children : null;
};

export type ConfirmationActionsProps = ComponentProps<"div">;
export const ConfirmationActions = ({ className, ...props }: ConfirmationActionsProps) => {
  const { state } = useConfirmation();
  return state === "approval-requested" ? (
    <div
      data-slot="confirmation-actions"
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
      {...props}
    />
  ) : null;
};

export type ConfirmationActionProps = ComponentProps<typeof Button>;
export const ConfirmationAction = ({ className, ...props }: ConfirmationActionProps) => (
  <Button className={cn("h-8 px-3 text-[13px]", className)} type="button" {...props} />
);

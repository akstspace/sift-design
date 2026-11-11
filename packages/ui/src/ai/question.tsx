import type { ChangeEvent, ComponentProps, FormEvent, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { Button } from "@sift-design/ui/button";
import { Textarea } from "@sift-design/ui/textarea";
import { cn } from "cn";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { duration, leave, selectionSpring, spring } from "../../../../tokens/motion";
import { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

export interface QuestionValue {
  selectedValues: readonly string[];
  text: string;
}
export interface QuestionResponse {
  selectedValues: readonly string[];
  text?: string;
}
type SelectionMode = "multiple" | "single";
interface QuestionContextValue {
  disabled: boolean;
  pending: boolean;
  selectedValues: readonly string[];
  selectionMode: SelectionMode;
  setText: (text: string) => void;
  text: string;
  toggleValue: (value: string) => void;
  promptId: string;
}
const QuestionContext = createContext<QuestionContextValue | null>(null);
const useQuestion = () => {
  const context = useContext(QuestionContext);
  if (!context) throw new Error("Question components must be used within Question");
  return context;
};

export type QuestionProps = Omit<ComponentProps<"form">, "defaultValue" | "onSubmit" | "value"> & {
  defaultValue?: QuestionValue;
  disabled?: boolean;
  onSubmit?: (response: QuestionResponse, event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onValueChange?: (value: QuestionValue) => void;
  selectionMode?: SelectionMode;
  value?: QuestionValue;
  /** Control the answer summary, or let the form show it after a successful submission. */
  submitted?: boolean;
  onSubmittedChange?: (submitted: boolean) => void;
  summary?: ReactNode | ((response: QuestionResponse) => ReactNode);
};
const EMPTY_VALUE: QuestionValue = { selectedValues: [], text: "" };
const getSelectedValues = (current: readonly string[], option: string, mode: SelectionMode): readonly string[] => {
  if (mode === "single") return current.includes(option) ? [] : [option];
  return current.includes(option) ? current.filter((item) => item !== option) : [...current, option];
};

export const Question = ({
  children,
  className,
  defaultValue = EMPTY_VALUE,
  disabled = false,
  onSubmit,
  onValueChange,
  selectionMode = "single",
  value: controlledValue,
  submitted: controlledSubmitted,
  onSubmittedChange,
  summary,
  ...props
}: QuestionProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const submitted = controlledSubmitted ?? internalSubmitted;
  const value = controlledValue ?? internalValue;
  const promptId = useId();
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [submitted]);
  const setSubmitted = (next: boolean) => {
    if (controlledSubmitted === undefined) setInternalSubmitted(next);
    onSubmittedChange?.(next);
  };
  const setValue = useCallback(
    (next: QuestionValue) => {
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );
  const setText = useCallback((text: string) => setValue({ ...value, text }), [setValue, value]);
  const toggleValue = useCallback(
    (option: string) => {
      setValue({ ...value, selectedValues: getSelectedValues(value.selectedValues, option, selectionMode) });
    },
    [selectionMode, setValue, value],
  );
  const contextValue = useMemo(
    () => ({
      disabled: disabled || pending,
      pending,
      selectedValues: value.selectedValues,
      selectionMode,
      setText,
      text: value.text,
      toggleValue,
      promptId,
    }),
    [disabled, pending, selectionMode, setText, toggleValue, value, promptId],
  );
  const response: QuestionResponse = { selectedValues: value.selectedValues, text: value.text.trim() || undefined };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || submitting.current || submitted || (!response.selectedValues.length && !response.text)) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onSubmit?.(response, event);
      const hadFocus = form.current?.contains(document.activeElement);
      setSubmitted(true);
      if (hadFocus) requestAnimationFrame(() => editButton.current?.focus());
    } catch {
      setError("The answer could not be submitted. Try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };
  return (
    <QuestionContext.Provider value={contextValue}>
      <form
        ref={form}
        data-slot="question"
        data-state={submitted ? "submitted" : "open"}
        className={cn("rounded-lg border bg-card p-4 text-[13px]", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        <motion.div
          className="relative"
          animate={{ height: height ?? "auto" }}
          transition={reduced ? { duration: 0 } : submitted ? spring.exit : spring.smooth}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={submitted ? "summary" : "options"}
              ref={content}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none", transition: { duration: duration.instant, ease: leave } }}
              transition={{ duration: duration.quick, ease: "linear" }}
            >
              {submitted ? (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div role="status" className="min-w-0 flex-1 space-y-1">
                    <p className="text-[12px] text-muted-foreground">Answer submitted</p>
                    <div className="break-words font-medium">
                      {typeof summary === "function"
                        ? summary(response)
                        : (summary ?? [...response.selectedValues, response.text].filter(Boolean).join(" · "))}
                    </div>
                  </div>
                  <Button
                    ref={editButton}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => {
                      setSubmitted(false);
                      requestAnimationFrame(() =>
                        form.current
                          ?.querySelector<HTMLButtonElement>("[data-slot=question-option]:not(:disabled)")
                          ?.focus(),
                      );
                    }}
                  >
                    Change answer
                  </Button>
                </div>
              ) : (
                <>
                  {children}
                  {error && (
                    <p role="alert" className="text-destructive">
                      {error}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </form>
    </QuestionContext.Provider>
  );
};

export type QuestionPromptProps = HTMLAttributes<HTMLParagraphElement>;
export const QuestionPrompt = ({ className, ...props }: QuestionPromptProps) => {
  const { promptId } = useQuestion();
  return (
    <p
      id={promptId}
      data-slot="question-prompt"
      className={cn("font-medium text-[14px] text-foreground", className)}
      {...props}
    />
  );
};
export type QuestionDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export const QuestionDescription = ({ className, ...props }: QuestionDescriptionProps) => (
  <p
    data-slot="question-description"
    className={cn("text-[13px] leading-relaxed text-muted-foreground", className)}
    {...props}
  />
);

export type QuestionOptionsProps = HTMLAttributes<HTMLDivElement>;
export const QuestionOptions = ({ className, onKeyDown, ...props }: QuestionOptionsProps) => {
  const { selectionMode, selectedValues, promptId, disabled } = useQuestion();
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (selectionMode !== "single") return;
    const radios = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? []);
    const active = radios.find((radio) => radio.getAttribute("aria-checked") === "true") ?? radios[0];
    radios.forEach((radio) => {
      radio.tabIndex = radio === active ? 0 : -1;
    });
  }, [selectionMode, selectedValues, disabled]);
  return (
    <LayoutGroup id={id}>
      <div
        ref={ref}
        data-slot="question-options"
        // One stacking context for the group, so the traveling highlight passes under every label.
        className={cn("isolate flex flex-wrap gap-2", className)}
        role={selectionMode === "single" ? "radiogroup" : "group"}
        aria-labelledby={promptId}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            selectionMode !== "single" ||
            !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)
          )
            return;
          const radios = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
          );
          if (!radios.length) return;
          const current = radios.indexOf(document.activeElement as HTMLButtonElement);
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? radios.length - 1
                : (current + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + radios.length) %
                  radios.length;
          event.preventDefault();
          radios[next].focus();
          if (radios[next].getAttribute("aria-checked") !== "true") radios[next].click();
        }}
        {...props}
      />
    </LayoutGroup>
  );
};

export type QuestionOptionProps = Omit<ComponentProps<typeof Button>, "value"> & { value: string };
export const QuestionOption = ({
  children,
  className,
  disabled,
  onClick,
  value,
  variant,
  ...props
}: QuestionOptionProps) => {
  const question = useQuestion();
  const reduced = useReducedMotion();
  const selected = question.selectedValues.includes(value);
  const multiple = question.selectionMode === "multiple";
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) question.toggleValue(value);
  };
  return (
    <Button
      data-slot="question-option"
      data-state={selected ? "checked" : "unchecked"}
      aria-checked={selected}
      role={multiple ? "checkbox" : "radio"}
      className={cn(
        "relative h-auto min-h-8 whitespace-normal rounded-full border px-3.5 py-1.5 text-[13px]",
        className,
      )}
      disabled={question.disabled || disabled}
      onClick={handleClick}
      type="button"
      variant={variant ?? "plain"}
      {...props}
    >
      {(selected || multiple) && (
        <motion.span
          aria-hidden="true"
          data-slot="question-highlight"
          className="pointer-events-none absolute inset-0 -z-10 bg-accent-soft"
          // An inline radius lets the shared layout animation keep the pill shape while it travels.
          style={{ borderRadius: 9999 }}
          layoutId={multiple || reduced ? undefined : "question-selection"}
          initial={false}
          animate={{ opacity: selected ? 1 : 0 }}
          transition={
            multiple || reduced ? { duration: selected ? duration.quick : duration.instant } : selectionSpring
          }
        />
      )}
      <span className="relative">{children ?? value}</span>
    </Button>
  );
};

export type QuestionInputProps = Omit<ComponentProps<typeof Textarea>, "defaultValue" | "value">;
export const QuestionInput = ({ className, disabled, onChange, ...props }: QuestionInputProps) => {
  const question = useQuestion();
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    question.setText(event.currentTarget.value);
    onChange?.(event);
  };
  return (
    <Textarea
      data-slot="question-input"
      className={cn("min-h-20 text-[13px]", className)}
      disabled={question.disabled || disabled}
      onChange={handleChange}
      value={question.text}
      {...props}
    />
  );
};
export type QuestionActionsProps = HTMLAttributes<HTMLDivElement>;
export const QuestionActions = ({ className, ...props }: QuestionActionsProps) => (
  <div data-slot="question-actions" className={cn("flex items-center justify-end gap-2", className)} {...props} />
);
export type QuestionSubmitProps = ComponentProps<typeof Button> & { children?: ReactNode };
export const QuestionSubmit = ({ children = "Submit", disabled, ...props }: QuestionSubmitProps) => {
  const question = useQuestion();
  const hasResponse = question.selectedValues.length > 0 || question.text.trim().length > 0;
  return (
    <Button
      loading={question.pending}
      disabled={question.disabled || disabled || !hasResponse}
      type="submit"
      {...props}
    >
      {children}
    </Button>
  );
};

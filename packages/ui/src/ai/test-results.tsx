import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { cn } from "cn";
import { IconCircleCheck, IconChevronRight, IconCircleDot, IconCircle, IconCircleX } from "@tabler/icons-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { createContext, useContext, useMemo } from "react";

type TestStatus = "passed" | "failed" | "skipped" | "running";

interface TestResultsSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration?: number;
}

interface TestResultsContextType {
  summary?: TestResultsSummary;
}

const TestResultsContext = createContext<TestResultsContextType>({});

const formatDuration = (ms: number) => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

export type TestResultsHeaderProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsHeader = ({ className, children, ...props }: TestResultsHeaderProps) => (
  <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3", className)} {...props}>
    {children}
  </div>
);

export type TestResultsDurationProps = HTMLAttributes<HTMLSpanElement>;

export const TestResultsDuration = ({ className, children, ...props }: TestResultsDurationProps) => {
  const { summary } = useContext(TestResultsContext);

  if (summary?.duration === undefined) {
    return null;
  }

  return (
    <span className={cn("font-mono text-muted-foreground text-[12px]", className)} {...props}>
      {children ?? formatDuration(summary.duration)}
    </span>
  );
};

export type TestResultsSummaryProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsSummary = ({ className, children, ...props }: TestResultsSummaryProps) => {
  const { summary } = useContext(TestResultsContext);

  if (!summary) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)} {...props}>
      {children ?? (
        <>
          {(["passed", "failed", "skipped"] as const).map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5 font-mono text-[12px] text-foreground">
              <TestStatusIcon status={status} />
              {summary[status]} {status}
            </span>
          ))}
        </>
      )}
    </div>
  );
};

export type TestResultsProps = HTMLAttributes<HTMLDivElement> & {
  summary?: TestResultsSummary;
};

export const TestResults = ({ summary, className, children, ...props }: TestResultsProps) => {
  const contextValue = useMemo(() => ({ summary }), [summary]);

  return (
    <TestResultsContext.Provider value={contextValue}>
      <div className={cn("ai-test-results min-w-0 overflow-hidden rounded-lg border bg-card", className)} {...props}>
        {children ??
          (summary && (
            <TestResultsHeader>
              <TestResultsSummary />
              <TestResultsDuration />
            </TestResultsHeader>
          ))}
      </div>
    </TestResultsContext.Provider>
  );
};

export type TestResultsProgressProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsProgress = ({ className, children, ...props }: TestResultsProgressProps) => {
  const { summary } = useContext(TestResultsContext);

  if (!summary) {
    return null;
  }

  const total = Math.max(0, summary.total);
  const completed = Math.min(total, Math.max(0, summary.passed + summary.failed + summary.skipped));
  const passedPercent = total > 0 ? Math.min(100, Math.max(0, (summary.passed / total) * 100)) : 0;
  const pending = Math.max(0, total - completed);
  // One bar, one segment per outcome, so a failure is never hidden inside a full green bar.
  const segments = [
    { key: "passed", count: summary.passed, className: "bg-good" },
    { key: "failed", count: summary.failed, className: "bg-danger" },
    { key: "skipped", count: summary.skipped, className: "bg-input" },
  ];
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children ?? (
        <>
          <div
            role="img"
            aria-label={`${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped, ${pending} not run, of ${total} tests`}
            data-slot="test-results-bar"
            className="flex h-1.5 overflow-hidden rounded-full bg-subtle"
          >
            {segments.map((segment) => (
              <span
                key={segment.key}
                data-empty={segment.count === 0 || undefined}
                className={cn("test-results-segment h-full rounded-full", segment.className)}
                style={{ flexGrow: segment.count, flexBasis: 0 }}
              />
            ))}
            <span className="test-results-segment h-full" style={{ flexGrow: pending, flexBasis: 0 }} />
          </div>
          <div className="flex flex-wrap justify-between gap-2 font-mono text-[12px] text-muted-foreground tabular-nums">
            <span>
              {completed}/{total} completed
            </span>
            <span>{passedPercent.toFixed(0)}% passed</span>
          </div>
        </>
      )}
    </div>
  );
};

export type TestResultsContentProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsContent = ({ className, children, ...props }: TestResultsContentProps) => (
  <div className={cn("space-y-2 p-4", className)} {...props}>
    {children}
  </div>
);

interface TestSuiteContextType {
  name: string;
  status: TestStatus;
}

const TestSuiteContext = createContext<TestSuiteContextType>({
  name: "",
  status: "passed",
});

const statusStyles: Record<TestStatus, string> = {
  failed: "text-danger",
  passed: "text-good",
  running: "text-foreground",
  skipped: "text-muted-foreground",
};

const statusIcons: Record<TestStatus, React.ReactNode> = {
  failed: <IconCircleX aria-hidden="true" className="size-4" />,
  passed: <IconCircleCheck aria-hidden="true" className="size-4" />,
  running: <IconCircleDot aria-hidden="true" className="size-4" />,
  skipped: <IconCircle aria-hidden="true" className="size-4" />,
};

const TestStatusIcon = ({ status }: { status: TestStatus }) => (
  <span className={cn("shrink-0", statusStyles[status])}>{statusIcons[status]}</span>
);

export type TestSuiteProps = ComponentProps<typeof Collapsible> & {
  name: string;
  status: TestStatus;
};

export const TestSuite = ({ name, status, className, children, ...props }: TestSuiteProps) => {
  const contextValue = useMemo(() => ({ name, status }), [name, status]);

  return (
    <TestSuiteContext.Provider value={contextValue}>
      <Collapsible className={cn("border-b last:border-b-0", className)} {...props}>
        {children}
      </Collapsible>
    </TestSuiteContext.Provider>
  );
};

export type TestSuiteNameProps = ComponentProps<typeof CollapsibleTrigger>;

export const TestSuiteName = ({ className, children, ...props }: TestSuiteNameProps) => {
  const { name, status } = useContext(TestSuiteContext);

  return (
    <CollapsibleTrigger
      className={cn(
        "group flex w-full items-center gap-2 rounded-sm px-1 py-3 text-left hover:bg-tint focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    >
      <IconChevronRight
        aria-hidden="true"
        className="ai-terminal-chevron size-4 shrink-0 text-muted-foreground group-data-[state=open]:rotate-90"
      />
      <TestStatusIcon status={status} />
      <span className="min-w-0 flex-1 break-all font-mono text-[12px] font-medium">{children ?? name}</span>
      <span className="text-[12px] text-muted-foreground">{status}</span>
    </CollapsibleTrigger>
  );
};

export type TestSuiteStatsProps = HTMLAttributes<HTMLDivElement> & {
  passed?: number;
  failed?: number;
  skipped?: number;
};

export const TestSuiteStats = ({
  passed = 0,
  failed = 0,
  skipped = 0,
  className,
  children,
  ...props
}: TestSuiteStatsProps) => (
  <div className={cn("ml-auto flex flex-wrap items-center gap-2 font-mono text-[12px]", className)} {...props}>
    {children ?? (
      <>
        {passed > 0 && <span className="text-good">{passed} passed</span>}
        {failed > 0 && <span className="text-danger">{failed} failed</span>}
        {skipped > 0 && <span className="text-muted-foreground">{skipped} skipped</span>}
      </>
    )}
  </div>
);

export type TestSuiteContentProps = ComponentProps<typeof CollapsibleContent>;

export const TestSuiteContent = ({ className, children, ...props }: TestSuiteContentProps) => (
  <CollapsibleContent className={cn("border-t", className)} {...props}>
    <div className="divide-y">{children}</div>
  </CollapsibleContent>
);

interface TestContextType {
  name: string;
  status: TestStatus;
  duration?: number;
}

const TestContext = createContext<TestContextType>({
  name: "",
  status: "passed",
});

export type TestNameProps = HTMLAttributes<HTMLSpanElement>;

export const TestName = ({ className, children, ...props }: TestNameProps) => {
  const { name } = useContext(TestContext);

  return (
    <span className={cn("min-w-0 flex-1 break-words", className)} {...props}>
      {children ?? name}
    </span>
  );
};

export type TestDurationProps = HTMLAttributes<HTMLSpanElement>;

export const TestDuration = ({ className, children, ...props }: TestDurationProps) => {
  const { duration } = useContext(TestContext);

  if (duration === undefined) {
    return null;
  }

  return (
    <span className={cn("ml-auto shrink-0 font-mono text-muted-foreground text-[12px]", className)} {...props}>
      {children ?? `${duration}ms`}
    </span>
  );
};

export type TestStatusProps = HTMLAttributes<HTMLSpanElement>;

export const TestStatus = ({ className, children, ...props }: TestStatusProps) => {
  const { status } = useContext(TestContext);

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5", statusStyles[status], className)} {...props}>
      {children ?? (
        <>
          {statusIcons[status]}
          <span className="text-[12px] text-muted-foreground">{status}</span>
        </>
      )}
    </span>
  );
};

export type TestProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  status: TestStatus;
  duration?: number;
};

export const Test = ({ name, status, duration, className, children, ...props }: TestProps) => {
  const contextValue = useMemo(() => ({ duration, name, status }), [duration, name, status]);

  return (
    <TestContext.Provider value={contextValue}>
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 px-1 py-3 text-[13px]", className)} {...props}>
        {children ?? (
          <>
            <TestStatus />
            <TestName />
            {duration !== undefined && <TestDuration />}
          </>
        )}
      </div>
    </TestContext.Provider>
  );
};

export type TestErrorProps = HTMLAttributes<HTMLDivElement>;

export const TestError = ({ className, children, ...props }: TestErrorProps) => (
  <div className={cn("mt-2 border-l-2 border-danger bg-tint p-3", className)} {...props}>
    {children}
  </div>
);

export type TestErrorMessageProps = HTMLAttributes<HTMLParagraphElement>;

export const TestErrorMessage = ({ className, children, ...props }: TestErrorMessageProps) => (
  <p className={cn("break-words text-[13px] font-medium text-foreground", className)} {...props}>
    {children}
  </p>
);

export type TestErrorStackProps = HTMLAttributes<HTMLPreElement>;

export const TestErrorStack = ({ className, children, ...props }: TestErrorStackProps) => (
  <pre
    className={cn(
      "mt-2 overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] text-muted-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </pre>
);

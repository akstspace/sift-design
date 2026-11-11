import { useEffect, useState } from "react";
import { IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import {
  Terminal,
  TerminalActions,
  TerminalClearButton,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
} from "@sift-design/ui/ai/terminal";
import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceExpandButton,
  StackTraceFrames,
  StackTraceHeader,
} from "@sift-design/ui/ai/stack-trace";
import {
  Test,
  TestDuration,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  TestName,
  TestResults,
  TestResultsContent,
  TestResultsDuration,
  TestResultsHeader,
  TestResultsProgress,
  TestResultsSummary,
  TestStatus,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
  TestSuiteStats,
} from "@sift-design/ui/ai/test-results";
import { SpecimenItem } from "../../frame";

const trace = `TypeError: Cannot read properties of undefined (reading 'moisture')
    at needsWater (larkspur/src/irrigation/needs-water.ts:18:24)
    at planWatering (larkspur/src/irrigation/plan.ts:42:12)
    at testMissingSensor (larkspur/tests/irrigation.test.ts:67:9)
    at runTest (larkspur/node_modules/test-runner/runner.js:204:16)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`;
const lines = [
  "\u001b[2m$ npm test\u001b[0m\n",
  "\n> larkspur@0.8.2 test\n> test-runner run\n\n",
  "\u001b[1m RUN \u001b[0m larkspur / Fernbrook Greenhouse\n\n",
  "\u001b[32mPASS\u001b[0m tests/seedlings.test.ts  \u001b[2m3 tests · 124ms\u001b[0m\n",
  "\u001b[31mFAIL\u001b[0m tests/irrigation.test.ts  \u001b[2m3 tests · 186ms\u001b[0m\n",
  "  \u001b[32m✓\u001b[0m waters dry seedling trays\n",
  "  \u001b[32m✓\u001b[0m keeps wet trays unchanged\n",
  "  \u001b[31m×\u001b[0m handles a missing sensor\n",
  "\u001b[33mSKIP\u001b[0m tests/forecast.test.ts  \u001b[2m1 test\u001b[0m\n\n",
  "\u001b[31mTypeError: Cannot read properties of undefined (reading 'moisture')\u001b[0m\n",
  "  at needsWater (src/irrigation/needs-water.ts:18:24)\n\n",
  "Tests  \u001b[32m5 passed\u001b[0m · \u001b[31m1 failed\u001b[0m · \u001b[33m1 skipped\u001b[0m\n",
  "Time   310ms\n\u001b[2mProcess exited with code 1\u001b[0m\n",
];
const summary = { passed: 5, failed: 1, skipped: 1, total: 7, duration: 310 };

function TerminalDemo() {
  const [count, setCount] = useState(lines.length);
  const [streaming, setStreaming] = useState(false);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (!streaming) return;
    const timer = window.setInterval(() => setCount((value) => Math.min(value + 1, lines.length)), 220);
    return () => window.clearInterval(timer);
  }, [streaming]);
  useEffect(() => {
    if (count === lines.length) setStreaming(false);
  }, [count]);
  const replay = () => {
    setCount(0);
    setStreaming(true);
    setFeedback("");
  };
  const clear = () => {
    setStreaming(false);
    setCount(0);
    setFeedback("Output cleared. Replay the run to show output.");
  };
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          Irrigation checks{" "}
          <span className="mx-1" aria-hidden="true">
            /
          </span>{" "}
          <span className="font-mono text-[12px]">larkspur</span>
        </p>
        <Button variant="outline" size="sm" onClick={replay}>
          <IconPlayerPlay aria-hidden="true" size={14} />
          Replay test run
        </Button>
      </div>
      <Terminal output={lines.slice(0, count).join("")} isStreaming={streaming} onClear={clear}>
        <TerminalHeader>
          <TerminalTitle>
            <span className="font-mono text-[12px]">npm test</span>
          </TerminalTitle>
          <div className="flex items-center gap-2">
            <TerminalStatus />
            {!streaming && (
              <span className="text-[12px] text-muted-foreground">{count ? "Exited · code 1" : "Ready"}</span>
            )}
            <TerminalActions>
              <TerminalCopyButton
                onCopy={() => setFeedback("Terminal output copied.")}
                onError={() => setFeedback("Could not copy output. Select the text to copy it.")}
              />
              <TerminalClearButton />
            </TerminalActions>
          </div>
        </TerminalHeader>
        <TerminalContent className="h-[340px]">
          {!count && !streaming ? (
            <p className="text-muted-foreground">No output. Replay the test run to begin.</p>
          ) : undefined}
        </TerminalContent>
      </Terminal>
      <p role="status" className="min-h-5 text-[12px] text-muted-foreground">
        {feedback ||
          (streaming
            ? "Receiving test output."
            : count
              ? "One test failed. Review the stack trace and test results below."
              : "No test run is active.")}
      </p>
    </div>
  );
}

function StackDemo() {
  const [internal, setInternal] = useState(true);
  const [feedback, setFeedback] = useState("Select a source path to inspect its location.");
  return (
    <div className="w-full min-w-0 space-y-3">
      <label className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
        <input
          type="checkbox"
          checked={internal}
          onChange={(event) => setInternal(event.target.checked)}
          className="size-4 accent-primary"
        />
        Show internal frames
      </label>
      <StackTrace
        trace={trace}
        defaultOpen
        onFilePathClick={(path, line, column) => setFeedback(`Selected ${path}, line ${line}, column ${column}.`)}
      >
        <StackTraceHeader>
          <StackTraceError>
            <StackTraceErrorType />
            <StackTraceErrorMessage />
          </StackTraceError>
          <StackTraceActions>
            <StackTraceCopyButton
              onCopy={() => setFeedback("Stack trace copied.")}
              onError={() => setFeedback("Could not copy the stack trace. Select the text to copy it.")}
            />
          </StackTraceActions>
          <StackTraceExpandButton />
        </StackTraceHeader>
        <StackTraceContent>
          <StackTraceFrames showInternalFrames={internal} />
        </StackTraceContent>
      </StackTrace>
      <p role="status" className="break-words text-[12px] text-muted-foreground">
        {feedback}
      </p>
    </div>
  );
}

function TestDemo() {
  const [reset, setReset] = useState(0);
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">Missing sensor coverage</p>
        <Button size="sm" variant="ghost" onClick={() => setReset((value) => value + 1)}>
          <IconRefresh aria-hidden="true" size={14} />
          Reset details
        </Button>
      </div>
      <TestResults summary={summary} key={reset}>
        <TestResultsHeader>
          <TestResultsSummary />
          <TestResultsDuration />
        </TestResultsHeader>
        <TestResultsContent>
          <TestResultsProgress className="mb-4" />
          <TestSuite name="tests/irrigation.test.ts" status="failed" defaultOpen>
            <TestSuiteName />
            <TestSuiteStats passed={2} failed={1} className="px-1 pb-2" />
            <TestSuiteContent>
              <Test name="waters dry seedling trays" status="passed" duration={42} />
              <Test name="keeps wet trays unchanged" status="passed" duration={31} />
              <Test name="handles a missing sensor" status="failed" duration={113}>
                <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
                  <TestStatus />
                  <TestName />
                  <TestDuration />
                </div>
                <Collapsible className="w-full">
                  <CollapsibleTrigger className="rounded-sm text-[12px] font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
                    Error details
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <TestError>
                      <TestErrorMessage>Cannot read properties of undefined (reading 'moisture')</TestErrorMessage>
                      <TestErrorStack>{`18 | return sensor.moisture < threshold;\n                   ^\nExpected: no watering when a sensor is missing\nReceived: TypeError\n\nat needsWater (src/irrigation/needs-water.ts:18:24)`}</TestErrorStack>
                    </TestError>
                  </CollapsibleContent>
                </Collapsible>
              </Test>
            </TestSuiteContent>
          </TestSuite>
          <TestSuite name="tests/seedlings.test.ts" status="passed">
            <TestSuiteName />
            <TestSuiteContent>
              <Test name="assigns trays to a greenhouse" status="passed" duration={48} />
              <Test name="keeps propagation dates" status="passed" duration={35} />
              <Test name="labels lavender plugs" status="passed" duration={41} />
            </TestSuiteContent>
          </TestSuite>
          <TestSuite name="tests/forecast.test.ts" status="skipped">
            <TestSuiteName />
            <TestSuiteContent>
              <Test name="uses the forecast when available" status="skipped" />
              <p className="px-1 pb-3 text-[12px] text-muted-foreground">
                Skipped because this fixture has no forecast data.
              </p>
            </TestSuiteContent>
          </TestSuite>
        </TestResultsContent>
      </TestResults>
    </div>
  );
}

export default function TerminalExamples() {
  return (
    <>
      <SpecimenItem
        name="Terminal"
        note="Read command output as it arrives. Replay streams one run; clear stops it and removes the output."
        wide
      >
        <TerminalDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Stack trace"
        note="Inspect the source of an error. Frame details open and close with the shared disclosure spring."
        wide
      >
        <StackDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Test results"
        note="Review test outcomes and durations. Expand a suite or the failed test to inspect its error."
        wide
      >
        <TestDemo />
      </SpecimenItem>
    </>
  );
}

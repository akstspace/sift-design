import { useEffect, useRef, useState } from "react";
import type { ToolUIPart } from "ai";
import { IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockTitle,
  CodeBlockLanguageSelector,
  CodeBlockLanguageSelectorTrigger,
  CodeBlockLanguageSelectorValue,
  CodeBlockLanguageSelectorContent,
  CodeBlockLanguageSelectorItem,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
} from "@sift-design/ui/ai/code-block";
import { Snippet, SnippetAddon, SnippetCopyButton, SnippetInput, SnippetText } from "@sift-design/ui/ai/snippet";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@sift-design/ui/ai/tool";
import { SpecimenItem } from "../../frame";

const parameters = { area: "propagation-house", bench: 4, include: ["temperature", "humidity"] };
const readings = {
  bench: 4,
  temperature_c: 24.6,
  humidity_percent: 72,
  observed_at: "2026-11-10T14:10:00Z",
  status: "within_range",
};
const example = `type Reading = {
  bench: number;
  temperature_c: number;
  humidity_percent: number;
};

export function BenchReading({ reading }: { reading: Reading }) {
  return (
    <section aria-label={\`Bench \${reading.bench}\`}>
      <p>Temperature: {reading.temperature_c} °C</p>
      <p>Humidity: {reading.humidity_percent}%</p>
    </section>
  );
}`;
const stateNotes: Record<ToolUIPart["state"], string> = {
  "input-streaming": "Climate watch is preparing a request for bench 4.",
  "approval-requested": "Approve this read-only check of the propagation house sensor hub.",
  "approval-responded": "You approved the sensor check. Climate watch will read the latest values.",
  "input-available": "Climate watch is reading the propagation house sensor hub.",
  "output-available": "The sensor hub reports that bench 4 is within the expected range.",
  "output-error": "The sensor hub did not respond. Check its connection before you retry.",
  "output-denied": "You denied this sensor check. Climate watch did not read the sensor hub.",
};

function SensorTool() {
  const [state, setState] = useState<ToolUIPart["state"]>("output-available");
  const [open, setOpen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function replay() {
    clearTimeout(timer.current);
    setOpen(true);
    setState("input-streaming");
    timer.current = setTimeout(() => setState("approval-requested"), 800);
  }
  function approve() {
    clearTimeout(timer.current);
    setState("approval-responded");
    timer.current = setTimeout(() => {
      setState("input-available");
      timer.current = setTimeout(() => setState("output-available"), 1300);
    }, 700);
  }
  const active = state === "input-streaming" || state === "input-available" || state === "approval-responded";
  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-medium">Propagation house · bench 4</p>
          <p className="text-[12px] text-muted-foreground">Read-only sensor check</p>
        </div>
        <Button variant="outline" size="sm" onClick={replay}>
          <IconRefresh aria-hidden="true" size={14} />
          Replay sensor check
        </Button>
      </div>
      <Tool open={open} onOpenChange={setOpen}>
        <ToolHeader type="dynamic-tool" toolName="check_sensor_hub" state={state} />
        <ToolContent>
          <ToolInput input={state === "input-streaming" ? { area: "propagation-house" } : parameters} />
          {state === "output-available" && <ToolOutput output={readings} errorText={undefined} />}
          {state === "output-error" && (
            <ToolOutput
              output={undefined}
              errorText="The sensor hub did not respond. Check its connection and retry."
            />
          )}
          {state === "output-denied" && (
            <p className="border-t px-4 py-3 text-[13px] text-muted-foreground">No readings were requested.</p>
          )}
          {(active || state === "approval-requested") && (
            <p className="border-t px-4 py-3 text-[13px] text-muted-foreground">
              {state === "approval-requested"
                ? "This check reads temperature and humidity. It does not change sensor settings."
                : "No readings are available yet."}
            </p>
          )}
        </ToolContent>
      </Tool>
      <div aria-live="polite" className="text-[13px] text-muted-foreground">
        {stateNotes[state]}
      </div>
      {state === "approval-requested" && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={approve}>
            <IconPlayerPlay aria-hidden="true" size={14} />
            Approve sensor check
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              clearTimeout(timer.current);
              setState("output-denied");
            }}
          >
            Deny sensor check
          </Button>
        </div>
      )}
      <div className="grid min-w-0 gap-3 pt-2 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <p className="text-[12px] text-muted-foreground">Connection failure</p>
          <Tool defaultOpen>
            <ToolHeader type="tool-check_sensor_hub" state="output-error" title="Sensor hub" />
            <ToolContent>
              <ToolOutput output={undefined} errorText="No response after 5 seconds. Check the hub connection." />
              <div className="px-4 pb-3">
                <Button size="sm" variant="outline" onClick={replay}>
                  Retry sensor check
                </Button>
              </div>
            </ToolContent>
          </Tool>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-[12px] text-muted-foreground">Permission denied</p>
          <Tool defaultOpen>
            <ToolHeader type="tool-check_sensor_hub" state="output-denied" title="Sensor hub" />
            <ToolContent>
              <p className="px-4 py-3 text-[13px] text-muted-foreground">
                Jane Doe denied this request. No sensor readings were requested.
              </p>
            </ToolContent>
          </Tool>
        </div>
      </div>
    </div>
  );
}

function SensorCode() {
  const [language, setLanguage] = useState<"tsx" | "json">("tsx");
  return (
    <CodeBlock
      code={language === "tsx" ? example : JSON.stringify(readings, null, 2)}
      language={language}
      showLineNumbers
    >
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>{language === "tsx" ? "bench-reading.tsx" : "sensor-reading.json"}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockLanguageSelector value={language} onValueChange={(value) => setLanguage(value as "tsx" | "json")}>
            <CodeBlockLanguageSelectorTrigger>
              <CodeBlockLanguageSelectorValue />
            </CodeBlockLanguageSelectorTrigger>
            <CodeBlockLanguageSelectorContent>
              <CodeBlockLanguageSelectorItem value="tsx">TSX</CodeBlockLanguageSelectorItem>
              <CodeBlockLanguageSelectorItem value="json">JSON</CodeBlockLanguageSelectorItem>
            </CodeBlockLanguageSelectorContent>
          </CodeBlockLanguageSelector>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
}

export default function ToolExamples() {
  return (
    <>
      <SpecimenItem
        name="Tool"
        note="Show tool parameters, approval, and results in one disclosure. Status labels cross-fade as the sensor check progresses."
        wide
      >
        <SensorTool />
      </SpecimenItem>
      <SpecimenItem
        name="Code block"
        note="Present source code with line numbers and a copy action. Token colors follow the active theme."
        wide
      >
        <SensorCode />
      </SpecimenItem>
      <SpecimenItem
        name="Snippet"
        note="Provide a short command that people can select or copy. The copy icon confirms success in place."
        wide
      >
        <div className="w-full min-w-0 space-y-4">
          <div className="space-y-2">
            <p className="text-[12px] text-muted-foreground">Sync bench 4 with the latest sensor readings.</p>
            <Snippet code="npx larkspur sync --bench 4">
              <SnippetAddon>
                <SnippetText aria-hidden="true">$</SnippetText>
              </SnippetAddon>
              <SnippetInput aria-label="Sync bench 4 command" />
              <SnippetAddon align="inline-end">
                <SnippetCopyButton />
              </SnippetAddon>
            </Snippet>
          </div>
          <div className="space-y-2">
            <p className="text-[12px] text-muted-foreground">
              Inspect the propagation house without changing sensor settings.
            </p>
            <Snippet code="npx larkspur sensors inspect --area propagation-house">
              <SnippetAddon>
                <SnippetText aria-hidden="true">$</SnippetText>
              </SnippetAddon>
              <SnippetInput aria-label="Inspect sensor hub command" />
              <SnippetAddon align="inline-end">
                <SnippetCopyButton />
              </SnippetAddon>
            </Snippet>
          </div>
        </div>
      </SpecimenItem>
    </>
  );
}

import {
  Agent,
  AgentContent,
  AgentHeader,
  AgentInstructions,
  AgentOutput,
  AgentTool,
  AgentTools,
} from "@sift-design/ui/ai/agent";
import { CodeBlock } from "@sift-design/ui/ai/code-block";
import { JSXPreview, JSXPreviewContent, JSXPreviewError } from "@sift-design/ui/ai/jsx-preview";
import {
  Sandbox,
  SandboxContent,
  SandboxHeader,
  SandboxTabContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
} from "@sift-design/ui/ai/sandbox";
import { Badge } from "@sift-design/ui/badge";
import { Button } from "@sift-design/ui/button";
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconFileCode,
  IconLeaf,
  IconPlayerPlay,
  IconRefresh,
} from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { jsonSchema } from "ai";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SpecimenItem } from "../../frame";

const inventoryTool = {
  description: "read_inventory",
  inputSchema: jsonSchema({
    type: "object",
    properties: { area: { type: "string", description: "Greenhouse area to count" } },
    required: ["area"],
    additionalProperties: false,
  }),
};
const taskTool = {
  description: "file_task",
  inputSchema: jsonSchema({
    type: "object",
    properties: { title: { type: "string" }, assignee: { type: "string" } },
    required: ["title"],
    additionalProperties: false,
  }),
};
const reportCode = `const stock = await read_inventory({
  area: "Retail benches"
});
const lowStock = stock.filter(item =>
  item.daysRemaining < 7
);
print(lowStock);`;

function SandboxDemo() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(0);
  const [tab, setTab] = useState("output");
  useEffect(() => {
    const first = window.setTimeout(() => setPhase(1), 700);
    const done = window.setTimeout(() => setPhase(2), 1900);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(done);
    };
  }, [run]);
  const running = phase < 2;
  return (
    <div className="w-full min-w-0 space-y-3">
      <Sandbox>
        <SandboxHeader title="bench-report.ts" state={running ? "input-available" : "output-available"} />
        <SandboxContent>
          <SandboxTabs value={tab} onValueChange={setTab}>
            <SandboxTabsBar>
              <SandboxTabsList aria-label="Bench report views">
                <SandboxTabsTrigger value="code">Code</SandboxTabsTrigger>
                <SandboxTabsTrigger value="output">Output</SandboxTabsTrigger>
                <SandboxTabsTrigger value="files">Files</SandboxTabsTrigger>
              </SandboxTabsList>
            </SandboxTabsBar>
            <SandboxTabContent value="code" className="p-4">
              <CodeBlock code={reportCode} language="typescript" />
            </SandboxTabContent>
            <SandboxTabContent value="output" className="p-4">
              <div className="min-h-36 space-y-3 font-mono text-[12px] leading-relaxed">
                <p className="text-muted-foreground">$ run bench-report.ts</p>
                <p>Reading Retail benches inventory…</p>
                {phase >= 1 && (
                  <div className="agent-demo-result space-y-1">
                    <p>9cm pots: 180 left · 4 days</p>
                    <p>Herb trays: 24 left · 6 days</p>
                  </div>
                )}
                {phase === 2 && (
                  <p className="agent-demo-result flex items-center gap-2 text-good">
                    <IconCheck aria-hidden="true" className="size-3.5" />
                    Report ready. No tasks filed.
                  </p>
                )}
              </div>
            </SandboxTabContent>
            <SandboxTabContent value="files" className="p-4">
              <div className="flex min-h-36 items-start justify-between gap-4 text-[13px]">
                <span className="flex items-center gap-2">
                  <IconFileCode aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="font-mono">bench-report.ts</span>
                </span>
                <span className="text-muted-foreground">Read only</span>
              </div>
            </SandboxTabContent>
          </SandboxTabs>
        </SandboxContent>
      </Sandbox>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-[12px] text-muted-foreground">
          {running ? "Running the local example." : "Local example complete. Nothing was saved."}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setPhase(0);
            setTab("output");
            setRun(run + 1);
          }}
        >
          <IconRefresh aria-hidden="true" className="size-3.5" />
          Run again
        </Button>
      </div>
    </div>
  );
}

// These components intentionally ignore all parsed attributes. Only text children are accepted.
function BenchCard({ children }: { children?: ReactNode }) {
  return (
    <article className="w-full space-y-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <IconLeaf aria-hidden="true" className="size-4" />
        Larkspur · Retail benches
      </div>
      {children}
    </article>
  );
}
function BenchTitle({ children }: { children?: ReactNode }) {
  return <h4 className="text-[14px] font-medium">{children}</h4>;
}
function BenchText({ children }: { children?: ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-muted-foreground">{children}</p>;
}
function BenchTag({ children }: { children?: ReactNode }) {
  return <Badge variant="secondary">{children}</Badge>;
}
function BenchAction({ children }: { children?: ReactNode }) {
  return (
    <a
      href="https://larkspur.example/inventory"
      className="inline-flex items-center gap-2 rounded-sm text-[13px] font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <IconArrowRight aria-hidden="true" className="size-3.5" />
    </a>
  );
}
const safeComponents = { BenchCard, BenchTitle, BenchText, BenchTag, BenchAction };
const jsxFrames = [
  "<BenchCard>",
  "<BenchCard>\n  <BenchTag>Stock count</BenchTag>\n  <BenchTi",
  "<BenchCard>\n  <BenchTag>Stock count</BenchTag>\n  <BenchTitle>Restock the herb bench</BenchTitle>",
  "<BenchCard>\n  <BenchTag>Stock count</BenchTag>\n  <BenchTitle>Restock the herb bench</BenchTitle>\n  <BenchText>24 herb trays remain. Prepare the bench before Saturday.</BenchText>\n  <BenchAction",
  "<BenchCard>\n  <BenchTag>Stock count</BenchTag>\n  <BenchTitle>Restock the herb bench</BenchTitle>\n  <BenchText>24 herb trays remain. Prepare the bench before Saturday.</BenchText>\n  <BenchAction>View inventory</BenchAction>\n</BenchCard>",
];
function PreviewDemo() {
  const [frame, setFrame] = useState(jsxFrames.length - 1);
  const [playing, setPlaying] = useState(false);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (frame >= jsxFrames.length - 1) setPlaying(false);
      else setFrame(frame + 1);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [frame, playing, replay]);
  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-[12px] text-muted-foreground">
          {playing ? "Building the preview…" : "Preview complete. Only supplied components render."}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setFrame(0);
            setPlaying(true);
            setReplay(replay + 1);
          }}
        >
          <IconPlayerPlay aria-hidden="true" className="size-3.5" />
          Replay JSX
        </Button>
      </div>
      <JSXPreview
        jsx={jsxFrames[frame]}
        isStreaming={playing}
        components={safeComponents}
        componentsOnly
        allowUnknownElements={false}
      >
        <div className="min-h-64">
          <JSXPreviewContent />
        </div>
        <JSXPreviewError />
      </JSXPreview>
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1.5 rounded-sm py-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          View streamed JSX
          <IconChevronDown aria-hidden="true" className="size-3.5" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pt-2">
            <CodeBlock code={jsxFrames[frame]} language="jsx" />
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="space-y-2 border-t pt-4">
        <p className="text-[12px] font-medium text-muted-foreground">Error example</p>
        <JSXPreview
          jsx="<BenchCard><BenchTitle>Missing closing tag"
          components={safeComponents}
          componentsOnly
          allowUnknownElements={false}
        >
          <JSXPreviewContent />
          <JSXPreviewError>Preview could not render. Close the missing tags, then try again.</JSXPreviewError>
        </JSXPreview>
      </div>
    </div>
  );
}

export default function AgentExamples() {
  return (
    <>
      <SpecimenItem name="Agent" note="Inspect a helper before it runs. Expand a tool to read its input schema.">
        <Agent className="w-full">
          <AgentHeader name="Stock count helper" model="Quarry Swift" />
          <AgentContent>
            <AgentInstructions>
              Read the Retail benches inventory. Flag supplies with fewer than seven days remaining. File a task only
              after Jane Doe approves.
            </AgentInstructions>
            <AgentTools type="single" collapsible>
              <AgentTool value="read_inventory" tool={inventoryTool} />
              <AgentTool value="file_task" tool={taskTool} />
            </AgentTools>
            <AgentOutput schema={`type StockReport = {\n  lowStock: string[];\n  requiresApproval: boolean;\n};`} />
          </AgentContent>
        </Agent>
      </SpecimenItem>
      <SpecimenItem
        name="Sandbox"
        note="Follow a local report from running to completed. Tabs share a moving selection indicator."
      >
        <SandboxDemo />
      </SpecimenItem>
      <SpecimenItem
        name="JSX preview"
        note="Build a card from streamed JSX. Incomplete tags close during streaming; invalid final code shows an error."
      >
        <PreviewDemo />
      </SpecimenItem>
    </>
  );
}

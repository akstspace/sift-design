import { useState } from "react";
import { IconFileCode, IconFileText } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Badge } from "@sift-design/ui/badge";
import {
  FileTree,
  FileTreeActions,
  FileTreeFile,
  FileTreeFolder,
  FileTreeIcon,
  FileTreeName,
} from "@sift-design/ui/ai/file-tree";
import { SchemaDisplay } from "@sift-design/ui/ai/schema-display";
import {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableGroup,
  EnvironmentVariableName,
  EnvironmentVariableRequired,
  EnvironmentVariableValue,
  EnvironmentVariables,
  EnvironmentVariablesContent,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
} from "@sift-design/ui/ai/environment-variables";
import { SpecimenItem } from "../../frame";
import { CodeBlock } from "@sift-design/ui/ai/code-block";

const initialFolders = new Set(["larkspur-app", "larkspur-app/src", "larkspur-app/src/api"]);
const files = {
  "larkspur-app/src/api/tasks.ts": {
    label: "tasks.ts",
    status: "Modified",
    summary: "Create a greenhouse task and assign a grower.",
    lines: [
      "export async function createTask(input: TaskInput) {",
      "  return tasks.create({",
      "    title: input.title,",
      "    benchId: input.benchId,",
      "    assignedTo: input.assignedTo,",
      "    status: 'open',",
      "  });",
      "}",
    ],
  },
  "larkspur-app/src/api/benches.ts": {
    label: "benches.ts",
    status: "Added",
    summary: "Read the latest conditions for a greenhouse bench.",
    lines: [
      "export async function getBench(benchId: string) {",
      "  const bench = await benches.find(benchId);",
      "  return {",
      "    ...bench,",
      "    moisture: await sensors.latest(benchId),",
      "  };",
      "}",
    ],
  },
  "larkspur-app/src/app.tsx": {
    label: "app.tsx",
    status: "Unchanged",
    summary: "Render the task list for Fernbrook Greenhouse.",
    lines: [
      "export function App() {",
      "  return (",
      "    <TaskList",
      "      workspace='Fernbrook Greenhouse'",
      "      area='Propagation house'",
      "    />",
      "  );",
      "}",
    ],
  },
  "larkspur-app/README.md": {
    label: "README.md",
    status: "Unchanged",
    summary: "Project notes for the greenhouse team.",
    lines: [
      "# Larkspur",
      "",
      "Tasks and bench conditions for Fernbrook Greenhouse.",
      "",
      "Start with the sensor hub connection.",
      "Create a task when a bench needs attention.",
    ],
  },
};
const variables = [
  { name: "LARKSPUR_SENSOR_HUB_URL", value: "https://larkspur.example/sensor-hub", required: true },
  { name: "LARKSPUR_API_KEY", value: "larkspur_demo_key_not_a_real_secret", required: true },
  { name: "LARKSPUR_WORKSPACE", value: "fernbrook-greenhouse", required: false },
];
function RepoFile({ path, marker }: { path: keyof typeof files; marker?: "Added" | "Modified" }) {
  const file = files[path];
  return (
    <FileTreeFile path={path} name={file.label}>
      <span aria-hidden className="size-5 shrink-0" />
      <FileTreeIcon>
        {path.endsWith(".md") ? (
          <IconFileText aria-hidden className="size-4" />
        ) : (
          <IconFileCode aria-hidden className="size-4" />
        )}
      </FileTreeIcon>
      <FileTreeName>{file.label}</FileTreeName>
      {marker && (
        <FileTreeActions>
          <span
            aria-label={marker}
            title={marker}
            className={`font-mono text-[12px] ${marker === "Added" ? "text-good" : "text-warn"}`}
          >
            {marker === "Added" ? "A" : "M"}
          </span>
        </FileTreeActions>
      )}
    </FileTreeFile>
  );
}
export default function FileTreeExamples() {
  const [selected, setSelected] = useState<string>("larkspur-app/src/api/tasks.ts");
  const [expanded, setExpanded] = useState(initialFolders);
  const [endpoint, setEndpoint] = useState<"tasks" | "bench">("tasks");
  const [showValues, setShowValues] = useState(false);
  const file = files[selected as keyof typeof files];
  return (
    <>
      <SpecimenItem
        name="File tree"
        wide
        note="Browse project files with arrow keys. Folder height and the selection highlight respond to each change."
      >
        <div className="w-full min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] text-muted-foreground">Fernbrook Greenhouse · project files</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setExpanded(initialFolders);
                setSelected("larkspur-app/src/api/tasks.ts");
              }}
            >
              Reset tree
            </Button>
          </div>
          <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(230px,0.8fr)_minmax(0,1.2fr)]">
            <FileTree
              expanded={expanded}
              onExpandedChange={setExpanded}
              selectedPath={selected}
              onSelect={setSelected}
              aria-label="Larkspur app files"
              className="min-w-0 self-start"
            >
              <FileTreeFolder path="larkspur-app" name="larkspur-app">
                <FileTreeFolder path="larkspur-app/src" name="src">
                  <FileTreeFolder path="larkspur-app/src/api" name="api">
                    <RepoFile path="larkspur-app/src/api/tasks.ts" marker="Modified" />
                    <RepoFile path="larkspur-app/src/api/benches.ts" marker="Added" />
                  </FileTreeFolder>
                  <RepoFile path="larkspur-app/src/app.tsx" />
                </FileTreeFolder>
                <RepoFile path="larkspur-app/README.md" />
              </FileTreeFolder>
            </FileTree>
            <div className="min-w-0 py-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[13px]">{file?.label ?? selected.split("/").at(-1)}</span>
                {file && (
                  <Badge
                    variant="outline"
                    className={file.status === "Added" ? "text-good" : file.status === "Modified" ? "text-warn" : ""}
                  >
                    {file.status}
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {file?.summary ?? "Select a file to inspect its contents."}
              </p>
              {file && (
                <CodeBlock
                  className="mt-4"
                  code={file.lines.join("\n")}
                  language={
                    file.label.endsWith(".md") ? "markdown" : file.label.endsWith(".tsx") ? "tsx" : "typescript"
                  }
                  showLineNumbers
                />
              )}
              <p className="mt-3 text-[12px] text-muted-foreground">A: added · M: modified</p>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Use ↑ and ↓ to move. Use → to expand and ← to collapse. Press Enter to select.
          </p>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Schema display"
        wide
        note="Inspect an API endpoint before creating a request. Sections and nested properties expand with measured height motion."
      >
        <div className="w-full min-w-0 space-y-4">
          <div role="group" aria-label="Example endpoint" className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={endpoint === "tasks" ? "secondary" : "outline"}
              aria-pressed={endpoint === "tasks"}
              onClick={() => setEndpoint("tasks")}
            >
              Create task
            </Button>
            <Button
              size="sm"
              variant={endpoint === "bench" ? "secondary" : "outline"}
              aria-pressed={endpoint === "bench"}
              onClick={() => setEndpoint("bench")}
            >
              Read bench
            </Button>
          </div>
          {endpoint === "tasks" ? (
            <SchemaDisplay
              key="tasks"
              method="POST"
              path="/api/tasks"
              description="Create a task for a grower at Fernbrook Greenhouse."
              parameters={[
                {
                  name: "x-workspace-id",
                  type: "string",
                  location: "header",
                  required: true,
                  description: "The greenhouse workspace identifier.",
                },
              ]}
              requestBody={[
                {
                  name: "title",
                  type: "string",
                  required: true,
                  description: "For example, check moisture on propagation bench 4.",
                },
                {
                  name: "assignment",
                  type: "object",
                  required: true,
                  description: "The grower and bench for this task.",
                  properties: [
                    {
                      name: "assignedTo",
                      type: "string",
                      required: true,
                      description: "The identifier for John Smith.",
                    },
                    { name: "benchId", type: "string", required: true, description: "The bench that needs attention." },
                  ],
                },
              ]}
              responseBody={[
                {
                  name: "task",
                  type: "object",
                  properties: [
                    { name: "id", type: "string" },
                    { name: "status", type: '"open"', description: "The task is ready for a grower." },
                  ],
                },
              ]}
            />
          ) : (
            <SchemaDisplay
              key="bench"
              method="GET"
              path="/api/benches/{benchId}"
              description="Read the latest sensor conditions for a greenhouse bench."
              parameters={[
                {
                  name: "benchId",
                  type: "string",
                  location: "path",
                  required: true,
                  description: "For example, propagation-04.",
                },
                {
                  name: "includeSensors",
                  type: "boolean",
                  location: "query",
                  description: "Include the most recent sensor readings.",
                },
              ]}
              responseBody={[
                {
                  name: "bench",
                  type: "object",
                  properties: [
                    { name: "id", type: "string" },
                    { name: "name", type: "string" },
                    {
                      name: "sensors",
                      type: "array",
                      items: {
                        name: "sensor",
                        type: "object",
                        properties: [
                          { name: "kind", type: "string" },
                          { name: "value", type: "number" },
                          { name: "unit", type: "string" },
                        ],
                      },
                    },
                  ],
                },
              ]}
            />
          )}
          <p className="text-[12px] text-muted-foreground">Reference data only. These controls do not send requests.</p>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Environment variables"
        wide
        note="Review connection settings without exposing values. Reveal and copy icons change with a short spring."
      >
        <div className="w-full min-w-0 space-y-3">
          <EnvironmentVariables showValues={showValues} onShowValuesChange={setShowValues}>
            <EnvironmentVariablesHeader>
              <EnvironmentVariablesTitle>Greenhouse connection</EnvironmentVariablesTitle>
              <EnvironmentVariablesToggle />
            </EnvironmentVariablesHeader>
            <EnvironmentVariablesContent>
              {variables.map((variable) => (
                <EnvironmentVariable key={variable.name} name={variable.name} value={variable.value}>
                  <div className="min-w-0 flex-1 space-y-2">
                    <EnvironmentVariableGroup className="flex-wrap">
                      <EnvironmentVariableName />
                      {variable.required && <EnvironmentVariableRequired />}
                    </EnvironmentVariableGroup>
                    <EnvironmentVariableValue />
                  </div>
                  <EnvironmentVariableCopyButton />
                </EnvironmentVariable>
              ))}
            </EnvironmentVariablesContent>
          </EnvironmentVariables>
          <p className="text-[12px] text-muted-foreground">
            All values are fictional. Copy keeps the full value, even when it is hidden.
          </p>
        </div>
      </SpecimenItem>
    </>
  );
}

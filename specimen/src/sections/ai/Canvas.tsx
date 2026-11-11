import { useEffect, useState } from "react";
import {
  addEdge,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection as FlowConnection,
  type Edge as FlowEdge,
  type Node as FlowNode,
  type NodeProps as FlowNodeProps,
} from "@xyflow/react";
import {
  IconCheck,
  IconCircle,
  IconPlayerPlay,
  IconPlayerStop,
  IconTemperature,
  IconArrowRight,
  IconArrowLeft,
  IconChevronDown,
} from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { Button } from "@sift-design/ui/button";
import { Canvas } from "@sift-design/ui/ai/canvas";
import {
  Node,
  NodeAction,
  NodeHeader,
  NodeTitle,
  NodeDescription,
  NodeContent,
  NodeFooter,
} from "@sift-design/ui/ai/node";
import { Edge } from "@sift-design/ui/ai/edge";
import { Connection } from "@sift-design/ui/ai/connection";
import { Controls } from "@sift-design/ui/ai/controls";
import { Panel } from "@sift-design/ui/ai/panel";
import { Toolbar } from "@sift-design/ui/ai/toolbar";
import { SpecimenItem } from "../../frame";

type StepData = {
  title: string;
  description: string;
  detail: string;
  source: boolean;
  target: boolean;
  state?: "ready" | "running" | "done";
  move?: (id: string, direction: number) => void;
  inspect?: (title: string, detail: string) => void;
};
type Step = FlowNode<StepData, "step">;

function WorkflowNode({ id, data }: FlowNodeProps<Step>) {
  const state = data.state ?? "ready";
  return (
    <Node handles={{ target: data.target, source: data.source }} data-state={state} className="w-[190px]">
      <NodeHeader>
        <NodeTitle>{data.title}</NodeTitle>
        <NodeDescription>{data.description}</NodeDescription>
        <NodeAction>
          {state === "done" ? (
            <IconCheck className="size-4 text-good" aria-hidden />
          ) : (
            <IconCircle className="size-4 text-muted-foreground" aria-hidden />
          )}
        </NodeAction>
      </NodeHeader>
      <NodeContent>
        {data.detail.split(/(\d+°C)/).map((part, index) =>
          /\d+°C/.test(part) ? (
            <span key={index} className="font-mono">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </NodeContent>
      <NodeFooter>
        <span className="text-muted-foreground">
          {state === "running" ? "Running" : state === "done" ? "Done" : "Ready"}
        </span>
      </NodeFooter>
      {(data.move || data.inspect) && (
        <Toolbar aria-label={`${data.title} actions`}>
          {data.move && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${data.title} left`}
              onClick={() => data.move?.(id, -1)}
            >
              <IconArrowLeft aria-hidden />
            </Button>
          )}
          {data.inspect && (
            <Button variant="ghost" size="sm" onClick={() => data.inspect?.(data.title, data.detail)}>
              Inspect step
            </Button>
          )}
          {data.move && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${data.title} right`}
              onClick={() => data.move?.(id, 1)}
            >
              <IconArrowRight aria-hidden />
            </Button>
          )}
        </Toolbar>
      )}
    </Node>
  );
}

const nodeTypes = { step: WorkflowNode };
const edgeTypes = { activity: Edge.Animated, temporary: Edge.Temporary };
const steps: Step[] = [
  {
    id: "sensor",
    type: "step",
    position: { x: 0, y: 120 },
    data: {
      title: "Sensor hub",
      description: "Propagation house",
      detail: "Temperature: 31°C",
      source: true,
      target: false,
    },
  },
  {
    id: "check",
    type: "step",
    position: { x: 245, y: 120 },
    data: {
      title: "Check temperature",
      description: "Condition",
      detail: "If above 30°C, take both actions.",
      source: true,
      target: true,
    },
  },
  {
    id: "vents",
    type: "step",
    position: { x: 490, y: 0 },
    data: {
      title: "Open vents",
      description: "Greenhouse control",
      detail: "Set roof vents to open.",
      source: true,
      target: true,
    },
  },
  {
    id: "task",
    type: "step",
    position: { x: 490, y: 240 },
    data: {
      title: "File a task",
      description: "Maintenance",
      detail: "Check the vent motor.",
      source: true,
      target: true,
    },
  },
  {
    id: "notify",
    type: "step",
    position: { x: 735, y: 120 },
    data: {
      title: "Notify Jane Doe",
      description: "Owner notification",
      detail: "Send the reading and task.",
      source: false,
      target: true,
    },
  },
];
const workflowEdges: FlowEdge[] = [
  { id: "sensor-check", source: "sensor", target: "check", type: "activity" },
  { id: "check-vents", source: "check", target: "vents", type: "activity" },
  { id: "check-task", source: "check", target: "task", type: "activity" },
  { id: "vents-notify", source: "vents", target: "notify", type: "activity" },
  { id: "task-notify", source: "task", target: "notify", type: "activity" },
];
const phases = [
  { active: ["sensor"], done: [], edges: ["sensor-check"], message: "Reading the sensor hub." },
  {
    active: ["check"],
    done: ["sensor"],
    edges: ["check-vents", "check-task"],
    message: "31°C is above 30°C. Both actions will run.",
  },
  {
    active: ["vents", "task"],
    done: ["sensor", "check"],
    edges: ["vents-notify", "task-notify"],
    message: "Opening vents and filing the maintenance task.",
  },
  { active: ["notify"], done: ["sensor", "check", "vents", "task"], edges: [], message: "Notifying Jane Doe." },
  {
    active: [],
    done: steps.map((step) => step.id),
    edges: [],
    message: "Run complete. Vents opened. Task filed. Jane Doe notified.",
  },
];

function FitAfterResize({ narrow }: { narrow: boolean }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const frame = requestAnimationFrame(() => fitView({ padding: 0.15, duration: 0 }));
    return () => cancelAnimationFrame(frame);
  }, [narrow, fitView]);
  return null;
}

function ClimateWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Step>(steps);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowEdges);
  const [phase, setPhase] = useState(-1);
  const [inspection, setInspection] = useState("Select a step to show its toolbar.");
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 640px)").matches);
  const running = phase >= 0 && phase < phases.length - 1;
  const current = phase >= 0 ? phases[phase] : null;
  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setPhase((value) => value + 1), 1400);
    return () => clearTimeout(timer);
  }, [phase, running]);
  useEffect(() => {
    const mobilePositions = [
      { x: 120, y: 0 },
      { x: 120, y: 180 },
      { x: 0, y: 380 },
      { x: 240, y: 380 },
      { x: 120, y: 580 },
    ];
    setNodes((items) =>
      items.map((item, index) => ({ ...item, position: narrow ? mobilePositions[index] : steps[index].position })),
    );
  }, [narrow, setNodes]);
  const move = (id: string, direction: number) =>
    setNodes((items) =>
      items.map((item) =>
        item.id === id ? { ...item, position: { ...item.position, x: item.position.x + direction * 20 } } : item,
      ),
    );
  const displayNodes = nodes.map((item) => ({
    ...item,
    data: {
      ...item.data,
      move,
      inspect: (title: string, detail: string) => setInspection(`${title}: ${detail}`),
      state: current?.active.includes(item.id)
        ? ("running" as const)
        : current?.done.includes(item.id)
          ? ("done" as const)
          : ("ready" as const),
    },
  }));
  const displayEdges = edges.map((edge) => ({ ...edge, data: { running: current?.edges.includes(edge.id) ?? false } }));
  const connect = (connection: FlowConnection) => {
    setEdges((items) => addEdge({ ...connection, type: "temporary" }, items));
    setInspection("Connection added. Run follows the original Climate watch route.");
  };
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.01em]">Climate watch</h4>
          <p className="text-[13px] text-muted-foreground">Fernbrook Greenhouse · Local simulation</p>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-tint px-2 py-1 font-mono text-[12px]">
          <IconTemperature className="size-4" aria-hidden />
          31°C / limit 30°C
        </span>
      </div>
      <div className="h-[530px] w-full overflow-hidden rounded-md border max-sm:h-[750px]">
        <ReactFlowProvider>
          <Canvas<Step>
            aria-label="Climate watch workflow"
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={connect}
            connectionLineComponent={Connection}
            deleteKeyCode={null}
            minZoom={0.2}
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
          >
            <FitAfterResize narrow={narrow} />
            <Controls showInteractive={false} orientation="horizontal" />
            <Panel position="top-right" className="flex items-center gap-2">
              <span className="text-muted-foreground">{running ? "Running" : phase === 4 ? "Complete" : "Ready"}</span>
              <Button size="sm" onClick={() => setPhase(running ? -1 : 0)}>
                {running ? <IconPlayerStop aria-hidden /> : <IconPlayerPlay aria-hidden />}
                {running ? "Stop" : "Run"}
              </Button>
            </Panel>
          </Canvas>
        </ReactFlowProvider>
      </div>
      <p role="status" className="min-h-10 text-[13px]">
        {current?.message ?? "Ready to run. No real devices or messages are used."}
      </p>
      <p className="text-[12px] text-muted-foreground">{inspection}</p>
      <Collapsible className="text-[12px] text-muted-foreground">
        <CollapsibleTrigger className="flex items-center gap-1.5 rounded-sm py-1 font-medium hover:text-foreground">
          Workflow and keyboard guide
          <IconChevronDown aria-hidden="true" className="size-3.5" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="pt-2">Sensor hub → Check temperature → Open vents and File a task → Notify Jane Doe.</p>
          <p className="mt-1">
            Tab to a step. Press Enter to select it. Use arrow keys to move it. Use the toolbar for click-based
            movement.
          </p>
          <p className="mt-1">
            Drag between connection handles. The Connection example also has a button that connects steps.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

const compactNode = (id: string, title: string, x: number, y = 0): Step => ({
  id,
  type: "step",
  position: { x, y },
  data: {
    title,
    description: "Climate watch",
    detail: id === "a" ? "Read the sensor hub." : "Notify Jane Doe.",
    source: id === "a",
    target: id !== "a",
  },
});

function SmallCanvas({ mode }: { mode: "node" | "edge" | "connection" | "controls" | "panel" | "toolbar" }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Step>(
    mode === "node" || mode === "toolbar"
      ? [{ ...compactNode("a", "Sensor hub", 0), selected: mode === "toolbar" }]
      : [compactNode("a", "Sensor hub", 0), compactNode("b", "Notify Jane Doe", 300)],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(
    mode === "connection"
      ? []
      : [{ id: "preview", source: "a", target: "b", type: mode === "edge" ? "temporary" : "activity" }],
  );
  const [active, setActive] = useState(false);
  const [scheduled, setScheduled] = useState(true);
  const [status, setStatus] = useState(
    mode === "connection"
      ? "Connect the sensor hub to the notification."
      : mode === "toolbar"
        ? "Select the step to show its actions."
        : "",
  );
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      setActive(false);
      setStatus("Activity complete. The marker has stopped.");
    }, 4000);
    return () => clearTimeout(timer);
  }, [active]);
  const move = (id: string, direction: number) =>
    setNodes((items) =>
      items.map((item) =>
        item.id === id ? { ...item, position: { ...item.position, x: item.position.x + direction * 20 } } : item,
      ),
    );
  const displayNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      ...(mode === "toolbar"
        ? { move, inspect: (title: string, detail: string) => setStatus(`${title}: ${detail}`) }
        : {}),
    },
  }));
  const connect = (connection: FlowConnection) => {
    setEdges((items) => addEdge({ ...connection, id: "preview", type: "activity" }, items));
    setStatus("Sensor hub connected to Notify Jane Doe.");
  };
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="h-[270px] w-full overflow-hidden rounded-md border">
        <Canvas<Step>
          aria-label={`${mode} example`}
          nodes={displayNodes}
          edges={
            mode === "node" || mode === "toolbar"
              ? []
              : edges.map((edge) => ({
                  ...edge,
                  type: mode === "edge" ? (active ? "activity" : "temporary") : edge.type,
                  data: { running: active },
                }))
          }
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={connect}
          connectionLineComponent={Connection}
          deleteKeyCode={null}
          minZoom={0.2}
          maxZoom={mode === "node" || mode === "toolbar" ? 1 : 1.2}
          fitViewOptions={{ padding: mode === "toolbar" ? 0.35 : 0.18 }}
          proOptions={{ hideAttribution: true }}
        >
          {mode === "controls" && <Controls showInteractive={false} orientation="horizontal" />}
          {mode === "panel" && (
            <Panel position="top-right">
              <Button variant="ghost" size="sm" onClick={() => setScheduled((value) => !value)}>
                {scheduled ? "Pause schedule" : "Resume schedule"}
              </Button>
            </Panel>
          )}
        </Canvas>
      </div>
      {mode === "edge" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActive((value) => !value);
            setStatus(active ? "Activity stopped." : "Running for four seconds.");
          }}
        >
          {active ? "Stop activity" : "Run edge activity"}
        </Button>
      )}
      {mode === "connection" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            edges.length
              ? (setEdges([]), setStatus("Connection removed. Connect the steps again."))
              : connect({ source: "a", target: "b", sourceHandle: null, targetHandle: null })
          }
        >
          {edges.length ? "Remove connection" : "Connect steps"}
        </Button>
      )}
      {mode === "panel" && (
        <p role="status" className="text-[13px]">
          {scheduled ? "Next reading at 14:30." : "Schedule paused by Jane Doe."}
        </p>
      )}
      {status && (
        <p role="status" className="text-[13px]">
          {status}
        </p>
      )}
    </div>
  );
}

export default function CanvasExamples() {
  return (
    <>
      <SpecimenItem
        name="Canvas"
        wide
        note="Build an editable workflow with connected steps. Run this local simulation to follow each action."
      >
        <ClimateWorkflow />
      </SpecimenItem>
      <SpecimenItem
        name="Node"
        note="Group a step title, description, content, and state. Connection handles show the available directions."
      >
        <SmallCanvas mode="node" />
      </SpecimenItem>
      <SpecimenItem
        name="Edge"
        note="Use dashes for a temporary connection. A moving marker shows active work and stops when work ends."
      >
        <SmallCanvas mode="edge" />
      </SpecimenItem>
      <SpecimenItem
        name="Connection"
        note="Preview a connection while dragging between handles. The button provides a non-drag alternative."
      >
        <SmallCanvas mode="connection" />
      </SpecimenItem>
      <SpecimenItem
        name="Controls"
        note="Zoom or fit the workflow without changing its steps. Controls remain fixed while the view moves."
      >
        <SmallCanvas mode="controls" />
      </SpecimenItem>
      <SpecimenItem
        name="Panel"
        note="Keep workflow actions outside the zoomed content. Pause or resume the sample schedule."
      >
        <SmallCanvas mode="panel" />
      </SpecimenItem>
      <SpecimenItem
        name="Toolbar"
        note="Show actions for the selected step. The toolbar appears with a short spring transition."
      >
        <SmallCanvas mode="toolbar" />
      </SpecimenItem>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  IconArrowUp,
  IconCheck,
  IconFileText,
  IconListCheck,
  IconMessage,
  IconPlus,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Input } from "@sift-design/ui/input";
import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@sift-design/ui/ai/plan";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "@sift-design/ui/ai/task";
import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
  type QueueTodo,
} from "@sift-design/ui/ai/queue";
import { SpecimenItem } from "../../frame";

const planSteps = [
  "Count basil and mint on the retail bench.",
  "Move 24 basil pots from Polytunnel 2.",
  "Print price cards for Saturday.",
];
const initialTodos: QueueTodo[] = [
  {
    id: "count",
    title: "Count the remaining herb pots",
    description: "Jane Doe · Retail benches",
    status: "completed",
  },
  {
    id: "basil",
    title: "Move 24 basil pots to the herb bench",
    description: "John Smith · Before Friday",
    status: "pending",
  },
  { id: "cards", title: "Print the new price cards", description: "Sam Taylor · Saturday market", status: "pending" },
];
const initialMessages = [
  { id: "mint", text: "Check the mint stock before moving any pots.", file: "herb-stock.csv" },
  { id: "labels", text: "Use the updated prices for the market labels." },
];

function PlanDemo() {
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(0);
  const [streaming, setStreaming] = useState(true);
  const [editing, setEditing] = useState(false);
  const [steps, setSteps] = useState(planSteps);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    setVisible(0);
    setStreaming(true);
    const timers = planSteps.map((_, index) => window.setTimeout(() => setVisible(index + 1), 450 + index * 550));
    timers.push(window.setTimeout(() => setStreaming(false), 2250));
    return () => timers.forEach(window.clearTimeout);
  }, [run]);
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">Fernbrook Greenhouse · Retail benches</span>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setOpen(true);
            setRun((value) => value + 1);
          }}
        >
          <IconRefresh aria-hidden className="size-3.5" />
          Replay plan
        </Button>
      </div>
      <Plan isStreaming={streaming} open={open} onOpenChange={setOpen}>
        <PlanHeader>
          <PlanTitle>Restock the herb bench before Saturday</PlanTitle>
          <PlanDescription>Check the stock sheet, move the basil pots, and prepare the price cards.</PlanDescription>
          <PlanAction>
            <PlanTrigger />
          </PlanAction>
        </PlanHeader>
        <PlanContent>
          <ol className="space-y-3">
            {steps.slice(0, visible).map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 font-mono text-[12px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {editing ? (
                  <Input
                    aria-label={`Plan step ${index + 1}`}
                    value={step}
                    onChange={(event) =>
                      setSteps((values) => values.map((value, i) => (i === index ? event.target.value : value)))
                    }
                    className="h-8 text-[13px]"
                  />
                ) : (
                  <span className="leading-relaxed">{step}</span>
                )}
              </li>
            ))}
          </ol>
        </PlanContent>
        <PlanFooter className="justify-between border-t pt-3">
          <span role="status" className="text-[12px] text-muted-foreground">
            {streaming
              ? "Writing the restock plan…"
              : editing
                ? "Edit the steps, then save."
                : "Draft ready for review"}
          </span>
          <Button
            size="sm"
            variant={editing ? "default" : "outline"}
            disabled={streaming}
            onClick={() => {
              setOpen(true);
              setEditing((value) => !value);
            }}
          >
            {editing ? "Save plan" : "Edit plan"}
          </Button>
        </PlanFooter>
      </Plan>
    </div>
  );
}

function TaskDemo() {
  const [reading, setReading] = useState(false);
  useEffect(() => {
    if (!reading) return;
    const timer = window.setTimeout(() => setReading(false), 1800);
    return () => window.clearTimeout(timer);
  }, [reading]);
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span role="status" className="text-[12px] text-muted-foreground">
          {reading ? "Reading 3 local files…" : "3 files checked · No stock changes saved"}
        </span>
        <Button size="xs" variant="ghost" disabled={reading} onClick={() => setReading(true)}>
          <IconRefresh aria-hidden className="size-3.5" />
          Read again
        </Button>
      </div>
      <Task>
        <TaskTrigger title="Reading the stock sheet" />
        <TaskContent>
          {[
            ["herb-stock.csv", "Checked basil and mint quantities"],
            ["saturday-orders.csv", "Compared reserved herb pots"],
            ["bench-notes.txt", "Read the latest growing notes"],
          ].map(([file, description]) => (
            <TaskItem key={file}>
              <TaskItemFile>
                <IconFileText aria-hidden className="size-3" />
                {file}
              </TaskItemFile>
              <span>{reading ? "Reading file…" : description}</span>
            </TaskItem>
          ))}
        </TaskContent>
      </Task>
    </div>
  );
}

function QueueDemo() {
  const [todos, setTodos] = useState(initialTodos);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const nextId = useRef(0);
  const newTodoInput = useRef<HTMLInputElement>(null);
  const messageTrigger = useRef<HTMLButtonElement>(null);
  const todoTrigger = useRef<HTMLButtonElement>(null);
  function removeTodo(id: string) {
    const index = todos.findIndex((todo) => todo.id === id);
    const remaining = todos.filter((todo) => todo.id !== id);
    setTodos(remaining);
    setNotice("Todo removed.");
    requestAnimationFrame(() => {
      const next = remaining[Math.min(index, remaining.length - 1)];
      if (next) document.getElementById(`queue-check-${next.id}`)?.focus();
      else todoTrigger.current?.focus();
    });
  }
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">Next for the herb bench</span>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            setTodos(initialTodos);
            setMessages(initialMessages);
            setNotice("Queue reset.");
          }}
        >
          Reset queue
        </Button>
      </div>
      <Queue>
        <QueueSection>
          <QueueSectionTrigger ref={messageTrigger}>
            <QueueSectionLabel
              label="Queued messages"
              count={messages.length}
              icon={<IconMessage aria-hidden className="size-3.5 text-muted-foreground" />}
            />
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList aria-label="Queued follow-up messages">
              {messages.map((message) => (
                <QueueItem key={message.id}>
                  <div className="flex items-start gap-2">
                    <QueueItemIndicator />
                    <QueueItemContent>{message.text}</QueueItemContent>
                    <QueueItemActions>
                      <QueueItemAction
                        aria-label={`Send message: ${message.text}`}
                        onClick={() => {
                          setMessages((values) => values.filter((value) => value.id !== message.id));
                          setNotice("Message sent in this demo.");
                          messageTrigger.current?.focus();
                        }}
                      >
                        <IconArrowUp aria-hidden className="size-3.5" />
                      </QueueItemAction>
                      <QueueItemAction
                        aria-label={`Remove message: ${message.text}`}
                        onClick={() => {
                          setMessages((values) => values.filter((value) => value.id !== message.id));
                          setNotice("Queued message removed.");
                          messageTrigger.current?.focus();
                        }}
                      >
                        <IconX aria-hidden className="size-3.5" />
                      </QueueItemAction>
                    </QueueItemActions>
                  </div>
                  {message.file && (
                    <QueueItemAttachment>
                      <QueueItemFile>{message.file}</QueueItemFile>
                    </QueueItemAttachment>
                  )}
                </QueueItem>
              ))}
            </QueueList>
            {messages.length === 0 && (
              <p className="px-2 py-3 text-[12px] text-muted-foreground">
                No queued messages. Reset the queue to try again.
              </p>
            )}
          </QueueSectionContent>
        </QueueSection>
        <QueueSection className="border-t pt-2">
          <QueueSectionTrigger ref={todoTrigger}>
            <QueueSectionLabel
              label="Todos"
              count={todos.length}
              icon={<IconListCheck aria-hidden className="size-3.5 text-muted-foreground" />}
            />
            <span className="font-mono text-[12px] text-muted-foreground">
              {todos.filter((todo) => todo.status === "completed").length}/{todos.length} done
            </span>
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList aria-label="Herb bench todos">
              {todos.map((todo) => {
                const completed = todo.status === "completed";
                return (
                  <QueueItem key={todo.id}>
                    <div className="flex items-start gap-2">
                      <button
                        id={`queue-check-${todo.id}`}
                        type="button"
                        role="checkbox"
                        aria-checked={completed}
                        aria-label={todo.title}
                        className="mt-0 flex size-6 shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        onClick={() => {
                          setTodos((values) =>
                            values.map((value) =>
                              value.id === todo.id ? { ...value, status: completed ? "pending" : "completed" } : value,
                            ),
                          );
                          setNotice(completed ? "Todo marked pending." : "Todo completed.");
                        }}
                      >
                        <span
                          className={`flex size-3.5 items-center justify-center rounded-[3px] border ${completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                        >
                          {completed && <IconCheck aria-hidden className="size-3" />}
                        </span>
                      </button>
                      <QueueItemContent className="pt-0.5" completed={completed}>
                        {todo.title}
                      </QueueItemContent>
                      <QueueItemActions>
                        <QueueItemAction aria-label={`Remove todo: ${todo.title}`} onClick={() => removeTodo(todo.id)}>
                          <IconX aria-hidden className="size-3.5" />
                        </QueueItemAction>
                      </QueueItemActions>
                    </div>
                    {todo.description && (
                      <QueueItemDescription className="ml-8" completed={completed}>
                        {todo.description}
                      </QueueItemDescription>
                    )}
                  </QueueItem>
                );
              })}
            </QueueList>
            {todos.length === 0 && (
              <p className="px-2 py-3 text-[12px] text-muted-foreground">No todos yet. Add the next step below.</p>
            )}
            <form
              className="flex gap-2 border-t px-2 pt-3 pb-1"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim()) return;
                setTodos((values) => [
                  { id: `new-${nextId.current++}`, title: draft.trim(), status: "pending" },
                  ...values,
                ]);
                setDraft("");
                setNotice("Todo added.");
                newTodoInput.current?.focus();
              }}
            >
              <div className="min-w-0 flex-1">
                <label htmlFor="queue-new-todo" className="sr-only">
                  New todo
                </label>
                <Input
                  ref={newTodoInput}
                  id="queue-new-todo"
                  placeholder="Add a herb bench task"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="icon" aria-label="Add todo" disabled={!draft.trim()}>
                <IconPlus aria-hidden className="size-4" />
              </Button>
            </form>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
      <p role="status" className="min-h-4 text-[12px] text-muted-foreground">
        {notice || "Tick a todo to update its state. Changes stay in this demo."}
      </p>
    </div>
  );
}

export default function TaskExamples() {
  return (
    <>
      <SpecimenItem
        name="Plan"
        note="Review a proposed set of steps before work starts. Streaming ends once the draft is ready."
      >
        <PlanDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Task"
        note="Show the files used for a work item. Details open and close with a measured spring."
      >
        <TaskDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Queue"
        note="Keep follow-up messages and todos together. New items arrive once, and remaining items close the gap."
      >
        <QueueDemo />
      </SpecimenItem>
    </>
  );
}

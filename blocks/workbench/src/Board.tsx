import { createContext, Fragment, useContext, useEffect, useState, type KeyboardEventHandler } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragMoveEvent,
  type DropAnimation,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  IconCheck,
  IconCircle,
  IconGripVertical,
  IconCalendar,
  IconPlus,
  IconRobot,
  IconChecklist,
  IconArrowUp,
  IconArrowDown,
  IconExclamationMark,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { arrivalMotion, reflowTransition, spring } from "@sift-design/tokens/motion";
import { columns, initials, type Task, type Status } from "./data";

type Props = {
  tasks: Task[];
  view: string;
  open: (task: Task) => void;
  complete: (task: Task) => void;
  move: (task: Task, status: Status, before?: string | null) => void;
  add: (status: Status) => void;
  onDrag: (dragging: boolean) => void;
};
const coordinates: KeyboardCoordinateGetter = (event, { currentCoordinates, context }) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.code)) return;
  event.preventDefault();
  const rect = context.collisionRect;
  if (!rect) return;
  const targets = context.droppableContainers
    .getEnabled()
    .map((c) => ({ id: c.id, rect: context.droppableRects.get(c.id) }))
    .filter((c) => c.rect)
    .sort((a, b) => a.rect!.left - b.rect!.left);
  const index = targets.findIndex((c) => c.id === context.over?.id);
  const next = targets[index + (event.code === "ArrowRight" ? 1 : -1)]?.rect;
  if (!next) return;
  return {
    x: currentCoordinates.x + next.left + (next.width - rect.width) / 2 - rect.left,
    y: currentCoordinates.y + next.top + 48 - rect.top,
  };
};
export function Attribution({ task }: { task: Task }) {
  return task.helper ? (
    <span className="helper-badge" title={`Filed by ${task.helper}; assigned to ${task.person}`}>
      <IconRobot size={13} />
      {task.helper}
    </span>
  ) : (
    <span className="person" title={task.person}>
      <span className="avatar">{initials(task.person)}</span>
      <span>{task.person.split(" ")[0]}</span>
    </span>
  );
}
export function Priority({ task }: { task: Task }) {
  if (!task.priority) return null;
  const Icon = task.priority === "Urgent" ? IconExclamationMark : task.priority === "Low" ? IconArrowDown : IconArrowUp;
  return (
    <span className={`priority ${task.priority.toLowerCase()}`}>
      <Icon size={12} />
      {task.priority}
    </span>
  );
}
function Card({
  task,
  props,
  preview = false,
  compact = false,
}: {
  task: Task;
  props: Props;
  preview?: boolean;
  compact?: boolean;
}) {
  const reduced = !!useReducedMotion();
  // Just dropped: the drag overlay flies into the new slot, so the card itself neither arrives nor travels,
  // and the placeholder in the old column goes at once so that column closes up straight away.
  const landed = useContext(Landed) === task.id && !preview;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: preview ? `preview-${task.id}` : task.id,
    data: { task },
    disabled: preview || compact,
  });
  const { onKeyDown, ...pointerListeners } = listeners ?? {};
  return (
    <motion.article
      ref={setNodeRef}
      data-task={preview ? undefined : task.id}
      className={`task-card ${compact ? "task-row" : ""} ${task.status === "Done" ? "completed" : ""} ${preview ? "drag-preview" : ""}`}
      layout={reduced || preview || landed ? false : "position"}
      {...arrivalMotion(reduced)}
      initial={preview || landed ? false : arrivalMotion(reduced).initial}
      animate={{ opacity: isDragging ? 0.25 : 1, y: 0, scale: 1 }}
      // The placeholder left behind by a drag goes at once, so its column closes up while the card lands.
      exit={landed ? { opacity: 0, transition: { duration: 0 } } : arrivalMotion(reduced).exit}
      transition={reflowTransition(reduced)}
      {...pointerListeners}
    >
      <div className="card-heading">
        <Button
          variant="plain"
          size="icon-sm"
          className="task-check"
          aria-label={`${task.status === "Done" ? "Reopen" : "Complete"} ${task.title}`}
          onClick={() => props.complete(task)}
        >
          {task.status === "Done" ? <IconCheck /> : <IconCircle />}
        </Button>
        <button className="task-title" onClick={() => props.open(task)}>
          {task.title}
        </button>
        {!compact && !preview && (
          <button
            ref={setActivatorNodeRef}
            className="drag-handle"
            aria-label={`Drag ${task.title}`}
            {...attributes}
            {...listeners}
            onKeyDown={onKeyDown as KeyboardEventHandler<HTMLButtonElement>}
          >
            <IconGripVertical size={14} />
          </button>
        )}
      </div>
      <div className="card-properties">
        <Priority task={task} />
        <span className="area-label">{task.area}</span>
        {task.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <span className="due">
          <IconCalendar size={12} />
          {task.due}
        </span>
        {task.checklist && (
          <span className="checklist-count">
            <IconChecklist size={13} />
            <span className="mono">
              {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
            </span>
          </span>
        )}
        <Attribution task={task} />
      </div>
      {compact && (
        <span className="row-status">
          <span className={`status-symbol status-${columns.indexOf(task.status)}`} />
          {task.status}
        </span>
      )}
      {!compact && task.status === "Waiting on supplier" && <p className="waiting-note">Delivery date not confirmed</p>}
    </motion.article>
  );
}
type Drop = { status: Status; before: string | null } | null;
/** The task that was just dropped. Context, so the placeholder left in the old column hears it too. */
const Landed = createContext<string | null>(null);
/** Where a dragged card would land: before the first card whose middle is below the pointer. */
function dropAt(status: Status, y: number, activeId: string): Drop {
  const cards = [...document.querySelectorAll<HTMLElement>(`[data-column="${CSS.escape(status)}"] [data-task]`)].filter(
    (el) => el.dataset.task !== activeId,
  );
  const before = cards.find((el) => {
    const r = el.getBoundingClientRect();
    return y < r.top + r.height / 2;
  });
  return { status, before: before?.dataset.task ?? null };
}
function DropLine({ reduced }: { reduced: boolean }) {
  // One insertion line for the whole board: it springs between slots and columns.
  return (
    <motion.div
      aria-hidden="true"
      className="drop-line"
      layoutId={reduced ? undefined : "drop-line"}
      transition={spring.snappy}
    />
  );
}
function Column({ status, props, drop, reduced }: { status: Status; props: Props; drop: Drop; reduced: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const tasks = props.tasks.filter((t) => t.status === status);
  const here = drop?.status === status ? drop : null;
  return (
    <section
      ref={setNodeRef}
      className={`board-column ${isOver ? "drag-over" : ""}`}
      aria-label={status}
      data-column={status}
    >
      <header className="column-heading">
        <span className={`status-symbol status-${columns.indexOf(status)}`} />
        <h2>{status}</h2>
        <span className="mono count">{tasks.length}</span>
        <Button variant="plain" size="icon-xs" aria-label={`Add task to ${status}`} onClick={() => props.add(status)}>
          <IconPlus />
        </Button>
      </header>
      <div className="column-cards">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <Fragment key={task.id}>
              {here?.before === task.id && <DropLine reduced={reduced} />}
              <Card task={task} props={props} />
            </Fragment>
          ))}
        </AnimatePresence>
        {here && here.before === null && <DropLine reduced={reduced} />}
      </div>
      <button className="add-column-task" onClick={() => props.add(status)}>
        <IconPlus size={14} />
        Add task
      </button>
    </section>
  );
}
/**
 * The lifted card flies into its new slot on the snappy spring and straightens
 * as it lands. The real card stays hidden underneath until it arrives.
 */
function landing(): DropAnimation {
  const root = getComputedStyle(document.documentElement);
  // Minified CSS may write 358ms as .358s.
  const raw = root.getPropertyValue("--spring-snappy-duration").trim();
  const duration = parseFloat(raw) * (raw.endsWith("ms") ? 1 : 1000);
  const easing = root.getPropertyValue("--spring-snappy").trim();
  return {
    duration,
    easing,
    sideEffects: ({ active, dragOverlay }) => {
      const opacity = active.node.style.opacity;
      active.node.style.opacity = "0";
      dragOverlay.node
        .querySelector<HTMLElement>("[data-lift]")
        ?.animate([{ transform: "none" }], { duration, easing, fill: "forwards" });
      return () => {
        active.node.style.opacity = opacity;
      };
    },
  };
}
export default function Board(props: Props) {
  const reduced = !!useReducedMotion();
  const [active, setActive] = useState<Task | null>(null);
  const [drop, setDrop] = useState<Drop>(null);
  const [landed, setLanded] = useState<string | null>(null);
  useEffect(() => {
    if (!landed) return;
    const timer = window.setTimeout(() => setLanded(null), 400);
    return () => window.clearTimeout(timer);
  }, [landed]);
  const track = (event: DragMoveEvent) => {
    const status = event.over?.id as Status | undefined;
    const start = event.activatorEvent as MouseEvent & TouchEvent;
    const y = (start.touches?.[0]?.clientY ?? start.clientY) + event.delta.y;
    const next =
      status && Number.isFinite(y) && start.type !== "keydown" ? dropAt(status, y, String(event.active.id)) : null;
    setDrop((previous) => (previous?.status === next?.status && previous?.before === next?.before ? previous : next));
  };
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordinates }),
  );
  if (props.view === "list")
    return (
      <div className="task-list">
        <div className="list-caption">
          <span>
            Tasks · <span className="mono">{props.tasks.length}</span>
          </span>
          <span>Status</span>
        </div>
        <AnimatePresence initial={false}>
          {props.tasks.map((task) => (
            <Card key={task.id} task={task} compact props={props} />
          ))}
        </AnimatePresence>
      </div>
    );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => (args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args))}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Press Space to lift a task. Use Left and Right to choose a column. Press Space to drop or Escape to cancel.",
        },
      }}
      onDragStart={(event) => {
        setActive(event.active.data.current?.task);
        props.onDrag(true);
      }}
      onDragMove={track}
      onDragOver={track}
      onDragCancel={() => {
        setActive(null);
        setDrop(null);
        props.onDrag(false);
      }}
      onDragEnd={(event) => {
        if (active && event.over) {
          setLanded(active.id);
          props.move(active, event.over.id as Status, drop?.status === event.over.id ? drop.before : undefined);
        }
        setActive(null);
        setDrop(null);
        props.onDrag(false);
      }}
    >
      <Landed.Provider value={landed}>
        <LayoutGroup id="board-drop">
          <div className="kanban">
            {columns.map((status) => (
              <Column key={status} status={status} props={props} drop={active ? drop : null} reduced={reduced} />
            ))}
          </div>
        </LayoutGroup>
      </Landed.Provider>
      {createPortal(
        <DragOverlay zIndex={45} dropAnimation={reduced ? null : landing()}>
          {active && (
            <motion.div
              aria-hidden="true"
              data-lift
              inert
              initial={reduced ? false : { scale: 1, rotate: 0 }}
              animate={{ scale: reduced ? 1 : 1.035, rotate: reduced ? 0 : -1.2 }}
              transition={spring.snappy}
            >
              <Card task={active} props={props} preview />
            </motion.div>
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}

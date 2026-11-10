import { useState } from "react";
import { Dialog as Primitive } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "motion/react";
import {
  IconArrowLeft,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconX,
  IconCheck,
  IconArrowRight,
  IconRobot,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Checkbox } from "@sift-design/ui/checkbox";
import { sheetMotion, reflowTransition } from "@sift-design/tokens/motion";
import { Attribution, Priority } from "./Board";
import { columns, type Task } from "./data";
export default function Inspector({
  task,
  full,
  close,
  toggleFull,
  update,
  complete,
}: {
  task: Task | undefined;
  full: boolean;
  close: () => void;
  toggleFull: () => void;
  update: (task: Task) => void;
  complete: (task: Task) => void;
}) {
  const reduced = !!useReducedMotion();
  const [subtasks, setSubtasks] = useState<Record<string, boolean>>({});
  return (
    <Primitive.Root
      open={!!task}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <AnimatePresence>
        {task && (
          <Primitive.Portal forceMount>
            <Primitive.Overlay forceMount asChild>
              <motion.div
                className="inspector-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
              />
            </Primitive.Overlay>
            <Primitive.Content
              forceMount
              asChild
              aria-describedby="task-description"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                requestAnimationFrame(() =>
                  (
                    document.querySelector<HTMLButtonElement>(`[data-task="${task.id}"] .task-title`) ||
                    document.querySelector<HTMLButtonElement>('[data-slot="sidebar-trigger"]')
                  )?.focus(),
                );
              }}
            >
              <motion.section
                className={`inspector ${full ? "inspector-full" : ""}`}
                {...(sheetMotion(reduced, window.matchMedia("(max-width: 767px)").matches) as MotionProps)}
                layout={!reduced}
                transition={reflowTransition(reduced)}
              >
                <header className="inspector-top">
                  <Button variant="ghost" size="icon" aria-label="Close task inspector" onClick={close}>
                    <IconArrowLeft />
                  </Button>
                  <span className="mono">{task.id}</span>
                  <div className="inspector-top-actions">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={full ? "Switch to inspector" : "Open full page"}
                      onClick={toggleFull}
                    >
                      {full ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
                    </Button>
                    <Primitive.Close asChild>
                      <Button variant="ghost" size="icon" aria-label="Close task">
                        <IconX />
                      </Button>
                    </Primitive.Close>
                  </div>
                </header>
                <div className="inspector-scroll">
                  <div className="inspector-title">
                    <Priority task={task} />
                    <Primitive.Title asChild>
                      <h2>{task.title}</h2>
                    </Primitive.Title>
                  </div>
                  <div className="task-properties">
                    <div>
                      <span>Status</span>
                      <strong>
                        <span className={`status-symbol status-${columns.indexOf(task.status)}`} />
                        {task.status}
                      </strong>
                    </div>
                    <div>
                      <span>Area</span>
                      <strong>{task.area}</strong>
                    </div>
                    <div>
                      <span>Assigned to</span>
                      <strong>{task.person}</strong>
                    </div>
                    <div>
                      <span>Due</span>
                      <strong>{task.due === "Today" ? "Today, 10 November" : task.due}</strong>
                    </div>
                    <div>
                      <span>Tags</span>
                      <strong>{task.tags.join(", ") || "No tags"}</strong>
                    </div>
                  </div>
                  <section className="detail-section">
                    <h3>Description</h3>
                    <Primitive.Description id="task-description">{task.description}</Primitive.Description>
                  </section>
                  <section className="detail-section">
                    <h3>
                      Checklist{" "}
                      <span className="mono">
                        {task.checklist?.filter((c) => c.done).length ?? 0}/{task.checklist?.length ?? 0}
                      </span>
                    </h3>
                    {task.checklist?.length ? (
                      task.checklist.map((item, index) => (
                        <label className={`check-item ${item.done ? "checked" : ""}`} key={item.text}>
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={(done) =>
                              update({
                                ...task,
                                checklist: task.checklist!.map((entry, i) =>
                                  i === index ? { ...entry, done: !!done } : entry,
                                ),
                              })
                            }
                          />
                          <span>{item.text}</span>
                        </label>
                      ))
                    ) : (
                      <p className="muted">No checklist needed for this task.</p>
                    )}
                  </section>
                  <section className="detail-section">
                    <h3>
                      Subtasks <span className="mono">{task.subtasks?.length ?? 0}</span>
                    </h3>
                    {task.subtasks?.length ? (
                      task.subtasks.map((text) => (
                        <label className="subtask" key={text}>
                          <Checkbox
                            checked={!!subtasks[task.id + text]}
                            onCheckedChange={(done) => setSubtasks((s) => ({ ...s, [task.id + text]: !!done }))}
                          />
                          <span>{text}</span>
                          <IconArrowRight size={14} />
                        </label>
                      ))
                    ) : (
                      <p className="muted">No subtasks.</p>
                    )}
                  </section>
                  <section className="detail-section history">
                    <h3>History</h3>
                    {task.reason && (
                      <div>
                        <span className="history-marker">
                          <IconCheck size={12} />
                        </span>
                        <p>
                          <strong>Jane marked this done</strong>
                          <span>{task.reason}</span>
                          <time className="mono">Today · 10:42</time>
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="history-marker">
                        {task.helper ? <IconRobot size={12} /> : <IconCheck size={12} />}
                      </span>
                      <p>
                        <strong>{task.helper ? `${task.helper} filed this task` : "Jane created this task"}</strong>
                        <span>
                          {task.helper ? "From the latest greenhouse reading." : `Assigned to ${task.person}.`}
                        </span>
                        <time className="mono">Today · 07:15</time>
                      </p>
                    </div>
                    <div>
                      <span className="history-marker" />
                      <p>
                        <strong>Added to {task.area}</strong>
                        <time className="mono">Today · 07:15</time>
                      </p>
                    </div>
                  </section>
                </div>
                <footer className="inspector-footer">
                  <Attribution task={task} />
                  <Button onClick={() => complete(task)}>
                    <IconCheck />
                    {task.status === "Done" ? "Reopen task" : "Mark done"}
                  </Button>
                </footer>
              </motion.section>
            </Primitive.Content>
          </Primitive.Portal>
        )}
      </AnimatePresence>
    </Primitive.Root>
  );
}

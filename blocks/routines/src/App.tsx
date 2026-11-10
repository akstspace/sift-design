import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconClockPlay,
  IconFolder,
  IconHistory,
  IconInfoCircle,
  IconLayoutBoard,
  IconLeaf,
  IconLogin2,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconTool,
  IconTrash,
  IconX,
  IconAlertTriangle,
  IconRefresh,
  IconSquare,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Input } from "@sift-design/ui/input";
import { Textarea } from "@sift-design/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@sift-design/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@sift-design/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@sift-design/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { PushStack, SiblingTransition } from "@sift-design/ui/page-transition";
import { reflowTransition, selectionSpring } from "@sift-design/tokens/motion";
import { LarkspurWordmark } from "../../_shared/brand";
import {
  AREAS,
  DAYS,
  ZONE,
  defaultSchedule,
  describeSchedule,
  elapsed,
  formatRun,
  helpers as seededHelpers,
  initialRuns,
  logsFor,
  nextRuns,
  scheduleError,
  tasksFor,
  type Helper,
  type Run,
  type Schedule,
  type ScheduleKind,
} from "./model";

const query = new URLSearchParams(window.location.search);
const statusLabels: Record<string, string> = {
  running: "Running",
  scheduled: "Scheduled",
  "auto-paused": "Paused by Larkspur",
  paused: "Paused by Jane",
  failed: "Failed",
  "last-failed": "Last run failed",
  action: "Needs sign-in",
  completed: "Completed",
  cancelled: "Cancelled",
};
function Status({ state, duration }: { state: string; duration?: number }) {
  const reduced = !!useReducedMotion();
  const Icon =
    state === "running"
      ? IconClockPlay
      : state === "completed" || state === "scheduled"
        ? IconCheck
        : state === "action"
          ? IconLogin2
          : ["failed", "last-failed"].includes(state)
            ? IconAlertTriangle
            : IconPlayerPause;
  return (
    <motion.span
      layout={reduced ? false : "size"}
      transition={reflowTransition(reduced)}
      className={`status status-${state}`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="status-label"
        >
          <Icon size={13} aria-hidden />
          <span>{statusLabels[state] ?? state}</span>
          {state === "running" && duration !== undefined && <span className="mono">{elapsed(duration)}</span>}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
function Segments<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  const reduced = !!useReducedMotion();
  return (
    <LayoutGroup>
      <div className="segments" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {value === option.value && (
              <motion.span
                className="segment-selection"
                layoutId={reduced ? undefined : "selection"}
                transition={selectionSpring}
              />
            )}
            <span className="segment-label">{option.label}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
function Field({
  label,
  children,
  hint,
  error,
  id,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  id: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
function SchedulePicker({ value: s, onChange }: { value: Schedule; onChange: (s: Schedule) => void }) {
  const reduced = !!useReducedMotion();
  const preview = useMemo(() => nextRuns(s), [s]);
  const error = scheduleError(s);
  const update = (next: Partial<Schedule>) => onChange({ ...s, ...next });
  return (
    <section className="schedule-picker" aria-labelledby="schedule-heading">
      <div className="section-label">
        <h3 id="schedule-heading">Schedule</h3>
        <span className="muted">
          <IconClock size={13} aria-hidden /> {ZONE}
        </span>
      </div>
      <Segments<ScheduleKind>
        label="Schedule frequency"
        value={s.kind}
        onChange={(kind) => update({ kind })}
        options={[
          { value: "daily", label: "Daily" },
          { value: "weekdays", label: "Weekdays" },
          { value: "interval", label: "Interval" },
          { value: "cron", label: "Cron" },
        ]}
      />
      <motion.div layout={!reduced} transition={reflowTransition(reduced)} className="schedule-controls">
        {(s.kind === "daily" || s.kind === "weekdays") && (
          <>
            {s.kind === "weekdays" && (
              <div className="weekday-list" role="group" aria-label="Run on weekdays">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant="outline"
                    aria-pressed={s.days.includes(day)}
                    onClick={() =>
                      update({ days: s.days.includes(day) ? s.days.filter((d) => d !== day) : [...s.days, day].sort() })
                    }
                  >
                    {DAYS[day].slice(0, 2)}
                  </Button>
                ))}
              </div>
            )}
            <div className="time-label">At these times</div>
            <div className="time-list">
              {s.times.map((time, i) => (
                <div className="time-control" key={i}>
                  <Input
                    aria-label={`Run time ${i + 1}`}
                    aria-describedby={error ? "schedule-error" : undefined}
                    aria-invalid={!!error}
                    type="text"
                    inputMode="numeric"
                    placeholder="HH:mm"
                    pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                    value={time}
                    onChange={(e) => update({ times: s.times.map((t, n) => (n === i ? e.target.value : t)) })}
                  />
                  {s.times.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove run time ${i + 1}`}
                      onClick={() => update({ times: s.times.filter((_, n) => n !== i) })}
                    >
                      <IconX size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => update({ times: [...s.times, "17:00"] })}
                disabled={s.times.length >= 4}
              >
                <IconPlus size={14} /> Add time
              </Button>
            </div>
          </>
        )}
        {s.kind === "interval" && (
          <>
            <div className="interval-controls">
              <Field label="Every" id="interval">
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max={s.unit === "minutes" ? 1440 : 24}
                  value={s.amount}
                  aria-invalid={!!error}
                  aria-describedby={error ? "schedule-error" : "interval-hint"}
                  onChange={(e) => update({ amount: e.target.value })}
                />
              </Field>
              <label className="sr-only" htmlFor="interval-unit">
                Interval unit
              </label>
              <select
                id="interval-unit"
                value={s.unit}
                onChange={(e) => update({ unit: e.target.value as Schedule["unit"] })}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
            <p id="interval-hint" className="field-hint">
              Starts when saved, then repeats at this interval.
            </p>
          </>
        )}
        {s.kind === "cron" && (
          <Field
            label="Cron expression"
            id="cron"
            hint="Minute · hour · day · month · weekday. Supports *, ranges, lists and steps."
          >
            <Input
              id="cron"
              className="mono"
              value={s.cron}
              aria-invalid={!!error}
              aria-describedby={error ? "schedule-error" : "cron-hint"}
              onChange={(e) => update({ cron: e.target.value })}
              placeholder="0 7,13 * * 1-5"
            />
          </Field>
        )}
        {error && (
          <p className="field-error" id="schedule-error" role="alert">
            {error}
          </p>
        )}
      </motion.div>
      <motion.div layout={!reduced} transition={reflowTransition(reduced)} className="next-preview">
        <div className="section-label">
          <h4>Next three runs</h4>
          <span className="mono">Local time · London</span>
        </div>
        <motion.ol layout={!reduced} transition={reflowTransition(reduced)} aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {preview.map((date, i) => (
              <motion.li
                layout={!reduced}
                transition={reflowTransition(reduced)}
                key={date.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="preview-index mono">0{i + 1}</span>
                <time dateTime={date.toISOString()}>
                  {formatRun(date)}{" "}
                  <span className="preview-zone">
                    {
                      new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, timeZoneName: "shortOffset" })
                        .formatToParts(date)
                        .find((p) => p.type === "timeZoneName")?.value
                    }
                  </span>
                </time>
                <IconArrowRight size={13} aria-hidden />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ol>
        {!preview.length && (
          <p className="muted">
            {error
              ? "Complete the schedule to preview its next runs."
              : "No matching runs in the next five years. Choose another schedule."}
          </p>
        )}
      </motion.div>
    </section>
  );
}

type Confirmation = { title: string; description: string; action: string; destructive?: boolean; confirm: () => void };
function Editor({
  helper,
  onClose,
  onSave,
  onDelete,
  requestConfirmation,
}: {
  helper: Helper;
  onClose: () => void;
  onSave: (helper: Helper) => void;
  onDelete: (id: string) => void;
  requestConfirmation: (c: Confirmation) => void;
}) {
  const [draft, setDraft] = useState<Helper>(() => structuredClone(helper));
  const [attempted, setAttempted] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const dirty = JSON.stringify(helper) !== JSON.stringify(draft);
  const nameError = !draft.name.trim()
    ? "Give this helper a name."
    : draft.name.length > 70
      ? "Keep the name to 70 characters or fewer."
      : "";
  const instructionsError =
    draft.instructions.trim().length < 15 ? "Add clear instructions of at least 15 characters." : "";
  const scheduleInvalid = scheduleError(draft.schedule) || !nextRuns(draft.schedule).length;
  const firstInput = useRef<HTMLInputElement>(null);
  const update = (next: Partial<Helper>) => {
    setDraft((d) => ({ ...d, ...next }));
    setSaveError(false);
  };
  const close = () => {
    if (!dirty) return onClose();
    requestConfirmation({
      title: "Discard your changes?",
      description: "Your edits haven’t been saved. The helper will keep its existing instructions and schedule.",
      action: "Discard changes",
      destructive: true,
      confirm: onClose,
    });
  };
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent
        className="helper-sheet"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLButtonElement>(helper.id ? `[data-edit="${helper.id}"]` : "[data-new-helper]")
              ?.focus(),
          );
        }}
        onOpenAutoFocus={() => requestAnimationFrame(() => firstInput.current?.focus())}
      >
        <SheetHeader className="editor-header">
          <span className="eyebrow">
            <IconClockPlay size={15} aria-hidden /> Helper settings
          </span>
          <SheetTitle>{helper.id ? "Edit helper" : "New helper"}</SheetTitle>
          <SheetDescription>Give Larkspur a clear task and a time to do it.</SheetDescription>
        </SheetHeader>
        <form
          className="editor-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setAttempted(true);
            if (nameError || instructionsError || scheduleInvalid) {
              requestAnimationFrame(() =>
                document.querySelector<HTMLElement>('.helper-sheet [aria-invalid="true"]')?.focus(),
              );
              return;
            }
            if (query.get("saveError") === "1" && !saveError) {
              setSaveError(true);
              return;
            }
            onSave({ ...draft, name: draft.name.trim(), instructions: draft.instructions.trim() });
          }}
        >
          <div className="editor-scroll" tabIndex={0} role="region" aria-label="Helper settings fields">
            <Field id="helper-name" label="Name" error={attempted ? nameError : undefined}>
              <Input
                ref={firstInput}
                id="helper-name"
                value={draft.name}
                aria-invalid={attempted && !!nameError}
                aria-describedby={attempted && nameError ? "helper-name-error" : undefined}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="For example, Climate watch"
              />
            </Field>
            <Field
              id="instructions"
              label="Instructions"
              hint="Say what to read, when to file a task, and what the task should include."
              error={attempted ? instructionsError : undefined}
            >
              <Textarea
                id="instructions"
                rows={5}
                value={draft.instructions}
                aria-invalid={attempted && !!instructionsError}
                aria-describedby={attempted && instructionsError ? "instructions-error" : "instructions-hint"}
                onChange={(e) => update({ instructions: e.target.value })}
                placeholder="Read the sensor hub. File a task when…"
              />
            </Field>
            <Field id="area" label="File tasks in">
              <select id="area" value={draft.area} onChange={(e) => update({ area: e.target.value })}>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <SchedulePicker value={draft.schedule} onChange={(schedule) => update({ schedule })} />
            <p className="editor-note">
              <IconInfoCircle size={16} aria-hidden />
              <span>
                {helper.id
                  ? "Saving changes won’t interrupt a running helper."
                  : "New helpers start paused. Resume the schedule or choose Run now when you’re ready."}
              </span>
            </p>
            {saveError && (
              <div className="notice danger" role="alert">
                <IconAlertTriangle size={17} />
                <span>Couldn’t save the helper. Your draft is still here. Try saving again.</span>
              </div>
            )}
          </div>
          <footer className="editor-footer">
            <span className="muted draft-state">{dirty ? "Unsaved changes" : "No changes yet"}</span>
            <div className="editor-actions">
              {helper.id && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="danger-text"
                  aria-label="Delete helper"
                  onClick={() =>
                    requestConfirmation({
                      title: `Delete ${helper.name}?`,
                      description:
                        "Its schedule will be removed. Run history and tasks already filed will stay. This can’t be undone.",
                      action: "Delete helper",
                      destructive: true,
                      confirm: () => onDelete(helper.id),
                    })
                  }
                >
                  <IconTrash size={16} />
                </Button>
              )}
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">{saveError ? "Try saving again" : "Save helper"}</Button>
            </div>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
function RunDetail({
  run,
  helper,
  live,
  onStart,
  onCancel,
  onBack,
  backLabel,
  onTask,
}: {
  run: Run;
  helper?: Helper;
  live: boolean;
  onStart: () => void;
  onCancel: () => void;
  onBack: () => void;
  backLabel: string;
  onTask: (name: string) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const reduced = !!useReducedMotion();
  const [following, setFollowing] = useState(true);
  const batches = logsFor(run).slice(0, run.batches);
  useEffect(() => {
    if (pinned.current && viewport.current)
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: "instant" });
  }, [run.batches]);
  return (
    <div className="run-page">
      <Button variant="ghost" className="back-button" onClick={onBack}>
        <IconArrowLeft size={16} /> {backLabel}
      </Button>
      <header className="detail-heading">
        <div>
          <div className="eyebrow">
            Helper run <span className="mono">/ {run.id}</span>
          </div>
          <h1>{run.name}</h1>
          <p>
            <span className="mono">{run.start}</span>
            <span className="meta-dot">·</span>
            {run.id === "run-106" || Number(run.id.split("-")[1]) > 106 ? "Run manually by Jane" : "Scheduled run"}
          </p>
        </div>
        <div className="detail-actions">
          <Status state={run.status} duration={run.duration} />
          {run.status === "running" && (
            <Button variant="outline" onClick={onCancel}>
              <IconSquare size={13} /> Cancel run
            </Button>
          )}
        </div>
      </header>
      <div className="run-context">
        <IconFolder size={15} aria-hidden />
        <span>{helper?.area ?? "Area no longer available"}</span>
        <span className="meta-dot">·</span>
        <span className="muted">{helper?.source ?? "Helper deleted"}</span>
        <span className="context-duration mono">{elapsed(run.duration)}</span>
      </div>
      {run.status === "failed" && (
        <div className="notice danger">
          <IconAlertTriangle size={18} />
          <div>
            <strong>This run stopped before filing any tasks.</strong>
            <p>
              {run.helperId === "climate-watch"
                ? "The sensor hub didn’t answer three times. Larkspur paused the schedule until you resume it."
                : "Probe 3 didn’t answer. The schedule is still on; the next run is today at 12:00."}
            </p>
          </div>
        </div>
      )}
      {run.status !== "running" && (
        <section className="run-summary" aria-labelledby="summary-heading">
          <div className="summary-icon">
            {run.status === "completed" ? <IconCheck size={20} /> : <IconInfoCircle size={20} />}
          </div>
          <div>
            <h2 id="summary-heading">
              {run.tasks.length ? `${run.tasks.length} task${run.tasks.length > 1 ? "s" : ""} filed` : "No tasks filed"}
            </h2>
            <p>
              {run.status === "completed"
                ? "Filed by Larkspur, with the original source attached."
                : "Run history stays available in this example until reload."}
            </p>
            {run.tasks.map((task) => (
              <button className="filed-task" key={task} onClick={() => onTask(task)}>
                <IconLayoutBoard size={15} />
                <span>{task}</span>
                <IconArrowRight size={14} />
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="log-panel" aria-labelledby="log-heading">
        <div className="log-heading">
          <h2 id="log-heading">
            <IconTool size={16} aria-hidden /> Run log
          </h2>
          {run.status === "running" ? (
            <Button size="sm" variant={live ? "ghost" : "outline"} onClick={onStart}>
              {live ? (
                <>
                  <IconPlayerPause size={13} /> Pause preview
                </>
              ) : (
                <>
                  <IconPlayerPlay size={13} /> Start live preview
                </>
              )}
            </Button>
          ) : (
            <span className="muted">{run.status === "completed" ? "Run activity" : "Run ended"}</span>
          )}
        </div>
        <div
          ref={viewport}
          className="log-viewport"
          role="log"
          aria-label="Helper run activity"
          aria-live="polite"
          tabIndex={0}
          onScroll={() => {
            const el = viewport.current!;
            pinned.current = el.scrollHeight - el.clientHeight - el.scrollTop < 40;
            setFollowing(pinned.current);
          }}
        >
          <div className="log-start">
            <span className="log-marker">
              <IconClockPlay size={16} />
            </span>
            <div>
              <strong>{run.name} started</strong>
              <p>{helper?.instructions ?? "Instructions are no longer available."}</p>
            </div>
          </div>
          {batches.map((batch, i) => (
            <motion.div
              key={`${run.id}-batch-${i}`}
              initial={i === 0 ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14 }}
              className="log-batch"
            >
              <div className="batch-time mono">00:{String(i * 12 + 2).padStart(2, "0")}</div>
              <div className="batch-content">
                {batch.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
                <Collapsible className="tool-activity">
                  <CollapsibleTrigger className="tool-trigger">
                    <IconChevronRight size={13} className="disclosure-chevron" />
                    <IconTool size={14} />
                    <span>
                      {i === 0
                        ? `Read ${helper?.source.toLowerCase() ?? "source"}`
                        : i === 1
                          ? "Find matching tasks"
                          : i === 2
                            ? "File tasks with source"
                            : "Save run summary"}
                    </span>
                    <span className={`tool-result ${run.status === "failed" ? "danger-text" : ""}`}>
                      {run.status === "failed" ? (
                        <>
                          <IconAlertTriangle size={12} /> Timed out
                        </>
                      ) : (
                        <>
                          <IconCheck size={12} /> Done
                        </>
                      )}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="tool-output mono">
                      {run.status === "failed"
                        ? "source.read → timeout after 18s\nNo task changes saved."
                        : i === 0
                          ? `source.read\nEntries received: 3\nSource: ${helper?.source ?? "Saved source"}`
                          : i === 1
                            ? "tasks.search\nChecked for duplicate source references.\nNo duplicate tasks found."
                            : `tasks.write\nArea: ${helper?.area ?? "Saved area"}\nSource attached: yes\nChanges saved locally.`}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </motion.div>
          ))}
          {run.status === "running" && (
            <div className="working-line">
              <span className={live && !reduced ? "live-dot" : "static-dot"} />
              <span>
                {live ? "Reading and filing work…" : "Live preview is paused. Start it to see the next batch."}
              </span>
            </div>
          )}
          {run.status === "cancelled" && (
            <p className="cancelled-note">
              <IconSquare size={14} /> Cancelled by Jane. Any tasks already filed have been kept.
            </p>
          )}
        </div>
        {run.status === "running" && (
          <div className="log-follow">
            <span className="muted">Updates arrive in small batches</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                pinned.current = true;
                setFollowing(true);
                viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: "instant" });
              }}
            >
              {following ? (
                <>
                  <IconCheck size={13} /> Following latest
                </>
              ) : (
                <>
                  Jump to latest <IconChevronDown size={13} />
                </>
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [helpers, setHelpers] = useState<Helper[]>(query.get("state") === "empty" ? [] : seededHelpers);
  const [runs, setRuns] = useState<Run[]>(query.get("state") === "empty" ? [] : initialRuns);
  const [view, setView] = useState(query.get("view") === "history" ? "history" : "helpers");
  const [selectedRun, setSelectedRun] = useState<string | null>(
    query.get("run") ?? (query.get("view") === "run" ? "run-106" : null),
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [editor, setEditor] = useState<Helper | null>(() =>
    query.get("edit")
      ? (seededHelpers.find((h) => h.id === query.get("edit")) ?? null)
      : query.get("new") === "1"
        ? blankHelper()
        : null,
  );
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [filter, setFilter] = useState("all");
  const [area, setArea] = useState("");
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(query.get("live") === "1");
  const [error, setError] = useState(query.get("state") === "error");
  const [toast, setToast] = useState("");
  const [signIn, setSignIn] = useState<Helper | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] = useState("all");
  const reduced = !!useReducedMotion();
  const counter = useRef(106);
  const helperCounter = useRef(6);
  const confirmationOrigin = useRef<HTMLElement | null>(null);
  const requestConfirmation = (c: Confirmation) => {
    confirmationOrigin.current = document.activeElement as HTMLElement;
    setConfirmation(c);
  };
  const elapsedTick = useRef(0);
  const updateUrl = (values: Record<string, string | null>) => {
    const u = new URL(window.location.href);
    Object.entries(values).forEach(([key, value]) =>
      value === null ? u.searchParams.delete(key) : u.searchParams.set(key, value),
    );
    window.history.replaceState({}, "", u);
  };
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      elapsedTick.current++;
      setRuns((current) =>
        current.map((r) => {
          if (r.status !== "running") return r;
          const batch = elapsedTick.current % 3 === 0 ? r.batches + 1 : r.batches;
          const done = batch > 4;
          const helper = helpers.find((h) => h.id === r.helperId);
          return {
            ...r,
            duration: r.duration + 1,
            batches: Math.min(4, batch),
            status: done ? "completed" : "running",
            tasks: batch >= 3 && helper ? tasksFor(helper).slice(0, batch >= 4 ? undefined : 1) : r.tasks,
          };
        }),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [live, helpers]);
  useEffect(() => {
    if (live && !runs.some((r) => r.status === "running")) {
      setLive(false);
      setHelpers((list) =>
        list.map((h) => {
          const latest = runs.find((r) => r.helperId === h.id);
          return latest?.status === "completed" && ["running", "failed"].includes(h.state)
            ? { ...h, state: "scheduled", reason: undefined }
            : h;
        }),
      );
    }
  }, [runs, live]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const openEditor = (h: Helper) => {
    setEditor(h);
    updateUrl({ edit: h.id || null, new: h.id ? null : "1" });
  };
  const closeEditor = () => {
    setEditor(null);
    updateUrl({ edit: null, new: null });
  };
  const openRun = (id: string) => {
    setDirection(1);
    setSelectedRun(id);
    updateUrl({ run: id });
  };
  const back = () => {
    setDirection(-1);
    setSelectedRun(null);
    updateUrl({ run: null });
  };
  const changeView = (next: string) => {
    setDirection(-1);
    setSelectedRun(null);
    setView(next);
    setSearch("");
    updateUrl({ view: next, run: null });
  };
  const resume = (h: Helper) => {
    setHelpers((list) =>
      list.map((item) => (item.id === h.id ? { ...item, state: "scheduled", reason: undefined } : item)),
    );
    setToast(`${h.name} resumed. Next run: ${formatRun(nextRuns(h.schedule)[0], true)}.`);
  };
  const cancelRun = (r: Run) =>
    requestConfirmation({
      title: `Cancel ${r.name}?`,
      description: "The current run will stop. Any tasks already filed will stay, and its schedule won’t change.",
      action: "Cancel run",
      destructive: true,
      confirm: () => {
        setRuns((list) => list.map((item) => (item.id === r.id ? { ...item, status: "cancelled" } : item)));
        setHelpers((list) =>
          list.map((h) => (h.id === r.helperId && h.state === "running" ? { ...h, state: "scheduled" } : h)),
        );
        setToast("Run cancelled. The schedule is unchanged.");
      },
    });
  const runNow = (h: Helper) => {
    if (h.state === "action") {
      setSignIn(h);
      return;
    }
    const active = runs.find((r) => r.helperId === h.id && r.status === "running");
    if (active) return openRun(active.id);
    counter.current++;
    const r: Run = {
      id: `run-${counter.current}`,
      helperId: h.id,
      name: h.name,
      status: "running",
      start: "10 Nov, 10:00",
      duration: 0,
      batches: 1,
      tasks: [],
    };
    elapsedTick.current = 0;
    setRuns((list) => [r, ...list]);
    setLive(true);
    openRun(r.id);
  };
  const activeRun = selectedRun ? runs.find((r) => r.id === selectedRun) : undefined;
  const visibleHelpers = helpers.filter(
    (h) =>
      (!area || h.area === area) &&
      `${h.name} ${h.instructions} ${h.area}`.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "attention" && ["auto-paused", "failed", "action"].includes(h.state)) ||
        (filter === "paused" && ["auto-paused", "paused"].includes(h.state))),
  );
  const filteredRuns = runs.filter(
    (r) =>
      (!area || helpers.find((h) => h.id === r.helperId)?.area === area) &&
      r.name.toLowerCase().includes(search.toLowerCase()) &&
      (historyStatus === "all" || r.status === historyStatus),
  );
  const pageHeading = (
    <header className="page-heading">
      <div>
        <div className="eyebrow">Fernbrook Greenhouse</div>
        <h1>Helpers</h1>
        <p>Scheduled work and recent runs.</p>
      </div>
      <Button data-new-helper onClick={() => openEditor(blankHelper())}>
        <IconPlus size={16} /> New helper
      </Button>
    </header>
  );
  return (
    <div className="app-shell">
      <aside className="rail">
        <LarkspurWordmark size={30} />
        <div className="workspace">
          <span className="workspace-symbol">
            <IconLeaf size={18} />
          </span>
          <div>
            Fernbrook<span>Greenhouse workspace</span>
          </div>
          <IconChevronDown size={14} className="muted" />
        </div>
        <div className="rail-label">Workspace</div>
        <nav aria-label="Workspace">
          <button
            className={`rail-nav ${view === "helpers" ? "selected" : ""}`}
            aria-current={view === "helpers" ? "page" : undefined}
            onClick={() => {
              changeView("helpers");
              setArea("");
            }}
          >
            <IconClockPlay size={19} />
            <span>Helpers</span>
            <span className="rail-count mono">{helpers.length}</span>
          </button>
          <button
            className={`rail-nav ${view === "history" ? "selected" : ""}`}
            aria-current={view === "history" ? "page" : undefined}
            onClick={() => changeView("history")}
          >
            <IconHistory size={19} />
            <span>Run history</span>
          </button>
        </nav>
        <div className="rail-label area-label">Areas</div>
        <nav aria-label="Filter by area">
          {AREAS.map((a) => (
            <button
              key={a}
              className={`rail-nav area-nav ${area === a ? "area-active" : ""}`}
              onClick={() => {
                setArea(area === a ? "" : a);
                setSelectedRun(null);
              }}
            >
              <IconFolder size={16} />
              <span>{a}</span>
            </button>
          ))}
        </nav>
        <div className="rail-footnote">
          <IconInfoCircle size={16} />
          <p>Pause a schedule or run a helper once.</p>
        </div>
        <div className="rail-person">
          <span className="avatar">JD</span>
          <div>
            Jane Doe<small>Fernbrook owner</small>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <LarkspurWordmark size={26} />
          </div>
          <div className="breadcrumb">
            <IconClockPlay size={16} />
            <span>Workspace</span>
            <IconChevronRight size={13} />
            <strong>Helpers</strong>
          </div>
          <div className="topbar-right">
            <span className="local-state">
              <span /> Demo · resets on reload
            </span>
            <span className="mono today">Tue 10 Nov 2026</span>
          </div>
        </header>
        <main>
          <PushStack
            pageKey={selectedRun ? `run-${selectedRun}` : "list"}
            direction={direction}
            className="work-stack"
            pageClassName="work-page"
          >
            {selectedRun ? (
              activeRun ? (
                <RunDetail
                  run={activeRun}
                  helper={helpers.find((h) => h.id === activeRun.helperId)}
                  live={live}
                  onStart={() => setLive(!live)}
                  onCancel={() => cancelRun(activeRun)}
                  onBack={back}
                  backLabel={view === "history" ? "Back to run history" : "Back to helpers"}
                  onTask={setTask}
                />
              ) : (
                <div className="empty-state">
                  <IconAlertTriangle size={26} />
                  <h1>This run isn’t available</h1>
                  <p>It may not have been saved on this device.</p>
                  <Button onClick={back}>Back to helpers</Button>
                </div>
              )
            ) : (
              <>
                {pageHeading}
                <div className="surface-tabs">
                  <Segments
                    value={view}
                    label="Helpers views"
                    onChange={changeView}
                    options={[
                      {
                        value: "helpers",
                        label: (
                          <>
                            <IconClockPlay size={15} /> Helpers <span className="tab-count mono">{helpers.length}</span>
                          </>
                        ),
                      },
                      {
                        value: "history",
                        label: (
                          <>
                            <IconHistory size={15} /> Run history
                          </>
                        ),
                      },
                    ]}
                  />
                  <span className="timezone">
                    <IconClock size={14} /> {ZONE}
                  </span>
                </div>
                <SiblingTransition pageKey={view} focusHeading={false}>
                  {view === "helpers" ? (
                    <>
                      <div className="notice introduction">
                        <IconInfoCircle size={17} />
                        <p>
                          Helpers read your connected sources and file tasks in an area.{" "}
                          <strong>New helpers start paused. Resume a schedule or choose Run now.</strong>
                        </p>
                      </div>
                      <div className="list-toolbar">
                        <div className="mobile-area-filter">
                          <label className="sr-only" htmlFor="mobile-area">
                            Filter helpers by area
                          </label>
                          <select id="mobile-area" value={area} onChange={(e) => setArea(e.target.value)}>
                            <option value="">All areas</option>
                            {AREAS.map((a) => (
                              <option key={a}>{a}</option>
                            ))}
                          </select>
                        </div>
                        <div className="filters" role="group" aria-label="Filter helpers">
                          {[
                            { id: "all", name: "All helpers" },
                            { id: "attention", name: "Needs attention" },
                            { id: "paused", name: "Paused" },
                          ].map((f) => (
                            <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                              {f.name}
                            </button>
                          ))}
                        </div>
                        <div className="search-control">
                          <IconSearch size={15} />
                          <Input
                            aria-label="Search helpers"
                            placeholder="Find a helper…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {area && (
                        <div className="area-filter">
                          <IconFolder size={14} /> {area}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Clear area filter"
                            onClick={() => setArea("")}
                          >
                            <IconX size={13} />
                          </Button>
                        </div>
                      )}
                      {error ? (
                        <div className="empty-state error-state">
                          <IconAlertTriangle size={27} />
                          <h2>Couldn’t load your helpers</h2>
                          <p>The local connection was interrupted. Your helpers and their schedules haven’t changed.</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setError(false);
                              updateUrl({ state: null });
                            }}
                          >
                            <IconRefresh size={15} /> Try again
                          </Button>
                        </div>
                      ) : !helpers.length ? (
                        <div className="empty-state">
                          <span className="empty-glyph">
                            <IconClockPlay size={30} />
                          </span>
                          <h2>No helpers yet</h2>
                          <p>
                            Give your first helper clear instructions, choose an area, and set a schedule. You can try
                            it once before turning it on.
                          </p>
                          <Button onClick={() => openEditor(blankHelper())}>
                            <IconPlus size={16} /> Set up your first helper
                          </Button>
                        </div>
                      ) : !visibleHelpers.length ? (
                        <div className="empty-state">
                          <IconSearch size={26} />
                          <h2>No helpers match</h2>
                          <p>Try another name or clear your filters.</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearch("");
                              setFilter("all");
                              setArea("");
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <div className="helper-list">
                          <div className="list-label">
                            <span>Helper & schedule</span>
                            <span>Actions</span>
                          </div>
                          <AnimatePresence initial={false}>
                            {visibleHelpers.map((h) => {
                              const running = runs.find((r) => r.helperId === h.id && r.status === "running");
                              const state = running ? "running" : h.state === "running" ? "scheduled" : h.state;
                              const last = runs.find((r) => r.helperId === h.id);
                              const next = nextRuns(h.schedule)[0];
                              return (
                                <motion.article
                                  layout={!reduced}
                                  transition={reflowTransition(reduced)}
                                  key={h.id}
                                  exit={{ opacity: 0 }}
                                  className={`helper-row helper-${state}`}
                                >
                                  <div className="helper-symbol">
                                    <IconClockPlay size={21} />
                                  </div>
                                  <div className="helper-info">
                                    <div className="helper-title">
                                      <button data-edit={h.id} onClick={() => openEditor(h)}>
                                        {h.name}
                                      </button>
                                      <Status
                                        state={state === "failed" ? "last-failed" : state}
                                        duration={running?.duration}
                                      />
                                    </div>
                                    <p className="helper-description">
                                      {h.instructions.split(". ")[0].replace(/\.+$/, "")}.
                                    </p>
                                    <div className="helper-meta">
                                      <span>
                                        <IconFolder size={12} />
                                        {h.area}
                                      </span>
                                      <span className="schedule-chip">
                                        <IconClock size={12} />
                                        {describeSchedule(h.schedule)}
                                      </span>
                                    </div>
                                    <div
                                      className={`helper-reason ${state === "failed" || state === "action" ? "reason-warning" : ""}`}
                                    >
                                      {running ? (
                                        <>
                                          <span className="static-dot" />
                                          <span>Reading {h.source.toLowerCase()} · </span>
                                          <button onClick={() => openRun(running.id)}>
                                            View live run <IconArrowRight size={12} />
                                          </button>
                                        </>
                                      ) : ["auto-paused", "paused", "failed", "action"].includes(state) ? (
                                        <>{h.reason}</>
                                      ) : (
                                        <>
                                          <span>
                                            Next run <strong className="mono">{formatRun(next, true)}</strong>
                                          </span>
                                          {last && (
                                            <>
                                              <span className="meta-dot">·</span>
                                              <button onClick={() => openRun(last.id)}>Last run {last.status}</button>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="helper-actions">
                                    {running ? (
                                      <>
                                        <Button variant="outline" onClick={() => openRun(running.id)}>
                                          View run <IconArrowRight size={14} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label={`Cancel ${h.name}`}
                                          onClick={() => cancelRun(running)}
                                        >
                                          <IconSquare size={14} />
                                        </Button>
                                      </>
                                    ) : state === "action" ? (
                                      <Button variant="outline" onClick={() => setSignIn(h)}>
                                        <IconLogin2 size={15} /> Sign in
                                      </Button>
                                    ) : (
                                      <>
                                        <Button variant="outline" onClick={() => runNow(h)}>
                                          <IconPlayerPlay size={14} /> Run now
                                        </Button>
                                        {["auto-paused", "paused"].includes(state) ? (
                                          <Button variant="ghost" className="resume-button" onClick={() => resume(h)}>
                                            Resume <IconArrowRight size={13} />
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Pause ${h.name}`}
                                            onClick={() =>
                                              requestConfirmation({
                                                title: `Pause ${h.name}?`,
                                                description:
                                                  "Scheduled runs will stop until you resume this helper. Its instructions and run history will stay.",
                                                action: "Pause helper",
                                                confirm: () => {
                                                  setHelpers((list) =>
                                                    list.map((item) =>
                                                      item.id === h.id
                                                        ? {
                                                            ...item,
                                                            state: "paused",
                                                            reason:
                                                              "Jane paused this helper today. Resume it when you’re ready.",
                                                          }
                                                        : item,
                                                    ),
                                                  );
                                                  setToast(`${h.name} paused.`);
                                                },
                                              })
                                            }
                                          >
                                            <IconPlayerPause size={15} />
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </motion.article>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="history-heading">
                        <div>
                          <h2>Run history</h2>
                          <p>See what each helper read, changed, or couldn’t finish.</p>
                        </div>
                        <label className="sr-only" htmlFor="history-status">
                          Filter run status
                        </label>
                        <select
                          id="history-status"
                          value={historyStatus}
                          onChange={(e) => setHistoryStatus(e.target.value)}
                        >
                          <option value="all">All statuses</option>
                          <option value="running">Running</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="history-table">
                        <div className="history-column-labels">
                          <span>Helper</span>
                          <span>Started</span>
                          <span>Result</span>
                          <span>Duration</span>
                          <span />
                        </div>
                        {filteredRuns.map((r) => (
                          <button className="history-row" key={r.id} onClick={() => openRun(r.id)}>
                            <span className="history-name">
                              <IconClockPlay size={17} />
                              <span>
                                {r.name}
                                <small className="mono">{r.id}</small>
                              </span>
                            </span>
                            <span className="mono history-time">{r.start}</span>
                            <span className="history-result">
                              <Status state={r.status} />
                              {r.tasks.length > 0 && <small>{r.tasks.length} tasks filed</small>}
                            </span>
                            <span className="mono history-duration">{elapsed(r.duration)}</span>
                            <IconChevronRight size={16} />
                          </button>
                        ))}
                        {!filteredRuns.length && (
                          <div className="empty-state">
                            <IconHistory size={28} />
                            <h2>No runs here yet</h2>
                            <p>Run a helper or choose another status to see its activity.</p>
                            <Button variant="outline" onClick={() => setHistoryStatus("all")}>
                              Show all statuses
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </SiblingTransition>
                <footer className="workspace-footer">
                  <span>
                    <IconInfoCircle size={14} /> Example workspace · simulated sources
                  </span>
                  {runs.some((r) => r.status === "running") && (
                    <Button size="sm" variant="ghost" onClick={() => setLive(!live)}>
                      {live ? (
                        <>
                          <IconPlayerPause size={12} /> Pause live preview
                        </>
                      ) : (
                        <>
                          <IconPlayerPlay size={12} /> Start live preview
                        </>
                      )}
                    </Button>
                  )}
                </footer>
              </>
            )}
          </PushStack>
        </main>
      </div>
      {editor && (
        <Editor
          key={editor.id || "new"}
          helper={editor}
          onClose={closeEditor}
          requestConfirmation={requestConfirmation}
          onSave={(h) => {
            const saved = {
              ...h,
              id: h.id || `helper-${++helperCounter.current}`,
              state: h.id ? h.state : ("paused" as const),
              reason: h.id ? h.reason : "Created by Jane. Resume the schedule when you’re ready.",
            };
            setHelpers((list) => (h.id ? list.map((item) => (item.id === h.id ? saved : item)) : [...list, saved]));
            closeEditor();
            setToast(`${h.name} saved${h.id ? "." : ". Its schedule starts paused."}`);
          }}
          onDelete={(id) => {
            setHelpers((list) => list.filter((h) => h.id !== id));
            setRuns((list) =>
              list.map((r) => (r.helperId === id && r.status === "running" ? { ...r, status: "cancelled" } : r)),
            );
            closeEditor();
            setToast("Helper deleted. Filed tasks and run history stay in this example.");
          }}
        />
      )}
      <AlertDialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            if (confirmationOrigin.current?.isConnected) {
              event.preventDefault();
              confirmationOrigin.current.focus();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmation?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {confirmation?.action === "Discard changes" ? "Keep editing" : "Keep it"}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={confirmation?.destructive ? "destructive" : "default"}
              onClick={() => {
                confirmation?.confirm();
                setConfirmation(null);
              }}
            >
              {confirmation?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!signIn}
        onOpenChange={(open) => {
          if (!open) setSignIn(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <span className="sign-in-icon">
              <IconLogin2 size={24} />
            </span>
            <DialogTitle>Reconnect the delivery ledger</DialogTitle>
            <DialogDescription>
              Your saved sign-in expired. Reconnect to let Delivery notes read upcoming deliveries. It won’t send
              messages or change your ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="account-preview">
            <span className="avatar">JD</span>
            <div>
              Jane Doe<small>Fernbrook Greenhouse · ledger account</small>
            </div>
            <IconCheck size={17} />
          </div>
          <p className="muted">This example simulates a successful sign-in. No credentials are requested.</p>
          <Button
            onClick={() => {
              if (signIn) resume(signIn);
              setSignIn(null);
            }}
          >
            <IconLogin2 size={16} /> Reconnect example account
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!task}
        onOpenChange={(open) => {
          if (!open) setTask(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{task}</DialogTitle>
            <DialogDescription>
              Filed by {activeRun?.name ?? "Larkspur"} in{" "}
              {helpers.find((h) => h.id === activeRun?.helperId)?.area ?? "the greenhouse"}.
            </DialogDescription>
          </DialogHeader>
          <p>The original source is attached. Review the details and assign the next step from your task board.</p>
          <div className="notice">
            <IconCheck size={17} />
            <span>Open · Normal priority · Source attached</span>
          </div>
          <Button variant="outline" onClick={() => setTask(null)}>
            Back to run
          </Button>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reflowTransition(reduced)}
          >
            <IconCheck size={17} />
            <span>{toast}</span>
            <Button variant="ghost" size="icon-sm" aria-label="Dismiss notification" onClick={() => setToast("")}>
              <IconX size={14} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function blankHelper(): Helper {
  return {
    id: "",
    name: "",
    instructions: "",
    area: AREAS[0],
    source: "Connected source",
    schedule: structuredClone(defaultSchedule),
    state: "paused",
  };
}

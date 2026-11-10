import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconLayoutSidebar,
  IconList,
  IconMoon,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSeedling,
  IconSun,
  IconTable,
  IconCalendarWeek,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Input } from "@sift-design/ui/input";
import { Label } from "@sift-design/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@sift-design/ui/sheet";
import { setTheme } from "@sift-design/ui/lib/theme";
import { useIsMobile } from "@sift-design/ui/hooks/use-mobile";
import { DisclosureBody } from "@sift-design/ui/collapsible";
import { SiblingTransition } from "@sift-design/ui/page-transition";
import { spring, selectionSpring, reflowTransition, pressable } from "@sift-design/tokens/motion";
import { LarkspurWordmark } from "../../_shared/brand";
import {
  CATEGORIES,
  TODAY,
  TASKS,
  INITIAL_SESSIONS,
  addDays,
  clock,
  color,
  dayLabel,
  duration,
  elapsed,
  minutes,
  weekDays,
  type Session,
} from "./data";

const query = new URLSearchParams(location.search);
const initialDay = query.get("state") === "empty" ? "2026-11-08" : query.get("day") || TODAY;
const patchURL = (patch: Record<string, string>) => {
  const url = new URL(location.href);
  Object.entries(patch).forEach(([k, v]) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k)));
  history.replaceState(null, "", url);
};
function Swatch({ category }: { category: number }) {
  return <span className="swatch" style={{ background: color(category) }} aria-hidden="true" />;
}
function Counter({ value }: { value: string | number }) {
  return (
    <span className="counter">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
function Choice({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: ReactNode }[];
  onChange: (v: string) => void;
  label: string;
}) {
  const reduced = !!useReducedMotion();
  return (
    <LayoutGroup>
      <div className="choice" role="group" aria-label={label}>
        {options.map((o) => (
          <motion.button
            {...pressable(reduced)}
            key={o.value}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {value === o.value && (
              <motion.span
                className="choice-selection"
                layoutId={reduced ? undefined : "selection"}
                transition={reduced ? { duration: 0 } : selectionSpring}
              />
            )}
            <span>{o.label}</span>
          </motion.button>
        ))}
      </div>
    </LayoutGroup>
  );
}

type Tip = { x: number; y: number; title: string; detail: string; category: number };
function Tooltip({ tip }: { tip: Tip | null }) {
  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          id="chart-tip"
          role="tooltip"
          className="chart-tip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          style={{ left: Math.max(12, Math.min(innerWidth - 292, tip.x - 140)), top: Math.max(8, tip.y - 84) }}
        >
          <strong>{tip.title}</strong>
          <span>
            <Swatch category={tip.category} />
            {tip.detail}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const reduced = !!useReducedMotion();
  const mobile = useIsMobile();
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [day, setDay] = useState(initialDay);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [view, setView] = useState(query.get("view") === "week" ? "week" : "day");
  const [representation, setRepresentation] = useState(query.get("display") === "table" ? "table" : "rail");
  const [filter, setFilter] = useState<number | null>(null);
  const [hover, setHover] = useState("");
  const [tip, setTip] = useState<Tip | null>(null);
  const [paused, setPaused] = useState(query.get("state") === "paused");
  const [pausedByTracker, setPausedByTracker] = useState(query.get("state") === "paused");
  const [growMarks, setGrowMarks] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const draftDirty = useRef(false);
  const [discard, setDiscard] = useState(false);
  const [editing, setEditing] = useState<Session | null>(() =>
    query.get("open") === "edit" ? INITIAL_SESSIONS.find((s) => s.id === "today-8")! : null,
  );
  const [task, setTask] = useState(query.get("task") || "");
  const [notice, setNotice] = useState("");
  const lastTrigger = useRef<HTMLElement | null>(null);
  const current = sessions.filter((s) => s.day === day);
  const ribbonStart = Math.min(420, ...current.map((s) => Math.floor(s.from / 60) * 60));
  const ribbonEnd = Math.max(1080, ...current.map((s) => Math.ceil(s.to / 60) * 60));
  const ribbonSpan = ribbonEnd - ribbonStart;
  // Budget at least 90px per mono label on mobile; the current-time label
  // lives above the ribbon, separate from the clock ticks below it.
  const tickStep = mobile ? 240 : 120;
  const ribbonTicks = [
    ribbonStart,
    ...Array.from({ length: Math.ceil(ribbonSpan / tickStep) }, (_, i) => ribbonStart + (i + 1) * tickStep).filter(
      (t) => t < ribbonEnd - tickStep / 2,
    ),
    ribbonEnd,
  ];
  const days = weekDays(day);
  const period = view === "week" ? sessions.filter((s) => days.includes(s.day)) : current;
  const shown = filter === null ? current : current.filter((s) => s.category === filter);
  const totals = CATEGORIES.map((_, category) =>
    period.filter((s) => s.category === category).reduce((sum, s) => sum + s.to - s.from, 0),
  );
  function navigate(next: string) {
    if (next > TODAY) return;
    setDirection(next >= day ? 1 : -1);
    setDay(next);
    setGrowMarks(true);
    setTip(null);
    setHover("");
    setFilter(null);
    patchURL({ day: next, state: "" });
  }
  function openEdit(session: Session, trigger: HTMLElement) {
    lastTrigger.current = trigger;
    setEditing({ ...session });
    patchURL({ open: "edit" });
  }
  function closeEdit(force = false) {
    if (!force && draftDirty.current) {
      setDiscard(true);
      return;
    }
    setEditing(null);
    setDiscard(false);
    draftDirty.current = false;
    patchURL({ open: "" });
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }
  function addSession(trigger: HTMLElement) {
    openEdit({ id: "", day, from: 780, to: 810, category: 0, title: "", task: "", source: "Added by you" }, trigger);
  }
  const nav = (
    <>
      <div className="rail-brand">
        <LarkspurWordmark />
        <span className="workspace-name">Fernbrook Greenhouse</span>
      </div>
      <div className="rail-person">
        <span className="avatar">JD</span>
        <span>
          Jane Doe<small>Personal workspace</small>
        </span>
      </div>
      <nav aria-label="Workspace">
        <a href="#time-spent" aria-current="page">
          <IconClock size={18} />
          Time spent
        </a>
        <div className="rail-section">Areas</div>
        {["Propagation house", "Polytunnel 2", "Retail benches", "Wholesale orders", "Maintenance"].map((n) => (
          <span className="area-name" key={n}>
            <IconSeedling size={16} />
            {n}
          </span>
        ))}
      </nav>
      <div className="rail-bottom">
        <IconCircleCheck size={16} />
        <span>Illustrative workspace</span>
      </div>
    </>
  );
  return (
    <div
      className="app-shell"
      onKeyDown={(e) => {
        if (e.key === "Escape") setTip(null);
      }}
    >
      <aside className="navigation-rail">{nav}</aside>
      <div className="workspace">
        <header className="workspace-header">
          <div className="breadcrumb">
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Open workspace navigation"
              onClick={() => setNavOpen(true)}
            >
              <IconLayoutSidebar />
            </Button>
            <span>Personal workspace</span>
            <span className="slash">/</span>
            <strong>Time spent</strong>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Change color theme"
            onClick={() => {
              const next = !dark;
              setTheme(next ? "dark" : "light");
              setDark(next);
              patchURL({ theme: next ? "dark" : "light" });
            }}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </Button>
        </header>
        <main id="time-spent">
          <div className="page-heading">
            <div>
              <h1>Time spent</h1>
              <p>A record of the work, not just the hours.</p>
            </div>
            <Button variant="outline" onClick={(e) => addSession(e.currentTarget)}>
              <IconPlus />
              Add time
            </Button>
          </div>
          <div className="period-toolbar">
            <Choice
              value={view}
              onChange={(v) => {
                setDirection(v === "week" ? 1 : -1);
                setView(v);
                setGrowMarks(false);
                setTip(null);
                patchURL({ view: v });
              }}
              label="Time period"
              options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
              ]}
            />
            <div className="day-navigation">
              <Button
                variant="ghost"
                size="icon"
                aria-label={view === "day" ? "Previous day" : "Previous week"}
                onClick={() => navigate(addDays(day, view === "day" ? -1 : -7))}
              >
                <IconChevronLeft />
              </Button>
              <span>
                {view === "day"
                  ? dayLabel(day, { day: "numeric", month: "long", year: "numeric" })
                  : `${dayLabel(days[0], { day: "numeric" })}–${dayLabel(days[6], { day: "numeric", month: "long", year: "numeric" })}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={view === "day" ? "Next day" : "Next week"}
                disabled={view === "day" ? day >= TODAY : addDays(days[0], 7) > TODAY}
                onClick={() => navigate(view === "day" ? addDays(day, 1) : addDays(days[0], 7))}
              >
                <IconChevronRight />
              </Button>
            </div>
            <Button
              className="today-button"
              variant="ghost"
              size="sm"
              disabled={day === TODAY}
              onClick={() => navigate(TODAY)}
            >
              Today
            </Button>
          </div>
          <LayoutGroup>
            <nav className="week-strip" aria-label="Choose a day">
              {days.map((d) => (
                <motion.button
                  {...pressable(reduced)}
                  key={d}
                  disabled={d > TODAY}
                  aria-current={d === day ? "date" : undefined}
                  aria-label={`${dayLabel(d, { weekday: "short" })} ${Number(d.slice(-2))}, ${dayLabel(d)}, ${duration(elapsed(sessions.filter((s) => s.day === d)))} recorded`}
                  onClick={() => navigate(d)}
                >
                  {d === day && (
                    <motion.span
                      className="day-selection"
                      layoutId={reduced ? undefined : "day-selection"}
                      transition={reduced ? { duration: 0 } : selectionSpring}
                    />
                  )}
                  <span>{dayLabel(d, { weekday: "short" })}</span> <strong>{Number(d.slice(-2))}</strong>
                  <span className="mini-track" aria-hidden="true">
                    {sessions
                      .filter((s) => s.day === d)
                      .map((s) => (
                        <i
                          key={s.id}
                          style={{
                            left: `${(s.from / 1440) * 100}%`,
                            width: `${((s.to - s.from) / 1440) * 100}%`,
                            background: color(s.category),
                          }}
                        />
                      ))}
                  </span>
                </motion.button>
              ))}
            </nav>
          </LayoutGroup>
          <div className="totals" aria-live="polite">
            <div>
              <strong>
                <Counter value={duration(elapsed(period))} />
              </strong>
              <span>recorded</span>
            </div>
            <div>
              <strong>
                <Counter value={period.length} />
              </strong>
              <span>sessions</span>
            </div>
            <div>
              <strong>
                <Counter value={new Set(period.map((s) => s.task).filter(Boolean)).size} />
              </strong>
              <span>linked tasks</span>
            </div>
            <span className="timezone">Europe/London</span>
          </div>
          <div className="filter-line">
            <span>Categories</span>
            <Button variant="ghost" size="sm" onClick={() => setFilter(null)} disabled={filter === null}>
              Show all
            </Button>
            <label className="texture-toggle">
              <input
                type="checkbox"
                onChange={(e) => document.documentElement.classList.toggle("textured", e.target.checked)}
              />
              Patterned marks
            </label>
          </div>
          <div className="legend" aria-label="Filter by category">
            {CATEGORIES.map((c, i) => (
              <button
                key={c}
                aria-pressed={filter === i}
                className={filter !== null && filter !== i ? "is-muted" : ""}
                onClick={() => setFilter(filter === i ? null : i)}
              >
                <Swatch category={i} />
                {c}
              </button>
            ))}
          </div>
          <SiblingTransition
            pageKey={view}
            direction={direction}
            focusHeading={false}
            className="period-frame"
            pageClassName="period-content"
          >
            <SiblingTransition pageKey={day} direction={direction} focusHeading={false} pageClassName="day-content">
              {view === "day" ? (
                <>
                  <section className="ribbon-section" aria-label="Sessions on a time axis">
                    <div className="section-line">
                      <h2>{day === TODAY ? "Today" : dayLabel(day, { weekday: "long" })}, at a glance</h2>
                      <span>
                        {clock(ribbonStart)}–{clock(ribbonEnd)}
                      </span>
                    </div>
                    <div className="ribbon-track">
                      {current.map((s) => (
                        <motion.span
                          key={s.id}
                          layout={!reduced}
                          transition={reflowTransition(reduced)}
                          className={`ribbon-hit ${hover === s.id ? "highlighted" : ""}`}
                          role="img"
                          tabIndex={0}
                          aria-label={`${s.title}, ${CATEGORIES[s.category]}, ${clock(s.from)} to ${clock(s.to)}, ${duration(s.to - s.from)}.`}
                          aria-describedby={tip && hover === s.id ? "chart-tip" : undefined}
                          style={{
                            left: `${((s.from - ribbonStart) / ribbonSpan) * 100}%`,
                            width: `${((s.to - s.from) / ribbonSpan) * 100}%`,
                            opacity: filter !== null && filter !== s.category ? 0.18 : 1,
                          }}
                          onMouseEnter={() => setHover(s.id)}
                          onMouseMove={(e) =>
                            setTip({
                              x: e.clientX,
                              y: e.currentTarget.getBoundingClientRect().top,
                              title: s.title,
                              detail: `${CATEGORIES[s.category]} · ${clock(s.from)}–${clock(s.to)} · ${duration(s.to - s.from)}`,
                              category: s.category,
                            })
                          }
                          onMouseLeave={() => {
                            setHover("");
                            setTip(null);
                          }}
                          onFocus={(e) => {
                            const r = e.currentTarget.getBoundingClientRect();
                            setHover(s.id);
                            setTip({
                              x: r.x + r.width / 2,
                              y: r.top,
                              title: s.title,
                              detail: `${CATEGORIES[s.category]} · ${clock(s.from)}–${clock(s.to)} · ${duration(s.to - s.from)}`,
                              category: s.category,
                            });
                          }}
                          onBlur={() => {
                            setHover("");
                            setTip(null);
                          }}
                        >
                          <motion.span
                            className="data-fill"
                            style={{ background: color(s.category), transformOrigin: "left" }}
                            initial={reduced ? { opacity: 0 } : growMarks ? { scaleX: 0 } : false}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={reduced ? { duration: 0.14 } : spring.smooth}
                          />
                        </motion.span>
                      ))}
                      {day === TODAY && (
                        <span className="now-marker" style={{ left: `${((860 - ribbonStart) / ribbonSpan) * 100}%` }}>
                          <i />
                          <span>14:20</span>
                        </span>
                      )}
                    </div>
                    <div className="hour-axis" aria-hidden="true">
                      {ribbonTicks.map((tick) => (
                        <span key={tick} style={{ left: `${((tick - ribbonStart) / ribbonSpan) * 100}%` }}>
                          {clock(tick)}
                        </span>
                      ))}
                    </div>
                    <div className="coverage-note">
                      <span className="coverage-key" />
                      Gaps have no recorded session.{day === TODAY && " Last checked at 14:20."}
                    </div>
                  </section>
                  {current.length > 0 && (
                    <CategoryBars totals={totals} filter={filter} reduced={reduced} grow={growMarks} />
                  )}
                </>
              ) : (
                <WeekChart
                  days={days}
                  sessions={sessions}
                  filter={filter}
                  reduced={reduced}
                  onDay={(d) => {
                    navigate(d);
                    setView("day");
                    patchURL({ view: "day" });
                  }}
                  onTip={setTip}
                />
              )}
            </SiblingTransition>
          </SiblingTransition>
          <div className={`tracker-notice ${paused ? "paused" : ""}`}>
            <span className="tracker-icon">
              {paused ? <IconPlayerPause size={17} /> : <IconCircleCheck size={17} />}
            </span>
            <div>
              <strong>{paused ? "Activity tracker is paused" : "Activity tracker is ready"}</strong>
              <p>
                {paused
                  ? pausedByTracker
                    ? "Larkspur couldn’t reach the sensor hub three times in a row. Resume when the hub is back."
                    : "Paused by you. Existing sessions stay here; resume to check activity again."
                  : "Next check at 15:00. Your recorded sessions stay editable."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPaused(!paused);
                setPausedByTracker(false);
                patchURL({ state: !paused ? "paused" : "" });
              }}
            >
              {paused ? (
                <>
                  <IconPlayerPlay />
                  Resume
                </>
              ) : (
                <>
                  <IconPlayerPause />
                  Pause
                </>
              )}
            </Button>
          </div>
          {view === "day" && (
            <>
              <div className="sessions-heading">
                <h2>
                  The day’s sessions <span>{shown.length}</span>
                </h2>
                <Choice
                  value={representation}
                  onChange={(v) => {
                    setRepresentation(v);
                    patchURL({ display: v });
                  }}
                  label="Session display"
                  options={[
                    {
                      value: "rail",
                      label: (
                        <>
                          <IconList size={15} />
                          Rail
                        </>
                      ),
                    },
                    {
                      value: "table",
                      label: (
                        <>
                          <IconTable size={15} />
                          Table
                        </>
                      ),
                    },
                  ]}
                />
              </div>
              <SiblingTransition
                pageKey={`${day}-${representation}`}
                direction={direction}
                focusHeading={false}
                pageClassName="sessions-content"
              >
                {!current.length ? (
                  <div className="empty-day">
                    <IconCalendarWeek size={28} />
                    <h3>Nothing recorded for this day</h3>
                    <p>
                      A gap in the record doesn’t mean no work happened.
                      <br />
                      Add a session to keep the day complete.
                    </p>
                    <Button variant="outline" onClick={(e) => addSession(e.currentTarget)}>
                      <IconPlus />
                      Add time
                    </Button>
                  </div>
                ) : representation === "table" ? (
                  <div className="table-scroll" role="region" aria-label="Recorded sessions" tabIndex={0}>
                    <table>
                      <caption className="sr-only">Sessions for {dayLabel(day)}, Europe/London</caption>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Session / linked task</th>
                          <th>Category</th>
                          <th>Duration</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...shown].reverse().map((s) => (
                          <tr key={s.id}>
                            <td className="mono">
                              {clock(s.from)}–{clock(s.to)}
                            </td>
                            <td>
                              <strong>{s.title}</strong>
                              <button
                                className="task-link"
                                onClick={(e) => {
                                  lastTrigger.current = e.currentTarget;
                                  setTask(s.task);
                                  patchURL({ task: s.task });
                                }}
                                disabled={!s.task}
                              >
                                {s.task ? `${s.task} · ${TASKS.find((t) => t.id === s.task)?.title}` : "No linked task"}
                              </button>
                              <small>{s.source}</small>
                            </td>
                            <td>
                              <Swatch category={s.category} />
                              {CATEGORIES[s.category]}
                            </td>
                            <td className="mono">{duration(s.to - s.from)}</td>
                            <td>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit ${s.title}`}
                                onClick={(e) => openEdit(s, e.currentTarget)}
                              >
                                <IconPencil />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <motion.ol className="session-rail" layout={!reduced} transition={reflowTransition(reduced)}>
                    <AnimatePresence initial={false}>
                      {[...shown].reverse().map((s) => (
                        <motion.li
                          layout={!reduced}
                          key={s.id}
                          transition={reflowTransition(reduced)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.08 } }}
                          className={hover === s.id ? "row-highlighted" : ""}
                          onMouseEnter={() => setHover(s.id)}
                          onMouseLeave={() => setHover("")}
                        >
                          <div className="row-time">
                            <span>{clock(s.from)}</span>
                            <span>{clock(s.to)}</span>
                          </div>
                          <div className="row-node">
                            <Swatch category={s.category} />
                          </div>
                          <div className="session-body">
                            <div className="session-metadata">
                              <span>{CATEGORIES[s.category]}</span>
                              <span className="mono">{duration(s.to - s.from)}</span>
                            </div>
                            <h3>{s.title}</h3>
                            {s.task ? (
                              <button
                                className="task-link"
                                onClick={(e) => {
                                  lastTrigger.current = e.currentTarget;
                                  setTask(s.task);
                                  patchURL({ task: s.task });
                                }}
                              >
                                <span className="mono">{s.task}</span>
                                <span>{TASKS.find((t) => t.id === s.task)?.title}</span>
                                <IconArrowUpRight size={13} />
                              </button>
                            ) : (
                              <span className="no-task">No linked task</span>
                            )}
                            <small className="source">{s.source}</small>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${s.title}`}
                            onClick={(e) => openEdit(s, e.currentTarget)}
                          >
                            <IconPencil />
                          </Button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </motion.ol>
                )}
              </SiblingTransition>
              <footer className="day-footer">
                <span>Times shown in Europe/London</span>
                <Button variant="ghost" size="sm" onClick={(e) => addSession(e.currentTarget)}>
                  <IconPlus />
                  Add time
                </Button>
              </footer>
            </>
          )}
        </main>
        <div className="save-notice" role="status">
          {notice}
        </div>
      </div>
      <Tooltip tip={tip} />
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="mobile-navigation">
          <SheetHeader className="sr-only">
            <SheetTitle>Workspace navigation</SheetTitle>
            <SheetDescription>Fernbrook Greenhouse</SheetDescription>
          </SheetHeader>
          {nav}
        </SheetContent>
      </Sheet>
      <Sheet open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        {editing && (
          <SheetContent className="editor-sheet">
            <SessionEditor
              key={editing.id || "new"}
              session={editing}
              discard={discard}
              onDirty={(dirty) => {
                draftDirty.current = dirty;
              }}
              onKeep={() => setDiscard(false)}
              onDiscard={() => closeEdit(true)}
              onCancel={() => closeEdit()}
              onSave={(updated) => {
                setSessions((all) =>
                  updated.id
                    ? all.map((s) => (s.id === updated.id ? updated : s))
                    : [...all, { ...updated, id: `manual-${all.length}` }],
                );
                setNotice(updated.id ? "Session updated" : "Session added");
                closeEdit(true);
              }}
            />
          </SheetContent>
        )}
      </Sheet>
      <Sheet
        open={!!task}
        onOpenChange={(open) => {
          if (!open) {
            setTask("");
            patchURL({ task: "" });
            requestAnimationFrame(() => lastTrigger.current?.focus());
          }
        }}
      >
        {task && (
          <SheetContent className="task-sheet">
            <SheetHeader>
              <SheetDescription>
                {task} · {TASKS.find((t) => t.id === task)?.area}
              </SheetDescription>
              <SheetTitle>{TASKS.find((t) => t.id === task)?.title}</SheetTitle>
            </SheetHeader>
            <div className="task-time">
              <h2>Time spent</h2>
              <p className="task-total mono">{duration(elapsed(sessions.filter((s) => s.task === task)))}</p>
              <p>Across all recorded sessions</p>
              <CategoryBars
                totals={CATEGORIES.map((_, i) =>
                  sessions
                    .filter((s) => s.task === task && s.category === i)
                    .reduce((sum, s) => sum + s.to - s.from, 0),
                )}
                filter={null}
                reduced={reduced}
              />
              {sessions
                .filter((s) => s.task === task)
                .sort((a, b) => b.day.localeCompare(a.day))
                .map((s) => (
                  <button
                    className="task-session"
                    key={s.id}
                    onClick={() => {
                      navigate(s.day);
                      setTask("");
                      patchURL({ task: "" });
                    }}
                  >
                    <span>
                      {dayLabel(s.day, { weekday: "short", day: "numeric", month: "short" })}
                      <small>{s.title}</small>
                    </span>
                    <span className="mono">{duration(s.to - s.from)}</span>
                    <IconArrowUpRight size={14} />
                  </button>
                ))}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}

function CategoryBars({
  totals,
  filter,
  reduced,
  grow = true,
}: {
  totals: number[];
  filter: number | null;
  reduced: boolean;
  grow?: boolean;
}) {
  const max = Math.max(1, ...totals);
  const headingId = useId();
  const mobile = useIsMobile();
  const [expanded, setExpanded] = useState(query.get("breakdown") === "1");
  return (
    <section className="category-section" aria-labelledby={headingId}>
      <div className="category-heading">
        <h2 id={headingId}>Time by category</h2>
        {mobile && (
          <Button variant="ghost" size="sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? "Hide breakdown" : "Show breakdown"}
          </Button>
        )}
      </div>
      <DisclosureBody open={!mobile || expanded}>
        <div className="category-grid">
          {CATEGORIES.map(
            (name, i) =>
              totals[i] > 0 && (
                <div className="category-row" key={name}>
                  <div>
                    <span>
                      <Swatch category={i} />
                      {name}
                    </span>
                    <span className="mono">
                      <Counter value={duration(totals[i])} />
                    </span>
                  </div>
                  <div
                    className="bar-track"
                    aria-hidden="true"
                    style={{ opacity: filter !== null && filter !== i ? 0.25 : 1 }}
                  >
                    <motion.div
                      layout={!reduced}
                      style={{ width: `${(totals[i] / max) * 100}%`, originX: 0 }}
                      transition={reflowTransition(reduced)}
                    >
                      <motion.span
                        className="data-fill"
                        initial={reduced ? { opacity: 0 } : grow ? { scaleX: 0 } : false}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={reduced ? { duration: 0.14 } : spring.smooth}
                        style={{ background: color(i), transformOrigin: "left" }}
                      />
                    </motion.div>
                  </div>
                </div>
              ),
          )}
        </div>
      </DisclosureBody>
    </section>
  );
}
function WeekChart({
  days,
  sessions,
  filter,
  reduced,
  onDay,
  onTip,
}: {
  days: string[];
  sessions: Session[];
  filter: number | null;
  reduced: boolean;
  onDay: (day: string) => void;
  onTip: (tip: Tip | null) => void;
}) {
  const data = days.map((day) => ({
    day,
    values: CATEGORIES.map((_, i) =>
      sessions.filter((s) => s.day === day && s.category === i).reduce((sum, s) => sum + s.to - s.from, 0),
    ),
  }));
  const max = Math.max(480, ...data.map((d) => d.values.reduce((a, b) => a + b, 0)));
  return (
    <section className="week-chart">
      <div className="section-line">
        <h2>The week, by category</h2>
        <span>Recorded duration</span>
      </div>
      <div className="week-axis">
        <span>0h</span>
        <span>{Math.round(max / 120)}h</span>
        <span>{Math.round(max / 60)}h</span>
      </div>
      {data.map(({ day, values }) => (
        <div className="week-chart-row" key={day}>
          <button className="week-label" onClick={() => onDay(day)} disabled={day > TODAY}>
            {dayLabel(day, { weekday: "short" })}
            <span>{Number(day.slice(-2))}</span>
          </button>
          <div className="week-bar">
            {values.map(
              (value, i) =>
                value > 0 && (
                  <motion.span
                    key={i}
                    role="img"
                    tabIndex={0}
                    className="week-segment"
                    style={{
                      width: `${(value / max) * 100}%`,
                      background: color(i),
                      opacity: filter !== null && filter !== i ? 0.15 : 1,
                      transformOrigin: "left",
                    }}
                    initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
                    animate={{ scaleX: 1, opacity: filter !== null && filter !== i ? 0.15 : 1 }}
                    transition={reduced ? { duration: 0.14 } : spring.smooth}
                    aria-label={`${dayLabel(day)}: ${CATEGORIES[i]}, ${duration(value)}.`}
                    onMouseMove={(e) =>
                      onTip({
                        x: e.clientX,
                        y: e.currentTarget.getBoundingClientRect().top,
                        title: dayLabel(day),
                        detail: `${CATEGORIES[i]} · ${duration(value)}`,
                        category: i,
                      })
                    }
                    onMouseLeave={() => onTip(null)}
                    onFocus={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      onTip({
                        x: r.x + r.width / 2,
                        y: r.top,
                        title: dayLabel(day),
                        detail: `${CATEGORIES[i]} · ${duration(value)}`,
                        category: i,
                      });
                    }}
                    onBlur={() => onTip(null)}
                  />
                ),
            )}
            {!values.some(Boolean) && (
              <span className="week-no-data">{day > TODAY ? "Not yet recorded" : "Nothing recorded"}</span>
            )}
          </div>
          <span className="mono week-duration">{duration(values.reduce((a, b) => a + b, 0))}</span>
        </div>
      ))}
      <div className="week-table" role="region" aria-label="Weekly category durations" tabIndex={0}>
        <h3>Category totals</h3>
        <table>
          <caption className="sr-only">Category durations for each day of the week, in minutes</caption>
          <thead>
            <tr>
              <th>Category</th>
              {days.map((d) => (
                <th key={d}>{dayLabel(d, { weekday: "short" })}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c, i) => (
              <tr key={c}>
                <th>
                  <Swatch category={i} />
                  {c}
                </th>
                {data.map((d) => (
                  <td key={d.day} className="mono">
                    {duration(d.values[i])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function SessionEditor({
  session,
  onSave,
  onCancel,
  discard,
  onKeep,
  onDiscard,
  onDirty,
}: {
  session: Session;
  onSave: (s: Session) => void;
  onCancel: () => void;
  discard: boolean;
  onKeep: () => void;
  onDiscard: () => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState({ ...session, start: clock(session.from), end: clock(session.to) });
  const [error, setError] = useState("");
  const dirty =
    draft.title !== session.title ||
    draft.start !== clock(session.from) ||
    draft.end !== clock(session.to) ||
    draft.category !== session.category ||
    draft.task !== session.task;
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  const update = (patch: Partial<typeof draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError("");
  };
  return (
    <>
      <SheetHeader>
        <SheetTitle>{session.id ? "Edit session" : "Add time"}</SheetTitle>
        <SheetDescription>{dayLabel(session.day)} · Europe/London</SheetDescription>
      </SheetHeader>
      <form
        className="editor-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const from = minutes(draft.start),
            to = minutes(draft.end);
          if (!draft.title.trim()) return setError("Describe what you worked on before saving.");
          if (
            !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(draft.start) ||
            !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(draft.end) ||
            !Number.isFinite(from) ||
            !Number.isFinite(to) ||
            to <= from
          )
            return setError("End time must be after start time. Your changes are still here.");
          if (session.day === TODAY && to > 860)
            return setError("A session can’t end in the future. Choose 14:20 or earlier.");
          onSave({
            id: session.id,
            day: session.day,
            from,
            to,
            category: draft.category,
            title: draft.title.trim(),
            task: draft.task,
            source: session.id ? "Edited by you" : "Added by you",
          });
        }}
      >
        <div className="editor-fields">
          <div className="field">
            <Label htmlFor="session-title">What you worked on</Label>
            <Input
              id="session-title"
              autoFocus
              value={draft.title}
              maxLength={200}
              aria-invalid={!!error && !draft.title.trim()}
              aria-describedby={error ? "session-error" : undefined}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div className="time-fields">
            <div className="field">
              <Label htmlFor="session-start">Start time</Label>
              <Input
                id="session-start"
                type="text"
                inputMode="numeric"
                placeholder="HH:MM"
                pattern="[0-2][0-9]:[0-5][0-9]"
                value={draft.start}
                onChange={(e) => update({ start: e.target.value })}
              />
            </div>
            <div className="field">
              <Label htmlFor="session-end">End time</Label>
              <Input
                id="session-end"
                type="text"
                inputMode="numeric"
                placeholder="HH:MM"
                pattern="[0-2][0-9]:[0-5][0-9]"
                value={draft.end}
                aria-invalid={!!error}
                aria-describedby={error ? "session-error" : undefined}
                onChange={(e) => update({ end: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <Label htmlFor="session-category">Category</Label>
            <select
              id="session-category"
              value={draft.category}
              onChange={(e) => update({ category: Number(e.target.value) })}
            >
              {CATEGORIES.map((c, i) => (
                <option key={c} value={i}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <Label htmlFor="session-task">Linked task</Label>
            <select id="session-task" value={draft.task} onChange={(e) => update({ task: e.target.value })}>
              <option value="">No linked task</option>
              {TASKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <p className="editor-help">
            Changes update the day’s ribbon and category totals. Once edited, future checks leave this session as you
            wrote it.
          </p>
          {error && (
            <p role="alert" id="session-error" className="form-error">
              {error}
            </p>
          )}
          {discard && (
            <div className="discard">
              <p>Discard these unsaved changes?</p>
              <Button type="button" variant="outline" onClick={onKeep}>
                Keep editing
              </Button>
              <Button type="button" variant="ghost" onClick={onDiscard}>
                Discard changes
              </Button>
            </div>
          )}
        </div>
        <div className="editor-footer">
          <span className="mono">{duration(Math.max(0, minutes(draft.end) - minutes(draft.start)) || 0)}</span>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{session.id ? "Save changes" : "Add time"}</Button>
        </div>
      </form>
    </>
  );
}

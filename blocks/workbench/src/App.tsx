import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  IconSunHigh,
  IconListCheck,
  IconFolder,
  IconRobot,
  IconPlus,
  IconChevronRight,
  IconArrowLeft,
  IconLayoutKanban,
  IconList,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconX,
  IconSeedling,
  IconPlant2,
  IconFlower,
  IconPackage,
  IconTool,
  IconCheck,
  IconMoon,
  IconArrowUpRight,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@sift-design/ui/sidebar";
import { Button } from "@sift-design/ui/button";
import { Input } from "@sift-design/ui/input";
import { Textarea } from "@sift-design/ui/textarea";
import { Label } from "@sift-design/ui/label";
import { Checkbox } from "@sift-design/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { Popover, PopoverTrigger, PopoverContent } from "@sift-design/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@sift-design/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@sift-design/ui/empty";
import { SiblingTransition, PushStack } from "@sift-design/ui/page-transition";
import { Toaster } from "@sift-design/ui/sonner";
import { toast } from "sonner";
import { arrivalMotion, reflowTransition, titleMorph } from "@sift-design/tokens/motion";
import { LarkspurMark } from "../../_shared/brand";
import Board from "./Board";
import Inspector from "./Inspector";
import { areas, initialTasks, incomingTask, type Task, type Status } from "./data";
const params = new URLSearchParams(window.location.search);
type Page = "today" | "all" | "areas";
const areaIcons = [IconSeedling, IconPlant2, IconFlower, IconPackage, IconTool];
function updateURL(values: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values))
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  window.history.replaceState({}, "", url);
}
function Rail({ page, navigate, tasks }: { page: Page; navigate: (page: Page) => void; tasks: Task[] }) {
  const { setOpenMobile } = useSidebar();
  const nav = (destination: Page) => {
    navigate(destination);
    setOpenMobile(false);
  };
  const todayCount = tasks.filter((t) => t.today).length;
  return (
    <Sidebar collapsible="icon" className="workbench-rail">
      <SidebarHeader className="rail-brand">
        <LarkspurMark size={32} />
        <span data-sidebar-label className="brand-name">
          Larkspur<span>Fernbrook Greenhouse</span>
        </span>
      </SidebarHeader>
      <SidebarContent className="rail-content">
        <nav aria-label="Workspace">
          <SidebarMenu>
            {(
              [
                { id: "today", label: "Today", icon: IconSunHigh, count: todayCount },
                { id: "all", label: "All tasks", icon: IconListCheck, count: tasks.length },
                { id: "areas", label: "Areas", icon: IconFolder },
              ] as const
            ).map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={page === item.id}
                  onClick={() => nav(item.id)}
                  tooltip={item.label}
                  aria-label={item.label}
                >
                  <item.icon />
                  <span data-sidebar-label>{item.label}</span>
                </SidebarMenuButton>
                {"count" in item && (
                  <span aria-hidden="true" data-sidebar-label className="rail-count mono">
                    {item.count}
                  </span>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
        <div className="rail-areas" data-sidebar-label>
          <p>Growing areas</p>
          {areas.slice(0, 3).map((area, index) => {
            const Icon = areaIcons[index];
            return (
              <button
                key={area.name}
                onClick={() => {
                  nav("areas");
                  window.dispatchEvent(new CustomEvent("workbench-area", { detail: area.name }));
                }}
              >
                <Icon size={15} />
                <span>{area.name}</span>
              </button>
            );
          })}
        </div>
        <div className="rail-helper" data-sidebar-label>
          <div>
            <IconRobot size={16} />
            <strong>Climate watch</strong>
          </div>
          <p>Reads the sensor hub and files tasks that need attention.</p>
          <button
            onClick={() => {
              setOpenMobile(false);
              document.querySelector<HTMLButtonElement>("[data-live-trigger]")?.click();
            }}
          >
            Run Climate watch <IconArrowUpRight size={13} />
          </button>
        </div>
      </SidebarContent>
      <SidebarFooter className="rail-footer">
        <span className="profile-avatar">JD</span>
        <div data-sidebar-label>
          <strong>Jane Doe</strong>
          <span>Fernbrook Greenhouse</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
export default function App() {
  const reduced = !!useReducedMotion();
  const [tasks, setTasks] = useState<Task[]>(params.get("state") === "empty" ? [] : initialTasks);
  const [page, setPage] = useState<Page>((params.get("page") as Page) || (params.get("area") ? "areas" : "today"));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [area, setArea] = useState(params.get("area") || "");
  const [areaDirection, setAreaDirection] = useState<1 | -1>(1);
  const [view, setView] = useState(params.get("view") || "board");
  const [search, setSearch] = useState(params.get("search") || "");
  const [onlyHigh, setOnlyHigh] = useState(params.get("filter") === "priority");
  const [onlyMine, setOnlyMine] = useState(false);
  const [opened, setOpened] = useState(params.get("open") || "");
  const [full, setFull] = useState(params.get("full") === "1");
  const [completing, setCompleting] = useState<Task | null>(null);
  const [reason, setReason] = useState("");
  const [creating, setCreating] = useState<Status | null>(params.get("state") === "editing" ? "Open" : null);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState<"idle" | "reading" | "filed">("idle");
  const [error, setError] = useState(params.get("state") === "error");
  const dragging = useRef(false);
  const pendingArrival = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filed = useRef(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const openedTask = tasks.find((t) => t.id === opened);
  function navigate(destination: Page) {
    setDirection(["today", "all", "areas"].indexOf(destination) >= ["today", "all", "areas"].indexOf(page) ? 1 : -1);
    setPage(destination);
    setArea("");
    updateURL({ page: destination, area: null });
  }
  function drill(name: string) {
    setAreaDirection(1);
    setArea(name);
    updateURL({ page: "areas", area: name });
  }
  useEffect(() => {
    const handler = (event: Event) => drill((event as CustomEvent<string>).detail);
    window.addEventListener("workbench-area", handler);
    return () => window.removeEventListener("workbench-area", handler);
  }, []);
  function open(task: Task) {
    setOpened(task.id);
    updateURL({ open: task.id });
  }
  function close() {
    setOpened("");
    updateURL({ open: null, full: null });
    document.querySelector<HTMLButtonElement>(`[data-task="${opened}"] .task-title`)?.focus();
  }
  function update(task: Task) {
    setTasks((current) => current.map((t) => (t.id === task.id ? task : t)));
  }
  /** Move a task and put it where it was dropped: before `before`, or after the last card in its column. */
  function place(task: Task, before?: string | null) {
    if (before === undefined) return update(task);
    setTasks((current) => {
      const rest = current.filter((t) => t.id !== task.id);
      let index = before ? rest.findIndex((t) => t.id === before) : -1;
      if (index < 0) {
        const last = rest.map((t) => t.status).lastIndexOf(task.status);
        index = last < 0 ? rest.length : last + 1;
      }
      return [...rest.slice(0, index), task, ...rest.slice(index)];
    });
  }
  function complete(task: Task) {
    if (task.status === "Done") {
      update({ ...task, status: "Open", reason: undefined });
      return;
    }
    setReason("");
    setCompleting(task);
  }
  function finish() {
    if (!completing || !reason.trim()) return;
    const original = completing;
    update({ ...original, status: "Done", reason: reason.trim() });
    setCompleting(null);
    toast.success("Task marked done", {
      description: original.title,
      duration: 12000,
      action: {
        label: "Undo",
        onClick: () => {
          update(original);
          toast("Task reopened", { description: original.title });
        },
      },
    });
  }
  function fileTask() {
    if (filed.current) return;
    if (dragging.current) {
      pendingArrival.current = true;
      return;
    }
    filed.current = true;
    pendingArrival.current = false;
    setTasks((current) => [...current, incomingTask]);
    setLive("filed");
  }
  function runHelper() {
    if (live !== "idle" || filed.current) return;
    setLive("reading");
    timer.current = setTimeout(fileTask, 850);
  }
  useEffect(() => {
    if (params.get("live") === "1") runHelper();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function createTask(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !creating) return;
    const task: Task = {
      id: `FG-${115 + tasks.filter((t) => +t.id.slice(3) >= 115).length}`,
      title: draft.trim(),
      status: creating,
      area: area || "Propagation house",
      person: "Jane Doe",
      due: "Today",
      tags: [],
      description: "Add growing notes here as the work takes shape.",
      today: true,
    };
    setTasks((current) => [...current, task]);
    setCreating(null);
    setDraft("");
    toast("Task created", { description: task.title });
  }
  const scopedTasks = tasks.filter((t) => (area ? t.area === area : page === "today" ? t.today : true));
  const visibleTasks = scopedTasks.filter(
    (t) =>
      (!onlyHigh || t.priority === "High" || t.priority === "Urgent") &&
      (!onlyMine || t.person === "Jane Doe") &&
      `${t.title} ${t.area} ${t.tags.join(" ")} ${t.helper || ""}`.toLowerCase().includes(search.toLowerCase()),
  );
  const daily = tasks.filter((t) => t.today);
  const done = daily.filter((t) => t.status === "Done").length;
  const filtered = !!(search || onlyHigh || onlyMine);
  const resetFilters = () => {
    setSearch("");
    setOnlyHigh(false);
    setOnlyMine(false);
    updateURL({ filter: null, search: null });
  };
  const board = (
    <>
      <div className="toolbar">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) {
              setView(value);
              updateURL({ view: value });
            }
          }}
          aria-label="Task view"
          variant="outline"
        >
          <ToggleGroupItem value="board" aria-label="Board view">
            <IconLayoutKanban size={15} />
            <span>Board</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <IconList size={15} />
            <span>List</span>
          </ToggleGroupItem>
        </ToggleGroup>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className={onlyHigh || onlyMine ? "filter-active" : ""}>
              <IconAdjustmentsHorizontal />
              <span>Filters</span>
              {(onlyHigh || onlyMine) && <span className="mono">{Number(onlyHigh) + Number(onlyMine)}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="filter-popover">
            <h3>Show tasks</h3>
            <label>
              <Checkbox
                checked={onlyHigh}
                onCheckedChange={(value) => {
                  setOnlyHigh(!!value);
                  updateURL({ filter: value ? "priority" : null });
                }}
              />
              Urgent and high priority
            </label>
            <label>
              <Checkbox checked={onlyMine} onCheckedChange={(value) => setOnlyMine(!!value)} />
              Assigned to Jane
            </label>
            <Button variant="ghost" onClick={resetFilters}>
              Clear filters
            </Button>
          </PopoverContent>
        </Popover>
        <div className="toolbar-spacer" />
        <label className="search">
          <IconSearch size={15} />
          <Input
            aria-label="Search tasks"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateURL({ search: e.target.value || null });
            }}
          />
          {search && (
            <Button variant="plain" size="icon-xs" aria-label="Clear search" onClick={() => setSearch("")}>
              <IconX />
            </Button>
          )}
        </label>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          <IconAlertTriangle size={17} />
          <p>
            <strong>Climate watch couldn’t read the sensor hub.</strong>
            <span>Your tasks are unchanged. Check the connection, then try again.</span>
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setError(false);
              runHelper();
            }}
          >
            Retry
          </Button>
        </div>
      )}
      <AnimatePresence initial={false}>
        {live !== "idle" && (
          <motion.div
            className={`live-notice ${live}`}
            key="helper-notice"
            {...arrivalMotion(reduced)}
            layout={!reduced}
            transition={reflowTransition(reduced)}
            role="status"
          >
            <IconRobot size={16} />
            <div>
              <strong>
                {live === "reading" ? "Climate watch is checking the sensor hub" : "Climate watch filed a task"}
              </strong>
              <span>
                {live === "reading"
                  ? "New work will be added at the end of Open."
                  : "Propagation house hit 31°C at 14:10. Vents were closed."}
              </span>
            </div>
            {live === "filed" && (
              <Button variant="ghost" onClick={() => open(incomingTask)}>
                Review <IconArrowUpRight />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {visibleTasks.length ? (
        <motion.div layout={reduced ? false : "position"} transition={reflowTransition(reduced)}>
          <SiblingTransition pageKey={view} focusHeading={false}>
            <Board
              tasks={visibleTasks}
              view={view}
              open={open}
              complete={complete}
              move={(task, status, before) => {
                if (status === "Done" && task.status !== "Done") complete(task);
                else place({ ...task, status }, before);
              }}
              add={setCreating}
              onDrag={(active) => {
                dragging.current = active;
                if (!active && pendingArrival.current) fileTask();
              }}
            />
          </SiblingTransition>
        </motion.div>
      ) : (
        <Empty className="workbench-empty">
          <EmptyHeader>
            <IconSeedling size={30} stroke={1.4} />
            <EmptyTitle>{filtered ? "No tasks match these filters" : "No tasks yet"}</EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Clear the filters to see the rest of your greenhouse work."
                : "Create a task for the next greenhouse job."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={filtered ? resetFilters : () => setCreating("Open")}>
              {filtered ? (
                "Clear filters"
              ) : (
                <>
                  <IconPlus />
                  Create your first task
                </>
              )}
            </Button>
          </EmptyContent>
        </Empty>
      )}
      {visibleTasks.length > 0 && (
        <div className="board-footnote">
          <span>
            <span className="mono">{visibleTasks.length}</span> tasks{page === "today" && !area ? " for today" : ""}
          </span>
          <span>Changes stay in this demo</span>
        </div>
      )}
    </>
  );
  return (
    <SidebarProvider defaultOpen={params.get("rail") !== "collapsed"}>
      <Rail page={page} navigate={navigate} tasks={tasks} />
      <SidebarInset className="workbench-main">
        <header className="app-header">
          <SidebarTrigger aria-label="Toggle navigation" />
          <span className="header-divider" />
          <span className="workspace-name">Fernbrook Greenhouse</span>
          <IconChevronRight size={12} className="header-chevron" />
          <span className="header-location">{page === "today" ? "Today" : page === "all" ? "All tasks" : "Areas"}</span>
          <div className="header-actions">
            <span className="local-label">
              <span />
              Local workspace
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle color theme"
              onClick={() => {
                const dark = document.documentElement.classList.toggle("dark");
                updateURL({ theme: dark ? "dark" : "light" });
              }}
            >
              <IconMoon />
            </Button>
          </div>
        </header>
        <SiblingTransition
          pageKey={page}
          direction={direction}
          className="workspace-transition"
          pageClassName="workspace-page"
        >
          <LayoutGroup id="workbench-areas">
            <PushStack
              pageKey={area || "overview"}
              direction={areaDirection}
              className="area-transition"
              pageClassName="area-page"
            >
              {page === "areas" && !area ? (
                <div className="page-content areas-page">
                  <div className="page-heading">
                    <div>
                      <h1>Areas</h1>
                      <p>Tasks grouped by growing area.</p>
                    </div>
                    <span className="mono heading-count">{areas.length} areas</span>
                  </div>
                  <div className="area-list">
                    {areas.map((item, index) => {
                      const Icon = areaIcons[index];
                      const count = tasks.filter((t) => t.area === item.name && t.status !== "Done").length;
                      return (
                        <motion.button
                          key={item.name}
                          className="area-row"
                          onClick={() => drill(item.name)}
                          whileTap={reduced ? undefined : { scale: 0.995 }}
                        >
                          <span className="area-icon">
                            <Icon size={20} stroke={1.5} />
                          </span>
                          <span className="area-row-copy">
                            <motion.span
                              layoutId={reduced ? undefined : `area-title-${item.name}`}
                              transition={titleMorph}
                              className="area-name"
                            >
                              {item.name}
                            </motion.span>
                            <span>{item.detail}</span>
                          </span>
                          <span className="mono area-count">{count} open</span>
                          <IconChevronRight size={17} />
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="area-list-note">Open an area to see its tasks in context.</p>
                </div>
              ) : (
                <div className="page-content">
                  {area && (
                    <Button
                      variant="ghost"
                      className="back-areas"
                      onClick={() => {
                        setAreaDirection(-1);
                        setArea("");
                        updateURL({ area: null });
                      }}
                    >
                      <IconArrowLeft />
                      All areas
                    </Button>
                  )}
                  <div className="page-heading">
                    <div>
                      <h1>
                        {area ? (
                          <motion.span layoutId={reduced ? undefined : `area-title-${area}`} transition={titleMorph}>
                            {area}
                          </motion.span>
                        ) : page === "today" ? (
                          "Today"
                        ) : (
                          "All tasks"
                        )}
                      </h1>
                      <p>
                        {area
                          ? areas.find((a) => a.name === area)?.detail
                          : page === "today"
                            ? "Tuesday, 10 November"
                            : "Open and completed tasks across all areas."}
                      </p>
                    </div>
                    <div className="heading-actions">
                      <Button
                        variant="ghost"
                        aria-label={
                          live === "reading"
                            ? "Checking sensor hub"
                            : live === "filed"
                              ? "Task filed"
                              : "Run Climate watch"
                        }
                        data-live-trigger
                        onClick={runHelper}
                        disabled={live !== "idle"}
                        className="helper-run"
                      >
                        <IconRobot />
                        <span>
                          {live === "reading" ? "Checking…" : live === "filed" ? "Task filed" : "Run Climate watch"}
                        </span>
                      </Button>
                      <Button
                        ref={addButton}
                        aria-label="Create task"
                        onClick={() => setCreating("Open")}
                        className="create-task"
                      >
                        <IconPlus />
                        <span>Create task</span>
                      </Button>
                    </div>
                  </div>
                  {page === "today" && !area && (
                    <div className="daily-progress">
                      <div>
                        <span>
                          {done === daily.length && daily.length > 0 ? "Today’s work is done" : "Daily task progress"}
                        </span>
                        <span className="mono">
                          {done} of {daily.length} done
                        </span>
                      </div>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label="Daily task progress"
                        aria-valuenow={done}
                        aria-valuemin={0}
                        aria-valuemax={daily.length || 1}
                      >
                        <motion.span
                          initial={false}
                          animate={{ scaleX: daily.length ? done / daily.length : 0 }}
                          transition={reduced ? { duration: 0 } : reflowTransition(false)}
                        />
                      </div>
                    </div>
                  )}
                  {board}
                </div>
              )}
            </PushStack>
          </LayoutGroup>
        </SiblingTransition>
      </SidebarInset>
      <Inspector
        task={openedTask}
        full={full}
        close={close}
        toggleFull={() => {
          setFull(!full);
          updateURL({ full: !full ? "1" : null });
        }}
        update={update}
        complete={complete}
      />
      <Dialog
        open={!!completing}
        onOpenChange={(open) => {
          if (!open) setCompleting(null);
        }}
      >
        <DialogContent className="reason-dialog">
          <DialogHeader>
            <DialogTitle>What got done?</DialogTitle>
            <DialogDescription>{completing?.title}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              finish();
            }}
          >
            <Label htmlFor="done-reason">Completion note</Label>
            <Textarea
              id="done-reason"
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What changed, or what should we know?"
              required
            />
            <p className="dialog-hint">This stays in the task’s history. You can undo the completion.</p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCompleting(null)}>
                Keep working
              </Button>
              <Button type="submit" disabled={!reason.trim()}>
                <IconCheck />
                Mark done
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!creating}
        onOpenChange={(open) => {
          if (!open) setCreating(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            addButton.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
            <DialogDescription>Add the next useful action to {creating}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createTask}>
            <Label htmlFor="task-name">Task name</Label>
            <Input
              id="task-name"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What needs tending?"
              required
            />
            <p className="dialog-hint">{area || "Propagation house"} · Assigned to Jane · Due today</p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreating(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!draft.trim()}>
                <IconPlus />
                Create task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-center" closeButton />
    </SidebarProvider>
  );
}

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import {
  IconArrowLeft as ArrowLeft,
  IconArrowRight as ArrowRight,
  IconCheck as Check,
  IconCircleCheck as CircleCheck,
  IconAlertCircle as AlertCircle,
  IconLoader2 as Loader,
  IconRefresh as Refresh,
  IconSun as Sun,
  IconMoon as Moon,
  IconDeviceDesktop as Desktop,
  IconClock as Clock,
  IconDatabase as Database,
  IconLeaf as Leaf,
  IconInbox as Inbox,
  IconSettings as SettingsIcon,
  IconLayoutList as ListIcon,
  IconShieldLock as Shield,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Switch } from "@sift-design/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { SiblingTransition, type TransitionProps } from "@sift-design/ui/page-transition";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@sift-design/ui/alert-dialog";
import { setTheme, storedTheme, type ThemeChoice } from "@sift-design/ui/lib/theme";
import { spring, selectionSpring } from "@sift-design/tokens/motion";
import { LarkspurMark } from "../../_shared/brand";

const steps = ["Welcome", "Connections", "Defaults", "Optional setup", "First helper"];
const captions = [
  ["Tasks, orders and helpers.", "One workspace for the greenhouse,\nkept on this device."],
  ["Two sources to check.", "Helpers read from the sensor hub\nand the orders inbox."],
  ["Stored on this device.", "Tasks, connections and backups\nlive in one folder."],
  ["Off until you turn them on.", "Notifications and startup\nare both optional."],
  ["One helper to start.", "It runs on a schedule and files\ntasks with a reason."],
];
const slugs = ["welcome", "connections", "defaults", "optional", "helper"];
const query = new URLSearchParams(location.search);
type Health = { state: "idle" | "checking" | "ready" | "failed"; detail: string };
const idle: Health = { state: "idle", detail: "Not checked yet" };
type Preferences = {
  timezone: string;
  notifications: boolean;
  login: boolean;
  motion: "system" | "reduce";
  retention: string;
};
const initialPreferences: Preferences = {
  timezone: "Europe/London",
  notifications: false,
  login: false,
  motion: "system",
  retention: "90",
};
function readPreferences(): Preferences {
  try {
    return { ...initialPreferences, ...JSON.parse(localStorage.getItem("larkspur-onboarding-preferences") || "{}") };
  } catch {
    return initialPreferences;
  }
}
const helpers = [
  {
    name: "Climate watch",
    schedule: "Every 30 min, 06:00–20:00",
    detail: "Turn sensor readings into tasks that need attention.",
    icon: Leaf,
  },
  {
    name: "Order sweep",
    schedule: "Weekdays, 07:00 and 13:00",
    detail: "File new orders and keep changed quantities up to date.",
    icon: Inbox,
  },
];
function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, text]) => (
          <SelectItem key={v} value={v}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function PageFrame({ reduced, ...props }: TransitionProps & { reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(props.pageKey);
  useLayoutEffect(() => {
    if (previous.current === props.pageKey) return;
    previous.current = props.pageKey;
    if (reduced) {
      const heading = root.current?.querySelector<HTMLElement>("h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }, [props.pageKey, reduced]);
  if (!reduced) return <SiblingTransition {...props} />;
  return (
    <div ref={root} className={props.className}>
      <motion.div
        key={props.pageKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.14 }}
        className={props.pageClassName}
      >
        {props.children}
      </motion.div>
    </div>
  );
}
function SettingRow({ title, description, children }: { title: string; description: ReactNode; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}
export default function App() {
  const systemReduced = !!useReducedMotion();
  const [prefs, setPrefs] = useState<Preferences>(readPreferences);
  const reduced = systemReduced || prefs.motion === "reduce";
  const [step, setStep] = useState(Math.max(0, slugs.indexOf(query.get("step") || "welcome")));
  const [view, setView] = useState(
    query.get("view") === "settings" ? "settings" : query.get("view") === "workspace" ? "workspace" : "setup",
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sensor, setSensor] = useState<Health>(idle);
  const [inbox, setInbox] = useState<Health>(idle);
  const [helper, setHelper] = useState<string | null>(query.get("helper") || "Climate watch");
  const [enabledHelper, setEnabledHelper] = useState<string | null>(query.get("view") ? query.get("helper") : null);
  const [theme, chooseTheme] = useState<ThemeChoice>(storedTheme);
  const [notice, setNotice] = useState("");
  const [update, setUpdate] = useState(true);
  const [replay, setReplay] = useState(0);
  const checksStarted = useRef(false);
  const previousView = useRef(view);
  useLayoutEffect(() => {
    document.querySelectorAll<HTMLElement>(".onboarding, .app-shell").forEach((surface) => {
      surface.inert = surface.classList.contains("onboarding") !== (view === "setup");
    });
    const crossedSetup = (previousView.current === "setup") !== (view === "setup");
    previousView.current = view;
    if (!crossedSetup) return;
    const heading = document.querySelector<HTMLElement>(view === "setup" ? ".onboarding h1" : ".app-shell h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [view]);
  const changePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));
  useEffect(() => {
    localStorage.setItem("larkspur-onboarding-preferences", JSON.stringify(prefs));
    document.documentElement.dataset.motion = prefs.motion;
  }, [prefs]);
  const runCheck = async (kind: "sensor" | "inbox", retry = false) => {
    const setter = kind === "sensor" ? setSensor : setInbox;
    setter({
      state: "checking",
      detail: kind === "sensor" ? "Requesting the hub’s health endpoint…" : "Reading the inbox connection…",
    });
    try {
      const result = await fetch(`./fixtures/${kind}${retry ? "-retry" : ""}.json`, { cache: "no-store" });
      if (!result.ok) throw new Error(`Health check returned ${result.status}. Retry to check again.`);
      setter((await result.json()) as Health);
    } catch (error) {
      setter({
        state: "failed",
        detail: error instanceof Error ? error.message : "Could not read the connection. Retry to check again.",
      });
    }
  };
  useEffect(() => {
    if (view === "setup" && step === 1 && !checksStarted.current) {
      checksStarted.current = true;
      void runCheck("sensor");
      void runCheck("inbox");
    }
  }, [step, view]);
  useEffect(() => {
    const pop = () => {
      const q = new URLSearchParams(location.search);
      const next = Math.max(0, slugs.indexOf(q.get("step") || "welcome"));
      setDirection(next >= step ? 1 : -1);
      setStep(next);
      setView(q.get("view") === "settings" ? "settings" : q.get("view") === "workspace" ? "workspace" : "setup");
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [step]);
  function navigate(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    const url = new URL(location.href);
    url.searchParams.set("step", slugs[next]);
    url.searchParams.delete("view");
    history.pushState({}, "", url);
  }
  function openView(next: string) {
    if (next === "settings") setNotice("");
    setView(next);
    const url = new URL(location.href);
    url.searchParams.set("view", next);
    history.pushState({}, "", url);
  }
  function finish(withHelper: boolean) {
    setEnabledHelper(withHelper ? helper : null);
    setNotice(
      withHelper && helper
        ? `${helper} is scheduled. Nothing has run yet.`
        : "Your workspace is ready. You can add a helper later.",
    );
    openView("workspace");
  }
  function changeTheme(value: string) {
    if (!value) return;
    chooseTheme(value as ThemeChoice);
    const url = new URL(location.href);
    url.searchParams.delete("theme");
    history.replaceState({}, "", url);
    setTheme(value as ThemeChoice);
  }
  const healthCard = (kind: "sensor" | "inbox", health: Health) => {
    const Icon = kind === "sensor" ? Leaf : Inbox;
    return (
      <div className="health-card">
        <Icon size={19} className="muted" />
        <div className="health-content">
          <div className="flex items-center justify-between gap-3">
            <h3>{kind === "sensor" ? "Sensor hub" : "Orders inbox"}</h3>
            {/* Labels share one grid cell, so the old one fades out where it stands. */}
            <span className="health-badge">
              <AnimatePresence initial={false}>
                <motion.span
                  key={health.state}
                  className={`health-label ${health.state}`}
                  initial={{ opacity: 0, y: reduced ? 0 : 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -5, transition: { duration: 0.1 } }}
                  transition={reduced ? { duration: 0.1 } : spring.snappy}
                >
                  {health.state === "checking" ? (
                    <Loader size={14} className="spin" />
                  ) : health.state === "ready" ? (
                    <CircleCheck size={14} />
                  ) : health.state === "failed" ? (
                    <AlertCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {health.state === "failed"
                    ? "Failed"
                    : health.state === "ready"
                      ? "Ready"
                      : health.state === "checking"
                        ? "Checking"
                        : "Not checked"}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <p aria-live="polite">{health.detail}</p>
          <AnimatePresence initial={false}>
            {health.state === "failed" && (
              <motion.div
                className="health-retry"
                initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
                exit={{
                  height: 0,
                  opacity: 0,
                  overflow: "hidden",
                  transition: reduced ? { duration: 0.1 } : spring.exit,
                }}
                transition={reduced ? { duration: 0.12 } : spring.smooth}
              >
                <Button variant="outline" size="sm" onClick={() => void runCheck(kind, true)}>
                  <Refresh size={14} />
                  Retry {kind === "sensor" ? "sensor hub" : "orders inbox"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };
  const optional = (
    <div className="optional-rows">
      <SettingRow title="Desktop notifications" description="Hear about tasks that need you, not every reading.">
        <Switch
          aria-label="Desktop notifications"
          checked={prefs.notifications}
          onCheckedChange={(v) => changePreference("notifications", v)}
        />
      </SettingRow>
      <SettingRow title="Start at login" description="Open Larkspur when you sign in, so helpers run on time.">
        <Switch
          aria-label="Start at login"
          checked={prefs.login}
          onCheckedChange={(v) => changePreference("login", v)}
        />
      </SettingRow>
      <p className="fine">
        Both are optional. You can change them later in Settings. This example saves your choices in the browser;
        it does not enable desktop notifications or launch at login.
      </p>
    </div>
  );
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <AnimatePresence initial={false} mode="popLayout">
        {view === "setup" ? (
          <motion.div
            key="setup"
            className="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: reduced ? 0 : -28 }}
            transition={reduced ? { duration: 0.14 } : { ...spring.smooth, opacity: { duration: 0.16 } }}
          >
            <header className="setup-header">
              <span className="brand-name">Larkspur</span>
              <span className="fine">
                Fernbrook Greenhouse <span className="header-divider">/</span> First run
              </span>
            </header>
            <main className="setup-main">
              <aside className="anchor-panel">
                <div className="anchor-top">
                  <span className="mono">01—05</span>
                </div>
                <div className={`anchor-art step-${step}`}>
                  {/* One mark, in the page: it travels into the rail when setup finishes. */}
                  <motion.div
                    className="mark-space"
                    layoutId={reduced ? undefined : "larkspur-mark"}
                    transition={spring.smooth}
                  >
                    <LarkspurMark key={replay} size={112} className={reduced ? undefined : "mark-assembly"} />
                  </motion.div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={step}
                      className="anchor-copy"
                      initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={reduced ? { duration: 0.12 } : { ...spring.smooth, opacity: { duration: 0.16 } }}
                    >
                      <span className="anchor-caption">{captions[step][0]}</span>
                      <p>{captions[step][1]}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="anchor-bottom">
                  <Shield size={15} />
                  <span>Stored on this device.</span>
                </div>
              </aside>
              <section className="setup-content" aria-label="Workspace setup">
                <nav className="step-track" aria-label="Setup steps">
                  {steps.map((label, index) => (
                    <button
                      key={label}
                      onClick={() => navigate(index)}
                      aria-current={index === step ? "step" : undefined}
                    >
                      <span className="step-number">
                        {index < step ? <Check size={13} /> : index + 1}
                        {index === step && (
                          <motion.span
                            className="step-highlight"
                            layoutId={reduced ? undefined : "step"}
                            transition={reduced ? { duration: 0 } : selectionSpring}
                          />
                        )}
                      </span>
                      <span className="step-label">{label}</span>
                    </button>
                  ))}
                </nav>
                <PageFrame
                  reduced={reduced}
                  pageKey={String(step)}
                  direction={direction}
                  className="step-pages"
                  pageClassName="step-page"
                >
                  {step === 0 && (
                    <>
                      <h1>
                        Set up your
                        <br className="desktop-break" /> greenhouse workspace.
                      </h1>
                      <p className="step-description">
                        Manage greenhouse tasks, incoming orders, and scheduled automations called helpers.
                      </p>
                      <div className="welcome-notes">
                        <div>
                          <Leaf size={18} />
                          <span>Made for Fernbrook Greenhouse</span>
                        </div>
                        <div>
                          <Database size={18} />
                          <span>Stored on this device, not in a cloud account</span>
                        </div>
                        <div>
                          <Clock size={18} />
                          <span>Set up at your pace. Change anything later.</span>
                        </div>
                      </div>
                      <div className="step-actions">
                        <Button onClick={() => navigate(1)}>
                          Set up your workspace
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                      <p className="fine">No account to create. No card to add.</p>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <h1>Check your connections.</h1>
                      <p className="step-description">
                        Helpers read from these sources. Check what’s reachable before you put one to work.
                      </p>
                      <div className="health-cards">
                        {healthCard("sensor", sensor)}
                        {healthCard("inbox", inbox)}
                      </div>
                      <p className="fine">
                        A failed connection won’t block setup. Helpers wait until their source is ready.
                      </p>
                      <div className="step-actions">
                        <Button variant="ghost" onClick={() => navigate(0)}>
                          <ArrowLeft size={16} />
                          Back
                        </Button>
                        <Button onClick={() => navigate(2)}>
                          Continue
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h1>Check your timezone and storage.</h1>
                      <p className="step-description">
                        Helper schedules use the workspace timezone. Your data stays in one folder.
                      </p>
                      <div className="defaults-fields">
                        <label>
                          Workspace timezone
                          <Choice
                            label="Workspace timezone"
                            value={prefs.timezone}
                            onChange={(v) => changePreference("timezone", v)}
                            options={[
                              ["Europe/London", "Europe/London"],
                              ["Europe/Paris", "Europe/Paris"],
                              ["America/New_York", "America/New_York"],
                            ]}
                          />
                          <span className="fine">Helper schedules use this timezone.</span>
                        </label>
                        <div>
                          <h3>Where your data lives</h3>
                          <div className="storage-path">
                            <Database size={17} />
                            <code>~/Larkspur/fernbrook</code>
                            <span className="health-state ready">
                              <Check size={14} />
                              Local
                            </span>
                          </div>
                          <p className="fine">
                            Tasks, connections, and backups stay together. This example stores preferences in your
                            browser only.
                          </p>
                        </div>
                      </div>
                      <div className="step-actions">
                        <Button variant="ghost" onClick={() => navigate(1)}>
                          <ArrowLeft size={16} />
                          Back
                        </Button>
                        <Button onClick={() => navigate(3)}>
                          Keep these defaults
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h1>Notifications and startup.</h1>
                      <p className="step-description">Both start off. Turn either on now, or later in Settings.</p>
                      {optional}
                      <div className="step-actions">
                        <Button variant="ghost" onClick={() => navigate(2)}>
                          <ArrowLeft size={16} />
                          Back
                        </Button>
                        <Button onClick={() => navigate(4)}>
                          Continue
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        className="skip-link"
                        onClick={() => {
                          changePreference("notifications", false);
                          changePreference("login", false);
                          navigate(4);
                        }}
                      >
                        Skip optional setup
                      </Button>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <h1>Choose a first helper.</h1>
                      <p className="step-description">
                        A helper checks a source on a schedule and adds tasks that explain what needs attention.
                      </p>
                      <div className="helper-choices" role="radiogroup" aria-label="First helper">
                        {helpers.map((item) => (
                          <button
                            role="radio"
                            tabIndex={helper === item.name ? 0 : -1}
                            aria-checked={helper === item.name}
                            key={item.name}
                            className="helper-choice"
                            onClick={() => setHelper(item.name)}
                            onKeyDown={(event) => {
                              if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                                event.preventDefault();
                                const next = helpers.find((h) => h.name !== item.name)!;
                                setHelper(next.name);
                                const buttons =
                                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                                    '[role="radio"]',
                                  );
                                buttons?.[helpers.indexOf(next)].focus();
                              }
                            }}
                          >
                            <item.icon size={20} />
                            <span>
                              <strong>{item.name}</strong>
                              <code>{item.schedule}</code>
                              <span>{item.detail}</span>
                            </span>
                            <span className="radio-dot">
                              {helper === item.name && (
                                <motion.span
                                  layoutId={reduced ? undefined : "helper-choice"}
                                  transition={selectionSpring}
                                />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="fine">
                        {prefs.timezone}. A helper needs a working connection before it can run. No helper has run yet.
                      </p>
                      <div className="step-actions">
                        <Button variant="ghost" onClick={() => navigate(3)}>
                          <ArrowLeft size={16} />
                          Back
                        </Button>
                        <Button onClick={() => finish(true)}>
                          Open workspace
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                      <Button variant="link" className="skip-link" onClick={() => finish(false)}>
                        I’ll add a helper later
                      </Button>
                    </>
                  )}
                </PageFrame>
              </section>
            </main>
            <footer className="setup-footer">
              <span>Interactive example · connection checks use sample data</span>
              <Button variant="ghost" size="sm" onClick={() => setReplay((r) => r + 1)}>
                <Refresh size={13} />
                Replay opening
              </Button>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="shell"
            className="app-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0.14 } : { ...spring.smooth, opacity: { duration: 0.18 } }}
          >
            <aside className="app-rail">
              <div className="rail-brand">
                <motion.div
                  className="shell-mark-space"
                  layoutId={reduced ? undefined : "larkspur-mark"}
                  transition={spring.smooth}
                >
                  <LarkspurMark size={32} />
                </motion.div>
                <span>Larkspur</span>
              </div>
              <div className="workspace-name">Fernbrook Greenhouse</div>
              <nav aria-label="Workspace">
                <Button
                  variant="ghost"
                  className={view === "workspace" ? "rail-item selected" : "rail-item"}
                  onClick={() => openView("workspace")}
                >
                  <ListIcon size={18} />
                  Today
                </Button>
                <Button
                  variant="ghost"
                  className={view === "settings" ? "rail-item selected" : "rail-item"}
                  onClick={() => openView("settings")}
                >
                  <SettingsIcon size={18} />
                  Settings
                </Button>
              </nav>
              <div className="rail-person">
                <span className="avatar">JD</span>
                <span>
                  Jane Doe<small>Workspace owner</small>
                </span>
              </div>
            </aside>
            <div className="app-main">
              <header className="app-header">
                <span>
                  Fernbrook Greenhouse<span className="header-divider">/</span>
                  <strong>{view === "settings" ? "Settings" : "Today"}</strong>
                </span>
                <span className="local-label">
                  <Database size={14} />
                  Local workspace
                </span>
              </header>
              <main>
                <PageFrame
                  reduced={reduced}
                  pageKey={view}
                  direction={view === "settings" ? 1 : -1}
                  pageClassName="workspace-page"
                >
                  {view === "settings" ? (
                    <div className="settings-page">
                      <div className="page-heading">
                        <div>
                          <h1>Settings</h1>
                          <p>Appearance, notifications and data for this workspace.</p>
                        </div>
                        <span className="fine">Saved on this device</span>
                      </div>
                      <section className="settings-section" aria-labelledby="appearance">
                        <h2 id="appearance">Appearance</h2>
                        <SettingRow title="Theme" description="Follow the system, or always use light or dark.">
                          <ToggleGroup type="single" value={theme} onValueChange={changeTheme} aria-label="Theme">
                            {(
                              [
                                ["system", "System", Desktop],
                                ["light", "Light", Sun],
                                ["dark", "Dark", Moon],
                              ] as const
                            ).map(([value, text, Icon]) => (
                              <ToggleGroupItem key={value} value={value} aria-label={text}>
                                <Icon size={15} />
                                {text}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </SettingRow>
                        <SettingRow title="Motion" description="Reduce movement and keep simple fades.">
                          <Choice
                            label="Motion preference"
                            value={prefs.motion}
                            onChange={(v) => changePreference("motion", v as Preferences["motion"])}
                            options={[
                              ["system", "Follow system"],
                              ["reduce", "Reduce"],
                            ]}
                          />
                        </SettingRow>
                      </section>
                      <section className="settings-section" aria-labelledby="notifications">
                        <h2 id="notifications">Notifications & startup</h2>
                        {optional}
                      </section>
                      <section className="settings-section" aria-labelledby="data">
                        <h2 id="data">Data & backups</h2>
                        <SettingRow title="Workspace timezone" description="Used for all helper schedules.">
                          <Choice
                            label="Workspace timezone"
                            value={prefs.timezone}
                            onChange={(v) => changePreference("timezone", v)}
                            options={[
                              ["Europe/London", "Europe/London"],
                              ["Europe/Paris", "Europe/Paris"],
                              ["America/New_York", "America/New_York"],
                            ]}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Backups"
                          description={
                            <span>
                              Last backup <code>10 Nov 2026, 06:00</code>
                              <br />
                              Stored in <code>~/Larkspur/fernbrook/backups</code>
                            </span>
                          }
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Restore backup
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Restore the 06:00 backup?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This replaces workspace data with the backup from 10 November 2026 at 06:00. Changes
                                  made after that time will be lost. In this example, no files will be changed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => setNotice("Restore preview complete. No files were changed.")}
                                >
                                  Restore this backup
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </SettingRow>
                        <SettingRow
                          title="Data retention"
                          description="Delete helper run logs after this time. Tasks and backups are kept."
                        >
                          <Choice
                            label="Data retention"
                            value={prefs.retention}
                            onChange={(v) => changePreference("retention", v)}
                            options={[
                              ["30", "30 days"],
                              ["90", "90 days"],
                              ["365", "1 year"],
                              ["forever", "Keep forever"],
                            ]}
                          />
                        </SettingRow>
                      </section>
                      {update && (
                        <div className="update-notice">
                          <div>
                            <Refresh size={18} />
                            <span>
                              <strong>An update is available</strong>
                              <p>
                                Larkspur <code>0.2.1</code> · More reliable connection recovery.
                              </p>
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNotice("Update preview only. No application update was installed.")}
                          >
                            Preview update
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setUpdate(false)}>
                            Later
                          </Button>
                        </div>
                      )}
                      <p className="fine settings-footnote">
                        Interactive example · backup and update information is sample data.
                      </p>
                    </div>
                  ) : (
                    <div className="today-page">
                      <div className="page-heading">
                        <div>
                          <p className="mono date-label">Tuesday, 10 November 2026</p>
                          <h1>Nothing needs you yet.</h1>
                          <p>Your workspace is ready.</p>
                        </div>
                      </div>
                      <div className="workspace-empty">
                        <Leaf size={28} />
                        <h2>No tasks yet</h2>
                        <p>
                          When a helper finds something that needs attention, it lands here with its source and a
                          reason.
                        </p>
                        <Button variant="outline" onClick={() => openView("settings")}>
                          <SettingsIcon size={16} />
                          Open settings
                        </Button>
                      </div>
                      {enabledHelper && (
                        <div className="scheduled-helper">
                          <Clock size={19} />
                          <div>
                            <h3>{enabledHelper} is scheduled</h3>
                            <p>
                              {helpers.find((h) => h.name === enabledHelper)?.schedule} · {prefs.timezone}
                            </p>
                            <span className="fine">Waiting for a healthy source. No run has started.</span>
                          </div>
                          <span className="health-state">Scheduled</span>
                        </div>
                      )}
                      <p className="fine">This is an empty workspace, not a sample task board.</p>
                    </div>
                  )}
                </PageFrame>
              </main>
              <footer className="app-footer">
                <span>Stored on this device.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    checksStarted.current = false;
                    setSensor(idle);
                    setInbox(idle);
                    setStep(0);
                    setView("setup");
                    const u = new URL(location.href);
                    u.searchParams.delete("view");
                    u.searchParams.set("step", "welcome");
                    history.pushState({}, "", u);
                  }}
                >
                  Revisit setup
                </Button>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            className="feedback"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0.1 } : spring.snappy}
          >
            <CircleCheck size={18} />
            <span>{notice}</span>
            <Button size="sm" variant="ghost" onClick={() => setNotice("")}>
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

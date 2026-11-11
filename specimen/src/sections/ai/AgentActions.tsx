import { useEffect, useRef, useState } from "react";
import {
  IconArrowBackUp,
  IconArrowsMove,
  IconBox,
  IconChevronDown,
  IconDroplet,
  IconGitMerge,
  IconMessage2,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconSearch,
  IconSeedling,
} from "@tabler/icons-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@sift-design/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import {
  ActionCard,
  ActionCardChanges,
  ActionCardDetails,
  ActionCardError,
  ActionCardHeader,
  ActionCardLink,
  ActionCardQuote,
  ActionCardRecord,
  ActionCardRecords,
  type ActionCardStatus,
} from "@sift-design/ui/ai/action-card";
import { AgentBadge, AgentReview } from "@sift-design/ui/ai/agent-review";
import { ActivityEntry, type ActivityEntryProps, ActivityLog } from "@sift-design/ui/ai/activity-log";
import { SpecimenItem } from "../../frame";

const germinating = "var(--cat-6)";
const inProgress = "var(--cat-4)";
const open = "var(--muted)";

const trays = [
  { title: "Seed tray 12 · Basil", done: false },
  { title: "Seed tray 13 · Thyme", done: false },
  { title: "Seed tray 14 · Marigold", done: false },
];

const searchResults = [
  "Bench 1 irrigation",
  "Bench 2 irrigation",
  "Bench 3 irrigation",
  "Bench 4 irrigation",
  "Bench 5 irrigation",
  "Check misting nozzles",
  "Calibrate soil-moisture probe 3",
  "Flush the north drip line",
  "Replace inline filter, bench 4",
  "Polytunnel 2 sprinkler timer",
  "Rain barrel overflow",
  "Order drip emitters",
  "Hose reel by the potting shed",
  "Water the herb bench before Saturday",
];

function ActionCardDemo() {
  const [moveStatus, setMoveStatus] = useState<ActionCardStatus>("done");
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function replay() {
    clearTimeout(timer.current);
    setMoveStatus("running");
    timer.current = setTimeout(() => setMoveStatus("done"), 1600);
  }
  const openRecord = (title: string) => setNote(`Opened ${title}.`);
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3">
        <ActionCard status={moveStatus}>
          <ActionCardHeader icon={<IconArrowsMove />} verb="Moved 3 seed trays to Germinating" />
          <ActionCardRecords>
            {trays.map((tray) => (
              <ActionCardRecord
                key={tray.title}
                icon={<IconSeedling />}
                title={tray.title}
                status="Germinating"
                statusColor={germinating}
                onOpen={() => openRecord(tray.title)}
              />
            ))}
          </ActionCardRecords>
          <ActionCardChanges changes={["Moved to Germinating", "Heat mat on"]} />
          <ActionCardDetails
            call={'move_records({ ids: ["tray-12", "tray-13", "tray-14"], status: "germinating" })'}
            output={moveStatus === "running" ? undefined : "3 records moved."}
          />
        </ActionCard>

        <ActionCard>
          <ActionCardHeader icon={<IconMessage2 />} verb="Added a comment on Bench 4 irrigation" />
          <ActionCardRecords>
            <ActionCardRecord
              icon={<IconDroplet />}
              title="Bench 4 irrigation"
              status="In progress"
              statusColor={inProgress}
              onOpen={() => openRecord("Bench 4 irrigation")}
            />
          </ActionCardRecords>
          <ActionCardQuote>
            The north drip line clogs every few days. I flushed it and set a weekly check for Mondays.
          </ActionCardQuote>
          <ActionCardLink onClick={() => setNote("Opened the history of Bench 4 irrigation.")} />
          <ActionCardDetails
            call={'add_comment({ id: "bench-4-irrigation", text: "The north drip line clogs…" })'}
            output="Comment added."
          />
        </ActionCard>

        <ActionCard emphasis="read">
          <ActionCardHeader icon={<IconSearch />} verb="Searched records" detail="14 results" />
          <ActionCardDetails call={'search_records({ query: "irrigation" })'} output="14 records match.">
            <ActionCardRecords>
              {searchResults.map((title) => (
                <ActionCardRecord key={title} icon={<IconDroplet />} title={title} status="Open" statusColor={open} />
              ))}
            </ActionCardRecords>
          </ActionCardDetails>
        </ActionCard>

        <ActionCard status="error">
          <ActionCardHeader icon={<IconGitMerge />} verb="Could not merge two duplicate orders" />
          <ActionCardRecords>
            <ActionCardRecord
              icon={<IconReceipt />}
              title="Order 1042 · Hollins Florist"
              status="Open"
              statusColor={open}
            />
            <ActionCardRecord icon={<IconReceipt />} title="Order 1043 · Hollins Florist" state="Archived" />
          </ActionCardRecords>
          <ActionCardError>Order 1043 is archived. Restore it, then ask again to merge the two orders.</ActionCardError>
          <ActionCardDetails
            call={'merge_records({ into: "order-1042", from: "order-1043" })'}
            output="Error: order-1043 is archived and cannot be merged."
          />
        </ActionCard>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="m-0 min-h-5 text-[12.5px] text-muted-foreground">
          {note}
        </p>
        <Button variant="outline" size="sm" onClick={replay}>
          <IconRefresh aria-hidden="true" size={14} />
          Replay move
        </Button>
      </div>
    </div>
  );
}

type ReviewRecord = {
  id: string;
  title: string;
  status: string;
  color: string;
  detail: string;
  change?: { actor: string; from: string; fromColor: string; reason: string; failOnce?: boolean };
};

const reviewRecords: ReviewRecord[] = [
  {
    id: "tray-12",
    title: "Seed tray 12 · Basil",
    status: "Germinating",
    color: germinating,
    detail: "Sown 2 Nov by John Smith. Propagation house, heat mat 2.",
    change: {
      actor: "The assistant",
      from: "Sown",
      fromColor: open,
      reason: "John Smith reported shoots in 8 of 12 cells this morning.",
    },
  },
  {
    id: "bench-4",
    title: "Bench 4 irrigation",
    status: "In progress",
    color: inProgress,
    detail: "North and south drip lines. Assigned to Sam Taylor.",
    change: {
      actor: "Nightly watering check",
      from: "Open",
      fromColor: open,
      reason: "The north drip line read 40% flow at 02:00.",
      failOnce: true,
    },
  },
  {
    id: "crates",
    title: "Prepare Saturday market crates",
    status: "Open",
    color: open,
    detail: "Six crates, price cards and the card reader.",
  },
];

function AgentReviewDemo() {
  const [records, setRecords] = useState(reviewRecords);
  const [openId, setOpenId] = useState<string | undefined>("tray-12");
  const failed = useRef(new Set<string>());
  const settle = (id: string, revert: boolean) =>
    setRecords((list) =>
      list.map((r) =>
        r.id !== id || !r.change
          ? r
          : { ...r, change: undefined, ...(revert ? { status: r.change.from, color: r.change.fromColor } : {}) },
      ),
    );
  async function review(record: ReviewRecord) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (record.change?.failOnce && !failed.current.has(record.id)) {
      failed.current.add(record.id);
      throw new Error("Could not save the review. Check your connection and try again.");
    }
    settle(record.id, false);
  }
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <ul aria-label="Records" className="m-0 flex list-none flex-col gap-1 p-0">
        {records.map((record) => {
          const isOpen = openId === record.id;
          return (
            <li key={record.id} className="min-w-0">
              <Collapsible open={isOpen} onOpenChange={(next) => setOpenId(next ? record.id : undefined)}>
                <CollapsibleTrigger className="flex min-h-10 w-full min-w-0 items-center gap-2 rounded-md px-2.5 text-left text-[13px] outline-none hover:bg-tint focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-tint">
                  <IconBox aria-hidden="true" size={16} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 truncate font-medium">{record.title}</span>
                  <AnimatePresence initial={false}>
                    {record.change && (
                      <AgentBadge
                        key="badge"
                        label={`${record.change.actor} changed the status. Open the record to review it.`}
                      />
                    )}
                  </AnimatePresence>
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-[12px] text-muted-foreground">
                    <span aria-hidden="true" className="size-[7px] rounded-full" style={{ background: record.color }} />
                    {record.status}
                  </span>
                  <IconChevronDown
                    aria-hidden="true"
                    size={14}
                    className="shrink-0 text-muted-foreground transition-transform duration-(--spring-smooth-duration) ease-(--spring-smooth) motion-reduce:transition-none [[data-state=open]>&]:rotate-180"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col px-2.5 pt-2 pb-3">
                    <AgentReview
                      open={!!record.change}
                      className="mb-2"
                      actor={record.change?.actor ?? ""}
                      change={`moved this to ${record.status}`}
                      reason={record.change?.reason}
                      onReviewed={() => review(record)}
                      undo={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Undo this change"
                          title="Undo this change"
                          onClick={() => settle(record.id, true)}
                        >
                          <IconArrowBackUp aria-hidden="true" size={16} />
                        </Button>
                      }
                    />
                    <p className="m-0 text-[13px] text-muted-foreground">{record.detail}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            failed.current.clear();
            setRecords(reviewRecords);
            setOpenId("tray-12");
          }}
        >
          <IconRefresh aria-hidden="true" size={14} />
          Reset reviews
        </Button>
      </div>
    </div>
  );
}

type LogItem = ActivityEntryProps & { id: string; undoable?: boolean };

const now = new Date("2026-11-10T15:20:00");
const history: LogItem[] = [
  {
    id: "h5",
    actor: "Assistant",
    actorKind: "assistant",
    at: "2026-11-10T14:32:00",
    changes: ["Moved to In progress", "Assigned Sam Taylor"],
    reason: "Jane Doe asked me to start the repair after the nightly check.",
    undoable: true,
  },
  {
    id: "h4",
    actor: "Nightly watering check",
    actorKind: "automation",
    at: "2026-11-10T02:04:00",
    changes: ["High priority", "Due 12 Nov"],
    reason: "The north drip line read 40% flow at 02:00. The south line read 96%.",
  },
  {
    id: "h3",
    actor: "Jane Doe",
    at: "2026-11-09T17:45:00",
    comment: "Flushed the north line this afternoon. If it clogs again, swap the inline filter.",
  },
  {
    id: "h2",
    actor: "Jane Doe",
    at: "2026-11-03T09:12:00",
    changes: [
      "Renamed",
      "Project: Maintenance",
      "Tagged irrigation",
      "Checklist 0/4",
      "Due 6 Nov",
      "Assigned John Smith",
      "Added an image",
      "Edited description",
    ],
  },
  { id: "h1", actor: "Jane Doe", at: "2026-11-03T09:05:00", summary: "Created this record" },
];

const arrivals: Omit<LogItem, "at">[] = [
  {
    id: "n1",
    actor: "Jane Doe",
    comment: "Swapped the inline filter on the north line. Flow is back to 95%.",
  },
  {
    id: "n2",
    actor: "Assistant",
    actorKind: "assistant",
    changes: ["Moved to Done"],
    reason: "Jane Doe reported that flow is back to normal.",
  },
  {
    id: "n3",
    actor: "Nightly watering check",
    actorKind: "automation",
    summary: "Checked the drip lines",
    reason: "Both lines read above 90% flow.",
  },
];

function ActivityLogDemo() {
  const [items, setItems] = useState(history);
  const next = arrivals.find((a) => !items.some((i) => i.id === a.id));
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-[13px] font-medium">Bench 4 irrigation</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled={items === history} onClick={() => setItems(history)}>
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!next}
            onClick={() => next && setItems((list) => [{ ...next, at: now.toISOString() }, ...list])}
          >
            <IconPlus aria-hidden="true" size={14} />
            Add entry
          </Button>
        </div>
      </div>
      <ActivityLog aria-label="Bench 4 irrigation activity">
        {items.map(({ id, undoable, ...entry }) => (
          <ActivityEntry
            key={id}
            now={now}
            {...entry}
            undo={
              undoable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Undo this change"
                  title="Undo this change"
                  onClick={() => setItems((list) => list.filter((i) => i.id !== id))}
                >
                  <IconArrowBackUp aria-hidden="true" size={14} />
                </Button>
              ) : undefined
            }
          />
        ))}
      </ActivityLog>
    </div>
  );
}

export default function AgentActions() {
  return (
    <>
      <SpecimenItem
        name="Action card"
        note="Shows what an assistant did to records: a quiet line for reads, a card for changes. The verb shimmers while the action runs. Records and changes settle in when it is done."
      >
        <ActionCardDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Agent review"
        note="An AI mark on a record that an assistant changed, and one line to review the change. After the review, the mark and the line collapse away."
      >
        <AgentReviewDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Activity log"
        note="A record's history, newest first, with comments as notes. A new entry opens its height and arrives. Older entries move down with it."
      >
        <ActivityLogDemo />
      </SpecimenItem>
    </>
  );
}

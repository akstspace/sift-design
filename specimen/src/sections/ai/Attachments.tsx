import { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCopy,
  IconDownload,
  IconPlus,
  IconReload,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
  AttachmentEmpty,
  AttachmentHoverCard,
  AttachmentHoverCardTrigger,
  AttachmentHoverCardContent,
  getAttachmentLabel,
  type AttachmentData,
  type AttachmentVariant,
} from "@sift-design/ui/ai/attachments";
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose,
  ArtifactContent,
} from "@sift-design/ui/ai/artifact";
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
  type WebPreviewConsoleProps,
} from "@sift-design/ui/ai/web-preview";
import { SpecimenItem } from "../../frame";

// Sample photo content, like a real image file: its own soft colors on a light backdrop.
const plantImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" fill="#e4ebe7"/><path d="M0 150h240v30H0z" fill="#d5ddd8"/><path d="M97 116h47l-8 42h-31z" fill="#a8785f"/><path d="M95 112h51v8H95z" fill="#946650"/><path d="M118 121V53h5v68z" fill="#4f7a69"/><g fill="#6f9a86"><path d="M119 88C78 91 76 59 76 59s39-6 43 29"/><path d="M123 72c1-31 36-37 36-37s7 34-36 37"/><path d="M122 108c5-34 43-27 43-27s-4 32-43 27"/></g></svg>')}`;
const startingFiles: AttachmentData[] = [
  { id: "photo", type: "file", filename: "Herb bench.svg", mediaType: "image/svg+xml", url: plantImage },
  {
    id: "packing",
    type: "file",
    filename: "Market list.txt",
    mediaType: "text/plain",
    url: `data:text/plain,${encodeURIComponent("Saturday market\n6 crates\nPrice cards\nCard reader\nFloat")}`,
  },
  {
    id: "source",
    type: "source-document",
    sourceId: "market-notes",
    title: "Market notes",
    mediaType: "text/plain",
    filename: "Friday handover",
  },
];

function AttachmentsDemo() {
  const [files, setFiles] = useState(startingFiles);
  const [status, setStatus] = useState("Three attachments are ready.");
  const nextId = useRef(1);
  const add = () => {
    const id = nextId.current++;
    const file = new File(["Fernbrook Greenhouse\nCheck six crates before loading.\n"], `Crate note ${id}.txt`, {
      type: "text/plain",
    });
    const reader = new FileReader();
    reader.onload = () => {
      setFiles((previous) => [
        ...previous,
        { id: `sample-${id}`, type: "file", filename: file.name, mediaType: file.type, url: String(reader.result) },
      ]);
      setStatus(`${file.name} added.`);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={add}>
          <IconPlus aria-hidden className="size-4" />
          Add sample file
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setFiles([]);
            setStatus("All attachments removed.");
          }}
        >
          Remove all files
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setFiles(startingFiles);
            setStatus("Sample attachments restored.");
          }}
        >
          Reset files
        </Button>
      </div>
      {(["grid", "inline", "list"] as AttachmentVariant[]).map((variant) => (
        <section key={variant} className="space-y-2" aria-label={`${variant} attachments`}>
          <h4 className="text-[12px] font-medium">
            {variant === "grid"
              ? "Image and file previews"
              : variant === "inline"
                ? "Inline references"
                : "Files and source details"}
          </h4>
          <Attachments variant={variant}>
            {files.map((file) => (
              <Attachment
                key={file.id}
                data={file}
                onRemove={() => {
                  setFiles((previous) => previous.filter((item) => item.id !== file.id));
                  setStatus(`${getAttachmentLabel(file)} removed.`);
                }}
              >
                <AttachmentHoverCard openDelay={200}>
                  <AttachmentHoverCardTrigger asChild>
                    <button
                      type="button"
                      className={`ai-attachment-preview-button min-w-0 text-left outline-none ${variant === "grid" ? "block w-full" : "flex flex-1 items-center gap-2"}`}
                    >
                      <AttachmentPreview />
                      <AttachmentInfo showMediaType={variant === "list"} />
                    </button>
                  </AttachmentHoverCardTrigger>
                  <AttachmentHoverCardContent>
                    <div className="space-y-2">
                      {file.type === "file" && file.mediaType.startsWith("image/") && (
                        <img
                          src={file.url}
                          alt="Herb plant on the retail bench"
                          className="h-32 w-48 rounded-lg bg-subtle object-cover"
                        />
                      )}
                      <p className="font-medium">{getAttachmentLabel(file)}</p>
                      <p className="text-muted-foreground">
                        {file.type === "source-document"
                          ? "Source: Friday market handover."
                          : "Attached to the Saturday market plan."}
                      </p>
                      <p className="font-mono text-[12px] text-muted-foreground">{file.mediaType}</p>
                    </div>
                  </AttachmentHoverCardContent>
                </AttachmentHoverCard>
                <AttachmentRemove label={`Remove ${getAttachmentLabel(file)} from ${variant} view`} />
              </Attachment>
            ))}
            {files.length === 0 && (
              <AttachmentEmpty key="empty">No attachments. Add a sample file to begin.</AttachmentEmpty>
            )}
          </Attachments>
        </section>
      ))}
      <p role="status" className="text-[12px] text-muted-foreground">
        {status}
      </p>
    </div>
  );
}

const checklist = [
  "Pack six market crates",
  "Add herb and perennial price cards",
  "Charge the card reader",
  "Prepare the cash float",
];
const checklistText = `Crate checklist\nFernbrook Greenhouse · Saturday market\n\n${checklist.map((item) => `[ ] ${item}`).join("\n")}\n\nPrepared for Alex Lee.\n`;
function ArtifactDemo() {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("Checklist ready for review.");
  const openButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) openButton.current?.focus();
  }, [open]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(checklistText);
      setCopied(true);
      setStatus("Checklist copied.");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setStatus("Copy is unavailable. Download the checklist instead.");
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([checklistText], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "crate-checklist.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Checklist downloaded.");
  };
  return (
    <div className="w-full space-y-3">
      <Button
        ref={openButton}
        size="sm"
        variant="outline"
        disabled={open}
        onClick={() => {
          setOpen(true);
          setStatus("Checklist opened.");
        }}
      >
        Open checklist
      </Button>
      <div className="min-h-72 overflow-hidden">
        <Artifact open={open} aria-label="Crate checklist">
          <ArtifactHeader>
            <div className="min-w-0">
              <ArtifactTitle>Crate checklist</ArtifactTitle>
              <ArtifactDescription>Saturday market · Alex Lee</ArtifactDescription>
            </div>
            <ArtifactActions>
              <ArtifactAction
                icon={copied ? IconCheck : IconCopy}
                label={copied ? "Checklist copied" : "Copy checklist"}
                tooltip={copied ? "Copied" : "Copy checklist"}
                onClick={copy}
              />
              <ArtifactAction
                icon={IconDownload}
                label="Download checklist"
                tooltip="Download checklist"
                onClick={download}
              />
              <ArtifactClose
                onClick={() => {
                  setOpen(false);
                  setStatus("Checklist closed.");
                }}
              />
            </ArtifactActions>
          </ArtifactHeader>
          <ArtifactContent>
            <p className="mb-4 text-[12px] text-muted-foreground">Check each item before loading the van.</p>
            <ul className="space-y-3">
              {checklist.map((item, index) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" className="size-4 accent-(--primary)" />
                    <span className="font-mono text-[12px] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t pt-3 text-[12px] text-muted-foreground">
              Prepared from the market list and Friday handover.
            </p>
          </ArtifactContent>
        </Artifact>
      </div>
      <p role="status" className="text-[12px] text-muted-foreground">
        {status}
      </p>
    </div>
  );
}

type Palette = { surface: string; ink: string; muted: string; line: string; accent: string; soft: string };
const addresses = [
  "https://larkspur.example/market",
  "https://larkspur.example/herbs",
  "https://larkspur.example/collection",
];
function localPage(url: string, palette: Palette | null) {
  const index = addresses.indexOf(url);
  const title = ["Saturday market", "Herbs for your kitchen", "Collect at the greenhouse"][index] ?? "Page not found";
  const description =
    [
      "Plants grown at Fernbrook Greenhouse. Visit our stall on Saturday, from 09:00 to 13:00.",
      "Choose rosemary, thyme and mint. Each plant includes a care card.",
      "Collect reserved plants at the greenhouse gate. Bring your order reference.",
    ][index] ?? "This preview contains three local pages. Choose a page below.";
  const style = palette
    ? `--surface:${palette.surface};--ink:${palette.ink};--muted:${palette.muted};--line:${palette.line};--accent:${palette.accent};--soft:${palette.soft};`
    : "--surface:Canvas;--ink:CanvasText;--muted:CanvasText;--line:ButtonBorder;--accent:LinkText;--soft:Canvas;";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>:root{${style}}*{box-sizing:border-box}body{margin:0;background:var(--surface);color:var(--ink);font:14px/1.5 system-ui,sans-serif}header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 24px;border-bottom:1px solid var(--line)}header span{font-size:12px;color:var(--muted)}main{padding:28px 24px;max-width:700px}h1{font-size:30px;line-height:1.15;letter-spacing:-.02em;margin:12px 0}p{max-width:440px;color:var(--muted);margin:0 0 20px}.eyebrow{font-size:12px;color:var(--accent)}nav{display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;color:var(--ink);background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:8px 12px;cursor:pointer}button:focus-visible{outline:2px solid var(--accent);outline-offset:3px}small{display:block;margin-top:22px;color:var(--muted);font-size:12px}@media(max-width:440px){header,main{padding:18px}h1{font-size:30px}header span{display:none}}</style></head><body><header><strong>Fernbrook Greenhouse</strong><span>Plants for local gardens</span></header><main><div class="eyebrow">${index < 0 ? "Local preview" : "Grown here. Ready for your garden."}</div><h1>${title}</h1><p>${description}</p><nav aria-label="Greenhouse pages">${addresses.map((address, i) => `<button type="button" data-page="${address}" ${i === index ? 'aria-current="page"' : ""}>${["Market", "Herbs", "Collection"][i]}</button>`).join("")}</nav><small>This is a local preview. No orders are placed.</small></main><script>const send=(type,extra)=>parent.postMessage({channel:"greenhouse-preview",type,...extra},"*");send("log",{level:${index < 0 ? '"warn"' : '"log"'},message:${JSON.stringify(index < 0 ? "The address has no local page." : `${title} loaded.`)}});document.querySelectorAll("[data-page]").forEach(button=>button.addEventListener("click",()=>send("navigate",{url:button.dataset.page})));</script></body></html>`;
}
function WebPreviewDemo() {
  const [history, setHistory] = useState({ entries: [addresses[0]], position: 0 });
  const [logs, setLogs] = useState<NonNullable<WebPreviewConsoleProps["logs"]>>([]);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [revision, setRevision] = useState(0);
  const iframe = useRef<HTMLIFrameElement>(null);
  const nextLogId = useRef(1);
  const url = history.entries[history.position];
  const navigate = (address: string) =>
    setHistory((previous) =>
      previous.entries[previous.position] === address
        ? previous
        : { entries: [...previous.entries.slice(0, previous.position + 1), address], position: previous.position + 1 },
    );
  useEffect(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement);
      setPalette({
        surface: style.getPropertyValue("--surface"),
        ink: style.getPropertyValue("--ink"),
        muted: style.getPropertyValue("--muted"),
        line: style.getPropertyValue("--line"),
        accent: style.getPropertyValue("--accent"),
        soft: style.getPropertyValue("--accent-soft"),
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow || event.data?.channel !== "greenhouse-preview") return;
      if (event.data.type === "navigate" && addresses.includes(event.data.url)) navigate(event.data.url);
      if (
        event.data.type === "log" &&
        ["log", "warn", "error"].includes(event.data.level) &&
        typeof event.data.message === "string"
      ) {
        const entry = {
          id: `preview-log-${nextLogId.current++}`,
          level: event.data.level,
          message: event.data.message,
          timestamp: new Date(),
        };
        setLogs((previous) => [...previous.slice(-19), entry]);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return (
    <div className="w-full space-y-3">
      <p className="text-[12px] text-muted-foreground">
        Use the page buttons or enter a local address ending in <span className="font-mono">/market</span>,{" "}
        <span className="font-mono">/herbs</span> or <span className="font-mono">/collection</span>.
      </p>
      <WebPreview defaultUrl={addresses[0]} url={url} onUrlChange={navigate}>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton
            tooltip="Go back"
            disabled={history.position === 0}
            onClick={() => setHistory((previous) => ({ ...previous, position: previous.position - 1 }))}
          >
            <IconArrowLeft aria-hidden className="size-4" />
          </WebPreviewNavigationButton>
          <WebPreviewNavigationButton
            tooltip="Go forward"
            disabled={history.position === history.entries.length - 1}
            onClick={() => setHistory((previous) => ({ ...previous, position: previous.position + 1 }))}
          >
            <IconArrowRight aria-hidden className="size-4" />
          </WebPreviewNavigationButton>
          <WebPreviewNavigationButton tooltip="Reload preview" onClick={() => setRevision((previous) => previous + 1)}>
            <IconReload aria-hidden className="size-4" />
          </WebPreviewNavigationButton>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        {palette && (
          <WebPreviewBody
            ref={iframe}
            key={revision}
            srcDoc={localPage(url, palette)}
            sandbox="allow-scripts"
            title="Fernbrook Greenhouse local website preview"
            className="h-96"
          />
        )}
        <WebPreviewConsole logs={logs}>
          <div className="pt-2">
            <Button size="sm" variant="ghost" onClick={() => setLogs([])}>
              Clear console
            </Button>
          </div>
        </WebPreviewConsole>
      </WebPreview>
    </div>
  );
}

export default function AttachmentsExamples() {
  return (
    <>
      <SpecimenItem
        name="Attachments"
        note="Show files and sources in grid, inline or list form. New files arrive once, and remaining files close the gap."
        wide
      >
        <AttachmentsDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Artifact"
        note="Keep generated work in a separate panel. The panel enters from its edge and leaves on a shorter spring."
        wide
      >
        <ArtifactDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Web preview"
        note="Review local pages inside a browser frame. Navigation updates the address, and console entries arrive without moving existing text."
        wide
      >
        <WebPreviewDemo />
      </SpecimenItem>
    </>
  );
}

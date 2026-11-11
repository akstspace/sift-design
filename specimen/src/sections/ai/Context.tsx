import { useEffect, useState } from "react";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBook2,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconFileText,
  IconPlant2,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
  type ContextUsage,
} from "@sift-design/ui/ai/context";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorName,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorShortcut,
  ModelSelectorSeparator,
} from "@sift-design/ui/ai/model-selector";
import {
  OpenIn,
  OpenInTrigger,
  OpenInContent,
  OpenInLabel,
  OpenInSeparator,
  OpenInDestination,
} from "@sift-design/ui/ai/open-in-chat";
import { SpecimenItem } from "../../frame";

const models = [
  { provider: "Meadowlark", name: "Meadowlark 3", detail: "Detailed planning", window: "128,000" },
  { provider: "Meadowlark", name: "Meadowlark 3 Mini", detail: "Everyday questions", window: "64,000" },
  { provider: "Quarry", name: "Quarry Large", detail: "Long growing records", window: "200,000" },
  { provider: "Quarry", name: "Quarry Swift", detail: "Quick task updates", window: "64,000" },
  { provider: "Tidewater", name: "Tidewater 2", detail: "Research and summaries", window: "128,000" },
];
const levels = [12, 48, 76, 96];
const question = "Which seedlings need less water before the Fernbrook plant sale?";

function ContextDemo() {
  const [level, setLevel] = useState(0);
  const [details, setDetails] = useState(false);
  const value = levels[level];
  const used = value * 1280;
  const input = Math.round(used * 0.8);
  const output = used - input;
  const usage: ContextUsage = {
    inputTokens: input,
    outputTokens: output,
    inputTokenDetails: { noCacheTokens: input - 6400, cacheReadTokens: 6400, cacheWriteTokens: 0 },
    outputTokenDetails: { textTokens: output - 1200, reasoningTokens: 1200 },
  };
  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <IconPlant2 aria-hidden className="size-4" />
        Fernbrook Greenhouse<span className="ml-auto font-mono">Planning</span>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-[-0.01em]">Plant sale watering plan</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Growing notes, bench readings, and this conversation share the context window.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
        <span className="text-[13px]">Context used</span>
        <Context
          usedTokens={used}
          maxTokens={128000}
          usage={usage}
          modelId="meadowlark-3"
          pricing={{ input: 2, output: 8, cachedInput: 0.5 }}
          open={details}
          onOpenChange={setDetails}
        >
          <ContextTrigger />
          <ContextContent align="end">
            <ContextContentHeader />
            <ContextContentBody>
              <ContextInputUsage />
              <ContextOutputUsage />
              <ContextReasoningUsage />
              <ContextCacheUsage />
              <p className="pt-1 text-[12px] text-muted-foreground">
                Cache and reasoning counts are included in the input and output totals.
              </p>
            </ContextContentBody>
            <ContextContentFooter />
          </ContextContent>
        </Context>
      </div>
      <div role="status" aria-live="polite" className="flex items-start gap-2 text-[13px]">
        {value >= 90 ? (
          <IconAlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
        ) : (
          <IconCircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-good" />
        )}
        <div>
          <p className="font-medium">{value >= 90 ? "Near the context limit" : "Context space available"}</p>
          <p className="mt-0.5 text-muted-foreground">
            {value >= 90
              ? "Start a new conversation before you add more growing records."
              : "Add growing records to test the context meter."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setLevel(Math.min(3, level + 1))} disabled={level === 3}>
          Add growing records
          <IconArrowUpRight aria-hidden className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setLevel(0)} disabled={level === 0}>
          Reset context
        </Button>
      </div>
      <p className="text-[12px] text-muted-foreground">
        Select the meter or move the pointer over it to inspect token counts and example costs.
      </p>
    </div>
  );
}

function ModelDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(models[0]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <div className="w-full space-y-5">
      <div>
        <p className="text-sm font-semibold tracking-[-0.01em]">Choose how to plan</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Use a smaller model for task updates or a larger model for growing records.
        </p>
      </div>
      <ModelSelector open={open} onOpenChange={setOpen}>
        <ModelSelectorTrigger asChild>
          <Button
            variant="outline"
            className="h-auto min-h-12 w-full justify-start gap-3 px-3 py-2.5 [&_[data-slot=button-label]]:w-full"
            aria-keyshortcuts="Control+k Meta+k"
          >
            <ModelSelectorLogo provider={selected.provider} />
            <ModelSelectorName>{selected.name}</ModelSelectorName>
            <ModelSelectorShortcut>⌘ / Ctrl K</ModelSelectorShortcut>
            <IconChevronDown aria-hidden className="size-4" />
          </Button>
        </ModelSelectorTrigger>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Search models or providers…" aria-label="Search models or providers" />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models match. Try another name.</ModelSelectorEmpty>
            {["Meadowlark", "Quarry", "Tidewater"].map((provider, group) => (
              <div key={provider}>
                {group > 0 && <ModelSelectorSeparator />}
                <ModelSelectorGroup heading={provider}>
                  {models
                    .filter((model) => model.provider === provider)
                    .map((model) => (
                      <ModelSelectorItem
                        key={model.name}
                        value={`${model.provider} ${model.name}`}
                        onSelect={() => {
                          setSelected(model);
                          setOpen(false);
                        }}
                        className="min-h-14 gap-3 px-3 py-2"
                      >
                        <ModelSelectorLogo provider={provider} />
                        <ModelSelectorName>
                          <span className="block text-[13px] font-medium">{model.name}</span>
                          <span className="block text-[12px] text-muted-foreground">{model.detail}</span>
                        </ModelSelectorName>
                        {model.name === selected.name ? (
                          <IconCheck aria-label="Current model" className="size-4" />
                        ) : (
                          <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
                            {model.window}
                          </span>
                        )}
                      </ModelSelectorItem>
                    ))}
                </ModelSelectorGroup>
              </div>
            ))}
          </ModelSelectorList>
          <div className="flex flex-wrap justify-between gap-2 border-t bg-tint px-4 py-3 text-[12px] text-muted-foreground">
            <span>↑ ↓ Navigate · Enter Select</span>
            <span>Esc Close</span>
          </div>
        </ModelSelectorContent>
      </ModelSelector>
      <div role="status" className="flex items-start gap-2 text-[13px]">
        <IconCircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-good" />
        <div>
          <p>{selected.name} selected</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Context limit: <span className="font-mono tabular-nums">{selected.window}</span> tokens
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t pt-4 text-[12px] text-muted-foreground">
        <ModelSelectorLogoGroup>
          {["Meadowlark", "Quarry", "Tidewater"].map((provider) => (
            <ModelSelectorLogo key={provider} provider={provider} />
          ))}
        </ModelSelectorLogoGroup>
        <span>Three providers. All examples run locally.</span>
      </div>
    </div>
  );
}

function OpenInDemo() {
  return (
    <div className="w-full space-y-5">
      <div className="text-[12px] text-muted-foreground">Share a greenhouse question</div>
      <p className="max-w-lg text-sm leading-relaxed font-semibold tracking-[-0.01em]">{question}</p>
      <p className="text-[13px] text-muted-foreground">
        Choose a destination to continue with the same question. Each link opens in a new tab.
      </p>
      <OpenIn query={question}>
        <OpenInTrigger />
        <OpenInContent>
          <OpenInLabel>Continue with this question</OpenInLabel>
          <OpenInSeparator />
          <OpenInDestination
            title="Larkspur Notes"
            href={(query) => `https://larkspur.example/notes?${new URLSearchParams({ q: query })}`}
            icon={<IconFileText />}
          />
          <OpenInDestination
            title="Fernbrook Wiki"
            href={(query) => `https://larkspur.example/wiki?${new URLSearchParams({ q: query })}`}
            icon={<IconBook2 />}
          />
        </OpenInContent>
      </OpenIn>
      <p className="text-[12px] text-muted-foreground">
        Example links only. No question is sent until you open a destination.
      </p>
    </div>
  );
}

export default function ContextExamples() {
  return (
    <>
      <SpecimenItem
        name="Context"
        note="Inspect the context window and token costs. The ring follows changes with a smooth spring."
      >
        <ContextDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Model selector"
        note="Search models by provider or name. The dialog settles into place and returns focus when closed."
      >
        <ModelDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Open in chat"
        note="Continue a question in another destination. The menu opens from its trigger."
      >
        <OpenInDemo />
      </SpecimenItem>
    </>
  );
}

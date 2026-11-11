import { useEffect, useState } from "react";
import {
  IconArrowBarToRight,
  IconCheck,
  IconClipboardList,
  IconFileText,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@sift-design/ui/ai/reasoning";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@sift-design/ui/ai/chain-of-thought";
import { SpecimenItem } from "../../frame";

const thinking = [
  "I will compare the bench readings with the watering log.",
  "\n\nBench 4 received the same watering cycle as bench 3. Its moisture reading fell sooner after the afternoon vent opened.",
  "\n\nThe vent may increase air movement around the smaller pots. A blocked nozzle is also possible. The readings do not confirm either cause.",
  "\n\nCheck the nozzle coverage first. Then compare pot moisture before and after the vent opens.",
];
const crateImage = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="560" height="180" viewBox="0 0 560 180"><style>:root{color-scheme:light dark;color:CanvasText} .line{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;opacity:.62}</style><g class="line"><path opacity=".25" d="M30 153h500"/><g transform="translate(74 0)"><path d="M0 92h166l-9 58H9zM7 112h152M10 130h146M40 95v52M82 95v52M124 95v52"/><g transform="translate(21 0)"><path d="M10 90l-4-29h29l-4 29M20 61V30M20 46C-3 48-1 27 20 41M20 37c24 1 25-21 0-9"/></g><g transform="translate(65 0)"><path d="M10 90L6 61h29l-4 29M20 61V24M20 43C-3 46 0 21 20 36M20 32c24 1 24-21 0-10"/></g><g transform="translate(110 0)"><path d="M10 90L6 61h29l-4 29M20 61V33M20 49C-3 49-1 27 20 42M20 38c24 1 24-21 0-9"/></g></g><g transform="translate(316 0)"><path d="M0 92h166l-9 58H9zM7 112h152M10 130h146M40 95v52M82 95v52M124 95v52M22 90l-4-35h32l-4 35M34 55V26M34 42c-21 0-25-18 0-13M34 36c22 2 25-17 0-11M70 90l-4-35h32l-4 35M82 55V26M82 42c-21 0-25-18 0-13M82 36c22 2 25-17 0-11M118 90l-4-35h32l-4 35M130 55V26M130 42c-21 0-25-18 0-13M130 36c22 2 25-17 0-11"/></g></g></svg>`)}`;

function ReasoningDemo() {
  const [run, setRun] = useState(0);
  const [part, setPart] = useState(1);
  const streaming = part < 5;
  useEffect(() => {
    if (!streaming) return;
    const timer = setTimeout(() => setPart((value) => value + 1), 900);
    return () => clearTimeout(timer);
  }, [part, run, streaming]);
  const replay = () => {
    setPart(1);
    setRun((value) => value + 1);
  };
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1 border-b pb-4">
        <p className="text-[12px] text-muted-foreground">
          Polytunnel <span className="font-mono">2</span> · Irrigation
        </p>
        <h4 className="text-[14px] font-medium">
          Why is bench <span className="font-mono">4</span> drying out faster?
        </h4>
      </div>
      <Reasoning key={run} isStreaming={streaming}>
        <ReasoningTrigger />
        <ReasoningContent>{thinking.slice(0, Math.min(part, 4)).join("")}</ReasoningContent>
      </Reasoning>
      {!streaming && (
        <div className="space-y-2 text-[13px] leading-relaxed">
          <p className="flex items-center gap-2 font-medium">
            <IconCheck aria-hidden="true" className="size-4 text-good" />
            Check water coverage before changing the schedule.
          </p>
          <p className="text-muted-foreground">
            Air movement near the vent may dry the smaller pots faster. The readings do not rule out a blocked nozzle.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        <Button variant="outline" size="sm" onClick={replay}>
          <IconRefresh aria-hidden="true" className="size-3.5" />
          Replay reasoning
        </Button>
        <Button variant="ghost" size="sm" disabled={!streaming} onClick={() => setPart(5)}>
          <IconArrowBarToRight aria-hidden="true" className="size-3.5" />
          Finish reasoning
        </Button>
      </div>
    </div>
  );
}

function ChainDemo() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(0);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (phase === 3) return;
    const timer = setTimeout(() => setPhase((value) => value + 1), 1600);
    return () => clearTimeout(timer);
  }, [phase, run]);
  const replay = () => {
    setPhase(0);
    setRun((value) => value + 1);
    setOpen(true);
  };
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1 border-b pb-4">
        <p className="text-[12px] text-muted-foreground">Fernbrook Greenhouse · Saturday market</p>
        <h4 className="text-[14px] font-medium">Plan Saturday market crates</h4>
      </div>
      <ChainOfThought key={run} open={open} onOpenChange={setOpen}>
        <ChainOfThoughtHeader>
          <span aria-live="polite">{phase === 3 ? "Crate plan ready" : "Preparing the crate plan"}</span>
        </ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            icon={IconSearch}
            label="Check stock and reservations"
            status={phase === 0 ? "active" : "complete"}
            description="Keep reserved plants out of the market allocation."
          >
            <ChainOfThoughtSearchResults>
              <ChainOfThoughtSearchResult>
                <IconFileText aria-hidden="true" />
                Bench inventory
              </ChainOfThoughtSearchResult>
              <ChainOfThoughtSearchResult>
                <IconFileText aria-hidden="true" />
                Saturday orders
              </ChainOfThoughtSearchResult>
            </ChainOfThoughtSearchResults>
          </ChainOfThoughtStep>
          {phase >= 1 && (
            <ChainOfThoughtStep
              key="packing"
              icon={IconClipboardList}
              label="Group plants for packing"
              status={phase === 1 ? "active" : "complete"}
              description={
                <>
                  Allocate <span className="font-mono">6</span> crates. Keep herbs upright and separate flowering
                  plants.
                </>
              }
            >
              <ChainOfThoughtImage caption="Packing reference: keep pots upright and leave space around the leaves.">
                <img
                  src={crateImage}
                  width={560}
                  height={180}
                  alt="Two slatted crates hold upright herb pots with space between the leaves."
                />
              </ChainOfThoughtImage>
            </ChainOfThoughtStep>
          )}
          <ChainOfThoughtStep
            key="checklist"
            label="Prepare the handover checklist"
            status={phase < 2 ? "pending" : phase === 2 ? "active" : "complete"}
            description={
              phase < 2
                ? "Waiting for the crate allocation."
                : "Alex Lee: add price cards, charge the card reader, and check the cash float."
            }
          />
        </ChainOfThoughtContent>
      </ChainOfThought>
      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        <Button variant="outline" size="sm" onClick={replay}>
          <IconRefresh aria-hidden="true" className="size-3.5" />
          Replay crate plan
        </Button>
        <Button variant="ghost" size="sm" disabled={phase === 3} onClick={() => setPhase(3)}>
          <IconArrowBarToRight aria-hidden="true" className="size-3.5" />
          Finish crate plan
        </Button>
      </div>
    </div>
  );
}

export default function ReasoningExamples() {
  return (
    <>
      <SpecimenItem
        name="Reasoning"
        note="Show supporting notes while an answer develops. The panel opens during thinking and closes after completion."
      >
        <ReasoningDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Chain of thought"
        note="Show work as a sequence of steps. New steps arrive gently, and the active indicator stops when work ends."
      >
        <ChainDemo />
      </SpecimenItem>
    </>
  );
}

import { useId, useRef, useState } from "react";
import { IconCheck, IconMail, IconPlant2, IconRestore, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { Button } from "@sift-design/ui/button";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@sift-design/ui/ai/confirmation";
import {
  Question,
  QuestionActions,
  QuestionDescription,
  QuestionInput,
  QuestionOption,
  QuestionOptions,
  QuestionPrompt,
  QuestionSubmit,
  type QuestionValue,
} from "@sift-design/ui/ai/question";
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@sift-design/ui/ai/checkpoint";
import { Message, MessageContent } from "@sift-design/ui/ai/message";
import { SpecimenItem } from "../../frame";

function ApprovalDemo() {
  const [decision, setDecision] = useState<boolean>();
  const resetButton = useRef<HTMLButtonElement>(null);
  const reset = () => setDecision(undefined);
  const decide = (approved: boolean) => {
    setDecision(approved);
    requestAnimationFrame(() => resetButton.current?.focus());
  };
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <IconMail aria-hidden="true" className="size-4" />
        <span>Order correspondence</span>
        <span className="ml-auto font-mono">ORD-1048</span>
      </div>
      <Confirmation
        approval={{ id: "order-confirmation", approved: decision }}
        state={decision === undefined ? "approval-requested" : "approval-responded"}
      >
        <ConfirmationTitle>
          <ConfirmationRequest>
            <p className="font-medium">Send the 40-tray order confirmation to Hollins Florist</p>
            <p className="mt-1 text-muted-foreground">The draft confirms 40 lavender trays for collection on Friday.</p>
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <div className="flex items-center gap-2 font-medium">
              <IconCheck aria-hidden="true" className="size-4 text-good" />
              Sending approved
            </div>
            <p className="mt-1 text-muted-foreground">
              The order confirmation is ready to send. This example sends no email.
            </p>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <div className="flex items-center gap-2 font-medium">
              <IconX aria-hidden="true" className="size-4" />
              Sending denied
            </div>
            <p className="mt-1 text-muted-foreground">The draft is unchanged. No email was sent.</p>
          </ConfirmationRejected>
        </ConfirmationTitle>
        <ConfirmationActions>
          <ConfirmationAction variant="outline" onClick={() => decide(false)}>
            Deny
          </ConfirmationAction>
          <ConfirmationAction onClick={() => decide(true)}>Approve</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">Approval applies to this email only.</p>
        <Button
          ref={resetButton}
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={decision === undefined}
        >
          Reset approval
        </Button>
      </div>
    </div>
  );
}

function QuestionDemo() {
  const [multiple, setMultiple] = useState(false);
  const [value, setValue] = useState<QuestionValue>({ selectedValues: [], text: "" });
  const [submitted, setSubmitted] = useState(false);
  const inputId = useId();
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <IconPlant2 aria-hidden="true" className="size-4" />
          Lavender placement
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-pressed={multiple}
          onClick={() => {
            setMultiple(!multiple);
            setValue({ selectedValues: [], text: "" });
            setSubmitted(false);
          }}
        >
          {multiple ? "Use one bench" : "Use several benches"}
        </Button>
      </div>
      <Question
        value={value}
        onValueChange={setValue}
        submitted={submitted}
        onSubmittedChange={setSubmitted}
        selectionMode={multiple ? "multiple" : "single"}
        aria-label="Lavender bench assignment"
        summary={(response) => (
          <>
            <span>{response.selectedValues.join(", ")}</span>
            {response.text && (
              <span>
                {response.selectedValues.length > 0 ? " · " : ""}
                {response.text}
              </span>
            )}
          </>
        )}
      >
        <div className="space-y-1">
          <QuestionPrompt>Which bench should the lavender go on?</QuestionPrompt>
          <QuestionDescription>
            {multiple
              ? "Choose one or more benches. Add a note if needed."
              : "Choose one bench, or enter another location below."}
          </QuestionDescription>
        </div>
        <QuestionOptions>
          <QuestionOption value="Bench 2">
            Bench <span className="font-mono">2</span> · Morning sun
          </QuestionOption>
          <QuestionOption value="Bench 4">
            Bench <span className="font-mono">4</span> · Full sun
          </QuestionOption>
          <QuestionOption value="Bench 6">
            Bench <span className="font-mono">6</span> · Near collection
          </QuestionOption>
        </QuestionOptions>
        <div className="space-y-2">
          <label htmlFor={inputId} className="block text-[12px] font-medium">
            Other location or note
          </label>
          <QuestionInput id={inputId} placeholder="For example, the west propagation bench" rows={2} />
        </div>
        <QuestionActions>
          <QuestionSubmit>Submit answer</QuestionSubmit>
        </QuestionActions>
      </Question>
    </div>
  );
}

/** A person's line is a chat pill; the assistant answers in plain prose, as in the chat. */
function Line({ from, children }: { from: "user" | "assistant"; children: string }) {
  return (
    <Message from={from}>
      <MessageContent>{children}</MessageContent>
    </Message>
  );
}

function CheckpointDemo() {
  const [restored, setRestored] = useState(false);
  const reduced = useReducedMotion();
  const later = [
    { id: "person", from: "user" as const, text: "Move them to bench 6 instead." },
    {
      id: "assistant",
      from: "assistant" as const,
      text: "I moved the lavender task to bench 6. The collection team can reach it there.",
    },
  ];
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">Lavender task · Conversation</p>
        <Button type="button" variant="ghost" size="sm" disabled={!restored} onClick={() => setRestored(false)}>
          Replay conversation
        </Button>
      </div>
      <div className="space-y-4">
        <Line from="user">Put the lavender on bench 4.</Line>
        <Line from="assistant">The lavender task now points to bench 4.</Line>
      </div>
      <Checkpoint>
        <CheckpointTrigger
          tooltip="Return to bench 4 and remove the two later messages."
          aria-disabled={restored}
          onClick={() => {
            if (!restored) setRestored(true);
          }}
        >
          <CheckpointIcon /> Restore checkpoint
        </CheckpointTrigger>
      </Checkpoint>
      <AnimatePresence initial={false}>
        {!restored &&
          later.map((message) => (
            <motion.div
              key={message.id}
              className="overflow-hidden"
              initial={{ opacity: 0, height: reduced ? "auto" : 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{
                opacity: 0,
                height: reduced ? "auto" : 0,
                marginTop: reduced ? undefined : 0,
                transition: {
                  ...(reduced ? { duration: duration.instant } : spring.exit),
                  opacity: { duration: duration.instant, ease: leave },
                },
              }}
              transition={
                reduced ? { duration: duration.quick } : { ...spring.smooth, opacity: { duration: duration.quick } }
              }
            >
              <div className="pb-4">
                <Line from={message.from}>{message.text}</Line>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
      <p role="status" className="flex min-h-5 items-start gap-2 text-[12px] text-muted-foreground">
        {restored ? (
          <>
            <IconRestore aria-hidden="true" className="size-4 shrink-0" />
            Checkpoint restored. Bench 4 is active. Two later messages were removed.
          </>
        ) : (
          "Restore removes later messages in this example only."
        )}
      </p>
    </div>
  );
}

export default function ConfirmationExamples() {
  return (
    <>
      <SpecimenItem
        name="Confirmation"
        note="Ask for approval before a consequential action. The decision cross-fades as the panel height adjusts."
      >
        <ApprovalDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Question"
        note="Ask for a choice or a written answer. Selection moves between options; submission collapses to an answer summary."
      >
        <QuestionDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Checkpoint"
        note="Restore an earlier conversation state. Later messages fade out before the conversation closes the space."
      >
        <CheckpointDemo />
      </SpecimenItem>
    </>
  );
}

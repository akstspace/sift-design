import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Spinner } from "@sift-design/ui/spinner";
import { SpecimenGroup } from "../frame";

// Each file holds the examples for a few related components. They load on
// demand, and `?ai=<group>` shows one group alone while you work on it.
const groups: Record<string, LazyExoticComponent<ComponentType>> = {
  "conversation": lazy(() => import("./ai/Conversation")),
  "message": lazy(() => import("./ai/Message")),
  "prompt-input": lazy(() => import("./ai/PromptInput")),
  "reasoning": lazy(() => import("./ai/Reasoning")),
  "tool": lazy(() => import("./ai/Tool")),
  "sources": lazy(() => import("./ai/Sources")),
  "task": lazy(() => import("./ai/Task")),
  "confirmation": lazy(() => import("./ai/Confirmation")),
  "context": lazy(() => import("./ai/Context")),
  "attachments": lazy(() => import("./ai/Attachments")),
  "canvas": lazy(() => import("./ai/Canvas")),
  "agent": lazy(() => import("./ai/Agent")),
  "terminal": lazy(() => import("./ai/Terminal")),
  "file-tree": lazy(() => import("./ai/FileTree")),
  "commit": lazy(() => import("./ai/Commit")),
  "audio": lazy(() => import("./ai/Audio")),
  "voice": lazy(() => import("./ai/Voice")),
  "persona": lazy(() => import("./ai/Persona")),
  "chat-demo": lazy(() => import("./ai/ChatDemo")),
};

const sections = [
  {
    id: "ai-chat",
    title: "A complete conversation",
    intro: "A mock assistant conversation composed from the components below. It streams a fixed script; it does not call a model.",
    groups: ["chat-demo"],
  },
  {
    id: "ai-conversation",
    title: "Conversation and input",
    intro: "Lay out messages, take a prompt with files, choose a model and show how much context is used.",
    groups: ["conversation","message","prompt-input","context","attachments"],
  },
  {
    id: "ai-work",
    title: "Reasoning and actions",
    intro: "Show how the assistant reasons, calls tools, cites sources, plans work and asks before it acts.",
    groups: ["reasoning","tool","sources","task","confirmation"],
  },
  {
    id: "ai-code",
    title: "Code and developer tools",
    intro: "Show agent setups, terminal output, test runs, file trees and commits.",
    groups: ["agent","terminal","file-tree","commit"],
  },
  {
    id: "ai-canvas",
    title: "Workflow canvas",
    intro: "Draw a workflow as connected steps on a pannable canvas.",
    groups: ["canvas"],
  },
  {
    id: "ai-voice",
    title: "Voice",
    intro: "Play and record audio, pick a microphone or voice, and show a speaking assistant.",
    groups: ["audio","voice","persona"],
  },
];

export default function AI() {
  const only = new URLSearchParams(location.search).get("ai");
  return (
    <div id="ai" className="flex flex-col gap-14">
      {sections
        .filter((section) => !only || section.groups.includes(only))
        .map((section) => (
          <SpecimenGroup key={section.id} id={section.id} title={section.title} intro={section.intro}>
            <Suspense
              fallback={
                <p className="flex items-center gap-2" role="status">
                  <Spinner />
                  Loading the examples…
                </p>
              }
            >
              {section.groups
                .filter((group) => !only || group === only)
                .map((group) => {
                  const Group = groups[group];
                  return <Group key={group} />;
                })}
            </Suspense>
          </SpecimenGroup>
        ))}
    </div>
  );
}

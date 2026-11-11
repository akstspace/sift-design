import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@sift-design/ui/accordion";
import { Badge } from "@sift-design/ui/badge";
import { IconRobot } from "@tabler/icons-react";
import type { Tool } from "ai";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { memo } from "react";

import { CodeBlock } from "./code-block";

export type AgentProps = ComponentProps<"div">;
export const Agent = memo(({ className, ...props }: AgentProps) => (
  <div
    data-slot="agent"
    className={cn("not-prose w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
    {...props}
  />
));

export type AgentHeaderProps = ComponentProps<"div"> & { name: string; model?: string };
export const AgentHeader = memo(({ className, name, model, ...props }: AgentHeaderProps) => (
  <div
    data-slot="agent-header"
    className={cn("flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4", className)}
    {...props}
  >
    <div className="flex min-w-0 items-center gap-2.5">
      <IconRobot aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-[14px] font-medium">{name}</span>
    </div>
    {model && (
      <Badge className="font-mono text-[12px]" variant="secondary">
        {model}
      </Badge>
    )}
  </div>
));

export type AgentContentProps = ComponentProps<"div">;
export const AgentContent = memo(({ className, ...props }: AgentContentProps) => (
  <div data-slot="agent-content" className={cn("space-y-5 p-4", className)} {...props} />
));

export type AgentInstructionsProps = ComponentProps<"div"> & { children: string };
export const AgentInstructions = memo(({ className, children, ...props }: AgentInstructionsProps) => (
  <div data-slot="agent-instructions" className={cn("space-y-2", className)} {...props}>
    <div className="text-[12px] font-medium text-muted-foreground">Instructions</div>
    <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{children}</p>
  </div>
));

export type AgentToolsProps = ComponentProps<typeof Accordion>;
export const AgentTools = memo(({ className, ...props }: AgentToolsProps) => (
  <div data-slot="agent-tools" className={cn("space-y-2", className)}>
    <div className="text-[12px] font-medium text-muted-foreground">Tools</div>
    <Accordion className="border-y" {...props} />
  </div>
));

export type AgentToolProps = ComponentProps<typeof AccordionItem> & { tool: Tool };
export const AgentTool = memo(({ className, tool, value, ...props }: AgentToolProps) => {
  const schema = "jsonSchema" in tool && tool.jsonSchema ? tool.jsonSchema : tool.inputSchema;
  return (
    <AccordionItem data-agent-tool="" className={cn("border-b last:border-b-0", className)} value={value} {...props}>
      <AccordionTrigger className="px-1 py-3 text-[13px] hover:no-underline">
        {typeof tool.description === "string" ? tool.description : value || "No description"}
      </AccordionTrigger>
      <AccordionContent className="min-w-0 pb-3">
        <CodeBlock code={JSON.stringify(schema, null, 2) ?? "{}"} language="json" />
      </AccordionContent>
    </AccordionItem>
  );
});

export type AgentOutputProps = ComponentProps<"div"> & { schema: string };
export const AgentOutput = memo(({ className, schema, ...props }: AgentOutputProps) => (
  <div data-slot="agent-output" className={cn("min-w-0 space-y-2", className)} {...props}>
    <div className="text-[12px] font-medium text-muted-foreground">Output schema</div>
    <CodeBlock code={schema} language="typescript" />
  </div>
));

Agent.displayName = "Agent";
AgentHeader.displayName = "AgentHeader";
AgentContent.displayName = "AgentContent";
AgentInstructions.displayName = "AgentInstructions";
AgentTools.displayName = "AgentTools";
AgentTool.displayName = "AgentTool";
AgentOutput.displayName = "AgentOutput";

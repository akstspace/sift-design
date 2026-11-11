import { Badge } from "@sift-design/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { cn } from "cn";
import { IconChevronRight as ChevronRightIcon } from "@tabler/icons-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { createContext, useContext, useMemo } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface SchemaParameter {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  location?: "path" | "query" | "header";
}

interface SchemaProperty {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  properties?: SchemaProperty[];
  items?: SchemaProperty;
}

interface SchemaDisplayContextType {
  method: HttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
}

const SchemaDisplayContext = createContext<SchemaDisplayContextType>({
  method: "GET",
  path: "",
});

const methodStyles: Record<HttpMethod, string> = {
  DELETE: "bg-tint text-danger",
  GET: "bg-accent-soft text-good",
  PATCH: "bg-tint text-warn",
  POST: "bg-accent-soft text-link",
  PUT: "bg-tint text-warn",
};

export type SchemaDisplayHeaderProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayHeader = ({ className, children, ...props }: SchemaDisplayHeaderProps) => (
  <div className={cn("flex flex-wrap items-center gap-3 border-b px-4 py-3", className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayMethodProps = ComponentProps<typeof Badge>;

export const SchemaDisplayMethod = ({ className, children, ...props }: SchemaDisplayMethodProps) => {
  const { method } = useContext(SchemaDisplayContext);

  return (
    <Badge className={cn("font-mono text-[12px]", methodStyles[method], className)} variant="secondary" {...props}>
      {children ?? method}
    </Badge>
  );
};

export type SchemaDisplayPathProps = HTMLAttributes<HTMLSpanElement>;

export const SchemaDisplayPath = ({ className, children, ...props }: SchemaDisplayPathProps) => {
  const { path } = useContext(SchemaDisplayContext);

  return (
    <span className={cn("min-w-0 break-all font-mono text-[13px]", className)} {...props}>
      {children ??
        path.split(/(\{[^}]+\})/g).map((part, index) =>
          part.startsWith("{") ? (
            <span key={index} className="text-link">
              {part}
            </span>
          ) : (
            part
          ),
        )}
    </span>
  );
};

export type SchemaDisplayDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const SchemaDisplayDescription = ({ className, children, ...props }: SchemaDisplayDescriptionProps) => {
  const { description } = useContext(SchemaDisplayContext);

  return (
    <p className={cn("border-b px-4 py-3 text-muted-foreground text-[13px]", className)} {...props}>
      {children ?? description}
    </p>
  );
};

export type SchemaDisplayContentProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayContent = ({ className, children, ...props }: SchemaDisplayContentProps) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayParameterProps = HTMLAttributes<HTMLDivElement> & SchemaParameter;

export const SchemaDisplayParameter = ({
  name,
  type,
  required,
  description,
  location,
  className,
  ...props
}: SchemaDisplayParameterProps) => (
  <div className={cn("px-5 py-3", className)} {...props}>
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[13px]">{name}</span>
      <Badge className="border-transparent bg-tint font-mono text-xs text-muted-foreground" variant="secondary">
        {type}
      </Badge>
      {location && (
        <Badge className="text-[12px]" variant="secondary">
          {location}
        </Badge>
      )}
      {required && (
        <Badge className="bg-tint text-warn text-[12px]" variant="secondary">
          required
        </Badge>
      )}
    </div>
    {description && <p className="mt-1 text-muted-foreground text-[13px]">{description}</p>}
  </div>
);

export type SchemaDisplayParametersProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayParameters = ({ className, children, ...props }: SchemaDisplayParametersProps) => {
  const { parameters } = useContext(SchemaDisplayContext);

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className="ai-schema-trigger group flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left hover:bg-tint">
        <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground ai-schema-chevron" />
        <span className="font-medium text-[13px]">Parameters</span>
        <Badge className="ml-auto text-[12px]" variant="secondary">
          {parameters?.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="divide-y border-t">
          {children ?? parameters?.map((param) => <SchemaDisplayParameter key={param.name} {...param} />)}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type SchemaDisplayPropertyProps = HTMLAttributes<HTMLDivElement> &
  SchemaProperty & {
    depth?: number;
  };

export const SchemaDisplayProperty = ({
  name,
  type,
  required,
  description,
  properties,
  items,
  depth = 0,
  className,
  ...props
}: SchemaDisplayPropertyProps) => {
  const hasChildren = properties || items;
  const paddingLeft = 20 + Math.min(depth, 6) * 16;

  if (hasChildren) {
    return (
      <Collapsible {...props} defaultOpen={depth < 2}>
        <CollapsibleTrigger
          className={cn(
            "ai-schema-trigger group flex w-full flex-wrap items-center gap-2 py-3 text-left hover:bg-tint",
            className,
          )}
          style={{ paddingLeft }}
        >
          <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground ai-schema-chevron" />
          <span className="font-mono text-[13px]">{name}</span>
          <Badge className="border-transparent bg-tint font-mono text-xs text-muted-foreground" variant="secondary">
            {type}
          </Badge>
          {required && (
            <Badge className="bg-tint text-warn text-[12px]" variant="secondary">
              required
            </Badge>
          )}
        </CollapsibleTrigger>
        {description && (
          <p className="pb-2 text-muted-foreground text-[13px]" style={{ paddingLeft: paddingLeft + 24 }}>
            {description}
          </p>
        )}
        <CollapsibleContent>
          {/* Nested properties read as an indented group; only top-level rows carry dividers. */}
          <div className="pb-1">
            {properties?.map((prop) => (
              <SchemaDisplayProperty key={prop.name} {...prop} depth={depth + 1} />
            ))}
            {items && <SchemaDisplayProperty {...items} depth={depth + 1} name={`${name}[]`} />}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={cn("py-3 pr-4", className)} style={{ paddingLeft }} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Spacer for alignment */}
        <span className="size-4" />
        <span className="font-mono text-[13px]">{name}</span>
        <Badge className="border-transparent bg-tint font-mono text-xs text-muted-foreground" variant="secondary">
          {type}
        </Badge>
        {required && (
          <Badge className="bg-tint text-warn text-[12px]" variant="secondary">
            required
          </Badge>
        )}
      </div>
      {description && <p className="mt-1 pl-6 text-muted-foreground text-[13px]">{description}</p>}
    </div>
  );
};

export type SchemaDisplayRequestProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayRequest = ({ className, children, ...props }: SchemaDisplayRequestProps) => {
  const { requestBody } = useContext(SchemaDisplayContext);

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className="ai-schema-trigger group flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left hover:bg-tint">
        <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground ai-schema-chevron" />
        <span className="font-medium text-[13px]">Request body</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t">
          {children ?? requestBody?.map((prop) => <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />)}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type SchemaDisplayResponseProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayResponse = ({ className, children, ...props }: SchemaDisplayResponseProps) => {
  const { responseBody } = useContext(SchemaDisplayContext);

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className="ai-schema-trigger group flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left hover:bg-tint">
        <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground ai-schema-chevron" />
        <span className="font-medium text-[13px]">Response</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t">
          {children ?? responseBody?.map((prop) => <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />)}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type SchemaDisplayProps = HTMLAttributes<HTMLDivElement> & {
  method: HttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
};

export const SchemaDisplay = ({
  method,
  path,
  description,
  parameters,
  requestBody,
  responseBody,
  className,
  children,
  ...props
}: SchemaDisplayProps) => {
  const contextValue = useMemo(
    () => ({
      description,
      method,
      parameters,
      path,
      requestBody,
      responseBody,
    }),
    [description, method, parameters, path, requestBody, responseBody],
  );

  return (
    <SchemaDisplayContext.Provider value={contextValue}>
      <div className={cn("ai-schema-display min-w-0 overflow-hidden rounded-lg border bg-card", className)} {...props}>
        {children ?? (
          <>
            <SchemaDisplayHeader>
              <div className="flex flex-wrap items-center gap-3">
                <SchemaDisplayMethod />
                <SchemaDisplayPath />
              </div>
            </SchemaDisplayHeader>
            {description && <SchemaDisplayDescription />}
            <SchemaDisplayContent>
              {parameters && parameters.length > 0 && <SchemaDisplayParameters />}
              {requestBody && requestBody.length > 0 && <SchemaDisplayRequest />}
              {responseBody && responseBody.length > 0 && <SchemaDisplayResponse />}
            </SchemaDisplayContent>
          </>
        )}
      </div>
    </SchemaDisplayContext.Provider>
  );
};

export type SchemaDisplayBodyProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayBody = ({ className, children, ...props }: SchemaDisplayBodyProps) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayExampleProps = HTMLAttributes<HTMLPreElement>;

export const SchemaDisplayExample = ({ className, children, ...props }: SchemaDisplayExampleProps) => (
  <pre className={cn("mx-4 mb-4 overflow-auto rounded-md bg-subtle p-4 font-mono text-[13px]", className)} {...props}>
    {children}
  </pre>
);

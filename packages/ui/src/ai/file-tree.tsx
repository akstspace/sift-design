import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { duration, selectionSpring } from "@sift-design/tokens/motion";
import { IconChevronRight, IconFile, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { cn } from "cn";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

interface FileTreeContextType {
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  focusedPath?: string;
  setFocusedPath: (path: string) => void;
}
const FileTreeContext = createContext<FileTreeContextType>({
  expandedPaths: new Set(),
  togglePath: () => {},
  setFocusedPath: () => {},
});
const DepthContext = createContext(1);
export type FileTreeProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  expanded?: Set<string>;
  defaultExpanded?: Set<string>;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  onExpandedChange?: (expanded: Set<string>) => void;
};
export const FileTree = ({
  expanded: controlledExpanded,
  defaultExpanded = new Set(),
  selectedPath,
  onSelect,
  onExpandedChange,
  className,
  children,
  onKeyDown,
  ...props
}: FileTreeProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [focusedPath, setFocusedPath] = useState(selectedPath);
  const expandedPaths = controlledExpanded ?? internalExpanded;
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const togglePath = useCallback(
    (path: string) => {
      const next = new Set(expandedPaths);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [expandedPaths, onExpandedChange],
  );
  useLayoutEffect(() => {
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []).filter(
      (item) => !item.closest("[inert]"),
    );
    if (!items.some((item) => item.dataset.path === focusedPath)) setFocusedPath(items[0]?.dataset.path);
  }, [expandedPaths, focusedPath, children]);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || (event.target as HTMLElement).closest('[data-slot="file-tree-actions"]')) return;
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []).filter(
      (item) => !item.closest("[inert]"),
    );
    const current = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    if (!current) return;
    const index = items.indexOf(current);
    const path = current.dataset.path!;
    let next: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = items[Math.min(index + 1, items.length - 1)];
        break;
      case "ArrowUp":
        next = items[Math.max(index - 1, 0)];
        break;
      case "Home":
        next = items[0];
        break;
      case "End":
        next = items[items.length - 1];
        break;
      case "ArrowRight":
        if (current.dataset.folder === "true") {
          if (!expandedPaths.has(path)) togglePath(path);
          else next = current.querySelector<HTMLElement>('[role="group"] [role="treeitem"]') ?? undefined;
        }
        break;
      case "ArrowLeft":
        if (current.dataset.folder === "true" && expandedPaths.has(path)) togglePath(path);
        else
          next = items.find(
            (item) => item.dataset.path === current.closest<HTMLElement>("[data-parent-path]")?.dataset.parentPath,
          );
        break;
      case "Enter":
      case " ":
        onSelect?.(path);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next) {
      setFocusedPath(next.dataset.path!);
      next.focus();
    }
  };
  const value = useMemo(
    () => ({ expandedPaths, togglePath, selectedPath, onSelect, focusedPath, setFocusedPath }),
    [expandedPaths, togglePath, selectedPath, onSelect, focusedPath],
  );
  return (
    <FileTreeContext.Provider value={value}>
      <LayoutGroup id={id}>
        <div
          ref={root}
          data-slot="file-tree"
          role="tree"
          aria-label="Files"
          className={cn("rounded-lg border bg-card p-2 font-mono text-[13px]", className)}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </div>
      </LayoutGroup>
    </FileTreeContext.Provider>
  );
};
export type FileTreeIconProps = HTMLAttributes<HTMLSpanElement>;
export const FileTreeIcon = ({ className, ...props }: FileTreeIconProps) => (
  <span
    aria-hidden="true"
    className={cn("relative flex shrink-0 items-center text-muted-foreground", className)}
    {...props}
  />
);
export type FileTreeNameProps = HTMLAttributes<HTMLSpanElement>;
export const FileTreeName = ({ className, ...props }: FileTreeNameProps) => (
  <span className={cn("relative min-w-0 truncate", className)} {...props} />
);
function Selection({ selected }: { selected: boolean }) {
  const reduced = useReducedMotion();
  return selected ? (
    <motion.span
      aria-hidden="true"
      data-slot="file-tree-selection"
      className="pointer-events-none absolute inset-0 rounded-md bg-accent-soft"
      layoutId={reduced ? undefined : "file-tree-selection"}
      initial={false}
      transition={reduced ? { duration: duration.instant } : selectionSpring}
    />
  ) : null;
}
export type FileTreeFolderProps = HTMLAttributes<HTMLDivElement> & { path: string; name: string };
export const FileTreeFolder = ({ path, name, className, children, onFocus, ...props }: FileTreeFolderProps) => {
  const { expandedPaths, togglePath, selectedPath, onSelect, focusedPath, setFocusedPath } =
    useContext(FileTreeContext);
  const depth = useContext(DepthContext);
  const expanded = expandedPaths.has(path);
  const selected = selectedPath === path;
  const row = useRef<HTMLDivElement>(null);
  return (
    <Collapsible open={expanded} onOpenChange={() => togglePath(path)}>
      <div
        ref={row}
        data-path={path}
        data-folder="true"
        data-slot="file-tree-folder"
        role="treeitem"
        aria-level={depth}
        aria-expanded={expanded}
        aria-selected={selected}
        tabIndex={focusedPath === path ? 0 : -1}
        className={cn("ai-file-tree-item outline-none", className)}
        onFocus={(event) => {
          if (event.target === event.currentTarget) setFocusedPath(path);
          onFocus?.(event);
        }}
        {...props}
      >
        <div
          data-slot="file-tree-row"
          className="relative flex min-h-9 items-center gap-2 rounded-md px-2 hover:bg-tint"
        >
          <Selection selected={selected} />
          <CollapsibleTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${name}`}
              className="relative flex size-5 shrink-0 items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => row.current?.focus()}
            >
              <IconChevronRight
                aria-hidden="true"
                data-slot="file-tree-chevron"
                className="size-4 text-muted-foreground"
              />
            </button>
          </CollapsibleTrigger>
          <button
            type="button"
            tabIndex={-1}
            className="relative flex min-w-0 flex-1 items-center gap-2 text-left"
            onClick={() => {
              row.current?.focus();
              onSelect?.(path);
            }}
          >
            <FileTreeIcon>
              {expanded ? (
                <IconFolderOpen aria-hidden className="size-4 text-link" />
              ) : (
                <IconFolder aria-hidden className="size-4 text-link" />
              )}
            </FileTreeIcon>
            <FileTreeName>{name}</FileTreeName>
          </button>
        </div>
        <CollapsibleContent>
          <div role="group" data-parent-path={path} className="ml-4 border-l pl-2">
            <DepthContext.Provider value={depth + 1}>{children}</DepthContext.Provider>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
export type FileTreeFileProps = HTMLAttributes<HTMLDivElement> & { path: string; name: string; icon?: ReactNode };
export const FileTreeFile = ({
  path,
  name,
  icon,
  className,
  children,
  onClick,
  onFocus,
  ...props
}: FileTreeFileProps) => {
  const { selectedPath, onSelect, focusedPath, setFocusedPath } = useContext(FileTreeContext);
  const depth = useContext(DepthContext);
  return (
    <div
      data-slot="file-tree-file"
      data-path={path}
      role="treeitem"
      aria-label={children ? undefined : name}
      aria-level={depth}
      aria-selected={selectedPath === path}
      tabIndex={focusedPath === path ? 0 : -1}
      className={cn(
        "ai-file-tree-item relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 outline-none hover:bg-tint",
        className,
      )}
      onFocus={(event) => {
        setFocusedPath(path);
        onFocus?.(event);
      }}
      onClick={(event) => {
        event.currentTarget.focus();
        onSelect?.(path);
        onClick?.(event);
      }}
      {...props}
    >
      <Selection selected={selectedPath === path} />
      {children ?? (
        <>
          <span aria-hidden className="size-5 shrink-0" />
          <FileTreeIcon>{icon ?? <IconFile aria-hidden className="size-4" />}</FileTreeIcon>
          <FileTreeName>{name}</FileTreeName>
        </>
      )}
    </div>
  );
};
export type FileTreeActionsProps = HTMLAttributes<HTMLDivElement>;
export const FileTreeActions = ({ className, onClick, onKeyDown, ...props }: FileTreeActionsProps) => (
  <div
    data-slot="file-tree-actions"
    role="group"
    className={cn("relative ml-auto flex items-center gap-1", className)}
    onClick={(event) => {
      event.stopPropagation();
      onClick?.(event);
    }}
    onKeyDown={(event) => {
      event.stopPropagation();
      onKeyDown?.(event);
    }}
    {...props}
  />
);

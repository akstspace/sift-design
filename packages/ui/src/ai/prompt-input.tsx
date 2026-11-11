import { Button } from "@sift-design/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@sift-design/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sift-design/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@sift-design/ui/hover-card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@sift-design/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@sift-design/ui/tooltip";
import type { ChatStatus, FileUIPart, SourceDocumentUIPart } from "ai";
import {
  IconArrowUp as CornerDownLeftIcon,
  IconPhoto as ImageIcon,
  IconLoader2 as Loader2Icon,
  IconMicrophone as MicIcon,
  IconPaperclip as PaperclipIcon,
  IconPlus as PlusIcon,
  IconPlayerStopFilled as SquareIcon,
  IconX as XIcon,
  IconAlertCircle,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { arrivalMotion, duration, reflowTransition, spring, leave } from "@sift-design/tokens/motion";
import { nanoid } from "nanoid";
import {
  type ChangeEvent,
  type ChangeEventHandler,
  Children,
  type ClipboardEventHandler,
  type ComponentProps,
  createContext,
  type FormEvent,
  type FormEventHandler,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const captureScreenshot = async (): Promise<File | null> => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    return null;
  }

  let stream: MediaStream | null = null;
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true,
    });

    video.srcObject = stream;

    // Video element uses callback-based API, wrapping in Promise is necessary
    // oxlint-disable-next-line eslint-plugin-promise(avoid-new)
    await new Promise<void>((resolve, reject) => {
      // oxlint-disable-next-line eslint-plugin-unicorn(prefer-add-event-listener)
      video.onloadedmetadata = () => resolve();
      // oxlint-disable-next-line eslint-plugin-unicorn(prefer-add-event-listener)
      video.onerror = () => reject(new Error("Failed to load screen stream"));
    });

    await video.play();

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, width, height);
    // canvas.toBlob uses callback-based API, wrapping in Promise is necessary
    // oxlint-disable-next-line eslint-plugin-promise(avoid-new)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
    if (!blob) {
      return null;
    }

    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-").replace("T", "_").replace("Z", "");

    return new File([blob], `screenshot-${timestamp}.png`, {
      lastModified: Date.now(),
      type: "image/png",
    });
  } finally {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
    video.pause();
    video.srcObject = null;
  }
};

// Let attachment and hover-card exits finish before releasing their image resource.
const releaseAttachmentUrl = (url: string) => {
  setTimeout(() => URL.revokeObjectURL(url), (spring.exit.visualDuration + duration.move) * 1000);
};

// ============================================================================
// Provider Context & Types
// ============================================================================

export type AttachmentsContext = {
  files: (FileUIPart & { id: string })[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
};

export type TextInputContext = {
  value: string;
  setInput: (v: string) => void;
  clear: () => void;
};

export type PromptInputControllerProps = {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
  /** INTERNAL: Allows PromptInput to register its file textInput + "open" callback */
  __registerFileInput: (ref: RefObject<HTMLInputElement | null>, open: () => void) => void;
};

const PromptInputController = createContext<PromptInputControllerProps | null>(null);
const ProviderAttachmentsContext = createContext<AttachmentsContext | null>(null);

export const usePromptInputController = () => {
  const ctx = useContext(PromptInputController);
  if (!ctx) {
    throw new Error("Wrap your component inside <PromptInputProvider> to use usePromptInputController().");
  }
  return ctx;
};

// Optional variants (do NOT throw). Useful for dual-mode components.
const useOptionalPromptInputController = () => useContext(PromptInputController);

export const useProviderAttachments = () => {
  const ctx = useContext(ProviderAttachmentsContext);
  if (!ctx) {
    throw new Error("Wrap your component inside <PromptInputProvider> to use useProviderAttachments().");
  }
  return ctx;
};

const useOptionalProviderAttachments = () => useContext(ProviderAttachmentsContext);

export type PromptInputProviderProps = PropsWithChildren<{
  initialInput?: string;
}>;

/**
 * Optional global provider that lifts PromptInput state outside of PromptInput.
 * If you don't use it, PromptInput stays fully self-managed.
 */
export function PromptInputProvider({ initialInput: initialTextInput = "", children }: PromptInputProviderProps) {
  // ----- textInput state
  const [textInput, setTextInput] = useState(initialTextInput);
  const clearInput = useCallback(() => setTextInput(""), []);

  // ----- attachments state (global when wrapped)
  const [attachmentFiles, setAttachmentFiles] = useState<(FileUIPart & { id: string })[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openRef = useRef<() => void>(() => {});

  const add = useCallback((files: File[] | FileList) => {
    const incoming = Array.from(files);
    if (incoming.length === 0) {
      return;
    }

    setAttachmentFiles((prev) =>
      prev.concat(
        incoming.map((file) => ({
          id: nanoid(),
          type: "file" as const,
          url: URL.createObjectURL(file),
          mediaType: file.type,
          filename: file.name,
        })),
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setAttachmentFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.url) {
        releaseAttachmentUrl(found.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setAttachmentFiles((prev) => {
      for (const f of prev) {
        if (f.url) {
          releaseAttachmentUrl(f.url);
        }
      }
      return [];
    });
  }, []);

  // Keep a ref to attachments for cleanup on unmount (avoids stale closure)
  const attachmentsRef = useRef(attachmentFiles);
  attachmentsRef.current = attachmentFiles;

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      for (const f of attachmentsRef.current) {
        if (f.url) {
          URL.revokeObjectURL(f.url);
        }
      }
    };
  }, []);

  const openFileDialog = useCallback(() => {
    openRef.current?.();
  }, []);

  const attachments = useMemo<AttachmentsContext>(
    () => ({
      files: attachmentFiles,
      add,
      remove,
      clear,
      openFileDialog,
      fileInputRef,
    }),
    [attachmentFiles, add, remove, clear, openFileDialog],
  );

  const __registerFileInput = useCallback((ref: RefObject<HTMLInputElement | null>, open: () => void) => {
    fileInputRef.current = ref.current;
    openRef.current = open;
  }, []);

  const controller = useMemo<PromptInputControllerProps>(
    () => ({
      textInput: {
        value: textInput,
        setInput: setTextInput,
        clear: clearInput,
      },
      attachments,
      __registerFileInput,
    }),
    [textInput, clearInput, attachments, __registerFileInput],
  );

  return (
    <PromptInputController.Provider value={controller}>
      <ProviderAttachmentsContext.Provider value={attachments}>{children}</ProviderAttachmentsContext.Provider>
    </PromptInputController.Provider>
  );
}

// ============================================================================
// Component Context & Hooks
// ============================================================================

const LocalAttachmentsContext = createContext<AttachmentsContext | null>(null);

export const usePromptInputAttachments = () => {
  // Prefer the form context so provider-backed additions also apply validation.
  const provider = useOptionalProviderAttachments();
  const local = useContext(LocalAttachmentsContext);
  const context = local ?? provider;
  if (!context) {
    throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
  }
  return context;
};

export interface ReferencedSourcesContext {
  sources: (SourceDocumentUIPart & { id: string })[];
  add: (sources: SourceDocumentUIPart[] | SourceDocumentUIPart) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const LocalReferencedSourcesContext = createContext<ReferencedSourcesContext | null>(null);

export const usePromptInputReferencedSources = () => {
  const ctx = useContext(LocalReferencedSourcesContext);
  if (!ctx) {
    throw new Error("usePromptInputReferencedSources must be used within a LocalReferencedSourcesContext.Provider");
  }
  return ctx;
};

export type PromptInputAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: FileUIPart & { id: string };
  className?: string;
};

export function PromptInputAttachment({ data, className, ...props }: PromptInputAttachmentProps) {
  const attachments = usePromptInputAttachments();

  const filename = data.filename || "";

  const mediaType = data.mediaType?.startsWith("image/") && data.url ? "image" : "file";
  const isImage = mediaType === "image";

  const attachmentLabel = filename || (isImage ? "Image" : "Attachment");

  return (
    <PromptInputHoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "ai-prompt-attachment group relative flex h-8 min-w-0 max-w-full select-none items-center gap-2 rounded-full border bg-tint pl-1.5 pr-1 text-[13px]",
            className,
          )}
          data-slot="prompt-input-attachment"
          tabIndex={0}
          role="group"
          aria-label={attachmentLabel}
          key={data.id}
          {...props}
        >
          <div className="relative size-5 shrink-0">
            <div className="flex size-5 items-center justify-center overflow-hidden rounded-full bg-subtle">
              {isImage ? (
                <img
                  alt={filename || "attachment"}
                  className="size-5 object-cover"
                  height={20}
                  src={data.url}
                  width={20}
                />
              ) : (
                <div className="flex size-5 items-center justify-center text-muted-foreground">
                  <PaperclipIcon aria-hidden className="size-3" />
                </div>
              )}
            </div>
          </div>

          <span className="flex-1 truncate">{attachmentLabel}</span>
          <Button
            aria-label={`Remove ${attachmentLabel}`}
            className="size-6 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              attachments.remove(data.id);
            }}
            type="button"
            variant="ghost"
          >
            <XIcon aria-hidden className="size-3.5" />
          </Button>
        </div>
      </HoverCardTrigger>
      <PromptInputHoverCardContent className="w-auto p-2">
        <div className="w-auto space-y-3">
          {isImage && (
            <div className="flex max-h-96 w-80 max-w-[calc(100vw-3rem)] items-center justify-center overflow-hidden rounded-md border">
              <img
                alt={filename || "attachment preview"}
                className="max-h-full max-w-full object-contain"
                height={384}
                src={data.url}
                width={448}
              />
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1 space-y-1 px-0.5">
              <h4 className="truncate font-semibold text-sm leading-none">
                {filename || (isImage ? "Image" : "Attachment")}
              </h4>
              {data.mediaType && <p className="truncate font-mono text-muted-foreground text-xs">{data.mediaType}</p>}
            </div>
          </div>
        </div>
      </PromptInputHoverCardContent>
    </PromptInputHoverCard>
  );
}

export type PromptInputAttachmentsProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (attachment: FileUIPart & { id: string }) => ReactNode;
};

export function PromptInputAttachments({ children, className, ...props }: PromptInputAttachmentsProps) {
  const attachments = usePromptInputAttachments();
  const reduced = !!useReducedMotion();
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const previous = useRef(0);
  const hasFiles = attachments.files.length > 0;

  // The row's own height follows its content, so the composer grows and
  // shrinks with a spring instead of jumping when a chip arrives or leaves.
  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const measure = () => setHeight(hasFiles ? node.offsetHeight : 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasFiles]);

  const growing = height >= previous.current;
  useEffect(() => {
    previous.current = height;
  }, [height]);

  return (
    <motion.div
      data-slot="prompt-input-attachments"
      className="prompt-input-attachments-frame w-full"
      initial={false}
      animate={{ height }}
      transition={reduced ? { duration: 0 } : growing ? spring.smooth : spring.exit}
    >
      <div
        ref={inner}
        className={cn("relative flex w-full flex-wrap items-center gap-2", hasFiles && "px-3 pt-3", className)}
        {...props}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {attachments.files.map((file) => (
            <motion.div
              key={file.id}
              layout={reduced ? false : "position"}
              transition={{ layout: reflowTransition(reduced) }}
              {...arrivalMotion(reduced)}
              className="min-w-0 max-w-full"
            >
              {children(file)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export type PromptInputActionAddAttachmentsProps = ComponentProps<typeof DropdownMenuItem> & {
  label?: string;
};

export const PromptInputActionAddAttachments = ({
  label = "Add photos or files",
  ...props
}: PromptInputActionAddAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  return (
    <DropdownMenuItem
      {...props}
      onSelect={(e) => {
        e.preventDefault();
        attachments.openFileDialog();
      }}
    >
      <ImageIcon aria-hidden className="mr-2 size-4" /> {label}
    </DropdownMenuItem>
  );
};

export type PromptInputActionAddScreenshotProps = ComponentProps<typeof DropdownMenuItem> & {
  label?: string;
};

export const PromptInputActionAddScreenshot = ({
  label = "Take screenshot",
  onSelect,
  ...props
}: PromptInputActionAddScreenshotProps) => {
  const attachments = usePromptInputAttachments();

  const handleSelect = useCallback(
    async (event: Event) => {
      onSelect?.(event);
      if (event.defaultPrevented) {
        return;
      }

      try {
        const screenshot = await captureScreenshot();
        if (screenshot) {
          attachments.add([screenshot]);
        }
      } catch (error) {
        if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError")) {
          return;
        }
        throw error;
      }
    },
    [onSelect, attachments],
  );

  return (
    <DropdownMenuItem {...props} onSelect={handleSelect}>
      <IconDeviceDesktop aria-hidden className="mr-2 size-4" />
      {label}
    </DropdownMenuItem>
  );
};

export type PromptInputMessage = {
  text: string;
  files: FileUIPart[];
};

export type PromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, "onSubmit" | "onError"> & {
  accept?: string; // e.g., "image/*" or leave undefined for any
  multiple?: boolean;
  // When true, accepts drops anywhere on document. Default false (opt-in).
  globalDrop?: boolean;
  // Render a hidden input with given name and keep it in sync for native form posts. Default false.
  syncHiddenInput?: boolean;
  // Minimal constraints
  maxFiles?: number;
  maxFileSize?: number; // bytes
  onError?: (err: { code: "max_files" | "max_file_size" | "accept"; message: string }) => void;
  onSubmit: (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export const PromptInput = ({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  // Try to use a provider controller if present
  const controller = useOptionalPromptInputController();
  const usingProvider = !!controller;

  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // ----- Local attachments (only used when no provider)
  const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const files = usingProvider ? controller.attachments.files : items;

  const [referencedSources, setReferencedSources] = useState<(SourceDocumentUIPart & { id: string })[]>([]);

  // Keep a ref to files for cleanup on unmount (avoids stale closure)
  const filesRef = useRef(files);
  filesRef.current = files;

  const openFileDialogLocal = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const matchesAccept = useCallback(
    (f: File) => {
      if (!accept || accept.trim() === "") {
        return true;
      }

      const patterns = accept
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      return patterns.some((pattern) => {
        if (pattern.endsWith("/*")) {
          const prefix = pattern.slice(0, -1); // e.g: image/* -> image/
          return f.type.startsWith(prefix);
        }
        return f.type === pattern;
      });
    },
    [accept],
  );

  const addLocal = useCallback(
    (fileList: File[] | FileList) => {
      const incoming = Array.from(fileList);
      const accepted = incoming.filter((f) => matchesAccept(f));
      if (incoming.length && accepted.length === 0) {
        onError?.({
          code: "accept",
          message: "No files match the accepted types.",
        });
        return;
      }
      const withinSize = (f: File) => (maxFileSize ? f.size <= maxFileSize : true);
      const sized = accepted.filter(withinSize);
      if (accepted.length > 0 && sized.length === 0) {
        onError?.({
          code: "max_file_size",
          message: "All files exceed the maximum size.",
        });
        return;
      }

      setItems((prev) => {
        const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : undefined;
        const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
        if (typeof capacity === "number" && sized.length > capacity) {
          onError?.({
            code: "max_files",
            message: "Too many files. Some were not added.",
          });
        }
        const next: (FileUIPart & { id: string })[] = [];
        for (const file of capped) {
          next.push({
            id: nanoid(),
            type: "file",
            url: URL.createObjectURL(file),
            mediaType: file.type,
            filename: file.name,
          });
        }
        return prev.concat(next);
      });
    },
    [matchesAccept, maxFiles, maxFileSize, onError],
  );

  const removeLocal = useCallback(
    (id: string) =>
      setItems((prev) => {
        const found = prev.find((file) => file.id === id);
        if (found?.url) {
          releaseAttachmentUrl(found.url);
        }
        return prev.filter((file) => file.id !== id);
      }),
    [],
  );

  // Wrapper that validates files before calling provider's add
  const addWithProviderValidation = useCallback(
    (fileList: File[] | FileList) => {
      const incoming = [...fileList];
      const accepted = incoming.filter((f) => matchesAccept(f));
      if (incoming.length && accepted.length === 0) {
        onError?.({
          code: "accept",
          message: "No files match the accepted types.",
        });
        return;
      }
      const withinSize = (f: File) => (maxFileSize ? f.size <= maxFileSize : true);
      const sized = accepted.filter(withinSize);
      if (accepted.length > 0 && sized.length === 0) {
        onError?.({
          code: "max_file_size",
          message: "All files exceed the maximum size.",
        });
        return;
      }

      const currentCount = files.length;
      const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : undefined;
      const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
      if (typeof capacity === "number" && sized.length > capacity) {
        onError?.({
          code: "max_files",
          message: "Too many files. Some were not added.",
        });
      }

      if (capped.length > 0) {
        controller?.attachments.add(capped);
      }
    },
    [matchesAccept, maxFileSize, maxFiles, onError, files.length, controller],
  );

  const clearLocal = useCallback(
    () =>
      setItems((prev) => {
        for (const file of prev) {
          if (file.url) {
            releaseAttachmentUrl(file.url);
          }
        }
        return [];
      }),
    [],
  );

  const add = usingProvider ? addWithProviderValidation : addLocal;
  const remove = usingProvider ? controller.attachments.remove : removeLocal;
  const clearAttachments = usingProvider ? controller.attachments.clear : clearLocal;
  const clearReferencedSources = useCallback(() => setReferencedSources([]), []);
  const clear = useCallback(() => {
    clearAttachments();
    clearReferencedSources();
  }, [clearAttachments, clearReferencedSources]);
  const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;

  // Let provider know about our hidden file input so external menus can call openFileDialog()
  useEffect(() => {
    if (!usingProvider) return;
    controller.__registerFileInput(inputRef, () => inputRef.current?.click());
  }, [usingProvider, controller]);

  // Note: File input cannot be programmatically set for security reasons
  // The syncHiddenInput prop is no longer functional
  useEffect(() => {
    if (syncHiddenInput && inputRef.current && files.length === 0) {
      inputRef.current.value = "";
    }
  }, [files, syncHiddenInput]);

  // Listen at the form, or the document when global file dropping is enabled.
  useEffect(() => {
    const target = globalDrop ? document : formRef.current;
    if (!target) return;
    let depth = 0;
    const isFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files");
    const onDragEnter = (event: Event) => {
      const drag = event as DragEvent;
      if (!isFiles(drag)) return;
      drag.preventDefault();
      depth += 1;
      setIsDragOver(true);
    };
    const onDragOver = (event: Event) => {
      const drag = event as DragEvent;
      if (!isFiles(drag)) return;
      drag.preventDefault();
      if (drag.dataTransfer) drag.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    };
    const onDragLeave = (event: Event) => {
      if (!isFiles(event as DragEvent)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragOver(false);
    };
    const onDrop = (event: Event) => {
      const drag = event as DragEvent;
      if (isFiles(drag)) drag.preventDefault();
      depth = 0;
      setIsDragOver(false);
      if (drag.dataTransfer?.files.length) add(drag.dataTransfer.files);
    };
    const reset = () => {
      depth = 0;
      setIsDragOver(false);
    };
    target.addEventListener("dragenter", onDragEnter);
    target.addEventListener("dragover", onDragOver);
    target.addEventListener("dragleave", onDragLeave);
    target.addEventListener("drop", onDrop);
    document.addEventListener("dragend", reset);
    window.addEventListener("blur", reset);
    return () => {
      target.removeEventListener("dragenter", onDragEnter);
      target.removeEventListener("dragover", onDragOver);
      target.removeEventListener("dragleave", onDragLeave);
      target.removeEventListener("drop", onDrop);
      document.removeEventListener("dragend", reset);
      window.removeEventListener("blur", reset);
    };
  }, [add, globalDrop]);

  useEffect(
    () => () => {
      if (!usingProvider) {
        for (const f of filesRef.current) {
          if (f.url) URL.revokeObjectURL(f.url);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup only on unmount; filesRef always current
    [usingProvider],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.files) {
      add(event.currentTarget.files);
    }
    // Reset input value to allow selecting files that were previously removed
    event.currentTarget.value = "";
  };

  const convertBlobUrlToDataUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const ctx = useMemo<AttachmentsContext>(
    () => ({
      files: files.map((item) => ({ ...item, id: item.id })),
      add,
      remove,
      clear: clearAttachments,
      openFileDialog,
      fileInputRef: inputRef,
    }),
    [files, add, remove, clearAttachments, openFileDialog],
  );

  const refsCtx = useMemo<ReferencedSourcesContext>(
    () => ({
      add: (incoming: SourceDocumentUIPart[] | SourceDocumentUIPart) => {
        const array = Array.isArray(incoming) ? incoming : [incoming];
        setReferencedSources((prev) => [...prev, ...array.map((s) => ({ ...s, id: nanoid() }))]);
      },
      clear: clearReferencedSources,
      remove: (id: string) => {
        setReferencedSources((prev) => prev.filter((s) => s.id !== id));
      },
      sources: referencedSources,
    }),
    [referencedSources, clearReferencedSources],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const text = usingProvider
      ? controller.textInput.value
      : (() => {
          const formData = new FormData(form);
          return (formData.get("message") as string) || "";
        })();

    // Reset form immediately after capturing text to avoid race condition
    // where user input during async blob conversion would be lost
    if (!usingProvider) {
      form.reset();
    }

    // Convert blob URLs to data URLs asynchronously
    Promise.all(
      files.map(async ({ id, ...item }) => {
        if (item.url && item.url.startsWith("blob:")) {
          const dataUrl = await convertBlobUrlToDataUrl(item.url);
          // If conversion failed, keep the original blob URL
          return {
            ...item,
            url: dataUrl ?? item.url,
          };
        }
        return item;
      }),
    )
      .then((convertedFiles: FileUIPart[]) => {
        try {
          const result = onSubmit({ text, files: convertedFiles }, event);

          // Handle both sync and async onSubmit
          if (result instanceof Promise) {
            result
              .then(() => {
                clear();
                if (usingProvider) {
                  controller.textInput.clear();
                }
              })
              .catch(() => {
                // Don't clear on error - user may want to retry
              });
          } else {
            // Sync function completed without throwing, clear attachments
            clear();
            if (usingProvider) {
              controller.textInput.clear();
            }
          }
        } catch {
          // Don't clear on error - user may want to retry
        }
      })
      .catch(() => {
        // Don't clear on error - user may want to retry
      });
  };

  // Render with or without local provider
  const inner = (
    <>
      <input
        accept={accept}
        aria-label="Upload files"
        className="hidden"
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        title="Upload files"
        type="file"
      />
      <form
        data-slot="prompt-input"
        data-drag-over={isDragOver || undefined}
        className={cn("ai-prompt-input relative w-full", className)}
        onSubmit={handleSubmit}
        ref={formRef}
        {...props}
      >
        <InputGroup className="ai-prompt-surface overflow-hidden rounded-xl border bg-card dark:bg-card">
          {children}
          {isDragOver && (
            <div className="ai-prompt-drop-target" role="status">
              <PaperclipIcon aria-hidden className="size-5" />
              <span>Drop files to attach</span>
            </div>
          )}
        </InputGroup>
      </form>
    </>
  );

  return (
    <LocalAttachmentsContext.Provider value={ctx}>
      <LocalReferencedSourcesContext.Provider value={refsCtx}>{inner}</LocalReferencedSourcesContext.Provider>
    </LocalAttachmentsContext.Provider>
  );
};

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({ className, ...props }: PromptInputBodyProps) => (
  <div className={cn("contents", className)} {...props} />
);

export type PromptInputTextareaProps = ComponentProps<typeof InputGroupTextarea>;

export const PromptInputTextarea = ({
  onChange,
  onKeyDown,
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) => {
  const controller = useOptionalPromptInputController();
  const attachments = usePromptInputAttachments();
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Enter") {
      if (isComposing || e.nativeEvent.isComposing) {
        return;
      }
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();

      // Check if the submit button is disabled before submitting
      const form = e.currentTarget.form;
      const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submitButton?.disabled) {
        return;
      }

      form?.requestSubmit();
    }

    // Remove last attachment when Backspace is pressed and textarea is empty
    if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
      e.preventDefault();
      const lastAttachment = attachments.files.at(-1);
      if (lastAttachment) {
        attachments.remove(lastAttachment.id);
      }
    }
  };

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    const items = event.clipboardData?.items;

    if (!items) {
      return;
    }

    const files: File[] = [];

    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      attachments.add(files);
    }
  };

  const controlledProps = controller
    ? {
        value: controller.textInput.value,
        onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
          controller.textInput.setInput(e.currentTarget.value);
          onChange?.(e);
        },
      }
    : {
        onChange,
      };

  return (
    <InputGroupTextarea
      className={cn(
        "ai-prompt-textarea field-sizing-content max-h-48 min-h-24 px-4 py-4 text-[14px] leading-relaxed",
        className,
      )}
      aria-label="Message"
      name="message"
      onCompositionEnd={() => setIsComposing(false)}
      onCompositionStart={() => setIsComposing(true)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      {...props}
      {...controlledProps}
    />
  );
};

export type PromptInputHeaderProps = Omit<ComponentProps<typeof InputGroupAddon>, "align">;

export const PromptInputHeader = ({ className, ...props }: PromptInputHeaderProps) => (
  <InputGroupAddon
    align="block-end"
    data-slot="prompt-input-header"
    className={cn("order-first flex-wrap gap-1 pb-0", className)}
    {...props}
  />
);

export type PromptInputFooterProps = Omit<ComponentProps<typeof InputGroupAddon>, "align">;

export const PromptInputFooter = ({ className, ...props }: PromptInputFooterProps) => (
  <InputGroupAddon
    align="block-end"
    data-slot="prompt-input-footer"
    className={cn("justify-between gap-2 px-3 pb-3", className)}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({ className, ...props }: PromptInputToolsProps) => (
  <div
    data-slot="prompt-input-tools"
    className={cn("flex min-w-0 flex-wrap items-center gap-1", className)}
    {...props}
  />
);

export type PromptInputButtonTooltip =
  | string
  | {
      content: ReactNode;
      shortcut?: string;
      side?: ComponentProps<typeof TooltipContent>["side"];
    };

export type PromptInputButtonProps = ComponentProps<typeof InputGroupButton> & {
  tooltip?: PromptInputButtonTooltip;
};

export const PromptInputButton = ({
  variant = "ghost",
  className,
  size,
  tooltip,
  ...props
}: PromptInputButtonProps) => {
  const newSize = size ?? (Children.count(props.children) > 1 ? "sm" : "icon-sm");

  const button = (
    <InputGroupButton
      className={cn("ai-prompt-tool", className)}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  const tooltipContent = typeof tooltip === "string" ? tooltip : tooltip.content;
  const shortcut = typeof tooltip === "string" ? undefined : tooltip.shortcut;
  const side = typeof tooltip === "string" ? "top" : (tooltip.side ?? "top");

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={side}>
        {tooltipContent}
        {shortcut && <span className="ml-2 font-mono text-muted-foreground">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );
};

export type PromptInputActionMenuProps = ComponentProps<typeof DropdownMenu>;
export const PromptInputActionMenu = (props: PromptInputActionMenuProps) => <DropdownMenu {...props} />;

export type PromptInputActionMenuTriggerProps = PromptInputButtonProps;

export const PromptInputActionMenuTrigger = ({ className, children, ...props }: PromptInputActionMenuTriggerProps) => (
  <DropdownMenuTrigger asChild>
    <PromptInputButton aria-label="Add attachments" className={className} {...props}>
      {children ?? <PlusIcon aria-hidden className="size-4" />}
    </PromptInputButton>
  </DropdownMenuTrigger>
);

export type PromptInputActionMenuContentProps = ComponentProps<typeof DropdownMenuContent>;
export const PromptInputActionMenuContent = ({ className, ...props }: PromptInputActionMenuContentProps) => (
  <DropdownMenuContent align="start" className={cn(className)} {...props} />
);

export type PromptInputActionMenuItemProps = ComponentProps<typeof DropdownMenuItem>;
export const PromptInputActionMenuItem = ({ className, ...props }: PromptInputActionMenuItemProps) => (
  <DropdownMenuItem className={cn(className)} {...props} />
);

// Note: Actions that perform side-effects (like opening a file dialog)
// are provided in opt-in modules (e.g., prompt-input-attachments).

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
  status?: ChatStatus;
  onStop?: () => void;
};

export const PromptInputSubmit = ({
  className,
  variant = "default",
  size = "icon-sm",
  status,
  onStop,
  onClick,
  children,
  ...props
}: PromptInputSubmitProps) => {
  const reduced = !!useReducedMotion();
  const state = status ?? "ready";
  const isGenerating = state === "submitted" || state === "streaming";
  const label =
    state === "streaming" || (isGenerating && onStop)
      ? "Stop generating"
      : state === "submitted"
        ? "Sending message"
        : state === "error"
          ? "Retry message"
          : "Send message";
  const Icon =
    state === "submitted"
      ? Loader2Icon
      : state === "streaming"
        ? SquareIcon
        : state === "error"
          ? IconAlertCircle
          : CornerDownLeftIcon;

  return (
    <InputGroupButton
      aria-label={label}
      data-slot="prompt-input-submit"
      data-status={state}
      className={cn("ai-prompt-submit relative shrink-0 overflow-hidden rounded-lg", className)}
      size={size}
      type={isGenerating && onStop ? "button" : "submit"}
      onClick={(event) => {
        if (isGenerating && onStop) {
          event.preventDefault();
          onStop();
          return;
        }
        onClick?.(event);
      }}
      variant={variant}
      {...props}
    >
      {children ?? (
        <span className="grid size-4 place-items-center" aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={state}
              className="col-start-1 row-start-1 flex"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: -4,
                      scale: 0.9,
                      transition: { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
                    }
              }
              transition={reduced ? { duration: duration.instant } : spring.snappy}
            >
              <Icon aria-hidden className={cn("size-4", state === "submitted" && "ai-prompt-pending")} />
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </InputGroupButton>
  );
};

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionResultList = {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
};

type SpeechRecognitionAlternative = {
  transcript: string;
  confidence: number;
};

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export type PromptInputSpeechButtonProps = ComponentProps<typeof PromptInputButton> & {
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onTranscriptionChange?: (text: string) => void;
};

export const PromptInputSpeechButton = ({
  className,
  textareaRef,
  onTranscriptionChange,
  ...props
}: PromptInputSpeechButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognition();

      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = "en-US";

      speechRecognition.onstart = () => {
        setIsListening(true);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      speechRecognition.onresult = (event) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0]?.transcript ?? "";
          }
        }

        if (finalTranscript && textareaRef?.current) {
          const textarea = textareaRef.current;
          const currentValue = textarea.value;
          const newValue = currentValue + (currentValue ? " " : "") + finalTranscript;

          textarea.value = newValue;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          onTranscriptionChange?.(newValue);
        }
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = speechRecognition;
      setRecognition(speechRecognition);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [textareaRef, onTranscriptionChange]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [recognition, isListening]);

  return (
    <PromptInputButton
      className={cn("ai-prompt-speech relative", isListening && "bg-accent-soft text-link", className)}
      aria-label={isListening ? "Stop recording" : "Start recording"}
      aria-pressed={isListening}
      disabled={!recognition}
      onClick={toggleListening}
      {...props}
    >
      <MicIcon aria-hidden className="size-4" />
    </PromptInputButton>
  );
};

export type PromptInputSelectProps = ComponentProps<typeof Select>;

export const PromptInputSelect = (props: PromptInputSelectProps) => <Select {...props} />;

export type PromptInputSelectTriggerProps = ComponentProps<typeof SelectTrigger>;

export const PromptInputSelectTrigger = ({ className, size = "sm", ...props }: PromptInputSelectTriggerProps) => (
  <SelectTrigger
    size={size}
    className={cn(
      "ai-prompt-select-trigger h-8 min-w-0 shrink-0 rounded-full border border-border bg-tint px-2.5 text-[13px] font-medium text-foreground shadow-none",
      "hover:bg-tint hover:text-foreground aria-expanded:bg-tint aria-expanded:text-foreground",
      className,
    )}
    {...props}
  />
);

export type PromptInputSelectContentProps = ComponentProps<typeof SelectContent>;

export const PromptInputSelectContent = ({ className, ...props }: PromptInputSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputSelectItem = ({ className, ...props }: PromptInputSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputSelectValueProps = ComponentProps<typeof SelectValue>;

export const PromptInputSelectValue = ({ className, ...props }: PromptInputSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);

export type PromptInputHoverCardProps = ComponentProps<typeof HoverCard>;

export const PromptInputHoverCard = ({ openDelay = 0, closeDelay = 0, ...props }: PromptInputHoverCardProps) => (
  <HoverCard closeDelay={closeDelay} openDelay={openDelay} {...props} />
);

export type PromptInputHoverCardTriggerProps = ComponentProps<typeof HoverCardTrigger>;

export const PromptInputHoverCardTrigger = (props: PromptInputHoverCardTriggerProps) => <HoverCardTrigger {...props} />;

export type PromptInputHoverCardContentProps = ComponentProps<typeof HoverCardContent>;

export const PromptInputHoverCardContent = ({ align = "start", ...props }: PromptInputHoverCardContentProps) => (
  <HoverCardContent align={align} {...props} />
);

export type PromptInputTabsListProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabsList = ({ className, ...props }: PromptInputTabsListProps) => (
  <div className={cn(className)} {...props} />
);

export type PromptInputTabProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTab = ({ className, ...props }: PromptInputTabProps) => (
  <div className={cn(className)} {...props} />
);

export type PromptInputTabLabelProps = HTMLAttributes<HTMLHeadingElement>;

export const PromptInputTabLabel = ({ className, ...props }: PromptInputTabLabelProps) => (
  <h3 className={cn("mb-2 px-3 font-medium text-muted-foreground text-xs", className)} {...props} />
);

export type PromptInputTabBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabBody = ({ className, ...props }: PromptInputTabBodyProps) => (
  <div className={cn("space-y-1", className)} {...props} />
);

export type PromptInputTabItemProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabItem = ({ className, ...props }: PromptInputTabItemProps) => (
  <div className={cn("flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-tint", className)} {...props} />
);

export type PromptInputCommandProps = ComponentProps<typeof Command>;

export const PromptInputCommand = ({ className, ...props }: PromptInputCommandProps) => (
  <Command className={cn(className)} {...props} />
);

export type PromptInputCommandInputProps = ComponentProps<typeof CommandInput>;

export const PromptInputCommandInput = ({ className, ...props }: PromptInputCommandInputProps) => (
  <CommandInput className={cn(className)} {...props} />
);

export type PromptInputCommandListProps = ComponentProps<typeof CommandList>;

export const PromptInputCommandList = ({ className, ...props }: PromptInputCommandListProps) => (
  <CommandList className={cn(className)} {...props} />
);

export type PromptInputCommandEmptyProps = ComponentProps<typeof CommandEmpty>;

export const PromptInputCommandEmpty = ({ className, ...props }: PromptInputCommandEmptyProps) => (
  <CommandEmpty className={cn(className)} {...props} />
);

export type PromptInputCommandGroupProps = ComponentProps<typeof CommandGroup>;

export const PromptInputCommandGroup = ({ className, ...props }: PromptInputCommandGroupProps) => (
  <CommandGroup className={cn(className)} {...props} />
);

export type PromptInputCommandItemProps = ComponentProps<typeof CommandItem>;

export const PromptInputCommandItem = ({ className, ...props }: PromptInputCommandItemProps) => (
  <CommandItem className={cn(className)} {...props} />
);

export type PromptInputCommandSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const PromptInputCommandSeparator = ({ className, ...props }: PromptInputCommandSeparatorProps) => (
  <CommandSeparator className={cn(className)} {...props} />
);

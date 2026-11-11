import { Button } from "@sift-design/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { cn } from "cn";
import {
  type ComponentProps,
  createContext,
  type CSSProperties,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { BundledLanguage, ShikiTransformer, ThemedToken } from "shiki";
import { createCssVariablesTheme, createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { CopyStateIcon } from "./copy-icon";

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
};
export interface TokenizedCode {
  tokens: ThemedToken[][];
  fg: string;
  bg: string;
}
const CodeBlockContext = createContext({ code: "", language: "text" });
const theme = createCssVariablesTheme({ name: "kit-code", variablePrefix: "--code-", fontStyle: true });
let highlighter: Promise<HighlighterCore> | undefined;
const loadingLanguages = new Map<string, Promise<void>>();
const languageLoaders = {
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  bash: () => import("shiki/langs/bash.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  diff: () => import("shiki/langs/diff.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
};
const aliases: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "bash",
  py: "python",
  yml: "yaml",
  md: "markdown",
};

async function getHighlighter(language: BundledLanguage) {
  highlighter ??= createHighlighterCore({ themes: [theme], langs: [], engine: createJavaScriptRegexEngine() });
  const engine = await highlighter;
  const lang = aliases[language] ?? language;
  if (!engine.getLoadedLanguages().includes(lang)) {
    if (!loadingLanguages.has(lang)) {
      const load = async () => {
        const loader = languageLoaders[lang as keyof typeof languageLoaders];
        const grammar = loader ? await loader() : await (await import("shiki/langs")).bundledLanguages[language]?.();
        if (!grammar) throw new Error(`Unsupported code language: ${language}`);
        await engine.loadLanguage(grammar.default);
      };
      loadingLanguages.set(
        lang,
        load().catch((error) => {
          loadingLanguages.delete(lang);
          throw error;
        }),
      );
    }
    await loadingLanguages.get(lang);
  }
  return { engine, lang };
}
const createRawTokens = (code: string): TokenizedCode => ({
  fg: "inherit",
  bg: "transparent",
  tokens: code.split("\n").map((line) => (line ? [{ content: line, color: "inherit", offset: 0 }] : [])),
});
const tokensCache = new Map<string, TokenizedCode>();
const subscribers = new Map<string, Set<(result: TokenizedCode) => void>>();
const cacheKey = (code: string, language: BundledLanguage) => JSON.stringify([language, code]);
const lineNumberTransformer: ShikiTransformer = {
  name: "line-numbers",
  line(node, line) {
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: { className: ["ai-code-line-number"], "aria-hidden": "true" },
      children: [{ type: "text", value: String(line) }],
    });
  },
};
async function highlightHtml(code: string, language: BundledLanguage, numbered: boolean) {
  const { engine, lang } = await getHighlighter(language);
  const html = engine.codeToHtml(code, {
    lang,
    theme: "kit-code",
    tabindex: false,
    transformers: numbered ? [lineNumberTransformer] : [],
  });
  return [html, html];
}

/** Current synchronous token API, with an explicit boolean overload for older HTML consumers. */
export function highlightCode(
  code: string,
  language: BundledLanguage,
  callback?: (result: TokenizedCode) => void,
): TokenizedCode | null;
export function highlightCode(code: string, language: BundledLanguage, showLineNumbers: boolean): Promise<string[]>;
export function highlightCode(
  code: string,
  language: BundledLanguage,
  callback?: boolean | ((result: TokenizedCode) => void),
): TokenizedCode | null | Promise<string[]> {
  if (typeof callback === "boolean") return highlightHtml(code, language, callback);
  const key = cacheKey(code, language);
  const cached = tokensCache.get(key);
  if (cached) return cached;
  const pending = subscribers.get(key);
  if (pending) {
    if (callback) pending.add(callback);
    return null;
  }
  const listeners = new Set<(result: TokenizedCode) => void>();
  if (callback) listeners.add(callback);
  subscribers.set(key, listeners);
  getHighlighter(language)
    .then(({ engine, lang }) => {
      const result = engine.codeToTokens(code, { lang, theme: "kit-code" });
      return { tokens: result.tokens, fg: result.fg ?? "inherit", bg: result.bg ?? "transparent" };
    })
    .catch(() => createRawTokens(code))
    .then((result) => {
      // Bound retained source data and use the full source key to avoid same-length collisions.
      if (tokensCache.size >= 100) tokensCache.delete(tokensCache.keys().next().value!);
      tokensCache.set(key, result);
      subscribers.delete(key);
      for (const listener of listeners) listener(result);
    });
  return null;
}

const CodeBlockBody = memo(function CodeBlockBody({
  tokenized,
  showLineNumbers,
}: {
  tokenized: TokenizedCode;
  showLineNumbers: boolean;
}) {
  return (
    <pre style={{ color: tokenized.fg, backgroundColor: tokenized.bg }}>
      <code>
        {tokenized.tokens.map((line, index, lines) => (
          <span className="line" key={index}>
            {showLineNumbers && (
              <span className="ai-code-line-number" aria-hidden="true">
                {index + 1}
              </span>
            )}
            {line.map((token, tokenIndex) => (
              <span
                key={tokenIndex}
                style={
                  {
                    color: token.color,
                    backgroundColor: token.bgColor,
                    fontStyle: token.fontStyle && token.fontStyle & 1 ? "italic" : undefined,
                    fontWeight: token.fontStyle && token.fontStyle & 2 ? "bold" : undefined,
                    textDecoration: token.fontStyle && token.fontStyle & 4 ? "underline" : undefined,
                    ...token.htmlStyle,
                  } as CSSProperties
                }
              >
                {token.content}
              </span>
            ))}
            {index < lines.length - 1 ? "\n" : ""}
          </span>
        ))}
      </code>
    </pre>
  );
});

export type CodeBlockContainerProps = HTMLAttributes<HTMLDivElement> & { language: string };
export const CodeBlockContainer = ({ language, className, style, ...props }: CodeBlockContainerProps) => (
  <div
    data-slot="code-block"
    data-language={language}
    className={cn(
      "ai-code-block not-prose relative min-w-0 w-full overflow-hidden rounded-lg border bg-card text-foreground",
      className,
    )}
    style={{ containIntrinsicSize: "auto 200px", contentVisibility: "auto", ...style }}
    {...props}
  />
);

export type CodeBlockContentProps = { code: string; language: BundledLanguage; showLineNumbers?: boolean };
export const CodeBlockContent = ({ code, language, showLineNumbers = false }: CodeBlockContentProps) => {
  const rawTokens = useMemo(() => createRawTokens(code), [code]);
  const syncTokens = useMemo(() => highlightCode(code, language) ?? rawTokens, [code, language, rawTokens]);
  const [asyncResult, setAsyncResult] = useState<{ code: string; language: string; tokens: TokenizedCode }>();
  useEffect(() => {
    let active = true;
    const callback = (tokens: TokenizedCode) => {
      if (active) setAsyncResult({ code, language, tokens });
    };
    const cached = highlightCode(code, language, callback);
    if (cached) callback(cached);
    return () => {
      active = false;
      subscribers.get(cacheKey(code, language))?.delete(callback);
    };
  }, [code, language]);
  const current = asyncResult?.code === code && asyncResult.language === language ? asyncResult.tokens : syncTokens;
  return (
    <div
      data-slot="code-block-content"
      className="ai-code-scroll"
      role="region"
      aria-label={`${language} code`}
      tabIndex={0}
    >
      <CodeBlockBody tokenized={current} showLineNumbers={showLineNumbers} />
    </div>
  );
};

export const CodeBlock = ({ code, language, showLineNumbers = false, children, ...props }: CodeBlockProps) => {
  const value = useMemo(() => ({ code, language }), [code, language]);
  return (
    <CodeBlockContext.Provider value={value}>
      <CodeBlockContainer language={language} {...props}>
        {children}
        <CodeBlockContent code={code} language={language} showLineNumbers={showLineNumbers} />
      </CodeBlockContainer>
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;
export const CodeBlockHeader = ({ className, ...props }: CodeBlockHeaderProps) => (
  <div
    data-slot="code-block-header"
    className={cn(
      "ai-code-header flex min-h-11 flex-wrap items-center justify-between gap-2 border-b px-3 py-2 text-[12px]",
      className,
    )}
    {...props}
  />
);
export type CodeBlockTitleProps = HTMLAttributes<HTMLDivElement>;
export const CodeBlockTitle = ({ className, ...props }: CodeBlockTitleProps) => (
  <div data-slot="code-block-title" className={cn("flex min-w-0 items-center gap-2", className)} {...props} />
);
export type CodeBlockActionsProps = HTMLAttributes<HTMLDivElement>;
export const CodeBlockActions = ({ className, ...props }: CodeBlockActionsProps) => (
  <div
    data-slot="code-block-actions"
    className={cn("-my-1 -mr-1 ml-auto flex items-center gap-2", className)}
    {...props}
  />
);
export type CodeBlockFilenameProps = HTMLAttributes<HTMLSpanElement>;
export const CodeBlockFilename = ({ className, ...props }: CodeBlockFilenameProps) => (
  <span data-slot="code-block-filename" className={cn("truncate font-mono text-[12px]", className)} {...props} />
);
export type CodeBlockLanguageProps = HTMLAttributes<HTMLSpanElement>;
export const CodeBlockLanguage = ({ className, children, ...props }: CodeBlockLanguageProps) => {
  const { language } = useContext(CodeBlockContext);
  return (
    <span
      data-slot="code-block-language"
      className={cn("font-mono text-[12px] text-muted-foreground", className)}
      {...props}
    >
      {children ?? language}
    </span>
  );
};

export type CodeBlockLanguageSelectorProps = ComponentProps<typeof Select>;
export const CodeBlockLanguageSelector = (props: CodeBlockLanguageSelectorProps) => <Select {...props} />;
export type CodeBlockLanguageSelectorTriggerProps = ComponentProps<typeof SelectTrigger>;
export const CodeBlockLanguageSelectorTrigger = ({ className, ...props }: CodeBlockLanguageSelectorTriggerProps) => (
  <SelectTrigger
    aria-label="Code language"
    size="sm"
    className={cn("h-7 border-none bg-transparent px-2 font-mono text-[12px] shadow-none", className)}
    {...props}
  />
);
export type CodeBlockLanguageSelectorValueProps = ComponentProps<typeof SelectValue>;
export const CodeBlockLanguageSelectorValue = (props: CodeBlockLanguageSelectorValueProps) => (
  <SelectValue {...props} />
);
export type CodeBlockLanguageSelectorContentProps = ComponentProps<typeof SelectContent>;
export const CodeBlockLanguageSelectorContent = ({
  align = "end",
  ...props
}: CodeBlockLanguageSelectorContentProps) => <SelectContent align={align} {...props} />;
export type CodeBlockLanguageSelectorItemProps = ComponentProps<typeof SelectItem>;
export const CodeBlockLanguageSelectorItem = (props: CodeBlockLanguageSelectorItemProps) => <SelectItem {...props} />;

type ClipboardOptions = { onCopy?: () => void; onError?: (error: Error) => void; timeout?: number };
/** Shared copy feedback for block and inline code. Timers are cleared on repeat and unmount. */
export function useCodeClipboard(code: string, { onCopy, onError, timeout = 2000 }: ClipboardOptions) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copiedCode = useRef<string | undefined>(undefined);
  const copying = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = useCallback(async () => {
    if (copying.current || (state === "copied" && copiedCode.current === code)) return;
    copying.current = true;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText)
        throw new Error("Clipboard API not available");
      await navigator.clipboard.writeText(code);
      if (!mounted.current) return;
      copiedCode.current = code;
      setState("copied");
      onCopy?.();
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), timeout);
    } catch (error) {
      if (!mounted.current) return;
      setState("failed");
      onError?.(error instanceof Error ? error : new Error(String(error)));
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), timeout);
    } finally {
      copying.current = false;
    }
  }, [code, onCopy, onError, timeout, state]);
  return { state, copy };
}

export function CodeCopyFeedback({
  state,
  children,
}: {
  state: "idle" | "copied" | "failed";
  children?: React.ReactNode;
}) {
  return (
    <>
      <CopyStateIcon state={state} size={14} className="ai-code-copy-icon" />
      {children ?? <span>{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}</span>}
    </>
  );
}

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & ClipboardOptions;
export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  onClick,
  ...props
}: CodeBlockCopyButtonProps) => {
  const { code } = useContext(CodeBlockContext);
  const { state, copy } = useCodeClipboard(code, { onCopy, onError, timeout });
  return (
    <Button
      type="button"
      data-slot="code-block-copy-button"
      data-copy-state={state}
      className={cn("ai-code-copy ml-auto shrink-0 text-[12px]", className)}
      size="sm"
      variant="ghost"
      aria-label={state === "copied" ? "Copied code" : state === "failed" ? "Copy failed. Try again" : "Copy code"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void copy();
      }}
      {...props}
    >
      <CodeCopyFeedback state={state}>{children}</CodeCopyFeedback>
      <span className="sr-only" role="status">
        {state === "copied" ? "Code copied to clipboard" : state === "failed" ? "Could not copy code" : ""}
      </span>
    </Button>
  );
};

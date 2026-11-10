import { createCssVariablesTheme, createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Token colors come from CSS variables (see .code-view in styles.css), so code
// follows the active theme and palette with no second highlight pass.
const theme = createCssVariablesTheme({ name: "sift", variablePrefix: "--code-", fontStyle: true });

let highlighter: Promise<HighlighterCore> | undefined;

export async function highlight(code: string, file: string) {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [import("shiki/langs/tsx.mjs"), import("shiki/langs/typescript.mjs"), import("shiki/langs/css.mjs")],
    engine: createJavaScriptRegexEngine(),
  });
  const lang = file.endsWith(".css") ? "css" : file.endsWith(".tsx") ? "tsx" : "typescript";
  return (await highlighter).codeToHtml(code, { lang, theme: "sift" });
}

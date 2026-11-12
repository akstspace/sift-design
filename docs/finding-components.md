Use the index at `/raw/manifest.json` to find a component, an AI element, or an example screen, and to see where its source, docs, and live demo are.

# Finding components

The index is one JSON file. The build generates it from the repository, so it always matches the sources, docs, and demos. It is at:

```
https://chaioverflow.com/sift-design/raw/manifest.json
```

A local site serves the same file at `/raw/manifest.json`. In the repository, `node -e 'import("./scripts/reference.mjs").then((r) => console.log(JSON.stringify(r.manifest(), null, 2)))'` prints it.

Read a source file at `<raw>/<path>`. For example, the `source` value `packages/ui/src/components/button.tsx` is at `https://chaioverflow.com/sift-design/raw/packages/ui/src/components/button.tsx`.

## Top-level fields

| Field | Type | Contents |
|---|---|---|
| `schema` | string | The index format version, `sift-design-manifest/2`. |
| `site`, `raw` | string | The site address and the address of the raw files. A local build can leave `site` empty. |
| `howToSearch` | string | The path of this guide. |
| `families` | array | The five component groups: `controls`, `overlays`, `display`, `charts`, and `ai`. Each has a doc, a site page, a live demo, and its component names. |
| `components` | array | The kit components. Import each from `@sift-design/ui/<name>`. |
| `aiElements` | array | The AI elements. Import each from `@sift-design/ui/ai/<name>`. They use the same entry fields as `components`. |
| `charts` | array | The chart examples. Each is one copyable file that ports a shadcn/ui chart block. |
| `blocks` | array | The optional example screens. |
| `guides` | array | The design guides, with their headings. |
| `tokens` | array | Paths of the color, type, font, and motion token files. |
| `motion` | array | Paths of the shared animation settings and the motion CSS files. |
| `files` | array | Every repository file on the site, as `{ "path", "size" }`. Size is in bytes. |

## Component entries

The entries in `components` and `aiElements` have these fields:

| Field | Contents |
|---|---|
| `name` | The file name without `.tsx`, for example `alert-dialog`. |
| `title` | The heading of the section that documents the component. |
| `family` | `controls`, `overlays`, `display`, `charts`, or `ai`. |
| `summary` | The first sentence of the "When" line in the docs, or the first sentence of the section. |
| `import` | The import path, for example `@sift-design/ui/ai/message`. |
| `source` | The repository path of the source file. |
| `exports` | The named exports, in five lists: `components`, `hooks`, `functions`, `constants`, and `types`. |
| `uses` | The kit components that this source imports. |
| `usesAi` | The AI elements that this source imports. |
| `docs` | `file`, `anchor`, and `page`. The page is the site address of the docs section. |
| `demo` | `live`, the address of the live demo. AI elements also have `group`, the demo group in the `ai` query parameter. The value is `null` when no demo shows the component. |
| `upstream` | `library`, `version`, `source` (the saved, unchanged upstream file), and `reference` (the upstream docs). The value is `null` for components that Sift Design added. |
| `keywords` | Lowercase words from the name, the title, the family, and the demo group. |

An AI element entry, shortened:

```json
{
  "name": "message",
  "title": "Message",
  "family": "ai",
  "summary": "When: show a conversation with user messages and assistant responses.",
  "import": "@sift-design/ui/ai/message",
  "source": "packages/ui/src/ai/message.tsx",
  "exports": { "components": ["Message", "MessageContent", "MessageResponse"], "types": ["MessageProps"] },
  "uses": ["button", "button-group", "tooltip"],
  "usesAi": ["code-block"],
  "docs": { "file": "packages/ui/docs/ai.md", "anchor": "message", "page": "<site>/components/ai#message" },
  "demo": { "live": "<site>/live/specimen/?section=ai&ai=message", "group": "message" },
  "upstream": {
    "library": "AI Elements",
    "version": "1.9.1",
    "source": "packages/ui/upstream/ai-elements-1.9.1/message.tsx",
    "reference": "https://elements.ai-sdk.dev/components/message"
  },
  "keywords": ["message", "ai"]
}
```

## Chart entries

| Field | Contents |
|---|---|
| `name` | The file name without `.tsx`, for example `chart-bar-stacked`. It is also the upstream block name. |
| `group`, `variant` | The chart type (`area`, `bar`, `line`, `pie`, `radar`, `radial`, or `tooltip`) and the variant, for example `stacked`. |
| `title`, `summary` | The card title (the measure the example shows) and the upstream description. |
| `source`, `helpers` | The example file, and the shared helper file that it imports. |
| `exports`, `uses` | The named exports, and the kit components that the example imports. |
| `docs`, `demo` | The docs section for the chart type, and the live demo with the card's `data-specimen` slug. |
| `upstream` | The saved, unchanged upstream block and the upstream charts page. |

Find every stacked chart:

```bash
jq -r '.charts[] | select(.variant | contains("stacked")) | "\(.source)  \(.demo.live)"' manifest.json
```

## Block entries

| Field | Contents |
|---|---|
| `name`, `title`, `summary` | The block folder name, its README title, and the first sentence of its README. |
| `readme`, `page`, `live` | The README path, its site page, and the live example. |
| `source`, `files` | The source folder and every file in it. |
| `uses`, `usesAi` | The kit components and AI elements that the block imports. |
| `headings` | The README sections, with their anchors. |
| `screenshots` | The screenshot folder, the number of files in it, and up to six still images. |

## Search recipes

The examples use [jq](https://jqlang.org). Put the index in a file first:

```bash
curl -s https://chaioverflow.com/sift-design/raw/manifest.json > manifest.json
```

Find a component by a word in its name, title, keywords, or summary:

```bash
jq -r --arg q "menu" '(.components + .aiElements)[]
  | select([.name, .title, .summary, (.keywords | join(" "))] | join(" ") | ascii_downcase | contains($q))
  | "\(.import)  \(.summary)"' manifest.json
```

List the components in one family:

```bash
jq -r '.families[] | select(.id == "overlays") | .components[]' manifest.json
```

Find the file that exports a name, such as `PromptInputSubmit`:

```bash
jq -r --arg x "PromptInputSubmit" '(.components + .aiElements)[]
  | select(.exports | [.[][]] | index($x)) | .source' manifest.json
```

Find the components that are built on another component, such as `collapsible`:

```bash
jq -r '(.components + .aiElements)[] | select(.uses | index("collapsible")) | .name' manifest.json
```

Find the blocks that use a component, such as `dialog`:

```bash
jq -r '.blocks[] | select(.uses | index("dialog")) | "\(.name)  \(.live)"' manifest.json
```

Get everything that is necessary to copy one component, with the files it imports:

```bash
jq -r --arg n "message" '.aiElements[] | select(.name == $n)
  | .source, (.usesAi[] | "packages/ui/src/ai/\(.).tsx"), (.uses[] | "packages/ui/src/components/\(.).tsx")' manifest.json
```

The listed files can import other files. Run the same query for each name in `uses` and `usesAi` until no new file appears.

List the files in a folder, such as one block's screenshots:

```bash
jq -r '.files[] | select(.path | startswith("screenshots/assistant/")) | .path' manifest.json
```

Compare a component with its upstream version:

```bash
jq -r '.components[] | select(.name == "tabs") | .upstream | "\(.source)  \(.reference)"' manifest.json
```

The same search in JavaScript, without jq:

```js
const index = await (await fetch("https://chaioverflow.com/sift-design/raw/manifest.json")).json();
const all = [...index.components, ...index.aiElements];
const hits = all.filter((c) =>
  [c.name, c.title, c.summary, ...c.keywords].join(" ").toLowerCase().includes("citation"),
);
console.log(hits.map((c) => `${c.import}  ${c.docs?.page}`));
```

## How to choose a result

1. Read the `summary`. It tells when to use the component.
2. Open `docs.page` for the props, the motion, and an example.
3. Open `demo.live` to try it in both themes.
4. Copy `source` and the files in `uses` and `usesAi`. Import the shared styles that the [kit setup](../packages/ui/README.md) lists.

Blocks are fictional example screens, not a feature list. Use them to see how components combine. Do not add their features to your product.

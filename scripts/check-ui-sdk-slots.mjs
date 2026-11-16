// Lists the data-slot names a ui-sdk component shares with the Sift kit.
//
//   node scripts/check-ui-sdk-slots.mjs rating tree token-input
//   node scripts/check-ui-sdk-slots.mjs --all
//
// The kit styles its parts by data-slot across the whole page. A ui-sdk part with
// the same slot name picks up those styles, and props cannot rename it. The names
// come from the component pages that ship with @ui-sdk/react. See docs/ui-sdk.md.
// Exits with 1 when a component shares a name, so it can gate a script.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "node_modules/@ui-sdk/react/docs/components");
if (!fs.existsSync(docs)) {
  console.error("Install @ui-sdk/react and @ui-sdk/core first: npm install @ui-sdk/react @ui-sdk/core");
  process.exit(2);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : /\.(css|tsx)$/.test(entry.name) ? [full] : [];
  });
// Kit sources that select parts by slot: the motion CSS, and Tailwind variants such as has-[[data-slot=x]].
const kitFiles = walk(path.join(root, "packages/ui/src")).filter(
  (file) => !file.includes(`${path.sep}upstream${path.sep}`),
);
const kitSlots = new Map();
for (const file of kitFiles) {
  for (const match of fs.readFileSync(file, "utf8").matchAll(/data-slot[~^$*|]?=\\?"?([a-z0-9-]+)/g)) {
    const files = kitSlots.get(match[1]) ?? new Set();
    files.add(path.relative(root, file));
    kitSlots.set(match[1], files);
  }
}

// ui-sdk components the kit already wraps with Sift styles, by ui-sdk entry name.
const wrapped = new Map();
for (const file of kitFiles.filter((f) => f.endsWith(".tsx"))) {
  const match = fs.readFileSync(file, "utf8").match(/from\s+["']@ui-sdk\/react\/([a-z0-9-]+)["']/);
  if (match)
    wrapped.set(match[1], path.relative(path.join(root, "packages/ui/src/components"), file).replace(/\.tsx$/, ""));
}

const args = process.argv.slice(2);
const names = args.includes("--all")
  ? fs
      .readdirSync(docs)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
  : args;
if (!names.length) {
  console.error("Name one or more ui-sdk components, such as rating or tree, or pass --all.");
  process.exit(2);
}

let shared = 0;
for (const name of names) {
  const page = path.join(docs, `${name}.md`);
  if (!fs.existsSync(page)) {
    console.log(`${name}: no such ui-sdk component`);
    shared++;
    continue;
  }
  if (wrapped.has(name)) {
    console.log(`${name}: the kit ships a Sift version. Import it from @sift-design/ui/${wrapped.get(name)}`);
    continue;
  }
  // The Data Attributes section lists each part as `[data-slot="name"]`.
  const slots = [
    ...new Set([...fs.readFileSync(page, "utf8").matchAll(/\[data-slot="([a-z0-9-]+)"\]/g)].map((m) => m[1])),
  ];
  const clashes = slots.filter((slot) => kitSlots.has(slot));
  if (!clashes.length) {
    console.log(`${name}: no shared slot names`);
    continue;
  }
  shared++;
  console.log(`${name}: shares ${clashes.length} slot name${clashes.length === 1 ? "" : "s"} with the kit`);
  for (const slot of clashes) console.log(`  ${slot}  (${[...kitSlots.get(slot)].sort().join(", ")})`);
}
process.exit(shared ? 1 : 0);

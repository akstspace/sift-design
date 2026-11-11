import fs from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";
import { build, defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const repo = path.resolve(import.meta.dirname, "..");
const types: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};
const hidden = /(^|\/)(node_modules|\.cache|\.git)(\/|$)/;

function send(file: string, res: ServerResponse, fallbackType = "text/plain; charset=utf-8") {
  res.setHeader("Content-Type", types[path.extname(file)] ?? fallbackType);
  fs.createReadStream(file).pipe(res);
}

// /raw/* is the repository as plain files, as in the production build.
function rawFiles(): Plugin {
  const serve = (req: { url?: string }, res: ServerResponse, next: () => void) => {
    const rel = decodeURIComponent((req.url ?? "/").split("?")[0]).replace(/^\/+/, "");
    const file = path.resolve(repo, rel);
    if (!file.startsWith(repo + path.sep) || hidden.test(rel)) return next();
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
    send(file, res);
  };
  // The generated files, made on request exactly as the build writes them.
  const generated = async (req: { url?: string }, res: ServerResponse, next: () => void) => {
    const name = (req.url ?? "").split("?")[0];
    if (!["/llms.txt", "/llms-full.txt", "/raw/manifest.json"].includes(name)) return next();
    const reference = await import(path.join(repo, "scripts", "reference.mjs"));
    if (name === "/raw/manifest.json") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify(reference.manifest(), null, 2) + "\n");
    }
    const files = reference.llmsFiles();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(name === "/llms.txt" ? files.llms : files.full);
  };
  return {
    name: "raw-files",
    configureServer(server) {
      server.middlewares.use("/raw", serve);
      server.middlewares.use(generated);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/raw", serve);
      server.middlewares.use(generated);
    },
  };
}

// /live/<name>/ runs a block or the specimen. The production build writes these
// to dist/live; in development each one is built on its first request.
function liveApps(): Plugin {
  const apps: Record<string, string> = {
    specimen: path.join(repo, "specimen"),
    ...Object.fromEntries(
      ["workbench", "routines", "timeline", "assistant", "onboarding"].map((name) => [
        name,
        path.join(repo, "blocks", name),
      ]),
    ),
  };
  const builds = new Map<string, Promise<string>>();
  const outDir = (name: string) => path.join(repo, ".cache", "live", name);
  const ensure = (name: string) => {
    if (!builds.has(name))
      builds.set(
        name,
        build({
          root: apps[name],
          base: `/live/${name}/`,
          logLevel: "warn",
          configFile: path.join(apps[name], "vite.config.ts"),
          build: { outDir: outDir(name), emptyOutDir: true },
        }).then(() => outDir(name)),
      );
    return builds.get(name)!;
  };
  const serve = async (req: { url?: string }, res: ServerResponse, next: () => void) => {
    const [, name, ...rest] = decodeURIComponent((req.url ?? "/").split("?")[0]).split("/");
    if (!apps[name]) return next();
    if (!rest.length) {
      res.statusCode = 301;
      res.setHeader("Location", `/live/${name}/`);
      return res.end();
    }
    try {
      const dir = await ensure(name);
      const file = path.resolve(dir, rest.join("/"));
      const target =
        file.startsWith(dir) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(dir, "index.html");
      send(target, res);
    } catch (error) {
      builds.delete(name);
      res.statusCode = 500;
      res.end(`Could not build ${name}: ${(error as Error).message}`);
    }
  };
  return {
    name: "live-apps",
    configureServer(server) {
      // A change to a block, the specimen, the kit or the tokens rebuilds on the next request.
      const sources = ["blocks", "specimen", "packages/ui/src", "tokens"].map((dir) => path.join(repo, dir) + path.sep);
      server.watcher.add(sources);
      server.watcher.on("change", (file) => {
        if (sources.some((dir) => file.startsWith(dir)) && !hidden.test(path.relative(repo, file))) builds.clear();
      });
      server.middlewares.use("/live", serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/live", serve);
    },
  };
}

// The site reuses the real specimen sections without their Larkspur identity.
function specimenBrand(): Plugin {
  return {
    name: "site-specimen-brand",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/specimen/src/sections/Display.tsx")) return;
      return code
        .replace(
          'import { LarkspurMark } from "../../../blocks/_shared/brand";',
          `import LarkspurMark from ${JSON.stringify(path.join(repo, "site/src/Mark.tsx"))};`,
        )
        .replaceAll("Larkspur assistant conversation", "Sift Design sample conversation")
        .replace(">Larkspur</span>", ">Sift Design</span>")
        .replaceAll("Larkspur assistant", "Sift Design assistant");
    },
  };
}

export default defineConfig({
  plugins: [specimenBrand(), react(), tailwindcss(), rawFiles(), liveApps()],
  server: { port: 5300, fs: { allow: [repo] } },
  preview: { port: 5300 },
});

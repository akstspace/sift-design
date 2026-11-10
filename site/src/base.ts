/*
 * Where the site is served from. Locally and in the Docker image that is "/";
 * on a project page such as GitHub Pages it is "/<repo>/". Code writes site
 * paths from the root ("/motion", "/raw/tokens/tokens.css") and passes them
 * through `at` when they become URLs.
 */
export const BASE = import.meta.env.BASE_URL;

/** A site path as a URL under the base. Anything else passes through. */
export const at = (path: string) => (path.startsWith("/") && !path.startsWith("//") ? BASE + path.slice(1) : path);

/** The site path for a pathname under the base: "/sift-design/motion" -> "/motion". */
export const routeOf = (pathname: string) =>
  "/" + (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\/+/, ""));

/** The site's address without a trailing slash, for prompts that leave the site. */
export const siteUrl = () => location.origin + BASE.replace(/\/$/, "");

const media = /\.(png|jpe?g|webp|gif|mp4|webm|woff2?|svg)$/i;
const rawBase: string | undefined = import.meta.env.VITE_RAW_URL;

/**
 * A repository file as plain text. Hosts that serve .ts and .tsx with the wrong
 * content type set VITE_RAW_URL to a raw-file host; images and video always
 * come from this site.
 */
export const rawUrl = (repoPath: string) =>
  rawBase && !media.test(repoPath) ? `${rawBase.replace(/\/$/, "")}/${repoPath}` : siteUrl() + "/raw/" + repoPath;

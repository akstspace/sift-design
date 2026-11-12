import { useEffect, useLayoutEffect, useRef, lazy, Suspense } from "react";
import {
  IconHome,
  IconTerminal2,
  IconPalette,
  IconRipple,
  IconComponents,
  IconTypography,
  IconAdjustments,
  IconLayoutDashboard,
  IconChecklist,
  IconBrandGithub,
  IconChartArea,
} from "@tabler/icons-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@sift-design/ui/sidebar";
import { SiblingTransition } from "@sift-design/ui/page-transition";
import { TooltipProvider } from "@sift-design/ui/tooltip";
import { Toaster } from "@sift-design/ui/sonner";
import { GITHUB, pages, topPages } from "./content";
import { Button } from "@sift-design/ui/button";
import { useRouter } from "./useRouter";
import SiftMark from "./Mark";
import { Markdown, DocActions, Outline } from "./Markdown";
import { Overview, AgentPage, Patterns, Retheming } from "./Pages";
import { BlocksPage, BlockPage } from "./Blocks";
import ThemeSelect from "./ThemeSelect";
import CommandMenu from "./CommandMenu";
import Foundations from "./Foundations";
import Landing from "./Landing";
import MotionPage from "./MotionPage";
import { at } from "./base";
const ComponentsPage = lazy(() => import("./ComponentsPage"));
const ChartsPage = lazy(() => import("./ChartsPage"));
const icons = [
  IconHome,
  IconTerminal2,
  IconPalette,
  IconRipple,
  IconComponents,
  IconChartArea,
  IconTypography,
  IconAdjustments,
  IconLayoutDashboard,
  IconChecklist,
];
function Shell({ path }: { path: string }) {
  const page = pages.find((page) => page.path === path);
  const { setOpenMobile } = useSidebar();
  const previous = useRef(path);
  const scroller = useRef<HTMLElement>(null);
  const direction =
    pages.findIndex((page) => page.path === path) >= pages.findIndex((page) => page.path === previous.current) ? 1 : -1;
  useEffect(() => {
    previous.current = path;
    document.title = `${page?.title ?? "Page not found"} — Sift Design`;
  }, [path, page]);
  const family = path.split("/")[2] ?? "controls";
  // Family and chart-type navigation keeps its tabs mounted; only the examples below them change.
  const section = ["/components", "/charts"].find((root) => path === root || path.startsWith(root + "/"));
  const routeKey = section ?? path;
  useLayoutEffect(() => {
    if (previous.current === path) return;
    scroller.current?.querySelector<HTMLElement>('[data-transition-page="current"] h1')?.focus({ preventScroll: true });
  }, [path]);
  // Component and block pages use the full width; guides get the reading column and outline.
  const wide = path.startsWith("/components") || path.startsWith("/charts") || path.startsWith("/blocks");
  const file = page?.file ?? (path === "/components" ? "packages/ui/docs/controls.md" : undefined);
  const content =
    path === "/overview" ? (
      <Overview />
    ) : path === "/use-with-your-agent" ? (
      <AgentPage />
    ) : path === "/foundations" ? (
      <Foundations />
    ) : path === "/motion" ? (
      <MotionPage />
    ) : page && (path === "/components" || page.group === "Components") ? (
      <Suspense fallback={<p role="status">Loading live components…</p>}>
        <ComponentsPage family={family} />
      </Suspense>
    ) : page && (path === "/charts" || page.group === "Charts") ? (
      <Suspense fallback={<p role="status">Loading live charts…</p>}>
        <ChartsPage type={path.split("/")[2]} />
      </Suspense>
    ) : path === "/patterns" ? (
      <Patterns />
    ) : path === "/retheming" ? (
      <Retheming />
    ) : path === "/blocks" ? (
      <BlocksPage />
    ) : page?.group === "Blocks" ? (
      <BlockPage name={family} />
    ) : file ? (
      <Markdown file={file} />
    ) : (
      <>
        <p className="lead">We couldn’t find that page. Use search or return to the home page.</p>
        <a href={at("/")}>Go to the home page</a>
      </>
    );
  return (
    <>
      <a className="skip-link" href="#page-heading">
        Skip to content
      </a>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <a href={at("/")} className="brand">
            <SiftMark size={34} entrance="rail" />
            <span data-sidebar-label>Sift Design</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Design reference</SidebarGroupLabel>
            <nav aria-label="Main navigation">
              <SidebarMenu>
                {topPages.map((item, index) => {
                  const Icon = icons[index];
                  const active =
                    item.path === "/" ? path === "/" : path === item.path || path.startsWith(item.path + "/");
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                        <a href={at(item.path)} onClick={() => setOpenMobile(false)}>
                          <Icon aria-hidden />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div data-sidebar-label className="rail-footer">
            <a href={at("/llms.txt")}>Agent reading guide</a>
            <span>Plain-text guides for agents</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset ref={scroller} className="site-inset">
        <header className="site-toolbar">
          <SidebarTrigger />
          <div className="breadcrumb">
            <a href={at("/")}>Sift Design</a>
            <span aria-hidden>/</span>
            <span>{page?.title ?? "Not found"}</span>
          </div>
          <div className="toolbar-actions">
            <CommandMenu />
            <Button variant="ghost" size="icon" asChild>
              <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="Sift Design on GitHub">
                <IconBrandGithub aria-hidden />
              </a>
            </Button>
            <ThemeSelect />
          </div>
        </header>
        <SiblingTransition pageKey={routeKey} direction={direction} className="page-transition" focusHeading={false}>
          <div className={`page-body ${wide ? "component-page" : ""}`}>
            <div className="page-heading-row">
              <h1 id="page-heading" data-page-heading tabIndex={-1}>
                {page?.title ?? "Page not found"}
              </h1>
              {file && <DocActions file={file} />}
            </div>
            <div className={file && !wide ? "reading-layout" : ""}>
              <div className="page-content">{content}</div>
              {file && !wide && <Outline file={file} />}
            </div>
            {file && (
              <div className="reading-end">
                <h2>Use this with your agent</h2>
                <p>Agents read the same pages as plain files, starting from llms.txt.</p>
                <a href={at("/use-with-your-agent")}>Get a prompt for your agent</a>
              </div>
            )}
            <footer className="page-footer">
              <SiftMark size={22} />
              <span>Sift Design</span>
              <a href={at("/reference")}>Full design reference</a>
              <a href={at("/finding-components")}>Component index</a>
              <a href={at("/credits")}>Credits</a>
            </footer>
          </div>
        </SiblingTransition>
      </SidebarInset>
      <Toaster />
    </>
  );
}
export default function App() {
  const path = useRouter();
  return (
    <TooltipProvider>
      {path === "/" ? (
        <Landing />
      ) : (
        <SidebarProvider>
          <Shell path={path} />
        </SidebarProvider>
      )}
    </TooltipProvider>
  );
}

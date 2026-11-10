import { Toaster } from "@sift-design/ui/sonner";
import { TooltipProvider } from "@sift-design/ui/tooltip";
import { LarkspurMark } from "../../blocks/_shared/brand";
import Overlays from "./sections/Overlays";
import Controls from "./sections/Controls";
import Display from "./sections/Display";

const sections = [
  { id: "controls", label: "Controls", Section: Controls },
  { id: "overlays", label: "Overlays and menus", Section: Overlays },
  { id: "display", label: "Display and layout", Section: Display },
];

// `?section=overlays` shows one family alone, which keeps screenshots focused.
export default function App() {
  const only = new URLSearchParams(location.search).get("section");
  const shown = sections.filter((s) => !only || s.id === only);
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-dvh bg-ground">
        <header className="sticky top-0 z-10 border-b bg-ground/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
            <LarkspurMark size={24} />
            <span className="font-semibold">Larkspur</span>
            <span className="text-muted-foreground">Components</span>
            <nav aria-label="Component families" className="-mx-1 flex w-full gap-1 overflow-x-auto sm:mx-0 sm:ml-auto sm:w-auto">
              {sections.map((s) => (
                <a key={s.id} href={"#" + s.id} className="shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] text-muted-foreground hover:bg-tint hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto flex max-w-[1240px] flex-col gap-14 px-4 py-8 sm:px-6 sm:py-10">
          {shown.map(({ id, Section }) => <Section key={id} />)}
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

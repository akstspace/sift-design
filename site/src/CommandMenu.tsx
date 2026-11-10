import { useEffect, useRef, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@sift-design/ui/command";
import { Button } from "@sift-design/ui/button";
import { IconSearch, IconFileText, IconHash } from "@tabler/icons-react";
import { docText, headings, pages } from "./content";
import { at } from "./base";
import { revealHash } from "./useRouter";
const headingEntries = pages.flatMap((page) =>
  page.file
    ? headings(docText(page.file)).map((heading) => ({
        title: heading.title,
        page: page.title,
        url: `${page.path}#${heading.id}`,
      }))
    : [],
);
export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<string>();
  const trigger = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!document.querySelector('[data-slot="command-input"]')) {
          opener.current = document.activeElement as HTMLElement;
          setDestination(undefined);
        }
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  function go(url: string) {
    setDestination(url);
    setOpen(false);
    const link = document.createElement("a");
    link.href = at(url);
    document.body.append(link);
    link.click();
    link.remove();
  }
  return (
    <>
      <Button
        ref={trigger}
        variant="outline"
        aria-label="Find a page or heading ⌘ K"
        className="search-trigger"
        onClick={() => {
          opener.current = trigger.current;
          setDestination(undefined);
          setQuery("");
          setOpen(true);
        }}
      >
        <IconSearch aria-hidden size={16} />
        <span>Find a page or heading</span>
        <kbd aria-hidden="true">⌘ K</kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (value) setDestination(undefined);
        }}
        title="Find in Sift Design"
        description="Jump to a page or heading in the design reference."
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (destination) {
            const url = new URL(destination, location.origin);
            if (url.hash) {
              revealHash(url.hash, "auto");
              return;
            }
            const target = document.querySelector<HTMLElement>('[data-transition-page="current"] h1');
            if (target) {
              target.tabIndex = -1;
              target.focus({ preventScroll: true });
            }
          } else {
            const target =
              opener.current?.isConnected && opener.current !== document.body ? opener.current : trigger.current;
            target?.focus({ preventScroll: true });
          }
        }}
      >
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search pages and headings…" />
        <CommandList>
          <CommandEmpty>No matching page or heading.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page.path} value={page.title} onSelect={() => go(page.path)}>
                <IconFileText aria-hidden />
                <span>{page.title}</span>
                <small className="ml-auto text-muted-foreground">{page.group}</small>
              </CommandItem>
            ))}
          </CommandGroup>
          {query.trim() && (
            <CommandGroup heading="Headings">
              {headingEntries.map((entry) => (
                <CommandItem key={entry.url} value={`${entry.page} ${entry.title}`} onSelect={() => go(entry.url)}>
                  <IconHash aria-hidden />
                  <span>{entry.title}</span>
                  <small className="ml-auto text-muted-foreground">{entry.page}</small>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { Button } from "@sift-design/ui/button";
import { Sources, SourcesTrigger, SourcesContent, Source } from "@sift-design/ui/ai/sources";
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
  InlineCitationQuote,
} from "@sift-design/ui/ai/inline-citation";
import { Image } from "@sift-design/ui/ai/image";
import { SpecimenItem } from "../../frame";

const sources = [
  {
    title: "Lavender winter care",
    url: "https://larkspur.example/guides/lavender-winter",
    description: "Care notes for lavender in pots at Fernbrook Greenhouse.",
    quote: "Keep the roots dry enough to avoid standing water.",
  },
  {
    title: "Cold-frame ventilation",
    url: "https://larkspur.example/guides/cold-frame",
    description: "Ventilation checks for sheltered plants during winter.",
    quote: "Open the frame on mild days to release moisture.",
  },
  {
    title: "Winter watering checks",
    url: "https://larkspur.example/notes/winter-watering",
    description: "Check the growing medium before adding water.",
    quote: "Water only when the upper layer has dried.",
  },
  {
    title: "Herb bench layout",
    url: "https://larkspur.example/plans/herb-bench",
    description: "A raised bench keeps pots clear of wet ground.",
    quote: "Leave space between pots for air to circulate.",
  },
];

function SourceList() {
  return (
    <Sources>
      <SourcesTrigger count={sources.length} />
      <SourcesContent>
        {sources.map((source) => (
          <Source key={source.url} href={source.url} title={source.title} />
        ))}
      </SourcesContent>
    </Sources>
  );
}

function Citation({ number, entries }: { number: number; entries: typeof sources }) {
  return (
    <InlineCitationCard>
      <InlineCitationCardTrigger number={number} sources={entries.map((source) => source.url)} />
      <InlineCitationCardBody>
        <InlineCitationCarousel>
          <InlineCitationCarouselHeader>
            <span className="pl-2 text-[12px] text-muted-foreground">Care references</span>
            <InlineCitationCarouselIndex />
            <InlineCitationCarouselPrev />
            <InlineCitationCarouselNext />
          </InlineCitationCarouselHeader>
          <InlineCitationCarouselContent>
            {entries.map((source) => (
              <InlineCitationCarouselItem key={source.url}>
                <InlineCitationSource title={source.title} url={source.url} description={source.description} />
                <InlineCitationQuote>{source.quote}</InlineCitationQuote>
              </InlineCitationCarouselItem>
            ))}
          </InlineCitationCarouselContent>
        </InlineCitationCarousel>
      </InlineCitationCardBody>
    </InlineCitationCard>
  );
}

function GeneratedBench() {
  const wrapper = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState({ base64: "", mediaType: "image/svg+xml", uint8Array: new Uint8Array() });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!wrapper.current) return;
    const make = () => {
      const style = getComputedStyle(wrapper.current!);
      const color = (token: string) => style.getPropertyValue(token).trim();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" rx="12" fill="${color("--tint")}"/><g fill="none" stroke="${color("--muted")}" stroke-width="3" stroke-linejoin="round"><path d="M158 255 426 160 656 237 388 339Z" fill="${color("--subtle")}"/><path d="m158 255 230 84 268-102v22L388 361l-230-84Z"/><path d="M177 284v108l24-9V293m187 68v99l25-10v-98m220-85v108l-24 9V276"/><path d="m210 238 230 82m-177-101 230 83m-177-101 230 83m-177-101 230 83"/></g><g fill="${color("--accent-soft")}" stroke="${color("--accent")}" stroke-width="3"><path d="m287 225 7 30q18 12 36-1l7-29Z"/><ellipse cx="312" cy="225" rx="25" ry="8"/><path d="m414 210 7 30q18 12 36-1l7-29Z"/><ellipse cx="439" cy="210" rx="25" ry="8"/><path d="m491 261 7 30q18 12 36-1l7-29Z"/><ellipse cx="516" cy="261" rx="25" ry="8"/></g><g stroke="${color("--accent")}" stroke-width="3" fill="none"><path d="M312 220v-36m0 20-13-13m13 6 13-19m114 27v-36m0 22-12-13m12 7 13-18m64 89v-35m0 20-13-13m13 6 13-18"/></g><text x="38" y="46" fill="${color("--ink")}" font-family="sans-serif" font-size="18">Fernbrook Greenhouse</text><text x="38" y="73" fill="${color("--muted")}" font-family="sans-serif" font-size="14">Herb bench concept${revision ? ` · revision ${revision + 1}` : ""}</text></svg>`;
      const base64 = btoa(unescape(encodeURIComponent(svg)));
      setImage({
        base64,
        mediaType: "image/svg+xml",
        uint8Array: Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)),
      });
    };
    make();
    const observer = new MutationObserver(make);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, [revision]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div ref={wrapper} className="w-full max-w-[560px] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px]">A raised bench for winter herbs</p>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            timer.current = setTimeout(() => {
              setRevision((value) => value + 1);
              setLoading(false);
            }, 1000);
          }}
        >
          Generate again
        </Button>
      </div>
      <Image
        {...image}
        loading={loading || !image.base64}
        alt="Bench concept with a slatted top, raised legs, and three lavender pots."
        className="w-full"
      />
      <p role="status" className="text-[12px] text-muted-foreground">
        {loading ? "Preparing a new bench concept." : "Generated illustration. Check dimensions before building."}
      </p>
    </div>
  );
}

export default function SourcesExamples() {
  return (
    <>
      <SpecimenItem
        name="Sources"
        note="Show the references behind an answer. The list opens with a measured disclosure."
      >
        <div className="w-full space-y-2">
          <p className="text-[13px] leading-relaxed">Winter care notes for the Fernbrook herb bench.</p>
          <SourceList />
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Inline citation"
        note="Check a reference without leaving the answer. Focus or tap a citation to open its source cards."
      >
        <div className="w-full max-w-[680px] space-y-4">
          <p className="text-[14px] leading-8">
            <InlineCitation>
              <InlineCitationText>
                Keep potted lavender under cover, with good drainage and space between plants.
              </InlineCitationText>
              <Citation number={1} entries={sources.slice(0, 3)} />
            </InlineCitation>{" "}
            <InlineCitation>
              <InlineCitationText>Water sparingly in winter, and open the cold frame on mild days.</InlineCitationText>
              <Citation number={2} entries={[sources[1], sources[2]]} />
            </InlineCitation>
          </p>
          <SourceList />
          <p className="text-[12px] text-muted-foreground">
            Use the arrow buttons to compare sources. Press Escape to close.
          </p>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Image"
        note="Show generated media with a text alternative. Generate again to see the loading state and a short fade."
      >
        <GeneratedBench />
      </SpecimenItem>
    </>
  );
}

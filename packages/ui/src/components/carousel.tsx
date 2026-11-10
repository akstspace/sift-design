"use client"

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react"
import { rubberBand, spring } from "@sift-design/tokens/motion"
import { cn } from "cn"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { IconArrowLeft as ArrowLeft, IconArrowRight as ArrowRight } from "@tabler/icons-react"

import { Button } from "./button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  offset: MotionValue<number>
  beginDrag: () => void
  updateDrag: (offset: number) => void
  endDrag: (velocity: number) => void
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const reduced = useReducedMotion()
  const offset = useMotionValue(0)
  const dragOrigin = React.useRef(0)
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      loop: false,
      watchDrag: false,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const settleTo = React.useCallback((index: number, velocity = offset.getVelocity()) => {
    if (!api) return
    const engine = api.internalEngine()
    const target = engine.scrollSnaps[Math.min(engine.scrollSnaps.length - 1, Math.max(0, index))] ?? 0
    api.scrollTo(index, true)
    animate(offset, target, reduced ? { duration: 0 } : { ...spring.smooth, velocity })
  }, [api, offset, reduced])
  const scrollPrev = React.useCallback(() => settleTo((api?.selectedScrollSnap() ?? 0) - 1), [api, settleTo])
  const scrollNext = React.useCallback(() => settleTo((api?.selectedScrollSnap() ?? 0) + 1), [api, settleTo])
  const beginDrag = React.useCallback(() => { offset.stop(); dragOrigin.current = offset.get() }, [offset])
  const updateDrag = React.useCallback((distance: number) => {
    if (!api) return
    const snaps = api.internalEngine().scrollSnaps
    const first = snaps[0] ?? 0
    const last = snaps[snaps.length - 1] ?? 0
    const raw = dragOrigin.current + distance
    const dimension = orientation === "horizontal" ? api.rootNode().clientWidth : api.rootNode().clientHeight
    offset.set(raw > first ? first + rubberBand(raw - first, dimension) : raw < last ? last + rubberBand(raw - last, dimension) : raw)
  }, [api, offset, orientation])
  const endDrag = React.useCallback((velocity: number) => {
    if (!api) return
    const projected = offset.get() + (reduced ? 0 : velocity * 0.18)
    const snaps = api.internalEngine().scrollSnaps
    const closest = snaps.reduce((best, point, index) => Math.abs(point - projected) < Math.abs((snaps[best] ?? 0) - projected) ? index : best, 0)
    settleTo(closest, reduced ? 0 : velocity)
  }, [api, offset, reduced, settleTo])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    const initialize = () => {
      api.internalEngine().translate.toggleActive(false)
      offset.jump(api.internalEngine().scrollSnaps[api.selectedScrollSnap()] ?? 0)
      onSelect(api)
    }
    initialize()
    api.on("reInit", initialize)
    api.on("select", onSelect)
    return () => { api.off("select", onSelect); api.off("reInit", initialize); offset.stop() }
  }, [api, onSelect, offset])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        offset, beginDrag, updateDrag, endDrag,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation, offset, beginDrag, updateDrag, endDrag } = useCarousel()
  const { onAnimationStart: _onAnimationStart, onDrag: _onDrag, onDragStart: _onDragStart, onDragEnd: _onDragEnd, ...rest } = props
  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <motion.div
        style={{ [orientation === "horizontal" ? "x" : "y"]: offset, touchAction: orientation === "horizontal" ? "pan-y" : "pan-x" }}
        onPanStart={beginDrag}
        onPan={(_, info) => updateDrag(orientation === "horizontal" ? info.offset.x : info.offset.y)}
        onPanEnd={(_, info) => endDrag(orientation === "horizontal" ? info.velocity.x : info.velocity.y)}
        className={cn(
          "flex select-none cursor-grab active:cursor-grabbing",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...rest}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}

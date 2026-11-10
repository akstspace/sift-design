"use client"

import * as React from "react"
import { IconCircleCheck as CircleCheckIcon, IconInfoCircle as InfoIcon, IconLoader2 as Loader2Icon, IconAlertOctagon as OctagonXIcon, IconAlertTriangle as TriangleAlertIcon } from "@tabler/icons-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/** No theme provider required: follow the same live html.dark class as the kit. */
const Toaster = ({ theme: themeProp, style, ...props }: ToasterProps) => {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")
  React.useEffect(() => {
    const html = document.documentElement
    const sync = () => setTheme(html.classList.contains("dark") ? "dark" : "light")
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={themeProp ?? theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--surface)",
        "--normal-text": "var(--ink)",
        "--normal-border": "var(--line)",
        "--border-radius": "8px",
        ...style,
      } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster }

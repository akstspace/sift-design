import type { Experimental_GeneratedImage } from "ai";
import { cn } from "cn";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
  loading?: boolean;
};

/** Supply descriptive alt text for every meaningful generated image. */
export const Image = ({ base64, uint8Array: _uint8Array, mediaType, className, alt, loading = false }: ImageProps) => {
  if (loading)
    return (
      <div
        data-slot="ai-image-placeholder"
        role="status"
        aria-live="polite"
        className={cn(
          "flex aspect-[8/5] w-full items-center justify-center rounded-md bg-tint text-[13px] text-muted-foreground",
          className,
        )}
      >
        Generating image…
      </div>
    );
  return (
    <img
      data-slot="ai-image"
      alt={alt}
      className={cn("ai-generated-image block h-auto max-w-full rounded-md", className)}
      src={`data:${mediaType};base64,${base64}`}
    />
  );
};

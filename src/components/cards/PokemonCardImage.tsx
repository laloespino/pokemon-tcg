import { useState } from "react"

import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

type PokemonCardImageProps = {
  src?: string
  alt: string
  className?: string
  placeholderClassName?: string
  loading?: "eager" | "lazy"
}

export function PokemonCardImage({
  src,
  alt,
  className,
  placeholderClassName,
  loading = "lazy",
}: PokemonCardImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex aspect-[245/342] w-full flex-col items-center justify-center rounded-xl border bg-muted p-3 text-center text-muted-foreground shadow-sm",
          placeholderClassName
        )}
      >
        <ImageOff className="mb-2 size-6" />
        <span className="line-clamp-2 text-[11px] leading-tight font-medium">
          {alt}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}

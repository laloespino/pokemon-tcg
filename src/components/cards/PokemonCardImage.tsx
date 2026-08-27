import { useState } from "react"

import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

type PokemonCardImageProps = {
  src?: string
  fallbackSrcs?: string[]
  alt: string
  className?: string
  placeholderClassName?: string
  loading?: "eager" | "lazy"
}

export function PokemonCardImage({
  src,
  fallbackSrcs = [],
  alt,
  className,
  placeholderClassName,
  loading = "lazy",
}: PokemonCardImageProps) {
  return (
    <PokemonCardImageContent
      key={src ?? "missing"}
      src={src}
      fallbackSrcs={fallbackSrcs}
      alt={alt}
      className={className}
      placeholderClassName={placeholderClassName}
      loading={loading}
    />
  )
}

function PokemonCardImageContent({
  src,
  fallbackSrcs,
  alt,
  className,
  placeholderClassName,
  loading,
}: PokemonCardImageProps & {
  fallbackSrcs: string[]
  loading: "eager" | "lazy"
}) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  if (!currentSrc || failed) {
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
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={() => {
        const nextSrc = fallbackSrcs[fallbackIndex]

        if (nextSrc) {
          setCurrentSrc(nextSrc)
          setFallbackIndex((index) => index + 1)
          return
        }

        setFailed(true)
      }}
      className={className}
    />
  )
}

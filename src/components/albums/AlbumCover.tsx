import { Folder, Heart, Images } from "lucide-react"

import { cn } from "@/lib/utils"

type AlbumCoverProps = {
  name: string
  variant?: "default" | "owned" | "wishlist"
}

const coverColors = [
  "from-rose-500/25 to-amber-500/20",
  "from-sky-500/25 to-emerald-500/20",
  "from-violet-500/25 to-cyan-500/20",
  "from-lime-500/25 to-blue-500/20",
  "from-fuchsia-500/25 to-orange-500/20",
]

function colorIndex(value: string) {
  return value
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function AlbumCover({ name, variant = "default" }: AlbumCoverProps) {
  const Icon =
    variant === "wishlist" ? Heart : variant === "owned" ? Images : Folder

  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br via-transparent",
          variant === "wishlist"
            ? "from-pink-500/35 to-amber-400/25"
            : variant === "owned"
              ? "from-emerald-500/35 to-sky-400/25"
              : coverColors[colorIndex(name) % coverColors.length]
        )}
      />

      <Icon className="relative size-7" />
    </div>
  )
}

import { Check, Star } from "lucide-react"

import type { PokemonCard } from "@/types/card"
import { cn } from "@/lib/utils"
import { useCollectionStore } from "@/store/collection-store"

import { PokemonCardImage } from "./PokemonCardImage"

type PokemonCardMiniProps = {
  card: PokemonCard
  showStatus?: boolean
  onClick: () => void
}

export function PokemonCardMini({
  card,
  showStatus = true,
  onClick,
}: PokemonCardMiniProps) {
  const owned = useCollectionStore((state) =>
    state.ownedCardIds.includes(card.id)
  )
  const wanted = useCollectionStore((state) =>
    state.wishlistCardIds.includes(card.id)
  )

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver ${card.name}`}
      className={cn(
        "group relative overflow-hidden rounded-xl transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        showStatus && owned && "ring-2 ring-white/90"
      )}
    >
      <PokemonCardImage
        src={card.images.small}
        alt={card.name}
        className="block h-auto w-full rounded-xl"
      />

      {showStatus && owned ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          <div className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-black shadow-md ring-1 ring-black/10">
            <Check size={15} strokeWidth={4} />
          </div>
        </>
      ) : showStatus && wanted ? (
        <div className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-yellow-400/90 text-black/70 shadow-md ring-1 ring-black/10">
          <Star size={17} fill="currentColor" strokeWidth={3} />
        </div>
      ) : null}
    </button>
  )
}

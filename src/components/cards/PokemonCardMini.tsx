import { Check, Star } from "lucide-react"

import type { PokemonCard } from "@/types/card"
import { useCollectionStore } from "@/store/collection-store"

type PokemonCardMiniProps = {
  card: PokemonCard
  onClick: () => void
}

export function PokemonCardMini({ card, onClick }: PokemonCardMiniProps) {
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
      className="group relative overflow-hidden rounded-xl transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <img
        src={card.images.small}
        alt={card.name}
        loading="lazy"
        className="block h-auto w-full rounded-xl"
      />

      {owned ? (
        <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/45 text-black/70 shadow-xl ring-1 ring-black/10 backdrop-blur-md">
          <Check size={18} strokeWidth={4} />
        </div>
      ) : wanted ? (
        <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400/45 text-black/70 shadow-xl ring-1 ring-black/10 backdrop-blur-md">
          <Star size={17} fill="currentColor" strokeWidth={3} />
        </div>
      ) : null}
    </button>
  )
}

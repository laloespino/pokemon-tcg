import { Check, Folder, Star } from "lucide-react"
import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

type CardSearchResultsProps = {
  cards: PokemonCard[]
  selectedCardIds?: string[]
  onToggleCard?: (cardId: string) => void
}

export function CardSearchResults({
  cards,
  selectedCardIds = [],
  onToggleCard,
}: CardSearchResultsProps) {
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const wishlistCardIds = useCollectionStore((state) => state.wishlistCardIds)

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {cards.map((card) => {
        const selected = selectedCardIds.includes(card.id)
        const owned = ownedCardIds.includes(card.id)
        const wanted = wishlistCardIds.includes(card.id)

        return (
          <button
            key={card.id}
            type="button"
            disabled={!onToggleCard}
            aria-label={
              selected
                ? `Quitar ${card.name} del álbum`
                : `Agregar ${card.name} al álbum`
            }
            onClick={() => onToggleCard?.(card.id)}
            className="group relative overflow-hidden rounded-xl transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none"
          >
            <img
              src={card.images.small}
              alt={card.name}
              className="block h-auto w-full rounded-xl"
              loading="lazy"
            />

            {selected && (
              <span className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl ring-1 ring-white/25">
                <Folder className="size-7" strokeWidth={2.6} />
              </span>
            )}

            {!selected && owned ? (
              <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-white/45 text-black/70 shadow-lg ring-1 ring-black/10 backdrop-blur-md">
                <Check size={13} strokeWidth={4} />
              </span>
            ) : !selected && wanted ? (
              <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-yellow-400/45 text-black/70 shadow-lg ring-1 ring-black/10 backdrop-blur-md">
                <Star size={12} fill="currentColor" strokeWidth={3} />
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

import { Check } from "lucide-react"

import type { PokemonCard } from "@/types/card"
import { useCollectionStore } from "@/store/collection-store"

type PokemonCardMiniProps = {
  card: PokemonCard
  onClick: () => void
}

export function PokemonCardMini({
  card,
  onClick,
}: PokemonCardMiniProps) {
  const owned = useCollectionStore((state) =>
    state.ownedCardIds.includes(card.id),
  )

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${card.name}`}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        transition
        hover:scale-[1.02]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
      "
    >
      <img
        src={card.images.small}
        alt={card.name}
        loading="lazy"
        className="
          block
          h-auto
          w-full
          rounded-xl
        "
      />

      {owned && (
        <div
          className="
            absolute
            right-2
            top-2
            flex
            size-8
            items-center
            justify-center
            rounded-full
            bg-green-500
            text-white
            shadow
          "
        >
          <Check size={18} strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

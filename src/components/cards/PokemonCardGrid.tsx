import { useState } from "react"

import { PokemonCardMini } from "./PokemonCardMini"
import { PokemonCardViewer } from "./PokemonCardViewer"

import type { PokemonCard } from "@/types/card"

type PokemonCardGridProps = {
  cards: PokemonCard[]
}

export function PokemonCardGrid({
  cards,
}: PokemonCardGridProps) {
  const [selectedCardId, setSelectedCardId] =
    useState<string | null>(null)

  return (
    <>
      <div
        className="
          grid
          grid-cols-3
          gap-2
          sm:grid-cols-4
          md:grid-cols-5
          lg:grid-cols-6
        "
      >
        {cards.map((card) => (
          <PokemonCardMini
            key={card.id}
            card={card}
            onClick={() => setSelectedCardId(card.id)}
          />
        ))}
      </div>

      {selectedCardId && (
        <PokemonCardViewer
          cards={cards}
          initialCardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </>
  )
}

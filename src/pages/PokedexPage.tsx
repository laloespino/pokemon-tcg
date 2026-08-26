import { useState } from "react"

import { CollectionGrid } from "@/components/collections/CollectionGrid"
import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { collections } from "@/data/collections"

import type { PokemonCollection } from "@/types/collection"
import type { PokemonCard } from "@/types/card"

const cards: PokemonCard[] = [
  {
    id: "base1-4",
    name: "Charizard",
    number: "4",
    artist: "Mitsuhiro Arita",
    rarity: "Rare Holo",
    set: {
      id: "base1",
      name: "Base Set",
    },
    images: {
      small: "https://images.pokemontcg.io/base1/4.png",
      large: "https://images.pokemontcg.io/base1/4_hires.png",
    },
  },
  {
    id: "base1-44",
    name: "Bulbasaur",
    number: "44",
    artist: "Mitsuhiro Arita",
    rarity: "Common",
    set: {
      id: "base1",
      name: "Base Set",
    },
    images: {
      small: "https://images.pokemontcg.io/base1/44.png",
      large: "https://images.pokemontcg.io/base1/44_hires.png",
    },
  },
  {
    id: "base1-58",
    name: "Pikachu",
    number: "58",
    artist: "Mitsuhiro Arita",
    rarity: "Common",
    set: {
      id: "base1",
      name: "Base Set",
    },
    images: {
      small: "https://images.pokemontcg.io/base1/58.png",
      large: "https://images.pokemontcg.io/base1/58_hires.png",
    },
  },
]

export function PokedexPage() {
  const [selectedCollection, setSelectedCollection] =
    useState<PokemonCollection | null>(null)

  if (selectedCollection) {
    const collectionCards = cards.filter((card) =>
      selectedCollection.cardIds.includes(card.id),
    )

    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedCollection(null)}
          className="mb-4 text-sm text-muted-foreground"
        >
          ← Collections
        </button>

        <div className="mb-5">
          <h1 className="text-2xl font-bold">
            {selectedCollection.name}
          </h1>

          {selectedCollection.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedCollection.description}
            </p>
          )}
        </div>

        <PokemonCardGrid cards={collectionCards} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          Pokédex
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Explore Pokémon TCG collections
        </p>
      </div>

      <CollectionGrid
        collections={collections}
        onSelect={setSelectedCollection}
      />
    </div>
  )
}

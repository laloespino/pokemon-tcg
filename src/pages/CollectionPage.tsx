import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { collections } from "@/data/collections"

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

export function CollectionPage() {
  const { collectionId } = useParams()

  const collection = collections.find(
    (collection) => collection.id === collectionId,
  )

  if (!collection) {
    return (
      <div>
        <h1 className="text-xl font-bold">
          Collection not found
        </h1>

        <Link to="/" className="text-sm underline">
          Back to Pokédex
        </Link>
      </div>
    )
  }

  const collectionCards = cards.filter((card) =>
    collection.cardIds.includes(card.id),
  )

  return (
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Collections
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          {collection.name}
        </h1>

        {collection.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
      </div>

      <PokemonCardGrid cards={collectionCards} />
    </div>
  )
}

import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useParams,
} from "react-router-dom"

import { ArrowLeft } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { collections } from "@/data/collections"

import { getCardsBySet } from "@/services/pokemon-service"

import type { PokemonCard } from "@/types/card"

export function CollectionPage() {
  const { collectionId } =
    useParams()

  const collection =
    collections.find(
      (item) =>
        item.id === collectionId,
    )

  const [cards, setCards] =
    useState<PokemonCard[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      if (!collection) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const result =
          await getCardsBySet(
            collection.setId,
          )

        if (!cancelled) {
          setCards(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError(
            "Could not load this collection.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCards()

    return () => {
      cancelled = true
    }
  }, [collection])

  if (!collection) {
    return (
      <div>
        <h1 className="text-xl font-bold">
          Collection not found
        </h1>

        <Link
          to="/"
          className="mt-3 inline-flex text-sm text-muted-foreground"
        >
          Back to Pokédex
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/"
        className="
          mb-4
          inline-flex
          items-center
          gap-1
          text-sm
          text-muted-foreground
        "
      >
        <ArrowLeft className="size-4" />

        Pokédex
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          {collection.name}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {collection.description}
        </p>

        {!loading &&
          !error && (
            <p className="mt-2 text-sm font-medium">
              {cards.length} cards
            </p>
          )}
      </div>

      {loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Loading cards...
          </p>
        </div>
      )}

      {error && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        cards.length > 0 && (
          <PokemonCardGrid
            cards={cards}
          />
        )}
    </div>
  )
}

import {
  useEffect,
  useState,
} from "react"

import { Images } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { getCardsByIds } from "@/services/pokemon-service"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

export function MyCollectionPage() {
  const ownedCardIds = useCollectionStore(
    (state) => state.ownedCardIds,
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
      if (ownedCardIds.length === 0) {
        setCards([])
        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError(null)

        const result =
          await getCardsByIds(
            ownedCardIds,
          )

        if (!cancelled) {
          setCards(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError(
            "Could not load your collection.",
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
  }, [ownedCardIds])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          My Collection
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {ownedCardIds.length}{" "}
          {ownedCardIds.length === 1
            ? "card"
            : "cards"}{" "}
          owned
        </p>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading your cards...
          </p>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        ownedCardIds.length === 0 && (
          <div className="py-16 text-center">
            <Images className="mx-auto mb-3 size-9 text-muted-foreground" />

            <p className="font-medium">
              Your collection is empty
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Open a card and tap
              "Add to my collection".
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

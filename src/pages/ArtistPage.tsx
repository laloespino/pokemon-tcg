import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useParams,
} from "react-router-dom"

import {
  ArrowLeft,
  Heart,
} from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { getCardsByArtist } from "@/services/pokemon-service"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

export function ArtistPage() {
  const { artistName } = useParams()

  const name = artistName ?? ""

  const [cards, setCards] =
    useState<PokemonCard[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const favorite = useCollectionStore(
    (state) =>
      state.favoriteArtists.includes(
        name,
      ),
  )

  const toggleFavoriteArtist =
    useCollectionStore(
      (state) =>
        state.toggleFavoriteArtist,
    )

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      try {
        setLoading(true)
        setError(null)

        const result =
          await getCardsByArtist(name)

        if (!cancelled) {
          setCards(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError(
            "Could not load cards.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (name) {
      loadCards()
    }

    return () => {
      cancelled = true
    }
  }, [name])

  return (
    <div>
      <Link
        to="/artists"
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

        Artists
      </Link>

      <div
        className="
          mb-5
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">
            {name}
          </h1>

          {!loading &&
            !error && (
              <p className="mt-1 text-sm text-muted-foreground">
                {cards.length} cards
              </p>
            )}
        </div>

        <button
          type="button"
          onClick={() =>
            toggleFavoriteArtist(name)
          }
          aria-label={`Favorite ${name}`}
          className="
            flex
            size-11
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            transition-colors
            hover:bg-accent
          "
        >
          <Heart
            className="size-5"
            fill={
              favorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading cards...
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
        cards.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No cards found.
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

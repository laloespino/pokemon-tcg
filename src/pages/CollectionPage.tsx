import { useEffect, useState } from "react"

import { Link, useParams } from "react-router-dom"

import { ArrowLeft, Heart } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { collections } from "@/data/collections"

import { getCardsBySet, getExpansionById } from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"
import type { PokemonExpansion } from "@/types/expansion"

export function CollectionPage() {
  const { collectionId, setId } = useParams()

  const collection = collections.find((item) => item.id === collectionId)
  const requestedSetId = setId ?? collection?.setId
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const favoriteExpansionIds = useCollectionStore(
    (state) => state.favoriteExpansionIds
  )
  const toggleFavoriteExpansion = useCollectionStore(
    (state) => state.toggleFavoriteExpansion
  )

  const [cards, setCards] = useState<PokemonCard[]>([])
  const [expansion, setExpansion] = useState<PokemonExpansion | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      if (!requestedSetId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [expansionResult, cardsResult] = await Promise.all([
          getExpansionById(requestedSetId),
          getCardsBySet(requestedSetId),
        ])

        if (!cancelled) {
          setExpansion(expansionResult)
          setCards(cardsResult)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar esta colección.")
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
  }, [requestedSetId])

  if (!requestedSetId) {
    return (
      <div>
        <h1 className="text-xl font-bold">Expansión no encontrada</h1>

        <Link
          to="/expansions"
          className="mt-3 inline-flex text-sm text-muted-foreground"
        >
          Volver a Expansiones
        </Link>
      </div>
    )
  }

  const title = expansion?.name ?? collection?.name ?? requestedSetId

  const description = expansion?.series ?? collection?.description
  const owned = cards.filter((card) => ownedCardIds.includes(card.id)).length
  const favorite = favoriteExpansionIds.includes(requestedSetId)

  return (
    <div>
      <Link
        to="/expansions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Expansiones
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{title}</h1>

          {description && (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {!loading && !error && (
            <p className="mt-1 text-sm text-muted-foreground">
              {owned} de {cards.length} cartas
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleFavoriteExpansion(requestedSetId)}
          aria-label={
            favorite
              ? `Quitar ${title} de favoritos`
              : `Agregar ${title} a favoritos`
          }
          className="flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-accent"
        >
          <Heart className="size-5" fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Cargando cartas...</p>
        </div>
      )}

      {error && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </div>
  )
}

import { useEffect, useState } from "react"

import { Link, useParams } from "react-router-dom"

import { Heart } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import {
  Page,
  PageBackLink,
  PageHeader,
  PageState,
} from "@/components/layout/PageLayout"

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
  const saveCardSnapshots = useCollectionStore(
    (state) => state.saveCardSnapshots
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
          saveCardSnapshots(cardsResult)
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
  }, [requestedSetId, saveCardSnapshots])

  if (!requestedSetId) {
    return (
      <Page>
        <PageHeader title="Expansión no encontrada" />

        <Link
          to="/expansions"
          className="mt-3 inline-flex text-sm text-muted-foreground"
        >
          Volver a Expansiones
        </Link>
      </Page>
    )
  }

  const title = expansion?.name ?? collection?.name ?? requestedSetId

  const description = expansion?.series ?? collection?.description
  const owned = cards.filter((card) => ownedCardIds.includes(card.id)).length
  const favorite = favoriteExpansionIds.includes(requestedSetId)

  return (
    <Page>
      <PageBackLink to="/expansions">Expansiones</PageBackLink>

      <PageHeader
        title={title}
        description={description}
        meta={!loading && !error ? `${owned} de ${cards.length} cartas` : null}
        action={
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
            <Heart
              className="size-5"
              fill={favorite ? "currentColor" : "none"}
            />
          </button>
        }
      />

      {loading && <PageState title="Cargando cartas..." />}

      {error && <PageState title={error} tone="danger" />}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </Page>
  )
}

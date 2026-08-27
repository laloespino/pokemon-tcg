import { useEffect, useState } from "react"

import { Images } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"

import { getCardsByIds } from "@/services/pokemon-service"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

export function MyCollectionPage() {
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const wishlistCardIds = useCollectionStore((state) => state.wishlistCardIds)

  const [cards, setCards] = useState<PokemonCard[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      const collectionCardIds = Array.from(
        new Set([...ownedCardIds, ...wishlistCardIds])
      )

      if (collectionCardIds.length === 0) {
        setCards([])
        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError(null)

        const result = await getCardsByIds(collectionCardIds)

        if (!cancelled) {
          setCards(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar tu colección.")
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
  }, [ownedCardIds, wishlistCardIds])

  const totalCards = new Set([...ownedCardIds, ...wishlistCardIds]).size

  return (
    <Page>
      <PageHeader
        title="Mi colección"
        meta={`${ownedCardIds.length} en propiedad · ${wishlistCardIds.length} deseadas`}
        align="center"
      />

      {loading && <PageState title="Cargando tus cartas..." size="compact" />}

      {error && <PageState title={error} tone="danger" size="compact" />}

      {!loading && !error && totalCards === 0 && (
        <PageState
          icon={<Images className="size-9" />}
          title="Tu colección está vacía"
          description="Agrega cartas en propiedad o a tu lista de deseos."
        />
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </Page>
  )
}

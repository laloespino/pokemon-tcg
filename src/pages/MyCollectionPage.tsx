import { useEffect, useState } from "react"

import { Images } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"

import { getCardsByIds } from "@/services/pokemon-service"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

export function MyCollectionPage() {
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const cardSnapshots = useCollectionStore((state) => state.cardSnapshots)
  const saveCardSnapshots = useCollectionStore(
    (state) => state.saveCardSnapshots
  )

  const [cards, setCards] = useState<PokemonCard[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      const snapshotCards = ownedCardIds
        .map((cardId) => cardSnapshots[cardId])
        .filter((card): card is PokemonCard => Boolean(card))
      const missingCardIds = ownedCardIds.filter(
        (cardId) => !cardSnapshots[cardId]
      )

      if (ownedCardIds.length === 0) {
        setCards([])
        setLoading(false)

        return
      }

      try {
        setCards(snapshotCards)
        setLoading(missingCardIds.length > 0)
        setError(null)

        const result =
          missingCardIds.length > 0 ? await getCardsByIds(missingCardIds) : []

        if (!cancelled) {
          saveCardSnapshots(result)
          setCards([...snapshotCards, ...result])
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
  }, [cardSnapshots, ownedCardIds, saveCardSnapshots])

  return (
    <Page>
      <PageHeader
        title="Mi colección"
        meta={`${ownedCardIds.length} en propiedad`}
        align="center"
      />

      {loading && <PageState title="Cargando tus cartas..." size="compact" />}

      {error && <PageState title={error} tone="danger" size="compact" />}

      {!loading && !error && ownedCardIds.length === 0 && (
        <PageState
          icon={<Images className="size-9" />}
          title="Tu colección está vacía"
          description="Agrega cartas en propiedad para verlas aquí."
        />
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} showStatus={false} />
      )}
    </Page>
  )
}

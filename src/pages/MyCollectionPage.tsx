import { useEffect, useState } from "react"

import { Images } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

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
    <div>
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-bold">Mi colección</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {ownedCardIds.length} en propiedad · {wishlistCardIds.length} deseadas
        </p>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Cargando tus cartas...
          </p>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && totalCards === 0 && (
        <div className="py-16 text-center">
          <Images className="mx-auto mb-3 size-9 text-muted-foreground" />

          <p className="font-medium">Tu colección está vacía</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Agrega cartas en propiedad o a tu lista de deseos.
          </p>
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </div>
  )
}

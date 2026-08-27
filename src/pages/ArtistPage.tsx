import { useEffect, useState } from "react"

import { useParams } from "react-router-dom"

import { Heart } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import {
  Page,
  PageBackLink,
  PageHeader,
  PageState,
} from "@/components/layout/PageLayout"

import { getCardsByArtist } from "@/services/pokemon-service"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

export function ArtistPage() {
  const { artistName } = useParams()

  const name = artistName ?? ""

  const [cards, setCards] = useState<PokemonCard[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const favorite = useCollectionStore((state) =>
    state.favoriteArtists.includes(name)
  )
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)

  const toggleFavoriteArtist = useCollectionStore(
    (state) => state.toggleFavoriteArtist
  )

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      try {
        setLoading(true)
        setError(null)

        const result = await getCardsByArtist(name)

        if (!cancelled) {
          setCards(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar las cartas.")
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

  const owned = cards.filter((card) => ownedCardIds.includes(card.id)).length

  return (
    <Page>
      <PageBackLink to="/artists">Artistas</PageBackLink>

      <PageHeader
        title={name}
        meta={!loading && !error ? `${owned} de ${cards.length} cartas` : null}
        action={
          <button
            type="button"
            onClick={() => toggleFavoriteArtist(name)}
            aria-label={
              favorite
                ? `Quitar ${name} de favoritos`
                : `Agregar ${name} a favoritos`
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

      {loading && <PageState title="Cargando cartas..." size="compact" />}

      {error && <PageState title={error} tone="danger" size="compact" />}

      {!loading && !error && cards.length === 0 && (
        <PageState title="No encontramos cartas." size="compact" />
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </Page>
  )
}

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import {
  Page,
  PageBackLink,
  PageHeader,
  PageState,
} from "@/components/layout/PageLayout"

import {
  getCardsByPokemonId,
  getPokedexPokemonById,
} from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"
import type { PokedexPokemon } from "@/types/pokemon"

export function PokemonPage() {
  const { pokemonId } = useParams()
  const id = Number.parseInt(pokemonId ?? "", 10)

  const [pokemon, setPokemon] = useState<PokedexPokemon | null>(null)
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)

  useEffect(() => {
    let cancelled = false

    async function loadPokemonCards() {
      if (!Number.isFinite(id)) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [pokemonResult, cardsResult] = await Promise.all([
          getPokedexPokemonById(id),
          getCardsByPokemonId(id),
        ])

        if (!cancelled) {
          setPokemon(pokemonResult)
          setCards(cardsResult)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar las cartas de este Pokémon.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPokemonCards()

    return () => {
      cancelled = true
    }
  }, [id])

  const owned = cards.filter((card) => ownedCardIds.includes(card.id)).length
  const title = pokemon?.name ?? "Pokémon"

  return (
    <Page>
      <PageBackLink to="/">Pokédex</PageBackLink>

      <PageHeader
        title={title}
        meta={!loading && !error ? `${owned} de ${cards.length} cartas` : null}
        action={
          pokemon && (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border">
              <img
                src={pokemon.sprite}
                alt=""
                className="h-10 w-10 object-contain drop-shadow"
              />
            </div>
          )
        }
      />

      {loading && <PageState title="Cargando cartas..." />}

      {error && <PageState title={error} tone="danger" />}

      {!loading && !error && cards.length === 0 && (
        <PageState title="No encontramos cartas para este Pokémon." />
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </Page>
  )
}

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

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
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Pokédex
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{title}</h1>

          {!loading && !error && (
            <p className="mt-1 text-sm text-muted-foreground">
              {owned} de {cards.length} cartas
            </p>
          )}
        </div>

        {pokemon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border">
            <img
              src={pokemon.sprite}
              alt=""
              className="h-10 w-10 object-contain drop-shadow"
            />
          </div>
        )}
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

      {!loading && !error && cards.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No encontramos cartas para este Pokémon.
          </p>
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </div>
  )
}

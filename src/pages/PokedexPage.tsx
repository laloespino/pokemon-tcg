import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { PokedexPokemonGrid } from "@/components/pokedex/PokedexPokemonGrid"
import { SearchInput } from "@/components/ui/search-input"

import { getPokedexGeneration } from "@/services/pokemon-service"

import type { PokedexPokemon } from "@/types/pokemon"

const generations = [
  {
    id: 1,
    label: "Generación I",
  },
  {
    id: 2,
    label: "Generación II",
  },
  {
    id: 3,
    label: "Generación III",
  },
  {
    id: 4,
    label: "Generación IV",
  },
  {
    id: 5,
    label: "Generación V",
  },
  {
    id: 6,
    label: "Generación VI",
  },
  {
    id: 7,
    label: "Generación VII",
  },
  {
    id: 8,
    label: "Generación VIII",
  },
  {
    id: 9,
    label: "Generación IX",
  },
]

export function PokedexPage() {
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<PokedexPokemon[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPokedex() {
      try {
        setLoading(true)
        setError(null)

        const result = (
          await Promise.all(
            generations.map((item) => getPokedexGeneration(item.id))
          )
        ).flat()

        if (!cancelled) {
          setPokemon(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar la Pokédex.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPokedex()

    return () => {
      cancelled = true
    }
  }, [])

  const pokemonByGeneration = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? pokemon.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            String(item.id).includes(query)
        )
      : pokemon

    return generations
      .map((generation) => ({
        ...generation,
        pokemon: filtered.filter((item) => item.generation === generation.id),
      }))
      .filter((generation) => generation.pokemon.length > 0)
  }, [pokemon, search])

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold md:text-3xl">Pokédex</h1>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar Pokémon"
        className="mb-4"
      />

      {loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Cargando Pokémon...</p>
        </div>
      )}

      {error && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && pokemonByGeneration.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No encontramos Pokémon.
          </p>
        </div>
      )}

      {!loading && !error && pokemonByGeneration.length > 0 && (
        <div className="space-y-10">
          {pokemonByGeneration.map((generation) => (
            <section key={generation.id} className="scroll-mt-4">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-xl font-bold">{generation.label}</h2>
                <span className="text-sm text-muted-foreground">
                  {generation.pokemon.length}
                </span>
              </div>

              <PokedexPokemonGrid
                pokemon={generation.pokemon}
                onSelect={(item) => navigate(`/pokedex/${item.id}`)}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

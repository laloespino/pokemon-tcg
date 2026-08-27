import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Grid2X2, List } from "lucide-react"

import {
  Page,
  PageHeader,
  PageSection,
  PageState,
} from "@/components/layout/PageLayout"
import { PokedexPokemonGrid } from "@/components/pokedex/PokedexPokemonGrid"
import { PokedexPokemonList } from "@/components/pokedex/PokedexPokemonList"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"

import {
  getCardsByPokemonId,
  getPokedexGeneration,
} from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"

import type { PokedexPokemon } from "@/types/pokemon"

type PokedexView = "list" | "grid"

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
  const [view, setView] = useState<PokedexView>("list")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pokemonStats, setPokemonStats] = useState<
    Record<
      number,
      {
        cardIds: string[]
      }
    >
  >({})

  const favoritePokemonIds = useCollectionStore(
    (state) => state.favoritePokemonIds
  )
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)

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

  const sortedPokemonByGeneration = useMemo(
    () =>
      pokemonByGeneration.map((generation) => ({
        ...generation,
        pokemon: [...generation.pokemon].sort((a, b) => {
          const aFavorite = favoritePokemonIds.includes(a.id)
          const bFavorite = favoritePokemonIds.includes(b.id)

          if (aFavorite !== bFavorite) {
            return aFavorite ? -1 : 1
          }

          return a.id - b.id
        }),
      })),
    [favoritePokemonIds, pokemonByGeneration]
  )

  useEffect(() => {
    if (view !== "list") {
      return
    }

    let cancelled = false
    const visiblePokemon = sortedPokemonByGeneration
      .flatMap((generation) => generation.pokemon)
      .slice(0, 40)
    const missingPokemon = visiblePokemon.filter(
      (item) => !pokemonStats[item.id]
    )

    if (missingPokemon.length === 0) {
      return
    }

    async function loadPokemonStats() {
      const results = await Promise.all(
        missingPokemon.map(async (item) => {
          try {
            const cards = await getCardsByPokemonId(item.id)

            return [
              item.id,
              {
                cardIds: cards.map((card) => card.id),
              },
            ] as const
          } catch (error) {
            console.error(`Could not load stats for ${item.name}`, error)

            return [
              item.id,
              {
                cardIds: [],
              },
            ] as const
          }
        })
      )

      if (!cancelled) {
        setPokemonStats((previous) => ({
          ...previous,
          ...Object.fromEntries(results),
        }))
      }
    }

    loadPokemonStats()

    return () => {
      cancelled = true
    }
  }, [pokemonStats, sortedPokemonByGeneration, view])

  const viewButtonLabel =
    view === "list" ? "Cambiar a cuadrícula" : "Cambiar a lista"

  return (
    <Page>
      <PageHeader
        title="Pokédex"
        align="center"
        action={
          <Button
            type="button"
            size="icon-lg"
            onClick={() =>
              setView((current) => (current === "list" ? "grid" : "list"))
            }
            className="size-11 rounded-full"
            aria-label={viewButtonLabel}
            title={viewButtonLabel}
          >
            {view === "list" ? (
              <Grid2X2 className="size-4" />
            ) : (
              <List className="size-4" />
            )}
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar Pokémon"
      />

      {loading && <PageState title="Cargando Pokémon..." />}

      {error && <PageState title={error} tone="danger" />}

      {!loading && !error && sortedPokemonByGeneration.length === 0 && (
        <PageState title="No encontramos Pokémon." />
      )}

      {!loading && !error && sortedPokemonByGeneration.length > 0 && (
        <div className="space-y-10">
          {sortedPokemonByGeneration.map((generation) => (
            <PageSection
              key={generation.id}
              title={generation.label}
              meta={generation.pokemon.length}
            >
              {view === "list" ? (
                <PokedexPokemonList
                  pokemon={generation.pokemon}
                  stats={Object.fromEntries(
                    generation.pokemon.map((item) => {
                      const cardIds = pokemonStats[item.id]?.cardIds

                      return [
                        item.id,
                        {
                          owned: cardIds?.filter((cardId) =>
                            ownedCardIds.includes(cardId)
                          ).length,
                          total: cardIds?.length,
                        },
                      ]
                    })
                  )}
                  onSelect={(item) => navigate(`/pokedex/${item.id}`)}
                />
              ) : (
                <PokedexPokemonGrid
                  pokemon={generation.pokemon}
                  onSelect={(item) => navigate(`/pokedex/${item.id}`)}
                />
              )}
            </PageSection>
          ))}
        </div>
      )}
    </Page>
  )
}

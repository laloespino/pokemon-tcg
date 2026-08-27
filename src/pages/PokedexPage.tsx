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
    shortLabel: "I",
  },
  {
    id: 2,
    label: "Generación II",
    shortLabel: "II",
  },
  {
    id: 3,
    label: "Generación III",
    shortLabel: "III",
  },
  {
    id: 4,
    label: "Generación IV",
    shortLabel: "IV",
  },
  {
    id: 5,
    label: "Generación V",
    shortLabel: "V",
  },
  {
    id: 6,
    label: "Generación VI",
    shortLabel: "VI",
  },
  {
    id: 7,
    label: "Generación VII",
    shortLabel: "VII",
  },
  {
    id: 8,
    label: "Generación VIII",
    shortLabel: "VIII",
  },
  {
    id: 9,
    label: "Generación IX",
    shortLabel: "IX",
  },
]

export function PokedexPage() {
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<PokedexPokemon[]>([])
  const [activeGeneration, setActiveGeneration] = useState(1)
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

        const result = await getPokedexGeneration(activeGeneration)

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
  }, [activeGeneration])

  const filteredPokemon = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = query
      ? pokemon.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            String(item.id).includes(query)
        )
      : pokemon

    return [...result].sort((a, b) => a.id - b.id)
  }, [pokemon, search])

  const currentGeneration = generations.find(
    (generation) => generation.id === activeGeneration
  )

  useEffect(() => {
    if (view !== "list") {
      return
    }

    let cancelled = false
    const missingPokemon = filteredPokemon.filter(
      (item) => favoritePokemonIds.includes(item.id) && !pokemonStats[item.id]
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
  }, [favoritePokemonIds, filteredPokemon, pokemonStats, view])

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

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {generations.map((generation) => (
          <Button
            key={generation.id}
            type="button"
            variant={
              activeGeneration === generation.id ? "default" : "secondary"
            }
            className="h-9 min-w-11 shrink-0 rounded-full px-3"
            aria-label={generation.label}
            title={generation.label}
            onClick={() => setActiveGeneration(generation.id)}
          >
            {generation.shortLabel}
          </Button>
        ))}
      </div>

      {loading && <PageState title="Cargando Pokémon..." />}

      {error && <PageState title={error} tone="danger" />}

      {!loading && !error && filteredPokemon.length === 0 && (
        <PageState title="No encontramos Pokémon." />
      )}

      {!loading && !error && filteredPokemon.length > 0 && (
        <PageSection
          title={currentGeneration?.label ?? "Generación"}
          meta={filteredPokemon.length}
        >
          {view === "list" ? (
            <PokedexPokemonList
              pokemon={filteredPokemon}
              stats={Object.fromEntries(
                filteredPokemon.map((item) => {
                  const cardIds = pokemonStats[item.id]?.cardIds
                  const favorite = favoritePokemonIds.includes(item.id)

                  return [
                    item.id,
                    favorite
                      ? {
                          owned: cardIds?.filter((cardId) =>
                            ownedCardIds.includes(cardId)
                          ).length,
                          total: cardIds?.length,
                        }
                      : {},
                  ]
                })
              )}
              onSelect={(item) => navigate(`/pokedex/${item.id}`)}
            />
          ) : (
            <PokedexPokemonGrid
              pokemon={filteredPokemon}
              onSelect={(item) => navigate(`/pokedex/${item.id}`)}
            />
          )}
        </PageSection>
      )}
    </Page>
  )
}

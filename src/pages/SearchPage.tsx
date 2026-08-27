import { useEffect, useState } from "react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"

import { searchCardsByMode } from "@/services/pokemon-service"

import type { PokemonCard } from "@/types/card"

type SearchMode = "pokemon" | "artist"

const modes: Array<{
  value: SearchMode
  label: string
}> = [
  {
    value: "pokemon",
    label: "Pokémon",
  },
  {
    value: "artist",
    label: "Artista",
  },
]

export function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("pokemon")
  const [query, setQuery] = useState("")
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleQueryChange(value: string) {
    setQuery(value)

    if (!value.trim()) {
      setCards([])
      setError(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    const timeout = window.setTimeout(() => {
      let cancelled = false

      async function runSearch() {
        try {
          setLoading(true)
          setError(null)

          const result = await searchCardsByMode(mode, trimmedQuery)

          if (!cancelled) {
            setCards(result)
          }
        } catch (error) {
          console.error(error)

          if (!cancelled) {
            setError("No pudimos buscar cartas.")
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      }

      runSearch()

      return () => {
        cancelled = true
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [mode, query])

  return (
    <Page>
      <PageHeader
        title="Buscar"
        description="Busca cartas por nombre, Pokémon o artista."
        align="center"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {modes.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={mode === item.value ? "default" : "secondary"}
            className="h-9 shrink-0 px-4"
            onClick={() => setMode(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <SearchInput
        value={query}
        onChange={handleQueryChange}
        placeholder="Buscar cartas"
      />

      {loading && <PageState title="Buscando..." size="compact" />}

      {error && <PageState title={error} tone="danger" size="compact" />}

      {!loading && !error && query.trim() && cards.length === 0 && (
        <PageState title="No encontramos cartas." size="compact" />
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </Page>
  )
}

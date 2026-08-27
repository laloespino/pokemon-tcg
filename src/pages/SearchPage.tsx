import { useEffect, useState } from "react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
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

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setCards([])
      setError(null)
      setLoading(false)
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
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Buscar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busca cartas por nombre, Pokémon o artista.
        </p>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
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
        onChange={setQuery}
        placeholder="Buscar cartas"
        className="mb-6"
      />

      {loading && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Buscando...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && query.trim() && cards.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No encontramos cartas.
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <PokemonCardGrid cards={cards} />
      )}
    </div>
  )
}

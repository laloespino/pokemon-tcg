import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ExpansionGrid } from "@/components/expansions/ExpansionGrid"
import { SearchInput } from "@/components/ui/search-input"

import { getExpansions } from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"

import type { PokemonExpansion } from "@/types/expansion"

export function ExpansionsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [expansions, setExpansions] = useState<PokemonExpansion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const favoriteExpansionIds = useCollectionStore(
    (state) => state.favoriteExpansionIds
  )

  useEffect(() => {
    let cancelled = false

    async function loadExpansions() {
      try {
        setLoading(true)
        setError(null)

        const result = await getExpansions()

        if (!cancelled) {
          setExpansions(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar las expansiones.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadExpansions()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredExpansions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return expansions
      .filter((expansion) =>
        normalizedQuery
          ? [expansion.name, expansion.series, expansion.id]
              .filter(Boolean)
              .some((value) => value?.toLowerCase().includes(normalizedQuery))
          : true
      )
      .sort((a, b) => {
        const aFavorite = favoriteExpansionIds.includes(a.id)
        const bFavorite = favoriteExpansionIds.includes(b.id)

        if (aFavorite !== bFavorite) {
          return aFavorite ? -1 : 1
        }

        return (
          (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") ||
          a.name.localeCompare(b.name)
        )
      })
  }, [expansions, favoriteExpansionIds, query])

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold md:text-3xl">Expansiones</h1>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar por nombre"
        className="mb-6"
      />

      {loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Cargando expansiones...
          </p>
        </div>
      )}

      {error && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && filteredExpansions.length > 0 && (
        <ExpansionGrid
          expansions={filteredExpansions}
          onSelect={(expansion) => navigate(`/expansions/${expansion.id}`)}
        />
      )}

      {!loading && !error && filteredExpansions.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No encontramos expansiones con ese nombre.
          </p>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ExpansionGrid } from "@/components/expansions/ExpansionGrid"
import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"
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
    <Page>
      <PageHeader title="Expansiones" align="center" />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar por nombre"
      />

      {loading && <PageState title="Cargando expansiones..." />}

      {error && <PageState title={error} tone="danger" />}

      {!loading && !error && filteredExpansions.length > 0 && (
        <ExpansionGrid
          expansions={filteredExpansions}
          onSelect={(expansion) => navigate(`/expansions/${expansion.id}`)}
        />
      )}

      {!loading && !error && filteredExpansions.length === 0 && (
        <PageState title="No encontramos expansiones con ese nombre." />
      )}
    </Page>
  )
}

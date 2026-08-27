import { useEffect, useMemo, useState } from "react"

import { useNavigate } from "react-router-dom"

import { ArtistCard } from "@/components/artists/ArtistCard"
import { ArtistSearch } from "@/components/artists/ArtistSearch"
import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"

import { getArtists, getCardsByArtist } from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"

import type { PokemonArtist } from "@/types/artist"

export function ArtistsPage() {
  const navigate = useNavigate()

  const [artists, setArtists] = useState<PokemonArtist[]>([])

  const [search, setSearch] = useState("")

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [artistStats, setArtistStats] = useState<
    Record<
      string,
      {
        cardIds: string[]
      }
    >
  >({})

  const favoriteArtists = useCollectionStore((state) => state.favoriteArtists)
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)

  useEffect(() => {
    let cancelled = false

    async function loadArtists() {
      try {
        setLoading(true)
        setError(null)

        const result = await getArtists()

        if (!cancelled) {
          setArtists(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError("No pudimos cargar los artistas.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadArtists()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredArtists = useMemo(() => {
    const query = search.trim().toLowerCase()

    return artists
      .filter((artist) =>
        query ? artist.name.toLowerCase().includes(query) : true
      )
      .sort((a, b) => {
        const aFavorite = favoriteArtists.includes(a.name)
        const bFavorite = favoriteArtists.includes(b.name)

        if (aFavorite !== bFavorite) {
          return aFavorite ? -1 : 1
        }

        return a.name.localeCompare(b.name)
      })
  }, [artists, favoriteArtists, search])

  useEffect(() => {
    let cancelled = false
    const visibleArtists = filteredArtists.slice(0, 40)
    const missingArtists = visibleArtists.filter(
      (artist) => !artistStats[artist.name]
    )

    if (missingArtists.length === 0) {
      return
    }

    async function loadArtistStats() {
      const results = await Promise.all(
        missingArtists.map(async (artist) => {
          try {
            const cards = await getCardsByArtist(artist.name)

            return [
              artist.name,
              {
                cardIds: cards.map((card) => card.id),
              },
            ] as const
          } catch (error) {
            console.error(`Could not load stats for ${artist.name}`, error)

            return [
              artist.name,
              {
                cardIds: [],
              },
            ] as const
          }
        })
      )

      if (!cancelled) {
        setArtistStats((previous) => ({
          ...previous,
          ...Object.fromEntries(results),
        }))
      }
    }

    loadArtistStats()

    return () => {
      cancelled = true
    }
  }, [artistStats, filteredArtists])

  return (
    <Page>
      <PageHeader title="Artistas" align="center" />

      <ArtistSearch value={search} onChange={setSearch} />

      {loading && <PageState title="Cargando artistas..." size="compact" />}

      {error && <PageState title={error} tone="danger" size="compact" />}

      {!loading && !error && filteredArtists.length === 0 && (
        <PageState title="No encontramos artistas." size="compact" />
      )}

      {!loading && !error && filteredArtists.length > 0 && (
        <div className="space-y-2">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.name}
              artist={artist}
              owned={
                artistStats[artist.name]?.cardIds.filter((cardId) =>
                  ownedCardIds.includes(cardId)
                ).length
              }
              total={artistStats[artist.name]?.cardIds.length}
              onClick={() =>
                navigate(`/artists/${encodeURIComponent(artist.name)}`)
              }
            />
          ))}
        </div>
      )}
    </Page>
  )
}

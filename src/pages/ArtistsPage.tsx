import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useNavigate } from "react-router-dom"

import { ArtistCard } from "@/components/artists/ArtistCard"
import { ArtistSearch } from "@/components/artists/ArtistSearch"

import { getArtists } from "@/services/pokemon-service"

import type { PokemonArtist } from "@/types/artist"

export function ArtistsPage() {
  const navigate = useNavigate()

  const [artists, setArtists] =
    useState<PokemonArtist[]>([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadArtists() {
      try {
        setLoading(true)
        setError(null)

        const result =
          await getArtists()

        if (!cancelled) {
          setArtists(result)
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError(
            "Could not load artists.",
          )
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

  const filteredArtists =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase()

      if (!query) {
        return []
      }

      return artists.filter(
        (artist) =>
          artist.name
            .toLowerCase()
            .includes(query),
      )
    }, [artists, search])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          Artists
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Discover Pokémon TCG illustrators.
        </p>
      </div>

      <ArtistSearch
        value={search}
        onChange={setSearch}
      />

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading artists...
          </p>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        !search.trim() && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Search for an artist.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        search.trim() &&
        filteredArtists.length ===
        0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No artists found.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        filteredArtists.length >
        0 && (
          <div className="mt-4 space-y-2">
            {filteredArtists.map(
              (artist) => (
                <ArtistCard
                  key={artist.name}
                  artist={artist}
                  onClick={() =>
                    navigate(
                      `/artists/${encodeURIComponent(
                        artist.name,
                      )}`,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
    </div>
  )
}

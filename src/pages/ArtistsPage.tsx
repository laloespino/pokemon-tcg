import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { ArtistCard } from "@/components/artists/ArtistCard"
import { ArtistSearch } from "@/components/artists/ArtistSearch"

import { artists } from "@/data/artists"

export function ArtistsPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")

  const filteredArtists = artists.filter((artist) =>
    artist.name
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

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

      <div className="mt-4 space-y-2">
        {filteredArtists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onClick={() =>
              navigate(`/artists/${artist.id}`)
            }
          />
        ))}

        {filteredArtists.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No artists found.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

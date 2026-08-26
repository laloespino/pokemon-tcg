import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Heart } from "lucide-react"

import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"

import { artists } from "@/data/artists"

import { useCollectionStore } from "@/store/collection-store"

import { cards } from "@/data/cards"

export function ArtistPage() {
  const { artistId } = useParams()

  const artist = artists.find(
    (artist) => artist.id === artistId,
  )

  const favorite = useCollectionStore((state) =>
    artist
      ? state.favoriteArtists.includes(artist.name)
      : false,
  )

  const toggleFavoriteArtist = useCollectionStore(
    (state) => state.toggleFavoriteArtist,
  )

  if (!artist) {
    return (
      <div>
        <h1 className="text-xl font-bold">
          Artist not found
        </h1>

        <Link to="/artists">
          Back to artists
        </Link>
      </div>
    )
  }

  const artistCards = cards.filter(
    (card) => card.artist === artist.name,
  )

  return (
    <div>
      <Link
        to="/artists"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Artists
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {artist.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            {artistCards.length} cards
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toggleFavoriteArtist(artist.name)
          }
          className="flex size-11 shrink-0 items-center justify-center rounded-full border"
        >
          <Heart
            className="size-5"
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      {artistCards.length > 0 ? (
        <PokemonCardGrid cards={artistCards} />
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No cards loaded for this artist yet.
        </p>
      )}
    </div>
  )
}

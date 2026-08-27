import { Heart } from "lucide-react"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonArtist } from "@/types/artist"

type ArtistCardProps = {
  artist: PokemonArtist
  onClick: () => void
}

export function ArtistCard({
  artist,
  onClick,
}: ArtistCardProps) {
  const favorite = useCollectionStore((state) =>
    state.favoriteArtists.includes(
      artist.name,
    ),
  )

  const toggleFavoriteArtist =
    useCollectionStore(
      (state) =>
        state.toggleFavoriteArtist,
    )

  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        bg-card
        p-3
      "
    >
      <button
        type="button"
        onClick={onClick}
        className="
          min-w-0
          flex-1
          py-1
          text-left
        "
      >
        <p className="truncate font-medium">
          {artist.name}
        </p>

        <p className="text-sm text-muted-foreground">
          View cards
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          toggleFavoriteArtist(
            artist.name,
          )
        }
        aria-label={`Favorite ${artist.name}`}
        className="
          flex
          size-11
          shrink-0
          items-center
          justify-center
          rounded-full
          transition-colors
          hover:bg-accent
        "
      >
        <Heart
          className="size-5"
          fill={
            favorite
              ? "currentColor"
              : "none"
          }
        />
      </button>
    </div>
  )
}

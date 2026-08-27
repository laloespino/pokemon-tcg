import { useNavigate } from "react-router-dom"
import { Heart } from "lucide-react"

import { useCollectionStore } from "@/store/collection-store"

export function FavoritesPage() {
  const navigate = useNavigate()

  const favoriteArtists = useCollectionStore((state) => state.favoriteArtists)

  const toggleFavoriteArtist = useCollectionStore(
    (state) => state.toggleFavoriteArtist
  )

  if (favoriteArtists.length === 0) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Favoritos</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Tus artistas favoritos de Pokémon TCG.
          </p>
        </div>

        <div className="py-16 text-center">
          <Heart className="mx-auto mb-3 size-8 text-muted-foreground" />

          <p className="font-medium">Todavía no tienes artistas favoritos</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Ve a Artistas y toca el corazón para agregar uno.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Favoritos</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Tus artistas favoritos de Pokémon TCG.
        </p>
      </div>

      <div className="space-y-2">
        {favoriteArtists.map((artist) => (
          <div
            key={artist}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <button
              type="button"
              onClick={() => navigate(`/artists/${encodeURIComponent(artist)}`)}
              className="min-w-0 flex-1 py-1 text-left"
            >
              <p className="truncate font-medium">{artist}</p>

              <p className="text-sm text-muted-foreground">Ver cartas</p>
            </button>

            <button
              type="button"
              onClick={() => toggleFavoriteArtist(artist)}
              aria-label={`Quitar ${artist} de favoritos`}
              className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <Heart className="size-5" fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

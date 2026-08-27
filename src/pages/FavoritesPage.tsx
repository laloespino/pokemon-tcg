import { useNavigate } from "react-router-dom"
import { Heart } from "lucide-react"

import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"
import { useCollectionStore } from "@/store/collection-store"

export function FavoritesPage() {
  const navigate = useNavigate()

  const favoriteArtists = useCollectionStore((state) => state.favoriteArtists)

  const toggleFavoriteArtist = useCollectionStore(
    (state) => state.toggleFavoriteArtist
  )

  if (favoriteArtists.length === 0) {
    return (
      <Page>
        <PageHeader
          title="Favoritos"
          description="Tus artistas favoritos de Pokémon TCG."
        />

        <PageState
          icon={<Heart className="size-8" />}
          title="Todavía no tienes artistas favoritos"
          description="Ve a Artistas y toca el corazón para agregar uno."
        />
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Favoritos"
        description="Tus artistas favoritos de Pokémon TCG."
      />

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
    </Page>
  )
}

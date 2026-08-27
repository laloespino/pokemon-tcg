import { Heart, Palette } from "lucide-react"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonArtist } from "@/types/artist"

type ArtistCardProps = {
  artist: PokemonArtist
  owned?: number
  total?: number
  onClick: () => void
}

export function ArtistCard({ artist, owned, total, onClick }: ArtistCardProps) {
  const favorite = useCollectionStore((state) =>
    state.favoriteArtists.includes(artist.name)
  )

  const toggleFavoriteArtist = useCollectionStore(
    (state) => state.toggleFavoriteArtist
  )

  return (
    <div className="grid min-h-20 grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border bg-card p-2 pr-3 transition-colors hover:bg-accent">
      <button
        type="button"
        onClick={onClick}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground"
        aria-label={`Ver cartas de ${artist.name}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-muted-foreground/10" />

        <Palette className="relative size-6" />
      </button>

      <button
        type="button"
        onClick={onClick}
        className="min-w-0 py-1 text-left"
      >
        <p className="truncate text-base font-bold">{artist.name}</p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">
            {total === undefined
              ? "Cargando..."
              : `${owned ?? 0} de ${total} cartas`}
          </span>

          {total !== undefined && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${total === 0 ? 0 : Math.round(((owned ?? 0) / total) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => toggleFavoriteArtist(artist.name)}
        aria-label={
          favorite
            ? `Quitar ${artist.name} de favoritos`
            : `Agregar ${artist.name} a favoritos`
        }
        className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
      >
        <Heart className="size-5" fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
  )
}

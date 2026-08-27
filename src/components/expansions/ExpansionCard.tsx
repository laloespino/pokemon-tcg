import { Heart } from "lucide-react"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonExpansion } from "@/types/expansion"

type ExpansionCardProps = {
  expansion: PokemonExpansion
  onClick: () => void
}

export function ExpansionCard({ expansion, onClick }: ExpansionCardProps) {
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const favorite = useCollectionStore((state) =>
    state.favoriteExpansionIds.includes(expansion.id)
  )
  const toggleFavoriteExpansion = useCollectionStore(
    (state) => state.toggleFavoriteExpansion
  )

  const owned = ownedCardIds.filter((cardId) =>
    cardId.startsWith(`${expansion.id}-`)
  ).length

  const progress =
    expansion.total === 0
      ? 0
      : Math.min(100, Math.round((owned / expansion.total) * 100))

  const artwork = expansion.logo ?? expansion.symbol
  const isPromo = expansion.official === 0
  const hasArtwork = Boolean(artwork)

  return (
    <div className="grid min-h-20 grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border bg-card p-2 pr-3 transition-colors hover:bg-accent">
      <button
        type="button"
        onClick={onClick}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground shadow-inner"
        aria-label={`Ver cartas de ${expansion.name}`}
      >
        {artwork ? (
          <>
            <img
              src={artwork}
              alt=""
              className="absolute inset-0 h-full w-full scale-[3] object-cover opacity-70 blur-xl saturate-150"
              loading="lazy"
            />

            <img
              src={artwork}
              alt=""
              className="absolute inset-0 h-full w-full scale-[1.8] object-contain opacity-25 blur-lg saturate-150"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-card/45" />

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-background/40" />

            <img
              src={artwork}
              alt={expansion.name}
              className="relative max-h-10 w-[78%] object-contain drop-shadow-lg"
              loading="lazy"
            />
          </>
        ) : (
          <span className="px-2 text-center text-xs font-bold sm:text-sm">
            {expansion.name}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onClick}
        className="min-w-0 py-1 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-base font-bold">{expansion.name}</p>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground uppercase">
            {expansion.id}
          </span>
        </div>

        {(isPromo || !hasArtwork) && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {isPromo && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Promo
              </span>
            )}

            {!hasArtwork && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Sin arte
              </span>
            )}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">
            {owned} de {expansion.total} cartas
          </span>

          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => toggleFavoriteExpansion(expansion.id)}
        aria-label={
          favorite
            ? `Quitar ${expansion.name} de favoritos`
            : `Agregar ${expansion.name} a favoritos`
        }
        className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
      >
        <Heart className="size-5" fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
  )
}

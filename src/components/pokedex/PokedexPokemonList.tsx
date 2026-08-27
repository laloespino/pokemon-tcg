import { Heart } from "lucide-react"

import { useCollectionStore } from "@/store/collection-store"

import type { PokedexPokemon } from "@/types/pokemon"

type PokedexPokemonStats = {
  owned?: number
  total?: number
}

type PokedexPokemonListProps = {
  pokemon: PokedexPokemon[]
  stats: Record<number, PokedexPokemonStats>
  onSelect: (pokemon: PokedexPokemon) => void
}

export function PokedexPokemonList({
  pokemon,
  stats,
  onSelect,
}: PokedexPokemonListProps) {
  const favoritePokemonIds = useCollectionStore(
    (state) => state.favoritePokemonIds
  )
  const toggleFavoritePokemon = useCollectionStore(
    (state) => state.toggleFavoritePokemon
  )

  return (
    <div className="space-y-2">
      {pokemon.map((item) => {
        const itemStats = stats[item.id]
        const owned = itemStats?.owned ?? 0
        const total = itemStats?.total
        const progress =
          total === undefined || total === 0
            ? 0
            : Math.round((owned / total) * 100)
        const favorite = favoritePokemonIds.includes(item.id)

        return (
          <div
            key={item.id}
            className="grid min-h-20 grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border bg-card p-2 pr-3 transition-colors hover:bg-accent"
          >
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground"
              aria-label={`Ver cartas de ${item.name}`}
            >
              <img
                src={item.sprite}
                alt=""
                className="h-12 w-12 object-contain drop-shadow"
                loading="lazy"
              />
            </button>

            <button
              type="button"
              onClick={() => onSelect(item)}
              className="min-w-0 py-1 text-left"
            >
              <div className="flex min-w-0 items-baseline gap-2">
                <p className="truncate text-base font-bold">{item.name}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  #{item.id}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">
                  {total === undefined
                    ? "Cargando..."
                    : `${owned} de ${total} cartas`}
                </span>

                {total !== undefined && (
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleFavoritePokemon(item.id)}
              aria-label={
                favorite
                  ? `Quitar ${item.name} de favoritos`
                  : `Agregar ${item.name} a favoritos`
              }
              className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <Heart
                className="size-5"
                fill={favorite ? "currentColor" : "none"}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}

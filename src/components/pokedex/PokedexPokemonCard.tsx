import type { PokedexPokemon } from "@/types/pokemon"

type PokedexPokemonCardProps = {
  pokemon: PokedexPokemon
  onClick: () => void
}

export function PokedexPokemonCard({
  pokemon,
  onClick,
}: PokedexPokemonCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="self-end text-sm font-bold text-muted-foreground">
        #{pokemon.id}
      </span>

      <div className="flex flex-1 items-center justify-center">
        <img
          src={pokemon.sprite}
          alt=""
          className="h-20 w-20 object-contain drop-shadow transition group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <h2 className="truncate text-center text-base font-bold">
        {pokemon.name}
      </h2>
    </button>
  )
}

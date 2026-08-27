import type { PokedexPokemon } from "@/types/pokemon"

import { PokedexPokemonCard } from "./PokedexPokemonCard"

type PokedexPokemonGridProps = {
  pokemon: PokedexPokemon[]
  onSelect: (pokemon: PokedexPokemon) => void
}

export function PokedexPokemonGrid({
  pokemon,
  onSelect,
}: PokedexPokemonGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {pokemon.map((item) => (
        <PokedexPokemonCard
          key={item.id}
          pokemon={item}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  )
}

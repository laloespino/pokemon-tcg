import type { PokemonExpansion } from "@/types/expansion"

import { ExpansionCard } from "./ExpansionCard"

type ExpansionGridProps = {
  expansions: PokemonExpansion[]
  onSelect: (expansion: PokemonExpansion) => void
}

export function ExpansionGrid({ expansions, onSelect }: ExpansionGridProps) {
  return (
    <div className="space-y-2.5">
      {expansions.map((expansion) => (
        <ExpansionCard
          key={expansion.id}
          expansion={expansion}
          onClick={() => onSelect(expansion)}
        />
      ))}
    </div>
  )
}

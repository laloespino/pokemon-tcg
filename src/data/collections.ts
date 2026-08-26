import type { PokemonCollection } from "@/types/collection"

export const collections: PokemonCollection[] = [
  {
    id: "base-set",
    name: "Base Set",
    description: "The original Pokémon TCG set.",
    type: "set",

    cardIds: [
      "base1-4",
      "base1-44",
      "base1-58",
    ],
  },

  {
    id: "original-151",
    name: "Original 151",
    description: "Collect cards for the original 151 Pokémon.",
    type: "pokemon",

    cardIds: [
      "base1-4",
      "base1-44",
      "base1-58",
    ],
  },
]

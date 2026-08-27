import type { PokemonRegion } from "@/types/region"

export type PokemonCard = {
  id: string
  name: string
  number: string

  artist?: string
  rarity?: string
  category?: string
  dexId?: number[]
  types?: string[]
  regulationMark?: string

  pricing?: {
    source: "tcgplayer"
    variant: string
    currency: string
    updated?: string
    low?: number
    mid?: number
    high?: number
    market?: number
  }

  set?: {
    id: string
    name: string
    series?: string
    regions?: PokemonRegion[]
    releaseDate?: string
  }

  images: {
    small?: string
    large?: string
  }
}

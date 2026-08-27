import type { PokemonRegion } from "@/types/region"

export type PokemonExpansion = {
  id: string
  name: string
  logo?: string
  symbol?: string
  seriesId?: string
  series?: string
  regions?: PokemonRegion[]
  releaseDate?: string
  total: number
  official: number
}

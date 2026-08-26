export type PokemonCard = {
  id: string
  name: string
  number: string

  artist?: string
  rarity?: string

  set: {
    id: string
    name: string
    series?: string
  }

  images: {
    small: string
    large: string
  }
}

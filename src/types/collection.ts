export type CollectionType =
  | "set"
  | "pokemon"
  | "rarity"
  | "artist"
  | "custom"

export type PokemonCollection = {
  id: string
  name: string
  description?: string
  type: CollectionType

  image?: string

  cardIds: string[]
}

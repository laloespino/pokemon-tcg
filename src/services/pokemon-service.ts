import { tcgdex } from "@/services/tcgdex"

import type { PokemonArtist } from "@/types/artist"
import type { PokemonCard } from "@/types/card"
import type { PokemonExpansion } from "@/types/expansion"
import type { PokedexPokemon } from "@/types/pokemon"
import type {
  Set as TCGdexSet,
  SetResume as TCGdexSetResume,
} from "@tcgdex/sdk"

const TCGDEX_API = "https://api.tcgdex.net/v2/en"
const POKEAPI = "https://pokeapi.co/api/v2"
const expansionCache = new Map<string, Promise<PokemonExpansion | null>>()

function imageUrl(image: string | undefined, quality: "low" | "high") {
  if (!image) {
    return ""
  }

  return `${image}/${quality}.webp`
}

function assetUrl(asset: string | undefined) {
  if (!asset) {
    return undefined
  }

  return `${asset}.webp`
}

type TCGdexPricePoint = {
  lowPrice?: number | null
  midPrice?: number | null
  highPrice?: number | null
  marketPrice?: number | null
}

type TCGdexCardResponse = {
  id: string
  name: string
  localId: string | number
  image?: string
  illustrator?: string
  rarity?: string
  category?: string
  dexId?: number[]
  types?: string[]
  regulationMark?: string
  set?: {
    id: string
    name: string
  }
  pricing?: {
    tcgplayer?: {
      unit?: string
      updated?: string
      [variant: string]: string | TCGdexPricePoint | undefined
    }
  }
}

type TCGdexCardResume = {
  id: string
  localId: string | number
  name: string
  image?: string
}

type TCGdexCardsEndpointResponse = {
  cards: TCGdexCardResume[]
}

type PokeApiGenerationResponse = {
  pokemon_species: Array<{
    name: string
    url: string
  }>
}

function isCardResume(card: unknown): card is TCGdexCardResume {
  return (
    typeof card === "object" &&
    card !== null &&
    "id" in card &&
    "localId" in card &&
    "name" in card &&
    typeof card.id === "string" &&
    typeof card.name === "string"
  )
}

function isPricePoint(value: unknown): value is TCGdexPricePoint {
  return (
    typeof value === "object" &&
    value !== null &&
    ("lowPrice" in value || "midPrice" in value || "highPrice" in value)
  )
}

function priceNumber(value: number | null | undefined) {
  return typeof value === "number" ? value : undefined
}

function mapTcgplayerPricing(card: TCGdexCardResponse): PokemonCard["pricing"] {
  const tcgplayer = card.pricing?.tcgplayer

  if (!tcgplayer) {
    return undefined
  }

  const preferredVariants = [
    "normal",
    "holofoil",
    "reverse-holofoil",
    "1st-edition-holofoil",
    "1st-edition-normal",
  ]

  const variant =
    preferredVariants.find((key) => isPricePoint(tcgplayer[key])) ??
    Object.keys(tcgplayer).find((key) => isPricePoint(tcgplayer[key]))

  if (!variant || !isPricePoint(tcgplayer[variant])) {
    return undefined
  }

  const price = tcgplayer[variant]

  return {
    source: "tcgplayer",
    variant,
    currency: tcgplayer.unit ?? "USD",
    updated:
      typeof tcgplayer.updated === "string" ? tcgplayer.updated : undefined,
    low: priceNumber(price.lowPrice),
    mid: priceNumber(price.midPrice),
    high: priceNumber(price.highPrice),
    market: priceNumber(price.marketPrice),
  }
}

function mapCard(card: TCGdexCardResponse): PokemonCard {
  return {
    id: card.id,
    name: card.name,
    number: String(card.localId),

    artist: card.illustrator ?? undefined,
    rarity: card.rarity ?? undefined,
    category: card.category ?? undefined,
    dexId: card.dexId,
    types: card.types,
    regulationMark: card.regulationMark ?? undefined,
    pricing: mapTcgplayerPricing(card),

    set: card.set
      ? {
          id: card.set.id,
          name: card.set.name,
        }
      : undefined,

    images: {
      small: imageUrl(card.image, "low"),
      large: imageUrl(card.image, "high"),
    },
  }
}

function setIdFromCardId(cardId: string) {
  const separatorIndex = cardId.lastIndexOf("-")

  if (separatorIndex === -1) {
    return cardId
  }

  return cardId.slice(0, separatorIndex)
}

function localNumber(value: string) {
  const parsed = Number.parseInt(value, 10)

  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed
}

function pokemonIdFromSpeciesUrl(url: string) {
  const match = url.match(/\/pokemon-species\/(\d+)\//)

  return match ? Number.parseInt(match[1], 10) : 0
}

function pokemonSprite(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

function pokemonName(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function readCardsEndpoint(result: unknown) {
  return typeof result === "object" &&
    result !== null &&
    "cards" in result &&
    Array.isArray((result as TCGdexCardsEndpointResponse).cards)
    ? (result as TCGdexCardsEndpointResponse).cards
    : []
}

async function getExpansionCached(setId: string) {
  if (!expansionCache.has(setId)) {
    expansionCache.set(setId, getExpansionById(setId))
  }

  return expansionCache.get(setId)!
}

async function loadExpansionsForCards(cards: TCGdexCardResume[]) {
  return new Map(
    (
      await Promise.all(
        Array.from(new Set(cards.map((card) => setIdFromCardId(card.id)))).map(
          async (setId) => {
            try {
              return [setId, await getExpansionCached(setId)] as const
            } catch (error) {
              console.error(`Could not load set ${setId}`, error)

              return [setId, null] as const
            }
          }
        )
      )
    ).filter(
      (entry): entry is readonly [string, PokemonExpansion] => entry[1] !== null
    )
  )
}

function mapCardResume(
  card: TCGdexCardResume,
  expansionsBySetId: Map<string, PokemonExpansion>,
  artist?: string
): PokemonCard {
  const setId = setIdFromCardId(card.id)
  const expansion = expansionsBySetId.get(setId)

  return {
    id: card.id,
    name: card.name,
    number: String(card.localId),
    artist,
    set: expansion
      ? {
          id: setId,
          name: expansion.name,
        }
      : undefined,
    images: {
      small: imageUrl(card.image, "low"),
      large: imageUrl(card.image, "high"),
    },
  }
}

function sortCardsBySetRelease(
  cards: PokemonCard[],
  expansionsBySetId: Map<string, PokemonExpansion>
) {
  return cards.sort((a, b) => {
    const aExpansion = expansionsBySetId.get(setIdFromCardId(a.id))
    const bExpansion = expansionsBySetId.get(setIdFromCardId(b.id))

    return (
      (bExpansion?.releaseDate ?? "").localeCompare(
        aExpansion?.releaseDate ?? ""
      ) || localNumber(a.number) - localNumber(b.number)
    )
  })
}

function mapExpansion(set: TCGdexSet | TCGdexSetResume): PokemonExpansion {
  return {
    id: set.id,
    name: set.name,
    logo: assetUrl(set.logo),
    symbol: assetUrl(set.symbol),
    series: "serie" in set ? set.serie.name : undefined,
    releaseDate: "releaseDate" in set ? set.releaseDate : undefined,
    total: set.cardCount.total,
    official: set.cardCount.official,
  }
}

export async function getExpansions(): Promise<PokemonExpansion[]> {
  const sets = await tcgdex.fetch("sets")

  if (!sets) {
    return []
  }

  const expansions = await Promise.all(
    sets.map(async (set) => {
      try {
        return (await getExpansionById(set.id)) ?? mapExpansion(set)
      } catch (error) {
        console.error(`Could not load set ${set.id}`, error)

        return mapExpansion(set)
      }
    })
  )

  return expansions.sort(
    (a, b) =>
      (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") ||
      a.name.localeCompare(b.name)
  )
}

export async function getExpansionById(
  setId: string
): Promise<PokemonExpansion | null> {
  const set = await tcgdex.fetch("sets", setId)

  if (!set) {
    return null
  }

  return mapExpansion(set)
}

export async function getArtists(): Promise<PokemonArtist[]> {
  const response = await fetch(`${TCGDEX_API}/illustrators`)

  if (!response.ok) {
    throw new Error("Could not load illustrators")
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter((name): name is string => typeof name === "string")
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
    }))
}

export async function getPokedexGeneration(
  generation: number
): Promise<PokedexPokemon[]> {
  const response = await fetch(`${POKEAPI}/generation/${generation}`)

  if (!response.ok) {
    throw new Error(`Could not load generation ${generation}`)
  }

  const data: PokeApiGenerationResponse = await response.json()

  return data.pokemon_species
    .map((species) => {
      const id = pokemonIdFromSpeciesUrl(species.url)

      return {
        id,
        name: pokemonName(species.name),
        sprite: pokemonSprite(id),
        generation,
      }
    })
    .filter((pokemon) => pokemon.id > 0)
    .sort((a, b) => a.id - b.id)
}

export async function getPokedexPokemonById(
  pokemonId: number
): Promise<PokedexPokemon | null> {
  const response = await fetch(`${POKEAPI}/pokemon-species/${pokemonId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Could not load Pokémon ${pokemonId}`)
  }

  const data: {
    id: number
    name: string
    generation: {
      url: string
    }
  } = await response.json()

  const generationId = Number.parseInt(
    data.generation.url.match(/\/generation\/(\d+)\//)?.[1] ?? "0",
    10
  )

  return {
    id: data.id,
    name: pokemonName(data.name),
    sprite: pokemonSprite(data.id),
    generation: generationId,
  }
}

export async function getPokedexPokemonByName(
  name: string
): Promise<PokedexPokemon | null> {
  const response = await fetch(
    `${POKEAPI}/pokemon-species/${encodeURIComponent(name.toLowerCase())}`
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Could not load Pokémon ${name}`)
  }

  const data: {
    id: number
    name: string
    generation: {
      url: string
    }
  } = await response.json()

  const generationId = Number.parseInt(
    data.generation.url.match(/\/generation\/(\d+)\//)?.[1] ?? "0",
    10
  )

  return {
    id: data.id,
    name: pokemonName(data.name),
    sprite: pokemonSprite(data.id),
    generation: generationId,
  }
}

export async function getCardsByArtist(artist: string): Promise<PokemonCard[]> {
  const response = await fetch(
    `${TCGDEX_API}/illustrators/${encodeURIComponent(artist)}`
  )

  if (!response.ok) {
    throw new Error(`Could not load illustrator ${artist}`)
  }

  const result: unknown = await response.json()
  const cards = readCardsEndpoint(result)

  if (cards.length === 0) {
    return []
  }

  const cardResumes = cards.filter(isCardResume)
  const expansionsBySetId = await loadExpansionsForCards(cardResumes)

  return sortCardsBySetRelease(
    cardResumes.map((card) => mapCardResume(card, expansionsBySetId, artist)),
    expansionsBySetId
  )
}

export async function getCardsByPokemonId(
  pokemonId: number
): Promise<PokemonCard[]> {
  const response = await fetch(
    `${TCGDEX_API}/dex-ids/${encodeURIComponent(pokemonId)}`
  )

  if (!response.ok) {
    throw new Error(`Could not load Pokémon ${pokemonId} cards`)
  }

  const cardResumes = readCardsEndpoint(await response.json()).filter(
    isCardResume
  )
  const expansionsBySetId = await loadExpansionsForCards(cardResumes)

  return sortCardsBySetRelease(
    cardResumes.map((card) => mapCardResume(card, expansionsBySetId)),
    expansionsBySetId
  )
}

export async function searchCards(query: string): Promise<PokemonCard[]> {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return []
  }

  const response = await fetch(`${TCGDEX_API}/cards`)

  if (!response.ok) {
    throw new Error("Could not search cards")
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    return []
  }

  const cardResumes = data
    .filter(isCardResume)
    .filter(
      (card) =>
        card.name.toLowerCase().includes(normalizedQuery) ||
        card.id.toLowerCase().includes(normalizedQuery) ||
        String(card.localId).includes(normalizedQuery)
    )
    .slice(0, 120)

  const expansionsBySetId = await loadExpansionsForCards(cardResumes)

  return sortCardsBySetRelease(
    cardResumes.map((card) => mapCardResume(card, expansionsBySetId)),
    expansionsBySetId
  )
}

export async function searchCardsByMode(
  mode: "artist" | "pokemon" | "card",
  query: string
): Promise<PokemonCard[]> {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return []
  }

  if (mode === "artist") {
    const artists = await getArtists()
    const artist =
      artists.find(
        (item) => item.name.toLowerCase() === normalizedQuery.toLowerCase()
      ) ??
      artists.find((item) =>
        item.name.toLowerCase().includes(normalizedQuery.toLowerCase())
      )

    return artist ? getCardsByArtist(artist.name) : []
  }

  if (mode === "pokemon") {
    const pokemon = /^\d+$/.test(normalizedQuery)
      ? await getPokedexPokemonById(Number.parseInt(normalizedQuery, 10))
      : await getPokedexPokemonByName(normalizedQuery)

    return pokemon ? getCardsByPokemonId(pokemon.id) : []
  }

  return searchCards(normalizedQuery)
}

export async function getCardById(id: string): Promise<PokemonCard | null> {
  const response = await fetch(`${TCGDEX_API}/cards/${encodeURIComponent(id)}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Could not load card ${id}`)
  }

  const card: TCGdexCardResponse = await response.json()

  return mapCard(card)
}

export async function getCardsByIds(ids: string[]): Promise<PokemonCard[]> {
  if (ids.length === 0) {
    return []
  }

  const results = await Promise.all(ids.map((id) => getCardById(id)))

  return results.filter((card): card is PokemonCard => card !== null)
}

type TCGdexSetCardsResponse = {
  id: string
  name: string

  cards: Array<{
    id: string
    localId: string | number
    name: string
    image?: string
  }>
}

export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
  const response = await fetch(
    `${TCGDEX_API}/sets/${encodeURIComponent(setId)}`
  )

  if (!response.ok) {
    throw new Error(`Could not load set ${setId}`)
  }

  const set: TCGdexSetCardsResponse = await response.json()

  return set.cards.map((card) => ({
    id: card.id,
    name: card.name,
    number: String(card.localId),

    set: {
      id: set.id,
      name: set.name,
    },

    images: {
      small: imageUrl(card.image, "low"),

      large: imageUrl(card.image, "high"),
    },
  }))
}

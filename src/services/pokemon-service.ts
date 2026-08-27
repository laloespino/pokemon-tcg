import { tcgdex } from "@/services/tcgdex"

import type { PokemonArtist } from "@/types/artist"
import type { PokemonCard } from "@/types/card"
import type { PokemonExpansion } from "@/types/expansion"
import type { PokedexPokemon } from "@/types/pokemon"
import type { PokemonRegion } from "@/types/region"
import type {
  Set as TCGdexSet,
  SetResume as TCGdexSetResume,
} from "@tcgdex/sdk"

const TCGDEX_API_ROOT = "https://api.tcgdex.net/v2"
const TCGDEX_API = `${TCGDEX_API_ROOT}/en`
const TCGDEX_JAPANESE_API = `${TCGDEX_API_ROOT}/ja`
const POKEAPI = "https://pokeapi.co/api/v2"
const TCG_POCKET_SERIES_ID = "tcgp"

const TCGDEX_REGIONS: PokemonRegion[] = [
  { id: "en", label: "Inglés internacional", flag: "🇺🇸" },
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "ja", label: "Japonés", flag: "🇯🇵" },
]

function cached<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>
) {
  const existing = cache.get(key)

  if (existing) {
    return existing
  }

  const promise = load().catch((error) => {
    cache.delete(key)
    throw error
  })

  cache.set(key, promise)

  return promise
}

const allExpansionsCache = new Map<string, Promise<PokemonExpansion[]>>()
const expansionCache = new Map<string, Promise<PokemonExpansion | null>>()
const artistsCache = new Map<string, Promise<PokemonArtist[]>>()
const pokedexGenerationCache = new Map<string, Promise<PokedexPokemon[]>>()
const pokedexPokemonCache = new Map<string, Promise<PokedexPokemon | null>>()
const artistCardsCache = new Map<string, Promise<PokemonCard[]>>()
const pokemonCardsCache = new Map<string, Promise<PokemonCard[]>>()
const cardSearchCache = new Map<string, Promise<PokemonCard[]>>()
const cardCache = new Map<string, Promise<PokemonCard | null>>()
const setCardsCache = new Map<string, Promise<PokemonCard[]>>()
const pocketSetIdsCache = new Map<string, Promise<Set<string>>>()
const setRegionMapCache = new Map<
  string,
  Promise<Map<string, PokemonRegion[]>>
>()
const japaneseCardImagesCache = new Map<
  string,
  Promise<PokemonCard["images"] | null>
>()

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
    releaseDate?: string
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
  dexId?: number[]
}

type TCGdexCardsEndpointResponse = {
  cards: TCGdexCardResume[]
}

type TCGdexSetResumeResponse = {
  id?: string
}

type TCGdexCardImageResponse = {
  image?: string
}

type TCGdexSeriesResponse = {
  sets?: Array<{
    id?: string
  }>
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

function mapCard(
  card: TCGdexCardResponse,
  regionMap?: Map<string, PokemonRegion[]>
): PokemonCard {
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
          regions: regionMap?.get(card.set.id) ?? [],
          releaseDate: card.set.releaseDate,
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

export function getPokemonRegions() {
  return TCGDEX_REGIONS
}

async function getSetRegionMap() {
  return cached(setRegionMapCache, "all", async () => {
    const entries = await Promise.all(
      TCGDEX_REGIONS.map(async (region) => {
        try {
          const response = await fetch(`${TCGDEX_API_ROOT}/${region.id}/sets`)

          if (!response.ok) {
            throw new Error(`Could not load sets for ${region.id}`)
          }

          const data: unknown = await response.json()

          if (!Array.isArray(data)) {
            return []
          }

          return data
            .map((set) =>
              typeof set === "object" && set !== null && "id" in set
                ? (set as TCGdexSetResumeResponse).id
                : undefined
            )
            .filter((setId): setId is string => typeof setId === "string")
            .map((setId) => [setId, region] as const)
        } catch (error) {
          console.error(error)
          return []
        }
      })
    )

    const regionMap = new Map<string, PokemonRegion[]>()

    for (const [setId, region] of entries.flat()) {
      regionMap.set(setId, [...(regionMap.get(setId) ?? []), region])
    }

    return regionMap
  })
}

function hasCardImage(card: PokemonCard) {
  return Boolean(card.images.small || card.images.large)
}

async function getJapaneseCardImages(cardId: string) {
  return cached(japaneseCardImagesCache, cardId, async () => {
    try {
      const response = await fetch(
        `${TCGDEX_JAPANESE_API}/cards/${encodeURIComponent(cardId)}`
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`Could not load Japanese image for card ${cardId}`)
      }

      const data: unknown = await response.json()
      const image =
        typeof data === "object" &&
        data !== null &&
        "image" in data &&
        typeof (data as TCGdexCardImageResponse).image === "string"
          ? (data as TCGdexCardImageResponse).image
          : undefined

      if (!image) {
        return null
      }

      return {
        small: imageUrl(image, "low"),
        large: imageUrl(image, "high"),
      }
    } catch (error) {
      console.error(error)
      return null
    }
  })
}

async function withJapaneseImageFallback(card: PokemonCard) {
  if (hasCardImage(card)) {
    return card
  }

  const images = await getJapaneseCardImages(card.id)

  return images
    ? {
        ...card,
        images,
      }
    : card
}

async function withJapaneseImageFallbacks(cards: PokemonCard[]) {
  return Promise.all(cards.map((card) => withJapaneseImageFallback(card)))
}

async function getExpansionCached(setId: string) {
  return getExpansionById(setId)
}

async function getPocketSetIds() {
  return cached(pocketSetIdsCache, TCG_POCKET_SERIES_ID, async () => {
    try {
      const response = await fetch(
        `${TCGDEX_API}/series/${TCG_POCKET_SERIES_ID}`
      )

      if (!response.ok) {
        throw new Error("Could not load TCG Pocket series")
      }

      const data: unknown = await response.json()
      const sets: unknown[] =
        typeof data === "object" &&
        data !== null &&
        Array.isArray((data as TCGdexSeriesResponse).sets)
          ? ((data as TCGdexSeriesResponse).sets ?? [])
          : []

      return new Set(
        sets
          .map((set) =>
            typeof set === "object" && set !== null && "id" in set
              ? set.id
              : undefined
          )
          .filter((setId): setId is string => typeof setId === "string")
      )
    } catch (error) {
      console.error(error)
      return new Set<string>()
    }
  })
}

async function filterPocketCards<T extends { id: string }>(cards: T[]) {
  const pocketSetIds = await getPocketSetIds()

  return cards.filter((card) => !pocketSetIds.has(setIdFromCardId(card.id)))
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
    dexId: card.dexId,
    set: expansion
      ? {
          id: setId,
          name: expansion.name,
          regions: expansion.regions,
          releaseDate: expansion.releaseDate,
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

function mapExpansion(
  set: TCGdexSet | TCGdexSetResume,
  regionMap?: Map<string, PokemonRegion[]>
): PokemonExpansion {
  return {
    id: set.id,
    name: set.name,
    logo: assetUrl(set.logo),
    symbol: assetUrl(set.symbol),
    seriesId: "serie" in set ? set.serie.id : undefined,
    series: "serie" in set ? set.serie.name : undefined,
    regions: regionMap?.get(set.id) ?? [],
    releaseDate: "releaseDate" in set ? set.releaseDate : undefined,
    total: set.cardCount.total,
    official: set.cardCount.official,
  }
}

export async function getExpansions(): Promise<PokemonExpansion[]> {
  return cached(allExpansionsCache, "all", async () => {
    const sets = await tcgdex.fetch("sets")

    if (!sets) {
      return []
    }

    const [pocketSetIds, regionMap] = await Promise.all([
      getPocketSetIds(),
      getSetRegionMap(),
    ])
    const resumes = sets
      .map((set) => mapExpansion(set, regionMap))
      .filter((expansion) => !pocketSetIds.has(expansion.id))
    const expansions = await Promise.all(
      resumes.map(async (expansion) => {
        if (expansion.releaseDate) {
          return expansion
        }

        try {
          return (await getExpansionCached(expansion.id)) ?? expansion
        } catch (error) {
          console.error(`Could not load expansion ${expansion.id}`, error)
          return expansion
        }
      })
    )

    return expansions
      .filter(
        (expansion) =>
          expansion.seriesId !== TCG_POCKET_SERIES_ID &&
          !pocketSetIds.has(expansion.id)
      )
      .sort(compareExpansionsByReleaseDateDesc)
  })
}

function compareExpansionsByReleaseDateDesc(
  a: PokemonExpansion,
  b: PokemonExpansion
) {
  if (a.releaseDate && b.releaseDate) {
    return (
      b.releaseDate.localeCompare(a.releaseDate) || a.name.localeCompare(b.name)
    )
  }

  if (a.releaseDate) {
    return -1
  }

  if (b.releaseDate) {
    return 1
  }

  return a.name.localeCompare(b.name)
}

export async function getExpansionById(
  setId: string
): Promise<PokemonExpansion | null> {
  return cached(expansionCache, setId, async () => {
    const [set, regionMap] = await Promise.all([
      tcgdex.fetch("sets", setId),
      getSetRegionMap(),
    ])

    if (!set) {
      return null
    }

    return mapExpansion(set, regionMap)
  })
}

export async function getArtists(): Promise<PokemonArtist[]> {
  return cached(artistsCache, "all", async () => {
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
  })
}

export async function getPokedexGeneration(
  generation: number
): Promise<PokedexPokemon[]> {
  return cached(pokedexGenerationCache, String(generation), async () => {
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
  })
}

export async function getPokedexPokemonById(
  pokemonId: number
): Promise<PokedexPokemon | null> {
  return cached(pokedexPokemonCache, `id:${pokemonId}`, async () => {
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
  })
}

export async function getPokedexPokemonByName(
  name: string
): Promise<PokedexPokemon | null> {
  const normalizedName = name.trim().toLowerCase()

  return cached(pokedexPokemonCache, `name:${normalizedName}`, async () => {
    const response = await fetch(
      `${POKEAPI}/pokemon-species/${encodeURIComponent(normalizedName)}`
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
  })
}

export async function getCardsByArtist(artist: string): Promise<PokemonCard[]> {
  const normalizedArtist = artist.trim()
  const cacheKey = normalizedArtist.toLowerCase()

  return cached(artistCardsCache, cacheKey, async () => {
    const response = await fetch(
      `${TCGDEX_API}/illustrators/${encodeURIComponent(normalizedArtist)}`
    )

    if (!response.ok) {
      throw new Error(`Could not load illustrator ${artist}`)
    }

    const result: unknown = await response.json()
    const cards = readCardsEndpoint(result)

    if (cards.length === 0) {
      return []
    }

    const cardResumes = await filterPocketCards(cards.filter(isCardResume))
    const expansionsBySetId = await loadExpansionsForCards(cardResumes)

    return withJapaneseImageFallbacks(
      sortCardsBySetRelease(
        cardResumes.map((card) =>
          mapCardResume(card, expansionsBySetId, normalizedArtist)
        ),
        expansionsBySetId
      )
    )
  })
}

export async function getCardsByPokemonId(
  pokemonId: number
): Promise<PokemonCard[]> {
  return cached(pokemonCardsCache, String(pokemonId), async () => {
    const response = await fetch(
      `${TCGDEX_API}/dex-ids/${encodeURIComponent(pokemonId)}`
    )

    if (!response.ok) {
      throw new Error(`Could not load Pokémon ${pokemonId} cards`)
    }

    const cardResumes = await filterPocketCards(
      readCardsEndpoint(await response.json()).filter(isCardResume)
    )
    const expansionsBySetId = await loadExpansionsForCards(cardResumes)

    return withJapaneseImageFallbacks(
      sortCardsBySetRelease(
        cardResumes.map((card) => mapCardResume(card, expansionsBySetId)),
        expansionsBySetId
      )
    )
  })
}

export async function searchCards(query: string): Promise<PokemonCard[]> {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return []
  }

  return cached(cardSearchCache, normalizedQuery, async () => {
    const response = await fetch(`${TCGDEX_API}/cards`)

    if (!response.ok) {
      throw new Error("Could not search cards")
    }

    const data: unknown = await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    const cardResumes = (
      await filterPocketCards(
        data
          .filter(isCardResume)
          .filter(
            (card) =>
              card.name.toLowerCase().includes(normalizedQuery) ||
              card.id.toLowerCase().includes(normalizedQuery) ||
              String(card.localId).includes(normalizedQuery)
          )
      )
    ).slice(0, 120)

    const expansionsBySetId = await loadExpansionsForCards(cardResumes)

    return withJapaneseImageFallbacks(
      sortCardsBySetRelease(
        cardResumes.map((card) => mapCardResume(card, expansionsBySetId)),
        expansionsBySetId
      )
    )
  })
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
  return cached(cardCache, id, async () => {
    const response = await fetch(
      `${TCGDEX_API}/cards/${encodeURIComponent(id)}`
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Could not load card ${id}`)
    }

    const card: TCGdexCardResponse = await response.json()

    const [pocketSetIds, regionMap] = await Promise.all([
      getPocketSetIds(),
      getSetRegionMap(),
    ])

    if (pocketSetIds.has(setIdFromCardId(card.id))) {
      return null
    }

    return withJapaneseImageFallback(mapCard(card, regionMap))
  })
}

export async function getCardsByIds(ids: string[]): Promise<PokemonCard[]> {
  if (ids.length === 0) {
    return []
  }

  const uniqueIds = Array.from(new Set(ids))
  const results = await Promise.all(uniqueIds.map((id) => getCardById(id)))

  return results.filter((card): card is PokemonCard => card !== null)
}

type TCGdexSetCardsResponse = {
  id: string
  name: string
  releaseDate?: string

  cards: Array<{
    id: string
    localId: string | number
    name: string
    image?: string
    dexId?: number[]
  }>
}

export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
  return cached(setCardsCache, setId, async () => {
    const pocketSetIds = await getPocketSetIds()

    if (pocketSetIds.has(setId)) {
      return []
    }

    const response = await fetch(
      `${TCGDEX_API}/sets/${encodeURIComponent(setId)}`
    )

    if (!response.ok) {
      throw new Error(`Could not load set ${setId}`)
    }

    const set: TCGdexSetCardsResponse = await response.json()
    const regionMap = await getSetRegionMap()
    const regions = regionMap.get(set.id) ?? []

    return withJapaneseImageFallbacks(
      set.cards.map((card) => ({
        id: card.id,
        name: card.name,
        number: String(card.localId),
        dexId: card.dexId,

        set: {
          id: set.id,
          name: set.name,
          regions,
          releaseDate: set.releaseDate,
        },

        images: {
          small: imageUrl(card.image, "low"),

          large: imageUrl(card.image, "high"),
        },
      }))
    )
  })
}

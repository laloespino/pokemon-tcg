import type { PokemonCard } from "@/types/card"

const TCGDEX_API_ROOT = "https://api.tcgdex.net/v2"
const TCGDEX_JAPANESE_API = `${TCGDEX_API_ROOT}/ja`
const POKEMON_TCG_API = "https://api.pokemontcg.io/v2"
const LIMITLESS_IMAGE_ROOT =
  "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci"
const SCRYDEX_IMAGE_ROOT = "https://images.scrydex.com/pokemon"

const japaneseCardImagesCache = new Map<
  string,
  Promise<PokemonCard["images"] | null>
>()
const pokemonTcgCardImagesCache = new Map<
  string,
  Promise<PokemonCard["images"] | null>
>()

type TCGdexCardImageResponse = {
  image?: string
}

type PokemonTcgCardImageData = {
  images?: {
    small?: string
    large?: string
  }
}

type PokemonTcgCardResponse = {
  data?: PokemonTcgCardImageData
}

type PokemonTcgCardSearchResponse = {
  data?: PokemonTcgCardImageData[]
}

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

export function tcgdexImageUrl(
  image: string | undefined,
  quality: "low" | "high"
) {
  if (!image) {
    return ""
  }

  return `${image}/${quality}.webp`
}

function setIdFromCardId(cardId: string) {
  const separatorIndex = cardId.lastIndexOf("-")

  if (separatorIndex === -1) {
    return cardId
  }

  return cardId.slice(0, separatorIndex)
}

function hasCardImage(card: PokemonCard) {
  return Boolean(card.images.small || card.images.large)
}

function readPokemonTcgImages(card: PokemonTcgCardImageData | undefined) {
  const small = card?.images?.small
  const large = card?.images?.large

  if (!small && !large) {
    return null
  }

  return {
    small,
    large,
  }
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
        small: tcgdexImageUrl(image, "low"),
        large: tcgdexImageUrl(image, "high"),
      }
    } catch (error) {
      console.error(error)
      return null
    }
  })
}

function pokemonTcgCardIdCandidates(card: PokemonCard) {
  const setId = card.set?.id ?? setIdFromCardId(card.id)
  const normalizedNumber = card.number.replace(/^0+(?=\d)/, "")

  return Array.from(new Set([card.id, `${setId}-${normalizedNumber}`]))
}

function pokemonTcgSearchQuery(card: PokemonCard) {
  const setId = card.set?.id ?? setIdFromCardId(card.id)
  const escapedName = card.name.replaceAll('"', '\\"')

  return `name:"${escapedName}" set.id:${setId}`
}

async function getPokemonTcgCardImages(card: PokemonCard) {
  return cached(pokemonTcgCardImagesCache, card.id, async () => {
    try {
      for (const candidate of pokemonTcgCardIdCandidates(card)) {
        const response = await fetch(
          `${POKEMON_TCG_API}/cards/${encodeURIComponent(candidate)}?select=images`
        )

        if (response.status === 404) {
          continue
        }

        if (!response.ok) {
          throw new Error(
            `Could not load Pokémon TCG image for card ${candidate}`
          )
        }

        const result: PokemonTcgCardResponse = await response.json()
        const images = readPokemonTcgImages(result.data)

        if (images) {
          return images
        }
      }

      const searchParams = new URLSearchParams({
        q: pokemonTcgSearchQuery(card),
        select: "images",
        pageSize: "1",
      })
      const searchResponse = await fetch(
        `${POKEMON_TCG_API}/cards?${searchParams.toString()}`
      )

      if (!searchResponse.ok) {
        throw new Error(`Could not search Pokémon TCG image for ${card.id}`)
      }

      const searchResult: PokemonTcgCardSearchResponse =
        await searchResponse.json()

      return readPokemonTcgImages(searchResult.data?.[0])
    } catch (error) {
      console.error(error)
      return null
    }
  })
}

function limitlessCardNumber(number: string) {
  const trimmedNumber = number.trim()

  if (/^\d+$/.test(trimmedNumber)) {
    return trimmedNumber.padStart(3, "0")
  }

  return trimmedNumber.toUpperCase()
}

function getProviderFallbackImages(card: PokemonCard) {
  const rawSetId = card.set?.id ?? setIdFromCardId(card.id)
  const setId = rawSetId.toUpperCase()
  const cardNumber = limitlessCardNumber(card.number)
  const limitlessRoot = `${LIMITLESS_IMAGE_ROOT}/${setId}/${setId}_${cardNumber}_R_EN`
  const normalizedNumber = card.number.trim().replace(/^0+(?=\d)/, "")
  const scrydexRoot = `${SCRYDEX_IMAGE_ROOT}/${rawSetId.toLowerCase()}-${normalizedNumber}`

  return {
    small: `${limitlessRoot}_SM.png`,
    large: `${limitlessRoot}_LG.png`,
    fallbacks: {
      small: [`${scrydexRoot}/small`],
      large: [`${scrydexRoot}/large`],
    },
  }
}

export async function resolveCardImages(card: PokemonCard) {
  if (hasCardImage(card)) {
    return card
  }

  const images =
    (await getJapaneseCardImages(card.id)) ??
    (await getPokemonTcgCardImages(card)) ??
    getProviderFallbackImages(card)

  return {
    ...card,
    images,
  }
}

export async function resolveCardsImages(cards: PokemonCard[]) {
  return Promise.all(cards.map((card) => resolveCardImages(card)))
}

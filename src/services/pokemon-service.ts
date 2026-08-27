import { tcgdex } from "@/services/tcgdex"

import type { PokemonArtist } from "@/types/artist"
import type { PokemonCard } from "@/types/card"

const TCGDEX_API = "https://api.tcgdex.net/v2/en"

function imageUrl(
  image: string | undefined,
  quality: "low" | "high",
) {
  if (!image) {
    return ""
  }

  return `${image}/${quality}.webp`
}

export async function getArtists(): Promise<
  PokemonArtist[]
> {
  const response = await fetch(
    `${TCGDEX_API}/illustrators`,
  )

  if (!response.ok) {
    throw new Error(
      "Could not load illustrators",
    )
  }

  const data: unknown =
    await response.json()

  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter(
      (name): name is string =>
        typeof name === "string",
    )
    .sort((a, b) =>
      a.localeCompare(b),
    )
    .map((name) => ({
      name,
    }))
}

export async function getCardsByArtist(
  artist: string,
): Promise<PokemonCard[]> {
  const result =
    await tcgdex.illustrator.get(
      artist,
    )

  if (!result) {
    return []
  }

  return result.map((card) => ({
    id: card.id,
    name: card.name,
    number: String(card.localId),

    artist,

    images: {
      small: imageUrl(
        card.image,
        "low",
      ),

      large: imageUrl(
        card.image,
        "high",
      ),
    },
  }))
}

export async function getCardById(
  id: string,
): Promise<PokemonCard | null> {
  const card =
    await tcgdex.card.get(id)

  if (!card) {
    return null
  }

  return {
    id: card.id,
    name: card.name,
    number: String(card.localId),

    artist:
      card.illustrator ??
      undefined,

    rarity:
      card.rarity ??
      undefined,

    set: card.set
      ? {
        id: card.set.id,
        name: card.set.name,
      }
      : undefined,

    images: {
      small:
        card.getImageURL(
          "low",
          "webp",
        ) ?? "",

      large:
        card.getImageURL(
          "high",
          "webp",
        ) ?? "",
    },
  }
}

export async function getCardsByIds(
  ids: string[],
): Promise<PokemonCard[]> {
  if (ids.length === 0) {
    return []
  }

  const results =
    await Promise.all(
      ids.map((id) =>
        getCardById(id),
      ),
    )

  return results.filter(
    (card): card is PokemonCard =>
      card !== null,
  )
}

type TCGdexSet = {
  id: string
  name: string

  cards: Array<{
    id: string
    localId: string | number
    name: string
    image?: string
  }>
}

export async function getCardsBySet(
  setId: string,
): Promise<PokemonCard[]> {
  const response = await fetch(
    `${TCGDEX_API}/sets/${encodeURIComponent(
      setId,
    )}`,
  )

  if (!response.ok) {
    throw new Error(
      `Could not load set ${setId}`,
    )
  }

  const set: TCGdexSet =
    await response.json()

  return set.cards.map(
    (card) => ({
      id: card.id,
      name: card.name,
      number: String(
        card.localId,
      ),

      set: {
        id: set.id,
        name: set.name,
      },

      images: {
        small: imageUrl(
          card.image,
          "low",
        ),

        large: imageUrl(
          card.image,
          "high",
        ),
      },
    }),
  )
}

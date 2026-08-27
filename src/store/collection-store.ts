import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { PokemonCard } from "@/types/card"

type Album = {
  id: string
  name: string
  cardIds: string[]
}

type CollectionBackupData = {
  ownedCardIds: string[]
  wishlistCardIds: string[]
  favoriteArtists: string[]
  favoriteExpansionIds: string[]
  favoritePokemonIds: number[]
  cardSnapshots: Record<string, PokemonCard>
  albums: Album[]
}

export type CollectionBackup = {
  app: "pokebinder"
  version: 1
  exportedAt: string
  data: CollectionBackupData
}

type CollectionStore = {
  ownedCardIds: string[]
  wishlistCardIds: string[]
  favoriteArtists: string[]
  favoriteExpansionIds: string[]
  favoritePokemonIds: number[]
  cardSnapshots: Record<string, PokemonCard>
  albums: Album[]

  toggleOwnedCard: (cardId: string) => void
  toggleWishlistCard: (cardId: string) => void
  toggleFavoriteArtist: (artist: string) => void
  toggleFavoriteExpansion: (expansionId: string) => void
  toggleFavoritePokemon: (pokemonId: number) => void
  saveCardSnapshot: (card: PokemonCard) => void
  saveCardSnapshots: (cards: PokemonCard[]) => void
  createAlbum: (name: string) => string
  deleteAlbum: (albumId: string) => void
  renameAlbum: (albumId: string, name: string) => void
  setAlbumCards: (albumId: string, cardIds: string[]) => void
  toggleAlbumCard: (albumId: string, cardId: string) => void
  exportBackup: () => CollectionBackup
  importBackup: (backup: unknown) => void
}

const backupKeys = [
  "ownedCardIds",
  "wishlistCardIds",
  "favoriteArtists",
  "favoriteExpansionIds",
  "favoritePokemonIds",
  "cardSnapshots",
  "albums",
] as const

function createId() {
  return typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function toNumberArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is number => Number.isFinite(item))
    : []
}

function toAlbums(value: unknown): Album[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (album): album is Partial<Album> =>
        typeof album === "object" && album !== null
    )
    .map((album) => ({
      id: typeof album.id === "string" ? album.id : createId(),
      name: typeof album.name === "string" ? album.name : "Álbum importado",
      cardIds: toStringArray(album.cardIds),
    }))
}

function toCardSnapshots(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, PokemonCard>)
    : {}
}

function normalizeBackupData(value: unknown): CollectionBackupData {
  const data =
    typeof value === "object" && value !== null
      ? (value as Partial<CollectionBackupData>)
      : {}

  return {
    ownedCardIds: toStringArray(data.ownedCardIds),
    wishlistCardIds: toStringArray(data.wishlistCardIds),
    favoriteArtists: toStringArray(data.favoriteArtists),
    favoriteExpansionIds: toStringArray(data.favoriteExpansionIds),
    favoritePokemonIds: toNumberArray(data.favoritePokemonIds),
    cardSnapshots: toCardSnapshots(data.cardSnapshots),
    albums: toAlbums(data.albums),
  }
}

function normalizeBackup(value: unknown) {
  const payload =
    typeof value === "object" && value !== null
      ? (value as Partial<CollectionBackup> & Partial<CollectionBackupData>)
      : {}
  const data = "data" in payload ? payload.data : payload

  if (
    payload.app &&
    (payload.app !== "pokebinder" || payload.version !== 1)
  ) {
    throw new Error("Unsupported backup")
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !backupKeys.some((key) => key in data)
  ) {
    throw new Error("Invalid backup")
  }

  return normalizeBackupData(data)
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      ownedCardIds: [],
      wishlistCardIds: [],
      favoriteArtists: [],
      favoriteExpansionIds: [],
      favoritePokemonIds: [],
      cardSnapshots: {},
      albums: [],

      toggleOwnedCard: (cardId) =>
        set((state) => {
          const owned = state.ownedCardIds.includes(cardId)

          return {
            ownedCardIds: owned
              ? state.ownedCardIds.filter((id) => id !== cardId)
              : [...state.ownedCardIds, cardId],
            wishlistCardIds: owned
              ? state.wishlistCardIds
              : state.wishlistCardIds.filter((id) => id !== cardId),
          }
        }),

      toggleWishlistCard: (cardId) =>
        set((state) => {
          const wanted = state.wishlistCardIds.includes(cardId)

          return {
            wishlistCardIds: wanted
              ? state.wishlistCardIds.filter((id) => id !== cardId)
              : state.ownedCardIds.includes(cardId)
                ? state.wishlistCardIds
                : [...state.wishlistCardIds, cardId],
          }
        }),

      toggleFavoriteArtist: (artist) =>
        set((state) => {
          const favorite = state.favoriteArtists.includes(artist)

          return {
            favoriteArtists: favorite
              ? state.favoriteArtists.filter((name) => name !== artist)
              : [...state.favoriteArtists, artist],
          }
        }),

      toggleFavoriteExpansion: (expansionId) =>
        set((state) => {
          const favorite = state.favoriteExpansionIds.includes(expansionId)

          return {
            favoriteExpansionIds: favorite
              ? state.favoriteExpansionIds.filter((id) => id !== expansionId)
              : [...state.favoriteExpansionIds, expansionId],
          }
        }),

      toggleFavoritePokemon: (pokemonId) =>
        set((state) => {
          const favorite = state.favoritePokemonIds.includes(pokemonId)

          return {
            favoritePokemonIds: favorite
              ? state.favoritePokemonIds.filter((id) => id !== pokemonId)
              : [...state.favoritePokemonIds, pokemonId],
          }
        }),

      saveCardSnapshot: (card) =>
        set((state) => ({
          cardSnapshots: {
            ...state.cardSnapshots,
            [card.id]: card,
          },
        })),

      saveCardSnapshots: (cards) => {
        if (cards.length === 0) {
          return
        }

        set((state) => ({
          cardSnapshots: {
            ...state.cardSnapshots,
            ...Object.fromEntries(cards.map((card) => [card.id, card])),
          },
        }))
      },

      createAlbum: (name) => {
        const id = createId()

        set((state) => ({
          albums: [
            ...(Array.isArray(state.albums) ? state.albums : []),
            {
              id,
              name: name.trim(),
              cardIds: [],
            },
          ],
        }))

        return id
      },

      deleteAlbum: (albumId) =>
        set((state) => ({
          albums: (Array.isArray(state.albums) ? state.albums : []).filter(
            (album) => album.id !== albumId
          ),
        })),

      renameAlbum: (albumId, name) =>
        set((state) => ({
          albums: (Array.isArray(state.albums) ? state.albums : []).map(
            (album) =>
              album.id === albumId
                ? {
                    ...album,
                    name: name.trim() || album.name,
                  }
                : album
          ),
        })),

      setAlbumCards: (albumId, cardIds) =>
        set((state) => ({
          albums: (Array.isArray(state.albums) ? state.albums : []).map(
            (album) =>
              album.id === albumId
                ? {
                    ...album,
                    cardIds: Array.from(new Set(cardIds)),
                  }
                : album
          ),
        })),

      toggleAlbumCard: (albumId, cardId) =>
        set((state) => ({
          albums: (Array.isArray(state.albums) ? state.albums : []).map(
            (album) => {
              if (album.id !== albumId) {
                return album
              }

              const cardIds = Array.isArray(album.cardIds) ? album.cardIds : []
              const included = cardIds.includes(cardId)

              return {
                ...album,
                cardIds: included
                  ? cardIds.filter((id) => id !== cardId)
                  : [...cardIds, cardId],
              }
            }
          ),
        })),

      exportBackup: () => {
        const state = get()

        return {
          app: "pokebinder",
          version: 1,
          exportedAt: new Date().toISOString(),
          data: normalizeBackupData({
            ownedCardIds: state.ownedCardIds,
            wishlistCardIds: state.wishlistCardIds,
            favoriteArtists: state.favoriteArtists,
            favoriteExpansionIds: state.favoriteExpansionIds,
            favoritePokemonIds: state.favoritePokemonIds,
            cardSnapshots: state.cardSnapshots,
            albums: state.albums,
          }),
        }
      },

      importBackup: (backup) => {
        set(normalizeBackup(backup))
      },
    }),
    {
      name: "pokemon-collection",
      merge: (persistedState, currentState) => {
        const persisted =
          typeof persistedState === "object" && persistedState !== null
            ? (persistedState as Partial<CollectionStore>)
            : {}

        return {
          ...currentState,
          ...persisted,
          ownedCardIds: Array.isArray(persisted.ownedCardIds)
            ? persisted.ownedCardIds
            : currentState.ownedCardIds,
          wishlistCardIds: Array.isArray(persisted.wishlistCardIds)
            ? persisted.wishlistCardIds
            : currentState.wishlistCardIds,
          favoriteArtists: Array.isArray(persisted.favoriteArtists)
            ? persisted.favoriteArtists
            : currentState.favoriteArtists,
          favoriteExpansionIds: Array.isArray(persisted.favoriteExpansionIds)
            ? persisted.favoriteExpansionIds
            : currentState.favoriteExpansionIds,
          favoritePokemonIds: Array.isArray(persisted.favoritePokemonIds)
            ? persisted.favoritePokemonIds
            : currentState.favoritePokemonIds,
          cardSnapshots:
            typeof persisted.cardSnapshots === "object" &&
            persisted.cardSnapshots !== null
              ? persisted.cardSnapshots
              : currentState.cardSnapshots,
          albums: Array.isArray(persisted.albums)
            ? persisted.albums.map((album) => ({
                id: album.id,
                name: album.name,
                cardIds: Array.isArray(album.cardIds) ? album.cardIds : [],
              }))
            : currentState.albums,
        }
      },
    }
  )
)

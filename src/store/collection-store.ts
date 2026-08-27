import { create } from "zustand"
import { persist } from "zustand/middleware"

type Album = {
  id: string
  name: string
  cardIds: string[]
}

type CollectionStore = {
  ownedCardIds: string[]
  wishlistCardIds: string[]
  favoriteArtists: string[]
  favoriteExpansionIds: string[]
  favoritePokemonIds: number[]
  albums: Album[]

  toggleOwnedCard: (cardId: string) => void
  toggleWishlistCard: (cardId: string) => void
  toggleFavoriteArtist: (artist: string) => void
  toggleFavoriteExpansion: (expansionId: string) => void
  toggleFavoritePokemon: (pokemonId: number) => void
  createAlbum: (name: string) => string
  deleteAlbum: (albumId: string) => void
  renameAlbum: (albumId: string, name: string) => void
  setAlbumCards: (albumId: string, cardIds: string[]) => void
  toggleAlbumCard: (albumId: string, cardId: string) => void
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set) => ({
      ownedCardIds: [],
      wishlistCardIds: [],
      favoriteArtists: [],
      favoriteExpansionIds: [],
      favoritePokemonIds: [],
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

      createAlbum: (name) => {
        const id =
          typeof globalThis.crypto !== "undefined" &&
          "randomUUID" in globalThis.crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`

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

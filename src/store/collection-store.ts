import { create } from "zustand"
import { persist } from "zustand/middleware"

type CollectionStore = {
  ownedCardIds: string[]
  favoriteArtists: string[]

  toggleOwnedCard: (cardId: string) => void
  toggleFavoriteArtist: (artist: string) => void
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set) => ({
      ownedCardIds: [],
      favoriteArtists: [],

      toggleOwnedCard: (cardId) =>
        set((state) => {
          const owned = state.ownedCardIds.includes(cardId)

          return {
            ownedCardIds: owned
              ? state.ownedCardIds.filter((id) => id !== cardId)
              : [...state.ownedCardIds, cardId],
          }
        }),

      toggleFavoriteArtist: (artist) =>
        set((state) => {
          const favorite = state.favoriteArtists.includes(artist)

          return {
            favoriteArtists: favorite
              ? state.favoriteArtists.filter(
                (name) => name !== artist,
              )
              : [...state.favoriteArtists, artist],
          }
        }),
    }),
    {
      name: "pokemon-collection",
    },
  ),
)

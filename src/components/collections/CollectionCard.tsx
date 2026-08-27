import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCollection } from "@/types/collection"

import { CollectionProgress } from "./CollectionProgress"

type CollectionCardProps = {
  collection: PokemonCollection
  onClick: () => void
}

export function CollectionCard({
  collection,
  onClick,
}: CollectionCardProps) {
  const ownedCardIds = useCollectionStore(
    (state) => state.ownedCardIds,
  )

  const owned = ownedCardIds.filter((cardId) =>
    cardId.startsWith(`${collection.setId}-`),
  ).length

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        rounded-xl
        border
        bg-card
        p-4
        text-left
        transition-colors
        hover:bg-accent
      "
    >
      <div className="mb-4">
        <h2 className="font-semibold">
          {collection.name}
        </h2>

        {collection.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
      </div>

      <CollectionProgress
        owned={owned}
        total={collection.total}
      />
    </button>
  )
}

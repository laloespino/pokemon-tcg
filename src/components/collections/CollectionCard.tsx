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

  const owned = collection.cardIds.filter((id) =>
    ownedCardIds.includes(id),
  ).length

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        overflow-hidden
        rounded-xl
        border
        bg-card
        text-left
        transition
        hover:bg-accent
      "
    >
      {collection.image && (
        <img
          src={collection.image}
          alt={collection.name}
          className="aspect-[16/9] w-full object-cover"
        />
      )}

      <div className="space-y-3 p-4">
        <div>
          <h2 className="font-semibold">
            {collection.name}
          </h2>

          {collection.description && (
            <p className="text-sm text-muted-foreground">
              {collection.description}
            </p>
          )}
        </div>

        <CollectionProgress
          owned={owned}
          total={collection.cardIds.length}
        />
      </div>
    </button>
  )
}

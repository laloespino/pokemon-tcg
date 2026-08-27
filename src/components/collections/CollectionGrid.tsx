import type { PokemonCollection } from "@/types/collection"

import { CollectionCard } from "./CollectionCard"

type CollectionGridProps = {
  collections: PokemonCollection[]
  onSelect: (
    collection: PokemonCollection,
  ) => void
}

export function CollectionGrid({
  collections,
  onSelect,
}: CollectionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onClick={() =>
            onSelect(collection)
          }
        />
      ))}
    </div>
  )
}

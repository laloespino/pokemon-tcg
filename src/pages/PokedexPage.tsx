import { useNavigate } from "react-router-dom"

import { CollectionGrid } from "@/components/collections/CollectionGrid"

import { collections } from "@/data/collections"

export function PokedexPage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          Pokédex
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Explore your Pokémon TCG collections.
        </p>
      </div>

      <CollectionGrid
        collections={collections}
        onSelect={(collection) =>
          navigate(
            `/collections/${collection.id}`,
          )
        }
      />
    </div>
  )
}

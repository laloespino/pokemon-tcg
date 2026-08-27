import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Hash, Palette, Type, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getCardsByIds } from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"
import { PokemonCardMini } from "./PokemonCardMini"
import { PokemonCardViewer } from "./PokemonCardViewer"

import type { PokemonCard } from "@/types/card"

type SortKey = "name" | "pokedexNumber" | "artist"
type SortDirection = "asc" | "desc"
type SortOption = {
  key: SortKey
  label: string
  icon: typeof Type
}
type SortState = {
  key: SortKey
  direction: SortDirection
} | null
type ViewerState = {
  cards: PokemonCard[]
  initialCardId: string
} | null

type PokemonCardGridProps = {
  cards: PokemonCard[]
  showStatus?: boolean
  sortable?: boolean
  enabledSorts?: SortKey[]
}

export function PokemonCardGrid({
  cards,
  showStatus = true,
  sortable = true,
  enabledSorts = ["name", "pokedexNumber", "artist"],
}: PokemonCardGridProps) {
  const [viewerState, setViewerState] = useState<ViewerState>(null)
  const [sortState, setSortState] = useState<SortState>(null)
  const [hydratedCards, setHydratedCards] = useState<
    Record<string, PokemonCard>
  >({})
  const [attemptedDetailHydration, setAttemptedDetailHydration] = useState<
    Record<string, boolean>
  >({})
  const cardSnapshots = useCollectionStore((state) => state.cardSnapshots)
  const saveCardSnapshots = useCollectionStore(
    (state) => state.saveCardSnapshots
  )

  const displayCards = useMemo(
    () =>
      cards.map(
        (card) => hydratedCards[card.id] ?? cardSnapshots[card.id] ?? card
      ),
    [cardSnapshots, cards, hydratedCards]
  )

  const sortedCards = useMemo(() => {
    if (!sortState) {
      return displayCards
    }

    return [...displayCards].sort((a, b) => {
      if (sortState.key === "pokedexNumber") {
        return comparePokedexNumbers(a, b, sortState.direction)
      }

      const result =
        sortState.key === "artist"
          ? compareCardsByArtist(a, b)
          : compareCardsByName(a, b)

      return sortState.direction === "asc" ? result : -result
    })
  }, [displayCards, sortState])

  useEffect(() => {
    if (!sortState || !["pokedexNumber", "artist"].includes(sortState.key)) {
      return
    }

    let cancelled = false
    const missingCardIds = cards
      .filter((card) => {
        const knownCard =
          hydratedCards[card.id] ?? cardSnapshots[card.id] ?? card

        const hasSortData =
          sortState.key === "pokedexNumber"
            ? Boolean(getPokedexNumber(knownCard))
            : Boolean(knownCard.artist?.trim())

        return !hasSortData && !attemptedDetailHydration[card.id]
      })
      .map((card) => card.id)
      .slice(0, 60)

    if (missingCardIds.length === 0) {
      return
    }

    async function hydratePokedexNumbers() {
      try {
        const details = await getCardsByIds(missingCardIds)

        if (!cancelled) {
          saveCardSnapshots(details)
          setAttemptedDetailHydration((previous) => ({
            ...previous,
            ...Object.fromEntries(
              missingCardIds.map((cardId) => [cardId, true])
            ),
          }))
          setHydratedCards((previous) => ({
            ...previous,
            ...Object.fromEntries(details.map((card) => [card.id, card])),
          }))
        }
      } catch (error) {
        console.error("Could not load card sort details", error)
      }
    }

    hydratePokedexNumbers()

    return () => {
      cancelled = true
    }
  }, [
    attemptedDetailHydration,
    cardSnapshots,
    cards,
    hydratedCards,
    saveCardSnapshots,
    sortState,
  ])

  function selectSort(nextSortKey: SortKey) {
    setSortState((current) => {
      if (current?.key === nextSortKey) {
        return {
          key: nextSortKey,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }

      return {
        key: nextSortKey,
        direction: "asc",
      }
    })
  }

  const sortOptions = allSortOptions.filter((option) =>
    enabledSorts.includes(option.key)
  )

  return (
    <div className="space-y-3">
      {sortable && sortOptions.length > 0 && (
        <div className="flex items-center justify-end gap-1.5">
          {sortOptions.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant={sortState?.key === key ? "default" : "secondary"}
              size="icon-sm"
              aria-label={label}
              title={label}
              onClick={() => selectSort(key)}
            >
              <Icon className="size-4" />
            </Button>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={
              sortState?.direction === "asc"
                ? "Cambiar a descendente"
                : "Cambiar a ascendente"
            }
            title={
              sortState?.direction === "asc"
                ? "Cambiar a descendente"
                : "Cambiar a ascendente"
            }
            className={cn(!sortState && "opacity-50")}
            disabled={!sortState}
            onClick={() =>
              setSortState((current) =>
                current
                  ? {
                      key: current.key,
                      direction: current.direction === "asc" ? "desc" : "asc",
                    }
                  : current
              )
            }
          >
            {sortState?.direction === "asc" ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
          </Button>

          {sortState && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Quitar ordenamiento"
              title="Quitar ordenamiento"
              onClick={() => setSortState(null)}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {sortedCards.map((card) => (
          <PokemonCardMini
            key={card.id}
            card={card}
            showStatus={showStatus}
            onClick={() =>
              setViewerState({
                cards: sortedCards,
                initialCardId: card.id,
              })
            }
          />
        ))}
      </div>

      {viewerState && (
        <PokemonCardViewer
          cards={viewerState.cards}
          initialCardId={viewerState.initialCardId}
          onClose={() => setViewerState(null)}
        />
      )}
    </div>
  )
}

const allSortOptions: SortOption[] = [
  {
    key: "name",
    label: "Ordenar por nombre",
    icon: Type,
  },
  {
    key: "pokedexNumber",
    label: "Ordenar por número de Pokédex",
    icon: Hash,
  },
  {
    key: "artist",
    label: "Ordenar por artista",
    icon: Palette,
  },
]

function compareCardsByName(a: PokemonCard, b: PokemonCard) {
  return a.name.localeCompare(b.name) || compareLocalNumbers(a.number, b.number)
}

function compareCardsByArtist(a: PokemonCard, b: PokemonCard) {
  const aArtist = a.artist?.trim()
  const bArtist = b.artist?.trim()

  if (aArtist && bArtist) {
    return (
      aArtist.localeCompare(bArtist) ||
      a.name.localeCompare(b.name) ||
      compareLocalNumbers(a.number, b.number)
    )
  }

  if (aArtist) {
    return -1
  }

  if (bArtist) {
    return 1
  }

  return compareCardsByName(a, b)
}

function comparePokedexNumbers(
  a: PokemonCard,
  b: PokemonCard,
  sortDirection: SortDirection
) {
  const aDexId = getPokedexNumber(a)
  const bDexId = getPokedexNumber(b)

  if (aDexId !== undefined && bDexId !== undefined) {
    const result = aDexId - bDexId || a.name.localeCompare(b.name)

    return sortDirection === "asc" ? result : -result
  }

  if (aDexId !== undefined) {
    return -1
  }

  if (bDexId !== undefined) {
    return 1
  }

  return a.name.localeCompare(b.name) || compareLocalNumbers(a.number, b.number)
}

function getPokedexNumber(card: PokemonCard) {
  if (!card.dexId || card.dexId.length === 0) {
    return undefined
  }

  return Math.min(...card.dexId)
}

function compareLocalNumbers(a: string, b: string) {
  const aNumber = Number.parseInt(a, 10)
  const bNumber = Number.parseInt(b, 10)

  if (Number.isNaN(aNumber) || Number.isNaN(bNumber)) {
    return a.localeCompare(b)
  }

  return aNumber - bNumber || a.localeCompare(b)
}

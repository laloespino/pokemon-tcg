import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { getCardById } from "@/services/pokemon-service"

import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

type PokemonCardViewerProps = {
  cards: PokemonCard[]
  initialCardId: string
  onClose: () => void
}

export function PokemonCardViewer({
  cards,
  initialCardId,
  onClose,
}: PokemonCardViewerProps) {
  const initialIndex = Math.max(
    cards.findIndex(
      (card) => card.id === initialCardId,
    ),
    0,
  )

  const [currentIndex, setCurrentIndex] =
    useState(initialIndex)

  const [details, setDetails] = useState<
    Record<string, PokemonCard>
  >({})

  const [loadingDetails, setLoadingDetails] =
    useState(false)

  const touchStartX = useRef<number | null>(null)

  const briefCard = cards[currentIndex]

  const currentCard = briefCard
    ? details[briefCard.id] ?? briefCard
    : undefined

  useEffect(() => {
    if (!briefCard) {
      return
    }

    if (details[briefCard.id]) {
      return
    }

    let cancelled = false

    async function loadDetails() {
      try {
        setLoadingDetails(true)

        const card = await getCardById(
          briefCard.id,
        )

        if (!cancelled && card) {
          setDetails((previous) => ({
            ...previous,
            [briefCard.id]: card,
          }))
        }
      } catch (error) {
        console.error(
          "Could not load card details:",
          error,
        )
      } finally {
        if (!cancelled) {
          setLoadingDetails(false)
        }
      }
    }

    loadDetails()

    return () => {
      cancelled = true
    }
  }, [briefCard?.id])

  const owned = useCollectionStore((state) =>
    currentCard
      ? state.ownedCardIds.includes(
        currentCard.id,
      )
      : false,
  )

  const toggleOwnedCard =
    useCollectionStore(
      (state) =>
        state.toggleOwnedCard,
    )

  function previousCard() {
    setCurrentIndex((current) =>
      current === 0
        ? cards.length - 1
        : current - 1,
    )
  }

  function nextCard() {
    setCurrentIndex((current) =>
      current === cards.length - 1
        ? 0
        : current + 1,
    )
  }

  function handleTouchStart(
    event: React.TouchEvent,
  ) {
    touchStartX.current =
      event.touches[0].clientX
  }

  function handleTouchEnd(
    event: React.TouchEvent,
  ) {
    if (touchStartX.current === null) {
      return
    }

    const endX =
      event.changedTouches[0].clientX

    const difference =
      touchStartX.current - endX

    const minimumSwipe = 50

    if (difference > minimumSwipe) {
      nextCard()
    }

    if (difference < -minimumSwipe) {
      previousCard()
    }

    touchStartX.current = null
  }

  if (!currentCard) {
    return null
  }

  const image =
    currentCard.images.large ||
    currentCard.images.small

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="
          max-h-[calc(100dvh-1rem)]
          w-[calc(100%-1rem)]
          max-w-[430px]
          overflow-y-auto
          rounded-2xl
          p-4
          sm:max-w-lg
        "
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {currentCard.name}
          </DialogTitle>

          <DialogDescription>
            Pokémon card viewer
          </DialogDescription>
        </DialogHeader>

        {/* CARD IMAGE */}

        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mx-auto w-full max-w-[270px] px-4">
            {image ? (
              <img
                src={image}
                alt={currentCard.name}
                className="
                  block
                  h-auto
                  w-full
                  rounded-xl
                  object-contain
                "
                onError={(event) => {
                  console.error(
                    "Could not load image:",
                    event.currentTarget.src,
                  )
                }}
              />
            ) : (
              <div
                className="
                  flex
                  aspect-[245/337]
                  items-center
                  justify-center
                  rounded-xl
                  bg-muted
                  text-sm
                  text-muted-foreground
                "
              >
                No image available
              </div>
            )}
          </div>

          {cards.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousCard}
                aria-label="Previous card"
                className="
                  absolute
                  left-0
                  top-1/2
                  flex
                  size-10
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  bg-background/90
                  shadow
                "
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={nextCard}
                aria-label="Next card"
                className="
                  absolute
                  right-0
                  top-1/2
                  flex
                  size-10
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  bg-background/90
                  shadow
                "
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* CARD NAME */}

        <div className="mt-3 text-center">
          <h2 className="text-xl font-bold">
            {currentCard.name}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {currentCard.set
              ? `${currentCard.set.name} · #${currentCard.number}`
              : `#${currentCard.number}`}
          </p>

          {loadingDetails && (
            <p className="mt-1 text-xs text-muted-foreground">
              Loading details...
            </p>
          )}
        </div>

        {/* BADGES */}

        <div className="flex flex-wrap justify-center gap-2">
          {currentCard.rarity && (
            <Badge variant="secondary">
              {currentCard.rarity}
            </Badge>
          )}

          {currentCard.artist && (
            <Badge variant="outline">
              {currentCard.artist}
            </Badge>
          )}
        </div>

        {/* DETAILS */}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {currentCard.set && (
            <div>
              <p className="text-xs text-muted-foreground">
                Set
              </p>

              <p className="font-medium">
                {currentCard.set.name}
              </p>
            </div>
          )}

          {currentCard.artist && (
            <div>
              <p className="text-xs text-muted-foreground">
                Artist
              </p>

              <p className="font-medium">
                {currentCard.artist}
              </p>
            </div>
          )}

          {currentCard.rarity && (
            <div>
              <p className="text-xs text-muted-foreground">
                Rarity
              </p>

              <p className="font-medium">
                {currentCard.rarity}
              </p>
            </div>
          )}
        </div>

        {/* OWNED BUTTON */}

        <Button
          variant={
            owned
              ? "secondary"
              : "default"
          }
          onClick={() =>
            toggleOwnedCard(
              currentCard.id,
            )
          }
          className="h-11 w-full"
        >
          {owned ? (
            <>
              <Check className="size-4" />
              Owned
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Add to my collection
            </>
          )}
        </Button>

        {/* COUNTER */}

        <p className="text-center text-xs text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </p>
      </DialogContent>
    </Dialog>
  )
}

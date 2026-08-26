import { useEffect, useState } from "react"
import { Check, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { PokemonCard } from "@/types/card"
import { useCollectionStore } from "@/store/collection-store"

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
    cards.findIndex((card) => card.id === initialCardId),
    0,
  )

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(initialIndex + 1)

  useEffect(() => {
    if (!api) return

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap() + 1)
    }

    updateCurrent()

    api.on("select", updateCurrent)

    return () => {
      api.off("select", updateCurrent)
    }
  }, [api])

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
          w-[calc(100%-1rem)]
          max-w-[430px]
          max-h-[calc(100dvh-1rem)]
          overflow-y-auto
          rounded-2xl
          p-3

          sm:max-w-4xl
          sm:p-6
        "
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pokémon card viewer</DialogTitle>

          <DialogDescription>
            Browse cards and manage your collection.
          </DialogDescription>
        </DialogHeader>

        <Carousel
          setApi={setApi}
          opts={{
            startIndex: initialIndex,
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {cards.map((card) => (
              <CarouselItem key={card.id}>
                <PokemonCardDetails card={card} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {cards.length > 1 && (
            <>
              <CarouselPrevious
                className="
                  left-1
                  top-[34%]
                  size-9
                  sm:left-2
                  sm:top-1/2
                "
              />

              <CarouselNext
                className="
                  right-1
                  top-[34%]
                  size-9
                  sm:right-2
                  sm:top-1/2
                "
              />
            </>
          )}
        </Carousel>

        <p className="pb-1 text-center text-xs text-muted-foreground sm:text-sm">
          {current} / {cards.length}
        </p>
      </DialogContent>
    </Dialog>
  )
}

function PokemonCardDetails({
  card,
}: {
  card: PokemonCard
}) {
  const owned = useCollectionStore((state) =>
    state.ownedCardIds.includes(card.id),
  )

  const toggleOwnedCard = useCollectionStore(
    (state) => state.toggleOwnedCard,
  )

  return (
    <div
      className="
        grid
        min-w-0
        grid-cols-1
        gap-4
        px-8
        py-2

        sm:px-12

        md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]
        md:items-center
        md:gap-8
      "
    >
      <div className="mx-auto w-full max-w-[250px] sm:max-w-[300px] md:max-w-sm">
        <img
          src={card.images.large}
          alt={card.name}
          className="
            block
            h-auto
            w-full
            rounded-xl
            object-contain
          "
        />
      </div>

      <div className="min-w-0 space-y-3 sm:space-y-5">
        <div className="text-center md:text-left">
          <h2
            className="
              truncate
              text-xl
              font-bold

              sm:text-2xl
              md:text-3xl
            "
          >
            {card.name}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {card.set.name} · #{card.number}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
          {card.rarity && (
            <Badge variant="secondary">
              {card.rarity}
            </Badge>
          )}

          {card.artist && (
            <Badge variant="outline">
              {card.artist}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-1">
          <div>
            <p className="text-xs text-muted-foreground">
              Set
            </p>

            <p className="truncate font-medium">
              {card.set.name}
            </p>
          </div>

          {card.artist && (
            <div>
              <p className="text-xs text-muted-foreground">
                Artist
              </p>

              <p className="truncate font-medium">
                {card.artist}
              </p>
            </div>
          )}

          {card.rarity && (
            <div>
              <p className="text-xs text-muted-foreground">
                Rarity
              </p>

              <p className="truncate font-medium">
                {card.rarity}
              </p>
            </div>
          )}
        </div>

        <Button
          variant={owned ? "secondary" : "default"}
          onClick={() => toggleOwnedCard(card.id)}
          className="h-11 w-full"
        >
          {owned ? (
            <>
              <Check />
              Owned
            </>
          ) : (
            <>
              <Plus />
              Add to my collection
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

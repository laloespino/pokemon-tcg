import { useEffect, useRef, useState } from "react"
import type { ComponentType, TouchEvent } from "react"

import {
  BadgeCheck,
  Brush,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Gem,
  Globe2,
  Hash,
  Layers3,
  Plus,
  Star,
  X,
} from "lucide-react"

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

import { PokemonCardImage } from "./PokemonCardImage"

type PokemonCardViewerProps = {
  cards: PokemonCard[]
  initialCardId: string
  onClose: () => void
}

type AttributeItem = {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
}

const priceLabels = [
  {
    key: "low",
    label: "Bajo",
  },
  {
    key: "mid",
    label: "Medio",
  },
  {
    key: "high",
    label: "Alto",
  },
] as const

function formatCurrency(value: number | undefined, currency: string) {
  if (value === undefined) {
    return "N/D"
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(value)
}

function readableVariant(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function AttributeTile({ item }: { item: AttributeItem }) {
  const Icon = item.icon

  return (
    <div className="flex min-h-14 items-center gap-3 rounded-2xl bg-[#2a2a2a] px-4 py-2.5 text-white sm:min-h-16 sm:px-5 sm:py-3">
      <Icon className="size-5 shrink-0 text-white sm:size-6" />

      <div className="min-w-0">
        <p className="text-[11px] text-white/45 sm:text-xs">{item.label}</p>
        <p className="truncate text-sm font-bold sm:text-base">{item.value}</p>
      </div>
    </div>
  )
}

export function PokemonCardViewer({
  cards,
  initialCardId,
  onClose,
}: PokemonCardViewerProps) {
  const initialIndex = Math.max(
    cards.findIndex((card) => card.id === initialCardId),
    0
  )

  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const [details, setDetails] = useState<Record<string, PokemonCard>>({})

  const [loadingDetails, setLoadingDetails] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const dragStart = useRef<{
    x: number
    y: number
  } | null>(null)
  const [dragY, setDragY] = useState(0)

  const briefCard = cards[currentIndex]

  const currentCard = briefCard
    ? (details[briefCard.id] ?? briefCard)
    : undefined
  const saveCardSnapshot = useCollectionStore((state) => state.saveCardSnapshot)

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

        const card = await getCardById(briefCard.id)

        if (!cancelled && card) {
          saveCardSnapshot(card)
          setDetails((previous) => ({
            ...previous,
            [briefCard.id]: card,
          }))
        }
      } catch (error) {
        console.error("Could not load card details:", error)
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
  }, [briefCard, details, saveCardSnapshot])

  const owned = useCollectionStore((state) =>
    currentCard ? state.ownedCardIds.includes(currentCard.id) : false
  )
  const wanted = useCollectionStore((state) =>
    currentCard ? state.wishlistCardIds.includes(currentCard.id) : false
  )

  const toggleOwnedCard = useCollectionStore((state) => state.toggleOwnedCard)
  const toggleWishlistCard = useCollectionStore(
    (state) => state.toggleWishlistCard
  )

  function handleToggleOwnedCard() {
    if (!currentCard) {
      return
    }

    saveCardSnapshot(currentCard)
    toggleOwnedCard(currentCard.id)
  }

  function handleToggleWishlistCard() {
    if (!currentCard) {
      return
    }

    saveCardSnapshot(currentCard)
    toggleWishlistCard(currentCard.id)
  }

  function previousCard() {
    setCurrentIndex((current) =>
      current === 0 ? cards.length - 1 : current - 1
    )
  }

  function nextCard() {
    setCurrentIndex((current) =>
      current === cards.length - 1 ? 0 : current + 1
    )
  }

  function handleCardTouchStart(event: TouchEvent) {
    touchStartX.current = event.touches[0].clientX
  }

  function handleCardTouchEnd(event: TouchEvent) {
    if (touchStartX.current === null) {
      return
    }

    const endX = event.changedTouches[0].clientX
    const difference = touchStartX.current - endX
    const minimumSwipe = 50

    if (difference > minimumSwipe) {
      nextCard()
    }

    if (difference < -minimumSwipe) {
      previousCard()
    }

    touchStartX.current = null
  }

  function handleDragStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0]

    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  function handleDragMove(event: TouchEvent<HTMLDivElement>) {
    if (!dragStart.current) {
      return
    }

    const touch = event.touches[0]
    const deltaX = touch.clientX - dragStart.current.x
    const deltaY = touch.clientY - dragStart.current.y

    if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
      setDragY(0)
      return
    }

    setDragY(Math.min(deltaY, 220))
  }

  function handleDragEnd() {
    if (dragY > 110) {
      onClose()
      return
    }

    setDragY(0)
    dragStart.current = null
  }

  if (!currentCard) {
    return null
  }

  const image = currentCard.images.large || currentCard.images.small
  const pricing = currentCard.pricing

  const attributes: AttributeItem[] = []

  if (currentCard.artist) {
    attributes.push({
      label: "Ilustrador",
      value: currentCard.artist,
      icon: Brush,
    })
  }

  if (currentCard.set) {
    attributes.push({
      label: "Expansión",
      value: currentCard.set.name,
      icon: Layers3,
    })
  }

  if (currentCard.set?.regions?.length) {
    attributes.push({
      label: "Región",
      value: currentCard.set.regions
        .map((region) => `${region.flag} ${region.label}`)
        .join(", "),
      icon: Globe2,
    })
  }

  if (currentCard.rarity) {
    attributes.push({
      label: "Rareza",
      value: currentCard.rarity,
      icon: Gem,
    })
  }

  if (currentCard.dexId?.length) {
    attributes.push({
      label: "Número nacional",
      value: currentCard.dexId.join(", "),
      icon: Hash,
    })
  }

  if (currentCard.types?.length) {
    attributes.push({
      label: "Tipo de energía",
      value: currentCard.types.join(", "),
      icon: CircleDot,
    })
  }

  if (currentCard.regulationMark) {
    attributes.push({
      label: "Marca de regulación",
      value: currentCard.regulationMark,
      icon: BadgeCheck,
    })
  }

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
        showCloseButton={false}
        className="top-0 left-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-[#111715] p-0 text-white ring-0 sm:max-w-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{currentCard.name}</DialogTitle>

          <DialogDescription>Detalle de carta Pokémon</DialogDescription>
        </DialogHeader>

        <div
          className="relative mx-auto min-h-dvh w-full max-w-3xl pb-24"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{
            transform: dragY ? `translateY(${dragY}px)` : undefined,
            transition: dragY ? "none" : "transform 180ms ease-out",
          }}
        >
          <div
            className="relative isolate overflow-hidden rounded-b-[1.75rem] px-4 pt-4 pb-6 sm:rounded-b-[2rem] sm:px-10 sm:pt-5 sm:pb-8"
            onTouchStart={handleCardTouchStart}
            onTouchEnd={handleCardTouchEnd}
          >
            {image && (
              <img
                src={image}
                alt=""
                className="absolute inset-0 -z-20 h-full w-full scale-125 object-cover opacity-25 blur-3xl"
              />
            )}

            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#07131d]/95 via-[#182315]/80 to-[#111715]" />

            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white sm:size-10"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant={wanted ? "secondary" : "ghost"}
                  onClick={handleToggleWishlistCard}
                  size="icon-sm"
                  className="rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white sm:size-10"
                  aria-label={
                    wanted
                      ? "Quitar de lista de deseos"
                      : "Agregar a lista de deseos"
                  }
                >
                  <Star
                    className="size-4"
                    fill={wanted ? "currentColor" : "none"}
                  />
                </Button>

                <Button
                  variant={owned ? "secondary" : "default"}
                  onClick={handleToggleOwnedCard}
                  size="icon-sm"
                  className="rounded-full sm:size-10"
                  aria-label={
                    owned ? "Quitar de mi colección" : "Agregar a mi colección"
                  }
                >
                  {owned ? (
                    <Check className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[280px] px-4 sm:max-w-[390px]">
              <PokemonCardImage
                src={image}
                alt={currentCard.name}
                className="block h-auto w-full rounded-xl object-contain drop-shadow-2xl sm:rounded-2xl"
                placeholderClassName="bg-white/10 text-white/60"
              />
            </div>

            {cards.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousCard}
                  aria-label="Carta anterior"
                  className="absolute top-1/2 left-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur hover:bg-white/20 sm:left-0 sm:size-11"
                >
                  <ChevronLeft className="size-5 sm:size-6" />
                </button>

                <button
                  type="button"
                  onClick={nextCard}
                  aria-label="Carta siguiente"
                  className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur hover:bg-white/20 sm:right-0 sm:size-11"
                >
                  <ChevronRight className="size-5 sm:size-6" />
                </button>
              </>
            )}
          </div>

          <div className="px-4 pt-5 sm:px-10 sm:pt-7">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-normal italic sm:text-4xl">
                {currentCard.name}
              </h2>

              <p className="mt-1 text-base text-white/45 sm:mt-2 sm:text-xl">
                {currentCard.set
                  ? `${currentCard.set.name} • #${currentCard.number}`
                  : `#${currentCard.number}`}
              </p>

              {loadingDetails && (
                <p className="mt-2 text-sm text-white/45">
                  Cargando detalles...
                </p>
              )}
            </div>

            <section className="mt-6 border-t border-white/10 pt-5 sm:mt-8 sm:pt-7">
              <h3 className="mb-3 text-xl font-black italic sm:mb-4 sm:text-2xl">
                Atributos
              </h3>

              <div className="space-y-2.5 sm:space-y-3">
                {attributes.map((item) => (
                  <AttributeTile
                    key={`${item.label}-${item.value}`}
                    item={item}
                  />
                ))}
              </div>
            </section>

            <section className="mt-7 border-t border-white/10 pt-5 sm:mt-9 sm:pt-7">
              <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
                <div>
                  <h3 className="text-xl font-black italic sm:text-2xl">
                    Precios
                  </h3>
                  {pricing && (
                    <p className="mt-1 text-xs text-white/45 sm:text-sm">
                      {readableVariant(pricing.variant)} • {pricing.source}
                    </p>
                  )}
                </div>

                <CalendarClock className="size-5 text-white/45 sm:size-6" />
              </div>

              {pricing ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {priceLabels.map(({ key, label }) => (
                    <div
                      key={key}
                      className="rounded-2xl bg-[#2a2a2a] px-2 py-3 text-center sm:px-3 sm:py-4"
                    >
                      <p className="text-xs text-white/45 sm:text-sm">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-black sm:text-base">
                        {formatCurrency(pricing[key], pricing.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#2a2a2a] px-4 py-4 text-center text-xs text-white/55 sm:px-5 sm:py-5 sm:text-sm">
                  Sin precios disponibles para esta carta.
                </div>
              )}

              {pricing?.market !== undefined && (
                <div className="mt-2.5 rounded-2xl bg-[#2a2a2a] px-4 py-3 sm:mt-3 sm:px-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-white/45 sm:text-sm">
                      Mercado
                    </span>
                    <span className="text-sm font-black sm:text-base">
                      {formatCurrency(pricing.market, pricing.currency)}
                    </span>
                  </div>
                </div>
              )}
            </section>

            <p className="mt-8 text-center text-xs text-white/35">
              {currentIndex + 1} / {cards.length}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Check, Pencil, Plus, X } from "lucide-react"

import { CardSearchResults } from "@/components/cards/CardSearchResults"
import { PokemonCardGrid } from "@/components/cards/PokemonCardGrid"
import {
  Page,
  PageBackLink,
  PageHeader,
  PageState,
} from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"

import { getCardsByIds, searchCardsByMode } from "@/services/pokemon-service"
import { useCollectionStore } from "@/store/collection-store"

import type { PokemonCard } from "@/types/card"

type SearchMode = "pokemon" | "artist"

const modes: Array<{
  value: SearchMode
  label: string
}> = [
  {
    value: "pokemon",
    label: "Pokémon",
  },
  {
    value: "artist",
    label: "Artista",
  },
]

export function AlbumPage() {
  const { albumId } = useParams()
  const albums = useCollectionStore((state) => state.albums)
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const renameAlbum = useCollectionStore((state) => state.renameAlbum)
  const setAlbumCardsInStore = useCollectionStore(
    (state) => state.setAlbumCards
  )
  const album = albums.find((item) => item.id === albumId)
  const [albumCards, setAlbumCards] = useState<PokemonCard[]>([])
  const [editingName, setEditingName] = useState(false)
  const [albumName, setAlbumName] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [draftSelectedCardIds, setDraftSelectedCardIds] = useState<string[]>([])
  const [mode, setMode] = useState<SearchMode>("pokemon")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PokemonCard[]>([])
  const [loadingAlbum, setLoadingAlbum] = useState(true)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAlbumCards() {
      if (!album || album.cardIds.length === 0) {
        setAlbumCards([])
        setLoadingAlbum(false)
        return
      }

      try {
        setLoadingAlbum(true)
        const cards = await getCardsByIds(album.cardIds)

        if (!cancelled) {
          setAlbumCards(cards)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) {
          setLoadingAlbum(false)
        }
      }
    }

    loadAlbumCards()

    return () => {
      cancelled = true
    }
  }, [album])

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!searchOpen || !trimmedQuery) {
      return
    }

    const timeout = window.setTimeout(() => {
      let cancelled = false

      async function runSearch() {
        try {
          setLoadingSearch(true)
          setError(null)

          const cards = await searchCardsByMode(mode, trimmedQuery)

          if (!cancelled) {
            setResults(cards)
          }
        } catch (error) {
          console.error(error)

          if (!cancelled) {
            setError("No pudimos buscar cartas.")
          }
        } finally {
          if (!cancelled) {
            setLoadingSearch(false)
          }
        }
      }

      runSearch()

      return () => {
        cancelled = true
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [mode, query, searchOpen])

  function openSearch() {
    setDraftSelectedCardIds(album?.cardIds ?? [])
    setQuery("")
    setResults([])
    setError(null)
    setLoadingSearch(false)
    setSearchOpen(true)
  }

  function updateSearchQuery(value: string) {
    setQuery(value)

    if (!value.trim()) {
      setResults([])
      setError(null)
      setLoadingSearch(false)
    }
  }

  function cancelSearch() {
    setDraftSelectedCardIds(album?.cardIds ?? [])
    setSearchOpen(false)
  }

  function acceptSearch() {
    if (!album) {
      return
    }

    setAlbumCardsInStore(album.id, draftSelectedCardIds)
    setSearchOpen(false)
  }

  function toggleDraftCard(cardId: string) {
    setDraftSelectedCardIds((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId]
    )
  }

  function saveAlbumName() {
    if (!album) {
      return
    }

    renameAlbum(album.id, albumName)
    setEditingName(false)
  }

  function cancelAlbumNameEdit() {
    setAlbumName(album?.name ?? "")
    setEditingName(false)
  }

  function startAlbumNameEdit() {
    setAlbumName(album?.name ?? "")
    setEditingName(true)
  }

  function toggleAllResults() {
    const resultIds = results.map((card) => card.id)
    const allSelected = resultIds.every((cardId) =>
      draftSelectedCardIds.includes(cardId)
    )

    setDraftSelectedCardIds((current) => {
      if (allSelected) {
        return current.filter((cardId) => !resultIds.includes(cardId))
      }

      return Array.from(new Set([...current, ...resultIds]))
    })
  }

  if (!album) {
    return (
      <Page>
        <PageHeader title="Álbum no encontrado" />
        <Link
          to="/albums"
          className="mt-3 inline-flex text-sm text-muted-foreground"
        >
          Volver a Álbumes
        </Link>
      </Page>
    )
  }

  const ownedInAlbum = album.cardIds.filter((cardId) =>
    ownedCardIds.includes(cardId)
  ).length
  const resultIds = results.map((card) => card.id)
  const allResultsSelected =
    resultIds.length > 0 &&
    resultIds.every((cardId) => draftSelectedCardIds.includes(cardId))
  const title = editingName ? (
    <div className="flex items-center gap-2">
      <Input
        value={albumName}
        onChange={(event) => setAlbumName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            saveAlbumName()
          }

          if (event.key === "Escape") {
            cancelAlbumNameEdit()
          }
        }}
        className="h-10 text-base font-bold"
        autoFocus
      />

      <Button
        type="button"
        size="icon-sm"
        aria-label="Guardar nombre"
        onClick={saveAlbumName}
      >
        <Check className="size-4" />
      </Button>

      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label="Cancelar edición"
        onClick={cancelAlbumNameEdit}
      >
        <X className="size-4" />
      </Button>
    </div>
  ) : (
    <button
      type="button"
      onClick={startAlbumNameEdit}
      className="flex max-w-full items-center gap-2 text-left"
      aria-label="Editar nombre del álbum"
    >
      <h1 className="truncate text-2xl font-bold">{album.name}</h1>
      <Pencil className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )

  return (
    <Page>
      <PageBackLink to="/albums">Álbumes</PageBackLink>

      <PageHeader
        title={title}
        meta={`${ownedInAlbum} de ${album.cardIds.length} cartas`}
        action={
          <Button
            type="button"
            size="icon-lg"
            className="size-11 rounded-full"
            aria-label="Agregar cartas"
            onClick={openSearch}
          >
            <Plus className="size-5" />
          </Button>
        }
      />

      <Dialog
        open={searchOpen}
        onOpenChange={(open) => {
          if (!open) {
            cancelSearch()
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[#111715] p-0 text-white ring-0 sm:max-w-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Agregar cartas al álbum</DialogTitle>
            <DialogDescription className="sr-only">
              Busca por Pokémon o artista y toca una carta para agregarla.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col px-4 pt-4 pb-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                className="size-12 rounded-full bg-white/10 text-white hover:bg-white/15"
                aria-label="Cancelar selección"
                onClick={cancelSearch}
              >
                <X className="size-5" />
              </Button>

              <div className="min-w-0 text-center">
                <p className="truncate text-base font-bold">{album.name}</p>
                <p className="text-xs text-white/60">
                  {draftSelectedCardIds.length} seleccionadas
                </p>
              </div>

              <Button
                type="button"
                size="icon-lg"
                className="size-12 rounded-full bg-blue-500 text-white hover:bg-blue-500/85"
                aria-label="Aceptar selección"
                onClick={acceptSearch}
              >
                <Check className="size-5" strokeWidth={3.5} />
              </Button>
            </div>

            <SearchInput
              value={query}
              onChange={updateSearchQuery}
              placeholder="Buscar para agregar"
              className="mb-3"
            />

            <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {modes.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={mode === item.value ? "default" : "secondary"}
                  className={
                    mode === item.value
                      ? "h-9 shrink-0 rounded-full bg-white text-black hover:bg-white/90"
                      : "h-9 shrink-0 rounded-full bg-white/10 px-4 text-white hover:bg-white/15"
                  }
                  onClick={() => setMode(item.value)}
                >
                  {item.label}
                </Button>
              ))}

              {results.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 shrink-0 rounded-full bg-blue-500/20 px-4 text-blue-100 hover:bg-blue-500/30"
                  onClick={toggleAllResults}
                >
                  {allResultsSelected ? "Quitar todas" : "Seleccionar todas"}
                </Button>
              )}
            </div>

            <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-8">
              {loadingSearch && (
                <div className="py-16 text-center text-sm text-white/55">
                  Buscando...
                </div>
              )}

              {error && (
                <div className="py-16 text-center text-sm text-red-300">
                  {error}
                </div>
              )}

              {!loadingSearch &&
                !error &&
                query.trim() &&
                results.length === 0 && (
                  <div className="py-16 text-center text-sm text-white/55">
                    No encontramos cartas.
                  </div>
                )}

              {!loadingSearch && !error && results.length > 0 && (
                <CardSearchResults
                  cards={results}
                  selectedCardIds={draftSelectedCardIds}
                  onToggleCard={toggleDraftCard}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loadingAlbum && <PageState title="Cargando álbum..." size="compact" />}

      {!loadingAlbum && albumCards.length === 0 && (
        <PageState title="Este álbum todavía está vacío." size="compact" />
      )}

      {!loadingAlbum && albumCards.length > 0 && (
        <PokemonCardGrid cards={albumCards} />
      )}
    </Page>
  )
}

import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Folder, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { useCollectionStore } from "@/store/collection-store"

export function AlbumsPage() {
  const navigate = useNavigate()
  const albums = useCollectionStore((state) => state.albums)
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const createAlbum = useCollectionStore((state) => state.createAlbum)
  const deleteAlbum = useCollectionStore((state) => state.deleteAlbum)
  const [name, setName] = useState("")

  function createNewAlbum() {
    const trimmedName = name.trim()
    const albumName = trimmedName || `Álbum ${albums.length + 1}`

    const albumId = createAlbum(albumName)
    setName("")
    navigate(`/albums/${albumId}`)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    createNewAlbum()
  }

  return (
    <div>
      <div className="relative mb-8 text-center">
        <h1 className="text-2xl font-bold">Álbumes</h1>

        <Button
          type="button"
          size="icon-lg"
          onClick={createNewAlbum}
          className="absolute top-1/2 right-0 size-11 -translate-y-1/2 rounded-full"
          aria-label="Crear álbum"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky top-14 z-30 mb-6 bg-background/95 py-2 backdrop-blur"
      >
        <SearchInput
          value={name}
          onChange={setName}
          placeholder="Buscar álbum"
          sticky={false}
        />
      </form>

      {albums.length === 0 ? (
        <div className="py-16 text-center">
          <Folder className="mx-auto mb-3 size-9 text-muted-foreground" />
          <p className="font-medium">No hay álbumes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea uno para empezar a guardar cartas.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {albums.map((album) => {
            const owned = album.cardIds.filter((cardId) =>
              ownedCardIds.includes(cardId)
            ).length
            const total = album.cardIds.length
            const progress = total === 0 ? 0 : Math.round((owned / total) * 100)

            return (
              <div
                key={album.id}
                className="grid min-h-20 grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border bg-card p-2 pr-3"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/albums/${album.id}`)}
                  className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground"
                  aria-label={`Abrir ${album.name}`}
                >
                  <Folder className="size-6" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/albums/${album.id}`)}
                  className="min-w-0 py-1 text-left"
                >
                  <p className="truncate text-base font-bold">{album.name}</p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {owned} de {total} cartas
                    </span>

                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Eliminar ${album.name}`}
                  onClick={() => deleteAlbum(album.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

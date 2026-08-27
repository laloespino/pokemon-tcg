import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Download, Folder, Plus, Trash2, Upload } from "lucide-react"

import { AlbumCover } from "@/components/albums/AlbumCover"
import { Page, PageHeader, PageState } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import { useCollectionStore } from "@/store/collection-store"

export function AlbumsPage() {
  const navigate = useNavigate()
  const albums = useCollectionStore((state) => state.albums)
  const ownedCardIds = useCollectionStore((state) => state.ownedCardIds)
  const wishlistCardIds = useCollectionStore((state) => state.wishlistCardIds)
  const createAlbum = useCollectionStore((state) => state.createAlbum)
  const deleteAlbum = useCollectionStore((state) => state.deleteAlbum)
  const exportBackup = useCollectionStore((state) => state.exportBackup)
  const importBackup = useCollectionStore((state) => state.importBackup)
  const [query, setQuery] = useState("")
  const [name, setName] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const [backupError, setBackupError] = useState<string | null>(null)
  const [albumToDelete, setAlbumToDelete] = useState<
    (typeof albums)[number] | null
  >(null)
  const backupInputRef = useRef<HTMLInputElement>(null)

  function createNewAlbum() {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    const albumId = createAlbum(trimmedName)
    setName("")
    setCreateOpen(false)
    navigate(`/albums/${albumId}`)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    createNewAlbum()
  }

  function confirmDeleteAlbum() {
    if (!albumToDelete) {
      return
    }

    deleteAlbum(albumToDelete.id)
    setAlbumToDelete(null)
  }

  function downloadBackup() {
    const backup = exportBackup()
    const date = new Date().toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `pokebinder-backup-${date}.json`
    link.click()
    URL.revokeObjectURL(url)

    setBackupError(null)
    setBackupMessage("Respaldo descargado.")
  }

  async function importBackupFile(file: File) {
    const confirmed = window.confirm(
      "Importar este respaldo reemplazará tus datos actuales. ¿Quieres continuar?"
    )

    if (!confirmed) {
      if (backupInputRef.current) {
        backupInputRef.current.value = ""
      }

      return
    }

    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      importBackup(backup)
      setBackupError(null)
      setBackupMessage("Respaldo importado.")
      setBackupOpen(false)
    } catch (error) {
      console.error(error)
      setBackupMessage(null)
      setBackupError("No pudimos importar ese archivo.")
    } finally {
      if (backupInputRef.current) {
        backupInputRef.current.value = ""
      }
    }
  }

  const normalizedQuery = query.trim().toLowerCase()
  const showOwnedAlbum =
    !normalizedQuery ||
    "mi colección".includes(normalizedQuery) ||
    "coleccion".includes(normalizedQuery) ||
    "propiedad".includes(normalizedQuery)
  const showWishlistAlbum =
    !normalizedQuery || "lista de deseos".includes(normalizedQuery)
  const filteredAlbums = normalizedQuery
    ? albums.filter((album) =>
        album.name.toLowerCase().includes(normalizedQuery)
      )
    : albums
  const hasResults =
    showOwnedAlbum || showWishlistAlbum || filteredAlbums.length > 0

  return (
    <Page>
      <PageHeader
        title="Álbumes"
        align="center"
        action={
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => {
                setBackupOpen(true)
                setBackupMessage(null)
                setBackupError(null)
              }}
              aria-label="Respaldar o restaurar"
            >
              <Download className="size-4" />
            </Button>

            <Button
              type="button"
              size="icon-lg"
              onClick={() => setCreateOpen(true)}
              className="size-11 rounded-full"
              aria-label="Crear álbum"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        }
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar álbum"
      />

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)

          if (!open) {
            setName("")
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Nuevo álbum</DialogTitle>
              <DialogDescription>
                Elige un nombre para organizar tus cartas.
              </DialogDescription>
            </DialogHeader>

            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre del álbum"
              className="h-11"
              autoFocus
            />

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={!name.trim()}>
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(albumToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setAlbumToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar álbum</DialogTitle>
            <DialogDescription>
              Esta acción eliminará “{albumToDelete?.name}” de tus álbumes.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAlbumToDelete(null)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteAlbum}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={backupOpen}
        onOpenChange={(open) => {
          setBackupOpen(open)

          if (!open) {
            setBackupMessage(null)
            setBackupError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respaldo</DialogTitle>
            <DialogDescription>
              Exporta tus cartas, lista de deseos, favoritos y álbumes a un
              archivo JSON. Importar un archivo reemplaza los datos actuales.
            </DialogDescription>
          </DialogHeader>

          <input
            ref={backupInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]

              if (file) {
                void importBackupFile(file)
              }
            }}
          />

          {(backupMessage || backupError) && (
            <p
              className={
                backupError
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {backupError ?? backupMessage}
            </p>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => backupInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Importar
            </Button>

            <Button type="button" onClick={downloadBackup}>
              <Download className="size-4" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasResults ? (
        <div className="space-y-2.5">
          {showOwnedAlbum && (
            <div className="grid min-h-20 grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border bg-card p-2 pr-3">
              <button
                type="button"
                onClick={() => navigate("/albums/owned")}
                className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground"
                aria-label="Abrir mi colección"
              >
                <AlbumCover name="Mi colección" variant="owned" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/albums/owned")}
                className="min-w-0 py-1 text-left"
              >
                <p className="truncate text-base font-bold">Mi colección</p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {ownedCardIds.length} cartas
                  </span>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full rounded-full bg-emerald-500/45" />
                  </div>
                </div>
              </button>

              <div className="size-8" aria-hidden="true" />
            </div>
          )}

          {showWishlistAlbum && (
            <div className="grid min-h-20 grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border bg-card p-2 pr-3">
              <button
                type="button"
                onClick={() => navigate("/albums/wishlist")}
                className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground"
                aria-label="Abrir lista de deseos"
              >
                <AlbumCover name="Lista de deseos" variant="wishlist" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/albums/wishlist")}
                className="min-w-0 py-1 text-left"
              >
                <p className="truncate text-base font-bold">Lista de deseos</p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {wishlistCardIds.length} cartas
                  </span>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full rounded-full bg-muted-foreground/35" />
                  </div>
                </div>
              </button>

              <div className="size-8" aria-hidden="true" />
            </div>
          )}

          {filteredAlbums.length === 0 && !normalizedQuery ? (
            <PageState
              icon={<Folder className="size-9" />}
              title="No hay álbumes propios"
              description="Crea uno para organizar cartas manualmente."
              size="compact"
            />
          ) : (
            filteredAlbums.map((album) => {
              const owned = album.cardIds.filter((cardId) =>
                ownedCardIds.includes(cardId)
              ).length
              const total = album.cardIds.length
              const progress =
                total === 0 ? 0 : Math.round((owned / total) * 100)

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
                    <AlbumCover name={album.name} />
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
                          className="h-full rounded-full bg-muted-foreground/35 transition-all"
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
                    onClick={() => setAlbumToDelete(album)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <PageState
          icon={<Folder className="size-9" />}
          title="No encontramos álbumes"
          description="Prueba con otro nombre."
          size="compact"
        />
      )}
    </Page>
  )
}

import { BrowserRouter, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"

import { AlbumPage } from "@/pages/AlbumPage"
import { AlbumsPage } from "@/pages/AlbumsPage"
import { ArtistPage } from "@/pages/ArtistPage"
import { ArtistsPage } from "@/pages/ArtistsPage"
import { CollectionPage } from "@/pages/CollectionPage"
import { ExpansionsPage } from "@/pages/ExpansionsPage"
import { FavoritesPage } from "@/pages/FavoritesPage"
import { MyCollectionPage } from "@/pages/MyCollectionPage"
import { PokemonPage } from "@/pages/PokemonPage"
import { PokedexPage } from "@/pages/PokedexPage"
import { SearchPage } from "@/pages/SearchPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PokedexPage />} />

          <Route path="/pokedex/:pokemonId" element={<PokemonPage />} />

          <Route path="/expansions" element={<ExpansionsPage />} />

          <Route path="/expansions/:setId" element={<CollectionPage />} />

          <Route
            path="/collections/:collectionId"
            element={<CollectionPage />}
          />

          <Route path="/artists" element={<ArtistsPage />} />

          <Route path="/artists/:artistName" element={<ArtistPage />} />

          <Route path="/collection" element={<MyCollectionPage />} />

          <Route path="/albums" element={<AlbumsPage />} />

          <Route path="/albums/:albumId" element={<AlbumPage />} />

          <Route path="/search" element={<SearchPage />} />

          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

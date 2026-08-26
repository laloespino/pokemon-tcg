import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"

import { PokedexPage } from "@/pages/PokedexPage"
import { CollectionPage } from "@/pages/CollectionPage"

import { ArtistsPage } from "@/pages/ArtistsPage"
import { ArtistPage } from "@/pages/ArtistPage"

import { MyCollectionPage } from "@/pages/MyCollectionPage"
import { FavoritesPage } from "@/pages/FavoritesPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<PokedexPage />}
          />

          <Route
            path="/collections/:collectionId"
            element={<CollectionPage />}
          />

          <Route
            path="/artists"
            element={<ArtistsPage />}
          />

          <Route
            path="/artists/:artistId"
            element={<ArtistPage />}
          />

          <Route
            path="/collection"
            element={<MyCollectionPage />}
          />

          <Route
            path="/favorites"
            element={<FavoritesPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

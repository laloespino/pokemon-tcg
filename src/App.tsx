import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"

import { PokedexPage } from "@/pages/PokedexPage"
import { ArtistsPage } from "@/pages/ArtistsPage"
import { MyCollectionPage } from "@/pages/MyCollectionPage"
import { FavoritesPage } from "@/pages/FavoritesPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PokedexPage />} />

          <Route
            path="/artists"
            element={<ArtistsPage />}
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

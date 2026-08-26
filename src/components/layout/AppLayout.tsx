import { Outlet } from "react-router-dom"

import { Header } from "./Header"
import { MobileNavbar } from "./MobileNavbar"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="
          mx-auto
          w-full
          max-w-7xl
          px-3
          py-4
          pb-24
          sm:px-6
          sm:py-6
          md:pb-6
        "
      >
        <Outlet />
      </main>

      <MobileNavbar />
    </div>
  )
}

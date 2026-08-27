import { Outlet } from "react-router-dom"

import { Header } from "./Header"
import { MobileNavbar } from "./MobileNavbar"

export function AppLayout() {
  return (
    <div className="app-min-h bg-background">
      <Header />

      <main className="safe-x pb-mobile-nav mx-auto w-full max-w-7xl py-4 sm:py-6">
        <Outlet />
      </main>

      <MobileNavbar />
    </div>
  )
}

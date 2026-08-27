import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"

import { Navbar } from "./Navbar"

export function Header() {
  return (
    <header className="safe-top sticky top-0 z-40 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="safe-x mx-auto flex h-14 max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>

          <span>PokéBinder</span>
        </Link>

        <Navbar />
      </div>
    </header>
  )
}

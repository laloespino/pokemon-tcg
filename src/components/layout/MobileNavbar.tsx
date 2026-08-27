import { NavLink, useLocation } from "react-router-dom"
import { BookOpen, Folder, Images, Layers3, Palette } from "lucide-react"

const links = [
  {
    to: "/",
    label: "Pokédex",
    icon: BookOpen,
  },
  {
    to: "/artists",
    label: "Artista",
    icon: Palette,
  },
  {
    to: "/expansions",
    label: "Expansiones",
    icon: Layers3,
  },
  {
    to: "/albums",
    label: "Álbumes",
    icon: Folder,
  },
  {
    to: "/collection",
    label: "Colección",
    icon: Images,
  },
]

export function MobileNavbar() {
  const location = useLocation()

  return (
    <nav className="safe-x fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden">
      <div className="safe-bottom-gap grid grid-cols-5 pt-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const active =
                isActive ||
                (to === "/" && location.pathname.startsWith("/pokedex/")) ||
                (to === "/albums" &&
                  location.pathname.startsWith("/albums/")) ||
                (to === "/expansions" &&
                  (location.pathname.startsWith("/expansions/") ||
                    location.pathname.startsWith("/collections/")))

              return [
                "touch-target flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition active:scale-[0.98]",
                active ? "text-primary" : "text-muted-foreground",
              ].join(" ")
            }}
          >
            {({ isActive }) => {
              const active =
                isActive ||
                (to === "/" && location.pathname.startsWith("/pokedex/")) ||
                (to === "/albums" &&
                  location.pathname.startsWith("/albums/")) ||
                (to === "/expansions" &&
                  (location.pathname.startsWith("/expansions/") ||
                    location.pathname.startsWith("/collections/")))

              return (
                <>
                  <span
                    className={[
                      "flex size-8 items-center justify-center rounded-full transition",
                      active ? "bg-muted" : "",
                    ].join(" ")}
                  >
                    <Icon className="size-5" />
                  </span>

                  <span>{label}</span>
                </>
              )
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

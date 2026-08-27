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
    to: "/collection",
    label: "Colección",
    icon: Images,
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
]

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => {
            const active =
              isActive ||
              (to === "/" && location.pathname.startsWith("/pokedex/")) ||
              (to === "/albums" && location.pathname.startsWith("/albums/")) ||
              (to === "/expansions" &&
                (location.pathname.startsWith("/expansions/") ||
                  location.pathname.startsWith("/collections/")))

            return [
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")
          }}
        >
          <Icon className="size-4" />

          {label}
        </NavLink>
      ))}
    </nav>
  )
}

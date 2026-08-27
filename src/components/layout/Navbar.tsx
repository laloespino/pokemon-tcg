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
]

const collectionLink = {
  to: "/collection",
  label: "Mi colección",
  icon: Images,
}

export function Navbar() {
  const location = useLocation()
  const CollectionIcon = collectionLink.icon

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

      <NavLink
        to={collectionLink.to}
        className={({ isActive }) =>
          [
            "ml-3 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all",
            isActive
              ? "border-primary bg-primary text-primary-foreground shadow-primary/20"
              : "border-primary/20 bg-primary/10 text-primary hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground",
          ].join(" ")
        }
      >
        <CollectionIcon className="size-4" />

        {collectionLink.label}
      </NavLink>
    </nav>
  )
}

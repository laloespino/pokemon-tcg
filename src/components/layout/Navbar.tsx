import { NavLink } from "react-router-dom"
import {
  BookOpen,
  Heart,
  Images,
  Palette,
} from "lucide-react"

const links = [
  {
    to: "/",
    label: "Pokédex",
    icon: BookOpen,
  },
  {
    to: "/artists",
    label: "Artists",
    icon: Palette,
  },
  {
    to: "/collection",
    label: "Collection",
    icon: Images,
  },
  {
    to: "/favorites",
    label: "Favorites",
    icon: Heart,
  },
]

export function Navbar() {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")
          }
        >
          <Icon className="size-4" />

          {label}
        </NavLink>
      ))}
    </nav>
  )
}

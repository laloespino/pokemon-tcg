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

export function MobileNavbar() {
  return (
    <nav
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        border-t
        bg-background/95
        backdrop-blur
        md:hidden
      "
    >
      <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground",
              ].join(" ")
            }
          >
            <Icon className="size-5" />

            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

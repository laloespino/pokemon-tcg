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
    featured: true,
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

export function MobileNavbar() {
  const location = useLocation()

  return (
    <nav className="safe-x fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="safe-bottom grid grid-cols-5">
        {links.map(({ to, label, icon: Icon, featured }) => (
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
                "flex min-h-16 flex-col items-center justify-center gap-1 text-[11px]",
                featured ? "relative -mt-5" : "",
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
                    className={
                      featured
                        ? [
                            "flex size-14 items-center justify-center rounded-full border bg-background shadow-lg",
                            active
                              ? "border-primary/30 bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground",
                          ].join(" ")
                        : ""
                    }
                  >
                    <Icon className={featured ? "size-7" : "size-5"} />
                  </span>

                  <span className={featured ? "text-[10px]" : ""}>{label}</span>
                </>
              )
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  sticky?: boolean
  variant?: "default" | "dark"
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  sticky = true,
  variant = "default",
}: SearchInputProps) {
  const dark = variant === "dark"

  return (
    <div
      className={cn(
        "relative",
        sticky && "sticky top-14 z-30 bg-background/95 py-2 backdrop-blur",
        className
      )}
    >
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2",
          dark ? "text-white/45" : "text-muted-foreground"
        )}
      />

      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-12 rounded-full pr-12 pl-12 text-base",
          dark &&
            "border-white/5 bg-white/10 text-white placeholder:text-white/35 focus-visible:border-white/20 focus-visible:ring-white/15"
        )}
      />

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Limpiar búsqueda"
          className={cn(
            "absolute top-1/2 right-2 -translate-y-1/2 rounded-full",
            dark && "text-white/70 hover:bg-white/10 hover:text-white"
          )}
          onClick={() => onChange("")}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}

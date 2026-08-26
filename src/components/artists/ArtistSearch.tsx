import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type ArtistSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ArtistSearch({
  value,
  onChange,
}: ArtistSearchProps) {
  return (
    <div className="relative">
      <Search
        className="
          absolute
          left-3
          top-1/2
          size-4
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <Input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search artist..."
        className="h-11 pl-9"
      />
    </div>
  )
}

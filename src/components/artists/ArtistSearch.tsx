import { SearchInput } from "@/components/ui/search-input"

type ArtistSearchProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ArtistSearch({
  value,
  onChange,
  className,
}: ArtistSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Buscar artista"
      className={className}
    />
  )
}

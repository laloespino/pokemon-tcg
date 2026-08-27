import { cn } from "@/lib/utils"

import type { PokemonRegion } from "@/types/region"

type RegionBadgesProps = {
  regions?: PokemonRegion[]
  limit?: number
  className?: string
}

export function RegionBadges({
  regions = [],
  limit = 3,
  className,
}: RegionBadgesProps) {
  if (regions.length === 0) {
    return null
  }

  const visibleRegions = regions.slice(0, limit)

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visibleRegions.map((region) => (
        <span
          key={region.id}
          title={region.label}
          aria-label={region.label}
          className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] shadow-sm ring-1 ring-border"
        >
          {region.flag}
        </span>
      ))}
    </div>
  )
}

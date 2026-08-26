type CollectionProgressProps = {
  owned: number
  total: number
}

export function CollectionProgress({
  owned,
  total,
}: CollectionProgressProps) {
  const percentage =
    total === 0 ? 0 : Math.round((owned / total) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>
          {owned} / {total}
        </span>

        <span>
          {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}

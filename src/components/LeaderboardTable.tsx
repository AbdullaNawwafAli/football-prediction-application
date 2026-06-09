import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/shadcn/ui/avatar'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import { cn } from '#/lib/shadcn/utils/utils'
import type { LeaderboardEntry } from '#/types/leaderboard'
import { UserHoverCard } from './UserHoverCard'

type Props = {
  entries: LeaderboardEntry[]
  currentUserId: string
  isPending: boolean
  mode: 'feature1' | 'feature2' | 'all'
  onUserClick?: (userId: string, displayName: string) => void
}

const stageColumns = [
  { key: 'matchday1', label: 'MD1', value: (e: LeaderboardEntry) => e.matchday1 },
  { key: 'matchday2', label: 'MD2', value: (e: LeaderboardEntry) => e.matchday2 },
  { key: 'matchday3', label: 'MD3', value: (e: LeaderboardEntry) => e.matchday3 },
  { key: 'last32', label: 'L32', value: (e: LeaderboardEntry) => e.last32 },
  { key: 'last16', label: 'L16', value: (e: LeaderboardEntry) => e.last16 },
  { key: 'qf', label: 'QF', value: (e: LeaderboardEntry) => e.qf },
  { key: 'sf', label: 'SF', value: (e: LeaderboardEntry) => e.sf },
  { key: 'f3rd', label: 'F/3rd', value: (e: LeaderboardEntry) => e.final + e.third },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-yellow-500/10 font-mono text-sm font-semibold text-yellow-500">
        1
      </span>
    )
  if (rank === 2)
    return (
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-400/10 font-mono text-sm font-semibold text-slate-400">
        2
      </span>
    )
  if (rank === 3)
    return (
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-600/10 font-mono text-sm font-semibold text-amber-600">
        3
      </span>
    )
  return (
    <span className="inline-flex size-8 items-center justify-center rounded-full font-mono text-sm font-semibold text-muted-foreground">
      {rank}
    </span>
  )
}

export function LeaderboardTable({
  entries,
  currentUserId,
  isPending,
  mode,
  onUserClick,
}: Props) {
  if (isPending) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId
        const initials = entry.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        const primaryScore =
          mode === 'feature1'
            ? entry.feature1Points
            : mode === 'feature2'
              ? entry.feature2Points
              : (entry.totalPoints ?? 0)

        const inner = (
          <div className="flex items-center gap-3 px-4 py-3 w-full text-left">
            <div className="size-10 sm:size-14 shrink-0 flex items-center justify-center">
              <RankBadge rank={entry.rank} />
            </div>
            <Avatar size="lg" className="size-10! sm:size-14! shrink-0">
              <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {/* Name + chips */}
            <div className="flex-1 min-w-0">
              <UserHoverCard entry={entry}>
                <p className={cn('text-sm truncate', isCurrentUser && 'font-semibold')}>
                  {entry.displayName}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                  )}
                </p>
              </UserHoverCard>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {mode === 'feature1' && (
                  <>
                    <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-muted/60">
                      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground leading-none">Group</span>
                      <span className="text-xs font-bold tabular-nums leading-none">{entry.matchday1 + entry.matchday2 + entry.matchday3}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-muted/60">
                      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground leading-none">Knockout</span>
                      <span className="text-xs font-bold tabular-nums leading-none">{entry.last32 + entry.last16 + entry.qf + entry.sf + entry.final + entry.third}</span>
                    </div>
                  </>
                )}
                {mode === 'feature2' && stageColumns.map((col) => (
                  <div key={col.key} className="flex flex-col items-center gap-0.5 min-w-7 px-1.5 py-1 rounded bg-muted/60">
                    <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground leading-none">{col.label}</span>
                    <span className="text-xs font-bold tabular-nums leading-none">{col.value(entry)}</span>
                  </div>
                ))}
                {mode === 'all' && (
                  <>
                    <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-muted/60">
                      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground leading-none">Bracket</span>
                      <span className="text-xs font-bold tabular-nums leading-none">{entry.feature1Points}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-muted/60">
                      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground leading-none">Match</span>
                      <span className="text-xs font-bold tabular-nums leading-none">{entry.feature2Points}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Points — far right, vertically centered */}
            <p className="shrink-0 font-mono font-semibold text-sm">
              {primaryScore} pts
            </p>
          </div>
        )

        return onUserClick ? (
          <button
            key={entry.userId}
            type="button"
            onClick={() => onUserClick(entry.userId, entry.displayName)}
            className={cn('block w-full hover:bg-muted/50 transition-colors', isCurrentUser && 'bg-muted/40')}
          >
            {inner}
          </button>
        ) : (
          <div
            key={entry.userId}
            className={cn(isCurrentUser && 'bg-muted/40')}
          >
            {inner}
          </div>
        )
      })}
    </div>
  )
}
